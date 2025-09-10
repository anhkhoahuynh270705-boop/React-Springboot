import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { createReview } from '../../../services/reviewService';
import styles from './ReviewForm.module.css';

const ReviewForm = ({ movieId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }
    
    if (rating === 0) {
      setError('Vui lòng chọn điểm đánh giá');
      return;
    }
    
    if (!comment.trim()) {
      setError('Vui lòng nhập bình luận');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

         try {
       const reviewData = {
         movieId: movieId,
         userId: userName.trim(),
         userName: userName.trim(),
         rating: rating,
         comment: comment.trim(),
         likes: 0,
         dislikes: 0
       };

      console.log('Submitting review:', reviewData);
      
      const newReview = await createReview(reviewData);
      console.log('Review created successfully:', newReview);
      
      setSuccess('Đánh giá của bạn đã được gửi thành công!');
      setRating(0);
      setComment('');
      setUserName('');
      
      if (onReviewAdded) {
        setTimeout(() => {
          onReviewAdded();
        }, 2000);
      }    
    } catch (error) {
      setError('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles['review-form-container']}`}> 
      <h3 className={`${styles['review-form-title']}`}>Viết đánh giá của bạn</h3>
      
      <form onSubmit={handleSubmit} className={`${styles['review-form']}`}>
        <div className={`${styles['form-group']}`}>
          <label htmlFor="userName" className={`${styles['form-label']}`}>
            Tên của bạn *
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className={`${styles['form-input']}`}
            placeholder="Nhập tên của bạn"
            maxLength={50}
          />
        </div>

        <div className={`${styles['form-group']}`}>
          <label className={`${styles['form-label']}`}> 
            Điểm đánh giá *
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
                <Star size={24} fill={star <= rating ? '#fbbf24' : 'none'} />
              </button>
            ))}
            <span className={`${styles['rating-text']}`}>
              {rating > 0 ? `${rating}/5 sao` : 'Chọn điểm đánh giá'}
            </span>
          </div>
        </div>

        <div className={`${styles['form-group']}`}>
          <label htmlFor="comment" className={`${styles['form-label']}`}>
            Bình luận *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={`${styles['form-textarea']}`}
            placeholder="Chia sẻ suy nghĩ của bạn về bộ phim này..."
            rows={4}
            maxLength={500}
          />
          <div className={`${styles['character-count']}`}>
            {comment.length}/500 ký tự
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
          disabled={isSubmitting || rating === 0 || !comment.trim() || !userName.trim()}
        >
          {isSubmitting ? (
            <>
              <div className={`${styles['loading-spinner']}`}></div>
              Đang gửi...
            </>
          ) : (
            <>
              <Send size={16} />
              Gửi đánh giá
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
