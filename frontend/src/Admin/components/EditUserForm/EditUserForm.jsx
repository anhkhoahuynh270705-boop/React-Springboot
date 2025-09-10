import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import styles from './EditUserForm.module.css';

const EditUserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        notes: user.notes || ''
      });
    }
  }, [user]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={`${styles['edit-user-form']}`} onSubmit={handleSubmit}>
      <div className={`${styles['form-grid']}`}>
        <div className={`${styles['form-group']}`}>
          <label htmlFor="fullName" className={`${styles['form-label']}`}>
            Họ tên <span className={styles['required']}>*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`${styles['form-input']} ${errors.fullName ? styles['error'] : ''}`}
            placeholder="Nhập họ tên đầy đủ"
          />
          {errors.fullName && <span className={`${styles['error-message']}`}>{errors.fullName}</span>}
        </div>

        <div className={`${styles['form-group']}`}>
          <label htmlFor="email" className={`${styles['form-label']}`}>
            Email <span className={styles['required']}>*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`${styles['form-input']} ${errors.email ? styles['error'] : ''}`}
            placeholder="Nhập địa chỉ email"
          />
          {errors.email && <span className={`${styles['error-message']}`}>{errors.email}</span>}
        </div>

        <div className={`${styles['form-group']}`}>  
          <label htmlFor="phone" className={`${styles['form-label']}`}>
            Số điện thoại
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`${styles['form-input']} ${errors.phone ? styles['error'] : ''}`}
            placeholder="Nhập số điện thoại"
          />
          {errors.phone && <span className={`${styles['error-message']}`}>{errors.phone}</span>}
        </div>

        <div className={`${styles['form-group']}`}>
          <label htmlFor="address" className={`${styles['form-label']}`}>
            Địa chỉ
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`${styles['form-input']}`} 
            placeholder="Nhập địa chỉ"
          />
        </div>

        <div className={`${styles['form-group']} ${styles['full-width']}`}>
          <label htmlFor="notes" className={`${styles['form-label']}`}>
            Ghi chú
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className={`${styles['form-textarea']}`}
            placeholder="Nhập ghi chú về người dùng"  
            rows={3}
          />
        </div>

      </div>

      <div className={`${styles['form-actions']}`}>
        <button
          type="button"
          className={`${styles['btn']} ${styles['btn-secondary']}`} 
          onClick={onCancel}
          disabled={isLoading}
        >
          <X size={16} />
          Hủy
        </button>
        <button
          type="submit"
          className={`${styles['btn']} ${styles['btn-primary']}`}
          disabled={isLoading}
        >
          <Save size={16} />
          {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
};

export default EditUserForm;
