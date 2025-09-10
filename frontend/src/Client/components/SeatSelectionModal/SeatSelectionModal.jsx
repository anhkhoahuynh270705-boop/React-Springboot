import React, { useState, useEffect } from 'react';
import { X, User, CreditCard, CheckCircle } from 'lucide-react';
import { getSeatsByShowtime, bookSeat } from '../../services/seatService';
import { bookTicket } from '../../services/ticketService';
import './SeatSelectionModal.css';

const SeatSelectionModal = ({ isOpen, onClose, showtime, movie, userId }) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1); 

  useEffect(() => {
    if (isOpen && showtime?.id) {
      fetchSeats();
    }
  }, [isOpen, showtime]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const seatsData = await getSeatsByShowtime(showtime.id);
      setSeats(seatsData);
    } catch (error) {
      console.error('Error fetching seats:', error);
      setMessage('Không thể tải danh sách ghế');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.booked) return;

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id);
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
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
          await bookSeat(seat.id, userId);
        } catch (error) {
          setMessage(`Ghế ${seat.seatNumber} đã được đặt bởi người khác. Vui lòng chọn ghế khác.`);
          setBooking(false);
          return;
        }
      }
      
      let showDate, showTime;
      
      if (showtime.startTime) {
        const startDateTime = new Date(showtime.startTime);
        showDate = startDateTime.toISOString().split('T')[0]; 
        showTime = startDateTime.toISOString(); 
      } else {
        showDate = showtime.showDate || new Date().toISOString().split('T')[0];
        showTime = showtime.time || showtime.showTime || new Date().toISOString();
      }

      // Tạo danh sách ghế
      const seatNumbers = selectedSeats.map(seat => seat.seatNumber).join(', ');
      const seatIds = selectedSeats.map(seat => seat.id).join(', ');
      const totalPrice = (showtime.price || 100000) * selectedSeats.length;

      const ticketData = {
        userId: userId,
        showtimeId: showtime.id,
        seatId: seatIds, 
        seatNumber: seatNumbers, 
        movieId: movie.id,
        movieTitle: movie.title || movie.name,
        moviePoster: movie.posterUrl || movie.poster || movie.imageUrl || movie.image || '/default-movie.jpg',
        movieThumbnail: movie.thumbnailUrl || movie.thumbnail || movie.posterUrl || movie.poster || '/default-movie.jpg',
        cinemaName: showtime.cinemaName || 'Rạp chiếu phim',
        cinemaAddress: showtime.cinemaAddress || showtime.address || '',
        showDate: showDate,
        showTime: showTime,
        price: totalPrice, 
        status: 'pending',
        paymentMethod: 'online', 
        paymentStatus: 'paid',
        isRefundable: true
      };
      await bookTicket(ticketData);
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
    const pricePerSeat = showtime.price || 100000;
    return selectedSeats.length * pricePerSeat;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="seat-selection-overlay">
      <div className="seat-selection-modal"> 
        <div className="modal-header">
          <div className="movie-info">
            <h2>{movie?.title || movie?.name}</h2>
            <div className="showtime-info">
              <span>{formatDate(showtime?.startTime || showtime?.showDate)}</span>
              <span>{formatTime(showtime?.startTime || showtime?.time)}</span>
              <span>Phòng {showtime?.room || '1'}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {step === 1 && (
          <div className="seat-selection-content">
            <div className="screen-indicator">
              <div className="screen">Màn hình</div>
            </div>

            <div className="seat-map">
              {loading ? (
                <div className="loading">Đang tải sơ đồ ghế...</div>
              ) : (
                <div className="seats-grid">
                  {seats.map(seat => {
                    const isSelected = selectedSeats.find(s => s.id === seat.id);
                    const className = `seat ${seat.booked ? 'booked' : ''} ${
                      isSelected ? 'selected' : ''
                    }`;
                    
                    return (
                      <button
                        key={seat.id}
                        className={className}
                        style={inlineStyle}
                        disabled={seat.booked}
                        onClick={() => handleSeatClick(seat)}
                        title={seat.booked ? `Đã được đặt bởi ${seat.bookedBy || 'người khác'}` : ''}
                      >
                        {seat.booked ? (
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
                <div className="seat-sample booked">
                  <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>✕</span>
                </div>
                <span>Đã đặt</span>
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div className="selected-seats-info">
                <h3>Ghế đã chọn: {selectedSeats.map(s => s.seatNumber).join(', ')}</h3>
                <div className="price-info">
                  <span>Tổng cộng: {formatPrice(getTotalPrice())}</span>
                </div>
                <button 
                  className="continue-btn" 
                  onClick={() => setStep(2)}
                >
                  Tiếp tục
                </button>
              </div>
            )}

            {message && <div className="message error">{message}</div>}
          </div>
        )}

        {step === 2 && (
          <div className="payment-content">
            <h3>Thông tin thanh toán</h3>
            <div className="booking-summary">
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
                <span>{selectedSeats.map(s => s.seatNumber).join(', ')}</span>
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
                  <input type="radio" name="payment" value="cash" defaultChecked />
                  <span>Thanh toán tại quầy</span>
                </label>
                <label className="payment-option">
                  <input type="radio" name="payment" value="card" />
                  <span>Thẻ tín dụng</span>
                </label>
              </div>
            </div>

            <div className="payment-actions">
              <button 
                className="back-btn"
                onClick={() => setStep(1)}
              >
                Quay lại
              </button>
              <button 
                className="book-btn"
                onClick={handleBooking}
                disabled={booking}
              >
                {booking ? 'Đang xử lý...' : 'Xác nhận đặt vé'}
              </button>
            </div>

            {message && <div className="message error">{message}</div>}
          </div>
        )}

        {step === 3 && (
          <div className="success-content">
            <div className="success-icon">
              <CheckCircle size={64} color="#10b981" />
            </div>
            <h3>Đặt vé thành công!</h3>
            <p>Vé của bạn đã được xác nhận. Vui lòng đến rạp trước giờ chiếu 15 phút.</p>
            <div className="success-actions">
              <button 
                className="view-tickets-btn"
                onClick={() => {
                  onClose();
                  window.location.href = '/tickets';
                }}
              >
                Xem vé của tôi
              </button>
              <button 
                className="close-success-btn"
                onClick={onClose}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelectionModal;
