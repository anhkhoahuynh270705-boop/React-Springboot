package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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
import com.example.demo.repository.ReviewRepository;

@SuppressWarnings("unused")
@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        try {
            List<Review> reviews = reviewRepository.findByIsActiveTrueOrderByCreatedAtDesc();
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable String id) {
        try {
            Optional<Review> review = reviewRepository.findById(id);
            if (review.isPresent()) {
                return ResponseEntity.ok(review.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<Review>> getReviewsByMovieId(@PathVariable String movieId) {
        try {
            List<Review> reviews = reviewRepository.findByMovieIdAndIsActiveTrueOrderByCreatedAtDesc(movieId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getReviewsByUserId(@PathVariable String userId) {
        try {
            List<Review> reviews = reviewRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/movie/{movieId}/rating/{rating}")
    public ResponseEntity<List<Review>> getReviewsByMovieIdAndRating(@PathVariable String movieId, @PathVariable Integer rating) {
        try {
            List<Review> reviews = reviewRepository.findByMovieIdAndRatingAndIsActiveTrue(movieId, rating);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/movie/{movieId}/count")
    public ResponseEntity<Long> getReviewCountByMovieId(@PathVariable String movieId) {
        try {
            long count = reviewRepository.countByMovieIdAndIsActiveTrue(movieId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/movie/{movieId}/rating/{rating}/count")
    public ResponseEntity<Long> getReviewCountByMovieIdAndRating(@PathVariable String movieId, @PathVariable Integer rating) {
        try {
            long count = reviewRepository.countByMovieIdAndRatingAndIsActiveTrue(movieId, rating);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        try {
            // Basic validation
            if (review.getMovieId() == null || review.getMovieId().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (review.getUserId() == null || review.getUserId().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (review.getUserName() == null || review.getUserName().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
                return ResponseEntity.badRequest().build();
            }
            if (review.getComment() == null || review.getComment().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Set default values
            if (review.getLikes() == null) {
                review.setLikes(0);
            }
            if (review.getDislikes() == null) {
                review.setDislikes(0);
            }
            if (review.getIsActive() == null) {
                review.setIsActive(true);
            }
            if (review.getIsVerified() == null) {
                review.setIsVerified(false);
            }

            // Set timestamps
            LocalDateTime now = LocalDateTime.now();
            review.setCreatedAt(now);
            review.setUpdatedAt(now);

            Review savedReview = reviewRepository.save(review);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReview);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable String id, @RequestBody Review review) {
        try {
            if (!reviewRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            // Basic validation
            if (review.getRating() != null && (review.getRating() < 1 || review.getRating() > 5)) {
                return ResponseEntity.badRequest().build();
            }

            review.setId(id);
            review.setUpdatedAt(LocalDateTime.now());

            Review updatedReview = reviewRepository.save(review);
            return ResponseEntity.ok(updatedReview);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<Review> likeReview(@PathVariable String id) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(id);
            if (reviewOpt.isPresent()) {
                Review review = reviewOpt.get();
                review.setLikes(review.getLikes() + 1);
                review.setUpdatedAt(LocalDateTime.now());
                Review updatedReview = reviewRepository.save(review);
                return ResponseEntity.ok(updatedReview);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/dislike")
    public ResponseEntity<Review> dislikeReview(@PathVariable String id) {
        try {
            Optional<Review> reviewOpt = reviewRepository.findById(id);
            if (reviewOpt.isPresent()) {
                Review review = reviewOpt.get();
                review.setDislikes(review.getDislikes() + 1);
                review.setUpdatedAt(LocalDateTime.now());
                Review updatedReview = reviewRepository.save(review);
                return ResponseEntity.ok(updatedReview);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        try {
            if (!reviewRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            reviewRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
