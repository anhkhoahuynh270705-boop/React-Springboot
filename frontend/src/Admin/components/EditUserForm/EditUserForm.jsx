import React, { useState, useEffect } from 'react';
import { Save, X, Key, Eye, EyeOff } from 'lucide-react';
import { adminResetPassword } from '../../../services/userService';
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
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear password error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = 'Mật khẩu mới không được để trống';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setIsPasswordLoading(true);
    try {
      await adminResetPassword(user.id, passwordData.newPassword);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
      setPasswordErrors({});
      // You might want to show a success message here
      alert('Đặt lại mật khẩu thành công!');
    } catch (error) {
      console.error('Error resetting password:', error);
      setPasswordErrors({ submit: 'Lỗi khi đặt lại mật khẩu: ' + error.message });
    } finally {
      setIsPasswordLoading(false);
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

      {/* Password Reset Section */}
      <div className={`${styles['password-section']}`}>
        <div className={`${styles['password-section-header']}`}>
          <h4>Đổi mật khẩu</h4>
          <button
            type="button"
            className={`${styles['toggle-password-btn']}`}
            onClick={() => setShowPasswordSection(!showPasswordSection)}
          >
            <Key size={16} />
            {showPasswordSection ? 'Ẩn' : 'Hiện'} đổi mật khẩu
          </button>
        </div>

        {showPasswordSection && (
          <form onSubmit={handlePasswordSubmit} className={`${styles['password-form']}`}>
            <div className={`${styles['form-grid']}`}>
              <div className={`${styles['form-group']}`}>
                <label htmlFor="newPassword" className={`${styles['form-label']}`}>
                  Mật khẩu mới <span className={styles['required']}>*</span>
                </label>
                <div className={`${styles['password-input-wrapper']}`}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`${styles['form-input']} ${passwordErrors.newPassword ? styles['error'] : ''}`}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    className={`${styles['password-toggle-btn']}`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <span className={`${styles['error-message']}`}>{passwordErrors.newPassword}</span>
                )}
              </div>

              <div className={`${styles['form-group']}`}>
                <label htmlFor="confirmPassword" className={`${styles['form-label']}`}>
                  Xác nhận mật khẩu <span className={styles['required']}>*</span>
                </label>
                <div className={`${styles['password-input-wrapper']}`}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`${styles['form-input']} ${passwordErrors.confirmPassword ? styles['error'] : ''}`}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    className={`${styles['password-toggle-btn']}`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <span className={`${styles['error-message']}`}>{passwordErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            {passwordErrors.submit && (
              <div className={`${styles['error-message']} ${styles['submit-error']}`}>
                {passwordErrors.submit}
              </div>
            )}

            <div className={`${styles['password-actions']}`}>
              <button
                type="submit"
                className={`${styles['btn']} ${styles['btn-warning']}`}
                disabled={isPasswordLoading}
              >
                <Key size={16} />
                {isPasswordLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </button>
            </div>
          </form>
        )}
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
