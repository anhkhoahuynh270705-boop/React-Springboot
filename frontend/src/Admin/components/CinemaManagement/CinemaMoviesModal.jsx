import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Film, Trash2, Check, Clock } from 'lucide-react';
import { getAllMovies } from '../../../services/movieService';
import { addMovieToCinema, removeMovieFromCinema } from '../../../services/cinemaService';
import { createShowtime } from '../../../services/showtimeService';
import useToast from '../../../Admin/hooks/useToast';
import ToastContainer from '../Toast/ToastContainer';
import styles from './CinemaMoviesModal.module.css';
import CreateShowtimeModal from '../ShowtimeManagement/CreateShowtimeModal';

const CinemaMoviesModal = ({ cinema, onClose, onMoviesUpdated }) => {
  const [allMovies, setAllMovies] = useState([]);
  const [cinemaMovies, setCinemaMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const [isShowtimeModalOpen, setIsShowtimeModalOpen] = useState(false);
  const [selectedMovieForShowtime, setSelectedMovieForShowtime] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (cinema && cinema.movieIds) {
      setCinemaMovies(cinema.movieIds);
    }
  }, [cinema]);

  // Refresh data when modal opens
  useEffect(() => {
    if (cinema) {
      fetchMovies();
      if (cinema.movieIds) {
        setCinemaMovies(cinema.movieIds);
      }
    }
  }, [cinema?.id]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const movies = await getAllMovies();
      setAllMovies(movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      showError('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (movieId) => {
    try {
      setActionLoading(true);
      await addMovieToCinema(cinema.id, movieId);
      setCinemaMovies(prev => [...prev, movieId]);
      showSuccess('Đã thêm phim vào rạp chiếu');
      
      // Refresh cinema data to get updated movie list
      if (onMoviesUpdated) {
        const updatedCinemaMovies = [...cinemaMovies, movieId];
        const updatedMovieObjects = allMovies.filter(movie => 
          updatedCinemaMovies.includes(movie.id)
        );
        onMoviesUpdated(updatedMovieObjects);
      }

      setTimeout(() => {
        setCinemaMovies(prev => [...prev]);
        setActionLoading(false);
      }, 100);
    } catch (error) {
      console.error('Error adding movie to cinema:', error);
      showError('Không thể thêm phim vào rạp chiếu');
      setActionLoading(false);
    }
  };

  const openShowtimeModal = (movieId) => {
    setSelectedMovieForShowtime(movieId);
    setIsShowtimeModalOpen(true);
  };

  const handleCreateShowtime = async (formData) => {
    try {
      await createShowtime(formData);
      showSuccess('Đã tạo suất chiếu cho phim');
      setIsShowtimeModalOpen(false);
    } catch (error) {
      console.error('Error creating showtime:', error);
      const errorMessage = error.message.includes('400') 
        ? 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.'
        : 'Không thể tạo suất chiếu. Vui lòng thử lại.';
      showError(errorMessage);
    }
  };

  const handleRemoveMovie = async (movieId) => {
    try {
      setActionLoading(true);
      await removeMovieFromCinema(cinema.id, movieId);
      setCinemaMovies(prev => prev.filter(id => id !== movieId));
      showSuccess('Đã xóa phim khỏi rạp chiếu');
      
      // Refresh cinema data to get updated movie list
      if (onMoviesUpdated) {
        // Tìm movie objects từ allMovies dựa trên cinemaMovies IDs (loại bỏ movie đã xóa)
        const updatedCinemaMovies = cinemaMovies.filter(id => id !== movieId);
        const updatedMovieObjects = allMovies.filter(movie => 
          updatedCinemaMovies.includes(movie.id)
        );
        onMoviesUpdated(updatedMovieObjects);
      }
      
      // Force re-render by updating local state
      setTimeout(() => {
        setCinemaMovies(prev => [...prev]);
        setActionLoading(false);
      }, 100);
    } catch (error) {
      console.error('Error removing movie from cinema:', error);
      showError('Không thể xóa phim khỏi rạp chiếu');
      setActionLoading(false);
    }
  };

  const filteredMovies = allMovies.filter(movie =>
    movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.englishTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isMovieInCinema = (movieId) => {
    return cinemaMovies.includes(movieId);
  };

  if (!cinema) return null;

  return (
    <>
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Quản lý phim - {cinema.name}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Movies List */}
          <div className={styles.moviesContainer}>
            <div className={styles.moviesSection}>
              <h3>Tất cả phim ({filteredMovies.length})</h3>
              <div className={styles.moviesList}>
                {loading ? (
                  <div className={styles.loading}>Đang tải...</div>
                ) : filteredMovies.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Film size={48} />
                    <p>Không có phim nào</p>
                  </div>
                ) : (
                  filteredMovies.map((movie) => (
                    <div key={movie.id} className={styles.movieItem}>
                      <div className={styles.movieInfo}>
                        <div className={styles.movieImage}>
                          {movie.posterUrl || movie.imageUrl ? (
                            <img 
                              src={movie.posterUrl || movie.imageUrl} 
                              alt={movie.title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={styles.placeholderImage}
                            style={{ display: (movie.posterUrl || movie.imageUrl) ? 'none' : 'flex' }}
                          >
                            <Film size={24} />
                          </div>
                        </div>
                        <div className={styles.movieDetails}>
                          <h4 className={styles.movieTitle}>{movie.title}</h4>
                          {movie.englishTitle && (
                            <p className={styles.movieEnglishTitle}>{movie.englishTitle}</p>
                          )}
                          <div className={styles.movieMeta}>
                            <span className={styles.movieGenre}>{movie.genre}</span>
                            <span className={styles.movieDuration}>{movie.duration} phút</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.movieActions}>
                        {isMovieInCinema(movie.id) ? (
                          <button
                            onClick={() => handleRemoveMovie(movie.id)}
                            className={`${styles.actionButton} ${styles.removeButton}`}
                            title="Xóa khỏi rạp"
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <div className={styles.loadingSpinner}></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddMovie(movie.id)}
                            className={`${styles.actionButton} ${styles.addButton}`}
                            title="Thêm vào rạp"
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <div className={styles.loadingSpinner}></div>
                            ) : (
                              <Plus size={16} />
                            )}
                          </button>
                        )}

                        {isMovieInCinema(movie.id) && (
                          <button
                            onClick={() => openShowtimeModal(movie.id)}
                            className={`${styles.actionButton} ${styles.addButton}`}
                            title="Thêm suất chiếu cho phim"
                            disabled={actionLoading}
                          >
                            <Clock size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cinema Movies */}
            <div className={styles.moviesSection}>
              <h3>Phim trong rạp ({cinemaMovies.length})</h3>
              <div className={styles.cinemaMoviesList}>
                {cinemaMovies.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Film size={48} />
                    <p>Chưa có phim nào trong rạp</p>
                  </div>
                ) : (
                  cinemaMovies.map((movieId) => {
                    const movie = allMovies.find(m => m.id === movieId);
                    if (!movie) return null;
                    
                    return (
                      <div key={movieId} className={styles.cinemaMovieItem}>
                        <div className={styles.movieInfo}>
                          <div className={styles.movieImage}>
                            {movie.posterUrl || movie.imageUrl ? (
                              <img 
                                src={movie.posterUrl || movie.imageUrl} 
                                alt={movie.title}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={styles.placeholderImage}
                              style={{ display: (movie.posterUrl || movie.imageUrl) ? 'none' : 'flex' }}
                            >
                              <Film size={20} />
                            </div>
                          </div>
                          <div className={styles.movieDetails}>
                            <h4 className={styles.movieTitle}>{movie.title}</h4>
                            <span className={styles.movieGenre}>{movie.genre}</span>
                          </div>
                        </div>
                        <div className={styles.movieActions}>
                          <button
                            onClick={() => handleRemoveMovie(movieId)}
                            className={`${styles.actionButton} ${styles.removeButton}`}
                            title="Xóa khỏi rạp"
                          >
                            <Trash2 size={14} />
                          </button>

                          <button
                            onClick={() => openShowtimeModal(movieId)}
                            className={`${styles.actionButton} ${styles.addButton}`}
                            title="Thêm suất chiếu cho phim"
                          >
                            <Clock size={14} />
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
    {isShowtimeModalOpen && (
      <CreateShowtimeModal
        cinemas={[cinema]}
        movies={allMovies}
        defaultCinemaId={cinema.id}
        defaultMovieId={selectedMovieForShowtime}
        onClose={() => setIsShowtimeModalOpen(false)}
        onSubmit={handleCreateShowtime}
      />
    )}
  </>
  );
};

export default CinemaMoviesModal;
