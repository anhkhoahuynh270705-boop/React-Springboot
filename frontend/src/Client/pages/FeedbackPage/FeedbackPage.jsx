/* eslint-disable no-unused-vars */
import { useHoneypot } from '../../../services/useHoneypot';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Star, 
  CheckCircle,
  AlertCircle,
  MessageSquare,
  User,
  Mail,
  Heart
} from 'lucide-react';
import './FeedbackPage.css';

const FeedbackPage = () => {
  const { t } = useTranslation();
  const { 
    resetTimer, 
    validateSubmission 
  } = useHoneypot();
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    rating: 0,
    category: '',
    feedback: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Reset honeypot timer when component mounts
  useEffect(() => {
    resetTimer();
  }, [resetTimer]);

  const feedbackCategories = [
    { value: 'service', label: t('Customer Service') },
    { value: 'booking', label: t('Booking Experience') },
    { value: 'facility', label: t('Cinema Facility') },
    { value: 'website', label: t('Website Experience') },
    { value: 'payment', label: t('Payment Process') },
    { value: 'other', label: t('Other') }
  ];

  const handleFeedbackChange = (e) => {
    setFeedbackForm({
      ...feedbackForm,
      [e.target.name]: e.target.value
    });
  };

  const handleRatingClick = (rating) => {
    setFeedbackForm({
      ...feedbackForm,
      rating
    });
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Honeypot validation
    if (!validateSubmission()) {
      console.warn('Honeypot validation failed - possible bot detected');
      setError('Invalid submission. Please try again.');
      return;
    }
    
    // Validation
    if (!feedbackForm.name || !feedbackForm.email || !feedbackForm.rating || !feedbackForm.feedback) {
      setError(t('Please fill in all required fields and provide a rating'));
      return;
    }

    try {
      console.log('Feedback form submitted:', feedbackForm);
      setSubmitted(true);
      setFeedbackForm({
        name: '',
        email: '',
        rating: 0,
        category: '',
        feedback: ''
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(t('Failed to submit feedback. Please try again.'));
    }
  };

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        {/* Hero Section */}
        <div className="feedback-hero">
          <h1 className="feedback-title">{t('Customer Feedback')}</h1>
          <p className="feedback-subtitle">
            {t('Your opinion matters! Share your experience and help us improve our services.')}
          </p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="feedback-success">
                <CheckCircle size={24} />
            <p>{t('Thank you! Your feedback has been submitted successfully.')}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="feedback-error">
                <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        )}

        {/* Feedback Form */}
        <div className="feedback-form-section">
          <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="feedback-name">{t('Full Name')} <span className="required">*</span></label>
                <div className="input-wrapper">
                <User size={20} className="input-icon" />
                  <input
                    type="text"
                    id="feedback-name"
                    name="name"
                    value={feedbackForm.name}
                    onChange={handleFeedbackChange}
                    placeholder={t('Enter your full name')}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="feedback-email">{t('Email Address')} <span className="required">*</span></label>
                <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                  <input
                    type="email"
                    id="feedback-email"
                    name="email"
                    value={feedbackForm.email}
                    onChange={handleFeedbackChange}
                    placeholder={t('Enter your email')}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>{t('Overall Rating')} <span className="required">*</span></label>
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`rating-star ${feedbackForm.rating >= star ? 'active' : ''}`}
                    onClick={() => handleRatingClick(star)}
                  >
                    {star}
                  </button>
                ))}
                {feedbackForm.rating > 0 && (
                  <span className="rating-text">
                    {feedbackForm.rating === 1 && t('Poor')}
                    {feedbackForm.rating === 2 && t('Fair')}
                    {feedbackForm.rating === 3 && t('Good')}
                    {feedbackForm.rating === 4 && t('Very Good')}
                    {feedbackForm.rating === 5 && t('Excellent')}
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">{t('Category')}</label>
              <select
                id="category"
                name="category"
                value={feedbackForm.category}
                onChange={handleFeedbackChange}
                className="select-input"
              >
                <option value="">{t('Select a category')}</option>
                {feedbackCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="feedback">{t('Your Feedback')} <span className="required">*</span></label>
              <textarea
                id="feedback"
                name="feedback"
                value={feedbackForm.feedback}
                onChange={handleFeedbackChange}
                placeholder={t('Please share your thoughts and suggestions...')}
                rows="8"
                required
              />
            </div>

            <button type="submit" className="submit-btn">
                <Heart size={20} />
              {t('Submit Feedback')}
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="feedback-additional">
          <div className="additional-card">
                <MessageSquare size={24} />
            <h3>{t('Your Voice Matters')}</h3>
            <p>{t('Your feedback helps us improve our services and customer experience')}</p>
          </div>
          <div className="additional-card">
                <Star size={24} />
            <h3>{t('We Value Your Opinion')}</h3>
            <p>{t('Every piece of feedback is carefully reviewed and considered for future improvements')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;

