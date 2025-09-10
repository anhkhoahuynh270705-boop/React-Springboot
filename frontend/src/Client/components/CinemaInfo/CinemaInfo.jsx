import React from 'react';
import { MapPin, Star, Phone, Mail, Clock, Wifi, Car, Wheelchair, Coffee } from 'lucide-react';
import styles from './CinemaInfo.module.css';

const CinemaInfo = ({ cinema }) => {
  const amenities = [
    { icon: Wifi, label: 'WiFi miễn phí', color: '#10b981' },
    { icon: Car, label: 'Bãi đỗ xe', color: '#6366f1' },
    { icon: Coffee, label: 'Quán cà phê', color: '#f59e0b' },
  ];

  return (
    <div className={`${styles['cinema-info']}`}> 
      <div className={`${styles['cinema-header']}`}>
        <div className={`${styles['cinema-logo']}`}>
          <img src={cinema.logo || 'https://via.placeholder.com/80x80'} alt={cinema.name} />
        </div>
        <div className={`${styles['cinema-details']}`}>
          <h2 className={`${styles['cinema-name']}`}>{cinema.name}</h2>
          <div className={`${styles['cinema-rating']}`}>
            <Star size={16} fill="#fbbf24" className={`${styles['rating-icon']}`}/> 
            <span>{cinema.rating || '4.5'}/5.0</span>
            <span className={`${styles['rating-count']}`}>({cinema.reviewCount || '120'} đánh giá)</span>
          </div>
          <p className={`${styles['cinema-description']}`}>{cinema.description}</p>
        </div>
      </div>

      <div className={`${styles['cinema-content']}`}>
        <div className={`${styles['cinema-main']}`}>
          <div className={`${styles['info-section']}`}>
            <h3>Thông tin liên hệ</h3>
            <div className={`${styles['info-grid']}`}>
              <div className={`${styles['info-item']}`}>
                <MapPin size={20} className={`${styles['info-icon']}`} />
                <div>
                  <strong>Địa chỉ:</strong>
                  <p>{cinema.address}</p>
                </div>
              </div>
              <div className={`${styles['info-item']}`}>
                <Phone size={20} className={`${styles['info-icon']}`} />
                <div>
                  <strong>Điện thoại:</strong>
                  <p>{cinema.phone}</p>
                </div>
              </div>
              <div className={`${styles['info-item']}`}>
                <Clock size={20} className={`${styles['info-icon']}`} />
                <div>
                  <strong>Giờ mở cửa:</strong>
                  <p>{cinema.hours}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles['info-section']}`}>
            <h3>Tiện ích</h3>
            <div className={`${styles['amenities-grid']}`}>
              {amenities.map((amenity, index) => (
                <div key={index} className={`${styles['amenity-item']}`}>
                  <amenity.icon size={20} style={{ color: amenity.color }} className={`${styles['info-icon']}`} />
                  <span>{amenity.label}</span>
                </div>
              ))}
            </div>
          </div>

          {cinema.promotions && (
            <div className={`${styles['info-section']}`}>
              <h3>Khuyến mãi</h3>
              <div className={`${styles['promotions-list']}`}>
                {cinema.promotions.map((promo, index) => (
                  <div key={index} className={`${styles['promotion-item']}`}>
                    <div className={`${styles['promotion-badge']}`}>HOT</div>
                    <div className={`${styles['promotion-content']}`}>
                      <h4>{promo.title}</h4>
                      <p>{promo.description}</p>
                      <span className={`${styles['promotion-date']}`}>Hạn: {promo.expiryDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={`${styles['cinema-sidebar']}`}>
          <div className={`${styles['quick-actions']}`}>
            <button className={`${styles['action-btn primary']}`}>
              Xem lịch chiếu
            </button>
            <button className={`${styles['action-btn secondary']}`}>
              Đặt vé online
            </button>
            <button className={`${styles['action-btn outline']}`}>
              Chỉ đường
            </button>
          </div>

          <div className={`${styles['cinema-stats']}`}>
            <h4>Thống kê</h4>
            <div className={`${styles['stats-grid']}`}>
              <div className={`${styles['stat-item']}`}>
                <span className={`${styles['stat-number']}`}>{cinema.totalScreens || '8'}</span>
                <span className={`${styles['stat-label']}`}>Phòng chiếu</span>
              </div>
              <div className={`${styles['stat-item']}`}>
                <span className={`${styles['stat-number']}`}>{cinema.totalSeats || '1200'}</span>
                <span className={`${styles['stat-label']}`}>Ghế ngồi</span>
              </div>
              <div className={`${styles['stat-item']}`}>
                <span className={`${styles['stat-number']}`}>{cinema.moviesPerDay || '25'}</span>
                <span className={`${styles['stat-label']}`}>Suất/ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinemaInfo;
