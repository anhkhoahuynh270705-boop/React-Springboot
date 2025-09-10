import React from 'react';
import { MapPin, Star, Phone, Clock } from 'lucide-react';
import styles from './CinemaList.module.css';

const CinemaList = ({ cinemas }) => {
  // Helper functions to get data with fallbacks
  const getCinemaName = (cinema) => {
    return cinema.name || cinema.cinemaName || 'Không có tên';
  };

  const getCinemaLogo = (cinema) => {
    return cinema.logo || cinema.logoUrl || cinema.image || 'https://via.placeholder.com/60x60?text=Logo';
  };

  const getCinemaRating = (cinema) => {
    return cinema.rating || cinema.averageRating || 'N/A';
  };

  const getReviewCount = (cinema) => {
    return cinema.reviewCount || cinema.totalReviews || cinema.reviews || '0';
  };

  const getCinemaAddress = (cinema) => {
    return cinema.address || cinema.location || 'Không có địa chỉ';
  };

  const getCinemaPhone = (cinema) => {
    return cinema.phone || cinema.phoneNumber || cinema.contact || 'Không có số điện thoại';
  };

  const getCinemaHours = (cinema) => {
    return cinema.hours || cinema.openingHours || cinema.schedule || 'Không có giờ mở cửa';
  };

  const getCinemaFeatures = (cinema) => {
    return cinema.features || cinema.amenities || cinema.services || [];
  };

  return (
    <div className={`${styles['cinema-list']}`}> 
      <div className={`${styles['cinema-grid']}`}>
        {cinemas.map((cinema) => (
          <div key={cinema.id} className={`${styles['cinema-card']}`}>
            <div className={`${styles['cinema-card-header']}`}>
              <div className={`${styles['cinema-logo']}`}>
                <img src={getCinemaLogo(cinema)} alt={getCinemaName(cinema)} />
              </div>
              <div className={`${styles['cinema-info']}`}>
                <h3 className={`${styles['cinema-name']}`}>{getCinemaName(cinema)}</h3>
                <div className={`${styles['cinema-rating']}`}>
                  <Star size={16} fill="#fbbf24" className={`${styles['rating-icon']}`}/> 
                  <span>{getCinemaRating(cinema)}</span>
                  <span className={`${styles['rating-count']}`}>({getReviewCount(cinema)} đánh giá)</span>
                </div>
              </div>
            </div>
            
            <div className={`${styles['cinema-card-body']}`}>
              <div className={`${styles['cinema-detail']}`}>
                <MapPin size={16} className={`${styles['detail-icon']}`} />
                <span className={`${styles['detail-text']}`}>{getCinemaAddress(cinema)}</span>
              </div>
              
              <div className={`${styles['cinema-detail']}`}>
                <Phone size={16} className={`${styles['detail-icon']}`} />
                <span className={`${styles['detail-text']}`}>{getCinemaPhone(cinema)}</span>
              </div>
              
              <div className={`${styles['cinema-detail']}`}>
                <Clock size={16} className={`${styles['detail-icon']}`} />
                <span className={`${styles['detail-text']}`}>{getCinemaHours(cinema)}</span>
              </div>
              
              {getCinemaFeatures(cinema).length > 0 && (
                <div className={`${styles['cinema-features']}`}>
                  {getCinemaFeatures(cinema).slice(0, 3).map((feature, index) => (
                    <span key={index} className={`${styles['feature-tag']}`}>
                      {feature}
                    </span>
                  ))}
                  {getCinemaFeatures(cinema).length > 3 && (
                    <span className={`${styles['feature-more']}`}>+{getCinemaFeatures(cinema).length - 3}</span>
                  )}
                </div>
              )}
            </div>
            
            <div className={`${styles['cinema-card-footer']}`}>
              <button className={`${styles['view-schedule-btn']}`}>
                Xem lịch chiếu
              </button>
              <button className={`${styles['book-ticket-btn']}`}>
                Đặt vé
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CinemaList;
