import { getAllMovies } from '../../../../services/movieService';
import { useState, useEffect } from 'react';
import { X, Plus, Search, Film, Trash2, Check, Clock } from 'lucide-react';
import { addMovieToCinema, removeMovieFromCinema } from '../../../../services/cinemaService';
import { createShowtime } from '../../../../services/showtimeService';
import useToast from '../../../hooks/useToast';
import ToastContainer from '../../Toast/ToastContainer';
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
      showError('Cannot fetch movie list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovie = async (movieId) => {
    try {
      setActionLoading(true);
      await addMovieToCinema(cinema.id, movieId);

      const newCinemaMovies = [...cinemaMovies, movieId];
      setCinemaMovies(newCinemaMovies);

      // Notify parent with full movie objects so the right panel updates instantly
      if (onMoviesUpdated) {
        const updatedMovieObjects = allMovies.filter(movie =>
          newCinemaMovies.includes(movie.id)
        );
        onMoviesUpdated(updatedMovieObjects);
      }

      showSuccess('Added movie to cinema successfully');
    } catch (error) {
      console.error('Error adding movie to cinema:', error);
      showError('Cannot add movie to cinema');
    } finally {
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
      showSuccess('Added showtime successfully');
      setIsShowtimeModalOpen(false);
    } catch (error) {
      console.error('Error creating showtime:', error);
      const errorMessage = error.message.includes('400')
        ? 'Invalid data. Please try again.'
        : 'Cannot create showtime. Please try again.';
      showError(errorMessage);
    }
  };

  const handleRemoveMovie = async (movieId) => {
    try {
      setActionLoading(true);
      await removeMovieFromCinema(cinema.id, movieId);

      const newCinemaMovies = cinemaMovies.filter(id => id !== movieId);
      setCinemaMovies(newCinemaMovies);

      // Notify parent with full movie objects so the right panel updates instantly
      if (onMoviesUpdated) {
        const updatedMovieObjects = allMovies.filter(movie =>
          newCinemaMovies.includes(movie.id)
        );
        onMoviesUpdated(updatedMovieObjects);
      }

      showSuccess('Deleted movie from cinema successfully');
    } catch (error) {
      console.error('Error removing movie from cinema:', error);
      showError('Cannot remove movie from cinema');
    } finally {
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
            <button onClick={onClose} className={styles.closeButton}><X size={20} /></button>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.searchContainer}>
              <Search className={styles.searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search movie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Movies List */}
            <div className={styles.moviesContainer}>
              <div className={styles.moviesSection}>
                <h3>All movies ({filteredMovies.length})</h3>
                <div className={styles.moviesList}>
                  {loading ? (
                    <div className={styles.loading}>Loading...</div>
                  ) : filteredMovies.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Film size={48} />
                      <p>Do not have any movie</p>
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

                            </div>
                          </div>
                          <div className={styles.movieDetails}>
                            <h4 className={styles.movieTitle}>{movie.title}</h4>
                            {movie.englishTitle && (
                              <p className={styles.movieEnglishTitle}>{movie.englishTitle}</p>
                            )}
                            <div className={styles.movieMeta}>
                              <span className={styles.movieGenre}>{movie.genre}</span>
                              <span className={styles.movieDuration}>{movie.duration} minutes</span>
                            </div>
                          </div>
                        </div>
                        <div className={styles.movieActions}>
                          {isMovieInCinema(movie.id) ? (
                            <button
                              onClick={() => handleRemoveMovie(movie.id)}
                              className={`${styles.actionButton} ${styles.removeButton}`}
                              title="remove movie from cinema"
                              disabled={actionLoading}
                            >
                              {actionLoading ? (
                                <div className={styles.loadingSpinner}></div>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddMovie(movie.id)}
                              className={`${styles.actionButton} ${styles.addButton}`}
                              title="Add to cinema"
                              disabled={actionLoading}
                            >
                              {actionLoading ? (
                                <div className={styles.loadingSpinner} />
                              ) : (
                                <Plus size={18} />
                              )}
                            </button>
                          )}

                          {isMovieInCinema(movie.id) && (
                            <button
                              onClick={() => openShowtimeModal(movie.id)}
                              className={`${styles.actionButton} ${styles.addButton}`}
                              title="Add showtime for movie"
                              disabled={actionLoading}
                            >
                              <Clock size={18} />
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
                <h3>Movie in cinema ({cinemaMovies.length})</h3>
                <div className={styles.cinemaMoviesList}>
                  {cinemaMovies.length === 0 ? (
                    <div className={styles.emptyState}>

                      <p>Do not have any movie in cinema</p>
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
                              title="Remove from cinema"
                            >
                              <Trash2 size={18} />
                            </button>

                            <button
                              onClick={() => openShowtimeModal(movieId)}
                              className={`${styles.actionButton} ${styles.addButton}`}
                              title="Add showtime for movie"
                            >
                              <Clock size={18} />
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
              Close
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
