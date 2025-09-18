import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Building2, Trash2, MapPin } from 'lucide-react';
import { getAllCinemas } from '../../../services/cinemaService';
import { addMovieToCinema, removeMovieFromCinema } from '../../../services/cinemaService';
import useToast from '../../../Admin/hooks/useToast';
import ToastContainer from '../Toast/ToastContainer';
import styles from './MovieCinemasModal.module.css';

const MovieCinemasModal = ({ movie, onClose, onCinemasUpdated }) => {
  const [allCinemas, setAllCinemas] = useState([]);
  const [movieCinemas, setMovieCinemas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, toasts, removeToast } = useToast();

  useEffect(() => {
    fetchCinemas();
  }, []);

  useEffect(() => {
    if (movie && movie.cinemaIds) {
      setMovieCinemas(movie.cinemaIds);
    }
  }, [movie]);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const cinemas = await getAllCinemas();
      setAllCinemas(cinemas);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      showError('Không thể tải danh sách rạp chiếu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCinema = async (cinemaId) => {
    try {
      await addMovieToCinema(cinemaId, movie.id);
      setMovieCinemas(prev => [...prev, cinemaId]);
      showSuccess('Đã thêm rạp chiếu cho phim');
      if (onCinemasUpdated) {
        onCinemasUpdated();
      }
    } catch (error) {
      console.error('Error adding cinema to movie:', error);
      showError('Không thể thêm rạp chiếu cho phim');
    }
  };

  const handleRemoveCinema = async (cinemaId) => {
    try {
      await removeMovieFromCinema(cinemaId, movie.id);
      setMovieCinemas(prev => prev.filter(id => id !== cinemaId));
      showSuccess('Đã xóa rạp chiếu khỏi phim');
      if (onCinemasUpdated) {
        onCinemasUpdated();
      }
    } catch (error) {
      console.error('Error removing cinema from movie:', error);
      showError('Không thể xóa rạp chiếu khỏi phim');
    }
  };

  const filteredCinemas = allCinemas.filter(cinema =>
    cinema.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cinema.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cinema.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCinemaInMovie = (cinemaId) => {
    return movieCinemas.includes(cinemaId);
  };

  if (!movie) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Quản lý rạp chiếu - {movie.title}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Search */}
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm rạp chiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Cinemas List */}
          <div className={styles.cinemasContainer}>
            <div className={styles.cinemasSection}>
              <h3>Tất cả rạp chiếu ({filteredCinemas.length})</h3>
              <div className={styles.cinemasList}>
                {loading ? (
                  <div className={styles.loading}>Đang tải...</div>
                ) : filteredCinemas.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Building2 size={48} />
                    <p>Không có rạp chiếu nào</p>
                  </div>
                ) : (
                  filteredCinemas.map((cinema) => (
                    <div key={cinema.id} className={styles.cinemaItem}>
                      <div className={styles.cinemaInfo}>
                        <div className={styles.cinemaImage}>
                          {cinema.imageUrl ? (
                            <img 
                              src={cinema.imageUrl} 
                              alt={cinema.name}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={styles.placeholderImage}
                            style={{ display: cinema.imageUrl ? 'none' : 'flex' }}
                          >
                            <Building2 size={24} />
                          </div>
                        </div>
                        <div className={styles.cinemaDetails}>
                          <h4 className={styles.cinemaName}>{cinema.name}</h4>
                          <div className={styles.cinemaMeta}>
                            <span className={styles.cinemaCity}>{cinema.city}</span>
                            <span className={styles.cinemaRooms}>{cinema.totalRooms} phòng</span>
                          </div>
                          <p className={styles.cinemaAddress}>{cinema.address}</p>
                        </div>
                      </div>
                      <div className={styles.cinemaActions}>
                        {isCinemaInMovie(cinema.id) ? (
                          <button
                            onClick={() => handleRemoveCinema(cinema.id)}
                            className={`${styles.actionButton} ${styles.removeButton}`}
                            title="Xóa khỏi phim"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddCinema(cinema.id)}
                            className={`${styles.actionButton} ${styles.addButton}`}
                            title="Thêm vào phim"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Movie Cinemas */}
            <div className={styles.cinemasSection}>
              <h3>Rạp chiếu phim này ({movieCinemas.length})</h3>
              <div className={styles.movieCinemasList}>
                {movieCinemas.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Building2 size={48} />
                    <p>Chưa có rạp chiếu nào</p>
                  </div>
                ) : (
                  movieCinemas.map((cinemaId) => {
                    const cinema = allCinemas.find(c => c.id === cinemaId);
                    if (!cinema) return null;
                    
                    return (
                      <div key={cinemaId} className={styles.movieCinemaItem}>
                        <div className={styles.cinemaInfo}>
                          <div className={styles.cinemaImage}>
                            {cinema.imageUrl ? (
                              <img 
                                src={cinema.imageUrl} 
                                alt={cinema.name}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={styles.placeholderImage}
                              style={{ display: cinema.imageUrl ? 'none' : 'flex' }}
                            >
                              <Building2 size={20} />
                            </div>
                          </div>
                          <div className={styles.cinemaDetails}>
                            <h4 className={styles.cinemaName}>{cinema.name}</h4>
                            <span className={styles.cinemaCity}>{cinema.city}</span>
                          </div>
                        </div>
                        <div className={styles.cinemaActions}>
                          <button
                            onClick={() => handleRemoveCinema(cinemaId)}
                            className={`${styles.actionButton} ${styles.removeButton}`}
                            title="Xóa khỏi phim"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeModalButton}>
            Đóng
          </button>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
};

export default MovieCinemasModal;
