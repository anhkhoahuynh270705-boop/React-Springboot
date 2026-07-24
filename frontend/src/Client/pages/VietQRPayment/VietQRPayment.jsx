/* eslint-disable no-unused-vars */
import { bookTicket } from '../../../services/ticketService';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { QrCode, ArrowLeft, CheckCircle, Clock, Copy, RefreshCw } from 'lucide-react';
import { createNotification, createBookingSuccessNotification } from '../../../services/notificationService';
import { createPaymentOrder, verifyPayment, cancelPaymentOrder } from '../../../services/paymentService';
import './VietQRPayment.css';
import { useTranslation } from 'react-i18next';

const VietQRPayment = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const payload = location.state || {};

  const {
    ticketData,
    summary,
    orderId,
    amount
  } = payload;

  const [qrCode, setQrCode] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [timeLeft, setTimeLeft] = useState(900);
  const [isChecking, setIsChecking] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(orderId || null);
  const initializedRef = useRef(false);
  const finalizedRef = useRef(false);
  const checkIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const currentOrderIdRef = useRef(orderId || null);
  const handlePaymentSuccessRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  const isOrderAlreadyBooked = useCallback((id) => {
    if (!id) return false;
    try {
      return sessionStorage.getItem(`vietqr-booked:${id}`) === '1';
    } catch {
      return false;
    }
  }, []);

  const markOrderBooked = useCallback((id) => {
    if (!id) return;
    try {
      sessionStorage.setItem(`vietqr-booked:${id}`, '1');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    currentOrderIdRef.current = currentOrderId;
  }, [currentOrderId]);

  useEffect(() => {
    if (!ticketData) {
      navigate('/');
      return;
    }

    if (orderId && isOrderAlreadyBooked(orderId)) {
      navigate('/tickets', { replace: true, state: { payment: 'success', method: 'vietqr' } });
      return;
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      if (orderId) {
        setCurrentOrderId(orderId);
        currentOrderIdRef.current = orderId;
        if (payload?.qrUrl) setQrUrl(payload.qrUrl);
        if (payload?.qrData && !payload?.qrUrl) setQrCode(payload.qrData);
      } else {
        initializeOrder();
      }
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setPaymentStatus('expired');
          if (timerRef.current) clearInterval(timerRef.current);
          stopPolling();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    checkIntervalRef.current = setInterval(() => {
      checkPaymentStatusRef.current?.();
    }, 2500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Confirm paid from admin 
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== 'paymentStatusUpdate' || !e.newValue) return;
      try {
        const data = JSON.parse(e.newValue);
        const activeOrderId = currentOrderIdRef.current;
        if (data?.orderId && data.orderId === activeOrderId && data?.status === 'paid') {
          setPaymentStatus('paid');
          stopPolling();
          handlePaymentSuccessRef.current?.();
        }
      } catch (_) {
        // ignore parsing errors
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [stopPolling]);

  const resolveAmountVnd = () => {
    const raw = amount ?? summary?.totalPrice ?? ticketData?.price ?? 0;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.round(n) : 0;
  };

  const getSeatText = () => {
    const seat = ticketData?.seatNumber;
    if (Array.isArray(seat)) return seat.join(',');
    return seat ?? 'Seat';
  };

  const initializeOrder = async () => {
    try {
      const amountVnd = resolveAmountVnd();
      if (!amountVnd || amountVnd <= 0) {
        alert('Invalid payment amount.');
        return;
      }
      const payload = {
        amount: Number(amountVnd) || 0,
        orderInfo: `${ticketData?.movieTitle || 'Movie'} ${getSeatText()}`.trim(),
        method: 'vietqr',
        userId: String(ticketData?.userId || `guest-${Date.now()}`),
        userName: String(ticketData?.userName || ticketData?.userFullName || 'Guest'),
        userEmail: String(ticketData?.userEmail || 'guest@example.com'),
      };
      const res = await createPaymentOrder(payload);
      if (res?.orderId) {
        setCurrentOrderId(res.orderId);
        currentOrderIdRef.current = res.orderId;
      }
      if (res?.qrUrl) setQrUrl(res.qrUrl);
      if (res?.qrData) setQrCode(res.qrData);
      setPaymentStatus('pending');
      setTimeLeft(900);
    } catch (e) {
      console.error('Create order failed:', e);
      setQrUrl('');
    }
  };

  const checkPaymentStatusRef = useRef(null);

  const checkPaymentStatus = async () => {
    if (finalizedRef.current || isChecking) return;
    const activeOrderId = currentOrderIdRef.current;
    if (!activeOrderId) return;
    if (isOrderAlreadyBooked(activeOrderId)) return;

    setIsChecking(true);
    try {
      const result = await verifyPayment({ orderId: activeOrderId });
      if (result?.status === 'paid') {
        setPaymentStatus('paid');
        stopPolling();
        await handlePaymentSuccessRef.current?.();
      } else if (result?.status === 'expired') {
        setPaymentStatus('expired');
        stopPolling();
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (finalizedRef.current) return;

    const activeOrderId = currentOrderIdRef.current;
    if (isOrderAlreadyBooked(activeOrderId)) {
      finalizedRef.current = true;
      stopPolling();
      navigate('/tickets', { replace: true, state: { payment: 'success', method: 'vietqr' } });
      return;
    }

    finalizedRef.current = true;
    markOrderBooked(activeOrderId);
    stopPolling();

    try {
      // Information ticket
      const seatNumberStr = Array.isArray(ticketData?.seatNumber) ? ticketData.seatNumber.join(', ') : (ticketData?.seatNumber || '');
      const seatIdStr = Array.isArray(ticketData?.seatId) ? ticketData.seatId.join(', ') : (ticketData?.seatId || seatNumberStr);
      const showTimeIso = ticketData?.showTime || new Date().toISOString();
      const showDateIso = ticketData?.showDate || new Date(showTimeIso).toISOString().split('T')[0];
      const moviePoster = ticketData?.moviePoster || ticketData?.movieThumbnail || '/default-movie.jpg';
      const finalTicket = {
        userId: ticketData?.userId,
        showtimeId: ticketData?.showtimeId,
        seatId: seatIdStr,
        seatNumber: seatNumberStr,
        movieId: ticketData?.movieId,
        movieTitle: ticketData?.movieTitle || ticketData?.movieName || 'Movie',
        moviePoster,
        movieThumbnail: ticketData?.movieThumbnail || moviePoster,
        cinemaName: ticketData?.cinemaName || 'Movie Theater',
        cinemaAddress: ticketData?.cinemaAddress || '',
        showDate: showDateIso,
        showTime: showTimeIso,
        price: Number(resolveAmountVnd()),
        status: 'pending',
        paymentMethod: 'vietqr',
        paymentStatus: 'paid',
        isRefundable: true,
        notes: ticketData?.notes || ''
      };
      const result = await bookTicket(finalTicket);
      try {
        const notificationData = createBookingSuccessNotification(
          ticketData.userId,
          ticketData.movieTitle,
          ticketData.seatNumber,
          ticketData.showTime
        );
        await createNotification(notificationData);
      } catch (e) {
        console.warn('Create notification failed:', e);
      }
      navigate('/tickets', {
        replace: true,
        state: {
          payment: 'success',
          ticketId: result?.id || null,
          method: 'vietqr'
        }
      });
    } catch (error) {
      finalizedRef.current = false;
      try {
        if (activeOrderId) sessionStorage.removeItem(`vietqr-booked:${activeOrderId}`);
      } catch {
        // ignore
      }
      navigate('/tickets', { replace: true });
    }
  };

  handlePaymentSuccessRef.current = handlePaymentSuccess;
  checkPaymentStatusRef.current = checkPaymentStatus;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      alert('Could not copy. Please try again..');
    });
  };

  const handleRefresh = () => {
    initializeOrder();
  };

  const handleBack = async () => {
    // Cancel the pending VietQR order before leaving so it won't appear in Payment Management
    const activeOrderId = currentOrderIdRef.current;
    if (activeOrderId && paymentStatus === 'pending') {
      await cancelPaymentOrder(activeOrderId);
    }
    navigate(-1);
  };

  if (!ticketData) {
    return (
      <div className="vietqr-container">
        <div className="error-message">
          <h2>{t('Error')}</h2>
          <p>{t('No booking information found. Please try again')}.</p>
          <button onClick={() => navigate('/')} className="back-btn">
            {t('Back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vietqr-container">
      <div className="vietqr-header">
        <button onClick={handleBack} className="back-button">
          <ArrowLeft size={20} />
          {t('Back')}
        </button>
        <h1>{t('VietQR Payment')}</h1>
      </div>

      <div className="vietqr-content">
        {/* Order Summary */}
        <div className="order-summary">
          <h3>{t('Order information')}</h3>
          <div className="summary-item">
            <span>{t('Movie')}:</span>
            <strong>{ticketData.movieTitle}</strong>
          </div>
          <div className="summary-item">
            <span>{t('Seat')}:</span>
            <strong>{ticketData.seatNumber}</strong>
          </div>
          <div className="summary-item">
            <span>{t('Showtime')}:</span>
            <strong>{new Date(ticketData.showTime).toLocaleString('vi-VN')}</strong>
          </div>
          <div className="summary-item total">
            <span>{t('Total')}:</span>
            <strong>{new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(resolveAmountVnd())}</strong>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="qr-section">
          <div className="qr-header">
            <QrCode size={24} />
            <h3>{t('Scan QR code to pay')}</h3>
          </div>

          <div className="qr-code-container">
            {paymentStatus === 'pending' ? (
              <div className="qr-code">
                {qrUrl ? (
                  <img src={qrUrl} alt="VietQR" style={{ width: 220, height: 220 }} />
                ) : (
                  <div className="qr-placeholder">
                    <QrCode size={120} />
                    <p>{t('Payment QR code')}</p>
                    <small>{t('Scan with banking app')}</small>
                  </div>
                )}
              </div>
            ) : paymentStatus === 'paid' ? (
              <div className="qr-success">
                <CheckCircle size={120} className="success-icon" />
                <p>{t('Payment successful!')}</p>
              </div>
            ) : (
              <div className="qr-expired">
                <Clock size={120} className="expired-icon" />
                <p>{t('QR code has expired')}</p>
                <button onClick={handleRefresh} className="refresh-btn">
                  <RefreshCw size={16} />
                  {t('Create new code')}
                </button>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="payment-details">
            <div className="detail-row">
              <span>{t('Bank')}:</span>
              <span>Techcombank</span>
            </div>
            <div className="detail-row">
              <span>{t('Account number')}:</span>
              <span>1221868856</span>
              <button
                onClick={() => copyToClipboard('1221868856')}
                className="copy-btn"
                title={t('Copy')}
              >
                <Copy size={16} />
              </button>
            </div>
            <div className="detail-row">
              <span>{t('Content')}:</span>
              <span>{ticketData.movieTitle} {getSeatText()}</span>
              <button
                onClick={() => copyToClipboard(`${ticketData.movieTitle} ${getSeatText()}`)}
                className="copy-btn"
                title={t('Copy')}
              >
                <Copy size={16} />
              </button>
            </div>
            <div className="detail-row">
              <span>{t('Amount')}:</span>
              <span>{new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(resolveAmountVnd())}</span>
            </div>
          </div>

          {/* Timer */}
          {paymentStatus === 'pending' && (
            <div className="timer-section">
              <Clock size={20} />
              <span>{t('Time left')}: {formatTime(timeLeft)}</span>
              {isChecking && (
                <div className="checking-indicator">
                  <RefreshCw size={16} className="spinning" />
                  <span>{t('Checking payment...')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="instructions">
          <h4>{t('Payment instructions')}:</h4>
          <ol>
            <li>{t('Open banking app on phone')}</li>
            <li>{t('Select "QR Code" or "VietQR" function')}</li>
            <li>{t('Scan QR code above')}</li>
            <li>{t('Check information and confirm payment')}</li>
            <li>{t('Wait for system confirmation')}</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default VietQRPayment;