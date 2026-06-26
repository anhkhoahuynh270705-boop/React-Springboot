package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.example.demo.model.Article;
import com.example.demo.model.Movie;
import com.example.demo.model.MovieIndex;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.MovieElasticsearchRepository;
import com.example.demo.repository.MovieRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;
    private final MovieCinemaService movieCinemaService;
    private final ArticleRepository articleRepository;
    private final MovieElasticsearchRepository movieElasticsearchRepository;
    private final MovieSyncService movieSyncService;

    @Cacheable(value = "movies")
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Optional<Movie> getMovieById(String id) {
        return movieRepository.findById(id);
    }

    public Movie createMovie(Movie movie) {
        if (movie.getTitle() == null || movie.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title is required");
        }
        Movie savedMovie = movieRepository.save(movie);
        movieSyncService.syncSave(savedMovie);
        return savedMovie;
    }

    public Movie updateMovie(String id, Movie movie) {
        if (!movieRepository.existsById(id)) {
            throw new IllegalArgumentException("Movie not found");
        }
        movie.setId(id);
        Movie savedMovie = movieRepository.save(movie);
        movieSyncService.syncSave(savedMovie);
        return savedMovie;
    }

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

        // 1. Fetch matching index documents from Elasticsearch
        List<MovieIndex> elasticResults = movieElasticsearchRepository
            .findByTitleContainingIgnoreCaseOrTitleNoSignContainingIgnoreCaseOrDirectorContainingIgnoreCaseOrDirectorNoSignContainingIgnoreCaseOrActorsContainingIgnoreCaseOrActorsNoSignContainingIgnoreCase(
                q, qNoSign, q, qNoSign, q, qNoSign
            );

        if (elasticResults.isEmpty()) {
            return List.of();
        }

        // 2. Fetch the rich MongoDB documents corresponding to these IDs
        List<String> ids = elasticResults.stream().map(MovieIndex::getId).toList();
        List<Movie> mongoMovies = movieRepository.findAllById(ids);

        // 3. Map to keep fast lookup by ID
        Map<String, Movie> movieMap = mongoMovies.stream()
            .collect(Collectors.toMap(Movie::getId, movie -> movie));

        // 4. Sort and return results in the order returned by Elasticsearch
        return ids.stream()
            .map(movieMap::get)
            .filter(Objects::nonNull)
            .toList();
    }

    public List<Movie> getMoviesByGenre(String genre) {
        List<Movie> allMovies = movieRepository.findAll();
        String lowerGenre = genre.toLowerCase();
        return allMovies.stream()
            .filter(movie -> {
                if (movie.getGenres() != null) {
                    for (String g : movie.getGenres()) {
                        if (g != null && g.toLowerCase().contains(lowerGenre)) {
                            return true;
                        }
                    }
                }
                return movie.getGenre() != null &&
                       movie.getGenre().toLowerCase().contains(lowerGenre);
            })
            .toList();
    }

    public List<Movie> getFeaturedMovies(double minRating) {
        List<Movie> allMovies = movieRepository.findAll();
        return allMovies.stream()
            .filter(movie -> {
                try {
                    if (movie.getRating() != null) {
                        double rating = Double.parseDouble(movie.getRating());
                        return rating >= minRating;
                    }
                    if (movie.getScore() != null) {
                        double score = Double.parseDouble(movie.getScore());
                        return score >= minRating;
                    }
                    if (movie.getVoteAverage() != null) {
                        double voteAvg = Double.parseDouble(movie.getVoteAverage());
                        return voteAvg >= minRating;
                    }
                    return false;
                } catch (NumberFormatException e) {
                    return false;
                }
            })
            .toList();
    }

    public List<Movie> getMoviesByYear(String year) {
        List<Movie> allMovies = movieRepository.findAll();
        return allMovies.stream()
            .filter(movie -> {
                if (movie.getReleaseYear() != null && movie.getReleaseYear().equals(year)) {
                    return true;
                }
                if (movie.getYear() != null && movie.getYear().equals(year)) {
                    return true;
                }
                if (movie.getReleaseDate() != null && movie.getReleaseDate().contains(year)) {
                    return true;
                }
                return false;
            })
            .toList();
    }

    public Optional<Movie> addMovieToCinema(String movieId, String cinemaId) {
        boolean success = movieCinemaService.addMovieToCinema(movieId, cinemaId);
        if (success) {
            return movieRepository.findById(movieId);
        }
        return Optional.empty();
    }

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
            return null; // indicate not found
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
