import './PaymentOrderDetail.css';
import { CreditCard, Calendar, User, Mail, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function PaymentOrderDetail({ order, onApprove, onReject, actionLoading }) {
  const { t } = useTranslation();
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
              <span className="payment-info-value order-id">{order.orderId}</span>
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
              <div className="payment-customer-value">{order.userId || t('N/A')}</div>
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
              <div className="payment-customer-value">{order.userEmail || t('N/A')}</div> 
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
                {order.status === 'pending' }
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
