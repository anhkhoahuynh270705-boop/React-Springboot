import { getAllCombosAdmin, createCombo, updateCombo, deleteCombo } from '../../../../services/comboService';
import { Plus, Edit, Trash2, Eye, Search, Filter, RefreshCw, Package } from 'lucide-react';
import React from 'react';
import { useState, useEffect } from 'react';
import ComboForm from '../ComboForm/ComboForm';
import ComboDetails from '../ComboDetail/ComboDetails';
import useToast from '../../../hooks/useToast';
import ToastContainer from '../../Toast/ToastContainer';
import './ComboManagement.css';

const ComboManagement = () => {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toasts, showSuccess, removeToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);
      const combosData = await getAllCombosAdmin();
      setCombos(combosData);
    } catch (error) {
      console.error('Error fetching combos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    try {
      await deleteCombo(comboId);
      setCombos(combos.filter(combo => combo.id !== comboId));
      showSuccess('Delete combo successfully!');
    } catch (error) {
      console.error('Error deleting combo:', error);
    }
  };

  const handleFormSubmit = async (comboData) => {
    try {
      if (editingCombo) {
        const updatedCombo = await updateCombo(editingCombo.id, comboData);
        setCombos(combos.map(combo =>
          combo.id === editingCombo.id ? updatedCombo : combo
        ));
        showSuccess('Update Combo Successfully!');
      } else {
        const newCombo = await createCombo(comboData);
        setCombos([...combos, newCombo]);
        showSuccess('Create combo successfully!');
      }
      setShowForm(false);
      setEditingCombo(null);
    } catch (error) {
      console.error('Error saving combo:', error);
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
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase();
  };

  const containsSearchQuery = (text, query) => {
    if (!text || !query) return false;

    const normalizedText = removeVietnameseDiacritics(text);
    const normalizedQuery = removeVietnameseDiacritics(query);

    return normalizedText.includes(normalizedQuery);
  };

  // Filter and search combos
  const filteredCombos = combos.filter(combo => {
    const matchesSearch = searchTerm === '' ||
      containsSearchQuery(combo.name, searchTerm) ||
      containsSearchQuery(combo.description, searchTerm);

    // Check filter status
    if (filterActive === 'active') {
      return matchesSearch && combo.isActive === true;
    } else if (filterActive === 'inactive') {
      return matchesSearch && combo.isActive === false;
    }

    // Show all if no filter selected
    return matchesSearch;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateValue) => {
    if (!dateValue || dateValue === '' || (Array.isArray(dateValue) && dateValue.length === 0)) {
      return 'Not Updated';
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
        return 'Not Updated';
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
      return 'Not Updated';
    }
  };

  if (loading) {
    return (
      <div className="combo-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading list Combo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="combo-management">
      <div className="action-buttons-top">
        <button
          className="create-btn"
          onClick={handleCreateCombo}
        >
          <Plus size={18} />
          Add combo
        </button>
        <button
          className={`refresh-btn${refreshing ? ' refreshing' : ''}`}
          onClick={fetchCombos}
          title="Refresh"
          disabled={refreshing}
        >
          <RefreshCw size={18} className="refresh-icon" />
        </button>
      </div>
      <div className="combo-filters">
        <div className="search-box">
          <Search size={22} />
          <input
            type="text"
            placeholder="Search combo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterActive === 'all' ? 'active' : ''}`}
            onClick={() => setFilterActive('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filterActive === 'active' ? 'active' : ''}`}
            onClick={() => setFilterActive('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filterActive === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterActive('inactive')}
          >
            InActive
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchCombos} className="retry-btn">
            Try again
          </button>
        </div>
      )}

      <div className="combo-list">
        {combos.length === 0 ? (
          <div className="no-combos">
            <p>No combos available.</p>
          </div>
        ) : filteredCombos.length === 0 ? (
          <div className="no-combos">
            <p>No combinations matching.</p>
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
                          <li>+{combo.items.length - 3} Order Item</li>
                        )}
                      </ul>
                    )}
                  </div>
                  <div className="combo-status">
                    <span className={`status-badge ${combo.isActive ? 'active' : 'inactive'}`}>
                      {combo.isActive ? 'Active' : 'InActive'}
                    </span>
                  </div>
                  <div className="combo-dates">
                    <small>Create: {formatDate(combo.createdAt)}</small>
                    <small>Update: {formatDate(combo.updatedAt)}</small>
                  </div>
                </div>

                <div className="combo-actions">
                  <button
                    className="action-btn view-btn"
                    onClick={() => handleViewCombo(combo)}
                    title="View Detail"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditCombo(combo)}
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="action-btn btn-delete"
                    onClick={() => handleDeleteCombo(combo.id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
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

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default ComboManagement;
