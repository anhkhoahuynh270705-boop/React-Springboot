package com.example.demo.controller;

import java.util.List;

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
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Review;
import com.example.demo.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable String id) {
        return ResponseEntity.ok(reviewService.getReviewById(id));
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<Review>> getReviewsByMovieId(@PathVariable String movieId) {
        return ResponseEntity.ok(reviewService.getReviewsByMovieId(movieId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getReviewsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(reviewService.getReviewsByUserId(userId));
    }

    @GetMapping("/movie/{movieId}/rating/{rating}")
    public ResponseEntity<List<Review>> getReviewsByMovieIdAndRating(
            @PathVariable String movieId,
            @PathVariable Integer rating) {

        return ResponseEntity.ok(reviewService.getReviewsByMovieIdAndRating(movieId, rating));
    }

    @GetMapping("/movie/{movieId}/count")
    public ResponseEntity<Long> getReviewCountByMovieId(@PathVariable String movieId) {
        return ResponseEntity.ok(reviewService.getReviewCountByMovieId(movieId));
    }

    @GetMapping("/movie/{movieId}/rating/{rating}/count")
    public ResponseEntity<Long> getReviewCountByMovieIdAndRating(
            @PathVariable String movieId,
            @PathVariable Integer rating) {

        return ResponseEntity.ok(reviewService.getReviewCountByMovieIdAndRating(movieId, rating));
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        Review savedReview = reviewService.createReview(review);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(
            @PathVariable String id,
            @RequestBody Review review) {

        return ResponseEntity.ok(reviewService.updateReview(id, review));
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<Review> likeReview(@PathVariable String id) {
        return ResponseEntity.ok(reviewService.likeReview(id));
    }

    @PutMapping("/{id}/dislike")
    public ResponseEntity<Review> dislikeReview(@PathVariable String id) {
        return ResponseEntity.ok(reviewService.dislikeReview(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}