import React from 'react';
import { X, Edit, Trash2, Calendar, DollarSign, Image, Package } from 'lucide-react';
import './ComboDetails.css';

const ComboDetails = ({ combo, onClose }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Chưa cập nhật';
    
    try {
      let date;
      
      // Handle different date formats from backend
      if (typeof dateValue === 'string') {
        // Handle ISO string format from Spring Boot
        if (dateValue.includes('T')) {
          // ISO format: 2024-01-15T10:30:00
          date = new Date(dateValue);
        } else {
          // Other string formats
          date = new Date(dateValue);
        }
      } else if (dateValue && typeof dateValue === 'object') {
        if (dateValue.year && dateValue.month && dateValue.day) {
          date = new Date(
            dateValue.year,
            dateValue.month - 1, 
            dateValue.day,
            dateValue.hour || 0,
            dateValue.minute || 0,
            dateValue.second || 0
          );
        } else {
          date = new Date(dateValue.toString());
        }
      } else {
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateValue);
        return 'Chưa cập nhật';
      }
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
      return 'Chưa cập nhật';
    }
  };

  return (
    <div className="combo-details-overlay">
      <div className="combo-details-modal">
        <div className="details-header">
          <h2>Chi tiết Combo</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={26} />
          </button>
        </div>

        <div className="details-content">
          <div className="combo-image-section">
            <div className="combo-image">
              <img 
                src={combo.imageUrl || '/api/placeholder/300/200'} 
                alt={combo.name}
                onError={(e) => {
                  e.target.src = '/api/placeholder/300/200';
                }}
              />
            </div>
            <div className="combo-status">
              <span className={`status-badge ${combo.isActive ? 'active' : 'inactive'}`}>
                {combo.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
              </span>
            </div>
          </div>

          <div className="combo-info-section">
            <div className="info-group">
              <h3>{combo.name}</h3>
              <p className="combo-description">{combo.description}</p>
            </div>

            <div className="info-group">
              <div className="info-item">
                <DollarSign size={22} />
                <div>
                  <label>Giá:</label>
                  <span className="price">{formatPrice(combo.price)}</span>
                </div>
              </div>

              <div className="info-item">
                <Package size={22} />
                <div>
                  <label>Món trong combo:</label>
                  <ul className="items-list">
                    {combo.items && combo.items.length > 0 ? (
                      combo.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))
                    ) : (
                      <li>Chưa có món nào</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="info-item">
                <Image size={22} />
                <div>
                  <label>Hình ảnh:</label>
                  <a 
                    href={combo.imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="image-link"
                  >
                    Xem hình ảnh gốc
                  </a>
                </div>
              </div>
            </div>

            <div className="info-group">
              <div className="info-item">
                <Calendar size={22} />
                <div>
                  <label>Ngày tạo:</label>
                  <span>{formatDate(combo.createdAt)}</span>
                </div>
              </div>

              <div className="info-item">
                <Calendar size={22} />
                <div>
                  <label>Cập nhật lần cuối:</label>
                  <span>{formatDate(combo.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="details-actions">
          <button className="close-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComboDetails;
