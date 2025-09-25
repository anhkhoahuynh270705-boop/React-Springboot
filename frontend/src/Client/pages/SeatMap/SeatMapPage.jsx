import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';
import { getSeatsByShowtime, bookSeat } from '../../../services/seatService';
import { bookTicket } from '../../../services/ticketService';
import { getCurrentUser } from '../../../services/userService';
import { createNotification, createBookingSuccessNotification } from '../../../services/notificationService';
import './SeatMapPage.css';    

const SeatMapPage = ({ showtimeId, userId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1); 
  const [user, setUser] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const generateMockSeats = () => {
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 10;
    
    rows.forEach((row, rowIndex) => {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        seats.push({
          seatNumber: `${row}${seatNum}`,
          showtimeId: showtime?.id || showtimeId || 'default',
          booked: false 
        });
      }
    });
    return seats;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (location.state) {
          setShowtime(location.state.showtime);
          setMovie(location.state.movie);
        }

        // Fetch seats từ API
        if (showtimeId || (location.state && location.state.showtime)) {
          const id = showtimeId || location.state.showtime.id;
          console.log('Fetching seats for showtime ID:', id);
          
          try {
            const seatsData = await getSeatsByShowtime(id);
            
            if (seatsData && seatsData.length > 0) {
              setSeats(seatsData);
            } else {
              const mockSeats = generateMockSeats();
              setSeats(mockSeats);
            }
          } catch (error) {
            console.error('Error fetching seats from API:', error);
            const mockSeats = generateMockSeats();
            setSeats(mockSeats);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showtimeId, location.state]);

  const handleSeatClick = (seat) => {
    if (seat.booked && seat.bookedBy && seat.bookedBy.trim() !== '') return;

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.seatNumber === seat.seatNumber);
      if (isSelected) {
        return prev.filter(s => s.seatNumber !== seat.seatNumber);
      } else {
        return [...prev, seat];
      }
    });
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      setMessage('Vui lòng chọn ít nhất một ghế');
      return;
    }

    try {
      setBooking(true);
      setMessage('');
      
      // Đặt từng ghế trước
      for (const seat of selectedSeats) {
        try {
          await bookSeat(seat.id || seat.seatNumber, user?.id || userId);
        } catch (error) {
          setMessage(`Ghế ${seat.seatNumber} đã được đặt bởi người khác. Vui lòng chọn ghế khác.`);
          setBooking(false);
          return;
        }
      }
      
      let showDate, showTime;
      
      if (showtime?.startTime) {
        const startDateTime = new Date(showtime.startTime);
        showDate = startDateTime.toISOString().split('T')[0]; 
        showTime = startDateTime.toISOString(); 
        console.log('SeatMapPage: Using startTime:', showtime.startTime, '-> showDate:', showDate, 'showTime:', showTime);
      } else {
        showDate = showtime?.showDate || new Date().toISOString().split('T')[0];
        showTime = showtime?.time || showtime?.showTime || new Date().toISOString();
        console.log('SeatMapPage: Using fallback dates - showDate:', showDate, 'showTime:', showTime);
      }

      // Tạo danh sách ghế
      const seatNumbers = selectedSeats.map(seat => seat.seatNumber).join(', ');
      const seatIds = selectedSeats.map(seat => seat.id || seat.seatNumber).join(', ');
      const totalPrice = (showtime?.price || 100000) * selectedSeats.length;

      const ticketData = {
        userId: user?.id || userId,
        showtimeId: showtime?.id || showtimeId,
        seatId: seatIds, 
        seatNumber: seatNumbers, 
        movieId: movie?.id,
        movieTitle: movie?.title || movie?.name,
        moviePoster: movie?.posterUrl || movie?.poster || movie?.imageUrl || movie?.image || '/default-movie.jpg',
        movieThumbnail: movie?.thumbnailUrl || movie?.thumbnail || movie?.posterUrl || movie?.poster || '/default-movie.jpg',
        cinemaName: showtime?.cinemaName || 'Rạp chiếu phim',
        cinemaAddress: showtime?.cinemaAddress || showtime?.address || '',
        showDate: showDate,
        showTime: showTime,
        price: totalPrice,
        status: 'pending',
        paymentMethod: selectedPaymentMethod, 
        paymentStatus: selectedPaymentMethod === 'cash' ? 'pending' : 'paid',
        isRefundable: true
      };

      console.log('SeatMapPage: Creating single ticket for multiple seats:', ticketData);
      await bookTicket(ticketData);
      
      // Tạo thông báo đặt vé thành công
      try {
        const notificationData = createBookingSuccessNotification(
          user?.id || userId,
          movie?.title || movie?.name || 'Phim',
          seatNumbers,
          showTime
        );
        await createNotification(notificationData);
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
      
      setStep(3);
      setMessage('Đặt vé thành công!');
    } catch (error) {
      console.error('Error booking tickets:', error);
      setMessage('Đặt vé thất bại. Vui lòng thử lại.');
    } finally {
      setBooking(false);
    }
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

  const getTotalPrice = () => {
    const pricePerSeat = showtime?.price || 100000;
    return selectedSeats.length * pricePerSeat;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="seat-map-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải sơ đồ ghế...</p>
      </div>
    );
  }

  if (!showtimeId && !showtime) {
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
      <div className="container-error">
        <h2>Đăng nhập để đặt vé nhé!😘</h2>
        <p>Bạn cần đăng nhập để có thể chọn ghế và đặt vé.</p>
        <div className="auth-buttons">
          <button onClick={() => navigate('/login')} className="btn-primary">
            Đăng nhập
          </button>
          <button onClick={() => navigate('/')} className="btn-secondary">
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seat-map-page">
      <div className="seat-map-container">
        <div className="seat-map-header"> 
          <div className="header-top">    
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
              Quay lại
            </button>
            <h1>Sơ đồ ghế ngồi</h1>
          </div>
        </div>

        {step === 1 && (
          <div className="seat-selection-content">
            <div className="screen-indicator">
              <div className="screen">Màn hình</div>
            </div>

            <div className="seat-map">
              {seats.length === 0 ? (
                <div className="no-seats">
                  <p>Không có ghế nào được tìm thấy</p>
                </div>
              ) : (
                <div className="seats-grid">
                  {seats.map(seat => {
                    const isActuallyBooked = seat.booked && seat.bookedBy && seat.bookedBy.trim() !== '';
                    return (
                      <button
                        key={seat.id || seat.seatNumber}
                        className={`seat ${isActuallyBooked ? 'booked' : ''} ${
                          selectedSeats.find(s => s.seatNumber === seat.seatNumber) ? 'selected' : ''
                        }`}
                        disabled={isActuallyBooked}
                        onClick={() => handleSeatClick(seat)}
                        title={isActuallyBooked ? `Đã được đặt bởi ${seat.bookedBy || 'người khác'}` : ''}
                      >
                        {isActuallyBooked ? (
                          <span style={{ color: '#ef4444', fontSize: '14px', fontWeight: 'bold' }}>✕</span>
                        ) : (
                          seat.seatNumber
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="seat-legend">
              <div className="legend-item">
                <div className="seat-sample available"></div>
                <span>Ghế trống</span>
              </div>
              <div className="legend-item">
                <div className="seat-sample selected"></div>
                <span>Đã chọn</span>
              </div>
              <div className="legend-item">
                <div className="seat-sample booked"></div>
                <span>Đã đặt</span>
              </div>
            </div>

            <div className="selected-seats-info">
              {selectedSeats.length > 0 ? (
                <>
                  <h3>Ghế đã chọn: {selectedSeats.map(s => s.seatNumber).join(', ')}</h3>
                  <div className="price-info">
                    <span>Tổng cộng: {formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="booking-actions">
                    <button 
                      className="book-now-btn"
                      onClick={() => navigate('/combo-selection', { 
                        state: { 
                          showtime, 
                          movie, 
                          selectedSeats, 
                          user 
                        } 
                      })}
                    >
                      <CreditCard size={20} />
                      Đặt vé
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3>Chọn ghế để đặt vé</h3>
                  <p>Vui lòng chọn ghế từ sơ đồ bên trên</p>
                </>
              )}
            </div>

            {message && <div className="message error">{message}</div>}
          </div>
        )}

        {/* Payment step removed - now handled in ComboSelectionPage */}
        {false && (
          <div className="payment-content">
            <div className="payment-header">
              <h3>Thông tin thanh toán</h3>
              <p>Vui lòng kiểm tra thông tin và chọn phương thức thanh toán</p>
            </div>
            
            <div className="booking-summary">
              <h4>Chi tiết đơn hàng</h4>
              <div className="summary-item">  
                <span>Phim:</span>
                <span>{movie?.title || movie?.name}</span>
              </div>
              <div className="summary-item">
                <span>Suất chiếu:</span>
                <span>{formatDate(showtime?.startTime)} - {formatTime(showtime?.startTime)}</span>
              </div>
              <div className="summary-item">
                <span>Phòng:</span>
                <span>{showtime?.room || '1'}</span>
              </div>
              <div className="summary-item">
                <span>Ghế đã chọn:</span>
                <span className="seats-list">{selectedSeats.map(s => s.seatNumber).join(', ')}</span>
              </div>
              <div className="summary-item">
                <span>Số lượng vé:</span>
                <span>{selectedSeats.length} vé</span>
              </div>
              <div className="summary-item">
                <span>Giá mỗi vé:</span>
                <span>{formatPrice(showtime?.price || 100000)}</span>
              </div>
              <div className="summary-item total">
                <span>Tổng cộng:</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            <div className="payment-methods">
              <h4>Phương thức thanh toán</h4>
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

            <div className="payment-actions">
              <button 
                className="back-btn"
                onClick={() => setStep(1)}
              >
                <ArrowLeft size={16} />
                Quay lại chọn ghế
              </button>
              <button 
                className="confirm-booking-btn"
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
            </div>

            {message && <div className="message error">{message}</div>}  
          </div>
        )}

        {/* Success step removed - now handled in ComboSelectionPage */}
        {false && (
          <div className="success-content">
            <div className="success-icon">
              <CheckCircle size={64} color="#10b981" />
            </div>
            <h3>Đặt vé thành công!</h3>
            <p>Vé của bạn đã được xác nhận. Vui lòng đến rạp trước giờ chiếu 15 phút.</p>
            <div className="success-actions">
              <button 
                className="view-tickets-btn"
                onClick={() => navigate('/tickets')}
              >
                Xem vé của tôi
              </button>
              <button 
                className="close-success-btn"
                onClick={() => navigate('/')}
              >
                Về trang chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatMapPage;
