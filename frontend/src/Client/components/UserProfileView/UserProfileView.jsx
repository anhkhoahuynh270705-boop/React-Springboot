import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { getUserProfileById } from '../../../services/userService';
import { getCachedAvatar } from '../../../services/avatarService';
import { X, User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import './UserProfileView.css';

const UserProfileView = ({ userId, onClose }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError(t('User ID is required'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userData = await getUserProfileById(userId);
        setUser(userData);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message || t('Failed to load user profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, t]);

  const generateInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarUrl = user ? (user.avatarUrl || getCachedAvatar(user.username || user.fullName || '')) : null;
  const displayName = user ? (user.fullName || user.username || t('Unknown User')) : '';
  const initials = generateInitials(displayName);

  if (loading) {
    return (
      <div className="user-profile-view-overlay" onClick={onClose}>
        <div className="user-profile-view-modal" onClick={(e) => e.stopPropagation()}>
          <div className="user-profile-view-loading">
            <div className="loading-spinner"></div>
            <p>{t('Loading user profile...')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-view-overlay" onClick={onClose}>
        <div className="user-profile-view-modal" onClick={(e) => e.stopPropagation()}>
          <div className="user-profile-view-error">
            <p>{error}</p>
            <button onClick={onClose} className="close-btn">{t('Close')}</button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="user-profile-view-overlay" onClick={onClose}>
      <div className="user-profile-view-modal" onClick={(e) => e.stopPropagation()}>
        <button className="user-profile-view-close" onClick={onClose}><X size={16} /></button>

        <div className="user-profile-view-content">
          {/* Avatar Section */}
          <div className="user-profile-view-avatar-section">
            <div className="user-profile-view-avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }} />
              ) : null}
              <div className="user-profile-view-avatar-placeholder" style={{ display: avatarUrl ? 'none' : 'flex' }}>
                {initials}
              </div>
            </div>
            <h2 className="user-profile-view-name">{displayName}</h2>
          </div>

          {/* User Details */}
          <div className="user-profile-view-details">
            <div className="user-profile-view-detail-item">
                <User size={20} className="detail-icon" />
              <div className="detail-content">
                <label>{t('Username')}:</label>
                <span>{user.username || t('Not updated')}</span>
              </div>
            </div>

            {user.fullName && (
              <div className="user-profile-view-detail-item">
                <User size={20} className="detail-icon" />
                <div className="detail-content">
                  <label>{t('Full name')}:</label>
                  <span>{user.fullName}</span>
                </div>
              </div>
            )}

            {user.email && (
              <div className="user-profile-view-detail-item">
                <Mail size={20} className="detail-icon" />
                <div className="detail-content">
                  <label>{t('Email')}:</label>
                  <span>{user.email}</span>
                </div>
              </div>
            )}

            {user.phone && (
              <div className="user-profile-view-detail-item">
                <Phone size={20} className="detail-icon" />
                <div className="detail-content">
                  <label>{t('Phone')}:</label>
                  <span>{user.phone}</span>
                </div>
              </div>
            )}

            {user.address && (
              <div className="user-profile-view-detail-item">
                <MapPin size={20} className="detail-icon" />
                <div className="detail-content">
                  <label>{t('Address')}:</label>
                  <span>{user.address}</span>
                </div>
              </div>
            )}

            {user.createdAt && (
              <div className="user-profile-view-detail-item">
                <Calendar size={20} className="detail-icon" />
                <div className="detail-content">
                  <label>{t('Member since')}:</label>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView;

