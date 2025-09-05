import React from 'react';
import { MapPin, Star, Phone, Clock } from 'lucide-react';
import './CinemaList.css';

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
    <div className="cinema-list">
      <div className="cinema-grid">
        {cinemas.map((cinema) => (
          <div key={cinema.id} className="cinema-card">
            <div className="cinema-card-header">
              <div className="cinema-logo">
                <img src={getCinemaLogo(cinema)} alt={getCinemaName(cinema)} />
              </div>
              <div className="cinema-info">
                <h3 className="cinema-name">{getCinemaName(cinema)}</h3>
                <div className="cinema-rating">
                  <Star size={16} fill="#fbbf24" />
                  <span>{getCinemaRating(cinema)}</span>
                  <span className="rating-count">({getReviewCount(cinema)} đánh giá)</span>
                </div>
              </div>
            </div>
            
            <div className="cinema-card-body">
              <div className="cinema-detail">
                <MapPin size={16} className="detail-icon" />
                <span className="detail-text">{getCinemaAddress(cinema)}</span>
              </div>
              
              <div className="cinema-detail">
                <Phone size={16} className="detail-icon" />
                <span className="detail-text">{getCinemaPhone(cinema)}</span>
              </div>
              
              <div className="cinema-detail">
                <Clock size={16} className="detail-icon" />
                <span className="detail-text">{getCinemaHours(cinema)}</span>
              </div>
              
              {getCinemaFeatures(cinema).length > 0 && (
                <div className="cinema-features">
                  {getCinemaFeatures(cinema).slice(0, 3).map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                  {getCinemaFeatures(cinema).length > 3 && (
                    <span className="feature-more">+{getCinemaFeatures(cinema).length - 3}</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="cinema-card-footer">
              <button className="view-schedule-btn">
                Xem lịch chiếu
              </button>
              <button className="book-ticket-btn">
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
