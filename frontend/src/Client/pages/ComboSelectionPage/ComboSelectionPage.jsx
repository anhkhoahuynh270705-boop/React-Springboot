/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { bookTicket } from '../../../services/ticketService';
import { getAllCombos } from '../../../services/comboService';
import { createBookingSuccessNotification } from '../../../services/notificationService';
import { createPaymentOrder } from '../../../services/paymentService';
import { getUnusedDiscountCards, markDiscountCardUsed } from '../../../services/rewardService';
import { getCurrentUserSync } from '../../../services/userService';
import { pay, getBalance } from '../../../services/virtualWalletService';
import { createCreditCardCheckoutSession } from '../../../services/creditCardService';
import './ComboSelectionPage.css';
import { useTranslation } from 'react-i18next';

const ComboSelectionPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [user, setUser] = useState(null);

  const [selectedCombos, setSelectedCombos] = useState({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [selectedDiscountCard, setSelectedDiscountCard] = useState(null);
  const [discountCards, setDiscountCards] = useState([]);

  // Load data from location state or URL params
  useEffect(() => {
    if (location.state) {
      setShowtime(location.state.showtime);
      setMovie(location.state.movie);
      setSelectedSeats(location.state.selectedSeats || []);
      const localUser = getCurrentUserSync();
      setUser(localUser || location.state.user);
    } else {
      try {
        const showtimeParam = searchParams.get('showtime');
        const movieParam = searchParams.get('movie');
        const seatsParam = searchParams.get('seats');
        const userParam = searchParams.get('user');

        if (showtimeParam) setShowtime(JSON.parse(decodeURIComponent(showtimeParam)));
        if (movieParam) setMovie(JSON.parse(decodeURIComponent(movieParam)));
        if (seatsParam) setSelectedSeats(JSON.parse(decodeURIComponent(seatsParam)));

        const localUser = getCurrentUserSync();
        if (localUser) {
          setUser(localUser);
        } else if (userParam) {
          setUser(JSON.parse(decodeURIComponent(userParam)));
        }
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
        setError('Cannot load combo list. Please try again.');
        setCombos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);

  useEffect(() => {
    if (user?.id) {
      setDiscountCards(getUnusedDiscountCards(user.id));
    } else {
      setDiscountCards([]);
      setSelectedDiscountCard(null);
    }
  }, [user?.id]);


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

  // Calculate seat price based on seat type 
  const getSeatPrice = (seat) => {
    if (seat?.price && seat.price > 0) {
      return seat.price;
    }

    // Otherwise calculate based on seat type
    const basePrice = showtime?.price || 100000;
    const seatType = seat?.seatType || 'REGULAR';

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

  const getTicketPrice = () => {
    if (!selectedSeats || selectedSeats.length === 0) return 0;
    return selectedSeats.reduce((total, seat) => {
      return total + getSeatPrice(seat);
    }, 0);
  };

  const getSubtotal = () => {
    return getTicketPrice() + getTotalComboPrice();
  };

  const getDiscountAmount = () => {
    const subtotal = getSubtotal();
    let discount = 0;
    if (selectedDiscountCard) {
      const r = selectedDiscountCard.rewardId;
      if (r === 'voucher_10') discount += Math.floor(getTicketPrice() * 0.1);
      if (r === 'voucher_20') discount += Math.floor(getTicketPrice() * 0.2);
      if (r === 'free_ticket') discount += getTicketPrice();
      if (r === 'free_popcorn' || r === 'free_drink') {
        const comboPrice = getTotalComboPrice();
        discount += Math.min(50000, comboPrice);
      }
    }
    return Math.min(discount, subtotal);
  };

  const getTotalPrice = () => {
    return Math.max(0, getSubtotal() - getDiscountAmount());
  };

  const handleSelectDiscountCard = (e) => {
    const cardId = e.target.value;
    if (!cardId) {
      setSelectedDiscountCard(null);
      return;
    }
    const card = discountCards.find(c => c.id === cardId);
    setSelectedDiscountCard(card || null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
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
      return date.toLocaleDateString('en-US', {
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
      setMessage(t('PleaseLoginToBook'));
      return;
    }

    if (!selectedPaymentMethod) {
      setMessage(t('PleaseChooseMethodPay'));
      return;
    }
    const onlineMethods = ['vietqr', 'momo', 'zalopay', 'sandbox', 'creditcard'];
    if (!onlineMethods.includes(selectedPaymentMethod)) {
      setMessage(t('Please choose an online payment method'));
      return;
    }

    if (!showtime?.id) {
      setMessage(t('NotValidShowtime'));
      return;
    }

    if (!movie?.id) {
      setMessage(t('NotValidMovie'));
      return;
    }

    if (!selectedSeats || selectedSeats.length === 0) {
      setMessage(t('PleaseChooseSeat'));
      return;
    }

    try {
      setBooking(true);
      setMessage('');

      // Create ticket data with combo
      const seatNumbers = selectedSeats?.map(seat => seat.seatNumber).join(', ') || '';
      const seatIds = selectedSeats?.map(seat => seat.id).join(', ') || '';
      const totalPrice = getTotalPrice();
      const comboPrice = getTotalComboPrice();
      const discountAmount = getDiscountAmount();

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
        movieTitle: movie?.title || movie?.name || 'Not defined movie',
        moviePoster: movie?.posterUrl || movie?.poster || movie?.imageUrl || movie?.image || '/default-movie.jpg',
        movieThumbnail: movie?.thumbnailUrl || movie?.thumbnail || movie?.posterUrl || movie?.poster || '/default-movie.jpg',
        cinemaName: showtime?.cinemaName || 'Movie Theater',
        cinemaAddress: showtime?.cinemaAddress || showtime?.address || '',
        showDate: showDate || new Date().toISOString().split('T')[0],
        showTime: showTime || new Date().toISOString(),
        price: parseFloat(totalPrice) || 0,
        status: 'pending',
        paymentMethod: selectedPaymentMethod || 'cash',
        paymentStatus: 'pending',
        isRefundable: true,
        notes: Object.keys(selectedCombos).length > 0 ? `Combo: ${Object.entries(selectedCombos).map(([comboId, quantity]) => {
          const combo = combos.find(c => c.id === comboId);
          return combo ? `${combo.name} x${quantity}` : '';
        }).filter(Boolean).join(', ')}` : 'No Combo'
      };

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
      const summary = {
        ticketPrice: getTicketPrice(),
        comboPrice,
        discountAmount,
        appliedPromo: appliedPromo ? { code: appliedPromo.code, discountPercent: appliedPromo.discountPercent, discountFixed: appliedPromo.discountFixed } : null,
        discountCard: selectedDiscountCard || null,
        totalPrice: totalPrice
      };

      if (selectedDiscountCard && user?.id) {
        markDiscountCardUsed(user.id, selectedDiscountCard.id);
      }

      // Handle different payment methods
      if (selectedPaymentMethod === 'vietqr') {
        const orderPayload = {
          amount: Number(summary.totalPrice) || 0,
          orderInfo: `${ticketData.movieTitle} - ${ticketData.seatNumber}`.trim(),
          method: selectedPaymentMethod,
          userId: String(user?.id || `guest-${Date.now()}`),
          userName: String(user?.name || user?.fullName || user?.username || 'Guest'),
          userEmail: String(user?.email || 'guest@example.com'),
        };
        const order = await createPaymentOrder(orderPayload);

        if (order?.payUrl) {
          window.location.href = order.payUrl;
          return;
        }

        navigate('/payment/vietqr', {
          state: {
            ticketData,
            summary,
            orderId: order?.orderId,
            amount: summary.totalPrice,
            qrUrl: order?.qrUrl,
            qrData: order?.qrData
          }
        });
      } else if (selectedPaymentMethod === 'zalopay') {
        // ZaloPay creates its own order in ZaloPayPayment page
        navigate('/payment/zalopay', {
          state: {
            ticketData,
            summary,
            description: `${ticketData.movieTitle} - ${ticketData.seatNumber}`,
            user
          }
        });
      } else if (selectedPaymentMethod === 'momo') {
        // MoMo creates its own order in MoMoPayment page
        navigate('/payment/momo', {
          state: {
            ticketData,
            summary,
            description: `${ticketData.movieTitle} - ${ticketData.seatNumber}`,
            user
          }
        });
        } else if (selectedPaymentMethod === 'creditcard') {
          const payload = {
            amount: Number(summary.totalPrice) || 0,
            orderInfo: `${ticketData.movieTitle} - ${ticketData.seatNumber}`.trim(),
            method: 'CreditCard',
            userId: String(user?.id || ''),
            userName: String(user?.fullName || user?.username || 'Guest'),
            userEmail: String(user?.email || ''),
          };

          const session = await createCreditCardCheckoutSession(payload);

          localStorage.setItem(
            'pendingCreditCardBooking',
            JSON.stringify({
              ticketData,
              summary,
              user,
              stripeSessionId: session?.sessionId || null
            })
          );

          if (session?.checkoutUrl) {
            window.location.href = session.checkoutUrl;
            return;
          }

          localStorage.removeItem('pendingCreditCardBooking');

          setMessage('Cannot redirect to credit card payment page.');
          setBooking(false);
          return;
      } else if (selectedPaymentMethod === 'sandbox') {
        const balance = getBalance();
        if (balance < summary.totalPrice) {
          setMessage(`Số dư ví Sandbox không đủ (hiện có: ${formatPrice(balance)}). Vui lòng thêm tiền vào ví.`);
          setBooking(false);
          return;
        }

        const success = pay(summary.totalPrice, `Thanh toán vé xem phim ${ticketData.movieTitle}`);
        if (!success) {
          setMessage('Thanh toán bằng ví Sandbox thất bại.');
          setBooking(false);
          return;
        }

        ticketData.paymentStatus = 'paid';
        ticketData.status = 'pending';
        const response = await bookTicket(ticketData);
        if (response) {
          createBookingSuccessNotification(user?.id || 'guest', ticketData);
          setMessage(t('BookingSuccess') || 'Đặt vé thành công!');
          setTimeout(() => {
            navigate('/tickets', { state: { reload: true } });
          }, 2000);
        }
      } else {
        setMessage('Phương thức thanh toán không được hỗ trợ. Vui lòng chọn phương thức khác.');
        setBooking(false);
        return;
      }

    } catch (error) {
      console.error('Error booking tickets:', error);
      setMessage('Booking Ticket failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (!showtime || !movie || !selectedSeats) {
    return (
      <div className="error-container">
        <h2>{t('NoBookingInformation')}</h2>
        <p>{t('BackAndTryAgain')}.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          {t('BackToHompage')}
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
          {t('Back')}
        </button>
        <h1>{t('ChooseCombo')}</h1>
      </div>

      <div className="combo-content">
        <div className="combo-selection">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>{t('Loadingcombolist...')}</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                {t('Tryagain')}
              </button>
            </div>
          ) : combos.length === 0 ? (
            <div className="no-combos-message">
              <p>{t('Currently there is no combo. Please try again later.')}</p>
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
          <h2>{t('OrderSummary')}</h2>

          <div className="summary-section">
            <h3>{t('TicketInformation')}</h3>
            <div className="summary-item">
              <span>{t('Movie')}:</span>
              <span>{movie?.title || movie?.name}</span>
            </div>
            <div className="summary-item">
              <span>{t('Showtime')}:</span>
              <span>{formatDate(showtime?.startTime)} - {formatTime(showtime?.startTime)}</span>
            </div>
            <div className="summary-item">
              <span>{t('Seat')}:</span>
              <span>{selectedSeats?.map(s => s.seatNumber).join(', ')}</span>
            </div>
            <div className="summary-item">
              <span>{t('TicketPrice')}:</span>
              <span>{formatPrice(getTicketPrice())}</span>
            </div>
          </div>

          {Object.keys(selectedCombos).length > 0 && (
            <div className="summary-section">
              <h3>{t('SelectedCombo')}</h3>
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

          <div className="summary-section discount-section">
            <h3>{t('Voucher')} / {t('Discount')}</h3>
            {user?.id ? (
              <div className="discount-card-row">
                <label className="discount-card-label">{t('DiscountCardFromCheckin')}</label>
                <select
                  className="discount-card-select"
                  value={selectedDiscountCard?.id || ''}
                  onChange={handleSelectDiscountCard}
                >
                  <option value="">{t('SelectDiscountCard')}</option>
                  {discountCards.map((card) => (
                    <option key={card.id} value={card.id}>{card.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="login-prompt">{t('PleaseLoginToUseVoucher')}</p>
            )}
            {getDiscountAmount() > 0 && (
              <div className="summary-item discount-item">
                <span>{t('Discount')}:</span>
                <span className="discount-value">-{formatPrice(getDiscountAmount())}</span>
              </div>
            )}
          </div>

          <div className="summary-section total">
            <div className="summary-item">
              <span>{t('Total')}:</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
          </div>

          <div className="payment-methods">
            <h3>{t('PaymentMethod')}</h3>
            <div className="payment-options">
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
                    <span className="payment-title">{t('VietQR')}</span>
                    <span className="payment-desc">{t('ScanQRtoPay')}</span>
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
                    <span className="payment-title">{t('MoMo')}</span>
                    <span className="payment-desc">{t('PayviaMoMo')}</span>
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
                    <span className="payment-title">{t('ZaloPay')}</span>
                    <span className="payment-desc">{t('PayviaZaloPay')}</span>
                  </div>
                </div>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="creditcard"
                  checked={selectedPaymentMethod === 'creditcard'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <div className="payment-option-content">
                  <div className="payment-icon">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/179/179457.png"
                      alt="Credit Card"
                      className="payment-icon-img"
                    />
                  </div>
                  <div className="payment-details">
                    <span className="payment-title">Credit Card</span>
                    <span className="payment-desc">Pay securely by card</span>
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
                {t('Processing...')}
              </>
            ) : (
              <>
                {t('ConfirmBooking')}
              </>
            )}
          </button>

          {message && (
            <div className={`message ${message.includes(t('Success')) ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComboSelectionPage;
