import React, { useState, useEffect } from 'react';
import { registerUser, loginUser } from '../../../services/userService';
import { adminLogin } from '../../../services/adminService';
import { Eye, EyeOff, X, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css'; 

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
    confirmPassword: '',
    adminKey: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isRegister, setIsRegister] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        username: '',
        password: '',
        email: '',
        fullName: '',
        phone: '',
        confirmPassword: '',
        adminKey: ''
      });
      setErrors({});
      setMessage({ type: '', text: '' });
      setIsRegister(false);
      setIsAdmin(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (isRegister) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Họ tên là bắt buộc';
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Số điện thoại là bắt buộc';
      } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Số điện thoại không hợp lệ';
      }
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (isRegister && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (isAdmin && !formData.adminKey.trim()) {
      newErrors.adminKey = 'Admin key là bắt buộc';
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
    setMessage({ type: '', text: '' });

    try {
      if (isAdmin) {
        const adminCredentials = {
          username: formData.username,
          password: formData.password,
          adminKey: formData.adminKey
        };
        
        const result = await adminLogin(adminCredentials);
        
        // Xóa thông tin user khỏi localStorage khi đăng nhập admin
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        
        setMessage({
          type: 'success',
          text: 'Đăng nhập admin thành công!'
        });

        setTimeout(() => {
          onClose();
          navigate('/admin/dashboard');
        }, 1000);
      } else if (isRegister) {
        await registerUser({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone
        });
        
        setMessage({
          type: 'success',
          text: 'Đăng ký thành công! Vui lòng đăng nhập.'
        });
        
        setFormData({
          username: '',
          password: '',
          email: '',
          fullName: '',
          phone: '',
          confirmPassword: ''
        });
        
        setTimeout(() => {
          setIsRegister(false);
          setMessage({ type: '', text: '' });
        }, 2000);
        
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        const user = await loginUser({
          username: formData.username,
          password: formData.password
        });
        
        if (user && user.id) {
          if (onLogin) onLogin(user);
          onClose();
        } else {
          setMessage({
            type: 'error',
            text: 'Sai tài khoản hoặc mật khẩu'
          });
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || (isRegister ? 'Đăng ký thất bại! Vui lòng thử lại.' : 'Đăng nhập thất bại! Vui lòng thử lại.')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setFormData({
      username: '',
      password: '',
      email: '',
      fullName: '',
      phone: '',
      confirmPassword: ''
    });
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  const toggleAdmin = () => {
    setIsAdmin(!isAdmin);
    setFormData({
      username: '',
      password: '',
      email: '',
      fullName: '',
      phone: '',
      confirmPassword: '',
      adminKey: ''
    });
    setErrors({});
    setMessage({ type: '', text: '' });
    setIsRegister(false);
  };


  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal-header">
          <h2>{isAdmin ? 'Admin Panel' : 'Tài khoản'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Admin Toggle */}
        <div className="admin-toggle-container">
          <button
            type="button"
            className={`admin-toggle-btn ${isAdmin ? 'active' : ''}`}
            onClick={toggleAdmin}
          >
            <Shield size={16} />
            <span>{isAdmin ? 'Admin Mode' : 'User Mode'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Tài khoản</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="Nhập tên đăng nhập"
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {isRegister && !isAdmin ? (
            <>
              <div className="form-group">
                <label className="form-label">Họ và tên</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  placeholder="Nhập họ và tên đầy đủ"
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="0123456789"
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Nhập lại mật khẩu"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>
            </>
          ) : null}

          {isAdmin && (
            <div className="form-group">
              <label className="form-label">Admin Key</label>
              <div className="password-input">
                <input
                  type={showAdminKey ? 'text' : 'password'}
                  name="adminKey"
                  value={formData.adminKey}
                  onChange={handleInputChange}
                  className={`form-input ${errors.adminKey ? 'error' : ''}`}
                  placeholder="Nhập admin key để đăng nhập"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowAdminKey(!showAdminKey)}
                >
                  {showAdminKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.adminKey && (
                <span className="error-message">{errors.adminKey}</span>
              )}
            </div>
          )}

          {!isRegister && !isAdmin && (
            <div className="forgot-password">
              <a href="#" className="forgot-link">Quên mật khẩu?</a>
            </div>
          )}

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              isRegister ? 'Đăng ký' : 'Đăng nhập'
            )}
          </button>
        </form>

        {!isAdmin && (
          <div className="login-footer">
            <button
              type="button"
              className="toggle-mode-btn"
              onClick={toggleMode}
            >
              {isRegister 
                ? 'Đã có tài khoản? Đăng nhập ngay'
                : 'Chưa có tài khoản? Đăng ký ngay!'
              }
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="admin-info">
            <p className="admin-credentials">
              <strong>Thông tin đăng nhập admin:</strong><br />
              Bạn cần có tài khoản admin và admin key để đăng nhập.<br />
              Tài khoản admin được cấp bởi quản trị viên hệ thống.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
