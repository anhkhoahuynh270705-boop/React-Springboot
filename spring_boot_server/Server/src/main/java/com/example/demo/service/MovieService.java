package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import com.example.demo.model.Article;
import com.example.demo.model.Movie;
import com.example.demo.model.MovieIndex;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.MovieRepository;

import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.MultiMatchQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.TextQueryType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;
    private final MovieCinemaService movieCinemaService;
    private final ArticleRepository articleRepository;
    private final MovieSyncService movieSyncService;
    private final ElasticsearchOperations elasticsearchOperations;

    @Cacheable(value = "movies", key = "'all'")
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }


    public Optional<Movie> getMovieById(String id) {
        return Optional.ofNullable(getMovieFromCacheOrDb(id));
    }

    @Cacheable(value = "movies", key = "#id", unless = "#result == null")
    public Movie getMovieFromCacheOrDb(String id) {
        return movieRepository.findById(id).orElse(null);
    }

    @CacheEvict(value = "movies", allEntries = true)
    public Movie createMovie(Movie movie) {
        if (movie.getTitle() == null || movie.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }
        Movie savedMovie = movieRepository.save(movie);
        movieSyncService.syncSave(savedMovie);
        return savedMovie;
    }

    @CacheEvict(value = "movies", allEntries = true)
    public Movie updateMovie(String id, Movie movie) {
        if (!movieRepository.existsById(id)) {
            throw new IllegalArgumentException("Movie not found");
        }
        movie.setId(id);
        Movie savedMovie = movieRepository.save(movie);
        movieSyncService.syncSave(savedMovie);
        return savedMovie;
    }

    @CacheEvict(value = "movies", allEntries = true)
    public boolean deleteMovie(String id) {
        if (!movieRepository.existsById(id)) {
            return false;
        }
        movieRepository.deleteById(id);
        movieSyncService.syncDelete(id);
        return true;
    }

    public List<Movie> searchMoviesByTitle(String q) {
        if (q == null || q.isBlank()) {
            return List.of();
        }

        String qNoSign = MovieSyncService.removeDiacritics(q);

        // Short queries
        boolean isShortQuery = q.trim().length() <= 3; // Avoid wrong results
        String fuzziness = isShortQuery ? "0" : "AUTO";
        int prefixLen = isShortQuery ? 0 : 2;

        // Multi match query
        Query multiMatchOriginal = Query.of(qb -> qb
                .multiMatch(MultiMatchQuery.of(mm -> mm
                        .query(q)
                        .fields("title^4", "englishTitle^3", "director^2", "actors")
                        .type(TextQueryType.BestFields)
                        .operator(co.elastic.clients.elasticsearch._types.query_dsl.Operator.And)
                        .fuzziness(fuzziness)
                        .prefixLength(prefixLen))));

        Query multiMatchNoSign = Query.of(qb -> qb
                .multiMatch(MultiMatchQuery.of(mm -> mm
                        .query(qNoSign)
                        .fields("titleNoSign^3", "directorNoSign^2", "actorsNoSign")
                        .type(TextQueryType.BestFields)
                        .operator(co.elastic.clients.elasticsearch._types.query_dsl.Operator.And)
                        .fuzziness(fuzziness)
                        .prefixLength(prefixLen))));

        // Bool query
        Query boolQuery = Query.of(qb -> qb
                .bool(BoolQuery.of(b -> b
                        .should(multiMatchOriginal)
                        .should(multiMatchNoSign)
                        .minimumShouldMatch("1"))));

        NativeQuery nativeQuery = NativeQuery.builder()
                .withQuery(boolQuery)
                .build();

        SearchHits<MovieIndex> hits = elasticsearchOperations.search(nativeQuery, MovieIndex.class);

        List<String> ids = hits.getSearchHits().stream()
                .map(SearchHit::getContent)
                .map(MovieIndex::getId)
                .toList();

        if (ids.isEmpty()) {
            return List.of();
        }

        // Hydrate full movie data from MongoDB
        List<Movie> mongoMovies = movieRepository.findAllById(ids);
        Map<String, Movie> movieMap = mongoMovies.stream()
                .collect(Collectors.toMap(Movie::getId, movie -> movie));

        // Preserve Elasticsearch ranking order
        return ids.stream()
                .map(movieMap::get)
                .filter(Objects::nonNull)
                .toList();
    }

    public List<Movie> getMoviesByGenre(String genre) {
        // Push filter to MongoDB — avoids full collection scan in Java
        return movieRepository.findByGenreContainingIgnoreCase(genre);
    }

    public List<Movie> getFeaturedMovies(double minRating) {
        // Rating is stored as String in MongoDB — still needs Java filtering,
        // but use cached result via @Cacheable on getAllMovies to avoid extra DB hit
        return getAllMovies().stream()
                .filter(movie -> {
                    try {
                        if (movie.getRating() != null && !movie.getRating().isBlank()) {
                            return Double.parseDouble(movie.getRating()) >= minRating;
                        }
                        if (movie.getScore() != null && !movie.getScore().isBlank()) {
                            return Double.parseDouble(movie.getScore()) >= minRating;
                        }
                        if (movie.getVoteAverage() != null && !movie.getVoteAverage().isBlank()) {
                            return Double.parseDouble(movie.getVoteAverage()) >= minRating;
                        }
                        return false;
                    } catch (NumberFormatException e) {
                        return false;
                    }
                })
                .toList();
    }

    public List<Movie> getMoviesByYear(String year) {
        // Push to MongoDB where possible, merge results in memory
        List<Movie> byReleaseYear = movieRepository.findByReleaseYear(year);
        List<Movie> byYear = movieRepository.findByYear(year);

        // Merge and deduplicate by ID
        Map<String, Movie> merged = new java.util.LinkedHashMap<>();
        byReleaseYear.forEach(m -> merged.put(m.getId(), m));
        byYear.forEach(m -> merged.putIfAbsent(m.getId(), m));
        return new ArrayList<>(merged.values());
    }

    @Caching(evict = {
            @CacheEvict(value = "movies", allEntries = true),
            @CacheEvict(value = "cinemas", allEntries = true)
    })
    public Optional<Movie> addMovieToCinema(String movieId, String cinemaId) {
        boolean success = movieCinemaService.addMovieToCinema(movieId, cinemaId);
        if (success) {
            return movieRepository.findById(movieId);
        }
        return Optional.empty();
    }

    @Caching(evict = {
            @CacheEvict(value = "movies", allEntries = true),
            @CacheEvict(value = "cinemas", allEntries = true)
    })
    public Optional<Movie> removeMovieFromCinema(String movieId, String cinemaId) {
        boolean success = movieCinemaService.removeMovieFromCinema(movieId, cinemaId);
        if (success) {
            return movieRepository.findById(movieId);
        }
        return Optional.empty();
    }

    public List<Movie> getMoviesByCinema(String cinemaId) {
        return movieCinemaService.getMoviesByCinema(cinemaId);
    }

    public List<Article> getMovieArticles(String movieId) {
        if (!movieRepository.existsById(movieId)) {
            return null;
        }
        return articleRepository.findByMovieId(movieId);
    }

    public Article addArticleToMovie(String movieId, String articleId) {
        Optional<Movie> movieOpt = movieRepository.findById(movieId);
        Optional<Article> articleOpt = articleRepository.findById(articleId);

        if (!movieOpt.isPresent() || !articleOpt.isPresent()) {
            throw new IllegalArgumentException("Movie or Article not found");
        }

        Article article = articleOpt.get();
        article.setMovieId(movieId);

        // Also add to movieIds list if it exists
        if (article.getMovieIds() == null) {
            article.setMovieIds(new ArrayList<>());
        }
        if (!article.getMovieIds().contains(movieId)) {
            article.getMovieIds().add(movieId);
        }

        return articleRepository.save(article);
    }

    public boolean removeArticleFromMovie(String movieId, String articleId) {
        Optional<Article> articleOpt = articleRepository.findById(articleId);

        if (!articleOpt.isPresent()) {
            return false;
        }

        Article article = articleOpt.get();

        // Remove movieId from article
        if (movieId.equals(article.getMovieId())) {
            article.setMovieId(null);
        }

        // Remove from movieIds list if it exists
        if (article.getMovieIds() != null) {
            article.getMovieIds().remove(movieId);
        }

        articleRepository.save(article);
        return true;
    }
}
