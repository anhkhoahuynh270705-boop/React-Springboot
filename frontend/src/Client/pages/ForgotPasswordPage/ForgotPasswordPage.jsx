import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { requestPasswordReset } from '../../../services/userService';
import './ForgotPasswordPage.css';
import { useTranslation } from 'react-i18next';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const result = await requestPasswordReset(email);
      setSuccess(true);
      setMessage(result.message || 'Password reset link has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-form-section">
          <div className="forgot-password-header">
            <h1>{t('Password Recovery')}</h1>
            <p>{t('Enter your email address and we\'ll send you a link to reset your password.')}</p>
          </div>

          {success ? (
            <div className="success-message">
              <Mail size={48} className="success-icon" />
              <h2>{t('Check Your Email')}</h2>
              <p>{message}</p>
              <p className="email-hint">{t('Please check your inbox and spam email.')}</p>
              <button onClick={() => navigate('/login')} className="back-to-login-btn">
                {t('Back to Login')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <Mail size={20} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('Enter your email')}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && <div className="error-message">{error}</div>}
              {message && <div className="info-message">{message}</div>}

              <button type="submit" className="forgot-btn" disabled={loading}>
                {loading ? t('Sending...') : t('Forgot Password')}
              </button>

              <div className="form-footer">
                <p>
                  {t('Remember your password?')} <Link to="/login">{t('Sign in')}</Link>
                </p>
              </div>
            </form>
          )}
        </div>

        <div className="forgot-password-illustration">
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

export default ForgotPasswordPage;

