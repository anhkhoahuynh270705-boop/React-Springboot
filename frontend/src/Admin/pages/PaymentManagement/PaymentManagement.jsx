/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import './PaymentManagement.css';
import { CreditCard, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Eye, Filter, Search, Calendar, User, Mail, Phone } from 'lucide-react';
import { getAllOrders, markPaid, markExpired } from '../../../services/paymentService';
import React from 'react';
import { useState, useEffect } from 'react';
import { markMoMoPaid, markMoMoExpired, getAllMoMoOrders } from '../../../services/momoService';
import { getAllZaloPayOrders, markZaloPayPaid, markZaloPayExpired } from '../../../services/zaloPayService';
import PaymentOrderDetail from './PaymentOrderDetail';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/Toast/ToastContainer';
import { useTranslation } from 'react-i18next';

function PaymentManagement() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch all types of orders in parallel
      const [paymentOrders, momoOrders, zaloPayOrders] = await Promise.allSettled([
        getAllOrders().catch(() => []),
        getAllMoMoOrders().catch(() => []),
        getAllZaloPayOrders().catch(() => [])
      ]);

      // Normalize and merge all orders
      const allOrders = [];

      // PaymentOrders
      if (paymentOrders.status === 'fulfilled' && Array.isArray(paymentOrders.value)) {
        paymentOrders.value.forEach(order => {
          allOrders.push({
            orderId: order.orderId,
            amount: order.amount,
            orderInfo: order.orderInfo,
            method: order.method || 'vietqr',
            status: order.status?.toLowerCase() || 'pending',
            userId: order.userId,
            userName: order.userName,
            userEmail: order.userEmail,
            createdAt: order.createdAt,
            type: 'payment'
          });
        });
      }

      // MoMoOrders - format: { orderId, amount, description, status, userLabel, createdAt }
      if (momoOrders.status === 'fulfilled' && Array.isArray(momoOrders.value)) {
        momoOrders.value.forEach(order => {
          let uId = order.userLabel;
          let uName = order.userLabel;
          let uEmail = order.userLabel?.includes('@') ? order.userLabel : '';
          try {
            const parsed = JSON.parse(order.userLabel);
            if (parsed && parsed.id) {
              uId = parsed.id;
              uName = parsed.name || parsed.id;
              uEmail = parsed.email || '';
            }
          } catch (e) {
            // Not a JSON string
          }
          allOrders.push({
            orderId: order.orderId,
            amount: order.amount,
            orderInfo: order.description,
            method: 'momo',
            status: order.status?.toLowerCase() || 'pending',
            userId: uId,
            userName: uName,
            userEmail: uEmail,
            createdAt: order.createdAt,
            type: 'momo'
          });
        });
      }

      // ZaloPayOrders
      if (zaloPayOrders.status === 'fulfilled' && Array.isArray(zaloPayOrders.value)) {
        zaloPayOrders.value.forEach(order => {
          let uId = order.userLabel;
          let uName = order.userLabel;
          let uEmail = order.userLabel?.includes('@') ? order.userLabel : '';
          try {
            const parsed = JSON.parse(order.userLabel);
            if (parsed && parsed.id) {
              uId = parsed.id;
              uName = parsed.name || parsed.id;
              uEmail = parsed.email || '';
            }
          } catch (e) {
            // Not a JSON string
          }
          allOrders.push({
            orderId: order.appTransId,
            amount: order.amount,
            orderInfo: order.description,
            method: 'zalopay',
            status: order.status?.toLowerCase() || 'pending',
            userId: uId,
            userName: uName,
            userEmail: uEmail,
            createdAt: order.createdAt,
            type: 'zalopay'
          });
        });
      }

      // Sort by createdAt (newest first)
      allOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setOrders(allOrders);
      setError(null);
    } catch (e) {
      setError(e.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleMark = async (id, status, method) => {
    setActionLoading(l => ({ ...l, [id]: true }));
    try {
      const isMoMoOrder = method === 'momo' && id && id.startsWith('MM-');
      const isZaloPayOrder = method === 'zalopay' && id && id.startsWith('ZP-');

      if (isMoMoOrder) {
        // Handle MoMo orders
        if (status === 'paid') {
          await markMoMoPaid(id);
        } else {
          await markMoMoExpired(id);
        }
      } else if (isZaloPayOrder) {
        // Handle ZaloPay orders
        if (status === 'paid') {
          await markZaloPayPaid(id);
        } else {
          await markZaloPayExpired(id);
        }
      } else {
        // Handle PaymentOrders
        if (status === 'paid') {
          await markPaid(id);
        } else {
          await markExpired(id);
        }
      }

      try {
        localStorage.setItem('paymentStatusUpdate', JSON.stringify({ orderId: id, status: status, ts: Date.now() }));
        setTimeout(() => localStorage.removeItem('paymentStatusUpdate'), 50);
      } catch (_) { }

      // Show success toast
      const successMessage = status === 'paid'
        ? t('Payment confirmed successfully!')
        : t('Payment expired successfully!');

      showSuccess(successMessage, 3000);

      await fetchOrders();
    } catch (e) {
      showError(`Lỗi: ${e.message}`, 5000);
    } finally {
      setActionLoading(l => ({ ...l, [id]: false }));
    }
  };

  const getStatusIcon = () => null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'expired': return '#ef4444';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderInfo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    expired: orders.filter(o => o.status === 'expired').length,
    totalAmount: orders.reduce((sum, o) => sum + (o.amount || 0), 0)
  };

  return (
    <div className="payment-management">
      {/* Header Section */}
      <div className="payment-header">
        <div className="header-content">
          <div className="header-title">
          </div>
          <div className="header-actions">
            <button
              className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">{t('Total orders')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">{t('Pending payment')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon paid">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.paid}</div>
            <div className="stat-label">{t('Paid')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon expired">
            <XCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.expired}</div>
            <div className="stat-label">{t('Expired')}</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={t('Search by order ID, email, information...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">{t('All status')}</option>
            <option value="pending">{t('Pending payment')}</option>
            <option value="paid">{t('Paid')}</option>
            <option value="expired">{t('Expired')}</option>
            <option value="failed">{t('Failed')}</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="payment-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('Loading data...')}</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <AlertCircle size={48} />
            <p>{error}</p>
            <button onClick={fetchOrders} className="retry-btn">{t('Try again')}</button>
          </div>
        ) : (
          <div className="payment-layout">
            {/* Orders Table */}
            <div className="orders-section">
              <div className="section-header">
                <h2>{t('Order list')} ({filteredOrders.length})</h2>
              </div>
              <div className="table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>{t('Order ID')}</th>
                      <th>{t('Customer')}</th>
                      <th>{t('Information')}</th>
                      <th>{t('Amount')}</th>
                      <th>{t('Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="no-data">
                          <div className="no-data-content">
                            <CreditCard size={48} />
                            <p>{t('No orders found')}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr
                          key={order.orderId}
                          className={`order-row ${selectedOrder?.orderId === order.orderId ? 'selected' : ''}`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="order-id">
                            <div className="id-content">
                              <span className="id-text">{order.orderId}</span>
                              <button
                                className="view-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                }}
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                          <td className="customer-info">
                            <div className="customer-details">
                              <div className="customer-email">
                                <Mail size={14} />
                                {order.userEmail || 'N/A'}
                              </div>
                              <div className="customer-name">
                                <User size={14} />
                                {order.userName || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="order-info">
                            <div className="info-text" title={order.orderInfo}>
                              {order.orderInfo?.length > 50
                                ? `${order.orderInfo.substring(0, 50)}...`
                                : order.orderInfo || 'N/A'
                              }
                            </div>
                          </td>
                          <td className="amount">
                            <span className="amount-value">
                              {order.amount?.toLocaleString('vi-VN')}₫
                            </span>
                          </td>
                          <td className="status">
                            <div
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(order.status) }}
                            >

                              <span>{order.status}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Detail Sidebar */}
            <div className="detail-section">
              {selectedOrder ? (
                <div className="detail-card">
                  <PaymentOrderDetail
                    order={selectedOrder}
                    onApprove={(orderId) => handleMark(orderId, 'paid', selectedOrder.method)}
                    onReject={(orderId) => handleMark(orderId, 'expired', selectedOrder.method)}
                    actionLoading={actionLoading[selectedOrder.orderId]}
                  />
                </div>
              ) : (
                <div className="no-selection">

                  <p>{t('Select an order to view details')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default PaymentManagement;
