/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { resetPassword, verifyResetToken } from '../../../services/userService';
import { useTranslation } from 'react-i18next';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Invalid reset link. Please request a new password reset.');
        setVerifying(false);
        return;
      }

      try {
        const result = await verifyResetToken(token);
        if (result.valid) {
          setTokenValid(true);
        } else {
          setError(result.message || 'This reset link is invalid or has expired.');
        }
      } catch (err) {
        setError('Failed to verify reset link. Please try again.');
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-form-section">
            <div className="verifying-message">
              <div className="spinner"></div>
              <p>Verifying reset link...</p>
            </div>
          </div>
          <div className="reset-password-illustration">
            <div className="illustration-image">
              <img 
                src="https://cdn.moveek.com/bundles/ornweb/img/mascot.png" 
                alt="Mascot illustration" 
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-form-section">
              <Link to="/login" className="back-to-login-link">
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            <div className="error-state">
              <h1>Invalid Reset Link</h1>
              <p>{error || 'This password reset link is invalid or has expired.'}</p>
              <Link to="/forgot-password" className="request-new-link">
                Request a new reset link
              </Link>

            </div>
          </div>
          <div className="reset-password-illustration">
            <div className="illustration-image">
              <img 
                src="https://cdn.moveek.com/bundles/ornweb/img/mascot.png" 
                alt="Mascot illustration" 
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-form-section">
            <div className="success-state">
                <CheckCircle size={64} className="success-icon" />
              <h1>Password Reset Successful!</h1>
              <p>Your password has been successfully reset.</p>
              <p className="redirect-hint">Redirecting to login page...</p>
              <Link to="/login" className="go-to-login-btn">
                Go to Login
              </Link>
            </div>
          </div>
          <div className="reset-password-illustration">
            <div className="illustration-image">
              <img 
                src="https://cdn.moveek.com/bundles/ornweb/img/mascot.png" 
                alt="Mascot illustration" 
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-form-section">
          <div className="reset-password-header">
            <Link to="/login" className="back-link">
                <ArrowLeft size={20} />
              Back to Login
            </Link>
            <h1>Reset Your Password</h1>
            <p>Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('Enter new password (min. 6 characters)')}
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('Confirm new password')}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>

        <div className="reset-password-illustration">
          <div className="illustration-image">
            <img 
              src="https://cdn.moveek.com/bundles/ornweb/img/mascot.png" 
              alt="Mascot illustration" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

