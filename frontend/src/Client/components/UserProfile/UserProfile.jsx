/* eslint-disable no-unused-vars */
import { getBalance } from '../../../services/virtualWalletService';
import { getCurrentUserSync, updateUserProfile, getUserProfile, updateUserAvatar, applyAvatarMapping } from '../../../services/userService';
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import {
  User, Settings, Crown, Star, Ticket, Calendar, CreditCard, Award, TrendingUp,
  Upload, X, Home, Store, Mail, Phone, Hash, MapPin, Newspaper,
  Gift, BarChart3, Sparkles, Check, Save
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UserProfile = ({ onClose, isPopup = false, onAvatarChange, initialOpenSettings = false }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const popupRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const fileInputRef = useRef(null);
  const [userSpending, setUserSpending] = useState({
    totalSpent: 0,
    totalPoints: 0
  });
  const [_walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
  }, [initialOpenSettings]);
  useEffect(() => {
    const onWalletUpdated = (e) => {
      if (e && e.detail && typeof e.detail.balance === 'number') {
        setWalletBalance(e.detail.balance);
      } else {
        setWalletBalance(getBalance());
      }
    };
    window.addEventListener('sandboxWalletUpdated', onWalletUpdated);
    setWalletBalance(getBalance());
    return () => window.removeEventListener('sandboxWalletUpdated', onWalletUpdated);
  }, []);

  const [userStats, setUserStats] = useState({
    totalMovies: 0,
    totalTickets: 0,
    memberSince: null,
    points: 0,
    level: 'Member',
    nextLevelPoints: 500
  });

  const benefits = [
    { key: 'home', title: t('Home'), icon: Home, color: '#3b82f6', ctaHref: '/' },
    { key: 'member', title: t('CINEVERSE Member'), icon: Crown, color: '#8b5cf6', ctaHref: '/membership' },
    { key: 'cinemas', title: t('CINEVERSE Cinemas'), icon: MapPin, color: '#06b6d4', ctaHref: '/cinemas' },
    { key: 'special', title: t('Special Cinemas'), icon: Star, color: '#f59e0b', ctaHref: '/cinemas' },
    { key: 'news', title: t('News & Promotions'), icon: Newspaper, color: '#10b981', ctaHref: '/news' },
    { key: 'tickets', title: t('My Tickets'), icon: Ticket, color: '#ef4444', ctaHref: '/tickets' },
    { key: 'store', title: t('CINEVERSE Store'), icon: Store, color: '#6366f1', ctaHref: '/gift-cards' },
    { key: 'egift', title: t('CINEVERSE eGift'), icon: Gift, color: '#ec4899', isNew: true, ctaHref: '/egift' },
    { key: 'redeem', title: t('Redeem Offers'), icon: Award, color: '#14b8a6', ctaHref: '/rewards' },
  ];

  const getMemberLevel = (points) => {
    if (points >= 50000) return 'Diamond';
    if (points >= 20000) return 'VIP';
    if (points >= 5000) return 'Gold';
    return 'Member';
  };

  const getNextLevelPoints = (points) => {
    if (points < 20000) return 20000 - points;
    if (points < 50000) return 50000 - points;
    return 0;
  };


  useEffect(() => {
    loadUserProfile();

    const reloadProfile = () => {
      loadUserProfile();
    };

    const handleStorageChange = (e) => {
      if (e.key === 'currentUser' || e.key === 'userTickets') {
        reloadProfile();
      }
    };

    const handleUserTicketsUpdated = () => {
      calculateUserSpending(getCurrentUserSync());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userTicketsUpdated', handleUserTicketsUpdated);
    window.addEventListener('currentUserChanged', reloadProfile);
    window.addEventListener('authChanged', reloadProfile);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userTicketsUpdated', handleUserTicketsUpdated);
      window.removeEventListener('currentUserChanged', reloadProfile);
      window.removeEventListener('authChanged', reloadProfile);
    };
  }, []);

  useEffect(() => {
    if (user) {
      calculateUserSpending();
    }
  }, [user]);

  // Changes in userTickets in localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userTickets') {
        calculateUserSpending();
      }
    };

    const handleCustomEvent = (e) => {
      if (e.detail && e.detail.key === 'userTickets') {
        calculateUserSpending();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userTicketsUpdated', handleCustomEvent);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userTicketsUpdated', handleCustomEvent);
    };
  }, []);

  const calculateUserSpending = (currentUserParam = null) => {
    try {
      const currentUser = currentUserParam || getCurrentUserSync();

      if (!currentUser?.id) {
        setUserSpending({
          totalSpent: 0,
          totalPoints: 0
        });

        setUserStats(prev => ({
          ...prev,
          totalTickets: 0,
          points: 0,
          level: 'Member',
          nextLevelPoints: 500
        }));

        return;
      }

      const tickets = JSON.parse(localStorage.getItem('userTickets') || '[]');

      const userTickets = tickets.filter(ticket =>
        String(ticket.userId) === String(currentUser.id)
      );

      const totalSpent = userTickets.reduce((sum, ticket) => {
        return sum + Number(ticket.price || 0);
      }, 0);

      const totalPoints = Math.floor(totalSpent / 1000);

      setUserSpending({
        totalSpent,
        totalPoints
      });

      setUserStats(prev => ({
        ...prev,
        totalTickets: userTickets.length,
        memberSince:
          currentUser.createdAt ||
          currentUser.createdDate ||
          currentUser.memberSince ||
          currentUser.registrationDate ||
          null,
        points: totalPoints,
        level: getMemberLevel(totalPoints),
        nextLevelPoints: getNextLevelPoints(totalPoints)
      }));
    } catch (error) {
      console.error('Error calculating user spending:', error);

      setUserSpending({
        totalSpent: 0,
        totalPoints: 0
      });

      setUserStats(prev => ({
        ...prev,
        totalTickets: 0,
        points: 0,
        level: 'Member',
        nextLevelPoints: 500
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Refresh spending data
  const refreshSpendingData = () => {
    calculateUserSpending();
  };

  // Notify parent (Header) about avatar/user changes with consistent signature
  React.useEffect(() => {
    if (onAvatarChange) {
      onAvatarChange(avatarUrl, user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarUrl, user]);

  // Handle popup animation
  useEffect(() => {
    if (isPopup && popupRef.current) {
      const timer = setTimeout(() => {
        if (popupRef.current) {
          popupRef.current.classList.add('show');
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
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    } else {
      if (onClose) onClose();
    }
  };

  const loadUserProfile = async () => {
    const rawCurrentUser = getCurrentUserSync();
    const currentUser = rawCurrentUser ? applyAvatarMapping({ ...rawCurrentUser }) : null;

    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      setUser(currentUser);
      setEditedUser({ ...currentUser });
      calculateUserSpending(currentUser);

      if (
        currentUser.avatarUrl &&
        (
          currentUser.avatarUrl.startsWith('data:') ||
          currentUser.avatarUrl.startsWith('http') ||
          currentUser.avatarUrl.startsWith('blob:')
        )
      ) {
        setAvatarUrl(currentUser.avatarUrl);
        setUploadedAvatar(currentUser.avatarUrl);
      } else {
        const displayName = currentUser.fullName || currentUser.username || 'User';
        const words = displayName.trim().split(/\s+/);
        const initials =
          words.length >= 2
            ? (words[0][0] + words[1][0]).toUpperCase()
            : displayName.substring(0, 2).toUpperCase();

        setAvatarUrl(initials);
        setUploadedAvatar(null);
      }

      return;
    }

    try {
      const userFromApi = await getUserProfile();

      if (userFromApi) {
        const mappedUser = applyAvatarMapping({ ...userFromApi });

        localStorage.setItem('currentUser', JSON.stringify(mappedUser));

        setUser(mappedUser);
        setEditedUser({ ...mappedUser });

        if (
          mappedUser.avatarUrl &&
          (
            mappedUser.avatarUrl.startsWith('data:') ||
            mappedUser.avatarUrl.startsWith('http') ||
            mappedUser.avatarUrl.startsWith('blob:')
          )
        ) {
          setAvatarUrl(mappedUser.avatarUrl);
          setUploadedAvatar(mappedUser.avatarUrl);
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

      // Update localStorage
      const updatedUser = { ...user, avatarUrl: initials, customAvatar: false };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Notify parent component
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
      alert(t('Please select a valid image file!'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('File size must not exceed 5MB!'));
      return;
    }

    setIsUploading(true);

    // Create preview URL and persist to backend
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target.result;
      setUploadedAvatar(imageUrl);
      setAvatarUrl(imageUrl);
      try {
        const updatedUser = await updateUserAvatar(imageUrl);
        setUser(updatedUser);
        if (onAvatarChange) {
          onAvatarChange(updatedUser.avatarUrl, updatedUser);
        }
      } catch (err) {
        alert(t('Failed to save avatar. It may not persist after logout.'));
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      alert(t('Error reading image file!'));
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeCustomAvatar = async () => {
    try {
      await updateUserAvatar(null);
    } catch (err) {
      alert(t('Failed to clear avatar on server.'));
    }
    setUploadedAvatar(null);

    const generateInitials = (name) => {
      if (!name) return 'U';
      const displayName = user?.fullName || user?.username || '';
      const words = displayName.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return displayName ? displayName.substring(0, 2).toUpperCase() : 'U';
    };
    const initials = generateInitials(user?.fullName || user?.username);
    setAvatarUrl(initials);

    const updatedUser = { ...user, avatarUrl: initials, customAvatar: false };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);

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
      alert(t('Username cannot be empty!'));
      return;
    }

    if (editedUser.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedUser.email)) {
      alert(t('Invalid email address!'));
      return;
    }

    if (editedUser.phone && !/^[0-9]{10,11}$/.test(editedUser.phone.replace(/\s/g, ''))) {
      alert(t('Invalid phone number! (10–11 digits)'));
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

      // Update profile via service
      const updatedUser = await updateUserProfile(updateData);

      // Update localStorage
      setUser(updatedUser);
      setEditedUser(updatedUser);
      setIsEditing(false);
      alert(t('Profile updated successfully!'));

    } catch (error) {
      alert(t('Failed to update profile: ') + error.message);
    } finally {
      setIsSaving(false);
    }
  };
  const maxLevelPoints = userStats.points + userStats.nextLevelPoints;
  const progressPercent =
    maxLevelPoints > 0
      ? (userStats.points / maxLevelPoints) * 100
      : 100;

  if (!user) {
    return (
      <div className="user-profile">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>{t('Loading profile information...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={popupRef}
      className={`user-profile ${isPopup ? 'popup' : ''}`}
      onClick={isPopup ? (e) => {
        if (e.target === e.currentTarget) {
          handleCloseClick();
        }
      } : undefined}
    >
      <div>
        <div className="profile-header">
          <h2 className="profile-header-title">
            <User size={22} />
            {t('Personal profile')}
          </h2>
          <button className="exit-btn" onClick={handleCloseClick} title={t('Close')}><X size={20} /></button>
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
                    title={t("Remove custom avatar")}
                  ><X size={20} /></button>
                </div>
              )}
            </div>

            <div className="avatar-actions">
              <button
                className="upload-avatar-btn"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                <Upload size={18} />
                {isUploading ? t('Loading...') : t('Upload image')}
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
                <div className="detail-item-left">
                  <Hash size={16} className="detail-icon" />
                  <label>{t('Username:')}</label>
                </div>
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
                <div className="detail-item-left">
                  <User size={16} className="detail-icon" />
                  <label>{t('Full name:')}</label>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedUser?.fullName || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{user.fullName || t('Not updated')}</span>
                )}
              </div>

              <div className="detail-item">
                <div className="detail-item-left">
                  <Mail size={16} className="detail-icon" />
                  <label>Email:</label>
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedUser?.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{user.email || t('Not updated')}</span>
                )}
              </div>

              <div className="detail-item">
                <div className="detail-item-left">
                  <Phone size={16} className="detail-icon" />
                  <label>{t('Phone number:')}</label>
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedUser?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{user.phone || t('Not updated')}</span>
                )}
              </div>

              <div className="detail-item">
                <div className="detail-item-left">
                  <Calendar size={16} className="detail-icon" />
                  <label>{t('Member since:')}</label>
                </div>
                <span>
                  {userStats.memberSince
                    ? new Date(userStats.memberSince).toLocaleDateString('vi-VN')
                    : t('Not updated')}
                </span>
              </div>
            </div>
          </div>

          {/* User Stats */}
          <div className="user-stats">
            <h4 className="section-title-with-icon">
              <BarChart3 size={18} />
              {t('Account statistics')}
            </h4>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon"><CreditCard size={16} /></div>
                <div className="stat-info">
                  <span className="stat-label">{t('Total Spending 2025')}</span>
                  <span className="stat-number">{formatCurrency(userSpending.totalSpent)}</span>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon stat-icon-points"><Award size={16} /></div>
                <div className="stat-info">
                  <span className="stat-label">{t('Reward Points')}</span>
                  <span className="stat-number">{userSpending.totalPoints}</span>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-icon stat-icon-tickets"><Ticket size={16} /></div>
                <div className="stat-info">
                  <span className="stat-label">{t('My Tickets')}</span>
                  <span className="stat-number">{userStats.totalTickets}</span>
                </div>
              </div>
            </div>

            <div className="level-progress">
              <div className="progress-info">
                <span className="progress-label">
                  <TrendingUp size={14} />
                  {t('Next level: {{points}} points', { points: userStats.nextLevelPoints })}
                </span>
                <span>{userStats.points}/{maxLevelPoints}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  data-width={`${progressPercent}%`}
                ></div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="benefits-section">
            <h4 className="section-title-with-icon">
              <Sparkles size={18} />
              {t('Member benefits')}
            </h4>
            <div className="benefits-grid">
              {benefits.map((benefit, index) => {
                const BenefitIcon = benefit.icon;
                return (
                  <a
                    key={benefit.key || index}
                    className="benefit-card"
                    href={benefit.ctaHref}
                    onClick={() => { if (isPopup && onClose) onClose(); }}
                  >
                    <div className="benefit-icon-container">
                      <div
                        className="benefit-icon"
                        style={{ backgroundColor: benefit.color }}
                      >
                        {BenefitIcon && <BenefitIcon size={22} color="#fff" strokeWidth={2} />}
                      </div>
                      {benefit.isNew && (
                        <div className="new-badge">NEW</div>
                      )}
                    </div>
                    <div className="benefit-content">
                      <h5>{benefit.title}</h5>
                    </div>
                  </a>
                );
              })}
            </div>

          </div>



          {/* Action Buttons */}
          <div className="profile-actions">
            {!isEditing ? (
              <>
                <button className="action-btn edit-profile" onClick={handleEdit}>
                  <Settings size={18} />
                  <span>{t('Edit profile')}</span>
                </button>

              </>
            ) : (
              <div className="edit-actions">
                <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save size={16} />
                  {isSaving ? t('Saving...') : t('Save changes')}
                </button>

                <button
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X size={16} />
                  {t('Cancel')}
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
