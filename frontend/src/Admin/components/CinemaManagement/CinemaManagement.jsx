import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Edit, Trash2, Plus, Search, RefreshCw, MapPin, Phone, Mail, Clock, Users, Star, Film } from 'lucide-react';
import { getAllCinemas, getCinemaById, createCinema, updateCinema, deleteCinema, getCinemaMovieCounts } from '../../../services/cinemaService';
import useToast from '../../../Admin/hooks/useToast';
import ToastContainer from '../Toast/ToastContainer';
import CreateCinemaModal from './CreateCinemaModal';
import EditCinemaModal from './EditCinemaModal';
import CinemaDetailsModal from './CinemaDetailsModal';
import CinemaMoviesModal from './CinemaMoviesModal';
import styles from './CinemaManagement.module.css';

const CinemaManagement = () => {
  const [cinemas, setCinemas] = useState([]);
  const [filteredCinemas, setFilteredCinemas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showMoviesModal, setShowMoviesModal] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [cinemaMovies, setCinemaMovies] = useState({}); 
  const [movieCounts, setMovieCounts] = useState({});
  const { showSuccess, showError, toasts, removeToast } = useToast();

  const fetchCinemas = useCallback(async () => {
    try {
      setLoading(true);
      const [cinemasData, movieCountsData] = await Promise.all([
        getAllCinemas(),
        getCinemaMovieCounts()
      ]);
      
      setCinemas(cinemasData);
      setFilteredCinemas(cinemasData);
      setMovieCounts(movieCountsData);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      showError('Không thể tải danh sách rạp chiếu');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchCinemas();
  }, [fetchCinemas]);

  // Unique city list
  const cityOptions = React.useMemo(() => {
    const set = new Set();
    cinemas.forEach(c => { if (c.city) set.add(c.city); });
    return Array.from(set).sort();
  }, [cinemas]);

  // Filter cinemas based on city and search term
  useEffect(() => {
    let filtered = cinemas;
    if (selectedCity) {
      filtered = filtered.filter(cinema => cinema.city === selectedCity);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(cinema =>
        cinema.name?.toLowerCase().includes(q) ||
        cinema.city?.toLowerCase().includes(q) ||
        cinema.address?.toLowerCase().includes(q)
      );
    }
    setFilteredCinemas(filtered);
  }, [cinemas, searchTerm, selectedCity]);

  const handleCreateCinema = async (cinemaData) => {
    try {
      const newCinema = await createCinema(cinemaData);
      setCinemas(prev => [newCinema, ...prev]);
      setShowCreateModal(false);
      showSuccess('Thêm rạp chiếu thành công!');
    } catch (error) {
      console.error('Error creating cinema:', error);
      showError('Không thể thêm rạp chiếu. Vui lòng thử lại.');
    }
  };

  const handleUpdateCinema = async (cinemaData) => {
    try {
      const { movies, movieIds, ...updateData } = cinemaData;
      
      const updatedCinema = await updateCinema(selectedCinema.id, updateData);
      
      // Giữ lại danh sách phim hiện có khi cập nhật state
      const currentMovies = cinemaMovies[selectedCinema.id] || selectedCinema.movies || [];
      const cinemaWithMovies = {
        ...updatedCinema,
        movies: currentMovies,
        movieIds: currentMovies.map(movie => movie.id)
      };
      
      setCinemas(prev => prev.map(cinema => 
        cinema.id === selectedCinema.id ? cinemaWithMovies : cinema
      ));
      setShowEditModal(false);
      setSelectedCinema(null);
      showSuccess('Cập nhật rạp chiếu thành công!');
    } catch (error) {
      console.error('Error updating cinema:', error);
      showError('Không thể cập nhật rạp chiếu. Vui lòng thử lại.');
    }
  };

  const handleDeleteCinema = async (cinemaId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa rạp chiếu này?')) {
      try {
        await deleteCinema(cinemaId);
        setCinemas(prev => prev.filter(cinema => cinema.id !== cinemaId));
        showSuccess('Xóa rạp chiếu thành công!');
      } catch (error) {
        console.error('Error deleting cinema:', error);
        showError('Không thể xóa rạp chiếu. Vui lòng thử lại.');
      }
    }
  };

  const handleViewCinema = (cinema) => {
    setSelectedCinema(cinema);
    setShowDetailsModal(true);
  };

  const handleEditCinema = (cinema) => {
    // Bao gồm movies từ state nếu có
    const cinemaWithMovies = {
      ...cinema,
      movies: cinemaMovies[cinema.id] || cinema.movies || [],
      movieIds: cinemaMovies[cinema.id]?.map(movie => movie.id) || cinema.movieIds || []
    };
    setSelectedCinema(cinemaWithMovies);
    setShowEditModal(true);
  };

  const handleManageMovies = (cinema) => {
    // Bao gồm movies từ state nếu có
    const cinemaWithMovies = {
      ...cinema,
      movies: cinemaMovies[cinema.id] || cinema.movies || [],
      movieIds: cinemaMovies[cinema.id]?.map(movie => movie.id) || cinema.movieIds || []
    };
    setSelectedCinema(cinemaWithMovies);
    setShowMoviesModal(true);
  };

  const handleMoviesUpdated = (updatedMovies) => {
    // Cập nhật movies trong state local
    if (selectedCinema && updatedMovies) {
      setCinemaMovies(prev => ({
        ...prev,
        [selectedCinema.id]: updatedMovies
      }));
      
      // Cập nhật movie counts
      setMovieCounts(prev => ({
        ...prev,
        [selectedCinema.id]: updatedMovies.length
      }));
      
      // Cập nhật selectedCinema với movies mới
      setSelectedCinema(prev => ({
        ...prev,
        movies: updatedMovies,
        movieIds: updatedMovies.map(movie => movie.id)
      }));
    }
    // Refresh cinemas data to get updated movie lists
    fetchCinemas();
  };

  const formatStatus = (status) => {
    const statusMap = {
      'ACTIVE': 'Hoạt động',
      'INACTIVE': 'Tạm dừng',
      'MAINTENANCE': 'Bảo trì'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'ACTIVE': '#10b981',
      'INACTIVE': '#f59e0b',
      'MAINTENANCE': '#ef4444'
    };
    return colorMap[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Đang tải danh sách rạp chiếu...</p>
      </div>
    );
  }

  return (
    <div className={styles.cinemaManagement}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Quản lý rạp chiếu</h2>
          <p>Tổng cộng: {filteredCinemas.length} rạp chiếu</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.searchContainer}>
            <MapPin className={styles.searchIcon} size={20} />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className={styles.searchInput}
              style={{ maxWidth: 240 }}
            >
              <option value="">Tất cả thành phố</option>
              {cityOptions.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
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
          <button
            onClick={() => setShowCreateModal(true)}
            className={styles.addButton}
          >
            <Plus size={20} />
            Thêm rạp chiếu
          </button>
          <button
            onClick={fetchCinemas}
            className={styles.refreshButton}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className={styles.cinemaGrid}>
        {filteredCinemas.map((cinema) => (
          <div key={cinema.id} className={styles.cinemaCard}>
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
                <MapPin size={40} />
              </div>
              <div 
                className={styles.ticketSalesBadge}
                style={{ backgroundColor: getStatusColor(cinema.status) }}
              >
                {formatStatus(cinema.status)}
              </div>
            </div>
            
            <div className={styles.cinemaContent}>
              <h3 className={styles.cinemaName}>{cinema.name}</h3>
              
              <div className={styles.cinemaInfo}>
                <div className={styles.infoItem}>
                  <MapPin size={16} />
                  <span>{cinema.address}</span>
                </div>
                <div className={styles.infoItem}>
                  <MapPin size={16} />
                  <span>{cinema.city}</span>
                </div>
                {cinema.phone && (
                  <div className={styles.infoItem}>
                    <Phone size={16} />
                    <span>{cinema.phone}</span>
                  </div>
                )}
                {cinema.email && (
                  <div className={styles.infoItem}>
                    <Mail size={16} />
                    <span>{cinema.email}</span>
                  </div>
                )}
              </div>

              <div className={styles.cinemaStats}>
                <div className={styles.statItem}>
                  <Users size={16} />
                  <span>{cinema.totalSeats || 0} ghế</span>
                </div>
                <div className={styles.statItem}>
                  <Clock size={16} />
                  <span>{cinema.totalRooms || 0} phòng</span>
                </div>
                <div className={styles.statItem}>
                  <Star size={16} />
                  <span>{movieCounts[cinema.id] || cinema.movieIds?.length || 0} phim</span>
                </div>
              </div>

              {cinema.facilities && cinema.facilities.length > 0 && (
                <div className={styles.facilities}>
                  {cinema.facilities.slice(0, 3).map((facility, index) => (
                    <span key={index} className={styles.facilityTag}>
                      {facility}
                    </span>
                  ))}
                  {cinema.facilities.length > 3 && (
                    <span className={styles.moreFacilities}>
                      +{cinema.facilities.length - 3} khác
                    </span>
                  )}
                </div>
              )}

              <div className={styles.cinemaActions}>
                <button
                  onClick={() => handleViewCinema(cinema)}
                  className={styles.actionButton}
                  title="Xem chi tiết"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleManageMovies(cinema)}
                  className={styles.actionButton}
                  title="Quản lý phim"
                >
                  <Film size={16} />
                </button>
                <button
                  onClick={() => handleEditCinema(cinema)}
                  className={styles.actionButton}
                  title="Chỉnh sửa"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteCinema(cinema.id)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCinemas.length === 0 && (
        <div className={styles.emptyState}>
          <MapPin size={64} />
          <h3>Không có rạp chiếu nào</h3>
          <p>Hãy thêm rạp chiếu đầu tiên của bạn</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className={styles.addFirstButton}
          >
            <Plus size={20} />
            Thêm rạp chiếu đầu tiên
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateCinemaModal
          onClose={() => setShowCreateModal(false)}
          onCinemaCreated={handleCreateCinema}
        />
      )}

      {showEditModal && selectedCinema && (
        <EditCinemaModal
          cinema={selectedCinema}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCinema(null);
          }}
          onCinemaUpdated={handleUpdateCinema}
        />
      )}

      {showDetailsModal && selectedCinema && (
        <CinemaDetailsModal
          cinema={selectedCinema}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCinema(null);
          }}
        />
      )}

      {showMoviesModal && selectedCinema && (
        <CinemaMoviesModal
          cinema={selectedCinema}
          onClose={() => {
            setShowMoviesModal(false);
            setSelectedCinema(null);
          }}
          onMoviesUpdated={handleMoviesUpdated}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default CinemaManagement;
