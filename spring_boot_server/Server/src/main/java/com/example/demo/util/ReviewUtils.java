package com.example.demo.util;

import java.time.LocalDateTime;

import com.example.demo.exception.BadRequestException;
import com.example.demo.model.Review;

public final class ReviewUtils {

    private ReviewUtils() {
    }

    public static void validateCreateReview(Review review) {
        if (review.getMovieId() == null || review.getMovieId().trim().isEmpty()) {
            throw new BadRequestException("Movie ID is required");
        }

        if (review.getUserId() == null || review.getUserId().trim().isEmpty()) {
            throw new BadRequestException("User ID is required");
        }

        if (review.getUserName() == null || review.getUserName().trim().isEmpty()) {
            throw new BadRequestException("User Name is required");
        }

        validateRating(review.getRating());

        if (review.getComment() == null || review.getComment().trim().isEmpty()) {
            throw new BadRequestException("Comment is required");
        }
    }

    public static void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }
    }

    public static void applyCreateDefaults(Review review) {
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

        LocalDateTime now = LocalDateTime.now();
        review.setCreatedAt(now);
        review.setUpdatedAt(now);
    }

    public static void markUpdated(Review review) {
        review.setUpdatedAt(LocalDateTime.now());
    }

    public static void increaseLike(Review review) {
        int likes = review.getLikes() == null ? 0 : review.getLikes();
        review.setLikes(likes + 1);
        markUpdated(review);
    }

    public static void increaseDislike(Review review) {
        int dislikes = review.getDislikes() == null ? 0 : review.getDislikes();
        review.setDislikes(dislikes + 1);
        markUpdated(review);
    }
}