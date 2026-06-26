package com.example.demo.service;

import java.text.Normalizer;
import java.util.regex.Pattern;
import com.example.demo.model.Movie;
import com.example.demo.model.MovieIndex;
import com.example.demo.repository.MovieElasticsearchRepository;
import com.example.demo.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MovieSyncService {

    private final MovieRepository movieRepository;
    private final MovieElasticsearchRepository movieElasticsearchRepository;

    public static String removeDiacritics(String str) {
        if (str == null)
            return null;
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String result = pattern.matcher(normalized).replaceAll("");
        return result.replaceAll("[đĐ]", "d").toLowerCase();
    }

    // Convert MongoDB Movie model to Elasticsearch MovieIndex model
    public MovieIndex convertToIndex(Movie movie) {
        if (movie == null)
            return null;

        Double parsedRating = null;
        try {
            if (movie.getRating() != null && !movie.getRating().isBlank()) {
                parsedRating = Double.parseDouble(movie.getRating());
            } else if (movie.getScore() != null && !movie.getScore().isBlank()) {
                parsedRating = Double.parseDouble(movie.getScore());
            } else if (movie.getVoteAverage() != null && !movie.getVoteAverage().isBlank()) {
                parsedRating = Double.parseDouble(movie.getVoteAverage());
            }
        } catch (NumberFormatException e) {
            // Keep null if not parseable
        }

        return new MovieIndex(
                movie.getId(),
                movie.getTitle(),
                removeDiacritics(movie.getTitle()),
                movie.getEnglishTitle(),
                movie.getDescription(),
                movie.getDirector(),
                removeDiacritics(movie.getDirector()),
                movie.getActors(),
                removeDiacritics(movie.getActors()),
                movie.getGenre(),
                movie.getStatus(),
                movie.getDuration(),
                movie.getImageUrl(),
                movie.getReleaseYear(),
                movie.getMovieName(),
                movie.getName(),
                parsedRating);
    }

    // Trigger full sync on startup
    @EventListener(ApplicationReadyEvent.class)
    public void syncAllMoviesOnStartup() {
        try {
            log.info("Starting synchronization of movies from MongoDB to Elasticsearch...");

            // Delete all existing documents in Elasticsearch index first to keep in sync
            movieElasticsearchRepository.deleteAll();

            List<Movie> allMovies = movieRepository.findAll();
            if (allMovies.isEmpty()) {
                log.info("No movies found in MongoDB to sync.");
                return;
            }

            List<MovieIndex> indices = allMovies.stream()
                    .map(this::convertToIndex)
                    .collect(Collectors.toList());

            movieElasticsearchRepository.saveAll(indices);
            log.info("Successfully synchronized {} movies to Elasticsearch.", indices.size());
        } catch (Exception e) {
            log.error("Failed to sync movies from MongoDB to Elasticsearch: {}", e.getMessage(), e);
        }
    }

    // Sync save or update
    public void syncSave(Movie movie) {
        try {
            MovieIndex index = convertToIndex(movie);
            if (index != null) {
                movieElasticsearchRepository.save(index);
                log.info("Synced saved/updated movie ID: {} to Elasticsearch.", movie.getId());
            }
        } catch (Exception e) {
            log.error("Failed to sync saved movie ID {} to Elasticsearch: {}", movie.getId(), e.getMessage());
        }
    }

    // Sync delete
    public void syncDelete(String id) {
        try {
            movieElasticsearchRepository.deleteById(id);
            log.info("Synced deleted movie ID: {} in Elasticsearch.", id);
        } catch (Exception e) {
            log.error("Failed to sync deleted movie ID {} in Elasticsearch: {}", id, e.getMessage());
        }
    }
}
