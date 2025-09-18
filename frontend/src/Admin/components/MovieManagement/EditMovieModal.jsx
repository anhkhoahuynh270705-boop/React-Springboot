import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import styles from './CreateMovieModal.module.css';

const EditMovieModal = ({ movie, onClose, onMovieUpdated }) => {
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

  const movieData = useMemo(() => {
    if (!movie) return null;
    return {
      title: movie.title || '',
      englishTitle: movie.englishTitle || '',
      description: movie.description || '',
      genre: movie.genre || '',
      director: movie.director || '',
      cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : (movie.cast || ''),
      duration: movie.duration || '',
      releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
      rating: movie.rating || '',
      posterUrl: movie.posterUrl || '',
      trailerUrl: movie.trailerUrl || '',
      language: movie.language || 'Vietnamese',
      ageRating: movie.ageRating || 'P',
      status: movie.status || 'active'
    };
  }, [movie]);

  useEffect(() => {
    if (movieData) {
      setFormData(movieData);
    }
  }, [movieData]);

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
      newErrors.title = 'Tên phim là bắt buộc';
    }

    if (!formData.genre.trim()) {
      newErrors.genre = 'Thể loại là bắt buộc';
    }

    if (!formData.director.trim()) {
      newErrors.director = 'Đạo diễn là bắt buộc';
    }

    if (!formData.duration || isNaN(formData.duration) || formData.duration <= 0) {
      newErrors.duration = 'Thời lượng phải là số dương';
    }

    if (!formData.releaseDate) {
      newErrors.releaseDate = 'Ngày phát hành là bắt buộc';
    }

    if (formData.rating && (isNaN(formData.rating) || formData.rating < 0 || formData.rating > 10)) {
      newErrors.rating = 'Đánh giá phải từ 0 đến 10';
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

      onMovieUpdated(movieData);
    } catch (error) {
      console.error('Error updating movie:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Chỉnh sửa phim</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            {/* Basic Info */}
            <div className={styles.formSection}>
              <h3>Thông tin cơ bản</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tên phim *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.title ? styles.error : ''}`}
                  placeholder="Nhập tên phim"
                />
                {errors.title && <span className={styles.errorMessage}>{errors.title}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tên tiếng Anh</label>
                <input
                  type="text"
                  name="englishTitle"
                  value={formData.englishTitle}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="Nhập tên phim bằng tiếng Anh"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  placeholder="Nhập mô tả phim"
                  rows={4}
                />
              </div>
            </div>

            {/* Technical Info */}
            <div className={styles.formSection}>
              <h3>Thông tin kỹ thuật</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Thời lượng (phút) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className={`${styles.formInput} ${errors.duration ? styles.error : ''}`}
                    placeholder="120"
                    min="1"
                  />
                  {errors.duration && <span className={styles.errorMessage}>{errors.duration}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Ngày phát hành *</label>
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
                  <label className={styles.formLabel}>Đánh giá (0-10)</label>
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
                  <label className={styles.formLabel}>Ngôn ngữ</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    <option value="Vietnamese">Tiếng Việt</option>
                    <option value="English">Tiếng Anh</option>
                    <option value="Korean">Tiếng Hàn</option>
                    <option value="Chinese">Tiếng Trung</option>
                    <option value="Japanese">Tiếng Nhật</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Giới hạn độ tuổi</label>
                  <select
                    name="ageRating"
                    value={formData.ageRating}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                  >
                    <option value="P">P - Mọi lứa tuổi</option>
                    <option value="T13">T13 - Trên 13 tuổi</option>
                    <option value="T16">T16 - Trên 16 tuổi</option>
                    <option value="T18">T18 - Trên 18 tuổi</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>URL Poster</label>
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
                <label className={styles.formLabel}>URL Trailer</label>
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
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật phim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMovieModal;
