/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, X, Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { initializeGoogleAuth } from '../../../services/googleAuthService';
import { loginWithGithub } from "../../../services/githubAuthService";
import { adminLogin } from '../../../services/adminService';
import {
  registerUser,
  loginUser,
  applyAvatarMapping,
  loginWithGoogle,
  handleGoogleLoginSuccess
} from '../../../services/userService';
import { checkFaceRegistered } from '../../../services/faceService';
import FaceIDLogin from '../FaceIDLogin/FaceIDLogin';
import FaceIDRegistration from '../FaceIDRegistration/FaceIDRegistration';
import { useHoneypot, HoneypotField, HoneypotUrlField } from '../../../services/useHoneypot';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const { t } = useTranslation();
  const {
    honeypotValue,
    setHoneypotValue,
    honeypotUrl,
    setHoneypotUrl,
    resetTimer,
    validateSubmission
  } = useHoneypot();

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
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);
  const [showFaceIDLogin, setShowFaceIDLogin] = useState(false);
  const [showFaceIDRegistration, setShowFaceIDRegistration] = useState(false);
  const [hasFaceID, setHasFaceID] = useState(false);
  const navigate = useNavigate();

  // Initialize Google Auth when modal opens
  useEffect(() => {
    if (isOpen && !isAdmin) {
      const initGoogleButton = async () => {
        try {
          await initializeGoogleAuth();
          setGoogleButtonRendered(true);
        } catch (error) {
          console.error('Failed to initialize Google Auth:', error);
          setGoogleButtonRendered(false);
        }
      };
      initGoogleButton();
    } else {
      setGoogleButtonRendered(false);
    }
  }, [isOpen, isAdmin]);

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
      resetTimer(); // Reset honeypot timer
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
        newErrors.fullName = t('Full name is required');
      } else if (formData.fullName.trim().length < 2) {
        newErrors.fullName = t('Full name must at least have 2 characters long');
      }

      if (!formData.email.trim()) {
        newErrors.email = t('Email is required');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('Email is not valid');
      }

      if (!formData.phone.trim()) {
        newErrors.phone = t('Phone number is required');
      } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = t('Phone number is not valid');
      }
    }

    if (!formData.username.trim()) {
      newErrors.username = t('Username is required');
    } else if (formData.username.trim().length < 3) {
      newErrors.username = t('Username must be at least 3 characters long');
    }

    if (!formData.password) {
      newErrors.password = t('Password is required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('Password must be at least 6 characters long');
    }

    if (isRegister && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('Confirm password does not match');
    }

    if (isAdmin && !formData.adminKey.trim()) {
      newErrors.adminKey = t('Admin key is required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot validation
    if (!validateSubmission()) {
      console.warn('Honeypot validation failed - possible bot detected');
      setMessage({
        type: 'error',
        text: 'Invalid submission. Please try again.'
      });
      return;
    }

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

        // Delete user info from localStorage when admin logs in
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');

        setMessage({
          type: 'success',
          text: 'Admin login successful!'
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
          text: 'Sign up successful! Please login to your account.'
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
          setMessage({
            type: 'success',
            text: 'Login successful!'
          });

          if (onLogin) onLogin(user);

          // Check if user has Face ID registered (after login success)
          try {
            const hasFace = await checkFaceRegistered(user.id);
            setHasFaceID(hasFace);

            if (!hasFace) {
              const registerFace = window.confirm('Would you like to register Face ID for faster login next time?');
              if (registerFace) {
                setShowFaceIDRegistration(true);
                return;
              }
              // If user declined, close modal and navigate
              setTimeout(() => {
                onClose();
                navigate('/');
              }, 1000);
              return;
            }
          } catch (error) {
            console.warn('Could not check Face ID status:', error);
          }

          setTimeout(() => {
            onClose();
            navigate('/');
          }, 1000);
        } else {
          setMessage({
            type: 'error',
            text: 'Wrong username or password'
          });
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || (isRegister ? 'Sign up failed! Please try again.' : 'Login failed! Please try again.')
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

  const completeGoogleLogin = async (user) => {
    if (!user || !user.id) {
      throw new Error('Google login failed: User not found');
    }

    await handleGoogleLoginSuccess(user);

    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    setMessage({
      type: 'success',
      text: t('googleLoginSuccess')
    });

    if (onLogin) {
      onLogin(user);
    }

    window.dispatchEvent(
      new CustomEvent('authChanged', {
        detail: { user }
      })
    );

    setTimeout(() => {
      onClose();
      navigate('/');
    }, 1000);
  };
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const user = await loginWithGoogle();
      await completeGoogleLogin(user);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || t('googleLoginFailed')
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render Google button when container is ready
  useEffect(() => {
    if (isOpen && !isAdmin && googleButtonRendered) {
      const setupGoogleCallback = () => {
        return new Promise((resolve, reject) => {
          window.googleAuthCallback = { resolve, reject };
        });
      };

      const containerId = 'google-signin-button';
      const container = document.getElementById(containerId);
      if (container && window.google && window.google.accounts) {
        try {
          container.innerHTML = '';

          // Setup callback promise
          const loginPromise = setupGoogleCallback();

          // Handle the promise
          loginPromise
            .then(async (user) => {
              setIsLoading(true);
              try {
                await completeGoogleLogin(user);
              } catch (error) {
                setMessage({
                  type: 'error',
                  text: error.message || t('googleLoginFailed')
                });
              } finally {
                setIsLoading(false);
              }
            })
            .catch((error) => {
              if (error.message !== 'Google Sign-In timeout. Please try again.') {
                setMessage({
                  type: 'error',
                  text: error.message || t('googleLoginFailed')
                });
              }
            });
          const buttonWidth = Math.min(container.offsetWidth || 336, 400);
          // Render button
          window.google.accounts.id.renderButton(
            container,
            {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              width: buttonWidth
            }
          );
        } catch (error) {
          console.error('Error rendering Google button:', error);
          setMessage({
            type: 'error',
            text: 'Failed to load Google Sign-In button'
          });
        }
      }
    }
  }, [isOpen, isAdmin, googleButtonRendered, onLogin, onClose, navigate, t]);

  const handleGithubLogin = () => {
    loginWithGithub();
  };

  // Handle Face ID login success
  const handleFaceIDLoginSuccess = (user) => {
    try {
      const finalUser = applyAvatarMapping({ ...user });

      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');

      if (finalUser?.id) {
        localStorage.setItem('authToken', 'user-token-' + finalUser.id);
        localStorage.setItem('currentUser', JSON.stringify(finalUser));
      }

      if (onLogin) {
        onLogin(finalUser);
      }

      window.dispatchEvent(
        new CustomEvent('authChanged', {
          detail: { user: finalUser }
        })
      );

      window.dispatchEvent(
        new CustomEvent('currentUserChanged', {
          detail: { user: finalUser }
        })
      );

      setShowFaceIDLogin(false);
      onClose();
      navigate('/');
    } catch (error) {
      console.error('Error handling Face ID login:', error);
    }
  };

  // Handle Face ID registration success
  const handleFaceIDRegistrationSuccess = () => {
    setShowFaceIDRegistration(false);
    setHasFaceID(true);
    setMessage({
      type: 'success',
      text: 'Face ID registered successfully! You can use Face ID to login next time.'
    });

    setTimeout(() => {
      onClose();
      navigate('/');
    }, 2000);
  };

  // Check if user has Face ID when username changes
  useEffect(() => {
    const checkUserFaceID = async () => {
      if (formData.username && !isRegister && !isAdmin) {
        try {
          // We need to check after login, not before
        } catch (error) {
          // Ignore
        }
      }
    };
  }, [formData.username, isRegister, isAdmin]);

  if (!isOpen) return null;

  // Show Face ID Login modal
  if (showFaceIDLogin) {
    return (
      <FaceIDLogin
        onSuccess={handleFaceIDLoginSuccess}
        onCancel={() => setShowFaceIDLogin(false)}
        onSwitchToPassword={() => setShowFaceIDLogin(false)}
      />
    );
  }

  // Show Face ID Registration modal
  if (showFaceIDRegistration) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    console.log('Showing Face ID Registration for user:', currentUser);

    if (!currentUser || !currentUser.id) {
      console.error('No user ID found for Face ID registration');
      setMessage({ type: 'error', text: 'User not found. Please login again.' });
      setShowFaceIDRegistration(false);
      return null;
    }

    console.log('Rendering FaceIDRegistration with userId:', currentUser.id);
    return (
      <FaceIDRegistration
        userId={currentUser.id}
        onSuccess={handleFaceIDRegistrationSuccess}
        onCancel={() => {
          setShowFaceIDRegistration(false);
          onClose();
          navigate('/');
        }}
      />
    );
  }

  return (
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal-header">
          <h2>{isAdmin ? 'Admin Panel' : t('User Account')}</h2>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Admin Toggle */}
        <div className="admin-toggle-container">
          <button
            type="button"
            className={`admin-toggle-btn ${isAdmin ? 'active' : ''}`}
            onClick={toggleAdmin}
          >

            <span>{isAdmin ? 'Admin Mode' : 'User Mode'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Honeypot fields */}
          <HoneypotField
            value={honeypotValue}
            onChange={(e) => setHoneypotValue(e.target.value)}
            name="website"
          />
          <HoneypotUrlField
            value={honeypotUrl}
            onChange={(e) => setHoneypotUrl(e.target.value)}
            name="url"
          />

          <div className="form-group">
            <label className="form-label">{t('Username')}</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder={t('Enter username')}
            />
            {errors.username && (
              <span className="message-error">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">{t('Password')}</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder={t('Enter password')}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className="message-error">{errors.password}</span>
            )}
          </div>

          {isRegister && !isAdmin ? (
            <>
              <div className="form-group">
                <label className="form-label">{t('Full name')}</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  placeholder={t('Enter your full name')}
                />
                {errors.fullName && (
                  <span className="message-error">{errors.fullName}</span>
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
                  <span className="message-error">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{t('Phone number')}</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="0123456789"
                />
                {errors.phone && (
                  <span className="message-error">{errors.phone}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">{t('Confirm password')}</label>
                <div className="password-input">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder={t('Re-enter your password')}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="message-error">{errors.confirmPassword}</span>
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
                  placeholder={t('Enter admin key to login')}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowAdminKey(!showAdminKey)}
                >
                  {showAdminKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.adminKey && (
                <span className="message-error">{errors.adminKey}</span>
              )}
            </div>
          )}

          {!isRegister && !isAdmin && (
            <>
              <div className="forgot-password">
                <a href="/forgot-password" className="forgot-link" onClick={(e) => { e.preventDefault(); onClose(); navigate('/forgot-password'); }}>{t('Forgot password')}?</a>
              </div>
              <button
                type="button"
                className="face-id-login-btn"
                onClick={() => setShowFaceIDLogin(true)}
                disabled={isLoading}
              >
                Login with Face ID
              </button>
            </>
          )}

          {message.text && (
            <div className={`message ${message.type}`}>

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
              isRegister ? t('Sign up') : t('Login')
            )}
          </button>
        </form>

        {/* Google Login Button - Only show for user login/register */}
        {!isAdmin && (
          <div className="google-login-container">
            <div className="divider">
              <span className="divider-text">{t('Or')}</span>
            </div>
            {googleButtonRendered && window.google && window.google.accounts ? (
              <div id="google-signin-button" style={{ width: '100%' }}></div>
            ) : (
              <button
                type="button"
                className="google-login-btn"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {t('loginWithGoogle')}
              </button>

            )}
            <button
              type="button"
              className="github-login-btn"
              onClick={handleGithubLogin}
              disabled={isLoading}
            >
              <Github size={20} className="github-icon" />
              {t('loginWithGithub')}
            </button>
          </div>
        )}

        {!isAdmin && (
          <div className="login-footer">
            <button
              type="button"
              className="toggle-mode-btn"
              onClick={toggleMode}
            >
              {isRegister
                ? t("Already have an account? Login now")
                : t("Don't have an account? Sign up now!")
              }
            </button>
          </div>
        )}

        {isAdmin && (
          <div className="admin-info">
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
