import { getAllCinemas, createCinema, updateCinema, deleteCinema } from '../../../../services/cinemaService';
import { Eye, Edit, Trash2, Plus, Search, RefreshCw, MapPin, Phone, Mail, Clock, Users, Star, Film } from 'lucide-react';
import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import useToast from '../../../hooks/useToast';
import ToastContainer from '../../Toast/ToastContainer';
import CreateCinemaModal from '../CreateCinema/CreateCinemaModal';
import EditCinemaModal from '../EditCinemaModal';
import CinemaDetailsModal from '../CinemaDetails/CinemaDetailsModal';
import CinemaMoviesModal from '../CinemaMovie/CinemaMoviesModal';
import styles from './CinemaManagement.module.css';
import { useTranslation } from 'react-i18next';

const CinemaManagement = () => {
  const { t } = useTranslation();
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
      const cinemasData = await getAllCinemas();

      const counts = {};
      cinemasData.forEach(c => {
        counts[c.id] = c.movieIds ? c.movieIds.length : 0;
      });

      setCinemas(cinemasData);
      setFilteredCinemas(cinemasData);
      setMovieCounts(counts);
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      showError(t('Cannot load cinema list'));
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
      showSuccess(t('Add cinema successfully!'));
    } catch (error) {
      console.error('Error creating cinema:', error);
      showError(t('Cannot add cinema. Please try again.'));
    }
  };

  const handleUpdateCinema = async (cinemaData) => {
    try {
      const { movies: _movies, movieIds: _movieIds, ...updateData } = cinemaData;

      const updatedCinema = await updateCinema(selectedCinema.id, updateData);
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
      showSuccess(t('Update cinema successfully!'));
    } catch (error) {
      console.error('Error updating cinema:', error);
      showError(t('Cannot update cinema. Please try again.'));
    }
  };

  const handleDeleteCinema = async (cinemaId) => {
    if (window.confirm(t('Are you sure you want to delete this cinema?'))) {
      try {
        await deleteCinema(cinemaId);
        setCinemas(prev => prev.filter(cinema => cinema.id !== cinemaId));
        showSuccess(t('Delete cinema successfully!'));
      } catch (error) {
        console.error('Error deleting cinema:', error);
        showError(t('Cannot delete cinema. Please try again.'));
      }
    }
  };

  const handleViewCinema = (cinema) => {
    setSelectedCinema(cinema);
    setShowDetailsModal(true);
  };

  const handleEditCinema = (cinema) => {
    const cinemaWithMovies = {
      ...cinema,
      movies: cinemaMovies[cinema.id] || cinema.movies || [],
      movieIds: cinemaMovies[cinema.id]?.map(movie => movie.id) || cinema.movieIds || []
    };
    setSelectedCinema(cinemaWithMovies);
    setShowEditModal(true);
  };

  const handleManageMovies = (cinema) => {
    const cinemaWithMovies = {
      ...cinema,
      movies: cinemaMovies[cinema.id] || cinema.movies || [],
      movieIds: cinemaMovies[cinema.id]?.map(movie => movie.id) || cinema.movieIds || []
    };
    setSelectedCinema(cinemaWithMovies);
    setShowMoviesModal(true);
  };

  const handleMoviesUpdated = (updatedMovies) => {
    if (selectedCinema && updatedMovies) {
      const updatedMovieIds = updatedMovies.map(movie => movie.id);

      setCinemaMovies(prev => ({
        ...prev,
        [selectedCinema.id]: updatedMovies
      }));

      // Update movie counts
      setMovieCounts(prev => ({
        ...prev,
        [selectedCinema.id]: updatedMovies.length
      }));

      // Update selectedCinema 
      setSelectedCinema(prev => ({
        ...prev,
        movies: updatedMovies,
        movieIds: updatedMovieIds
      }));

      // Update the cinema card in the main list
      setCinemas(prev => prev.map(cinema =>
        cinema.id === selectedCinema.id
          ? { ...cinema, movies: updatedMovies, movieIds: updatedMovieIds }
          : cinema
      ));
    }
  };

  const formatStatus = (status) => {
    const statusMap = {
      'ACTIVE': 'Active',
      'INACTIVE': 'InActive',
      'MAINTENANCE': 'Maintenance'
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
        <p>{t('Loading cinema list...')}</p>
      </div>
    );
  }

  return (
    <div className={styles.cinemaManagement}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>{t('Cinema Management')}</h2>
          <p>{t('All')}: {filteredCinemas.length} {t('cinemas')}</p>
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
              <option value="">{t('All cities')}</option>
              {cityOptions.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder={t('Search cinemas...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className={styles.addButton}
          >
            <Plus size={18} />
            {t('Add cinema')}
          </button>
          <button
            onClick={fetchCinemas}
            className={styles.refreshButton}
            title={t('Refresh')}
          >
            <RefreshCw size={18} />
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
                <Film size={40} />
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
                  <span>{cinema.totalSeats || 0} {t('seats')}</span>
                </div>
                <div className={styles.statItem}>
                  <Clock size={16} />
                  <span>{cinema.totalRooms || 0} {t('rooms')}</span>
                </div>
                <div className={styles.statItem}>
                  <Star size={16} />
                  <span>{movieCounts[cinema.id] || cinema.movieIds?.length || 0} {t('movies')}</span>
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
                      +{cinema.facilities.length - 3} {t('other')}
                    </span>
                  )}
                </div>
              )}

              <div className={styles.cinemaActions}>
                <button
                  onClick={() => handleViewCinema(cinema)}
                  className={styles.actionButton}
                  title={t('View details')}
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleManageMovies(cinema)}
                  className={styles.actionButton}
                  title={t('Manage movies')}
                >
                  <Film size={18} />
                </button>
                <button
                  onClick={() => handleEditCinema(cinema)}
                  className={styles.actionButton}
                  title={t('Edit')}
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteCinema(cinema.id)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  title={t('Delete')}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCinemas.length === 0 && (
        <div className={styles.emptyState}>
          <MapPin size={64} />
          <h3>{t('No cinemas found')}</h3>
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
