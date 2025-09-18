import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Edit, Trash2, Plus, Search, RefreshCw, Clock, Calendar, MapPin, Film, Building2 } from 'lucide-react';
import { getAllShowtimes, getShowtimesByCinema, getShowtimesByMovie, deleteShowtime, updateShowtime, createShowtime } from '../../../services/showtimeService';
import { getAllCinemas } from '../../../services/cinemaService';
import { getAllMovies } from '../../../services/movieService';
import useToast from '../../../Admin/hooks/useToast';
import ToastContainer from '../Toast/ToastContainer';
import CreateShowtimeModal from './CreateShowtimeModal';
import EditShowtimeModal from './EditShowtimeModal';
import ShowtimeDetailsModal from './ShowtimeDetailsModal';
import styles from './ShowtimeManagement.module.css';

const ShowtimeManagement = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [filteredShowtimes, setFilteredShowtimes] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const { showSuccess, showError, toasts, removeToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [showtimesData, cinemasData, moviesData] = await Promise.all([
        getAllShowtimes(),
        getAllCinemas(),
        getAllMovies()
      ]);
      
      setShowtimes(showtimesData);
      setFilteredShowtimes(showtimesData);
      setCinemas(cinemasData);
      setMovies(moviesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Không thể tải dữ liệu suất chiếu');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter showtimes based on search term and filters
  useEffect(() => {
    let filtered = showtimes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(showtime =>
        showtime.movieName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        showtime.cinemaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        showtime.room?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by cinema
    if (selectedCinema) {
      filtered = filtered.filter(showtime => showtime.cinemaId === selectedCinema);
    }

    // Filter by movie
    if (selectedMovie) {
      filtered = filtered.filter(showtime => showtime.movieId === selectedMovie);
    }

    setFilteredShowtimes(filtered);
  }, [showtimes, searchTerm, selectedCinema, selectedMovie]);

  const handleCreateShowtime = async (showtimeData) => {
    try {
      const newShowtime = await createShowtime(showtimeData);
      setShowtimes(prev => [newShowtime, ...prev]);
      setShowCreateModal(false);
      showSuccess('Thêm suất chiếu thành công!');
    } catch (error) {
      console.error('Error creating showtime:', error);
      showError('Không thể thêm suất chiếu. Vui lòng thử lại.');
    }
  };

  const handleUpdateShowtime = async (showtimeData) => {
    try {
      console.log('Updating showtime with ID:', selectedShowtime.id);
      console.log('Update data:', showtimeData);
      const updatedShowtime = await updateShowtime(selectedShowtime.id, showtimeData);
      setShowtimes(prev => prev.map(showtime => 
        showtime.id === selectedShowtime.id ? updatedShowtime : showtime
      ));
      setShowEditModal(false);
      setSelectedShowtime(null);
      showSuccess('Cập nhật suất chiếu thành công!');
    } catch (error) {
      console.error('Error updating showtime:', error);
      showError('Không thể cập nhật suất chiếu. Vui lòng thử lại.');
    }
  };

  const handleDeleteShowtime = async (showtimeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) {
      try {
        await deleteShowtime(showtimeId);
        setShowtimes(prev => prev.filter(showtime => showtime.id !== showtimeId));
        showSuccess('Xóa suất chiếu thành công!');
      } catch (error) {
        console.error('Error deleting showtime:', error);
        showError('Không thể xóa suất chiếu. Vui lòng thử lại.');
      }
    }
  };

  const handleViewShowtime = (showtime) => {
    setSelectedShowtime(showtime);
    setShowDetailsModal(true);
  };

  const handleEditShowtime = (showtime) => {
    setSelectedShowtime(showtime);
    setShowEditModal(true);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Chưa cập nhật';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (showtime) => {
    const now = new Date();
    const showtimeDate = new Date(showtime.startTime);
    
    if (showtimeDate < now) {
      return '#ef4444'; // Red for past
    } else if (showtime.availableSeats === 0) {
      return '#f59e0b'; // Orange for sold out
    } else {
      return '#10b981'; // Green for available
    }
  };

  const getStatusText = (showtime) => {
    const now = new Date();
    const showtimeDate = new Date(showtime.startTime);
    
    if (showtimeDate < now) {
      return 'Đã chiếu';
    } else if (showtime.availableSeats === 0) {
      return 'Hết vé';
    } else {
      return 'Còn vé';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Đang tải danh sách suất chiếu...</p>
      </div>
    );
  }

  return (
    <div className={styles.showtimeManagement}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Quản lý suất chiếu</h2>
          <p>Tổng cộng: {filteredShowtimes.length} suất chiếu</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm suất chiếu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className={styles.addButton}
          >
            <Plus size={20} />
            Thêm suất chiếu
          </button>
          <button
            onClick={fetchData}
            className={styles.refreshButton}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Rạp chiếu:</label>
          <select
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Tất cả rạp</option>
            {cinemas.map(cinema => (
              <option key={cinema.id} value={cinema.id}>
                {cinema.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Phim:</label>
          <select
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Tất cả phim</option>
            {movies.map(movie => (
              <option key={movie.id} value={movie.id}>
                {movie.title || movie.name || movie.movieName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.showtimeGrid}>
        {filteredShowtimes.map((showtime) => (
          <div key={showtime.id} className={styles.showtimeCard}>
            <div className={styles.showtimeHeader}>
              <div className={styles.movieInfo}>
                <Film size={16} />
                <span className={styles.movieName}>{showtime.movieName}</span>
              </div>
              <div 
                className={styles.statusBadge}
                style={{ backgroundColor: getStatusColor(showtime) }}
              >
                {getStatusText(showtime)}
              </div>
            </div>

            <div className={styles.showtimeContent}>
              <div className={styles.infoRow}>
                <Building2 size={16} />
                <span>{showtime.cinemaName}</span>
              </div>
              <div className={styles.infoRow}>
                <Clock size={16} />
                <span>{formatDateTime(showtime.startTime)}</span>
              </div>
              <div className={styles.infoRow}>
                <MapPin size={16} />
                <span>{showtime.room}</span>
              </div>
              <div className={styles.infoRow}>
                <span>Ghế: {showtime.availableSeats}/{showtime.totalSeats}</span>
              </div>
              <div className={styles.infoRow}>
                <span>Giá: {formatPrice(showtime.price)}</span>
              </div>
            </div>

            <div className={styles.showtimeActions}>
              <button
                onClick={() => handleViewShowtime(showtime)}
                className={styles.actionButton}
                title="Xem chi tiết"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEditShowtime(showtime)}
                className={styles.actionButton}
                title="Chỉnh sửa"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDeleteShowtime(showtime.id)}
                className={styles.actionButton}
                title="Xóa"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredShowtimes.length === 0 && (
        <div className={styles.emptyState}>
          <Calendar size={64} />
          <h3>Không có suất chiếu nào</h3>
          <p>Hãy thêm suất chiếu đầu tiên để bắt đầu.</p>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateShowtimeModal
          cinemas={cinemas}
          movies={movies}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateShowtime}
        />
      )}

      {showEditModal && selectedShowtime && (
        <EditShowtimeModal
          showtime={selectedShowtime}
          cinemas={cinemas}
          movies={movies}
          onClose={() => {
            setShowEditModal(false);
            setSelectedShowtime(null);
          }}
          onSubmit={handleUpdateShowtime}
        />
      )}

      {showDetailsModal && selectedShowtime && (
        <ShowtimeDetailsModal
          showtime={selectedShowtime}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedShowtime(null);
          }}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default ShowtimeManagement;
