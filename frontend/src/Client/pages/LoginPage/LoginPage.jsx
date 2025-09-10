import React, { useState } from 'react';
import { registerUser, loginUser } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, Mail, Phone, UserCheck, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './LoginPage.module.css';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    phone: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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
      if (isRegister) {
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
        
        // Reset form after successful registration
        setFormData({
          username: '',
          password: '',
          email: '',
          fullName: '',
          phone: '',
          confirmPassword: ''
        });
        
        // Switch to login mode after 2 seconds
        setTimeout(() => {
          setIsRegister(false);
          setMessage({ type: '', text: '' });
        }, 2000);
        
      } else {
        const user = await loginUser({
          username: formData.username,
          password: formData.password
        });
        
        if (user && user.id) {
          if (onLogin) onLogin(user);
          navigate('/');
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

  return (
    <div className={`${styles['auth-container']}`}>
      <div className={`${styles['auth-card']}`}>
        <div className={`${styles['auth-header']}`}>
          <div className={`${styles['auth-logo']}`}>
            <div className={`${styles['logo-icon']}`}>
              {isRegister ? <UserCheck size={32} /> : <LogIn size={32} />}
            </div>
            <h1 className={`${styles['auth-title']}`}>
              {isRegister ? 'Tạo tài khoản mới' : 'Đăng nhập'}
            </h1>
            <p className={`${styles['auth-subtitle']}`}>
              {isRegister 
                ? 'Tham gia cùng chúng tôi để trải nghiệm dịch vụ tốt nhất'
                : 'Chào mừng bạn quay trở lại!'
              }
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`${styles['auth-form']}`}>
          {isRegister && (
            <>
              <div className={`${styles['form-group']}`}>
                <label className={`${styles['form-label']}`}>
                  <User size={16} />
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`${styles['form-input']} ${errors.fullName ? styles['error'] : ''}`}
                  placeholder="Nhập họ và tên đầy đủ"
                />
                {errors.fullName && (
                  <span className={`${styles['error-message']}`}>{errors.fullName}</span>
                )}
              </div>

              <div className={`${styles['form-group']}`}>
                <label className={`${styles['form-label']}`}>
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${styles['form-input']} ${errors.email ? styles['error'] : ''}`}
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <span className={`${styles['error-message']}`}>{errors.email}</span>
                )}
              </div>

              <div className={`${styles['form-group']}`}>
                <label className={`${styles['form-label']}`}>
                  <Phone size={16} />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`${styles['form-input']} ${errors.phone ? styles['error'] : ''}`}
                  placeholder="0123456789"
                />
                {errors.phone && (
                  <span className={`${styles['error-message']}`}>{errors.phone}</span>
                )}
              </div>
            </>
          )}

          <div className={`${styles['form-group']}`}>
            <label className={`${styles['form-label']}`}>
              <User size={16} />
              Tên đăng nhập
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`${styles['form-input']} ${errors.username ? styles['error'] : ''}`}
              placeholder="Nhập tên đăng nhập"
            />
            {errors.username && (
              <span className={`${styles['error-message']}`}>{errors.username}</span>
            )}
          </div>

          <div className={`${styles['form-group']}`}>
            <label className={`${styles['form-label']}`}>
              <Lock size={16} />
              Mật khẩu
            </label>
            <div className={`${styles['password-input']}`}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles['form-input']} ${errors.password ? styles['error'] : ''}`}
                placeholder="Nhập mật khẩu" 
              />
              <button
                type="button"
                className={`${styles['password-toggle']}`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className={`${styles['error-message']}`}>{errors.password}</span>
            )}
          </div>

          {isRegister && (  
            <div className={`${styles['form-group']}`}>
              <label className={`${styles['form-label']}`}>
                <Lock size={16} />
                Xác nhận mật khẩu
              </label>
              <div className={`${styles['password-input']}`}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`${styles['form-input']} ${errors.confirmPassword ? styles['error'] : ''}`}
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  className={`${styles['password-toggle']}`}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={`${styles['error-message']}`}>{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {message.text && (
            <div className={`${styles['message']} ${styles[message.type]}`}>     
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          <button
            type="submit"
            className={`${styles['submit-btn']}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={`${styles['loading-spinner']}`}></div>
            ) : (
              isRegister ? 'Đăng ký' : 'Đăng nhập'
            )}
          </button>
        </form>

        <div className={`${styles['auth-footer']}`}>
          <button
            type="button"
            className={`${styles['toggle-mode-btn']}`}
            onClick={toggleMode}
          >
            {isRegister 
              ? 'Đã có tài khoản? Đăng nhập ngay'
              : 'Chưa có tài khoản? Đăng ký ngay'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
