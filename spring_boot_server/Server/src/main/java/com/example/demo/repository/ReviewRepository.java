package com.example.demo.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.Review;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByMovieIdAndIsActiveTrueOrderByCreatedAtDesc(String movieId);
    List<Review> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(String userId);
    List<Review> findByMovieIdAndRatingAndIsActiveTrue(String movieId, Integer rating);
    List<Review> findByIsActiveTrueOrderByCreatedAtDesc();
    long countByMovieIdAndIsActiveTrue(String movieId);
    long countByMovieIdAndRatingAndIsActiveTrue(String movieId, Integer rating);
    List<Review> findByMovieIdAndIsActiveTrue(String movieId);
}
