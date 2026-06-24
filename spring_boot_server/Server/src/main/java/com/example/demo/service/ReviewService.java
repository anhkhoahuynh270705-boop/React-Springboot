package com.example.demo.service;

import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Review;
import com.example.demo.model.User;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.ReviewUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    public List<Review> getAllReviews() {
        List<Review> reviews = reviewRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        enrichReviewsWithUserAvatar(reviews);
        return reviews;
    }

    public Review getReviewById(String id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        enrichReviewsWithUserAvatar(Collections.singletonList(review));
        return review;
    }

    public List<Review> getReviewsByMovieId(String movieId) {
        List<Review> reviews = reviewRepository.findByMovieIdAndIsActiveTrueOrderByCreatedAtDesc(movieId);
        enrichReviewsWithUserAvatar(reviews);
        return reviews;
    }

    public List<Review> getReviewsByUserId(String userId) {
        List<Review> reviews = reviewRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId);
        enrichReviewsWithUserAvatar(reviews);
        return reviews;
    }

    public List<Review> getReviewsByMovieIdAndRating(String movieId, Integer rating) {
        ReviewUtils.validateRating(rating);

        List<Review> reviews = reviewRepository.findByMovieIdAndRatingAndIsActiveTrue(movieId, rating);
        enrichReviewsWithUserAvatar(reviews);
        return reviews;
    }

    public long getReviewCountByMovieId(String movieId) {
        return reviewRepository.countByMovieIdAndIsActiveTrue(movieId);
    }

    public long getReviewCountByMovieIdAndRating(String movieId, Integer rating) {
        ReviewUtils.validateRating(rating);
        return reviewRepository.countByMovieIdAndRatingAndIsActiveTrue(movieId, rating);
    }

    public Review createReview(Review review) {
        ReviewUtils.validateCreateReview(review);
        ReviewUtils.applyCreateDefaults(review);

        applyUserAvatarIfMissing(review);

        return reviewRepository.save(review);
    }

    public Review updateReview(String id, Review reviewData) {
        Review existingReview = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        if (reviewData.getRating() != null) {
            ReviewUtils.validateRating(reviewData.getRating());
            existingReview.setRating(reviewData.getRating());
        }

        if (reviewData.getComment() != null && !reviewData.getComment().trim().isEmpty()) {
            existingReview.setComment(reviewData.getComment());
        }

        if (reviewData.getIsActive() != null) {
            existingReview.setIsActive(reviewData.getIsActive());
        }

        if (reviewData.getIsVerified() != null) {
            existingReview.setIsVerified(reviewData.getIsVerified());
        }

        if (reviewData.getUserAvatar() != null && !reviewData.getUserAvatar().trim().isEmpty()) {
            existingReview.setUserAvatar(reviewData.getUserAvatar());
        }

        ReviewUtils.markUpdated(existingReview);

        return reviewRepository.save(existingReview);
    }

    public Review likeReview(String id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        ReviewUtils.increaseLike(review);

        return reviewRepository.save(review);
    }

    public Review dislikeReview(String id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        ReviewUtils.increaseDislike(review);

        return reviewRepository.save(review);
    }

    public void deleteReview(String id) {
        if (!reviewRepository.existsById(id)) {
            throw new ResourceNotFoundException("Review", "id", id);
        }

        reviewRepository.deleteById(id);
    }

    private void applyUserAvatarIfMissing(Review review) {
        if (review.getUserAvatar() != null && !review.getUserAvatar().trim().isEmpty()) {
            return;
        }

        if (review.getUserId() == null || review.getUserId().trim().isEmpty()) {
            return;
        }

        userRepository.findById(review.getUserId()).ifPresent(user -> {
            String avatar = getUserAvatar(user);

            if (avatar != null && !avatar.trim().isEmpty()) {
                review.setUserAvatar(avatar);
            }
        });
    }

    private void enrichReviewsWithUserAvatar(List<Review> reviews) {
        if (reviews == null || reviews.isEmpty()) {
            return;
        }

        // Collect all userIds that need avatar enrichment
        List<String> userIds = reviews.stream()
                .filter(r -> r.getUserAvatar() == null || r.getUserAvatar().trim().isEmpty())
                .map(Review::getUserId)
                .filter(id -> id != null && !id.trim().isEmpty())
                .distinct()
                .collect(java.util.stream.Collectors.toList());

        if (userIds.isEmpty()) {
            return;
        }

        try {
            // Batch fetch all users in a single database query
            Iterable<User> users = userRepository.findAllById(userIds);
            java.util.Map<String, String> userAvatarMap = new java.util.HashMap<>();
            for (User user : users) {
                if (user != null && user.getId() != null) {
                    String avatar = getUserAvatar(user);
                    if (avatar != null && !avatar.trim().isEmpty()) {
                        userAvatarMap.put(user.getId(), avatar);
                    }
                }
            }

            // Enrich the reviews
            for (Review review : reviews) {
                if (review.getUserAvatar() == null || review.getUserAvatar().trim().isEmpty()) {
                    String avatar = userAvatarMap.get(review.getUserId());
                    if (avatar != null && !avatar.trim().isEmpty()) {
                        review.setUserAvatar(avatar);
                    }
                }
            }
        } catch (Exception e) {
            // Fallback to one-by-one enrichment if batch fetch fails for any reason
            for (Review review : reviews) {
                applyUserAvatarIfMissing(review);
            }
        }
    }

    private String getUserAvatar(User user) {
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().trim().isEmpty()) {
            return user.getAvatarUrl();
        }

        if (user.getAvatar() != null && !user.getAvatar().trim().isEmpty()) {
            return user.getAvatar();
        }

        return null;
    }
}