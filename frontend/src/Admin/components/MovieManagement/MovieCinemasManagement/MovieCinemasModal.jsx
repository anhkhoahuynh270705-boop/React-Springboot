import { getAllCinemas } from '../../../../services/cinemaService';
import { X, Plus, Search, Building2, Trash2, MapPin } from 'lucide-react';
import React from 'react';
import { useState, useEffect } from 'react';
import { addMovieToCinema, removeMovieFromCinema } from '../../../../services/cinemaService';
import useToast from '../../../hooks/useToast';
import ToastContainer from '../../Toast/ToastContainer';
import styles from './MovieCinemasModal.module.css';
import { useTranslation } from 'react-i18next';

const MovieCinemasModal = ({ movie, onClose, onCinemasUpdated }) => {
  const { t } = useTranslation();

  const [allCinemas, setAllCinemas] = useState([]);
  const [movieCinemas, setMovieCinemas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { showSuccess, toasts, removeToast } = useToast();

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddCinema = async (cinemaId) => {
    try {
      await addMovieToCinema(cinemaId, movie.id);
      setMovieCinemas(prev => [...prev, cinemaId]);
      showSuccess(t('A movie theater has been added.'));
      if (onCinemasUpdated) {
        onCinemasUpdated(movie.id, cinemaId, 'add');
      }
    } catch (error) {
      console.error('Error adding cinema to movie:', error);
    }
  };

  const handleRemoveCinema = async (cinemaId) => {
    try {
      await removeMovieFromCinema(cinemaId, movie.id);
      setMovieCinemas(prev => prev.filter(id => id !== cinemaId));
      showSuccess(t('The movie theater has been removed from the film.'));
      if (onCinemasUpdated) {
        onCinemasUpdated(movie.id, cinemaId, 'remove');
      }
    } catch (error) {
      console.error('Error removing cinema from movie:', error);
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
          <h2>{t('Cinema Management')} - {movie.title}</h2>
          <button onClick={onClose} className={styles.closeButton}><X size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          {/* Search */}
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

          {/* Cinemas List */}
          <div className={styles.cinemasContainer}>
            <div className={styles.cinemasSection}>
              <h3>{t('All cinemas')} ({filteredCinemas.length})</h3>
              <div className={styles.cinemasList}>
                {loading ? (
                  <div className={styles.loading}>{t('Loading...')}</div>
                ) : filteredCinemas.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Building2 size={48} />
                    <p>{t('Not found cinema')}</p>
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
                            title={t('Removed from movie')}
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddCinema(cinema.id)}
                            className={`${styles.actionButton} ${styles.addButton}`}
                            title={t('Add to movie')}
                          >
                            <Plus size={18} />
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
              <h3>{t('This movie theater')} ({movieCinemas.length})</h3>
              <div className={styles.movieCinemasList}>
                {movieCinemas.length === 0 ? (
                  <div className={styles.emptyState}>

                    <p>{t('There are no theaters yet')}.</p>
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
                            title={t('Remove from movie')}
                          >
                            <Trash2 size={18} />
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
            {t("Close")}
          </button>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
};

export default MovieCinemasModal;
