import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { getAllCombos, createCombo, updateCombo, deleteCombo } from '../../../services/comboService';
import ComboForm from './ComboForm';
import ComboDetails from './ComboDetails';
import './ComboManagement.css';

const ComboManagement = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      setError(null);
      const combosData = await getAllCombos();
      setCombos(combosData);
    } catch (error) {
      console.error('Error fetching combos:', error);
      setError('Không thể tải danh sách combo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCombo = () => {
    setEditingCombo(null);
    setShowForm(true);
  };

  const handleEditCombo = (combo) => {
    setEditingCombo(combo);
    setShowForm(true);
  };

  const handleViewCombo = (combo) => {
    setSelectedCombo(combo);
    setShowDetails(true);
  };

  const handleDeleteCombo = async (comboId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa combo này?')) {
      try {
        await deleteCombo(comboId);
        setCombos(combos.filter(combo => combo.id !== comboId));
      } catch (error) {
        console.error('Error deleting combo:', error);
        alert('Không thể xóa combo. Vui lòng thử lại.');
      }
    }
  };

  const handleFormSubmit = async (comboData) => {
    try {
      if (editingCombo) {
        // Update existing combo
        const updatedCombo = await updateCombo(editingCombo.id, comboData);
        setCombos(combos.map(combo => 
          combo.id === editingCombo.id ? updatedCombo : combo
        ));
      } else {
        // Create new combo
        const newCombo = await createCombo(comboData);
        setCombos([...combos, newCombo]);
      }
      setShowForm(false);
      setEditingCombo(null);
    } catch (error) {
      console.error('Error saving combo:', error);
      alert('Không thể lưu combo. Vui lòng thử lại.');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCombo(null);
  };

  const handleDetailsClose = () => {
    setShowDetails(false);
    setSelectedCombo(null);
  };

  // Function to remove Vietnamese diacritics for search
  const removeVietnameseDiacritics = (str) => {
    if (!str) return '';
    
    return str
      .normalize('NFD') // Decompose characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Handle đ/Đ specifically
      .toLowerCase();
  };

  // Function to check if text contains search query (case-insensitive, diacritic-insensitive)
  const containsSearchQuery = (text, query) => {
    if (!text || !query) return false;
    
    const normalizedText = removeVietnameseDiacritics(text);
    const normalizedQuery = removeVietnameseDiacritics(query);
    
    return normalizedText.includes(normalizedQuery);
  };

  // Filter and search combos
  const filteredCombos = combos.filter(combo => {
    const matchesSearch = containsSearchQuery(combo.name, searchTerm) ||
                         containsSearchQuery(combo.description, searchTerm);
    
    if (filterActive === 'active') {
      return matchesSearch && combo.isActive;
    } else if (filterActive === 'inactive') {
      return matchesSearch && !combo.isActive;
    }
    
    return matchesSearch;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    
    try {
      let date;
      
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
          // Try to parse as ISO string
          date = new Date(dateValue.toString());
        }
      } else {
        // Fallback
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value:', dateValue);
        return '';
      }
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateValue);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="combo-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách combo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="combo-management">
      <div className="combo-header">
        <h1>Quản lý Combo</h1>
         <button 
           className="create-btn"
           onClick={handleCreateCombo}
         >
           <Plus size={22} />
           Thêm Combo
         </button>
      </div>

      <div className="combo-filters">
         <div className="search-box">
           <Search size={22} />
           <input
             type="text"
             placeholder="Tìm kiếm combo..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
        
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterActive === 'all' ? 'active' : ''}`}
            onClick={() => setFilterActive('all')}
          >
            Tất cả
          </button>
          <button
            className={`filter-btn ${filterActive === 'active' ? 'active' : ''}`}
            onClick={() => setFilterActive('active')}
          >
            Đang hoạt động
          </button>
          <button
            className={`filter-btn ${filterActive === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterActive('inactive')}
          >
            Không hoạt động
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchCombos} className="retry-btn">
            Thử lại
          </button>
        </div>
      )}

      <div className="combo-list">
        {filteredCombos.length === 0 ? (
          <div className="no-combos">
            <p>Không tìm thấy combo nào</p>
          </div>
        ) : (
          <div className="combo-grid">
            {filteredCombos.map(combo => (
              <div key={combo.id} className="combo-card">
                <div className="combo-image">
                  <img 
                    src={combo.imageUrl || '/api/placeholder/200/150'} 
                    alt={combo.name}
                    onError={(e) => {
                      e.target.src = '/api/placeholder/200/150';
                    }}
                  />
                </div>
                
                <div className="combo-info">
                  <h3>{combo.name}</h3>
                  <p className="combo-description">{combo.description}</p>
                  <div className="combo-price">{formatPrice(combo.price)}</div>
                  <div className="combo-items">
                    {combo.items && combo.items.length > 0 && (
                      <ul>
                        {combo.items.slice(0, 3).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                        {combo.items.length > 3 && (
                          <li>+{combo.items.length - 3} món khác</li>
                        )}
                      </ul>
                    )}
                  </div>
                  <div className="combo-status">
                    <span className={`status-badge ${combo.isActive ? 'active' : 'inactive'}`}>
                      {combo.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                  <div className="combo-dates">
                    <small>Tạo: {formatDate(combo.createdAt)}</small>
                    <small>Cập nhật: {formatDate(combo.updatedAt)}</small>
                  </div>
                </div>

                <div className="combo-actions">
                   <button
                     className="action-btn view-btn"
                     onClick={() => handleViewCombo(combo)}
                     title="Xem chi tiết"
                   >
                     <Eye size={20} />
                   </button>
                   <button
                     className="action-btn edit-btn"
                     onClick={() => handleEditCombo(combo)}
                     title="Chỉnh sửa"
                   >
                     <Edit size={20} />
                   </button>
                   <button
                     className="action-btn delete-btn"
                     onClick={() => handleDeleteCombo(combo.id)}
                     title="Xóa"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ComboForm
          combo={editingCombo}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {showDetails && selectedCombo && (
        <ComboDetails
          combo={selectedCombo}
          onClose={handleDetailsClose}
        />
      )}
    </div>
  );
};

export default ComboManagement;
