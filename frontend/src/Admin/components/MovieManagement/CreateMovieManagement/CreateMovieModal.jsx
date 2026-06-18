/* eslint-disable no-unused-vars */
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import React from 'react';
import { useState } from 'react';
import styles from './CreateMovieModal.module.css';
import { useTranslation } from 'react-i18next';
    
const CreateMovieModal = ({ onClose, onMovieCreated }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    englishTitle: '',
    description: '',
    genre: '',
    director: '',
    cast: '',
    duration: '',
    releaseDate: '',
    rating: '',
    posterUrl: '',
    trailerUrl: '',
    language: 'Vietnamese',
    ageRating: 'P',
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t('Movie name is required');
    }

    if (!formData.genre.trim()) {
      newErrors.genre = t('Genre is required');
    }

    if (!formData.director.trim()) {
      newErrors.director = t('Director is required');
    }

    if (!formData.duration || isNaN(formData.duration) || formData.duration <= 0) {
      newErrors.duration = t('Duration must be a positive number');
    }

    if (!formData.releaseDate) {
      newErrors.releaseDate = t('Release date is required');
    }

    if (formData.rating && (isNaN(formData.rating) || formData.rating < 0 || formData.rating > 10)) {
      newErrors.rating = t('Rating must be between 0 and 10');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const movieData = {
        ...formData,
        duration: parseInt(formData.duration),
        rating: formData.rating ? parseFloat(formData.rating) : null,
        cast: formData.cast ? formData.cast.split(',').map(name => name.trim()) : []
      };
      onMovieCreated(movieData);

    } catch (error) {
      console.error('Error creating movie:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          posterUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{t('Add new movie')}</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            {/* Basic Info */}
            <div className={styles.formSection}>
              <h3>{t('Basic information')}</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('Movie name')} *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.title ? styles.error : ''}`}
                  placeholder={t('Enter movie name')}
                />
                {errors.title && <span className={styles.errorMessage}>{errors.title}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('English title')}</label>
                <input
                  type="text"
                  name="englishTitle"
                  value={formData.englishTitle}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder={t('Enter movie name in English')}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('Description')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  placeholder={t('Enter movie description')}
                  rows={4}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('Genre')} *</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className={`${styles.formInput} ${errors.genre ? styles.error : ''}`}
                    placeholder={t('Example: Action, Romance')}
                  />
                  {errors.genre && <span className={styles.errorMessage}>{errors.genre}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('Director')} *</label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={handleInputChange}
                    className={`${styles.formInput} ${errors.director ? styles.error : ''}`}
                    placeholder={t('Enter director name')}
                  />
                  {errors.director && <span className={styles.errorMessage}>{errors.director}</span>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('Actor')}</label>
                <input
                  type="text"
                  name="cast"
                  value={formData.cast}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder={t('Enter actor name (separated by comma)')}
                />
              </div>
            </div>

            {/* Technical Info */}
            <div className={styles.formSection}>
              <h3>{t('Technical information')}</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('Duration (minutes)')} *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className={`${styles.formInput} ${errors.duration ? styles.error : ''}`}
                    placeholder={t('120')}
                    min="1"
                  />
                  {errors.duration && <span className={styles.errorMessage}>{errors.duration}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('Release date')} *</label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleInputChange}
                    className={`${styles.formInput} ${errors.releaseDate ? styles.error : ''}`}
                  />
                  {errors.releaseDate && <span className={styles.errorMessage}>{errors.releaseDate}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('Rating (0-10)')} *</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className={`${styles.formInput} ${errors.rating ? styles.error : ''}`}
                    placeholder="8.5"
                    min="0"
                    max="10"
                    step="0.1"
                  />
                  {errors.rating && <span className={styles.errorMessage}>{errors.rating}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('Language')}</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    <option value="Vietnamese">{t('Vietnamese')}</option>
                    <option value="English">{t('English')}</option>
                    <option value="Korean">{t('Korean')}</option>
                    <option value="Chinese">{t('Chinese')}</option>
                    <option value="Japanese">{t('Japanese')}</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('Age rating')}</label>
                  <select
                    name="ageRating"
                    value={formData.ageRating}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    <option value="P">{t('P - All ages')}</option>
                    <option value="T13">{t('T13 - Over 13')}</option>
                    <option value="T16">{t('T16 - Over 16')}</option>
                    <option value="T18">{t('T18 - Over 18')}</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('URL Poster')}</label>
                <input
                  type="url"
                  name="posterUrl"
                  value={formData.posterUrl}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="https://example.com/poster.jpg"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('URL Trailer')}</label>
                <input
                  type="url"
                  name="trailerUrl"
                  value={formData.trailerUrl}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('Adding...') : t('Add movie')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMovieModal;
