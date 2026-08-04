/* eslint-disable no-constant-binary-expression */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getSeatsByShowtime } from '../../../services/seatService';
import { lockSeats } from '../../../services/seatLockService';
import { X, User, CreditCard, CheckCircle } from 'lucide-react';
import { bookTicket } from '../../../services/ticketService';
import { subscribeToSeatUpdates, connectWebSocket } from '../../../services/websocketService';
import './SeatSelectionModal.css';
import { useTranslation } from 'react-i18next';

const SeatSelectionModal = ({ isOpen, onClose, showtime, movie, userId }) => {
  const { t } = useTranslation();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const wsUnsubscribeRef = useRef(null);

  useEffect(() => {
    if (isOpen && showtime?.id) {
      fetchSeats();
      // Connect WebSocket
      connectWebSocket(userId);
      const unsubscribe = subscribeToSeatUpdates(showtime.id, (update) => {
        const { seatIds, lockedBy, action } = update;
        if (!seatIds || !Array.isArray(seatIds)) return;

        setSeats(prev => prev.map(seat => {
          if (!seatIds.map(String).includes(String(seat.id))) return seat;
          if (action === 'LOCKED') {
            return { ...seat, booked: true, bookedBy: lockedBy || 'other' };
          } else if (action === 'RELEASED') {
            return { ...seat, booked: false, bookedBy: null };
          }
          return seat;
        }));

        // Deselect any seats that got locked by someone else
        if (action === 'LOCKED' && lockedBy !== userId) {
          setSelectedSeats(prev => prev.filter(s => !seatIds.map(String).includes(String(s.id))));
        }
      });

      wsUnsubscribeRef.current = unsubscribe;
    }

    return () => {
      if (typeof wsUnsubscribeRef.current === 'function') {
        wsUnsubscribeRef.current();
        wsUnsubscribeRef.current = null;
      }
    };
  }, [isOpen, showtime?.id]);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const seatsData = await getSeatsByShowtime(showtime.id);
      setSeats(seatsData);
      // Auto re-select seats temporarily locked by this user (Redis lock, not yet permanently booked)
      const myLockedSeats = seatsData.filter(
        seat => seat.tempLockedBy === userId
      );
      if (myLockedSeats.length > 0) {
        setSelectedSeats(myLockedSeats);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      setMessage(t('Unable to load seat list'));
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    // Permanently booked in DB → blocked for everyone
    if (seat.booked) return;
    // Temp locked by someone else in Redis → blocked
    if (seat.tempLockedBy && seat.tempLockedBy !== userId) return;

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
      setMessage(t('Please select at least one seat'));
      return;
    }

    try {
      setBooking(true);
      setMessage('');
      // Book each selected seat
      for (const seat of selectedSeats) {
        try {
          await lockSeats(showtime.id, seatIds, userId);
        } catch (error) {
          setMessage(t('Seat {{seatNumber}} has been booked by someone else. Please choose another seat.', { seatNumber: seat.seatNumber }));
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

      // Create ticket data
      const seatNumbers = selectedSeats.map(seat => seat.seatNumber).join(', ');
      const seatIds = selectedSeats.map(seat => seat.id).join(', ');
      const totalPrice = getTotalPrice();

      const ticketData = {
        userId: userId,
        showtimeId: showtime.id,
        seatId: seatIds,
        seatNumber: seatNumbers,
        movieId: movie.id,
        movieTitle: movie.title || movie.name,
        moviePoster: movie.posterUrl || movie.poster || movie.imageUrl || movie.image || '/default-movie.jpg',
        movieThumbnail: movie.thumbnailUrl || movie.thumbnail || movie.posterUrl || movie.poster || '/default-movie.jpg',
        cinemaName: showtime.cinemaName || 'Movie Theater',
        cinemaAddress: showtime.cinemaAddress || showtime.address || '',
        showDate: showDate,
        showTime: showTime,
        price: totalPrice,
        status: 'pending',
        paymentMethod: selectedPaymentMethod,
        paymentStatus: selectedPaymentMethod === 'cash' ? 'pending' : 'paid',
        isRefundable: true
      };
      await bookTicket(ticketData);
      setStep(3);
      setMessage(t('Booking successful!'));
    } catch (error) {
      console.error('Error booking tickets:', error);
      setMessage(t('Booking failed. Please try again.'));
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

  // Get seat type based on row if not explicitly set in backend
  const getSeatType = (seat) => {
    return (seat?.seatType || 'REGULAR').toUpperCase();
  };

  // Get seat price based on type
  const getSeatPrice = (seat) => {
    if (seat.price && seat.price > 0) {
      return seat.price;
    }

    // Otherwise, use default prices based on seat type
    const basePrice = showtime.price || 100000;
    const seatType = getSeatType(seat);

    switch (seatType) {
      case 'VIP':
        return basePrice * 1.5;
      case 'COUPLE':
        return basePrice * 2.0;
      case 'REGULAR':
      default:
        return basePrice;
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => {
      return total + getSeatPrice(seat);
    }, 0);
  };
  const handleContinueToCombo = async () => {
    if (selectedSeats.length === 0) {
      setMessage(t('Please select at least one seat'));
      return;
    }

    try {
      setBooking(true);
      setMessage('');

      const seatIds = selectedSeats.map(seat => seat.id);

      await lockSeats(showtime.id, seatIds, userId);

      const lockedSelectedSeats = selectedSeats.map(seat => ({
        ...seat,
        locked: true,
        lockedBy: userId,
      }));

      onClose();

      window.location.href =
        `/combo-selection?showtime=${encodeURIComponent(JSON.stringify(showtime))}` +
        `&movie=${encodeURIComponent(JSON.stringify(movie))}` +
        `&seats=${encodeURIComponent(JSON.stringify(lockedSelectedSeats))}` +
        `&user=${encodeURIComponent(JSON.stringify({ id: userId }))}`;

    } catch (error) {
      console.error('Error locking seat:', error);

      setMessage(
        error.message || 'Ghế này đang được người khác giữ. Vui lòng chọn ghế khác.'
      );

      await fetchSeats();
    } finally {
      setBooking(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const layoutCols = useMemo(() => {
    if (!seats || seats.length === 0) {
      return showtime?.totalCols || 10;
    }
    return seats.reduce((max, seat) => {
      const colIndex = Number(seat.colIndex) || 1;
      const colSpan = Number(seat.colSpan) || 1;

      return Math.max(max, colIndex + colSpan - 1);
    }, 1);
  }, [seats, showtime]);

  console.log('showtime.totalCols:', showtime?.totalCols);

  const maxCol = seats.reduce((max, seat) => {
    const colIndex = Number(seat.colIndex) || 1;
    const colSpan = Number(seat.colSpan) || 1;
    return Math.max(max, colIndex + colSpan - 1);
  }, 1);

  console.log('max seat col:', maxCol);

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
              <span>{t('Room')} {showtime?.room || '1'}</span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {step === 1 && (
          <div className="seat-selection-content">
            <div className="screen-indicator">
              <div className="screen">{t('Screen')}</div>
            </div>

            <div className="seat-map">
              {loading ? (
                <div className="loading">{t('Loading seat map...')}</div>
              ) : (
                <div
                  className="seats-grid"
                  style={{
                    gridTemplateColumns: `repeat(${layoutCols}, 90px)`
                  }}
                >
                  {seats.map(seat => {
                    const isSelected = selectedSeats.find(s => s.id === seat.id);
                    // Permanently booked in DB (by anyone) OR temp locked by someone else
                    const isActuallyBooked = seat.booked ||
                      (seat.tempLockedBy && seat.tempLockedBy !== userId);
                    const seatType = getSeatType(seat);
                    const className = `seat seat-${seatType.toLowerCase()} ${isActuallyBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''
                      }`;

                    // Get seat price for tooltip
                    const seatPrice = getSeatPrice(seat);
                    const priceText = formatPrice(seatPrice);

                    return (
                      <button
                        key={seat.id}
                        className={className}
                        disabled={isActuallyBooked}
                        onClick={() => handleSeatClick(seat)}
                        style={{
                          gridRow: seat.rowIndex || 'auto',
                          gridColumn: seat.colIndex
                            ? `${seat.colIndex} / span ${seat.colSpan || 1}`
                            : 'auto'
                        }}
                        title={
                          isActuallyBooked
                            ? seat.bookedBy === userId
                              ? 'Seat booked by you '
                              : `Seat booked by: ${seat.bookedBy}`
                            : `${seat.seatNumber} - ${seatType} - ${priceText}`
                        }
                      >
                        {isActuallyBooked ? (
                          <div className="booked-seat-info">
                            <span className="booked-mark">✕</span>
                            <small>
                              {seat.bookedBy === userId ? 'You' : seat.bookedBy}
                            </small>
                          </div>
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
                <span>{t('Available seat')}</span>
              </div>
              <div className="legend-item">
                <div className="seat-sample seat-regular"></div>
                <span>{t('Regular')}</span>
              </div>
              <div className="legend-item">
                <div className="seat-sample seat-vip"></div>
                <span>{t('VIP')}</span>
              </div>
              <div className="legend-item">
                <div className="seat-sample seat-couple"></div>
                <span>{t('Couple')}</span>
              </div>
              <div className="legend-item">
                <div className="seat-sample selected"></div>
                <span>{t('Selected')}</span>
              </div>
              <div className="legend-item">
                <div className="seat-sample booked">
                  <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold' }}>✕</span>
                </div>
                <span>{t('Booked')}</span>
              </div>
            </div>

            {selectedSeats.length > 0 && (
              <div className="selected-seats-info">
                <h3>{t('Selected seats:')} {selectedSeats.map(s => s.seatNumber).join(', ')}</h3>
                <div className="selected-seats-details">
                  {selectedSeats.map(seat => (
                    <div key={seat.id} className="seat-detail-item">
                      <span>{seat.seatNumber} ({getSeatType(seat)})</span>
                      <span>{formatPrice(getSeatPrice(seat))}</span>
                    </div>
                  ))}
                </div>
                <div className="price-info">
                  <span>{t('Total:')} {formatPrice(getTotalPrice())}</span>
                </div>
                <button
                  className="continue-btn"
                  onClick={handleContinueToCombo}
                  disabled={booking}
                >
                  {booking ? 'keeping Seats...' : t('Book ticket')}
                </button>
              </div>
            )}

            {message && <div className="message error">{message}</div>}
          </div>
        )}

        {/* Payment step removed - now handled in ComboSelectionPage */}
        {false && (
          <div className="payment-content">
            <h3>{t('Payment information')}</h3>
            <div className="booking-summary">
              <div className="summary-item">
                <span>{t('Movie:')}</span>
                <span>{movie?.title || movie?.name}</span>
              </div>
              <div className="summary-item">
                <span>{t('Showtime:')}</span>
                <span>{formatDate(showtime?.startTime)} - {formatTime(showtime?.startTime)}</span>
              </div>
              <div className="summary-item">
                <span>{t('Seat:')}</span>
                <span>{selectedSeats.map(s => s.seatNumber).join(', ')}</span>
              </div>
              <div className="summary-item total">
                <span>T{t('Total:')}</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            <div className="payment-methods">
              <h4>{t('Payment method')}</h4>
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
                      <span className="payment-title">{t('Pay at counter')}</span>
                      <span className="payment-desc">{t('Pay upon arrival')}</span>
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
                      <img src="https://vietqr.net/img/VIETQR_logo.png" alt="VietQR" className="payment-icon-img" />
                    </div>
                    <div className="payment-details">
                      <span className="payment-title">VietQR</span>
                      <span className="payment-desc">{t('Scan QR code to pay')}</span>
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
                      <img src="/payment-icons/momo-logo.png" alt="MoMo" className="payment-icon-img" />
                    </div>
                    <div className="payment-details">
                      <span className="payment-title">{t('MoMo Wallet')}</span>
                      <span className="payment-desc">{t('Pay via MoMo app')}</span>
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
                      <img src="/payment-icons/zalopay-logo.png" alt="ZaloPay" className="payment-icon-img" />
                    </div>
                    <div className="payment-details">
                      <span className="payment-title">ZaloPay</span>
                      <span className="payment-desc">{t('Pay via ZaloPay')}</span>
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
                {t('Go back')}
              </button>
              <button
                className="book-btn"
                onClick={handleBooking}
                disabled={booking}
              >
                {booking ? t('Processing...') : t('Confirm booking')}
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
            <h3>{t('BookingTicketSuccess')}!</h3>
            <p>{t('Your ticket has been confirmed. Please arrive at the cinema 15 minutes before showtime.')}</p>
            <div className="success-actions">
              <button
                className="view-tickets-btn"
                onClick={() => {
                  onClose();
                  window.location.href = '/tickets';
                }}
              >
                {t('View my ticket')}
              </button>
              <button
                className="close-success-btn"
                onClick={onClose}
              >
                {t('Close')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelectionModal;
