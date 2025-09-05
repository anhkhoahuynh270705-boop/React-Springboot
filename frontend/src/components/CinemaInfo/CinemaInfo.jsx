import React from 'react';
import { MapPin, Star, Phone, Mail, Clock, Wifi, Car, Wheelchair } from 'lucide-react';
import './CinemaInfo.css';

const CinemaInfo = ({ cinema }) => {
  const amenities = [
    { icon: Wifi, label: 'WiFi miễn phí', color: '#10b981' },
    { icon: Car, label: 'Bãi đỗ xe', color: '#6366f1' },
    { icon: Coffee, label: 'Quán cà phê', color: '#f59e0b' },
  ];

  return (
    <div className="cinema-info">
      <div className="cinema-header">
        <div className="cinema-logo">
          <img src={cinema.logo || 'https://via.placeholder.com/80x80'} alt={cinema.name} />
        </div>
        <div className="cinema-details">
          <h2 className="cinema-name">{cinema.name}</h2>
          <div className="cinema-rating">
            <Star size={16} fill="#fbbf24" />
            <span>{cinema.rating || '4.5'}/5.0</span>
            <span className="rating-count">({cinema.reviewCount || '120'} đánh giá)</span>
          </div>
          <p className="cinema-description">{cinema.description}</p>
        </div>
      </div>

      <div className="cinema-content">
        <div className="cinema-main">
          <div className="info-section">
            <h3>Thông tin liên hệ</h3>
            <div className="info-grid">
              <div className="info-item">
                <MapPin size={20} className="info-icon" />
                <div>
                  <strong>Địa chỉ:</strong>
                  <p>{cinema.address}</p>
                </div>
              </div>
              <div className="info-item">
                <Phone size={20} className="info-icon" />
                <div>
                  <strong>Điện thoại:</strong>
                  <p>{cinema.phone}</p>
                </div>
              </div>
              <div className="info-item">
                <Clock size={20} className="info-icon" />
                <div>
                  <strong>Giờ mở cửa:</strong>
                  <p>{cinema.hours}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Tiện ích</h3>
            <div className="amenities-grid">
              {amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  <amenity.icon size={20} style={{ color: amenity.color }} />
                  <span>{amenity.label}</span>
                </div>
              ))}
            </div>
          </div>

          {cinema.promotions && (
            <div className="info-section">
              <h3>Khuyến mãi</h3>
              <div className="promotions-list">
                {cinema.promotions.map((promo, index) => (
                  <div key={index} className="promotion-item">
                    <div className="promotion-badge">HOT</div>
                    <div className="promotion-content">
                      <h4>{promo.title}</h4>
                      <p>{promo.description}</p>
                      <span className="promotion-date">Hạn: {promo.expiryDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="cinema-sidebar">
          <div className="quick-actions">
            <button className="action-btn primary">
              Xem lịch chiếu
            </button>
            <button className="action-btn secondary">
              Đặt vé online
            </button>
            <button className="action-btn outline">
              Chỉ đường
            </button>
          </div>

          <div className="cinema-stats">
            <h4>Thống kê</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{cinema.totalScreens || '8'}</span>
                <span className="stat-label">Phòng chiếu</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{cinema.totalSeats || '1200'}</span>
                <span className="stat-label">Ghế ngồi</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{cinema.moviesPerDay || '25'}</span>
                <span className="stat-label">Suất/ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinemaInfo;
