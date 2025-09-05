import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserSync, isAuthenticated } from '../../services/userService';
import UserProfile from '../../components/UserProfile/UserProfile';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/');
      return;
    }
    
    const currentUser = getCurrentUserSync();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, [navigate]);

  const handleCloseProfile = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="error-container">
          <h2>Không tìm thấy thông tin người dùng</h2>
          <p>Vui lòng đăng nhập lại</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <UserProfile onClose={handleCloseProfile} />
    </div>
  );
};

export default ProfilePage;
