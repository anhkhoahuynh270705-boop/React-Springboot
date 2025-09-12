import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import './ComboForm.css';

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
      newErrors.name = 'Tên combo là bắt buộc';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả combo là bắt buộc';
    }

    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Giá combo phải là số dương';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'URL hình ảnh là bắt buộc';
    }

    const validItems = formData.items.filter(item => item.trim() !== '');
    if (validItems.length === 0) {
      newErrors.items = 'Phải có ít nhất một món trong combo';
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
          <h2>{combo ? 'Chỉnh sửa Combo' : 'Thêm Combo Mới'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <X size={26} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="combo-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Tên Combo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Nhập tên combo"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="price">Giá (VNĐ) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={errors.price ? 'error' : ''}
                placeholder="Nhập giá combo"
                min="0"
                step="1000"
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="Nhập mô tả combo"
              rows="3"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">URL Hình ảnh *</label>
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
            <label>Món trong combo *</label>
            <div className="items-list">
              {formData.items.map((item, index) => (
                <div key={index} className="item-input">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    placeholder="Nhập tên món"
                    className={errors.items ? 'error' : ''}
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="add-item-btn"
                onClick={addItem}
              >
                <Plus size={18} />
                Thêm món
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
              Combo đang hoạt động
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onCancel}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Đang lưu...' : (combo ? 'Cập nhật' : 'Tạo Combo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComboForm;
