import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, MapPin, ChevronDown, User, LogOut, Settings, Ticket, Building2, Shield, Bell } from 'lucide-react';
import { getCinemas, getCinemasByCity, searchCinemas, getCinemaLogo } from '../../../services/cinemaService';
import { logoutUser } from '../../../services/userService';
import { searchMovies } from '../../../services/movieService';
import { getUnreadNotificationCount, getNotificationsByUser, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../../services/notificationService';

import LoginModal from '../LoginModal/LoginModal';
import UserProfile from '../UserProfile/UserProfile';
import './Header.css';

const Header = ({ user, setUser, onLogout }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCinemaDropdownOpen, setIsCinemaDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Tp. Hồ Chí Minh');
  const [cinemas, setCinemas] = useState([]);
  const [filteredCinemas, setFilteredCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cinemaSearchQuery, setCinemaSearchQuery] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  // Kiểm tra xem có đang ở admin mode không
  const isAdminMode = location.pathname.startsWith('/admin');
  const adminToken = localStorage.getItem('adminToken');
  const isAdminLoggedIn = !!adminToken;
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsCinemaDropdownOpen(false);
        setIsUserDropdownOpen(false);
        setIsLoginModalOpen(false);
        setIsUserProfileOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchMovies(searchQuery);
      setSearchResults(results);
      setIsSearchDropdownOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchMovies(searchQuery);
        setSearchResults(results);
        setIsSearchDropdownOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setIsSearchDropdownOpen(false);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch cinemas from API
  const fetchCinemas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCinemas();
      setCinemas(data);
      filterCinemas(data, selectedCity, cinemaSearchQuery);
    } catch (err) {
      setError('Không thể tải danh sách rạp chiếu');
      console.error('Error fetching cinemas:', err);
    } finally {
      setLoading(false);
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

  const filterCinemas = (cinemaList, city, searchQuery) => {
    let filtered = cinemaList.filter(cinema => 
      cinema.city === city
    );
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(cinema =>
        containsSearchQuery(cinema.name, searchQuery) ||
        containsSearchQuery(cinema.address, searchQuery) ||
        containsSearchQuery(cinema.cinemaName, searchQuery)
      );
    }
    setFilteredCinemas(filtered);
  };

  // Handle city change
  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    filterCinemas(cinemas, newCity, cinemaSearchQuery);
  };

  // Handle cinema search
  const handleCinemaSearch = (query) => {
    setCinemaSearchQuery(query);
    filterCinemas(cinemas, selectedCity, query);
  };

  // Fetch cinemas on component mount
  useEffect(() => {
    fetchCinemas();
  }, []);

  // Generate user initials when user changes
  useEffect(() => {
    if (user && user.username) {
      if (user.customAvatar && user.avatarUrl) {
        setUserAvatar(user.avatarUrl);
        setIsCustomAvatar(true);
        console.log('Custom avatar loaded for header:', user.avatarUrl);
      } else {
        // Tạo initials từ tên người dùng
        const generateInitials = (name) => {
          if (!name) return 'U';
          const displayName = user.fullName || user.username;
          const words = displayName.trim().split(/\s+/);
          if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
          } else {
            return displayName.substring(0, 2).toUpperCase();
          }
        };
        
        const initials = generateInitials(user.fullName || user.username);
        setUserAvatar(initials);
        setIsCustomAvatar(false);
        console.log('User initials generated for header:', initials);
      }
    } else {
      setUserAvatar(null);
      setIsCustomAvatar(false);
    }
  }, [user]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (user?.id) {
        try {
          const count = await getUnreadNotificationCount(user.id);
          setUnreadNotificationCount(count || 0);
        } catch (error) {
          console.error('Error fetching notification count:', error);
        }
      } else {
        setUnreadNotificationCount(0);
      }
    };

    fetchNotificationCount();
    
    // Refresh notification count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    const fetchNotifications = async () => {
      if (showNotifications && user?.id) {
        try {
          setNotificationLoading(true);
          const data = await getNotificationsByUser(user.id);
          setNotifications(data || []);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setNotificationLoading(false);
        }
      }
    };

    fetchNotifications();
  }, [showNotifications, user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCinemaDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      if (onLogout) {
        onLogout();
      }
      if (setUser) {
        setUser(null);
      }
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      if (onLogout) {
        onLogout();
      }
      if (setUser) {
        setUser(null);
      }
    }
  };

  // Refresh notification count
  const refreshNotificationCount = async () => {
    if (user?.id) {
      try {
        const count = await getUnreadNotificationCount(user.id);
        setUnreadNotificationCount(count || 0);
      } catch (error) {
        console.error('Error refreshing notification count:', error);
      }
    }
  };

  // Notification handlers
  const handleMarkAsRead = async (notificationId) => {
    console.log('handleMarkAsRead called with ID:', notificationId);
    try {
      const result = await markNotificationAsRead(notificationId);
      console.log('markNotificationAsRead result:', result);
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notif => 
          (notif.id === notificationId || notif._id === notificationId)
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      
      // Refresh notifications from server to ensure sync
      if (user && user.id) {
        const updatedNotifications = await getNotificationsByUser(user.id);
        setNotifications(updatedNotifications);
        await refreshNotificationCount();
      }
      
      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Lỗi khi đánh dấu thông báo đã đọc: ' + error.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    console.log('handleMarkAllAsRead called for user:', user.id);
    try {
      const result = await markAllNotificationsAsRead(user.id);
      console.log('markAllNotificationsAsRead result:', result);
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          isRead: true, 
          readAt: new Date().toISOString() 
        }))
      );
      setUnreadNotificationCount(0);
      
      // Refresh notifications from server to ensure sync
      if (user && user.id) {
        const updatedNotifications = await getNotificationsByUser(user.id);
        setNotifications(updatedNotifications);
        await refreshNotificationCount();
      }
      
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      alert('Lỗi khi đánh dấu tất cả thông báo đã đọc: ' + error.message);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

      const deletedNotif = notifications.find(notif => notif.id === notificationId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_success':
        return '✓';
      case 'ticket_approved':
        return '✓';
      case 'ticket_cancelled':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  // Handle login success
  const handleLoginSuccess = (user) => {
    if (setUser) {
      setUser(user);
    }
    setIsLoginModalOpen(false);
    setTimeout(() => {
      if (user && user.username) {
        if (user.customAvatar && user.avatarUrl) {
          setUserAvatar(user.avatarUrl);
          setIsCustomAvatar(true);
          console.log('Custom avatar refreshed after login:', user.avatarUrl);
        } else {
          const generateInitials = (name) => {
            if (!name) return 'U';
            const displayName = user.fullName || user.username;
            const words = displayName.trim().split(/\s+/);
            if (words.length >= 2) {
              return (words[0][0] + words[1][0]).toUpperCase();
            } else {
              return displayName.substring(0, 2).toUpperCase();
            }
          };
          const initials = generateInitials(user.fullName || user.username);
          setUserAvatar(initials);
          setIsCustomAvatar(false);
          console.log('Initials refreshed after login:', initials);
        }
      }
    }, 100);
  };

  // Handle avatar change from UserProfile
  const handleAvatarChange = (newAvatarUrl, updatedUser) => {
    if (updatedUser.customAvatar) {
      setUserAvatar(newAvatarUrl);
      setIsCustomAvatar(true);
    } else {
      const generateInitials = (name) => {
        if (!name) return 'U';
        const displayName = updatedUser.fullName || updatedUser.username;
        const words = displayName.trim().split(/\s+/);
        if (words.length >= 2) {
          return (words[0][0] + words[1][0]).toUpperCase();
        } else {
          return displayName.substring(0, 2).toUpperCase();
        }
      };
      const initials = generateInitials(updatedUser.fullName || updatedUser.username);
      setUserAvatar(initials);
      setIsCustomAvatar(false);
    }
    
    if (setUser) {
      setUser(updatedUser);
    }
    console.log('Avatar updated from profile:', updatedUser.customAvatar ? 'Custom image' : 'Initials');
  };

  // Nếu đang ở admin mode, hiển thị header đơn giản
  if (isAdminMode) {
    return (
      <header className="header adminHeader"> 
        <div className="header-container"> 
          <div className="header-left">
            <div className="logo">
              <img src="/logo.png" alt="CGV HAK" />
            </div>
          </div>

          <div className="header-right admin-header-right">
            {isAdminLoggedIn ? (
              <div className="admin-user-info">
                <span className="admin-welcome">Xin chào, Admin!</span>
                <button 
                  className="admin-logout-btn"
                  onClick={handleAdminLogout}
                  title="Đăng xuất Admin"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button 
                className="admin-login-btn"
                onClick={() => setIsLoginModalOpen(true)}
                title="Đăng nhập Admin"
              >
                <Shield size={16} />
                Đăng nhập Admin
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="CGV HAK" />
          </Link>
        </div>

        <div className="header-center">
          <div className="search-container" ref={searchRef}> 
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-container">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="search-input"
                />
                {isSearching && (
                  <div className="search-loading">
                    <div className="loading-spinner-small"></div>
                  </div>
                )}
              </div>
            </form>
            
            {/* Search Results Dropdown */}
            {isSearchDropdownOpen && (
              <div className="search-results-dropdown">
                {searchResults.length > 0 && console.log('First movie data:', searchResults[0])}
                {searchResults.length > 0 ? (
                  <div className="search-results-list">
                    {searchResults.map((movie) => (
                      <Link
                        key={movie.id}
                        to={`/movie/${movie.id}?tab=info`}
                        className="search-result-item"
                        onClick={() => {
                          setIsSearchDropdownOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="search-result-poster"> 
                          {(movie.posterUrl || movie.poster || movie.imageUrl || movie.thumbnail || movie.image) ? (
                            <img 
                              src={movie.posterUrl || movie.poster || movie.imageUrl || movie.thumbnail || movie.image} 
                              alt={movie.title || movie.movieName || movie.name}
                              className="search-result-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="search-result-placeholder"
                            style={{ display: (movie.posterUrl || movie.poster || movie.imageUrl || movie.thumbnail || movie.image) ? 'none' : 'flex' }}
                          >
                            <span>{(movie.title || movie.movieName || movie.name)?.charAt(0) || 'M'}</span>
                          </div>
                        </div>
                        <div className="search-result-info">
                          <h4 className="search-result-title">{movie.title || movie.movieName || movie.name}</h4>  
                          <p className="search-result-year">{movie.releaseYear || movie.year}</p>
                          <p className="search-result-genre">{movie.genre}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="search-no-results">
                    <p>Không tìm thấy phim nào</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <nav className="header-nav">
          <Link to="/" className="nav-link">Lịch chiếu phim</Link>
          
          <div className="cinema-dropdown" ref={dropdownRef}>
            <button 
              className="nav-link cinema-dropdown-btn"
              onClick={() => setIsCinemaDropdownOpen(!isCinemaDropdownOpen)}
            >
              Rạp chiếu
              <ChevronDown size={16} />
            </button>
            {isCinemaDropdownOpen && (
              <>
                <div className="cinema-dropdown-backdrop" onClick={() => setIsCinemaDropdownOpen(false)}></div>
                <div className="cinema-dropdown-content">
                <div className="cinema-search-section">
                  <div className="cinema-search-header">
                    <h3>Đặt vé phim chiếu rạp</h3>
                    <div className="cinema-search-bar">
                      <input 
                        type="text" 
                        placeholder="Tìm rạp tại"
                        className="cinema-search-input"
                        value={cinemaSearchQuery}
                        onChange={(e) => handleCinemaSearch(e.target.value)}
                      />
                      <div className="city-selector">
                        <MapPin size={16} />
                        <select 
                          value={selectedCity} 
                          onChange={(e) => handleCityChange(e.target.value)}
                          className="city-select"
                        >
                          <option value="Tp. Hồ Chí Minh">Tp. Hồ Chí Minh</option>
                          <option value="Bắc Giang">Bắc Giang</option>
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                        </select>
                      </div>
                    </div>
                  </div>                  
                  <div className="cinema-list">
                    {loading ? (
                      <div className="loading-message">Đang tải danh sách rạp chiếu...</div>
                    ) : error ? (
                      <div className="error-message">{error}</div>
                    ) : filteredCinemas.length === 0 ? (
                      <div className="no-cinemas-message">
                        {cinemaSearchQuery ? 'Không tìm thấy rạp chiếu phù hợp' : 'Không có rạp chiếu nào trong thành phố này'}
                      </div>
                    ) : (
                      filteredCinemas.map(cinema => {
                        const fallbackLogo = getCinemaLogo(cinema.name);
                        return (
                          <div key={cinema.id} className="cinema-item">
                            <div className="cinema-logo">
                              {cinema.imageUrl ? (
                                <img 
                                  src={cinema.imageUrl} 
                                  alt={cinema.name}
                                  className="cinema-logo-image"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className="cinema-logo-circle"
                                style={{ 
                                  backgroundColor: fallbackLogo.bgColor,
                                  display: cinema.imageUrl ? 'none' : 'flex'
                                }}
                              >
                                <span className="cinema-logo-text">{fallbackLogo.text}</span>
                              </div>
                            </div>
                            <div className="cinema-info">
                              <div className="cinema-name-row">
                                <h4 className="cinema-name">
                                  {cinema.name || cinema.cinemaName || 'Tên rạp không xác định'}
                                </h4>
                                <span className="status-badge">{cinema.status || 'bán vé'}</span>
                              </div>
                              <p className="cinema-address">{cinema.address}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              </>
            )}
          </div>
          <Link to="/news" className="nav-link">Tin tức</Link>
          <Link to="/tickets" className="nav-link">Vé của tôi</Link>
        </nav>

        <div className="header-right">
          {user ? (
            <>
              {/* Notification Dropdown */}
              <div className="notification-dropdown" ref={notificationRef}>
                <button 
                  className="notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  title="Thông báo"
                >
                  <Bell size={20} />
                  {unreadNotificationCount > 0 && (
                    <span className="notification-badge">{unreadNotificationCount}</span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="notification-dropdown-content">
                    <div className="notification-header">
                      <h3>Thông báo</h3>
                      {(() => {
                        const hasUnread = notifications.length > 0 && notifications.some(notif => 
                          notif.isRead === false || notif.isRead === undefined || !notif.isRead
                        );
                        
                        const shouldShowButton = hasUnread && unreadNotificationCount > 0;
                        
                        console.log('Notification check:', {
                          notificationsCount: notifications.length,
                          hasUnread,
                          unreadNotificationCount,
                          shouldShowButton,
                          notifications: notifications.map(n => ({ id: n.id || n._id, isRead: n.isRead }))
                        });
                        
                        return shouldShowButton && (
                          <button 
                            className="mark-all-read-btn"
                            onClick={handleMarkAllAsRead}
                          >
                            Đánh dấu tất cả đã đọc
                          </button>
                        );
                      })()}
                    </div>
                    
                    <div className="notification-list">
                      {notificationLoading ? (
                        <div className="notification-loading">
                          <div className="loading-spinner"></div>
                          <p>Đang tải thông báo...</p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="no-notifications">
                          <Bell size={32} />
                          <p>Không có thông báo nào</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map(notification => (
                          <div 
                            key={notification.id} 
                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                          >
                            <div className="notification-content">
                              <div className="notification-icon">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="notification-details">
                                <h4 className="notification-title">
                                  {notification.title}
                                </h4>
                                <p className="notification-message">
                                  {notification.message}
                                </p>
                                <span className="notification-time">
                                  {formatDate(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className="notification-actions">
                              <button 
                                className="delete-btn"
                                onClick={() => handleDeleteNotification(notification.id)}
                                title="Xóa thông báo"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {notifications.length > 5 && (
                      <div className="notification-footer">
                        <button 
                          className="view-all-btn"
                          onClick={() => {
                            // Có thể mở modal đầy đủ hoặc chuyển đến trang thông báo
                            setShowNotifications(false);
                          }}
                        >
                          Xem tất cả thông báo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="user-dropdown" ref={userDropdownRef}>
              <button 
                className="user-profile-btn"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <div className="user-avatar">
                  {userAvatar ? (
                    isCustomAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt={user.fullName || user.username}
                        onError={() => {
                          const generateInitials = (name) => {
                            if (!name) return 'U';
                            const displayName = user.fullName || user.username;
                            const words = displayName.trim().split(/\s+/);
                            if (words.length >= 2) {
                              return (words[0][0] + words[1][0]).toUpperCase();
                            } else {
                              return displayName.substring(0, 2).toUpperCase();
                            }
                          };
                          const initials = generateInitials(user.fullName || user.username);
                          setUserAvatar(initials);
                          setIsCustomAvatar(false);
                        }}
                      />
                    ) : (
                      <div className="user-initials">
                        {userAvatar}
                      </div>
                    )
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <span className="user-name">{user.fullName || user.username}</span>
                <ChevronDown size={16} />
              </button>
              
              {isUserDropdownOpen && (
                <div className="user-dropdown-content">                 
                  <div className="user-menu">
                    <button className="user-menu-item" onClick={() => {
                      setIsUserDropdownOpen(false);
                      setIsUserProfileOpen(true);
                    }}>
                      <User size={16} />
                      <span>Thông tin cá nhân</span>
                    </button>
                    <Link to="/tickets" className="user-menu-item" onClick={() => setIsUserDropdownOpen(false)}>
                      <Ticket size={16} />
                      <span>Vé của tôi</span>
                    </Link>
                    <Link to="/settings" className="user-menu-item" onClick={() => setIsUserDropdownOpen(false)}>
                      <Settings size={16} />
                      <span>Cài đặt</span>
                    </Link>
                    <hr className="user-menu-divider" />
                    <button className="user-menu-item logout-btn" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
              </div>
            </>
          ) : (
            <button 
              className="user-icon-btn"
              onClick={() => setIsLoginModalOpen(true)}
              title="Đăng nhập / Đăng ký"
            >
              <User size={20} />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>

      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLoginSuccess}
      />

    </header>

    {/* User Profile Popup */}
    {isUserProfileOpen && (
      <UserProfile 
        isPopup={true}
        onClose={() => setIsUserProfileOpen(false)}
        onAvatarChange={handleAvatarChange}
      />
    )}

    </>
  );
};

export default Header;
