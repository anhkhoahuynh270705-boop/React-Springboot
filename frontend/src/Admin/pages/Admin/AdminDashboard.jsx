import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Ticket, 
  BarChart3, 
  Settings, 
  LogOut, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Search,
  RefreshCw,
  CheckSquare,
  Square,
  FileText,
  Plus,
  X
} from 'lucide-react';
import { 
  getAdminStats, 
  getAllTickets, 
  getAllUsers, 
  updateTicketStatus,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers
} from '../../../services/adminService';
import { getAllNews, createNews, updateNews, deleteNews } from '../../../services/newsService';
import { getShowtimes } from '../../../services/showtimeService';
import { createNotification, createTicketApprovedNotification, createTicketCancelledNotification } from '../../../services/notificationService';
import CreateNews from '../../components/CreateNews/CreateNews';
import NewsDetailModal from '../../components/NewsDetailModal/NewsDetailModal';
import EditNewsModal from '../../components/EditNewsModal/EditNewsModal';
import EditUserForm from '../../components/EditUserForm/EditUserForm';
import SeatManager from '../../SeatManager/SeatManager';
import ComboManagement from '../../components/ComboManagement/ComboManagement';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState('');
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalUsers: 0,
    confirmedTickets: 0,
    cancelledTickets: 0,
    totalRevenue: 0
  });
  
  // Filter and search states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateNews, setShowCreateNews] = useState(false);
  const [showNewsDetail, setShowNewsDetail] = useState(false);
  const [showEditNews, setShowEditNews] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('authToken');
    
    if (userToken) {
      alert('Vui lòng đăng xuất tài khoản người dùng trước khi truy cập Admin Panel');
      navigate('/');
      return;
    }
    
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, ticketsData, usersData, newsData, showtimesData] = await Promise.all([
        getAdminStats(),
        getAllTickets(),
        getAllUsers(),
        getAllNews(0, 100),
        getShowtimes()
      ]);
      
      setStats(statsData);
      setTickets(ticketsData || []);
      setUsers(usersData || []);
      setNews(newsData || []);
      setShowtimes(showtimesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    navigate('/admin/login');
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus(ticketId, newStatus);
      
      // Tạo thông báo cho user
      const ticket = tickets.find(t => t.id === ticketId);
      if (ticket) {
        try {
          let notificationData;
          if (newStatus === 'confirmed') {
            notificationData = createTicketApprovedNotification(
              ticket.userId,
              ticket.movieTitle,
              ticket.ticketNumber || ticket.id
            );
          } else if (newStatus === 'cancelled') {
            notificationData = createTicketCancelledNotification(
              ticket.userId,
              ticket.movieTitle,
              ticket.ticketNumber || ticket.id
            );
          }
          
          if (notificationData) {
            await createNotification(notificationData);
          }
        } catch (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      }
      
      await fetchData(); 
      alert(`Cập nhật trạng thái vé thành công!`);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      alert('Cập nhật trạng thái vé thất bại: ' + error.message);
    }
  };

  const handleBulkStatusUpdate = async (ticketIds, newStatus) => {
    try {
      const promises = ticketIds.map(id => updateTicketStatus(id, newStatus));
      await Promise.all(promises);
      
      // Tạo thông báo cho tất cả user
      const updatedTickets = tickets.filter(t => ticketIds.includes(t.id));
      for (const ticket of updatedTickets) {
        try {
          let notificationData;
          if (newStatus === 'confirmed') {
            notificationData = createTicketApprovedNotification(
              ticket.userId,
              ticket.movieTitle,
              ticket.ticketNumber || ticket.id
            );
          } else if (newStatus === 'cancelled') {
            notificationData = createTicketCancelledNotification(
              ticket.userId,
              ticket.movieTitle,
              ticket.ticketNumber || ticket.id
            );
          }
          
          if (notificationData) {
            await createNotification(notificationData);
          }
        } catch (notificationError) {
          console.error('Error creating notification for ticket', ticket.id, ':', notificationError);
        }
      }
      
      await fetchData();
      setSelectedTickets([]);
      alert(`Cập nhật ${ticketIds.length} vé thành công!`);
    } catch (error) {
      console.error('Error updating tickets status:', error);
      alert('Cập nhật trạng thái vé thất bại: ' + error.message);
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleSelectTicket = (ticketId) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleSelectAllTickets = () => {
    const filteredTickets = getFilteredTickets();
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(t => t.id));
    }
  };

  // News management functions
  const handleNewsCreated = (newNews) => {
    setNews(prev => [newNews, ...prev]);
    setShowCreateNews(false);
  };

  const handleDeleteNews = async (newsId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
      try {
        await deleteNews(newsId);
        setNews(prev => prev.filter(item => item.id !== newsId));
      } catch (error) {
        console.error('Error deleting news:', error);
        alert('Lỗi khi xóa tin tức');
      }
    }
  };

  const handleViewNews = (news) => {
    setSelectedNews(news);
    setShowNewsDetail(true);
  };

  const handleEditNews = (news) => {
    setSelectedNews(news);
    setShowEditNews(true);
  };

  const handleNewsUpdated = (updatedNews) => {
    setNews(prev => prev.map(item => 
      item.id === updatedNews.id ? updatedNews : item
    ));
    setShowEditNews(false);
    setSelectedNews(null);
  };

  const handleCloseNewsModals = () => {
    setShowNewsDetail(false);
    setShowEditNews(false);
    setSelectedNews(null);
  };

  // User management functions
  const handleViewUser = async (user) => {
    try {
      const userDetail = await getUserById(user.id);
      setSelectedUser(userDetail);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Không thể lấy thông tin người dùng: ' + error.message);
    }
  };

  const handleEditUser = async (user) => {
    try {
      const userDetail = await getUserById(user.id);
      setSelectedUser(userDetail);
      setShowEditUserModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Không thể lấy thông tin người dùng: ' + error.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.fullName || user.username}"?`)) {
      try {
        await deleteUser(user.id);
        await fetchData();
        alert('Xóa người dùng thành công!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Xóa người dùng thất bại: ' + error.message);
      }
    }
  };


  const handleUserUpdated = async (updatedUserData) => {
    try {
      await updateUser(selectedUser.id, updatedUserData);
      await fetchData();
      setShowEditUserModal(false);
      setSelectedUser(null);
      alert('Cập nhật thông tin người dùng thành công!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Cập nhật thông tin người dùng thất bại: ' + error.message);
    }
  };

  const handleUserSearch = async (keyword) => {
    if (!keyword.trim()) {
      await fetchData();
      return;
    }
    
    try {
      const searchResults = await searchUsers(keyword);
      setUsers(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Tìm kiếm người dùng thất bại: ' + error.message);
    }
  };

  // Function to remove Vietnamese diacritics for search
  const removeVietnameseDiacritics = (str) => {
    if (!str) return '';
    
    return str
      .normalize('NFD') // Decompose characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Handle đ/Đ specifically
      .toLowerCase();
  };

  // Function to check if text contains search query (case-insensitive, diacritic-insensitive)
  const containsSearchQuery = (text, query) => {
    if (!text || !query) return false;
    
    const normalizedText = removeVietnameseDiacritics(text);
    const normalizedQuery = removeVietnameseDiacritics(query);
    
    return normalizedText.includes(normalizedQuery);
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    // Filter by search term
    if (userSearchTerm) {
      filtered = filtered.filter(user => 
        containsSearchQuery(user.username, userSearchTerm) ||
        containsSearchQuery(user.fullName, userSearchTerm) ||
        containsSearchQuery(user.email, userSearchTerm)
      );
    }
    
    return filtered;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredTickets = () => {
    let filtered = tickets;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(ticket => {
        const user = users.find(u => u.id === ticket.userId);
        const userName = user ? (user.fullName || user.username) : '';
        return containsSearchQuery(ticket.movieTitle, searchTerm) ||
               containsSearchQuery(ticket.cinemaName, searchTerm) ||
               containsSearchQuery(ticket.ticketNumber, searchTerm) ||
               containsSearchQuery(ticket.id, searchTerm) ||
               containsSearchQuery(userName, searchTerm);
      });
    }
    
    return filtered;
  };


  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: 'green', icon: CheckCircle, text: 'Đã xác nhận' },
      pending: { color: 'yellow', icon: Clock, text: 'Chờ xác nhận' },
      used: { color: 'blue', icon: CheckCircle, text: 'Đã sử dụng' },
      cancelled: { color: 'red', icon: XCircle, text: 'Đã hủy' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`${styles['admin-status-badge']} ${styles[`admin-status-${config.color}`]}`}>
        <Icon size={14} />
        {config.text}
      </span>
    );
  };

  const getUserStatus = (user) => {
    if (user.deleted || user.disabled) {
      return false;
    }
    if (user.lastLoginAt || user.lastLogin) {
      const lastLogin = new Date(user.lastLoginAt || user.lastLogin);
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      return lastLogin > oneHourAgo;
    }
    if (user.isOnline !== undefined) {
      return user.isOnline;
    }
    
    if (user.isLoggedIn !== undefined) {
      return user.isLoggedIn;
    }
    
    if (user.hasValidToken !== undefined) {
      return user.hasValidToken;
    }
    return false;
  };

  const checkUserLoginStatus = (user) => {
    if (user.deleted || user.disabled) {
      return false;
    }
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const authToken = localStorage.getItem('authToken');
      
      if (authToken && currentUser.id === user.id) {
        console.log('User is currently logged in:', user.username);
        return true;
      }
    } catch (error) {
      console.warn('Error checking localStorage:', error);
    }
    
    // Kiểm tra lần đăng nhập cuối 
    if (user.lastLoginAt) {
      const lastLogin = new Date(user.lastLoginAt);
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      const isRecentlyActive = lastLogin > fiveMinutesAgo;
      return isRecentlyActive;
    }
    
    console.log('User not active:', user.username);
    return false;
  };

  if (loading) {
    return (
      <div className={`${styles['admin-loading-container']}`}>
        <div className={`${styles['admin-loading-spinner']}`}></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className={`${styles['admin-dashboard-container']}`}>
      <div className={`${styles['admin-sidebar-panel']}`}>
        <div className={`${styles['admin-logo-section']}`}>
          <Ticket size={24} />
          <span>Admin Panel</span>
        </div>
        
        <nav className={`${styles['admin-navigation']}`}>
          <button
            className={`${styles['admin-nav-button']} ${activeTab === 'dashboard' ? styles['admin-nav-active'] : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={20} />
            Dashboard
          </button>
          <button
            className={`${styles['admin-nav-button']} ${activeTab === 'tickets' ? styles['admin-nav-active'] : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <Ticket size={20} />
            Quản lý vé
          </button>
          <button
            className={`${styles['admin-nav-button']} ${activeTab === 'users' ? styles['admin-nav-active'] : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            Quản lý người dùng
          </button>
          <button
            className={`${styles['admin-nav-button']} ${activeTab === 'news' ? styles['admin-nav-active'] : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <FileText size={20} />
            Quản lý tin tức
          </button>
          <button
            className={`${styles['admin-nav-button']} ${activeTab === 'combos' ? styles['admin-nav-active'] : ''}`}
            onClick={() => setActiveTab('combos')}
          >
            <Plus size={20} />
            Quản lý combo
          </button>
          <button
            className={`${styles['admin-nav-button']} ${activeTab === 'seats' ? styles['admin-nav-active'] : ''}`}
            onClick={() => setActiveTab('seats')}
          >
            <Settings size={20} />
            Quản lý ghế
          </button>
        </nav>

        <div className={`${styles['admin-user-section']}`}>
          <button className={`${styles['admin-logout-button']}`} onClick={handleLogout}>
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${styles['admin-main-content']}`}>
        <div className={`${styles['admin-header-section']}`}>
          <h1>
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'tickets' && 'Quản lý vé'}
            {activeTab === 'users' && 'Quản lý người dùng'}
            {activeTab === 'news' && 'Quản lý tin tức'}
            {activeTab === 'combos' && 'Quản lý combo'}
            {activeTab === 'seats' && 'Quản lý ghế'}
          </h1>
        </div>

        <div className={`${styles['admin-content-area']}`}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className={`${styles['admin-dashboard-content']}`}>
              <div className={`${styles['admin-stats-grid']}`}>
                <div className={`${styles['admin-stat-card']}`}>
                  <div className="admin-stat-icon admin-stat-tickets">
                    <Ticket size={24} />
                  </div>
                  <div className={`${styles['admin-stat-content']}`}>
                    <div className={`${styles['admin-stat-number']}`}>{stats.totalTickets}</div>
                    <div className={`${styles['admin-stat-label']}`}>Tổng số vé</div>
                  </div>
                </div>
                
                <div className={`${styles['admin-stat-card']}`}>
                  <div className={`${styles['admin-stat-icon']} ${styles['admin-stat-users']}`}>
                    <Users size={24} />
                  </div>
                  <div className={`${styles['admin-stat-content']}`}>
                    <div className={`${styles['admin-stat-number']}`}>{stats.totalUsers}</div>
                    <div className={`${styles['admin-stat-label']}`}>Tổng người dùng</div>
                  </div>
                </div>
                
                <div className={`${styles['admin-stat-card']}`}>
                  <div className={`${styles['admin-stat-icon']} ${styles['admin-stat-confirmed']}`}>
                    <CheckCircle size={24} />
                  </div>
                  <div className={`${styles['admin-stat-content']}`}>
                    <div className={`${styles['admin-stat-number']}`}>{stats.confirmedTickets}</div>
                    <div className={`${styles['admin-stat-label']}`}>Vé đã xác nhận</div>
                  </div>
                </div>
                
                <div className={`${styles['admin-stat-card']}`}>
                  <div className={`${styles['admin-stat-icon']} ${styles['admin-stat-revenue']}`}>
                    <DollarSign size={24} />
                  </div>
                  <div className={`${styles['admin-stat-content']}`}>
                    <div className={`${styles['admin-stat-number']}`}>{formatPrice(stats.totalRevenue)}</div>
                    <div className={`${styles['admin-stat-label']}`}>Tổng doanh thu</div>
                  </div>
                </div>
              </div>

              <div className={`${styles['admin-recent-tickets']}`}>
                <h3>Vé gần đây</h3>
                <div className={`${styles['admin-tickets-list']}`}>
                  {tickets.slice(0, 5).map(ticket => (
                    <div key={ticket.id} className={`${styles['admin-ticket-item']}`}>
                      <div className={`${styles['admin-ticket-info']}`}>
                        <div className={`${styles['admin-ticket-movie']}`}>{ticket.movieTitle}</div>
                        <div className={`${styles['admin-ticket-details']}`}>
                          {ticket.cinemaName} • {formatDateTime(ticket.showTime || ticket.startTime || ticket.showDate)}
                        </div>
                      </div>
                      <div className={`${styles['admin-ticket-status']}`}>
                        {getStatusBadge(ticket.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className={`${styles['admin-tickets-content']}`}>
              <div className={`${styles['admin-content-header']}`}>
                <h3>Tất cả vé ({getFilteredTickets().length})</h3>
                <div className={`${styles['admin-filter-controls']}`}>
                  <div className={`${styles['admin-search-box']}`}>
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm vé, phim, rạp, người dùng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className={`${styles['admin-status-filter']}`}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="used">Đã sử dụng</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedTickets.length > 0 && (
                <div className={`${styles['admin-bulk-actions']}`}>
                  <div className={`${styles['admin-bulk-info']}`}>
                    <span>Đã chọn {selectedTickets.length} vé</span>
                  </div>
                  <div className={`${styles['admin-bulk-buttons']}`}>
                    <button
                      className={`${styles['admin-bulk-btn']} ${styles['admin-confirm-btn']}`}
                      onClick={() => handleBulkStatusUpdate(selectedTickets, 'confirmed')}
                    >
                      <CheckCircle size={16} />
                      Xác nhận
                    </button>
                    <button
                      className={`${styles['admin-bulk-btn']} ${styles['admin-cancel-btn']}`}
                      onClick={() => handleBulkStatusUpdate(selectedTickets, 'cancelled')}
                    >
                      <XCircle size={16} />
                      Hủy
                    </button>
                    <button
                      className={`${styles['admin-bulk-btn']} ${styles['admin-use-btn']}`}
                      onClick={() => handleBulkStatusUpdate(selectedTickets, 'used')}
                    >
                      <CheckCircle size={16} />
                      Đánh dấu đã sử dụng
                    </button>
                  </div>
                </div>
              )}

              <div className={`${styles['admin-tickets-table']}`}>
                <table>
                  <thead>
                    <tr>
                      <th>
                        <button
                          className={`${styles['admin-select-all-btn']}`}
                          onClick={handleSelectAllTickets}
                          title="Chọn tất cả"
                        >
                          {selectedTickets.length === getFilteredTickets().length ? 
                            <CheckSquare size={16} /> : 
                            <Square size={16} />
                          }
                        </button>
                      </th>
                      <th>Mã vé</th>
                      <th>Người dùng</th>
                      <th>Phim</th>
                      <th>Rạp</th>
                      <th>Ngày chiếu</th>
                      <th>Ghế</th>
                      <th>Giá</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredTickets().map(ticket => (
                      <tr key={ticket.id} className={selectedTickets.includes(ticket.id) ? `${styles['admin-row-selected']}` : ''}>
                        <td>
                          <button
                            className={`${styles['admin-select-btn']}`}
                            onClick={() => handleSelectTicket(ticket.id)}
                            title="Chọn vé"
                          >
                            {selectedTickets.includes(ticket.id) ? 
                              <CheckSquare size={16} /> : 
                              <Square size={16} />
                            }
                          </button>
                        </td>
                        <td>{ticket.ticketNumber || ticket.id}</td>
                        <td>
                          {(() => {
                            const user = users.find(u => u.id === ticket.userId);
                            if (user) {
                              return (
                                <div className={`${styles['admin-user-info']}`}>
                                  <div className={`${styles['admin-user-name']}`}>
                                    {user.fullName || user.username}
                                  </div>
                                  <div className={`${styles['admin-user-email']}`}>
                                    {user.email}
                                  </div>
                                </div>
                              );
                            }
                            return <span className={`${styles['admin-no-user']}`}>N/A</span>;
                          })()}
                        </td>
                        <td>{ticket.movieTitle}</td>
                        <td>{ticket.cinemaName}</td>
                        <td>{formatDateTime(ticket.showTime || ticket.startTime || ticket.showDate)}</td>
                        <td>{ticket.seatNumber}</td>
                        <td>{formatPrice(ticket.price)}</td>
                        <td>{getStatusBadge(ticket.status)}</td>
                        <td>
                            <div className={`${styles['admin-action-buttons']}`}>
                            <button
                              className={`${styles['admin-action-btn']} ${styles['admin-view-btn']}`}
                              onClick={() => handleViewTicket(ticket)}
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            {ticket.status === 'pending' && (
                              <button
                                className={`${styles['admin-action-btn']} ${styles['admin-confirm-btn']}`}
                                onClick={() => handleStatusUpdate(ticket.id, 'confirmed')}
                                title="Xác nhận vé"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            {ticket.status === 'confirmed' && (
                              <button
                                className={`${styles['admin-action-btn']} ${styles['admin-use-btn']}`}
                                onClick={() => handleStatusUpdate(ticket.id, 'used')}
                                title="Đánh dấu đã sử dụng"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            {(ticket.status === 'pending' || ticket.status === 'confirmed') && (
                              <button
                                className={`${styles['admin-action-btn']} ${styles['admin-cancel-btn']}`}
                                onClick={() => handleStatusUpdate(ticket.id, 'cancelled')}
                                title="Hủy vé"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className={`${styles['admin-users-content']}`}>
              <div className={`${styles['admin-content-header']}`}>
                <h3>Tất cả người dùng ({getFilteredUsers().length})</h3>
                <div className={`${styles['admin-filter-controls']}`}>
                  <div className={`${styles['admin-search-box']}`}>
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm người dùng..."
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                        handleUserSearch(e.target.value);
                      }}
                    />
                  </div>
                  <button 
                    className={`${styles['admin-refresh-button']}`} 
                    onClick={fetchData}
                    title="Làm mới trạng thái"
                  >
                    <RefreshCw size={16} />
                    Làm mới
                  </button>
                </div>
              </div>

              <div className={`${styles['admin-users-table']}`}>
                <table>
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Tên đăng nhập</th>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>Số điện thoại</th>
                      <th>Ngày tạo</th>
                      <th>Lần đăng nhập cuối</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredUsers().map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className={`${styles['admin-user-avatar']}`}>
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.username} />
                            ) : (
                              <div className={`${styles['admin-avatar-placeholder']}`}>
                                {user.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className={`${styles['admin-user-username']}`}>
                            {user.username}
                          </div>
                        </td>
                        <td>{user.fullName || 'N/A'}</td>
                        <td>{user.email}</td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>{formatDateTime(user.lastLoginAt || user.lastLogin)}</td>
                        <td>
                          <div className={`${styles['admin-action-buttons']}`}>
                            <button 
                              className={`${styles['admin-action-btn']} ${styles['admin-view-btn']}`} 
                              title="Xem chi tiết"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className={`${styles['admin-action-btn']} ${styles['admin-edit-btn']}`} 
                              title="Chỉnh sửa"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className={`${styles['admin-action-btn']} ${styles['admin-delete-btn']}`} 
                              title="Xóa"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {getFilteredUsers().length === 0 && (
                <div className={`${styles['admin-empty-state']}`}>
                  <Users size={48} />
                  <h3>Không tìm thấy người dùng nào</h3>
                  <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                </div>
              )}
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className={`${styles['admin-news-content']}`}>
              <div className={`${styles['admin-content-header']}`}>
                <h3>Tất cả tin tức ({news.length})</h3>
                <div className={`${styles['admin-filter-controls']}`}>
                  <button 
                    className={`${styles['admin-create-news-btn']}`}
                    onClick={() => setShowCreateNews(true)}
                  >
                    <Plus size={16} />
                    Tạo tin tức mới
                  </button>
                  <button 
                    className={`${styles['admin-refresh-button']}`} 
                    onClick={fetchData}
                    title="Làm mới dữ liệu"
                  >
                    <RefreshCw size={16} />
                    Làm mới
                  </button>
                </div>
              </div>

              <div className={`${styles['admin-news-table']}`}>
                <table>
                  <thead>
                    <tr>
                      <th>Tiêu đề</th>
                      <th>Tác giả</th>
                      <th>Danh mục</th>
                      <th>Ngày tạo</th>
                      <th>Lượt xem</th>
                      <th>Nổi bật</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.map(article => (
                      <tr key={article.id}>
                        <td>
                          <div className={`${styles['admin-news-title']}`}>
                            <strong>{article.title}</strong>
                            <p className={`${styles['admin-news-summary']}`}>{article.summary}</p>
                          </div>
                        </td>
                        <td>{article.author}</td>
                        <td>
                          <span className={`${styles['admin-news-category']}`}>{article.category}</span>
                        </td>
                        <td>{formatDate(article.createdAt)}</td>
                        <td>{article.views || 0}</td>
                        <td>
                          {article.featured ? (
                            <span className={`${styles['admin-featured-badge']}`}>Nổi bật</span>
                          ) : (
                            <span className={`${styles['admin-normal-badge']}`}>Bình thường</span>
                          )}
                        </td>
                        <td>
                          <div className={`${styles['admin-action-buttons']}`}>
                            <button 
                              className={`${styles['admin-action-btn']} ${styles['admin-view-btn']}`} 
                              title="Xem chi tiết"
                              onClick={() => handleViewNews(article)}
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className={`${styles['admin-action-btn']} ${styles['admin-edit-btn']}`} 
                              title="Chỉnh sửa"
                              onClick={() => handleEditNews(article)}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className={`${styles['admin-action-btn']} ${styles['admin-delete-btn']}`} 
                              title="Xóa"
                              onClick={() => handleDeleteNews(article.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {news.length === 0 && (
                <div className={`${styles['admin-empty-state']}`}>
                  <FileText size={48} />
                  <h3>Chưa có tin tức nào</h3>
                  <p>Hãy tạo tin tức đầu tiên để bắt đầu</p>
                  <button 
                    className={`${styles['admin-create-news-btn']}`}
                    onClick={() => setShowCreateNews(true)}
                  >
                    <Plus size={16} />
                    Tạo tin tức mới
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Combos Tab */}
          {activeTab === 'combos' && (
            <ComboManagement />
          )}

          {/* Seats Tab */}
          {activeTab === 'seats' && (
            <div className={`${styles['admin-seats-content']}`}>
              <div className={`${styles['admin-content-header']}`}>
                <h3>Quản lý ghế theo suất chiếu</h3>
                <div className={`${styles['admin-filter-controls']}`}>
                  <button 
                    className={`${styles['admin-refresh-button']}`} 
                    onClick={fetchData}
                    title="Làm mới dữ liệu"
                  >
                    <RefreshCw size={16} />
                    Làm mới
                  </button>
                </div>
              </div>
              
            {/* Showtimes Grid */}
              <div className={`${styles['admin-showtimes-grid']}`}>
                {showtimes.map(showtime => {
                  const showtimeId = showtime.id || showtime._id;
                  return (
                  <div 
                    key={showtimeId} 
                    className={`${styles['admin-showtime-card']} ${selectedShowtimeId === showtimeId ? styles['admin-showtime-selected'] : ''}`}
                    onClick={() => {
                      setSelectedShowtimeId(showtimeId);
                      setSelectedShowtime(showtime);
                    }}
                  >
                    <div className={`${styles['admin-showtime-info']}`}>
                      <h4>{showtime.movieName || showtime.movieTitle || 'Phim'}</h4>
                      <p><strong>Thời gian:</strong> {new Date(showtime.startTime || showtime.time).toLocaleString('vi-VN')}</p>
                      <p><strong>Phòng:</strong> {showtime.room || 'N/A'}</p>
                    </div>
                    <div className={`${styles['admin-showtime-actions']}`}>
                      <button 
                        className={`${styles['admin-action-btn']} ${styles['admin-view-btn']}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedShowtimeId(showtimeId);
                          setSelectedShowtime(showtime);
                        }}
                      >
                        <Settings size={16} />
                        Quản lý ghế
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>

              {(() => {
                return selectedShowtimeId && selectedShowtime;
              })() && (
                <div className={`${styles['admin-seat-manager-section']}`}>
                  <div className={`${styles['admin-seat-manager-header']}`}>
                    <h4>Quản lý ghế - {selectedShowtime.movieName || selectedShowtime.movieTitle}</h4>
                    <p>Suất chiếu: {new Date(selectedShowtime.startTime || selectedShowtime.time).toLocaleString('vi-VN')} - Phòng {selectedShowtime.room}</p>
                    <button 
                      className={`${styles['admin-close-btn']}`}
                      onClick={() => {
                        setSelectedShowtimeId('');
                        setSelectedShowtime(null);
                      }}
                    >
                      <X size={16} />
                      Đóng
                    </button>
                  </div>
                  <SeatManager 
                    showtimeId={selectedShowtimeId}
                    onSeatsChange={(seats) => {
                      console.log('Seats updated:', seats);
                    }}
                  />
                </div>
              )}

              {showtimes.length === 0 && (
                <div className={`${styles['admin-empty-state']}`}>
                  <Settings size={48} />
                  <h3>Chưa có suất chiếu nào</h3>
                  <p>Hãy tạo suất chiếu trước khi quản lý ghế</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className={`${styles['admin-modal-overlay']}`}>
          <div className={`${styles['admin-modal-content']}`}>
            <div className={`${styles['admin-modal-header']}`}>
              <h3>Chi tiết vé</h3>
              <button
                className={`${styles['admin-modal-close']}`}
                onClick={() => setShowTicketModal(false)}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className={`${styles['admin-modal-body']}`}>
              <div className={`${styles['admin-ticket-detail-grid']}`}>
                <div className={`${styles['admin-detail-section']}`}>
                  <h4>Thông tin vé</h4>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Mã vé:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedTicket.ticketNumber || selectedTicket.id}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Trạng thái:</span>
                    <span className={`${styles['admin-detail-value']}`}>{getStatusBadge(selectedTicket.status)}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Giá vé:</span>
                    <span className={`${styles['admin-detail-value']}`}>{formatPrice(selectedTicket.price)}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Ghế:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedTicket.seatNumber}</span>
                  </div>
                </div>

                <div className={`${styles['admin-detail-section']}`}>
                  <h4>Thông tin người dùng</h4>
                  {(() => {
                    const user = users.find(u => u.id === selectedTicket.userId);
                    if (user) {
                      return (
                        <>
                          <div className={`${styles['admin-detail-item']}`}>
                            <span className={`${styles['admin-detail-label']}`}>Tên:</span>
                            <span className={`${styles['admin-detail-value']}`}>{user.fullName || user.username}</span>
                          </div>
                          <div className={`${styles['admin-detail-item']}`}>
                            <span className={`${styles['admin-detail-label']}`}>Email:</span>
                            <span className={`${styles['admin-detail-value']}`}>{user.email}</span>
                          </div>
                          <div className={`${styles['admin-detail-item']}`}>
                            <span className={`${styles['admin-detail-label']}`}>Số điện thoại:</span>
                            <span className={`${styles['admin-detail-value']}`}>{user.phone || 'N/A'}</span>
                          </div>
                          <div className={`${styles['admin-detail-item']}`}>
                            <span className={`${styles['admin-detail-label']}`}>Trạng thái:</span>
                            <span className={`${styles['admin-detail-value']}`}>
                              {checkUserLoginStatus(user) ? (
                                <span className={`${styles['admin-user-status']} ${styles['admin-online']}`}>
                                  <div className={`${styles['admin-online-indicator']}`}></div>
                                  Đang hoạt động
                                </span>
                              ) : (
                                <span className={`${styles['admin-user-status']} ${styles['admin-offline']}`}>Không hoạt động</span>
                              )}
                            </span>
                          </div>
                        </>
                      );
                    }
                    return (
                      <div className={`${styles['admin-detail-item']}`}>
                        <span className={`${styles['admin-detail-label']}`}>Người dùng:</span>
                        <span className={`${styles['admin-detail-value']} ${styles['admin-no-user']}`}>Không tìm thấy thông tin</span>
                      </div>
                    );
                  })()}
                </div>

                <div className={`${styles['admin-detail-section']}`}>
                  <h4>Thông tin phim</h4>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Tên phim:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedTicket.movieTitle}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Poster:</span>  
                    <img 
                      src={selectedTicket.moviePoster || '/default-movie.jpg'} 
                      alt={selectedTicket.movieTitle}
                      className={`${styles['admin-movie-poster']}`}
                    />
                  </div>
                </div>

                <div className={`${styles['admin-detail-section']}`}>
                  <h4>Thông tin rạp</h4>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Tên rạp:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedTicket.cinemaName}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Địa chỉ:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedTicket.cinemaAddress || 'N/A'}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Ngày chiếu:</span>
                    <span className={`${styles['admin-detail-value']}`}>{formatDate(selectedTicket.showDate)}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Giờ chiếu:</span>
                    <span className={`${styles['admin-detail-value']}`}>{formatTime(selectedTicket.showTime || selectedTicket.startTime)}</span>
                  </div>
                </div>

                <div className={`${styles['admin-detail-section']}`}>
                  <h4>Thông tin thanh toán</h4>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Phương thức:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedTicket.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Trạng thái thanh toán:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedTicket.paymentStatus || 'N/A'}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Có thể hoàn tiền:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedTicket.isRefundable ? 'Có' : 'Không'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles['admin-modal-footer']}`}>
              <div className={`${styles['admin-modal-actions']}`}>
                {selectedTicket.status === 'pending' && (
                  <button
                    className={`${styles['admin-action-btn']} ${styles['admin-confirm-btn']}`}
                    onClick={() => {
                      handleStatusUpdate(selectedTicket.id, 'confirmed');
                      setShowTicketModal(false);
                    }}
                  >
                    <CheckCircle size={16} />
                    Xác nhận vé
                  </button>
                )}
                {selectedTicket.status === 'confirmed' && (
                  <button
                    className={`${styles['admin-action-btn']} ${styles['admin-use-btn']}`}
                    onClick={() => {
                      handleStatusUpdate(selectedTicket.id, 'used');
                      setShowTicketModal(false);
                    }}
                  >
                    <CheckCircle size={16} />
                    Đánh dấu đã sử dụng
                  </button>
                )}
                {(selectedTicket.status === 'pending' || selectedTicket.status === 'confirmed') && (
                  <button
                    className={`${styles['admin-action-btn']} ${styles['admin-cancel-btn']}`}
                    onClick={() => {
                      handleStatusUpdate(selectedTicket.id, 'cancelled');
                      setShowTicketModal(false);
                    }}
                  >
                    <XCircle size={16} />
                    Hủy vé
                  </button>
                )}
                <button
                  className={`${styles['admin-action-btn']} ${styles['admin-close-btn']}`}
                  onClick={() => setShowTicketModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create News Modal */}
      {showCreateNews && (
        <CreateNews
          onNewsCreated={handleNewsCreated}
          onClose={() => setShowCreateNews(false)}
        />
      )}

      {/* News Detail Modal */}
      {showNewsDetail && selectedNews && (
        <NewsDetailModal
          news={selectedNews}
          onClose={handleCloseNewsModals}
          onEdit={handleEditNews}
        />
      )}

      {/* Edit News Modal */}
      {showEditNews && selectedNews && (
        <EditNewsModal
          news={selectedNews}
          onClose={handleCloseNewsModals}
          onNewsUpdated={handleNewsUpdated}
        />
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className={`${styles['admin-modal-overlay']}`}>
          <div className={`${styles['admin-modal-content']} ${styles['admin-user-modal']}`}>
            <div className={`${styles['admin-modal-header']}`}>
              <h3>Chi tiết người dùng</h3>
              <button
                className={`${styles['admin-modal-close']}`}
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className={`${styles['admin-modal-body']}`}>
              <div className={`${styles['admin-user-detail-grid']}`}>
                <div className={`${styles['admin-detail-section']}`}>
                  <h4>Thông tin cơ bản</h4>
                  <div className={`${styles['admin-user-avatar-large']}`}>
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.username} />
                    ) : (
                      <div className={`${styles['admin-avatar-placeholder-large']}`}>
                        {selectedUser.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Tên đăng nhập:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedUser.username}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Họ tên:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedUser.fullName || 'N/A'}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Email:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedUser.email}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Số điện thoại:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedUser.phone || 'N/A'}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Địa chỉ:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedUser.address || 'N/A'}</span>
                  </div>
                </div>

                <div className={`${styles['admin-detail-section']}`}>
                  <h4>Thông tin tài khoản</h4>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Ngày tạo:</span>
                    <span className={`${styles['admin-detail-value']}`}>{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Lần đăng nhập cuối:</span>
                    <span className={`${styles['admin-detail-value']}`}>{formatDateTime(selectedUser.lastLoginAt || selectedUser.lastLogin)}</span>
                  </div>
                  <div className={`${styles['admin-detail-item']}`}>
                    <span className={`${styles['admin-detail-label']}`}>Ghi chú:</span>
                    <span className={`${styles['admin-detail-value']}`}>{selectedUser.notes || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles['admin-modal-footer']}`}>
              <div className={`${styles['admin-modal-actions']}`}>
                <button
                  className={`${styles['admin-action-btn']} ${styles['admin-edit-btn']}`}
                  onClick={() => {
                    setShowUserModal(false);
                    setShowEditUserModal(true);
                  }}
                >
                  <Edit size={16} />
                  Chỉnh sửa
                </button>
                <button
                  className={`${styles['admin-action-btn']} ${styles['admin-close-btn']}`}
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className={`${styles['admin-modal-overlay']}`}>
          <div className={`${styles['admin-modal-content']} ${styles['admin-edit-user-modal']}`}>
            <div className={`${styles['admin-modal-header']}`}>
              <h3>Chỉnh sửa người dùng</h3>
              <button
                className={`${styles['admin-modal-close']}`}
                onClick={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className={`${styles['admin-modal-body']}`}>
              <EditUserForm 
                user={selectedUser}
                onSave={handleUserUpdated}
                onCancel={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;