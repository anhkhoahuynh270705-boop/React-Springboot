import './PaymentOrderDetail.css';
import { CreditCard, Calendar, User, Mail, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, FileText, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

function PaymentOrderDetail({ order, onApprove, onReject, actionLoading }) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);

  const maskOrderId = (id) => {
    if (!id) return 'N/A';
    const s = String(id);
    return s.length <= 8 ? s : `${s.slice(0, 4)}••••${s.slice(-4)}`;
  };
  const maskEmail = (email) => {
    if (!email) return 'N/A';
    const [local, domain] = email.split('@');
    if (!domain) return `${email.slice(0, 2)}••••`;
    const maskedLocal = local.length <= 2 ? local : `${local.slice(0, 2)}••`;
    return `${maskedLocal}@•••.${domain.split('.').slice(-1)}`;
  };
  const maskId = (id) => {
    if (!id) return 'N/A';
    const s = String(id);
    return s.length <= 4 ? s : `${s.slice(0, 4)}••••`;
  };

  if (!order) return (
    <div className="payment-order-detail-empty">
      <p>{t('No payment order information')}</p>
    </div>
  );

  return (
    <div className="payment-order-detail">
      <div className="payment-detail-header">
        <div className="payment-detail-title">
          <h3>{t('Payment order detail')}</h3>
        </div>
        <button
          className="view-btn"
          style={{ marginLeft: 'auto' }}
          title={revealed ? t('Hide sensitive info') : t('Reveal sensitive info')}
          onClick={() => setRevealed(prev => !prev)}
        >
          {revealed
            ? <><EyeOff size={15} style={{ marginRight: 4 }} /></>
            : <><Eye size={15} style={{ marginRight: 4 }} /></>
          }
        </button>
      </div>

      <div className="payment-detail-content">
        {/* Order Information */}
        <div className="payment-detail-section">
          <h4 className="payment-section-title">
            {t('Order information')}
          </h4>
          <div className="payment-info-grid">
            <div className="payment-info-item">
              <span className="payment-info-label">{t('Order ID')}</span>
              <span className="payment-info-value order-id">
                {revealed ? order.orderId : maskOrderId(order.orderId)}
              </span>
            </div>
            <div className="payment-info-item">
              <span className="payment-info-label">{t('Payment method')}</span>
              <span className="payment-info-value">{order.method || 'VietQR'}</span>
            </div>
            <div className="payment-info-item">
              <span className="payment-info-label">{t('Created date')}</span>
              <span className="payment-info-value">
                {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '-'}
              </span>
            </div>
            <div className="payment-info-item">
              <span className="payment-info-label">{t('Amount')}</span>
              <span className="payment-info-value amount">
                {order.amount?.toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>
        </div>

        {/* Order Description */}
        <div className="payment-detail-section">
          <h4 className="payment-section-title">
            {t('Order description')}
          </h4>
          <div className="payment-description-box">
            <p>{order.orderInfo || t('No description')}</p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="payment-detail-section">
          <h4 className="payment-section-title">
            {t('Customer information')}
          </h4>
          <div className="payment-customer-info">
            <div className="payment-customer-item">
              <div className="payment-customer-label">
                {t('Customer ID')}
              </div>
              <div className="payment-customer-value">
                {revealed ? (order.userId || t('N/A')) : maskId(order.userId)}
              </div>
            </div>
            <div className="payment-customer-item">
              <div className="payment-customer-label">
                {t('Customer name')}
              </div>
              <div className="payment-customer-value">{order.userName || t('N/A')}</div>
            </div>
            <div className="payment-customer-item">
              <div className="payment-customer-label">
                {t('Email')}
              </div>
              <div className="payment-customer-value">
                {revealed ? (order.userEmail || t('N/A')) : maskEmail(order.userEmail)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="payment-detail-section">
          <h4 className="payment-section-title">
            {t('Actions')}
          </h4>
          {order.status === 'pending' ? (
            <div className="payment-detail-actions">
              <button
                className="payment-detail-action-btn success"
                onClick={() => onApprove && onApprove(order.orderId)}
                disabled={actionLoading}
              >
                {t('Approve')}
              </button>
              <button
                className="payment-detail-action-btn danger"
                onClick={() => onReject && onReject(order.orderId)}
                disabled={actionLoading}
              >
                {t('Reject')}
              </button>
            </div>
          ) : (
            <div className="payment-detail-status-info">
              <span className="payment-status-label">{t('Current status')}:</span>
              <div className={`payment-status-pill ${order.status}`}>
                {order.status === 'paid'}
                {(order.status === 'expired' || order.status === 'failed')}
                {order.status === 'pending'}
                <span>{order.status}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentOrderDetail;
