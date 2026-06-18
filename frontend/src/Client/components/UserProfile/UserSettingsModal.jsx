import { changePassword, getCurrentUserSync } from '../../../services/userService';
import { X, Settings, Camera, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { checkFaceRegistered, deleteFaceDescriptor } from '../../../services/faceService';
import FaceIDRegistration from '../FaceIDRegistration/FaceIDRegistration';
import './UserProfile.css';
import { useTranslation } from 'react-i18next';

const UserSettingsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [faceIDEnabled, setFaceIDEnabled] = useState(false);
  const [loadingFaceID, setLoadingFaceID] = useState(false);
  const [showFaceIDRegistration, setShowFaceIDRegistration] = useState(false);
  const [faceIDError, setFaceIDError] = useState('');
  const [faceIDSuccess, setFaceIDSuccess] = useState('');

  // Check Face ID status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkFaceIDStatus();
    }
  }, [isOpen]);

  const checkFaceIDStatus = async () => {
    try {
      const user = getCurrentUserSync();
      if (user && user.id) {
        const hasFace = await checkFaceRegistered(user.id);
        setFaceIDEnabled(hasFace);
      }
    } catch (error) {
      console.error('Error checking Face ID status:', error);
    }
  };

  const handleFaceIDToggle = async (enabled) => {
    const user = getCurrentUserSync();
    if (!user || !user.id) {
      setFaceIDError('User not found');
      return;
    }

    setLoadingFaceID(true);
    setFaceIDError('');
    setFaceIDSuccess('');

    try {
      if (enabled) {
        setShowFaceIDRegistration(true);
      } else {
        await deleteFaceDescriptor(user.id);
        setFaceIDEnabled(false);
        setFaceIDSuccess(t('Face ID has been successfully disabled'));
        setTimeout(() => setFaceIDSuccess(''), 3000);
      }
    } catch (error) {
      setFaceIDError(error.message || t('An error occurred'));
      setTimeout(() => setFaceIDError(''), 3000);
    } finally {
      setLoadingFaceID(false);
    }
  };

  const handleFaceIDRegistrationSuccess = () => {
    setShowFaceIDRegistration(false);
    setFaceIDEnabled(true);
    setFaceIDSuccess(t('Face ID has been successfully enabled'));
    setTimeout(() => setFaceIDSuccess(''), 3000);
  };

  if (!isOpen) return null;

  // Show Face ID Registration modal
  if (showFaceIDRegistration) {
    const user = getCurrentUserSync();
    return (
      <FaceIDRegistration
        userId={user?.id}
        onSuccess={handleFaceIDRegistrationSuccess}
        onCancel={() => {
          setShowFaceIDRegistration(false);
        }}
      />
    );
  }

  const validate = () => {
    setPwdError('');
    setPwdSuccess('');
    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      setPwdError(t('Please fill in all fields'));
      return false;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdError(t('New password must be at least 6 characters long')); 
      return false;
    }
    if (pwdForm.newPassword === pwdForm.currentPassword) {
      setPwdError(t('New password cannot be the same as the current password'));
      return false;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError(t('Confirm password does not match'));
      return false;
    }
    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  try {
    setChangingPwd(true);
    await changePassword({
      currentPassword: pwdForm.currentPassword,
      newPassword: pwdForm.newPassword
    });
    setPwdSuccess(t('Password changed successfully.'));
    setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  } catch (err) {
    setPwdError(err.message || t('Failed to change password.'));
  } finally {
    setChangingPwd(false);
  }
};

return (
  <div
    className="user-profile popup show"
    onClick={(e) => {
      if (e.target === e.currentTarget && onClose) onClose();
    }}
  >
    <div>
      <div className="profile-header">
        <h2>{t('Account Settings')}</h2>
        <button className="close-btn" onClick={onClose} title={t('Close')}><X size={16} /></button>
      </div>

      <div className="profile-content">
        {/* Face ID Settings */}
        <div className="settings-section">
          <div className="settings-header" style={{ cursor: 'default' }}>
            <div className="settings-title">
                <Camera size={18} />
              <h4>{t('Face ID')}</h4>
            </div>
          </div>
          <div className="settings-content">
            <div className="face-id-settings-card">
              <div className="face-id-toggle-row">
                <div className="face-id-info">
                  <label>{t('Enable/Disable Face ID')}</label>
                  <p className="face-id-description">
                    {faceIDEnabled 
                      ? t('Face ID is enabled. You can login with your face.')
                      : t('Face ID is disabled. Enable it to login faster with your face.')}
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={faceIDEnabled}
                    onChange={(e) => handleFaceIDToggle(e.target.checked)}
                    disabled={loadingFaceID}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {faceIDError && <div className="form-error">{faceIDError}</div>}
              {faceIDSuccess && <div className="form-success">{faceIDSuccess}</div>}
            </div>
          </div>
        </div>

        {/* Change Password Settings */}
        <div className="settings-section">
          <div className="settings-header" style={{ cursor: 'default' }}>
            <div className="settings-title">
                <Settings size={18} />
              <h4>{t('Change Password')}</h4>
            </div>
          </div>
          <div className="settings-content">
            <div className="change-password-card">
              <form className="change-password-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <label className="form-label-with-icon">
                    <Lock size={16} />
                    {t('Current Password')}
                  </label>
                  <input
                    type="password"
                    value={pwdForm.currentPassword}
                    onChange={(e) =>
                      setPwdForm({ ...pwdForm, currentPassword: e.target.value })
                    }
                    placeholder={t('Enter current password')}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label-with-icon">
                    <KeyRound size={16} />
                    {t('New Password')}
                  </label>
                  <input
                    type="password"
                    value={pwdForm.newPassword}
                    onChange={(e) =>
                      setPwdForm({ ...pwdForm, newPassword: e.target.value })
                    }
                    placeholder={t('Enter new password (min. 6 characters)')}
                  />
                </div>
                <div className="form-row">
                  <label className="form-label-with-icon">
                    <ShieldCheck size={16} />
                    {t('Confirm New Password')}
                  </label>
                    <input type="password" value={pwdForm.confirmPassword} onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} placeholder={t('Re-enter new password')} />
                  </div>
                  {pwdError && <div className="form-error">{pwdError}</div>}
                  {pwdSuccess && <div className="form-success">{pwdSuccess}</div>}
                  <div className="form-actions">
                    <button type="submit" className="save-btn" disabled={changingPwd}>{changingPwd ? t('Changing...') : t('Change Password')}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettingsModal;


