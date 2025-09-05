import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SeatSelectionModal from '../../components/SeatSelectionModal/SeatSelectionModal';
import { getCurrentUser } from '../../services/userService';

const SeatSelectionPage = () => {
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
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!showtime || !movie) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy thông tin suất chiếu</h2>
        <p>Vui lòng quay lại trang trước và thử lại.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Về trang chủ
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="error-container">
        <h2>Vui lòng đăng nhập để đặt vé</h2>
        <p>Bạn cần đăng nhập để có thể đặt vé.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <SeatSelectionModal
      isOpen={true}
      onClose={handleClose}
      showtime={showtime}
      movie={movie}
      userId={user.id}
    />
  );
};

export default SeatSelectionPage;
