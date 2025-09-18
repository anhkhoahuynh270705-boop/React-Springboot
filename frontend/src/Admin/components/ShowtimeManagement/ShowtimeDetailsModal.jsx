import React from 'react';
import { X, Calendar, Clock, MapPin, Users, DollarSign, Film, Building2, Ticket } from 'lucide-react';
import { formatTimeForDisplay, formatDateForDisplay } from '../../../services/showtimeService';
import styles from './ShowtimeDetailsModal.module.css';

const ShowtimeDetailsModal = ({ showtime, onClose }) => {
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
      return '#ef4444'; 
    } else if (showtime.availableSeats === 0) {
      return '#f59e0b'; 
    } else {
      return '#10b981'; 
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

  const getOccupancyPercentage = () => {
    if (showtime.totalSeats === 0) return 0;
    return Math.round(((showtime.totalSeats - showtime.availableSeats) / showtime.totalSeats) * 100);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Chi tiết suất chiếu</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Status Badge */}
          <div className={styles.statusSection}>
            <div 
              className={styles.statusBadge}
              style={{ backgroundColor: getStatusColor(showtime) }}
            >
              {getStatusText(showtime)}
            </div>
          </div>

          {/* Movie Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Film size={20} />
              Thông tin phim
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tên phim:</span>
                <span className={styles.infoValue}>{showtime.movieName}</span>
              </div>
            </div>
          </div>

          {/* Cinema Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Building2 size={20} />
              Thông tin rạp chiếu
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tên rạp:</span>
                <span className={styles.infoValue}>{showtime.cinemaName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Địa chỉ:</span>
                <span className={styles.infoValue}>{showtime.cinemaAddress}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Phòng chiếu:</span>
                <span className={styles.infoValue}>{showtime.room}</span>
              </div>
            </div>
          </div>

          {/* Showtime Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Clock size={20} />
              Thông tin suất chiếu
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Ngày chiếu:</span>
                <span className={styles.infoValue}>{formatDateForDisplay(showtime.startTime)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Giờ chiếu:</span>
                <span className={styles.infoValue}>{formatTimeForDisplay(showtime.startTime)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Giá vé:</span>
                <span className={styles.infoValue}>{formatPrice(showtime.price)}</span>
              </div>
            </div>
          </div>

          {/* Seating Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Users size={20} />
              Thông tin ghế ngồi
            </h3>
            <div className={styles.seatingInfo}>
              <div className={styles.seatStats}>
                <div className={styles.seatStat}>
                  <span className={styles.seatNumber}>{showtime.totalSeats}</span>
                  <span className={styles.seatLabel}>Tổng ghế</span>
                </div>
                <div className={styles.seatStat}>
                  <span className={styles.seatNumber}>{showtime.availableSeats}</span>
                  <span className={styles.seatLabel}>Còn trống</span>
                </div>
                <div className={styles.seatStat}>
                  <span className={styles.seatNumber}>{showtime.totalSeats - showtime.availableSeats}</span>
                  <span className={styles.seatLabel}>Đã bán</span>
                </div>
              </div>
              
              {/* Occupancy Bar */}
              <div className={styles.occupancyBar}>
                <div className={styles.occupancyLabel}>
                  Tỷ lệ lấp đầy: {getOccupancyPercentage()}%
                </div>
                <div className={styles.occupancyProgress}>
                  <div 
                    className={styles.occupancyFill}
                    style={{ 
                      width: `${getOccupancyPercentage()}%`,
                      backgroundColor: getOccupancyPercentage() > 80 ? '#ef4444' : 
                                     getOccupancyPercentage() > 50 ? '#f59e0b' : '#10b981'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Ticket size={20} />
              Thông tin bổ sung
            </h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ID Suất chiếu:</span>
                <span className={styles.infoValue}>{showtime.id}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ID Phim:</span>
                <span className={styles.infoValue}>{showtime.movieId}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ID Rạp chiếu:</span>
                <span className={styles.infoValue}>{showtime.cinemaId}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeModalButton}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeDetailsModal;
