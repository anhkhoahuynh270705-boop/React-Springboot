import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Search,
  RefreshCw,
  Eye,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  getAllTickets, 
  updateTicketStatus
} from '../../../services/adminService';
import { approveTicket } from '../../../services/ticketService';
import { createNotification, createTicketApprovedNotification, createTicketCancelledNotification } from '../../../services/notificationService';
import useToast from '../../hooks/useToast';
import ToastContainer from '../Toast/ToastContainer';
import styles from './TicketManagement.module.css';

const TicketManagement = () => {
  const { showSuccess, showError, showWarning, showInfo, toasts, removeToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const ticketsData = await getAllTickets();
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      showError('Lỗi khi tải danh sách vé: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.cinemaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectTicket = (ticketId) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(ticket => ticket.id));
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      if (newStatus === 'confirmed') {
        await approveTicket(ticketId);
        await createTicketApprovedNotification(ticketId);
        showSuccess('Duyệt vé thành công!');
      } else {
        await updateTicketStatus(ticketId, newStatus);
        if (newStatus === 'cancelled') {
          await createTicketCancelledNotification(ticketId);
        }
        showSuccess('Cập nhật trạng thái vé thành công!');
      }
      await fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      showError('Cập nhật trạng thái vé thất bại: ' + error.message);
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedTickets.length === 0) {
      showWarning('Vui lòng chọn ít nhất một vé');
      return;
    }

    try {
      for (const ticketId of selectedTickets) {
        if (newStatus === 'confirmed') {
          await approveTicket(ticketId);
          await createTicketApprovedNotification(ticketId);
        } else {
          await updateTicketStatus(ticketId, newStatus);
          if (newStatus === 'cancelled') {
            await createTicketCancelledNotification(ticketId);
          }
        }
      }
      setSelectedTickets([]);
      showSuccess(`Cập nhật trạng thái ${selectedTickets.length} vé thành công!`);
      await fetchTickets();
    } catch (error) {
      console.error('Error bulk updating tickets:', error);
      showError('Cập nhật trạng thái vé thất bại: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return { text: 'Đã xác nhận', class: 'status-confirmed', icon: CheckCircle };
      case 'pending':
        return { text: 'Chờ xác nhận', class: 'status-pending', icon: Clock };
      case 'cancelled':
        return { text: 'Đã hủy', class: 'status-cancelled', icon: XCircle };
      case 'used':
        return { text: 'Đã sử dụng', class: 'status-used', icon: CheckCircle };
      default:
        return { text: 'Không xác định', class: 'status-unknown', icon: Clock };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Chưa cập nhật';
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải danh sách vé...</p>
      </div>
    );
  }

  return (
    <div className={styles.ticketManagement}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className={styles.header}>
        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm vé..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className={styles.statusFilters}>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`}
            onClick={() => handleStatusFilter('all')}
          >
            Tất cả ({tickets.length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'pending' ? styles.active : ''}`}
            onClick={() => handleStatusFilter('pending')}
          >
            Chờ xác nhận ({tickets.filter(t => t.status === 'pending').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'confirmed' ? styles.active : ''}`}
            onClick={() => handleStatusFilter('confirmed')}
          >
            Đã xác nhận ({tickets.filter(t => t.status === 'confirmed').length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === 'cancelled' ? styles.active : ''}`}
            onClick={() => handleStatusFilter('cancelled')}
          >
            Đã hủy ({tickets.filter(t => t.status === 'cancelled').length})
          </button>
          </div>
          <button 
            className={styles.refreshButton} 
            onClick={fetchTickets}
            title="Làm mới"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {selectedTickets.length > 0 && (
          <div className={styles.bulkActions}>
            <span>{selectedTickets.length} vé được chọn</span>
            <button
              className={styles.bulkBtn}
              onClick={() => handleBulkStatusUpdate('confirmed')}
            >
              <CheckCircle size={16} />
              Duyệt tất cả
            </button>
            <button
              className={`${styles.bulkBtn} ${styles.cancelBtn}`}
              onClick={() => handleBulkStatusUpdate('cancelled')}
            >
              <XCircle size={16} />
              Hủy tất cả
            </button>
          </div>
        )}

        <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <button
                  className={styles.selectAllBtn}
                  onClick={handleSelectAll}
                >
                  {selectedTickets.length === filteredTickets.length ? 
                    <CheckSquare size={16} /> : 
                    <Square size={16} />
                  }
                </button>
              </th>
              <th>Mã vé</th>
              <th>Phim</th>
              <th>Rạp</th>
              <th>Ghế</th>
              <th>Giá vé</th>
              <th>Ngày chiếu</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => {
              const statusBadge = getStatusBadge(ticket.status);
              const StatusIcon = statusBadge.icon;
              return (
                <tr key={ticket.id}>
                  <td>
                    <button
                      className={styles.selectBtn}
                      onClick={() => handleSelectTicket(ticket.id)}
                    >
                      {selectedTickets.includes(ticket.id) ? 
                        <CheckSquare size={16} /> : 
                        <Square size={16} />
                      }
                    </button>
                  </td>
                  <td>{ticket.ticketNumber}</td>
                  <td>
                    <div className={styles.movieInfo}>
                      <div className={styles.movieTitle}>{ticket.movieTitle}</div>
                      <div className={styles.movieTime}>{ticket.showTime}</div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.cinemaInfo}>
                      <div className={styles.cinemaName}>{ticket.cinemaName}</div>
                      <div className={styles.cinemaAddress}>{ticket.cinemaAddress}</div>
                    </div>
                  </td>
                  <td>{ticket.seatNumber}</td>
                  <td className={styles.price}>{formatCurrency(ticket.price)}</td>
                  <td>{formatDate(ticket.showDate)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[statusBadge.class]}`}>
                      <StatusIcon size={14} />
                      {statusBadge.text}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => handleViewTicket(ticket)}
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      {ticket.status === 'pending' && (
                        <button
                          className={`${styles.actionBtn} ${styles.approveBtn}`}
                          onClick={() => handleStatusUpdate(ticket.id, 'confirmed')}
                          title="Duyệt vé"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {ticket.status !== 'cancelled' && ticket.status !== 'used' && (
                        <button
                          className={`${styles.actionBtn} ${styles.cancelBtn}`}
                          onClick={() => handleStatusUpdate(ticket.id, 'cancelled')}
                          title="Hủy vé"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredTickets.length === 0 && (
        <div className={styles.emptyState}>
          <Ticket size={48} />
          <h3>Không có vé nào</h3>
          <p>Chưa có vé nào phù hợp với bộ lọc</p>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Chi tiết vé</h3>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowTicketModal(false);
                  setSelectedTicket(null);
                }}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.ticketInfo}>
                <div className={styles.infoRow}>
                  <label>Mã vé:</label>
                  <span>{selectedTicket.ticketNumber}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Phim:</label>
                  <span>{selectedTicket.movieTitle}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Rạp:</label>
                  <span>{selectedTicket.cinemaName}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Địa chỉ:</label>
                  <span>{selectedTicket.cinemaAddress}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Ghế:</label>
                  <span>{selectedTicket.seatNumber}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Giá vé:</label>
                  <span className={styles.price}>{formatCurrency(selectedTicket.price)}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Ngày chiếu:</label>
                  <span>{formatDate(selectedTicket.showDate)}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Giờ chiếu:</label>
                  <span>{selectedTicket.showTime}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Trạng thái:</label>
                  <span className={`${styles.statusBadge} ${styles[getStatusBadge(selectedTicket.status).class]}`}>
                    {getStatusBadge(selectedTicket.status).text}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <label>Phương thức thanh toán:</label>
                  <span>{selectedTicket.paymentMethod}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Ngày đặt:</label>
                  <span>{formatDate(selectedTicket.bookingTime)}</span>
                </div>
                {selectedTicket.notes && (
                  <div className={styles.infoRow}>
                    <label>Ghi chú:</label>
                    <span>{selectedTicket.notes}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <div className={styles.modalActions}>
                {selectedTicket.status === 'pending' && (
                  <button
                    className={`${styles.actionBtn} ${styles.approveBtn}`}
                    onClick={() => {
                      handleStatusUpdate(selectedTicket.id, 'confirmed');
                      setShowTicketModal(false);
                      setSelectedTicket(null);
                    }}
                  >
                    <CheckCircle size={16} />
                    Duyệt vé
                  </button>
                )}
                {selectedTicket.status !== 'cancelled' && selectedTicket.status !== 'used' && (
                  <button
                    className={`${styles.actionBtn} ${styles.cancelBtn}`}
                    onClick={() => {
                      handleStatusUpdate(selectedTicket.id, 'cancelled');
                      setShowTicketModal(false);
                      setSelectedTicket(null);
                    }}
                  >
                    <XCircle size={16} />
                    Hủy vé
                  </button>
                )}
                <button
                  className={`${styles.actionBtn} ${styles.closeBtn}`}
                  onClick={() => {
                    setShowTicketModal(false);
                    setSelectedTicket(null);
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManagement;
