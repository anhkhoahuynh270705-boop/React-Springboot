import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket, User, Phone, Mail, Download, Eye, Trash2, Filter, Search, FileText, BarChart3, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { getTicketsByUser, downloadTicket, exportUserTickets, getUserTicketStats, cancelTicketWithReason, downloadFile, getTicketDetails, getTicketPaymentInfo, refundTicket, getUserRefundStats } from '../../../services/ticketService';
import { getMovieById } from '../../../services/movieService';
import styles from './TicketListPage.module.css';         

const TicketListPage = ({ userId }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [movieTitles, setMovieTitles] = useState({});
  const [movieTitlesLoading, setMovieTitlesLoading] = useState(false);
  const [ticketStats, setTicketStats] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [showStats, setShowStats] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundStats, setRefundStats] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const ticketData = await getTicketsByUser(userId);
        setTickets(ticketData);
        setFilteredTickets(ticketData);        
        const movieTitlesMap = {};

        ticketData.forEach(ticket => {
          if (ticket.movieTitle) {
            movieTitlesMap[ticket.id] = ticket.movieTitle;
          }
        });

        const ticketsNeedingFetch = ticketData.filter(ticket => !ticket.movieTitle && ticket.movieId);
        
        if (ticketsNeedingFetch.length > 0) {
          setMovieTitlesLoading(true);
          
          const moviePromises = ticketsNeedingFetch.map(async (ticket) => {
            try {
              const movie = await getMovieById(ticket.movieId);
              const movieTitle = movie.title || movie.name || movie.vietnameseTitle || 'Tên phim';
              movieTitlesMap[ticket.id] = movieTitle;
              console.log(`Set movie title for ticket ${ticket.id}:`, movieTitle);
            } catch (error) {
              console.error(`Error fetching movie for ticket ${ticket.id}:`, error);
              movieTitlesMap[ticket.id] = 'Tên phim';
            }
          });
          
          await Promise.all(moviePromises);
          setMovieTitlesLoading(false);
        }
        
        ticketData.forEach(ticket => {
          if (!movieTitlesMap[ticket.id]) {
            movieTitlesMap[ticket.id] = 'Tên phim';
          }
        });
        setMovieTitles(movieTitlesMap);

        try {
          const stats = await getUserTicketStats(userId);
          setTicketStats(stats);
        } catch (statsError) {
          console.error('Error fetching ticket stats:', statsError);
        }

        try {
          const refundStatsData = await getUserRefundStats(userId);
          setRefundStats(refundStatsData);
        } catch (refundStatsError) {
          console.error('Error fetching refund stats:', refundStatsError);
        }
      } catch (err) {
        setError('Không thể tải danh sách vé. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [userId]);

  useEffect(() => {
    let filtered = tickets;
    if (searchQuery.trim()) {
      filtered = filtered.filter(ticket => {
        const movieTitle = movieTitles[ticket.id] || ticket.movieTitle || 'Tên phim';
        return movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
               ticket.cinemaName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               ticket.showtimeId?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchQuery, statusFilter, movieTitles, movieTitlesLoading]);

  useEffect(() => {
    if (Object.keys(movieTitles).length > 0) {
      console.log('Movie titles updated, forcing re-render');
    }
  }, [movieTitles]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'confirmed': { text: 'Đã xác nhận', class: `${styles['status-confirmed']}` },
      'pending': { text: 'Chờ xác nhận', class: `${styles['status-pending']}` },
      'cancelled': { text: 'Đã hủy', class: `${styles['status-cancelled']}` },
      'used': { text: 'Đã sử dụng', class: `${styles['status-used']}` },
      'expired': { text: 'Hết hạn', class: `${styles['status-expired']}` }
    };

    const config = statusConfig[status] || { text: status, class: `${styles['status-default']}` };
    return <span className={`${styles['status-badge']} ${config.class}`}>{config.text}</span>;
  };

  const handleDownloadTicket = async (ticketId) => {
    try {
      setActionLoading(prev => ({ ...prev, [ticketId]: true }));
      const blob = await downloadTicket(ticketId);
      const ticket = tickets.find(t => t.id === ticketId);
      const filename = `ticket_${ticket?.ticketNumber || ticketId}.pdf`;
      downloadFile(blob, filename);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Không thể tải vé. Vui lòng thử lại sau.');
    } finally {
      setActionLoading(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleViewTicket = async (ticketId) => {
    try {
      const ticket = await getTicketDetails(ticketId);
      if (ticket) {
        const modal = document.createElement('div');
        modal.className = styles['ticket-detail-modal'];
        modal.innerHTML = `
          <div class="${styles['modal-content']}">   
            <div class="${styles['modal-header']}">
              <h3>Chi tiết vé</h3>
              <button class="${styles['close-btn']}">&times;</button>
            </div>
            <div class="${styles['modal-body']}">
              <div class="${styles['ticket-detail-info']}">
                <h4>Thông tin cơ bản</h4>
                <p><strong>Mã vé:</strong> ${ticket.ticketNumber || ticket.id}</p>
                <p><strong>Phim:</strong> ${ticket.movieTitle || 'N/A'}</p>
                <p><strong>Rạp:</strong> ${ticket.cinemaName || 'N/A'}</p>
                ${ticket.cinemaAddress ? `<p><strong>Địa chỉ rạp:</strong> ${ticket.cinemaAddress}</p>` : ''}
                <p><strong>Ngày chiếu:</strong> ${formatDate(ticket.showDate)}</p>
                <p><strong>Giờ chiếu:</strong> ${formatTime(ticket.showTime)}</p>
                <p><strong>Ghế:</strong> ${ticket.seatNumber || 'N/A'}</p>
                <p><strong>Giá:</strong> ${formatPrice(ticket.price)}</p>
                <p><strong>Trạng thái:</strong> ${getStatusBadge(ticket.status).props.children}</p>
                <p><strong>QR Code:</strong> ${ticket.qrCode || 'N/A'}</p>
                
                <h4>Thông tin thanh toán</h4>
                <p><strong>Phương thức thanh toán:</strong> ${ticket.paymentMethod || 'N/A'}</p>
                <p><strong>Trạng thái thanh toán:</strong> ${ticket.paymentStatus || 'N/A'}</p>
                <p><strong>Thời gian đặt vé:</strong> ${ticket.bookingTime ? formatDate(ticket.bookingTime) : 'N/A'}</p>
                
                
                ${ticket.cancelledAt ? `
                  <h4>Thông tin hủy vé</h4>
                  <p><strong>Thời gian hủy:</strong> ${formatDate(ticket.cancelledAt)}</p>
                  <p><strong>Lý do hủy:</strong> ${ticket.cancellationReason || 'N/A'}</p>
                ` : ''}
                
                ${ticket.usedAt ? `
                  <h4>Thông tin sử dụng</h4>
                  <p><strong>Thời gian sử dụng:</strong> ${formatDate(ticket.usedAt)}</p>
                ` : ''}
                
                ${ticket.refundedAt ? `
                  <h4>Thông tin hoàn tiền</h4>
                  <p><strong>Thời gian hoàn tiền:</strong> ${formatDate(ticket.refundedAt)}</p>
                  <p><strong>Số tiền hoàn:</strong> ${formatPrice(ticket.refundAmount || 0)}</p>
                  <p><strong>Lý do hoàn tiền:</strong> ${ticket.refundReason || 'N/A'}</p>
                ` : ''}
              </div>
            </div>
          </div>
        `;       
        document.body.appendChild(modal);
        
        // Close modal handlers
        modal.querySelector(`.${styles['close-btn']}`).onclick = () => {
          document.body.removeChild(modal);
        };
        modal.onclick = (e) => {
          if (e.target === modal) {
            document.body.removeChild(modal);
          }
        };
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      alert('Không thể tải chi tiết vé. Vui lòng thử lại.');
    }
  };

  const handleCancelTicket = (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    setSelectedTicket(ticket);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleRefundTicket = (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    setSelectedTicket(ticket);
    setRefundAmount(ticket.price.toString());
    setRefundReason('');
    setShowRefundModal(true);
  };

  const confirmRefundTicket = async () => {
    if (!selectedTicket || !refundAmount || !refundReason) {
      alert('Vui lòng nhập đầy đủ thông tin hoàn tiền');
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [selectedTicket.id]: true }));
      await refundTicket(selectedTicket.id, parseFloat(refundAmount), refundReason);
      alert('Hoàn tiền thành công!');
      setShowRefundModal(false);
      setRefundAmount('');
      setRefundReason('');
      window.location.reload();
    } catch (error) {
      console.error('Error refunding ticket:', error);
      alert('Hoàn tiền thất bại. Vui lòng thử lại.');
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedTicket.id]: false }));
    }
  };


  const confirmCancelTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [selectedTicket.id]: true }));
      await cancelTicketWithReason(selectedTicket.id, cancelReason);
      
      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === selectedTicket.id 
          ? { ...ticket, status: 'cancelled', cancellationReason: cancelReason }
          : ticket
      ));
      
      setShowCancelModal(false);
      setSelectedTicket(null);
      setCancelReason('');
      alert('Vé đã được hủy thành công!');
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      alert('Không thể hủy vé. Vui lòng thử lại sau.');
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedTicket.id]: false }));
    }
  };

  const handleExportTickets = async (format = 'pdf') => {
    try {
      setActionLoading(prev => ({ ...prev, export: true }));
      const blob = await exportUserTickets(userId, format);
      const filename = `tickets_${userId}.${format}`;
      downloadFile(blob, filename);
    } catch (error) {
      console.error('Error exporting tickets:', error);
      alert('Không thể xuất danh sách vé. Vui lòng thử lại sau.');
    } finally {
      setActionLoading(prev => ({ ...prev, export: false }));
    }
  };

  if (!userId) {
    return (
      <div className={`${styles['ticket-list-page']}`}>  
        <div className={`${styles['container']}`}>
          <div className={`${styles['login-required']}`}>
            <h2>Vé của tôi</h2>
            <p>Vui lòng đăng nhập để xem vé của bạn</p>
            <Link to="/login" className={`${styles['login-btn']}`}>Đăng nhập</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles['ticket-list-page']}`}>
      <div className={`${styles['container']}`}>
        <div className={`${styles['page-header']}`}>
          <div className={`${styles['header-content']}`}>
            <div className={`${styles['header-text']}`}>
              <h1>Vé của tôi</h1>
              <p>Quản lý và theo dõi vé phim của bạn</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {showStats && ticketStats && (
          <div className={`${styles['stats-section']}`}>
            <h3>Thống kê vé của bạn</h3>
            <div className={`${styles['stats-grid']}`}>
              <div className={`${styles['stat-card']}`}>
                <div className={`${styles['stat-icon']}`}>
                  <Ticket size={24} />
                </div>
                <div className={`${styles['stat-content']}`}>
                  <span className={`${styles['stat-number']}`}>{ticketStats.totalTickets}</span>
                  <span className={`${styles['stat-label']}`}>Tổng vé</span>
                </div>
              </div>
              <div className={`${styles['stat-card']}`}>
                <div className={`${styles['stat-icon']} ${styles['confirmed']}`}>
                  <CheckCircle size={24} />
                </div>
                <div className={`${styles['stat-content']}`}>
                  <span className={`${styles['stat-number']}`}>{ticketStats.confirmedTickets}</span>
                  <span className={`${styles['stat-label']}`}>Đã xác nhận</span>
                </div>
              </div>
              <div className={`${styles['stat-card']}`}> 
                <div className={`${styles['stat-icon']} ${styles['used']}`}>
                  <CheckCircle size={24} />
                </div>
                <div className={`${styles['stat-content']}`}>
                  <span className={`${styles['stat-number']}`}>{ticketStats.usedTickets}</span>
                  <span className={`${styles['stat-label']}`}>Đã sử dụng</span>
                </div>
              </div>
              <div className={`${styles['stat-card']}`}>
                <div className={`${styles['stat-icon']} ${styles['cancelled']}`}>
                  <XCircle size={24} />
                </div>
                <div className={`${styles['stat-content']}`}>
                  <span className={`${styles['stat-number']}`}>{ticketStats.cancelledTickets}</span>
                  <span className={`${styles['stat-label']}`}>Đã hủy</span>
                </div>
              </div>
              <div className={`${styles['stat-card']}`}>
                <div className={`${styles['stat-icon']} ${styles['money']}`}>
                  <BarChart3 size={24} />
                </div>
                <div className={`${styles['stat-content']}`}>
                  <span className={`${styles['stat-number']}`}>{formatPrice(ticketStats.totalSpent)}</span>
                  <span className={`${styles['stat-label']}`}>Tổng chi tiêu</span>
                </div>
              </div>
              <div className={`${styles['stat-card']}`}>
                <div className={`${styles['stat-icon']} ${styles['refund']}`}>  
                  <XCircle size={24} />
                </div>
                <div className={`${styles['stat-content']}`}>
                  <span className={`${styles['stat-number']}`}>{ticketStats.refundedTickets || 0}</span>
                  <span className={`${styles['stat-label']}`}>Vé đã hoàn tiền</span>
                </div>
              </div>
              <div className={`${styles['stat-card']}`}>
                <div className={`${styles['stat-icon']} ${styles['refund-amount']}`}>
                  <BarChart3 size={24} />
                </div>
                <div className={`${styles['stat-content']}`}>
                  <span className={`${styles['stat-number']}`}>{formatPrice(ticketStats.totalRefundAmount || 0)}</span>
                  <span className={`${styles['stat-label']}`}>Tổng hoàn tiền</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className={`${styles['ticket-controls']}`}>
          <div className={`${styles['search-section']}`}>
            <div className={`${styles['search-input-wrapper']}`}>
              <Search size={20} className={`${styles['search-icon']}`} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên phim, rạp chiếu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${styles['search-input']}`}
              />
            </div>
          </div>

          <div className={`${styles['filter-section']}`}>
            <Filter size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${styles['status-filter']}`}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="used">Đã sử dụng</option>
              <option value="cancelled">Đã hủy</option>
              <option value="expired">Hết hạn</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`${styles['loading-state']}`}>
            <div className={`${styles['loading-spinner']}`}></div>
            <p>Đang tải danh sách vé...</p>
          </div>
        )}

        {/* Movie Titles Loading State */}
        {!loading && !error && movieTitlesLoading && (
          <div className={`${styles['loading-state']}`}>
            <div className={`${styles['loading-spinner']}`}></div>
            <p>Đang tải thông tin phim...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={`${styles['error-state']}`}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className={`${styles['retry-btn']}`}>
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !movieTitlesLoading && filteredTickets.length === 0 && (
          <div className={`${styles['empty-state']}`}>
            <Ticket size={64} className={`${styles['empty-icon']}`} /> 
            <h3>Chưa có vé nào</h3>
            <p>
              {searchQuery || statusFilter !== 'all' 
                ? 'Không tìm thấy vé phù hợp với bộ lọc của bạn'
                : 'Bạn chưa đặt vé phim nào. Hãy khám phá và đặt vé ngay!'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/" className={`${styles['explore-btn']}`}>Khám phá phim</Link>
            )}
          </div>
        )}

        {/* Tickets List */}
        {!loading && !error && !movieTitlesLoading && filteredTickets.length > 0 && (
          <div className={`${styles['tickets-grid']}`}>
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className={`${styles['ticket-card']}`}>
                <div className={`${styles['ticket-header']}`}>
                  <div className={`${styles['ticket-poster']}`}>
                    <img 
                      src={ticket.moviePoster || '/default-movie.jpg'} 
                      alt={ticket.movieTitle || 'Movie Poster'}
                      className={`${styles['movie-poster-img']}`}
                      onError={(e) => {
                        e.target.src = '/default-movie.jpg';
                      }}
                    />
                  </div>
                  <div className={`${styles['ticket-info']}`}>
                    <h3 className={`${styles['movie-title']}`}>
                      {(() => {
                        if (movieTitles[ticket.id]) {
                          return movieTitles[ticket.id];
                        }
                        if (ticket.movieTitle) {
                          return ticket.movieTitle;
                        }
                        if (movieTitlesLoading) {
                          return 'Đang tải...';
                        }
                        return 'Tên phim';
                      })()}
                    </h3>
                    <p className={`${styles['cinema-name']}`}>
                      <MapPin size={16} />
                      {ticket.cinemaName || 'Tên rạp'}
                    </p>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>

                <div className={`${styles['ticket-details']}`}>
                  <div className={`${styles['detail-row']}`}>
                    <Calendar size={16} />
                    <span>{formatDate(ticket.showDate)}</span>
                  </div>
                  <div className={`${styles['detail-row']}`}>
                    <Clock size={16} />
                    <span>{formatTime(ticket.showTime)}</span>
                  </div>
                  <div className={`${styles['detail-row']}`}>
                    <Ticket size={16} />
                    <span>Ghế: {ticket.seatNumber || ticket.seatId || 'N/A'}</span>
                  </div>
                  <div className={`${styles['detail-row']}`}>
                    <span className={`${styles['price']}`}>{formatPrice(ticket.price)}</span>
                  </div>
                </div>

                <div className={`${styles['ticket-actions']}`}>
                  <button
                    onClick={() => handleViewTicket(ticket.id)}
                    className={`${styles['action-btn']} ${styles['view-btn']}`}
                    title="Xem chi tiết"
                    disabled={actionLoading[ticket.id]}
                  >
                    <Eye size={16} />
                    {actionLoading[ticket.id] ? '...' : 'Xem'}
                  </button>
                  <button
                    onClick={() => handleDownloadTicket(ticket.id)}
                    className={`${styles['action-btn']} ${styles['download-btn']}`}
                    title="Tải vé"
                    disabled={actionLoading[ticket.id]}
                  >
                    <Download size={16} />
                    {actionLoading[ticket.id] ? '...' : 'Tải'}
                  </button>
                  {ticket.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancelTicket(ticket.id)}
                      className={`${styles['action-btn']} ${styles['cancel-btn']}`}
                      title="Hủy vé"
                      disabled={actionLoading[ticket.id]}
                    >
                      <Trash2 size={16} />
                      {actionLoading[ticket.id] ? '...' : 'Hủy'}
                    </button>
                  )}
                  {ticket.status === 'cancelled' && ticket.isRefundable && !ticket.refundedAt && (
                    <button
                      onClick={() => handleRefundTicket(ticket.id)}
                      className={`${styles['action-btn']} ${styles['refund-btn']}`}
                      title="Hoàn tiền"
                      disabled={actionLoading[ticket.id]}
                    >
                      <BarChart3 size={16} />
                      {actionLoading[ticket.id] ? '...' : 'Hoàn tiền'}
                    </button>
                  )}
                </div>

                <div className={`${styles['ticket-footer']}`}>
                  <p className={`${styles['booking-time']}`}>
                    Đặt lúc: {ticket.bookingTime ? formatDate(ticket.bookingTime) + ' ' + formatTime(ticket.bookingTime) : 'N/A'}
                  </p>
                  <p className={`${styles['ticket-id']}`}>Mã vé: {ticket.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && !error && !movieTitlesLoading && filteredTickets.length > 0 && (
          <div className={`${styles['ticket-summary']}`}>
            <p>
              Hiển thị {filteredTickets.length} vé 
              {searchQuery && ` cho "${searchQuery}"`}
              {statusFilter !== 'all' && ` - Trạng thái: ${statusFilter}`}
            </p>
          </div>
        )}

        {/* Cancel Ticket Modal */}
        {showCancelModal && selectedTicket && (
          <div className={`${styles['modal-overlay']}`}>
            <div className={`${styles['modal-content']}`}>
              <div className={`${styles['modal-header']}`}>
                <h3>Hủy vé</h3>
                <button 
                  className={`${styles['close-btn']}`}
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedTicket(null);
                    setCancelReason('');
                  }}
                >
                  &times;
                </button>
              </div>
              <div className={`${styles['modal-body']}`}>
                <div className={`${styles['ticket-info']}`}>
                  <p><strong>Phim:</strong> {selectedTicket.movieTitle || 'N/A'}</p>
                  <p><strong>Rạp:</strong> {selectedTicket.cinemaName || 'N/A'}</p>
                  <p><strong>Ngày:</strong> {formatDate(selectedTicket.showDate)}</p>
                  <p><strong>Giờ:</strong> {formatTime(selectedTicket.showTime)}</p>
                  <p><strong>Ghế:</strong> {selectedTicket.seatNumber || 'N/A'}</p>
                </div>
                <div className={`${styles['form-group']}`}>
                  <label htmlFor="cancelReason">Lý do hủy vé (tùy chọn):</label>
                  <textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Nhập lý do hủy vé..."
                    rows={3}
                  />
                </div>
                <div className={`${styles['modal-actions']}`}>
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setSelectedTicket(null);
                      setCancelReason('');
                    }}
                    className={`${styles['btn-secondary']}`}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmCancelTicket}
                    className={`${styles['btn-danger']}`}
                    disabled={actionLoading[selectedTicket.id]}
                  >
                    {actionLoading[selectedTicket.id] ? 'Đang hủy...' : 'Xác nhận hủy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refund Ticket Modal */}
        {showRefundModal && selectedTicket && (
          <div className={`${styles['modal-overlay']}`}>
            <div className={`${styles['modal-content']}`}>
              <div className={`${styles['modal-header']}`}>
                <h3>Hoàn tiền vé</h3>
                <button 
                  className={`${styles['close-btn']}`}
                  onClick={() => {
                    setShowRefundModal(false);
                    setSelectedTicket(null);
                    setRefundAmount('');
                    setRefundReason('');
                  }}
                >
                  &times;
                </button>
              </div>
              <div className={`${styles['modal-body']}`}>
                <div className={`${styles['ticket-info']}`}>
                  <p><strong>Phim:</strong> {selectedTicket.movieTitle || 'N/A'}</p>
                  <p><strong>Rạp:</strong> {selectedTicket.cinemaName || 'N/A'}</p>
                  <p><strong>Ngày:</strong> {formatDate(selectedTicket.showDate)}</p>
                  <p><strong>Giờ:</strong> {formatTime(selectedTicket.showTime)}</p>
                  <p><strong>Ghế:</strong> {selectedTicket.seatNumber || 'N/A'}</p>
                  <p><strong>Giá vé:</strong> {formatPrice(selectedTicket.price)}</p>
                </div>
                <div className={`${styles['form-group']}`}>
                  <label htmlFor="refundAmount">Số tiền hoàn (VND):</label>
                  <input
                    type="number"
                    id="refundAmount"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="Nhập số tiền hoàn..."
                    min="0"
                    max={selectedTicket.price}
                  />
                </div>
                <div className={`${styles['form-group']}`}>
                  <label htmlFor="refundReason">Lý do hoàn tiền:</label>
                  <textarea
                    id="refundReason"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Nhập lý do hoàn tiền..."
                    rows={3}
                    required
                  />
                </div>
                <div className={`${styles['modal-actions']}`}>
                  <button
                    onClick={() => {
                      setShowRefundModal(false);
                      setSelectedTicket(null);
                      setRefundAmount('');
                      setRefundReason('');
                    }}
                    className={`${styles['btn-secondary']}`} 
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmRefundTicket}
                    className={`${styles['btn-primary']}`}
                    disabled={actionLoading[selectedTicket.id]}
                  >
                    {actionLoading[selectedTicket.id] ? 'Đang xử lý...' : 'Xác nhận hoàn tiền'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TicketListPage;
