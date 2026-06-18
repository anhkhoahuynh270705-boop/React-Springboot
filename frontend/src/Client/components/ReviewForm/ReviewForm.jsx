/* eslint-disable no-unused-vars */
import { createReview } from '../../../services/reviewService';
import { Star, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCurrentUserSync, isAuthenticated } from '../../../services/userService';
import styles from './ReviewForm.module.css';
import { useTranslation } from 'react-i18next';

const ReviewForm = ({ movieId, onReviewAdded }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUserSync();
      setCurrentUser(user);
    }
  }, []);

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated() || !currentUser) {
      setError(t('Please login to submit a review'));
      return;
    }
    
    if (rating === 0) {
      setError(t('Please select a rating'));
      return;
    }
    
    if (!comment.trim()) {
      setError(t('Please enter your comment'));
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const userName = currentUser.fullName || currentUser.username;
      const reviewData = {
        movieId: movieId,
        userId: currentUser.id || currentUser.username,
        userName: userName,
        userAvatar: currentUser.avatarUrl || currentUser.avatar || null,
        rating: rating,
        comment: comment.trim(),
        likes: 0,
        dislikes: 0
      };
      
      const newReview = await createReview(reviewData);
      console.log('Review created successfully:', newReview);
      
      setSuccess(t('Your review has been submitted successfully!'));
      setRating(0);
      setComment('');
      
      if (onReviewAdded) {
        setTimeout(() => {
          onReviewAdded();
        }, 2000);
      }    
    } catch (error) {
      setError(t('An error occurred while submitting your review. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles['review-form-container']}`}>
      <h3 className={`${styles['review-form-title']}`}>{t('Write your review ')}</h3>
      
      <form onSubmit={handleSubmit} className={`${styles['review-form']}`}>
        {currentUser && (
          <div className={`${styles['form-group']}`}>
            <label className={`${styles['form-label']}`}>
              {t('Your name')}
            </label>
            <div className={`${styles['user-name-display']}`}>
              {currentUser.fullName || currentUser.username}
            </div>
          </div>
        )}

        <div className={`${styles['form-group']}`}>
          <label className={`${styles['form-label']}`}>
            {t('Rating score')} *
          </label>
          <div className={`${styles['rating-container']}`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`${styles['rating-star']} ${star <= rating ? styles['active'] : ''}`} 
                onClick={() => handleRatingClick(star)}
                disabled={isSubmitting}
              >
                <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
            <span className={`${styles['rating-text']}`}>
              {rating > 0 ? `${rating}/5 star` : t('Select review score')}
            </span>
          </div>
        </div>

        <div className={`${styles['form-group']}`}>
          <label htmlFor="comment" className={`${styles['form-label']}`}>
            {t('Comment')} *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={`${styles['form-textarea']}`}
            placeholder= {t("Share your thoughts about this movie...")}
            rows={4}
            maxLength={500}
          />
          <div className={`${styles['character-count']}`}>
            {comment.length}/{t('500 characters max')}
          </div>
        </div>

        {error && (
          <div className={`${styles['message']} ${styles['error-message']}`}>
            {error}
          </div>
        )}
        
        {success && (
          <div className={`${styles['message']} ${styles['success-message']}`}>
            {success}
          </div>
        )}

        <button
          type="submit"
          className={`${styles['submit-button']}`}
          disabled={isSubmitting || rating === 0 || !comment.trim() || !currentUser}
        >
          {isSubmitting ? (
            <>
              <div className={`${styles['loading-spinner']}`}></div>
              {t('Sending...')}
            </>
          ) : (
            <>
              
              {t('Submit a review')}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
