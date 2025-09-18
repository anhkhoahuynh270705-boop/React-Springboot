import React from 'react';
import { X, Calendar, Clock, Star, Film, User, Users, Globe, Play, Shield, MapPin } from 'lucide-react';
import styles from './MovieDetailsModal.module.css';

const MovieDetailsModal = ({ movie, onClose }) => {
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
      return 'Chưa cập nhật';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Chưa cập nhật';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours} giờ ${mins} phút` : `${mins} phút`;
  };

  const formatCast = (cast) => {
    if (!cast || !Array.isArray(cast)) return 'Chưa cập nhật';
    return cast.join(', ');
  };

  const formatAgeRating = (ageRating) => {
    if (!ageRating) return 'Chưa cập nhật';
    const ratings = {
      'P': 'P - Mọi lứa tuổi',
      'T13': 'T13 - Trên 13 tuổi',
      'T16': 'T16 - Trên 16 tuổi',
      'T18': 'T18 - Trên 18 tuổi'
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
          <h2>Chi tiết phim</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
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
                <Film size={64} />
                <span>Không có poster</span>
              </div>
            </div>

            {/* Movie Info */}
            <div className={styles.infoSection}>
              <h1 className={styles.movieTitle}>{movie.title || 'Chưa có tên'}</h1>
              {movie.englishTitle && (
                <h2 className={styles.englishTitle}>{movie.englishTitle}</h2>
              )}
              
              {/* Basic Info */}
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <Calendar className={styles.infoIcon} />
                  <div>
                    <span className={styles.infoLabel}>Ngày phát hành</span>
                    <span className={styles.infoValue}>{formatDate(movie.releaseDate)}</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Clock className={styles.infoIcon} />
                  <div>
                    <span className={styles.infoLabel}>Thời lượng</span>
                    <span className={styles.infoValue}>{formatDuration(movie.duration)}</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Star className={styles.infoIcon} />
                  <div>
                    <span className={styles.infoLabel}>Đánh giá</span>
                    <span className={styles.infoValue}>{movie.rating || 'N/A'}</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Globe className={styles.infoIcon} />
                  <div>
                    <span className={styles.infoLabel}>Ngôn ngữ</span>
                    <span className={styles.infoValue}>{movie.language || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Shield className={styles.infoIcon} />
                  <div>
                    <span className={styles.infoLabel}>Giới hạn độ tuổi</span>
                    <span className={styles.infoValue}>{formatAgeRating(movie.ageRating)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {movie.description && (
                <div className={styles.descriptionSection}>
                  <h3>Mô tả</h3>
                  <p className={styles.description}>{movie.description}</p>
                </div>
              )}

              {/* Cast & Crew */}
              <div className={styles.crewSection}>
                <div className={styles.crewItem}>
                  <User className={styles.crewIcon} />
                  <div>
                    <span className={styles.crewLabel}>Đạo diễn</span>
                    <span className={styles.crewValue}>{movie.director || 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div className={styles.crewItem}>
                  <Users className={styles.crewIcon} />
                  <div>
                    <span className={styles.crewLabel}>Diễn viên</span>
                    <span className={styles.crewValue}>{formatCast(movie.cast)}</span>
                  </div>
                </div>
              </div>

              {/* Genre */}
              {movie.genre && (
                <div className={styles.genreSection}>
                  <h3>Thể loại</h3>
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
                    <Play className={styles.trailerIcon} />
                    Xem trailer
                  </a>
                </div>
              )}

              {/* Status */}
              <div className={styles.statusSection}>
                <h3>Trạng thái</h3>
                <span className={`${styles.statusBadge} ${movie.status === 'active' ? styles.active : styles.inactive}`}>
                  {movie.status === 'active' ? 'Đang chiếu' : 'Ngừng chiếu'}
                </span>
              </div>

              {/* Showtimes */}
              {movie.showtimes && movie.showtimes.length > 0 && (
                <div className={styles.showtimesSection}>
                  <h3>Suất chiếu</h3>
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
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsModal;
