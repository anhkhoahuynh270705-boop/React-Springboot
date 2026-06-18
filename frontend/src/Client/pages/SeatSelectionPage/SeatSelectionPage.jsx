import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SeatSelectionModal from '../../components/SeatSelectionModal/SeatSelectionModal';
import { getCurrentUser } from '../../../services/userService';
import { useTranslation } from 'react-i18next';
import './SeatSelectionPage.css';

const SeatSelectionPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showtime, movie } = location.state || {};

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleClose = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('Loading...')}</p>
      </div>
    );
  }

  if (!showtime || !movie) {
    return (
      <div className="error-container">
        <h2>{t('Showtime not found')}</h2>
        <p>{t('Please go back and try again.')}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          {t('Back to Home')}
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <h2>{t('Please login to book tickets')}</h2>
        <p>{t('You need to be logged in to book tickets.')}</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          {t('Back to Home')}
        </button>
      </div>
    );
  }

  return (
    <div className="seat-selection-page">
      <SeatSelectionModal
        isOpen={true}
        onClose={handleClose}
        showtime={showtime}
        movie={movie}
        userId={user.id}
      />
    </div>
  );
};

export default SeatSelectionPage;
