import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUserSync, generateAvatarForCurrentUser, updateUserProfile, getUserProfile } from '../../../services/userService';
import { generateAvatarWithStyle } from '../../../services/avatarService';
import { User, Settings, Bell, Crown, Gift, Star, Ticket, Calendar, CreditCard, Award, TrendingUp, Shield, Upload, X } from 'lucide-react';
import './UserProfile.css';

const UserProfile = ({ onClose, isPopup = false, onAvatarChange }) => {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const popupRef = useRef(null);

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
    if (isPopup && popupRef.current) {
      console.log('Adding show class to popup element');
      console.log('Element classes before:', popupRef.current.className);
      const timer = setTimeout(() => {
        if (popupRef.current) {
          popupRef.current.classList.add('show');
          // Also update inline style for background
          popupRef.current.style.background = 'rgba(0, 0, 0, 0.7)';
          popupRef.current.style.backdropFilter = 'blur(5px)';
          popupRef.current.style.WebkitBackdropFilter = 'blur(5px)';
          console.log('Element classes after:', popupRef.current.className);
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [isPopup]);

  // Handle closing animation
  const handleClose = () => {
    if (popupRef.current) {
      popupRef.current.classList.add('closing');
      popupRef.current.classList.remove('show');
      // Reset inline style
      popupRef.current.style.background = 'rgba(0, 0, 0, 0)';
      popupRef.current.style.backdropFilter = 'blur(0px)';
      popupRef.current.style.WebkitBackdropFilter = 'blur(0px)';
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    } else {
      if (onClose) onClose();
    }
  };

  const loadUserProfile = async () => {
    const currentUser = getCurrentUserSync();
    if (currentUser) {
      setUser(currentUser);
      setEditedUser({ ...currentUser });
      
      console.log('Loading from localStorage - avatarUrl:', currentUser.avatarUrl, 'customAvatar:', currentUser.customAvatar);
      
      // Kiểm tra nếu có custom avatar
      if (currentUser.customAvatar && currentUser.avatarUrl) {
        setAvatarUrl(currentUser.avatarUrl);
        setUploadedAvatar(currentUser.avatarUrl);
        console.log('Using custom avatar from localStorage:', currentUser.avatarUrl);
      } else if (currentUser.avatarUrl && (currentUser.avatarUrl.startsWith('data:') || currentUser.avatarUrl.startsWith('http'))) {
        setAvatarUrl(currentUser.avatarUrl);
        setUploadedAvatar(currentUser.avatarUrl);
        console.log('Using custom avatar (fallback) from localStorage:', currentUser.avatarUrl);
      } else {
        // Tạo initials giống Header
        const generateInitials = (name) => {
          if (!name) return 'U';
          const displayName = currentUser.fullName || currentUser.username;
          const words = displayName.trim().split(/\s+/);
          if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
          } else {
            return displayName.substring(0, 2).toUpperCase();
          }
        };
        const initials = generateInitials(currentUser.fullName || currentUser.username);
        setAvatarUrl(initials);
        setUploadedAvatar(null);
        console.log('Using initials from localStorage:', initials);
      }
      return;
    }

    try {
      const currentUser = await getUserProfile();
      if (currentUser) {
        setUser(currentUser);
        setEditedUser({ ...currentUser });

        if (currentUser.customAvatar && currentUser.avatarUrl) {
          setAvatarUrl(currentUser.avatarUrl);
          setUploadedAvatar(currentUser.avatarUrl);
          console.log('Using custom avatar from database:', currentUser.avatarUrl);
        } else if (currentUser.avatarUrl && (currentUser.avatarUrl.startsWith('data:') || currentUser.avatarUrl.startsWith('http'))) {
          setAvatarUrl(currentUser.avatarUrl);
          setUploadedAvatar(currentUser.avatarUrl);
        } else {
          const generateInitials = (name) => {
            if (!name) return 'U';
            const displayName = currentUser.fullName || currentUser.username;
            const words = displayName.trim().split(/\s+/);
            if (words.length >= 2) {
              return (words[0][0] + words[1][0]).toUpperCase();
            } else {
              return displayName.substring(0, 2).toUpperCase();
            }
          };
          const initials = generateInitials(currentUser.fullName || currentUser.username);
          setAvatarUrl(initials);
          setUploadedAvatar(null);
        }
      }
    } catch (error) {
      console.warn('Failed to load from database:', error);
    }
  };

  const generateNewAvatar = async () => {
    if (!user?.username) return;
    
    try {
      const generateInitials = (name) => {
        if (!name) return 'U';
        const displayName = user.fullName || user.username;
        const words = displayName.trim().split(/\s+/);
        if (words.length >= 2) {
          return (words[0][0] + words[1][0]).toUpperCase();
        } else {
          return displayName.substring(0, 2).toUpperCase();
        }
      };
      const initials = generateInitials(user.fullName || user.username);
      setAvatarUrl(initials);
      setUploadedAvatar(null);
      
      // Cập nhật avatar trong localStorage
      const updatedUser = { ...user, avatarUrl: initials, customAvatar: false };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Thông báo cho Header để cập nhật avatar
      if (onAvatarChange) {
        onAvatarChange(initials, updatedUser);
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
    
    // Tạo initials giống Header
    const generateInitials = (name) => {
      if (!name) return 'U';
      const displayName = user.fullName || user.username;
      const words = displayName.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      } else {
        return displayName.substring(0, 2).toUpperCase();
      }
    };
    const initials = generateInitials(user.fullName || user.username);
    setAvatarUrl(initials);
    
    // Cập nhật localStorage
    const updatedUser = { ...user, avatarUrl: initials, customAvatar: false };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // Thông báo cho Header
    if (onAvatarChange) {
      onAvatarChange(initials, updatedUser);
    }
  };

  const handleCloseClick = () => {
    if (isPopup) {
      if (popupRef.current) {
        popupRef.current.classList.add('closing');
        popupRef.current.classList.remove('show');
        setTimeout(() => {
          if (onClose) onClose();
        }, 300);
      }
    } else {
      if (onClose) onClose();
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
      alert('Cập nhật thông tin thành công!');
      
    } catch (error) {
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
    <div 
      ref={popupRef}
      className={`user-profile ${isPopup ? 'popup' : ''}`} 
      style={isPopup ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        transition: 'background-color 0.3s ease-out, backdrop-filter 0.3s ease-out',
        backdropFilter: 'blur(0px)',
        WebkitBackdropFilter: 'blur(0px)'
      } : {}}
      onClick={isPopup ? (e) => {
        if (e.target === e.currentTarget) {
          handleCloseClick();
        }
      } : undefined}
    >
      <div>
        <div className="profile-header">
          <h2>Hồ sơ cá nhân</h2>
          <button className="close-btn" onClick={handleCloseClick} title="Đóng">
            <X size={20} />
          </button>
        </div>

        <div className="profile-content">
        <div className="avatar-section">
          <div className="avatar-container">
            {avatarUrl ? (
              avatarUrl.startsWith('data:') || avatarUrl.startsWith('http') ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="profile-avatar"
                  onError={() => {
                    const generateInitials = (name) => {
                      if (!name) return 'U';
                      const displayName = user.fullName || user.username;
                      const words = displayName.trim().split(/\s+/);
                      if (words.length >= 2) {
                        return (words[0][0] + words[1][0]).toUpperCase();
                      } else {
                        return displayName.substring(0, 2).toUpperCase();
                      }
                    };
                    const initials = generateInitials(user.fullName || user.username);
                    setAvatarUrl(initials);
                  }}
                />
              ) : (
                <div className="profile-avatar-initials">
                  {avatarUrl}
                </div>
              )
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
              <span>{`Cấp độ tiếp theo: ${userStats.nextLevelPoints} điểm`}</span> 
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
