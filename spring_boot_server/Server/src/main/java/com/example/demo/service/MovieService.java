package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.example.demo.model.Article;
import com.example.demo.model.Movie;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.MovieRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;

    private final MovieCinemaService movieCinemaService;

    private final ArticleRepository articleRepository;

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
        return movieRepository.save(movie);
    }

    public Movie updateMovie(String id, Movie movie) {
        if (!movieRepository.existsById(id)) {
            throw new IllegalArgumentException("Movie not found");
        }
        movie.setId(id);
        return movieRepository.save(movie);
    }

    public boolean deleteMovie(String id) {
        if (!movieRepository.existsById(id)) {
            return false;
        }
        movieRepository.deleteById(id);
        return true;
    }

    public List<Movie> searchMoviesByTitle(String q) {
        List<Movie> allMovies = movieRepository.findAll();
        String searchQuery = q.toLowerCase();
        return allMovies.stream()
            .filter(movie -> {
                return (movie.getTitle() != null && movie.getTitle().toLowerCase().contains(searchQuery)) ||
                       (movie.getGenre() != null && movie.getGenre().toLowerCase().contains(searchQuery)) ||
                       (movie.getDirector() != null && movie.getDirector().toLowerCase().contains(searchQuery)) ||
                       (movie.getActors() != null && movie.getActors().toLowerCase().contains(searchQuery)) ||
                       (movie.getName() != null && movie.getName().toLowerCase().contains(searchQuery)) ||
                       (movie.getMovieName() != null && movie.getMovieName().toLowerCase().contains(searchQuery));
            })
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
