import React, { useState, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { getActiveCinemas } from '../../../services/cinemaService';
import styles from './CinemaSelector.module.css';

const CinemaSelector = ({ selectedCinemaId, onCinemaChange, disabled = false }) => {
  const [cinemas, setCinemas] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        const data = await getActiveCinemas();
        setCinemas(data);
      } catch (error) {
        console.error('Error fetching cinemas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, []);

  const selectedCinema = cinemas.find(cinema => cinema.id === selectedCinemaId);

  const handleCinemaSelect = (cinema) => {
    onCinemaChange(cinema.id);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={styles.selector}>
        <div className={styles.loadingText}>Đang tải danh sách rạp...</div>
      </div>
    );
  }

  return (
    <div className={styles.selector}>
      <div 
        className={`${styles.selectorButton} ${disabled ? styles.disabled : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className={styles.selectorContent}>
          {selectedCinema ? (
            <>
              <MapPin size={16} />
              <div className={styles.cinemaInfo}>
                <span className={styles.cinemaName}>{selectedCinema.name}</span>
                <span className={styles.cinemaAddress}>{selectedCinema.address}</span>
              </div>
            </>
          ) : (
            <span className={styles.placeholder}>Chọn rạp chiếu</span>
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={`${styles.chevron} ${isOpen ? styles.rotated : ''}`} 
        />
      </div>

      {isOpen && !disabled && (
        <div className={styles.dropdown}>
          {cinemas.length === 0 ? (
            <div className={styles.emptyState}>
              <MapPin size={24} />
              <span>Không có rạp chiếu nào</span>
            </div>
          ) : (
            cinemas.map((cinema) => (
              <div
                key={cinema.id}
                className={`${styles.dropdownItem} ${selectedCinemaId === cinema.id ? styles.selected : ''}`}
                onClick={() => handleCinemaSelect(cinema)}
              >
                <MapPin size={16} />
                <div className={styles.cinemaInfo}>
                  <span className={styles.cinemaName}>{cinema.name}</span>
                  <span className={styles.cinemaAddress}>{cinema.address}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CinemaSelector;
