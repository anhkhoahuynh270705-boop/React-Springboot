import './ComboDetails.css';

import { X, Edit, Trash2, Calendar, DollarSign, Image, Package } from 'lucide-react';
const ComboDetails = ({ combo, onClose }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateValue) => {
    // Check if dateValue is null, undefined, empty string, or empty array
    if (!dateValue || dateValue === '' || (Array.isArray(dateValue) && dateValue.length === 0)) {
      return 'Not updated ';
    }
    
    try {
      let date;

      if (typeof dateValue === 'string') {
        if (dateValue.includes('T')) {
          date = new Date(dateValue);
        } else if (dateValue.includes('-')) {
          date = new Date(dateValue);
        } else {
          date = new Date(dateValue);
        }
      } else if (dateValue && typeof dateValue === 'object') {
        if (dateValue.year && dateValue.month && dateValue.day) {
          // LocalDateTime object format
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
      } else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      } else {
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateValue);
        return 'Not updated';
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
      return 'Not updated';
    }
  };

  return (
    <div className="combo-details-overlay">
      <div className="combo-details-modal">
        <div className="details-header">
          <h2>Combo Details</h2>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
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
                {combo.isActive ? 'Active' : 'InActive'}
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
                <div>
                  <label>Price:</label>
                  <span className="price">{formatPrice(combo.price)}</span>
                </div>
              </div>

              <div className="info-item">
                <div>
                  <label>Items in the combo:</label>
                  <ul className="items-list">
                    {combo.items && combo.items.length > 0 ? (
                      combo.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))
                    ) : (
                      <li>There are no items yet.</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="info-item">
                <div>
                  <label>Image:</label>
                  <a 
                    href={combo.imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="image-link"
                  >
                    View origin image
                  </a>
                </div>
              </div>
            </div>

            <div className="info-group">
              <div className="info-item">
                <div>
                  <label>Creation date:</label>
                  <span>{formatDate(combo.createdAt)}</span>
                </div>
              </div>

              <div className="info-item">
                <div>
                  <label>Last Update:</label>
                  <span>{formatDate(combo.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="details-actions">
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComboDetails;
