import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { confirmCreditCardBooking } from '../../../services/creditCardService';
import { createBookingSuccessNotification, createNotification } from '../../../services/notificationService';
import './PaymentSuccess.css';

const PENDING_KEY = 'pendingCreditCardBooking';

function getBookingGuardKey(sessionId) {
  return `creditcard-booked:${sessionId}`;
}

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Processing payment...');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setMessage('Invalid payment session.');
      return;
    }

    const guardKey = getBookingGuardKey(sessionId);

    if (sessionStorage.getItem(guardKey) === '1') {
      navigate('/tickets', {
        replace: true,
        state: { payment: 'success', method: 'creditcard' }
      });
      return;
    }

    if (sessionStorage.getItem(guardKey) === 'processing') {
      return;
    }

    const raw = localStorage.getItem(PENDING_KEY);

    if (!raw) {
      setMessage('No pending booking found.');
      return;
    }

    sessionStorage.setItem(guardKey, 'processing');
    localStorage.removeItem(PENDING_KEY);

    const finalize = async () => {
      try {
        const { ticketData, user } = JSON.parse(raw);

        const ticket = await confirmCreditCardBooking(sessionId, {
          ...ticketData,
          paymentMethod: 'CreditCard',
          paymentStatus: 'paid',
          status: 'pending'
        });

        sessionStorage.setItem(guardKey, '1');

        try {
          const notificationPayload = createBookingSuccessNotification(
            user?.id || ticketData.userId || 'guest',
            ticketData.movieTitle,
            ticketData.seatNumber,
            ticketData.showTime
          );
          await createNotification(notificationPayload);
        } catch (e) {
          console.warn('Create notification failed:', e);
        }

        setMessage('Payment successful. Your ticket is waiting for admin approval.');

        setTimeout(() => {
          navigate('/tickets', {
            replace: true,
            state: {
              payment: 'success',
              ticketId: ticket?.id || null,
              method: 'CreditCard'
            }
          });
        }, 1000);
      } catch (error) {
        console.error('Create ticket after payment failed:', error);

        sessionStorage.removeItem(guardKey);
        localStorage.setItem(PENDING_KEY, raw);

        setMessage('Payment succeeded, but ticket creation failed. Please contact support.');
      }
    };

    finalize();
  }, [navigate, searchParams]);

  const statusMessage = String(message || '');

  const tone = /successful|success|paid/i.test(statusMessage)
    ? 'success'
    : /invalid|failed|error|no pending/i.test(statusMessage)
    ? 'error'
    : 'pending';

  const renderIcon = () => {
    if (tone === 'success') {
      return <CheckCircle size={44} strokeWidth={2.2} />;
    }

    if (tone === 'error') {
      return <AlertTriangle size={44} strokeWidth={2.2} />;
    }

    return <Loader2 size={44} strokeWidth={2.2} className="payment-success-spin" />;
  };

  return (
    <main className="payment-success-page">
      <section className="payment-success-card" aria-live="polite">
        <div className={`payment-success-icon ${tone}`}>
          {renderIcon()}
        </div>

        <p className="payment-success-eyebrow">Payment status</p>

        <h1 className="payment-success-title">
          {tone === 'success'
            ? 'Thanh toán thành công'
            : tone === 'error'
            ? 'Thanh toán cần hỗ trợ'
            : 'Đang xử lý thanh toán'}
        </h1>

        <p className="payment-success-message">{message}</p>

        <p className="payment-success-meta">
          {tone === 'success'
            ? 'Vé của bạn đang chờ xác nhận từ admin. Bạn sẽ được chuyển hướng ngay sau đây.'
            : tone === 'error'
            ? 'Giao dịch cần được kiểm tra lại. Vui lòng liên hệ hỗ trợ nếu tiền đã bị trừ.'
            : 'Hệ thống đang hoàn tất giao dịch của bạn. Vui lòng đợi trong giây lát.'}
        </p>
      </section>
    </main>
  );
}

export default PaymentSuccess;