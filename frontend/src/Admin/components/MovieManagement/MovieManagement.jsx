import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Edit, Trash2, Plus, Search, RefreshCw, Calendar, Clock, Star, Film, Shield, Building2 } from 'lucide-react';
import { getAllMovies, createMovie, updateMovie, deleteMovie } from '../../../services/movieService';
import { createShowtime, updateShowtime, deleteShowtime } from '../../../services/showtimeService';
import useToast from '../../../Admin/hooks/useToast';
import ToastContainer from '../Toast/ToastContainer';
import CreateMovieModal from './CreateMovieModal';
import EditMovieModal from './EditMovieModal';
import MovieDetailsModal from './MovieDetailsModal';
import MovieCinemasModal from './MovieCinemasModal';
import styles from './MovieManagement.module.css';

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCinemasModal, setShowCinemasModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const { showSuccess, showError, toasts, removeToast } = useToast();

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const moviesData = await getAllMovies();
      setMovies(moviesData);
    } catch (error) {
      console.error('Error fetching movies:', error);
      showError('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    const filtered = movies.filter(movie =>
      movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movie.director?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMovies(filtered);
  }, [movies, searchTerm]);

  const handleCreateMovie = async (movieData) => {
    try {
      const newMovie = await createMovie(movieData);
      setMovies(prev => [newMovie, ...prev]);
      
      // Create showtime records if there are any
      if (movieData.showtimes && movieData.showtimes.length > 0) {
        try {
          const showtimePromises = movieData.showtimes.map(showtime => {
            const showtimeData = {
              movieId: newMovie.id || newMovie._id,
              movieName: newMovie.title || newMovie.name,
              cinemaId: showtime.cinemaId,
              startTime: `${showtime.date}T${showtime.time}:00`,
              room: `Phòng ${Math.floor(Math.random() * 10) + 1}`,
              totalSeats: 100,
              availableSeats: 100,
              price: 0
            };
            return createShowtime(showtimeData);
          });
          
          await Promise.all(showtimePromises);
          console.log('All showtimes created successfully');
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('showtimesUpdated', {
            detail: { movieId: newMovie.id || newMovie._id }
          }));
        } catch (showtimeError) {
          console.error('Error creating showtimes:', showtimeError);
          showError('Phim đã được tạo nhưng có lỗi khi tạo suất chiếu');
        }
      }
      
      setShowCreateModal(false);
      showSuccess('Thêm phim thành công!');
    } catch (error) {
      console.error('Error creating movie:', error);
      showError('Không thể thêm phim. Vui lòng thử lại.');
    }
  };

  const handleUpdateMovie = async (movieData) => {
    try {
      const updatedMovie = await updateMovie(selectedMovie.id, movieData);
      setMovies(prev => prev.map(movie => 
        movie.id === selectedMovie.id ? updatedMovie : movie
      ));
      
      // Handle showtime updates
      if (movieData.showtimes && movieData.showtimes.length > 0) {
        try {
          const showtimePromises = movieData.showtimes.map(showtime => {
            const showtimeData = {
              movieId: selectedMovie.id,
              movieName: selectedMovie.title || selectedMovie.name,
              cinemaId: showtime.cinemaId,
              startTime: `${showtime.date}T${showtime.time}:00`,
              room: `Phòng ${Math.floor(Math.random() * 10) + 1}`,
              totalSeats: 100,
              availableSeats: 100,
              price: 0
            };
            return createShowtime(showtimeData);
          });
          
          await Promise.all(showtimePromises);
          console.log('All showtimes updated successfully');
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('showtimesUpdated', {
            detail: { movieId: selectedMovie.id }
          }));
        } catch (showtimeError) {
          console.error('Error updating showtimes:', showtimeError);
          showError('Phim đã được cập nhật nhưng có lỗi khi cập nhật suất chiếu');
        }
      }
      
      setShowEditModal(false);
      setSelectedMovie(null);
      showSuccess('Cập nhật phim thành công!');
    } catch (error) {
      console.error('Error updating movie:', error);
      showError('Không thể cập nhật phim. Vui lòng thử lại.');
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      try {
        await deleteMovie(movieId);
        setMovies(prev => prev.filter(movie => movie.id !== movieId));
        showSuccess('Xóa phim thành công!');
      } catch (error) {
        console.error('Error deleting movie:', error);
        showError('Không thể xóa phim. Vui lòng thử lại.');
      }
    }
  };

  const handleViewMovie = (movie) => {
    setSelectedMovie(movie);
    setShowDetailsModal(true);
  };

  const handleEditMovie = (movie) => {
    setSelectedMovie(movie);
    setShowEditModal(true);
  };

  const handleManageCinemas = (movie) => {
    setSelectedMovie(movie);
    setShowCinemasModal(true);
  };

  const handleCinemasUpdated = () => {
    // Refresh movies data to get updated cinema lists
    fetchMovies();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'Chưa cập nhật';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Chưa cập nhật';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatAgeRating = (ageRating) => {
    if (!ageRating) return 'Chưa cập nhật';
    const ratings = {
      'P': 'P',
      'T13': 'T13',
      'T16': 'T16',
      'T18': 'T18'
    };
    return ratings[ageRating] || ageRating;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Đang tải danh sách phim...</p>
      </div>
    );
  }

  return (
    <div className={styles.movieManagement}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Header */}
      <div className={styles.header}>
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={22} />
          Thêm phim mới
        </button>
      </div>

      {/* Search and Filter */}
      <div className={styles.searchContainer}>
        <div className={styles.searchBox}>
          <Search size={22} />
          <input
            type="text"
            placeholder="Tìm kiếm phim theo tên, thể loại, đạo diễn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button 
          className={styles.refreshButton}
          onClick={fetchMovies}
          title="Làm mới danh sách"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length > 0 ? (
        <div className={styles.moviesGrid}>
          {filteredMovies.map((movie) => (
            <div key={movie.id} className={styles.movieCard}>
              <div className={styles.movieImage}>
                {(movie.posterUrl || movie.imageUrl || movie.poster || movie.image) ? (
                  <img 
                    src={movie.posterUrl || movie.imageUrl || movie.poster || movie.image} 
                    alt={movie.title}
                    onLoad={(e) => {
                      e.target.nextSibling.style.display = 'none';
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={styles.placeholderImage}
                  style={{ display: (movie.posterUrl || movie.imageUrl || movie.poster || movie.image) ? 'none' : 'flex' }}
                >
                  <Film size={48} />
                </div>
                
                {/* Action Buttons */}
                <div className={styles.movieActions}>
                  <button
                    className={`${styles.actionBtn} ${styles.viewBtn}`}
                    onClick={() => handleViewMovie(movie)}
                    title="Xem chi tiết"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    onClick={() => handleEditMovie(movie)}
                    title="Chỉnh sửa"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.cinemasBtn}`}
                    onClick={() => handleManageCinemas(movie)}
                    title="Quản lý rạp"
                  >
                    <Building2 size={20} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDeleteMovie(movie.id)}
                    title="Xóa phim"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className={styles.movieInfo}>
                <h3 className={styles.movieTitle}>{movie.title || 'Chưa có tên'}</h3>
                {movie.englishTitle && (
                  <h4 className={styles.englishTitle}>{movie.englishTitle}</h4>
                )}
                
                <div className={styles.movieMeta}>
                  <div className={styles.metaItem}>
                    <Calendar size={16} />
                    <span>{formatDate(movie.releaseDate)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={16} />
                    <span>{formatDuration(movie.duration)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Star size={16} />
                    <span>{movie.rating || 'N/A'}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Shield size={16} />
                    <span>{formatAgeRating(movie.ageRating)}</span>
                  </div>
                </div>

                <div className={styles.movieDetails}>
                  <p className={styles.genre}>
                    <strong>Thể loại:</strong> {movie.genre || 'Chưa cập nhật'}
                  </p>
                  <p className={styles.director}>
                    <strong>Đạo diễn:</strong> {movie.director || 'Chưa cập nhật'}
                  </p>
                  <p className={styles.description}>
                    {movie.description ? 
                      (movie.description.length > 100 ? 
                        `${movie.description.substring(0, 100)}...` : 
                        movie.description
                      ) : 
                      'Chưa có mô tả'
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Film size={64} />
          <h3>Không có phim nào</h3>
          <p>Hãy thêm phim đầu tiên của bạn</p>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={20} />
            Thêm phim mới
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateMovieModal
          onClose={() => setShowCreateModal(false)}
          onMovieCreated={handleCreateMovie}
        />
      )}

      {showEditModal && selectedMovie && (
        <EditMovieModal
          movie={selectedMovie}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMovie(null);
          }}
          onMovieUpdated={handleUpdateMovie}
        />
      )}

      {showDetailsModal && selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedMovie(null);
          }}
        />
      )}

      {showCinemasModal && selectedMovie && (
        <MovieCinemasModal
          movie={selectedMovie}
          onClose={() => {
            setShowCinemasModal(false);
            setSelectedMovie(null);
          }}
          onCinemasUpdated={handleCinemasUpdated}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default MovieManagement;
