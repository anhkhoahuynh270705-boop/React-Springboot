/* eslint-disable no-unused-vars */
import styles from './MovieDetailsModal.module.css';
import { X, Calendar, Clock, Star, Film, User, Users, Globe, Play, Shield, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MovieDetailsModal = ({ movie, onClose }) => {
  const { t } = useTranslation(); 

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Not updated';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return t('Not updated');
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} hours ${mins} minutes` : `${mins} minutes`;
  };

  const formatCast = (cast) => {
    if (!cast || !Array.isArray(cast)) return 'Not updated';
    return cast.join(', ');
  };

  const formatAgeRating = (ageRating) => {
    if (!ageRating) return 'Not updated';
    const ratings = {
      'P': 'P - All ages',
      'T13': 'T13 - Over 13 years old',
      'T16': 'T16 - Over 16 years old',
      'T18': 'T18 - Over 18 years old'
    };
    return ratings[ageRating] || ageRating;
  };

  const formatShowtimeDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{t('Film detail')}</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.movieDetails}>
            {/* Poster */}
            <div className={styles.posterSection}>
              {(movie.posterUrl || movie.imageUrl || movie.poster || movie.image) ? (
                <img 
                  src={movie.posterUrl || movie.imageUrl || movie.poster || movie.image} 
                  alt={movie.title}
                  className={styles.poster}
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
                className={styles.placeholderPoster}
                style={{ display: (movie.posterUrl || movie.imageUrl || movie.poster || movie.image) ? 'none' : 'flex' }}
              >
                <span>{t('No posters')}</span>
              </div>
            </div>

            {/* Movie Info */}
            <div className={styles.infoSection}>
              <h1 className={styles.movieTitle}>{movie.title || t('No name')}</h1>
              {movie.englishTitle && (
                <h2 className={styles.englishTitle}>{movie.englishTitle}</h2>
              )}
              
              {/* Basic Info */}
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <div>
                    <span className={styles.infoLabel}>{t('Release date')}</span>
                    <span className={styles.infoValue}>{formatDate(movie.releaseDate)}</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div>
                    <span className={styles.infoLabel}>T{t('Duration')}</span>
                    <span className={styles.infoValue}>{formatDuration(movie.duration)}</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div>
                    <span className={styles.infoLabel}>{t('Rate')}</span>
                    <span className={styles.infoValue}>{movie.rating || 'N/A'}</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div>
                    <span className={styles.infoLabel}>{t('language')}</span>
                    <span className={styles.infoValue}>{movie.language || 'No updated'}</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div>
                    <span className={styles.infoLabel}>{t('Age limited')}</span>
                    <span className={styles.infoValue}>{formatAgeRating(movie.ageRating)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {movie.description && (
                <div className={styles.descriptionSection}>
                  <h3>{t('Describe')}</h3>
                  <p className={styles.description}>{movie.description}</p>
                </div>
              )}

              {/* Cast & Crew */}
              <div className={styles.crewSection}>
                <div className={styles.crewItem}>
                  <div>
                    <span className={styles.crewLabel}>{t('Director')}</span>
                    <span className={styles.crewValue}>{movie.director || 'No updated'}</span>
                  </div>
                </div>

                <div className={styles.crewItem}>
                  <div>
                    <span className={styles.crewLabel}>{t('Actor')}</span>
                    <span className={styles.crewValue}>{formatCast(movie.cast)}</span>
                  </div>
                </div>
              </div>

              {/* Genre */}
              {movie.genre && (
                <div className={styles.genreSection}>
                  <h3>{t('Genre')}</h3>
                  <div className={styles.genreTags}>
                    {movie.genre.split(',').map((genre, index) => (
                      <span key={index} className={styles.genreTag}>
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Trailer */}
              {movie.trailerUrl && (
                <div className={styles.trailerSection}>
                  <h3>Trailer</h3>
                  <a 
                    href={movie.trailerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.trailerLink}
                  >
                    {t('Watch trailer')}
                  </a>
                </div>
              )}

              {/* Status */}
              <div className={styles.statusSection}>
                <h3>Trạng thái</h3>
                <span className={`${styles.statusBadge} ${movie.status === 'active' ? styles.active : styles.inactive}`}>
                  {movie.status === 'active' ? t('nowShowing') : t('stopShowing')}
                </span>
              </div>

              {/* Showtimes */}
              {movie.showtimes && movie.showtimes.length > 0 && (
                <div className={styles.showtimesSection}>
                  <h3>{t('Showtime')}</h3>
                  <div className={styles.showtimesList}>
                    {movie.showtimes.map((showtime, index) => (
                      <div key={showtime.id || index} className={styles.showtimeItem}>
                        <div className={styles.showtimeIcon}>
                          <MapPin size={20} />
                          </div>
                        <div className={styles.showtimeInfo}>
                          <div className={styles.cinemaName}>{showtime.cinemaName}</div>
                          <div className={styles.showtimeDateTime}>
                            {formatShowtimeDate(showtime.date)} - {showtime.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
              
        <div className={styles.modalFooter}>
          <button className={styles.closeButton} onClick={onClose}>
            {t('Close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal;
