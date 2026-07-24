import { adminResetPassword } from '../../../../services/userService';
import { Save, X, Key, Eye, EyeOff } from 'lucide-react';
import styles from './EditUserForm.module.css';
import React from 'react';
import { useState, useEffect } from 'react';

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
      newErrors.newPassword = 'New password cannot be empty';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password cannot be empty';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password does not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsPasswordLoading(true);
    try {
      await adminResetPassword(user.id, passwordData.newPassword);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
      setPasswordErrors({});
      alert('Reset password successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
      setPasswordErrors({ submit: 'Error resetting password: ' + error.message });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name cannot be empty';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email cannot be empty';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is not valid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number cannot be empty';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is not valid';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address cannot be empty';
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
            Full name <span className={styles['required']}>*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`${styles['form-input']} ${errors.fullName ? styles['error'] : ''}`}
            placeholder="Enter full name"
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
            placeholder="Enter email"
          />
          {errors.email && <span className={`${styles['error-message']}`}>{errors.email}</span>}
        </div>

        <div className={`${styles['form-group']}`}>
          <label htmlFor="phone" className={`${styles['form-label']}`}>
            Phone number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`${styles['form-input']} ${errors.phone ? styles['error'] : ''}`}
            placeholder="Enter phone number"
          />
          {errors.phone && <span className={`${styles['error-message']}`}>{errors.phone}</span>}
        </div>

        <div className={`${styles['form-group']}`}>
          <label htmlFor="address" className={`${styles['form-label']}`}>
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={`${styles['form-input']} ${errors.address ? styles['error'] : ''}`}
            placeholder="Enter address"
          />
          {errors.address && <span className={`${styles['error-message']}`}>{errors.address}</span>}
        </div>

        <div className={`${styles['form-group']} ${styles['full-width']}`}>
          <label htmlFor="notes" className={`${styles['form-label']}`}>
            Note
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className={`${styles['form-textarea']}`}
            placeholder="Enter notes about the user"
            rows={3}
          />
        </div>

      </div>

      {/* Password Reset Section */}
      <div className={`${styles['password-section']}`}>
        <div className={`${styles['password-section-header']}`}>
          <h4>Reset password</h4>
          <button
            type="button"
            className={`${styles['toggle-password-btn']}`}
            onClick={() => setShowPasswordSection(!showPasswordSection)}
          >

            {showPasswordSection ? 'Hide' : 'Show'} reset password
          </button>
        </div>

        {showPasswordSection && (
          <div className={`${styles['password-form']}`}>
            <div className={`${styles['form-grid']}`}>
              <div className={`${styles['form-group']}`}>
                <label htmlFor="newPassword" className={`${styles['form-label']}`}>
                  New password <span className={styles['required']}>*</span>
                </label>
                <div className={`${styles['password-input-wrapper']}`}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`${styles['form-input']} ${passwordErrors.newPassword ? styles['error'] : ''}`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className={`${styles['password-toggle-btn']}`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <span className={`${styles['error-message']}`}>{passwordErrors.newPassword}</span>
                )}
              </div>

              <div className={`${styles['form-group']}`}>
                <label htmlFor="confirmPassword" className={`${styles['form-label']}`}>
                  Confirm password <span className={styles['required']}>*</span>
                </label>
                <div className={`${styles['password-input-wrapper']}`}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`${styles['form-input']} ${passwordErrors.confirmPassword ? styles['error'] : ''}`}
                    placeholder="Enter confirm password"
                  />
                  <button
                    type="button"
                    className={`${styles['password-toggle-btn']}`}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                type="button"
                className={`${styles['btn']} ${styles['btn-warning']}`}
                disabled={isPasswordLoading}
                onClick={handlePasswordSubmit}
              >
                {isPasswordLoading ? 'Resetting password...' : 'Reset password'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`${styles['form-actions']}`}>
        <button
          type="button"
          className={`${styles['btn']} ${styles['btn-secondary']}`}
          onClick={onCancel}
          disabled={isLoading}
        >

          Cancel
        </button>
        <button
          type="submit"
          className={`${styles['btn']} ${styles['btn-primary']}`}
          disabled={isLoading}
        >

          {isLoading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
};

export default EditUserForm;
