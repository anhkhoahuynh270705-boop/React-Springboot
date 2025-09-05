import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket, User, Phone, Mail, Download, Eye, Trash2, Filter, Search } from 'lucide-react';
import { getTicketsByUser } from '../../services/ticketService';
import { getMovieById } from '../../services/movieService';
import './TicketListPage.css';

const TicketListPage = ({ userId }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [movieTitles, setMovieTitles] = useState({});
  const [movieTitlesLoading, setMovieTitlesLoading] = useState(false);

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

    // Filter by search query
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
      'confirmed': { text: 'Đã xác nhận', class: 'status-confirmed' },
      'pending': { text: 'Chờ xác nhận', class: 'status-pending' },
      'cancelled': { text: 'Đã hủy', class: 'status-cancelled' },
      'used': { text: 'Đã sử dụng', class: 'status-used' },
      'expired': { text: 'Hết hạn', class: 'status-expired' }
    };

    const config = statusConfig[status] || { text: status, class: 'status-default' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const handleDownloadTicket = (ticketId) => {
    console.log('Download ticket:', ticketId);
  };

  const handleViewTicket = (ticketId) => {
    console.log('View ticket:', ticketId);
  };

  const handleCancelTicket = (ticketId) => {
    console.log('Cancel ticket:', ticketId);
  };

  if (!userId) {
    return (
      <div className="ticket-list-page">
        <div className="container">
          <div className="login-required">
            <h2>Vé của tôi</h2>
            <p>Vui lòng đăng nhập để xem vé của bạn</p>
            <Link to="/login" className="login-btn">Đăng nhập</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-list-page">
      <div className="container">
        <div className="page-header">
          <h1>Vé của tôi</h1>
          <p>Quản lý và theo dõi vé phim của bạn</p>
        </div>

        {/* Search and Filter */}
        <div className="ticket-controls">
          <div className="search-section">
            <div className="search-input-wrapper">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên phim, rạp chiếu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-section">
            <Filter size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
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
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách vé...</p>
          </div>
        )}

        {/* Movie Titles Loading State */}
        {!loading && !error && movieTitlesLoading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin phim...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && !movieTitlesLoading && filteredTickets.length === 0 && (
          <div className="empty-state">
            <Ticket size={64} className="empty-icon" />
            <h3>Chưa có vé nào</h3>
            <p>
              {searchQuery || statusFilter !== 'all' 
                ? 'Không tìm thấy vé phù hợp với bộ lọc của bạn'
                : 'Bạn chưa đặt vé phim nào. Hãy khám phá và đặt vé ngay!'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link to="/" className="explore-btn">Khám phá phim</Link>
            )}
          </div>
        )}

        {/* Tickets List */}
        {!loading && !error && !movieTitlesLoading && filteredTickets.length > 0 && (
          <div className="tickets-grid">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-header">
                  <div className="ticket-poster">
                    <img 
                      src={ticket.moviePoster || '/default-movie.jpg'} 
                      alt={ticket.movieTitle || 'Movie Poster'}
                      className="movie-poster-img"
                      onError={(e) => {
                        e.target.src = '/default-movie.jpg';
                      }}
                    />
                  </div>
                  <div className="ticket-info">
                    <h3 className="movie-title">
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
                    <p className="cinema-name">
                      <MapPin size={16} />
                      {ticket.cinemaName || 'Tên rạp'}
                    </p>
                  </div>
                  {getStatusBadge(ticket.status)}
                </div>

                <div className="ticket-details">
                  <div className="detail-row">
                    <Calendar size={16} />
                    <span>{formatDate(ticket.showDate)}</span>
                  </div>
                  <div className="detail-row">
                    <Clock size={16} />
                    <span>{formatTime(ticket.showTime)}</span>
                  </div>
                  <div className="detail-row">
                    <Ticket size={16} />
                    <span>Ghế: {ticket.seatNumber || ticket.seatId || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="price">{formatPrice(ticket.price)}</span>
                  </div>
                </div>

                <div className="ticket-actions">
                  <button
                    onClick={() => handleViewTicket(ticket.id)}
                    className="action-btn view-btn"
                    title="Xem chi tiết"
                  >
                    <Eye size={16} />
                    Xem
                  </button>
                  <button
                    onClick={() => handleDownloadTicket(ticket.id)}
                    className="action-btn download-btn"
                    title="Tải vé"
                  >
                    <Download size={16} />
                    Tải
                  </button>
                  {ticket.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancelTicket(ticket.id)}
                      className="action-btn cancel-btn"
                      title="Hủy vé"
                    >
                      <Trash2 size={16} />
                      Hủy
                    </button>
                  )}
                </div>

                <div className="ticket-footer">
                  <p className="booking-time">
                    Đặt lúc: {ticket.bookingTime ? formatDate(ticket.bookingTime) + ' ' + formatTime(ticket.bookingTime) : 'N/A'}
                  </p>
                  <p className="ticket-id">Mã vé: {ticket.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && !error && !movieTitlesLoading && filteredTickets.length > 0 && (
          <div className="ticket-summary">
            <p>
              Hiển thị {filteredTickets.length} vé 
              {searchQuery && ` cho "${searchQuery}"`}
              {statusFilter !== 'all' && ` - Trạng thái: ${statusFilter}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketListPage;
