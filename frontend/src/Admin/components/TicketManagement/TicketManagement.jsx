/* eslint-disable no-unused-vars */
import {
  getAllTickets,
  updateTicketStatus
} from '../../../services/adminService';
import React from 'react';
import { useState, useEffect } from 'react';
import {
  approveTicket,
  getTicketById,
  cancelTicket,
  getTicketsByStatus,
  markTicketAsUsed,
  getTicketPaymentInfo,
  getRefundedTickets,
  getTicketsByPaymentMethod,
  getTicketsByCinemaAddress
} from '../../../services/ticketService';
import {
  Ticket,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Eye,
  CheckSquare,
  Square,
  Check
} from 'lucide-react';
import { createNotification, createTicketApprovedNotification, createTicketCancelledNotification } from '../../../services/notificationService';
import useToast from '../../hooks/useToast';
import ToastContainer from '../Toast/ToastContainer';
import styles from './TicketManagement.module.css';

const TicketManagement = () => {
  const { showSuccess, showError, showWarning, showInfo, toasts, removeToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [cinemaAddressFilter, setCinemaAddressFilter] = useState('all');
  const [allCinemaAddresses, setAllCinemaAddresses] = useState([]);
  const [allPaymentMethods, setAllPaymentMethods] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketPaymentDetails, setTicketPaymentDetails] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const ticketsData = await getAllTickets();
      setTickets(ticketsData);

      // Load unique values once from all tickets to populate the dropdowns
      const addresses = [...new Set(ticketsData.map(t => t.cinemaAddress).filter(Boolean))];
      const methods = [...new Set(ticketsData.map(t => t.paymentMethod).filter(Boolean))];
      setAllCinemaAddresses(addresses);
      setAllPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      showError('Failed to fetch tickets: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPaymentMethodFilter('all');
    setCinemaAddressFilter('all');
  };

  const filteredTickets = tickets.filter(ticket => {
    // Check status filter
    if (statusFilter === 'refunded') {
      if (!ticket.refundedAt) return false;
    } else if (statusFilter !== 'all') {
      if (ticket.status !== statusFilter) return false;
    }

    // Check payment method filter
    if (paymentMethodFilter !== 'all') {
      if (ticket.paymentMethod !== paymentMethodFilter) return false;
    }

    // Check cinema address filter
    if (cinemaAddressFilter !== 'all') {
      if (ticket.cinemaAddress !== cinemaAddressFilter) return false;
    }

    const matchesSearch = searchTerm === '' ||
      (ticket.ticketNumber && ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.movieTitle && ticket.movieTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.cinemaName && ticket.cinemaName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.userId && ticket.userId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.userName && ticket.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.userEmail && ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
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
    // Use data already in hand — no extra API call needed
    setSelectedTicket(ticket);
    setTicketPaymentDetails({
      paymentMethod: ticket.paymentMethod,
      paymentStatus: ticket.paymentStatus,
      price: ticket.price,
      bookingTime: ticket.bookingTime
    });
    setShowTicketModal(true);
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      if (newStatus === 'confirmed') {
        await approveTicket(ticketId);
        showSuccess('Update ticket status successfully!');
      } else if (newStatus === 'cancelled') {
        await cancelTicket(ticketId);
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
          await createNotification(
            createTicketCancelledNotification(ticket.userId, ticket.movieTitle, ticket.ticketNumber)
          );
        }
        showSuccess('Ticket cancelled successfully!');
      } else {
        await updateTicketStatus(ticketId, newStatus);
        showSuccess('Update ticket status successfully!');
      }
      await fetchTickets();

      if (selectedTicket && selectedTicket.id === ticketId) {
        const updated = tickets.find(t => t.id === ticketId);
        if (updated) setSelectedTicket({ ...updated, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      showError('Failed to update status: ' + error.message);
    }
  };

  const handleMarkAsUsed = async (ticketId) => {
    try {
      await markTicketAsUsed(ticketId);
      showSuccess('Ticket marked as used successfully!');
      await fetchTickets();

      if (selectedTicket && selectedTicket.id === ticketId) {
        const updated = await getTicketById(ticketId);
        setSelectedTicket(updated);
      }
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      showError('Failed to mark ticket as used: ' + error.message);
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedTickets.length === 0) {
      showWarning('Choose at least one ticket to update status');
      return;
    }

    try {
      for (const ticketId of selectedTickets) {
        const ticket = tickets.find(t => t.id === ticketId);
        if (newStatus === 'confirmed') {
          await approveTicket(ticketId);
        } else if (newStatus === 'cancelled') {
          await cancelTicket(ticketId);
          if (ticket) {
            await createNotification(
              createTicketCancelledNotification(ticket.userId, ticket.movieTitle, ticket.ticketNumber)
            );
          }
        } else {
          await updateTicketStatus(ticketId, newStatus);
        }
      }
      setSelectedTickets([]);
      showSuccess(`Updated status for ${selectedTickets.length} tickets successfully!`);
      await fetchTickets();
    } catch (error) {
      console.error('Error bulk updating tickets:', error);
      showError('Failed to update ticket statuses: ' + error.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return { text: 'Confirmed', class: 'status-confirmed', icon: CheckCircle };
      case 'pending':
        return { text: 'Pending', class: 'status-pending', icon: Clock };
      case 'cancelled':
        return { text: 'Cancelled', class: 'status-cancelled', icon: XCircle };
      case 'used':
        return { text: 'Used', class: 'status-used', icon: CheckCircle };
      default:
        return { text: status ? status.toUpperCase() : 'UNKNOWN', class: 'status-unknown', icon: Clock };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not updated';
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
      return 'Not updated';
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading ticket list...</p>
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
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          {/* Payment Method Filter */}
          <select
            value={paymentMethodFilter}
            onChange={(e) => {
              setPaymentMethodFilter(e.target.value);
              setStatusFilter('all');
              setCinemaAddressFilter('all');
            }}
            className={styles.filterSelect}
          >
            <option value="all">All Payment Methods</option>
            {allPaymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>

          {/* Cinema Address Filter */}
          <select
            value={cinemaAddressFilter}
            onChange={(e) => {
              setCinemaAddressFilter(e.target.value);
              setStatusFilter('all');
              setPaymentMethodFilter('all');
            }}
            className={styles.filterSelect}
          >
            <option value="all">All Cinema Locations</option>
            {allCinemaAddresses.map(address => (
              <option key={address} value={address}>{address}</option>
            ))}
          </select>

          <div className={styles.statusFilters}>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.active : ''}`}
              onClick={() => handleStatusFilter('all')}
            >
              All
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'pending' ? styles.active : ''}`}
              onClick={() => handleStatusFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'confirmed' ? styles.active : ''}`}
              onClick={() => handleStatusFilter('confirmed')}
            >
              Confirmed
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'cancelled' ? styles.active : ''}`}
              onClick={() => handleStatusFilter('cancelled')}
            >
              Cancelled
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'refunded' ? styles.active : ''}`}
              onClick={() => handleStatusFilter('refunded')}
            >
              Refunded
            </button>
          </div>
          <button
            className={styles.refreshButton}
            onClick={fetchTickets}
            title="Refresh"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? styles.spinning : ''} />
          </button>
        </div>
      </div>

      {selectedTickets.length > 0 && (
        <div className={styles.bulkActions}>
          <span>{selectedTickets.length} tickets selected</span>
          <button
            className={styles.bulkBtn}
            onClick={() => handleBulkStatusUpdate('confirmed')}
          >
            <CheckCircle size={18} />
            Approve All
          </button>
          <button
            className={`${styles.bulkBtn} ${styles.cancelBtn}`}
            onClick={() => handleBulkStatusUpdate('cancelled')}
          >
            <XCircle size={18} />
            Cancel All
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
                  {selectedTickets.length === filteredTickets.length ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              </th>
              <th>Ticket ID</th>
              <th>Movie</th>
              <th>Cinema</th>
              <th>Seat</th>
              <th>Price</th>
              <th>Show Date</th>
              <th>User</th>
              <th>Status</th>
              <th>Actions</th>
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
                      {selectedTickets.includes(ticket.id) ? <CheckSquare size={16} /> : <Square size={16} />}
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
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{ticket.userName || ticket.userId || 'Guest'}</div>
                      <div className={styles.userEmail}>{ticket.userEmail || 'No email available'}</div>
                    </div>
                  </td>
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
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {ticket.status === 'pending' && (
                        <>
                          <button
                            className={`${styles.actionBtn} ${styles.approveBtn}`}
                            onClick={() => handleStatusUpdate(ticket.id, 'confirmed')}
                            title="Approve Ticket"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.cancelBtn}`}
                            onClick={() => handleStatusUpdate(ticket.id, 'cancelled')}
                            title="Cancel Ticket"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {ticket.status === 'confirmed' && (
                        <button
                          className={`${styles.actionBtn} ${styles.usedBtn}`}
                          onClick={() => handleMarkAsUsed(ticket.id)}
                          title="Mark As Used"
                        >
                          <CheckSquare size={16} />
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
          <h3>No tickets available</h3>
          <p>No tickets match the current filter</p>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Ticket Details</h3>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowTicketModal(false);
                  setSelectedTicket(null);
                  setTicketPaymentDetails(null);
                }}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.ticketInfo}>
                <div className={styles.infoRow}>
                  <label>Ticket Number:</label>
                  <span>{selectedTicket.ticketNumber}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Movie:</label>
                  <span>{selectedTicket.movieTitle} ({selectedTicket.showTime})</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Show Date:</label>
                  <span>{formatDate(selectedTicket.showDate)}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Cinema:</label>
                  <span>{selectedTicket.cinemaName} - {selectedTicket.cinemaAddress}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Seat Number:</label>
                  <span>{selectedTicket.seatNumber}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Price:</label>
                  <span className={styles.price}>{formatCurrency(selectedTicket.price)}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>User:</label>
                  <span>{selectedTicket.userName || selectedTicket.userId || 'Guest'} ({selectedTicket.userEmail || 'No email'})</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Status:</label>
                  <span className={`${styles.statusBadge} ${styles[getStatusBadge(selectedTicket.status).class]}`}>
                    {getStatusBadge(selectedTicket.status).text}
                  </span>
                </div>
                {ticketPaymentDetails && (
                  <>
                    <div className={styles.infoRow}>
                      <label>Payment Method:</label>
                      <span>{ticketPaymentDetails.paymentMethod || 'Not updated'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <label>Payment Status:</label>
                      <span>{ticketPaymentDetails.paymentStatus || 'Not updated'}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <label>Booking Time:</label>
                      <span>{formatDate(ticketPaymentDetails.bookingTime)}</span>
                    </div>
                  </>
                )}
                {selectedTicket.cancellationReason && (
                  <div className={styles.infoRow}>
                    <label>Cancel Reason:</label>
                    <span style={{ color: '#dc2626', fontWeight: 500 }}>{selectedTicket.cancellationReason}</span>
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
                    Approve Ticket
                  </button>
                )}
                {selectedTicket.status === 'confirmed' && (
                  <button
                    className={`${styles.actionBtn} ${styles.usedBtn}`}
                    onClick={() => {
                      handleMarkAsUsed(selectedTicket.id);
                      setShowTicketModal(false);
                      setSelectedTicket(null);
                    }}
                  >
                    Mark As Used
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
                    Cancel Ticket
                  </button>
                )}
                <button
                  className={`${styles.actionBtn} ${styles.closeBtn}`}
                  onClick={() => {
                    setShowTicketModal(false);
                    setSelectedTicket(null);
                    setTicketPaymentDetails(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default TicketManagement;

