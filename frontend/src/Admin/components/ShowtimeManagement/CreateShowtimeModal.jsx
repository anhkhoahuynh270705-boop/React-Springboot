import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, DollarSign } from 'lucide-react';
import { createShowtime } from '../../../services/showtimeService';
import useToast from '../../../Admin/hooks/useToast';
import ToastContainer from '../Toast/ToastContainer';
import styles from './CreateShowtimeModal.module.css';

const CreateShowtimeModal = ({ cinemas, movies, onClose, onSubmit, defaultCinemaId, defaultMovieId }) => {
  const [formData, setFormData] = useState({
    movieId: '',
    cinemaId: '',
    startTime: '',
    room: '',
    totalSeats: 100,
    availableSeats: 100,
    price: 80000,
    format: ''
  });
  const [loading, setLoading] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const { showSuccess, showError, toasts, removeToast } = useToast();

  // Initialize defaults when provided
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      cinemaId: defaultCinemaId || prev.cinemaId,
      movieId: defaultMovieId || prev.movieId
    }));
  }, [defaultCinemaId, defaultMovieId]);

  useEffect(() => {
    // Filter movies based on selected cinema
    if (formData.cinemaId) {
      const cinema = cinemas.find(c => c.id === formData.cinemaId);
      if (cinema && cinema.movieIds) {
        const cinemaMovies = movies.filter(movie => 
          cinema.movieIds.includes(movie.id)
        );
        setFilteredMovies(cinemaMovies);

        if (formData.movieId && !cinema.movieIds.includes(formData.movieId)) {
          setFormData(prev => ({ ...prev, movieId: '' }));
        }
      } else {
        setFilteredMovies([]);
        setFormData(prev => ({ ...prev, movieId: '' }));
      }
    } else {
      setFilteredMovies(movies);
    }
  }, [formData.cinemaId, cinemas, movies]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalSeats' || name === 'availableSeats' || name === 'price' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleDateTimeChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      startTime: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.movieId || !formData.cinemaId || !formData.startTime) {
      showError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.availableSeats > formData.totalSeats) {
      showError('Số ghế còn trống không thể lớn hơn tổng số ghế');
      return;
    }

    try {
      setLoading(true);
      const normalizedStart = formData.startTime && formData.startTime.length === 16
        ? `${formData.startTime}:00`
        : formData.startTime;
      const payload = {
        movieId: formData.movieId,
        cinemaId: formData.cinemaId,
        startTime: normalizedStart,
        room: formData.room,
        totalSeats: Number(formData.totalSeats) || 0,
        availableSeats: Number(formData.availableSeats) || 0,
        price: Number(formData.price) || 0
      };
      await onSubmit(payload);
    } catch (error) {
      console.error('Error creating showtime:', error);
      showError('Không thể tạo suất chiếu');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Thêm suất chiếu mới</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <MapPin size={16} />
              Rạp chiếu *
            </label>
            <select
              name="cinemaId"
              value={formData.cinemaId}
              onChange={handleInputChange}
              className={styles.input}
              required
              disabled={!!defaultCinemaId}
            >
              <option value="">Chọn rạp chiếu</option>
              {cinemas.map(cinema => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name} - {cinema.city}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Calendar size={16} />
              Phim *
            </label>
            <select
              name="movieId"
              value={formData.movieId}
              onChange={handleInputChange}
              className={styles.input}
              required
              disabled={!formData.cinemaId || !!defaultMovieId}
            >
              <option value="">
                {formData.cinemaId ? 'Chọn phim' : 'Chọn rạp chiếu trước'}
              </option>
              {filteredMovies.map(movie => (
                <option key={movie.id} value={movie.id}>
                  {movie.title || movie.name || movie.movieName}
                </option>
              ))}
            </select>
            {formData.cinemaId && filteredMovies.length === 0 && (
              <p className={styles.helpText}>
                Rạp chiếu này chưa có phim nào. Vui lòng thêm phim vào rạp trước.
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Calendar size={16} />
              Định dạng
            </label>
            <select
              name="format"
              value={formData.format}
              onChange={handleInputChange}
              className={styles.input}
            >
              <option value="">Chọn định dạng</option>
              <option value="2D">2D</option>
              <option value="3D">3D</option>
              <option value="IMAX">IMAX</option>
              <option value="4DX">4DX</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Clock size={16} />
              Thời gian chiếu *
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime || ''}
              onChange={handleDateTimeChange}
              className={styles.input}
              min={getMinDateTime()}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <MapPin size={16} />
              Phòng chiếu
            </label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Ví dụ: Phòng 1, Phòng VIP..."
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Users size={16} />
                Tổng số ghế
              </label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleInputChange}
                className={styles.input}
                min="1"
                max="500"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Users size={16} />
                Ghế còn trống
              </label>
              <input
                type="number"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleInputChange}
                className={styles.input}
                min="0"
                max={formData.totalSeats}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <DollarSign size={16} />
              Giá vé (VNĐ)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={styles.input}
              min="0"
              step="1000"
            />
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo suất chiếu'}
            </button>
          </div>
        </form>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
};

export default CreateShowtimeModal;
