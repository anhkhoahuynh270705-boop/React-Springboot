import React from 'react';
import { Calendar, Clock, MapPin, Users, DollarSign } from 'lucide-react';
import styles from './ShowtimeFormatSelector.module.css';

const ShowtimeFormatSelector = ({ 
  movieId, 
  cinemaId, 
  onFormatSelect, 
  selectedFormat = '2D',
  showtimes = [] 
}) => {
  const formats = [
    { value: '2D', label: '2D - Phụ đề Việt', color: '#3b82f6' },
    { value: '3D', label: '3D - Phụ đề Việt', color: '#10b981' },
    { value: 'IMAX', label: 'IMAX - Phụ đề Việt', color: '#f59e0b' },
    { value: '4DX', label: '4DX - Phụ đề Việt', color: '#ef4444' },
    { value: '2D_EN', label: '2D - Lồng tiếng Anh', color: '#8b5cf6' },
    { value: '3D_EN', label: '3D - Lồng tiếng Anh', color: '#06b6d4' },
    { value: 'IMAX_EN', label: 'IMAX - Lồng tiếng Anh', color: '#f97316' }
  ];

  const getShowtimesByFormat = (format) => {
    return showtimes.filter(showtime => 
      showtime.format === format && 
      showtime.movieId === movieId && 
      showtime.cinemaId === cinemaId
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.formatSelector}>
      <h3>Chọn định dạng và giờ chiếu</h3>
      
      <div className={styles.formatTabs}>
        {formats.map(format => {
          const formatShowtimes = getShowtimesByFormat(format.value);
          const isSelected = selectedFormat === format.value;
          
          return (
            <div key={format.value} className={styles.formatTab}>
              <button
                className={`${styles.formatButton} ${isSelected ? styles.active : ''}`}
                onClick={() => onFormatSelect(format.value)}
                style={{ 
                  borderColor: format.color,
                  backgroundColor: isSelected ? format.color : 'transparent',
                  color: isSelected ? 'white' : format.color
                }}
              >
                <div className={styles.formatLabel}>{format.label}</div>
                <div className={styles.showtimeCount}>
                  {formatShowtimes.length} suất chiếu
                </div>
              </button>
              
              {isSelected && formatShowtimes.length > 0 && (
                <div className={styles.showtimesList}>
                  {formatShowtimes.map((showtime, index) => (
                    <div key={index} className={styles.showtimeItem}>
                      <div className={styles.showtimeInfo}>
                        <div className={styles.timeSlot}>
                          <Clock size={14} />
                          <span>{formatDateTime(showtime.startTime)}</span>
                        </div>
                        <div className={styles.roomInfo}>
                          <MapPin size={14} />
                          <span>{showtime.room}</span>
                        </div>
                        <div className={styles.seatInfo}>
                          <Users size={14} />
                          <span>{showtime.availableSeats}/{showtime.totalSeats}</span>
                        </div>
                        <div className={styles.priceInfo}>
                          <DollarSign size={14} />
                          <span>{formatPrice(showtime.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ShowtimeFormatSelector;
