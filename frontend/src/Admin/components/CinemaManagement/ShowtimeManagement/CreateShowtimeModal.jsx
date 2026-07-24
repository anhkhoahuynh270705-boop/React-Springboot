
import React from 'react';
import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, DollarSign } from 'lucide-react';
import useToast from '../../../hooks/useToast';
import ToastContainer from '../../Toast/ToastContainer';
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
    format: '2D'
  });
  const [loading, setLoading] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [errors, setErrors] = useState({});
  const { showError, toasts, removeToast } = useToast();

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
    // Clear inline error when user changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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

    // Validation with inline errors
    const newErrors = {};

    if (!formData.cinemaId) {
      newErrors.cinemaId = 'Vui lòng chọn rạp chiếu';
    }
    if (!formData.movieId) {
      newErrors.movieId = 'Vui lòng chọn phim';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Vui lòng chọn thời gian chiếu';
    }
    if (!formData.room) {
      newErrors.room = 'Vui lòng chọn phòng chiếu';
    }
    if (!formData.format) {
      newErrors.format = 'Vui lòng chọn định dạng';
    }
    if (!formData.totalSeats || formData.totalSeats < 1) {
      newErrors.totalSeats = 'Tổng số ghế phải ít nhất là 1';
    }
    if (formData.availableSeats > formData.totalSeats) {
      newErrors.availableSeats = 'Số ghế còn trống không thể lớn hơn tổng số ghế';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Giá vé phải lớn hơn 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showError('Vui lòng kiểm tra lại thông tin');
      return;
    }

    // Validate start time is in the future
    const startTime = new Date(formData.startTime);
    const now = new Date();
    if (startTime <= now) {
      setErrors(prev => ({ ...prev, startTime: 'Thời gian chiếu phải trong tương lai' }));
      showError('Thời gian chiếu phải trong tương lai');
      return;
    }

    setErrors({});

    try {
      setLoading(true);
      const normalizedStart = formData.startTime && formData.startTime.length === 16
        ? `${formData.startTime}:00`
        : formData.startTime;
      const selectedMovie = movies.find(movie => movie.id === formData.movieId);
      const selectedCinema = cinemas.find(cinema => cinema.id === formData.cinemaId);

      const payload = {
        movieId: formData.movieId,
        movieName: selectedMovie?.title || selectedMovie?.name || selectedMovie?.movieName || 'Unknown Movie',
        cinemaId: formData.cinemaId,
        cinemaName: selectedCinema?.name || 'Unknown Cinema',
        startTime: normalizedStart,
        room: formData.room || `Phòng ${Math.floor(Math.random() * 10) + 1}`,
        totalSeats: Number(formData.totalSeats) || 100,
        availableSeats: Number(formData.availableSeats) || 100,
        price: Number(formData.price) || 80000,
        format: formData.format || '2D - Phụ đề Việt'
      };

      console.log('Creating showtime with payload:', payload);
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
          <button onClick={onClose} className={styles.closeButton}><X size={20} /></button>
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
              className={`${styles.input}${errors.cinemaId ? ` ${styles.inputError}` : ''}`}
              disabled={!!defaultCinemaId}
            >
              <option value="">Chọn rạp chiếu</option>
              {cinemas.map(cinema => (
                <option key={cinema.id} value={cinema.id}>
                  {cinema.name} - {cinema.city}
                </option>
              ))}
            </select>
            {errors.cinemaId && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.cinemaId}</span>}
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
              className={`${styles.input}${errors.movieId ? ` ${styles.inputError}` : ''}`}
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
            {errors.movieId && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.movieId}</span>}
            {formData.cinemaId && filteredMovies.length === 0 && (
              <p className={styles.helpText}>
                Rạp chiếu này chưa có phim nào. Vui lòng thêm phim vào rạp trước.
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Clock size={16} />
              Định dạng *
            </label>
            <select
              name="format"
              value={formData.format}
              onChange={handleInputChange}
              className={styles.input}
            >
              <option value="2D - Phụ đề Việt">2D - Phụ đề Việt</option>
              <option value="3D - Phụ đề Việt">3D - Phụ đề Việt</option>
              <option value="IMAX - Phụ đề Việt">IMAX - Phụ đề Việt</option>
              <option value="4DX - Phụ đề Việt">4DX - Phụ đề Việt</option>
              <option value="2D - Lồng tiếng Việt">2D - Lồng tiếng Việt</option>
              <option value="3D - Lồng tiếng Việt">3D - Lồng tiếng Việt</option>
              <option value="IMAX - Lồng tiếng Anh">IMAX - Lồng tiếng Anh</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Users size={16} />
              Thời gian chiếu *
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime || ''}
              onChange={handleDateTimeChange}
              className={`${styles.input}${errors.startTime ? ` ${styles.inputError}` : ''}`}
              min={getMinDateTime()}
            />
            {errors.startTime && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.startTime}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <DollarSign size={16} />
              Phòng chiếu
            </label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              className={`${styles.input}${errors.room ? ` ${styles.inputError}` : ''}`}
              placeholder="Ví dụ: Phòng 1, Phòng VIP..."
            />
            {errors.room && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.room}</span>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>

                Tổng số ghế
              </label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleInputChange}
                className={`${styles.input}${errors.totalSeats ? ` ${styles.inputError}` : ''}`}
                min="1"
                max="500"
              />
              {errors.totalSeats && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.totalSeats}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>

                Ghế còn trống
              </label>
              <input
                type="number"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleInputChange}
                className={`${styles.input}${errors.availableSeats ? ` ${styles.inputError}` : ''}`}
                min="0"
                max={formData.totalSeats}
              />
              {errors.availableSeats && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.availableSeats}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>

              Giá vé (VNĐ)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={`${styles.input}${errors.price ? ` ${styles.inputError}` : ''}`}
              min="0"
              step="1000"
            />
            {errors.price && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.price}</span>}
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
