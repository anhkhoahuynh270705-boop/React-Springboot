import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUserSync, generateAvatarForCurrentUser, updateUserProfile, getUserProfile } from '../../services/userService';
import { generateAvatarWithStyle } from '../../services/avatarService';
import { User, Settings, Bell, Crown, Gift, Star, Ticket, Calendar, CreditCard, Award, TrendingUp, Shield, Upload, X } from 'lucide-react';
import './UserProfile.css';

const UserProfile = ({ onClose, isPopup = false, onAvatarChange }) => {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);


  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const fileInputRef = useRef(null);
  const userStats = {
    totalMovies: 47,
    totalTickets: 89,
    memberSince: '2023-01-15',
    points: 1250,
    level: 'Gold',
    nextLevelPoints: 500
  };
  
  const benefits = [
    { icon: Gift, title: 'Giảm giá 10%', description: 'Áp dụng cho tất cả vé phim', color: '#ff6b6b' },
    { icon: Star, title: 'Ưu tiên đặt vé', description: 'Đặt vé trước 24h', color: '#ffd93d' },
    { icon: Ticket, title: 'Vé miễn phí', description: '1 vé miễn phí mỗi tháng', color: '#6bcf7f' },
    { icon: Calendar, title: 'Sự kiện đặc biệt', description: 'Tham gia preview phim', color: '#4d96ff' }
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Handle popup animation
  useEffect(() => {
    if (isPopup) {
      // Add show class after component mounts for animation
      const timer = setTimeout(() => {
        const element = document.querySelector('.user-profile.popup');
        if (element) {
          element.classList.add('show');
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isPopup]);

  const loadUserProfile = async () => {
    try {
      // Thử lấy dữ liệu từ database trước
      const currentUser = await getUserProfile();
      if (currentUser) {
        setUser(currentUser);
        setEditedUser({ ...currentUser });
        setAvatarUrl(currentUser.avatarUrl || generateAvatarForCurrentUser());
        if (currentUser.customAvatar) {
          setUploadedAvatar(currentUser.avatarUrl);
        }
        return;
      }
    } catch (error) {
      console.warn('Failed to load from database, using localStorage:', error);
    }
    
    // Fallback: lấy từ localStorage nếu API thất bại
    const currentUser = getCurrentUserSync();
    if (currentUser) {
      setUser(currentUser);
      setEditedUser({ ...currentUser });
      setAvatarUrl(currentUser.avatarUrl || generateAvatarForCurrentUser());
      if (currentUser.customAvatar) {
        setUploadedAvatar(currentUser.avatarUrl);
      }
    }
  };

  const generateNewAvatar = async () => {
    if (!user?.username) return;
    
    try {
      const newAvatarUrl = generateAvatarWithStyle(user.username, 'personas');
      setAvatarUrl(newAvatarUrl);
      
      // Cập nhật avatar trong localStorage
      const updatedUser = { ...user, avatarUrl: newAvatarUrl, customAvatar: false };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Thông báo cho Header để cập nhật avatar
      if (onAvatarChange) {
        onAvatarChange(newAvatarUrl, updatedUser);
      }
    } catch (error) {
      console.error('Error generating avatar:', error);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh hợp lệ!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file không được vượt quá 5MB!');
      return;
    }

    setIsUploading(true);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setUploadedAvatar(imageUrl);
      setAvatarUrl(imageUrl);
      setIsUploading(false);
      
      // Update user data
      const updatedUser = { ...user, avatarUrl: imageUrl, customAvatar: true };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Notify parent component
      if (onAvatarChange) {
        onAvatarChange(imageUrl, updatedUser);
      }
    };
    
    reader.onerror = () => {
      alert('Lỗi khi đọc file ảnh!');
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeCustomAvatar = () => {
    setUploadedAvatar(null);
    generateNewAvatar();
  };

  const handleClose = () => {
    if (isPopup) {
      // Add closing class for animation
      const element = document.querySelector('.user-profile.popup');
      if (element) {
        element.classList.add('closing');
        element.classList.remove('show');
        setTimeout(() => {
          onClose();
        }, 300);
      }
    } else {
      onClose();
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...user });
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!editedUser) return;
    
    // Validation
    if (!editedUser.username || editedUser.username.trim() === '') {
      alert('Tên đăng nhập không được để trống!');
      return;
    }
    
    if (editedUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.email)) {
      alert('Email không hợp lệ!');
      return;
    }
    
    if (editedUser.phone && !/^[0-9]{10,11}$/.test(editedUser.phone.replace(/\s/g, ''))) {
      alert('Số điện thoại không hợp lệ! (10-11 chữ số)');
      return;
    }
    
    setIsSaving(true);
    try {
      // Chuẩn bị dữ liệu để gửi lên server
      const updateData = {
        username: editedUser.username.trim(),
        fullName: editedUser.fullName?.trim() || '',
        email: editedUser.email?.trim() || '',
        phone: editedUser.phone?.trim() || ''
      };
      
      // Gọi API để cập nhật database
      const updatedUser = await updateUserProfile(updateData);
      
      // Cập nhật state local
      setUser(updatedUser);
      setEditedUser(updatedUser);
      setIsEditing(false);
      
      console.log('User profile saved to database:', updatedUser);
      
      // Hiển thị thông báo thành công
      alert('Cập nhật thông tin thành công!');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Cập nhật thông tin thất bại: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="user-profile">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`user-profile ${isPopup ? 'popup' : ''}`}>
      <div>
        <div className="profile-header">
          <h2>Hồ sơ cá nhân</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="profile-content">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-container">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                className="profile-avatar"
                onError={() => {
                  const fallbackUrl = generateAvatarWithStyle(user.username, 'ui-avatar');
                  setAvatarUrl(fallbackUrl);
                }}
              />
            ) : (
              <div className="avatar-placeholder">
                <User size={60} />
              </div>
            )}
            
            {uploadedAvatar && (
              <div className="avatar-controls">
                <button 
                  className="remove-avatar-btn"
                  onClick={removeCustomAvatar}
                  title="Xóa avatar tùy chỉnh"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="avatar-actions">
            <button 
              className="upload-avatar-btn"
              onClick={handleUploadClick}
              disabled={isUploading}
            >
              <Upload size={16} />
              {isUploading ? 'Đang tải...' : 'Tải ảnh lên'}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* User Info */}
        <div className="user-info">
          <div className="user-badge">
            <h3 className="username">{user.fullName || user.username}</h3>
            <div className="member-badge">
              <Crown size={16} />
              <span>{userStats.level} MEMBER</span>
            </div>
          </div>
          
          <div className="user-details">
            <div className="detail-item">
              <label>Tên đăng nhập:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser?.username || ''}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{user.username}</span>
              )}
            </div>
            
            <div className="detail-item">
              <label>Họ và tên:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser?.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{user.fullName || 'Chưa cập nhật'}</span>
              )}
            </div>
            
            <div className="detail-item">
              <label>Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedUser?.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{user.email || 'Chưa cập nhật'}</span>
              )}
            </div>
            
            <div className="detail-item">
              <label>Số điện thoại:</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedUser?.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{user.phone || 'Chưa cập nhật'}</span>
              )}
            </div>
            
            <div className="detail-item">
              <label>Thành viên từ:</label>
              <span>{new Date(userStats.memberSince).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="user-stats">
          <h4>Thống kê tài khoản</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">
                <Ticket size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{userStats.totalTickets}</span>
                <span className="stat-label">Vé đã mua</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <TrendingUp size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{userStats.totalMovies}</span>
                <span className="stat-label">Phim đã xem</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <Award size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-number">{userStats.points}</span>
                <span className="stat-label">Điểm tích lũy</span>
              </div>
            </div>
          </div>
          
          <div className="level-progress">
            <div className="progress-info">
              <span>Cấp độ tiếp theo: {userStats.nextLevelPoints} điểm</span>
              <span>{userStats.points}/{(userStats.points + userStats.nextLevelPoints)}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(userStats.points / (userStats.points + userStats.nextLevelPoints)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="benefits-section">
          <h4>Ưu đãi thành viên</h4>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon" style={{ backgroundColor: benefit.color }}>
                  <benefit.icon size={20} />
                </div>
                <div className="benefit-content">
                  <h5>{benefit.title}</h5>
                  <p>{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          {!isEditing ? (
            <>
              <button className="action-btn edit" onClick={handleEdit}>
                <Settings size={18} />
                <span>Chỉnh sửa thông tin</span>
              </button>
              
              <button className="action-btn notifications">
                <Bell size={18} />
                <span>Thông báo</span>
                <div className="notification-badge">NEW</div>
              </button>
            </>
          ) : (
            <div className="edit-actions">
              <button 
                className="save-btn" 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              
              <button 
                className="cancel-btn" 
                onClick={handleCancel}
                disabled={isSaving}
              >
                Hủy
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
