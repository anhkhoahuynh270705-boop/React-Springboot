import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is logged in
  React.useEffect(() => {
    const userToken = localStorage.getItem('authToken');
    if (userToken) {
      alert('Vui lòng đăng xuất tài khoản người dùng trước khi truy cập Admin Panel');
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Không thể kết nối đến server. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles['admin-login-container']}`}>
      <div className={`${styles['admin-login-card']}`}>
        <div className={`${styles['admin-login-header']}`}>
          <div className={`${styles['admin-logo']}`}>
            <Lock size={32} />
          </div>
          <h1>Admin Login</h1>
          <p>Đăng nhập vào hệ thống quản trị</p>
        </div>

        <form onSubmit={handleSubmit} className={`${styles['admin-login-form']}`}>
          <div className={`${styles['form-group']}`}>
            <label htmlFor="username">Tên đăng nhập</label>
            <div className={`${styles['input-group']}`}>
              <User size={20} className={`${styles['input-icon']}`} />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>
          </div>

          <div className={`${styles['form-group']}`}>
            <label htmlFor="password">Mật khẩu</label>
            <div className={`${styles['input-group']}`}>
              <Lock size={20} className={`${styles['input-icon']}`} />
              <input 
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                className={`${styles['password-toggle']}`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className={`${styles['error-message']}`}>
              {error}
            </div>
          )}

          <button
            type="submit"
              className={`${styles['admin-login-btn']}`}
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className={`${styles['admin-login-footer']}`}>
          <p>Liên hệ quản trị viên để được cấp tài khoản</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
