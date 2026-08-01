package com.example.demo.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Article;
import com.example.demo.model.Movie;
import com.example.demo.service.MovieService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    // Get all movies
    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies() {
        try {
            List<Movie> movies = movieService.getAllMovies();
            return ResponseEntity.ok(movies);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(MovieController.class).error("Error fetching movies: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get movie by ID
    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable String id) {
        try {
            Optional<Movie> movie = movieService.getMovieById(id);
            if (movie.isPresent()) {
                return ResponseEntity.ok(movie.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<Movie> createMovie(@RequestBody Movie movie) {
        try {
            Movie savedMovie = movieService.createMovie(movie);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMovie);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // update movie
    @PutMapping("/{id}")
    public ResponseEntity<Movie> updateMovie(@PathVariable String id, @RequestBody Movie movie) {
        try {
            Movie updatedMovie = movieService.updateMovie(id, movie);
            return ResponseEntity.ok(updatedMovie);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // delete movie
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable String id) {
        try {
            boolean deleted = movieService.deleteMovie(id);
            if (!deleted) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search movies by title
    @GetMapping("/search")
    public ResponseEntity<List<Movie>> searchMoviesByTitle(@RequestParam String q) {
        try {
            List<Movie> filteredMovies = movieService.searchMoviesByTitle(q);
            return ResponseEntity.ok(filteredMovies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get movies by genre
    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<Movie>> getMoviesByGenre(@PathVariable String genre) {
        try {
            List<Movie> filteredMovies = movieService.getMoviesByGenre(genre);
            return ResponseEntity.ok(filteredMovies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get featured movies
    @GetMapping("/featured")
    public ResponseEntity<List<Movie>> getFeaturedMovies(@RequestParam(defaultValue = "7.0") double minRating) {
        try {
            List<Movie> featuredMovies = movieService.getFeaturedMovies(minRating);
            return ResponseEntity.ok(featuredMovies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get movies by release year
    @GetMapping("/year/{year}")
    public ResponseEntity<List<Movie>> getMoviesByYear(@PathVariable String year) {
        try {
            List<Movie> filteredMovies = movieService.getMoviesByYear(year);
            return ResponseEntity.ok(filteredMovies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Add movie to cinema
    @PostMapping("/{movieId}/cinemas/{cinemaId}")
    public ResponseEntity<Movie> addMovieToCinema(@PathVariable String movieId, @PathVariable String cinemaId) {
        try {
            Optional<Movie> movieOpt = movieService.addMovieToCinema(movieId, cinemaId);
            if (movieOpt.isPresent()) {
                return ResponseEntity.ok(movieOpt.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Delete movie from cinema
    @DeleteMapping("/{movieId}/cinemas/{cinemaId}")
    public ResponseEntity<Movie> removeMovieFromCinema(@PathVariable String movieId, @PathVariable String cinemaId) {
        try {
            Optional<Movie> movieOpt = movieService.removeMovieFromCinema(movieId, cinemaId);
            if (movieOpt.isPresent()) {
                return ResponseEntity.ok(movieOpt.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get movies by cinema ID
    @GetMapping("/cinema/{cinemaId}")
    public ResponseEntity<List<Movie>> getMoviesByCinema(@PathVariable String cinemaId) {
        try {
            List<Movie> cinemaMovies = movieService.getMoviesByCinema(cinemaId);
            return ResponseEntity.ok(cinemaMovies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Get all articles for a movie
    @GetMapping("/{movieId}/articles")
    public ResponseEntity<List<Article>> getMovieArticles(@PathVariable String movieId) {
        try {
            List<Article> articles = movieService.getMovieArticles(movieId);
            if (articles == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Add article to movie
    @PostMapping("/{movieId}/articles/{articleId}")
    public ResponseEntity<Article> addArticleToMovie(@PathVariable String movieId, @PathVariable String articleId) {
        try {
            Article updatedArticle = movieService.addArticleToMovie(movieId, articleId);
            return ResponseEntity.ok(updatedArticle);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Remove article from movie
    @DeleteMapping("/{movieId}/articles/{articleId}")
    public ResponseEntity<Void> removeArticleFromMovie(@PathVariable String movieId, @PathVariable String articleId) {
        try {
            boolean removed = movieService.removeArticleFromMovie(movieId, articleId);
            if (!removed) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
