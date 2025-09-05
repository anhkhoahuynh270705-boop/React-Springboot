import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { createReview } from '../../services/reviewService';
import './ReviewForm.css';

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
      
      // Reset form
      setRating(0);
      setComment('');
      setUserName('');
      
      // Notify parent component to refresh reviews
      if (onReviewAdded) {
        setTimeout(() => {
          onReviewAdded();
        }, 1000); // Delay 1 second để user thấy thông báo thành công
      }
      
    } catch (error) {
      console.error('Error creating review:', error);
      setError('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3 className="review-form-title">Viết đánh giá của bạn</h3>
      
      <form onSubmit={handleSubmit} className="review-form">
        {/* User Name Input */}
        <div className="form-group">
          <label htmlFor="userName" className="form-label">
            Tên của bạn *
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="form-input"
            placeholder="Nhập tên của bạn"
            maxLength={50}
          />
        </div>

        {/* Rating Input */}
        <div className="form-group">
          <label className="form-label">
            Điểm đánh giá *
          </label>
          <div className="rating-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`rating-star ${star <= rating ? 'active' : ''}`}
                onClick={() => handleRatingClick(star)}
                disabled={isSubmitting}
              >
                <Star size={24} fill={star <= rating ? '#fbbf24' : 'none'} />
              </button>
            ))}
            <span className="rating-text">
              {rating > 0 ? `${rating}/5 sao` : 'Chọn điểm đánh giá'}
            </span>
          </div>
        </div>

        {/* Comment Input */}
        <div className="form-group">
          <label htmlFor="comment" className="form-label">
            Bình luận *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="form-textarea"
            placeholder="Chia sẻ suy nghĩ của bạn về bộ phim này..."
            rows={4}
            maxLength={500}
          />
          <div className="character-count">
            {comment.length}/500 ký tự
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="message error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="message success-message">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || rating === 0 || !comment.trim() || !userName.trim()}
        >
          {isSubmitting ? (
            <>
              <div className="loading-spinner"></div>
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
