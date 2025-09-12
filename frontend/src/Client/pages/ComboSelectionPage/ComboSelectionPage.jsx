import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, CreditCard, CheckCircle } from 'lucide-react';
import { bookTicket } from '../../../services/ticketService';
import { getAllCombos } from '../../../services/comboService';
import './ComboSelectionPage.css';

const ComboSelectionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [user, setUser] = useState(null);
  
  const [selectedCombos, setSelectedCombos] = useState({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data from location state or URL params
  useEffect(() => {
    if (location.state) {
      setShowtime(location.state.showtime);
      setMovie(location.state.movie);
      setSelectedSeats(location.state.selectedSeats || []);
      setUser(location.state.user);
    } else {
      // Try to load from URL params (for SeatSelectionModal)
      try {
        const showtimeParam = searchParams.get('showtime');
        const movieParam = searchParams.get('movie');
        const seatsParam = searchParams.get('seats');
        const userParam = searchParams.get('user');
        
        if (showtimeParam) setShowtime(JSON.parse(decodeURIComponent(showtimeParam)));
        if (movieParam) setMovie(JSON.parse(decodeURIComponent(movieParam)));
        if (seatsParam) setSelectedSeats(JSON.parse(decodeURIComponent(seatsParam)));
        if (userParam) setUser(JSON.parse(decodeURIComponent(userParam)));
      } catch (error) {
        console.error('Error parsing URL params:', error);
      }
    }
  }, [location.state, searchParams]);

  // Load combos from API
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setLoading(true);
        setError(null);
        const combosData = await getAllCombos();
        setCombos(combosData);
      } catch (error) {
        console.error('Error fetching combos:', error);
        setError('Không thể tải danh sách combo. Vui lòng thử lại.');
        setCombos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);


  const handleComboQuantityChange = (comboId, change) => {
    setSelectedCombos(prev => {
      const currentQuantity = prev[comboId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      if (newQuantity === 0) {
        const { [comboId]: removed, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [comboId]: newQuantity
      };
    });
  };

  const getTotalComboPrice = () => {
    return Object.entries(selectedCombos).reduce((total, [comboId, quantity]) => {
      const combo = combos.find(c => c.id === comboId);
      return total + (combo ? combo.price * quantity : 0);
    }, 0);
  };

  const getTicketPrice = () => {
    return (showtime?.price || 100000) * selectedSeats?.length || 0;
  };

  const getTotalPrice = () => {
    return getTicketPrice() + getTotalComboPrice();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleBooking = async () => {
    if (!user) {
      setMessage('Vui lòng đăng nhập để đặt vé');
      return;
    }

    if (!selectedPaymentMethod) {
      setMessage('Vui lòng chọn phương thức thanh toán');
      return;
    }

    if (!showtime?.id) {
      setMessage('Thông tin suất chiếu không hợp lệ');
      return;
    }

    if (!movie?.id) {
      setMessage('Thông tin phim không hợp lệ');
      return;
    }

    if (!selectedSeats || selectedSeats.length === 0) {
      setMessage('Vui lòng chọn ghế ngồi');
      return;
    }

    try {
      setBooking(true);
      setMessage('');
      
      // Tạo dữ liệu vé với combo
      const seatNumbers = selectedSeats?.map(seat => seat.seatNumber).join(', ') || '';
      const seatIds = selectedSeats?.map(seat => seat.id).join(', ') || '';
      const totalPrice = getTotalPrice();
      const comboPrice = getTotalComboPrice();

      let showDate, showTime;
      
      if (showtime?.startTime) {
        const startDateTime = new Date(showtime.startTime);
        showDate = startDateTime.toISOString().split('T')[0]; 
        showTime = startDateTime.toISOString(); 
      } else {
        showDate = showtime?.showDate || new Date().toISOString().split('T')[0];
        showTime = showtime?.time || showtime?.showTime || new Date().toISOString();
      }

      const ticketData = {
        userId: user?.id || '',
        showtimeId: showtime?.id || '',
        seatId: seatIds || '', 
        seatNumber: seatNumbers || '', 
        movieId: movie?.id || '',
        movieTitle: movie?.title || movie?.name || 'Tên phim không xác định',
        moviePoster: movie?.posterUrl || movie?.poster || movie?.imageUrl || movie?.image || '/default-movie.jpg',
        movieThumbnail: movie?.thumbnailUrl || movie?.thumbnail || movie?.posterUrl || movie?.poster || '/default-movie.jpg',
        cinemaName: showtime?.cinemaName || 'Rạp chiếu phim',
        cinemaAddress: showtime?.cinemaAddress || showtime?.address || '',
        showDate: showDate || new Date().toISOString().split('T')[0],
        showTime: showTime || new Date().toISOString(),
        price: parseFloat(totalPrice) || 0,
        status: 'pending',
        paymentMethod: selectedPaymentMethod || 'cash', 
        paymentStatus: selectedPaymentMethod === 'cash' ? 'pending' : 'paid',
        isRefundable: true,
        notes: Object.keys(selectedCombos).length > 0 ? `Combo: ${Object.entries(selectedCombos).map(([comboId, quantity]) => {
          const combo = combos.find(c => c.id === comboId);
          return combo ? `${combo.name} x${quantity}` : '';
        }).filter(Boolean).join(', ')}` : 'Không có combo'
      };

      console.log('Sending ticket data:', ticketData);

      // Validate required fields
      if (!ticketData.userId) {
        throw new Error('User ID is required');
      }
      if (!ticketData.showtimeId) {
        throw new Error('Showtime ID is required');
      }
      if (!ticketData.movieId) {
        throw new Error('Movie ID is required');
      }
      if (!ticketData.seatNumber) {
        throw new Error('Seat number is required');
      }

      // Gọi bookTicket
      await bookTicket(ticketData);
      
      setMessage('Đặt vé thành công!');
      
      // Chuyển đến trang thành công hoặc trang vé
      setTimeout(() => {
        navigate('/tickets');
      }, 2000);
      
    } catch (error) {
      console.error('Error booking tickets:', error);
      setMessage('Đặt vé thất bại. Vui lòng thử lại.');
    } finally {
      setBooking(false);
    }
  };

  if (!showtime || !movie || !selectedSeats) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy thông tin đặt vé</h2>
        <p>Vui lòng quay lại trang trước và thử lại.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Về trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="combo-selection-page">
      <div className="combo-header">
        <button 
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <h1>Chọn Combo Bắp Nước</h1>
      </div>

      <div className="combo-content">
        <div className="combo-selection">
          <h2>Combo có sẵn</h2>
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Đang tải danh sách combo...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                Thử lại
              </button>
            </div>
          ) : combos.length === 0 ? (
            <div className="no-combos-message">
              <p>Hiện tại chưa có combo nào. Vui lòng thử lại sau.</p>
            </div>
          ) : (
            <div className="combo-grid">
              {combos.map(combo => (
              <div key={combo.id} className="combo-card">
                <div className="combo-image">
                  <img src={combo.imageUrl || '/api/placeholder/200/150'} alt={combo.name} />
                </div>
                <div className="combo-info">
                  <h3>{combo.name}</h3>
                  <p className="combo-description">{combo.description}</p>
                  <ul className="combo-items">
                    {combo.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  <div className="combo-price">{formatPrice(combo.price)}</div>
                </div>
                <div className="combo-controls">
                  <button 
                    className="quantity-btn"
                    onClick={() => handleComboQuantityChange(combo.id, -1)}
                    disabled={!selectedCombos[combo.id]}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="quantity">{selectedCombos[combo.id] || 0}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => handleComboQuantityChange(combo.id, 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>

        <div className="order-summary">
          <h2>Tóm tắt đơn hàng</h2>
          
          <div className="summary-section">
            <h3>Thông tin vé</h3>
            <div className="summary-item">
              <span>Phim:</span>
              <span>{movie?.title || movie?.name}</span>
            </div>
            <div className="summary-item">
              <span>Suất chiếu:</span>
              <span>{formatDate(showtime?.startTime)} - {formatTime(showtime?.startTime)}</span>
            </div>
            <div className="summary-item">
              <span>Ghế:</span>
              <span>{selectedSeats?.map(s => s.seatNumber).join(', ')}</span>
            </div>
            <div className="summary-item">
              <span>Giá vé:</span>
              <span>{formatPrice(getTicketPrice())}</span>
            </div>
          </div>

          {Object.keys(selectedCombos).length > 0 && (
            <div className="summary-section">
              <h3>Combo đã chọn</h3>
              {Object.entries(selectedCombos).map(([comboId, quantity]) => {
                const combo = combos.find(c => c.id === comboId);
                if (!combo) return null;
                return (
                  <div key={comboId} className="summary-item">
                    <span>{combo.name} x{quantity}:</span>
                    <span>{formatPrice(combo.price * quantity)}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="summary-section total">
            <div className="summary-item">
              <span>Tổng cộng:</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
          </div>

          <div className="payment-methods">
            <h3>Phương thức thanh toán</h3>
            <div className="payment-options">
              <label className="payment-option">
                <input 
                  type="radio" 
                  name="payment" 
                  value="cash" 
                  checked={selectedPaymentMethod === 'cash'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <div className="payment-option-content">
                  <div className="payment-icon">
                    <img src="/payment-icons/cash-icon.png" alt="Cash" className="payment-icon-img" />
                  </div>
                  <div className="payment-details">
                    <span className="payment-title">Thanh toán tại quầy</span>
                    <span className="payment-desc">Thanh toán khi đến rạp</span>
                  </div>
                </div>
              </label>
              <label className="payment-option">
                <input 
                  type="radio" 
                  name="payment" 
                  value="vietqr" 
                  checked={selectedPaymentMethod === 'vietqr'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <div className="payment-option-content">
                  <div className="payment-icon">
                    <img src="https://play-lh.googleusercontent.com/22cJzF0otG-EmmQgILMRTWFPnx0wTCSDY9aFaAmOhHs30oNHxi63KcGwUwmbR76Msko" alt="VietQR" className="payment-icon-img" />
                  </div>
                  <div className="payment-details">
                    <span className="payment-title">VietQR</span>
                    <span className="payment-desc">Quét mã QR để thanh toán</span>
                  </div>
                </div>
              </label>
              <label className="payment-option">
                <input 
                  type="radio" 
                  name="payment" 
                  value="momo" 
                  checked={selectedPaymentMethod === 'momo'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <div className="payment-option-content">
                  <div className="payment-icon">
                    <img src="https://play-lh.googleusercontent.com/uCtnppeJ9ENYdJaSL5av-ZL1ZM1f3b35u9k8EOEjK3ZdyG509_2osbXGH5qzXVmoFv0" alt="MoMo" className="payment-icon-img" />
                  </div>
                  <div className="payment-details">
                    <span className="payment-title">Ví MoMo</span>
                    <span className="payment-desc">Thanh toán qua ứng dụng MoMo</span>
                  </div>
                </div>
              </label>
              <label className="payment-option">
                <input 
                  type="radio" 
                  name="payment" 
                  value="zalopay" 
                  checked={selectedPaymentMethod === 'zalopay'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <div className="payment-option-content">
                  <div className="payment-icon">
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTlp4qW2M8xPofmuZHwEfGi9mNMWUG0zs53A&s" alt="ZaloPay" className="payment-icon-img" />
                  </div>
                  <div className="payment-details">
                    <span className="payment-title">ZaloPay</span>
                    <span className="payment-desc">Thanh toán qua ZaloPay</span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button 
            className="book-now-btn"
            onClick={handleBooking}
            disabled={booking}
          >
            {booking ? (
              <>
                <div className="loading-spinner-small"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Xác nhận đặt vé
              </>
            )}
          </button>

          {message && (
            <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComboSelectionPage;
