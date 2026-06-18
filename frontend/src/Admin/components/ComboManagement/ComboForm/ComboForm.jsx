import './ComboForm.css';

import { X, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { useState, useEffect } from 'react';
const ComboForm = ({ combo, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    items: [''],
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (combo) {
      setFormData({
        name: combo.name || '',
        description: combo.description || '',
        price: combo.price?.toString() || '',
        imageUrl: combo.imageUrl || '',
        items: combo.items && combo.items.length > 0 ? [...combo.items] : [''],
        isActive: combo.isActive !== undefined ? combo.isActive : true
      });
    }
  }, [combo]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleItemChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, '']
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Combo name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Combo describe is required';
    }

    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Combo price must be a positive number';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'image URL is required';
    }

    const validItems = formData.items.filter(item => item.trim() !== '');
    if (validItems.length === 0) {
      newErrors.items = 'The combo must include at least one item.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        items: formData.items.filter(item => item.trim() !== '')
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="combo-form-overlay">
      <div className="combo-form-modal">
        <div className="form-header">
          <h2>{combo ? 'Edit Combo' : 'Add new combo'}</h2>
          <button className="close-btn" onClick={onCancel}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="combo-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Combo name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Type combo name"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="price">Price (VNĐ) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={errors.price ? 'error' : ''}
                placeholder="Input combo price"
                min="0"
                step="1000"
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="Type combo description"
              rows="3"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl"> Image URL *</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className={errors.imageUrl ? 'error' : ''}
              placeholder="https://example.com/image.jpg"
            />
            {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
            {formData.imageUrl && (
              <div className="image-preview">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Item in Combo *</label>
            <div className="items-list">
              {formData.items.map((item, index) => (
                <div key={index} className="item-input">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    placeholder="Type item name in combo"
                    className={errors.items ? 'error' : ''}
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-item-btn"
                onClick={addItem}
              >
                <Plus size={16} />
                Add items
              </button>
            </div>
            {errors.items && <span className="error-text">{errors.items}</span>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Active Combo
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="submit-btn"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (combo ? 'Update Combo' : 'Create Combo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComboForm;
