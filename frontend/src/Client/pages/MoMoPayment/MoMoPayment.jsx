/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createMoMoOrder, queryMoMoOrder, cancelMoMoOrder } from '../../../services/momoService';
import { bookTicket } from '../../../services/ticketService';
import { createNotification, createBookingSuccessNotification } from '../../../services/notificationService';
import './MoMoPayment.css';
import { useTranslation } from 'react-i18next';

// Polling time intervals and timeout
const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 30 * 60 * 1000;

const MoMoPayment = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { ticketData, summary, description, user } = location.state || {};

  const [orderId, setOrderId] = useState('');
  const [payUrl, setPayUrl] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [status, setStatus] = useState('INITIAL');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(Math.floor(POLL_TIMEOUT_MS / 1000));
  const pollRef = useRef(null);
  const timeoutRef = useRef(null);
  const orderCreatedRef = useRef(false); // Prevent double order creation
  const orderIdRef = useRef('');        // Track latest orderId for cleanup
  const bookingDoneRef = useRef(false); // Prevent double booking on PAID

  const amount = useMemo(() => summary?.totalPrice || summary?.amount || ticketData?.price || 0, [summary, ticketData]);
  const orderDescription = useMemo(() => (
    description || `Booking ${ticketData?.movieTitle || 'Movie'} - ${ticketData?.seatNumber || ''}`
  ), [description, ticketData]);

  useEffect(() => {
    if (!ticketData || !amount) {
      setError(t('Missing order information.'));
      return;
    }

    // Prevent double order creation (React StrictMode or remount)
    if (orderCreatedRef.current) {
      return;
    }

    const createOrder = async () => {
      if (orderCreatedRef.current) {
        return;
      }

      orderCreatedRef.current = true;

      try {
        setStatus('PENDING');
        setError('');
        const userLabel = JSON.stringify({
          id: user?.id || 'guest',
          name: user?.name || user?.fullName || 'Guest',
          email: user?.email || ''
        });
        const res = await createMoMoOrder(userLabel, amount, orderDescription);
        if (!res || !res.orderId) throw new Error('Invalid create order response');
        setOrderId(res.orderId);
        orderIdRef.current = res.orderId; // keep ref in sync
        setPayUrl(res.payUrl || '');
        setQrUrl(res.qrUrl || '');
      } catch (e) {
        orderCreatedRef.current = false;
        setStatus('ERROR');
        setError(e?.message || t('Failed to create MoMo order'));
      }
    };

    createOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!orderId || status !== 'PENDING') return;

    const startTime = Date.now();

    pollRef.current = setInterval(async () => {
      try {
        const res = await queryMoMoOrder(orderId);
        const s = res?.status || res?.returnCode || 'PENDING';
        const statusNormalized = String(s).toUpperCase().trim();

        // Check if paid 
        if (statusNormalized === 'PAID' || statusNormalized === '1' || s === 1) {
          if (bookingDoneRef.current) return;
          bookingDoneRef.current = true;

          clearInterval(pollRef.current);
          clearTimeout(timeoutRef.current);
          setStatus('PAID');

          // Finalize booking
          try {
            const result = await bookTicket({
              ...ticketData,
              paymentMethod: 'momo',
              paymentStatus: 'paid',
              status: 'pending'
            });

            // Create notification
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
              state: { payment: 'success', ticketId: result?.id || null }
            });
          } catch (err) {
            setError('Payment confirmed, but booking failed. Please contact support.');
          }
        } else if (statusNormalized === 'EXPIRED' || statusNormalized === '-1' || s === -1) {
          clearInterval(pollRef.current);
          clearTimeout(timeoutRef.current);
          setStatus('EXPIRED');
        } else {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setTimeLeft(Math.max(0, Math.floor(POLL_TIMEOUT_MS / 1000) - elapsed));
        }
      } catch (e) {
        // ignore transient errors, keep polling
      }
    }, POLL_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      if (pollRef.current) clearInterval(pollRef.current);
      setStatus('EXPIRED');
    }, POLL_TIMEOUT_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [orderId, status, navigate, ticketData]);

  const handleBack = async () => {
    // Cancel the pending order before leaving so it won't appear in Payment Management
    const currentOrderId = orderIdRef.current;
    if (currentOrderId && status === 'PENDING') {
      await cancelMoMoOrder(currentOrderId);
    }
    navigate(-1);
  };

  const handleOpenMoMo = () => {
    alert('Vui lòng mở ứng dụng MoMo và quét mã QR code ở trên để thanh toán.');
  };

  const handleRetry = () => {
    navigate(0);
  };

  if (error && status === 'ERROR') {
    return (
      <div className="momo-payment-page">
        <div className="momo-card">
          <h2>Thanh toán MoMo</h2>
          <p className="momo-error">{error}</p>
          <div className="momo-actions">
            <button className="momo-btn" onClick={() => navigate(-1)}>Quay lại</button>
            <button className="momo-btn momo-primary" onClick={handleRetry}>Thử lại</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="momo-payment-page">
      <div className="momo-card">
        <h2>Thanh toán MoMo</h2>
        <div className="momo-order">
          <div>
            <span>Số tiền</span>
            <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)}</strong>
          </div>
          <div>
            <span>Mô tả</span>
            <strong>{orderDescription}</strong>
          </div>
          {!!orderId && (
            <div>
              <span>Mã đơn hàng</span>
              <strong>{orderId}</strong>
            </div>
          )}
        </div>

        <div className="momo-qr">
          {qrUrl ? (
            <img src={qrUrl} alt="MoMo QR" className="momo-qr-img" />
          ) : (
            <div className="momo-qr-ph">Đang tạo mã QR...</div>
          )}
        </div>

        <div className="momo-instructions">
          <p className="momo-instruction-text">
            <strong>Hướng dẫn thanh toán:</strong>
          </p>
          <ol className="momo-instruction-steps">
            <li>Mở ứng dụng MoMo trên điện thoại</li>
            <li>Chọn chức năng "Quét QR"</li>
            <li>Quét mã QR MoMo ở trên</li>
            <li>Nhập đúng số tiền hiển thị</li>
            <li>Nhập nội dung chuyển tiền là mã đơn hàng:
              <strong>{orderId}</strong>
            </li>
            <li>Sau khi chuyển khoản thành công , vui lòng chờ 5-10 phút</li>
            <li>Nếu chưa nhận được, vui lòng liên hệ admin</li>
          </ol>
        </div>

        <div className="momo-actions">
          <button className="momo-btn" onClick={handleBack}>Quay lại</button>
        </div>

        {status === 'PENDING' && (
          <div className="momo-status momo-pending">Đang chờ xác nhận thanh toán... {timeLeft}s</div>
        )}
        {status === 'PAID' && (
          <div className="momo-status momo-success">Thanh toán thành công. Đang hoàn tất đặt vé...</div>
        )}
        {status === 'EXPIRED' && (
          <div className="momo-status momo-expired">
            Đơn hàng đã hết hạn. Vui lòng thử lại.
            <div className="momo-actions-inline">
              <button className="momo-btn" onClick={handleRetry}>Tạo đơn hàng mới</button>
            </div>
          </div>
        )}

        {error && status !== 'ERROR' && <div className="momo-error">{error}</div>}
      </div>
    </div>
  );
};

export default MoMoPayment;

