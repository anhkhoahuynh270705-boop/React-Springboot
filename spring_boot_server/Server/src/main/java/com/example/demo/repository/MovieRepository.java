package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.Movie;

public interface MovieRepository extends MongoRepository<Movie, String> {

    // Query movies belonging to a specific cinema — avoids full collection scan
    List<Movie> findByCinemaIdsContaining(String cinemaId);

    // Query movies by genre field directly in MongoDB
    List<Movie> findByGenreContainingIgnoreCase(String genre);

    // Query movies by status
    List<Movie> findByStatus(String status);

    // Query movies by release year
    List<Movie> findByReleaseYear(String releaseYear);

    // Query movies by year field
    List<Movie> findByYear(String year);
}

