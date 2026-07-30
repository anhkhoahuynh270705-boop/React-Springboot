/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown, User, LogOut, Settings, Ticket, CheckCircle, Shield, Bell, Clock, X, Trash2 } from 'lucide-react';
import { getAllCinemas as getCinemas } from '../../../services/cinemaService';
import { logoutUser, applyAvatarMapping } from '../../../services/userService';
import { searchMovies } from '../../../services/movieService';
import { getUnreadNotificationCount, getNotificationsByUser, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../../services/notificationService';
import { connectWebSocket, disconnectWebSocket, subscribeToNotifications } from '../../../services/websocketService';

import LoginModal from '../LoginModal/LoginModal';
import UserProfile from '../UserProfile/UserProfile';
import UserSettingsModal from '../UserProfile/UserSettingsModal';
import './Header.css';
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { useTranslation } from 'react-i18next';

// Search history constants
const SEARCH_HISTORY_KEY = 'movieSearchHistory';
const MAX_HISTORY_ITEMS = 8;

const Header = ({ user, setUser, onLogin, onLogout }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  // City options
  const cityOptions = React.useMemo(() => {
    const set = new Set();
    cinemas.forEach(c => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set).sort();
  }, [cinemas]);

  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);


  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch { }
  }, []);

  // Save a search term to history 
  const addToSearchHistory = useCallback((term) => {
    if (!term || !term.trim()) return;
    const trimmed = term.trim();
    setSearchHistory(prev => {
      // Remove duplicate if exists, then add to front
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch { }
      return updated;
    });
  }, []);

  // Remove a single history item
  const removeFromSearchHistory = useCallback((term) => {
    setSearchHistory(prev => {
      const updated = prev.filter(item => item !== term);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch { }
      return updated;
    });
  }, []);

  // Clear all search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch { }
  }, []);

  // Handle clicking a history item
  const handleHistoryItemClick = useCallback((term) => {
    setSearchQuery(term);
    setIsSearchFocused(false);
    // Trigger search with this term
  }, []);

  // Handle search input focus
  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
    if (!searchQuery.trim()) {
      setIsSearchDropdownOpen(false);
    }
  }, [searchQuery]);

  // Handle search input blur (delayed to allow click on history items)
  const handleSearchBlur = useCallback(() => {
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  }, []);

  // Helper functions avatar
  const getInitials = (user) => {
    const displayName = user?.fullName || user?.username || 'User';
    const words = displayName.trim().split(/\s+/);

    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }

    return displayName.substring(0, 2).toUpperCase();
  };

  const isImageAvatar = (avatar) => {
    if (!avatar) return false;

    return (
      String(avatar).startsWith('http') ||
      String(avatar).startsWith('data:') ||
      String(avatar).startsWith('blob:')
    );
  };

  const setHeaderAvatar = (userData) => {
    if (!userData) {
      setUserAvatar(null);
      setIsCustomAvatar(false);
      return;
    }

    const avatar = userData.avatarUrl || userData.avatar;

    if (avatar && isImageAvatar(avatar)) {
      setUserAvatar(avatar);
      setIsCustomAvatar(true);
    } else {
      setUserAvatar(getInitials(userData));
      setIsCustomAvatar(false);
    }
  };

  // Check if admin mode
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
    if (!searchQuery.trim() || searchQuery.trim().length <= 1) {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
      return;
    }

    // Save to search history when user actively submits
    addToSearchHistory(searchQuery);

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
    if (!searchQuery.trim() || searchQuery.trim().length <= 1) {
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
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch cinemas from API
  const fetchCinemas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCinemas();
      // Handle empty array
      if (!data || data.length === 0) {
        setCinemas([]);
        setFilteredCinemas([]);
        return;
      }
      setCinemas(data);
      let savedCity = null;
      try { savedCity = localStorage.getItem('selectedCity'); } catch { }
      const hasSaved = savedCity !== null;
      const initialCity = hasSaved ? savedCity : selectedCity;
      if (hasSaved && initialCity !== selectedCity) {
        setSelectedCity(initialCity);
      }
      filterCinemas(data, initialCity, cinemaSearchQuery);
    } catch (err) {
      if (!err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
        setError('cannot load cinema list');
        console.error('Error fetching cinemas:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const removeVietnameseDiacritics = (str) => {
    if (!str) return '';

    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase();
  };

  // Function to check if text contains search query
  const containsSearchQuery = (text, query) => {
    if (!text || !query) return false;

    const normalizedText = removeVietnameseDiacritics(text);
    const normalizedQuery = removeVietnameseDiacritics(query);

    return normalizedText.includes(normalizedQuery);
  };

  const filterCinemas = (cinemaList, city, searchQuery) => {
    let filtered = city ? cinemaList.filter(cinema => cinema.city === city) : cinemaList;

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
    try {
      localStorage.setItem('selectedCity', newCity);
    } catch {
    }
  };

  // Handle cinema click
  const handleCinemaClick = (cinemaId) => {
    setIsCinemaDropdownOpen(false);
    navigate(`/cinema/${cinemaId}`);
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
    setHeaderAvatar(user);
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

    // Keep a slower fallback poll (60s) in case WebSocket drops
    const interval = setInterval(fetchNotificationCount, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Fetch notifications + WebSocket real-time push
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadNotificationCount(0);
      return;
    }
    const fetchNotifications = async () => {
      try {
        setNotificationLoading(true);
        const data = await getNotificationsByUser(user.id);
        const list = data || [];
        setNotifications(list);
        // Sync badge count directly from fetched data
        setUnreadNotificationCount(list.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setNotificationLoading(false);
      }
    };
    fetchNotifications();

    //Websocket
    connectWebSocket(user.id);
    const unsubscribe = subscribeToNotifications(user.id, (newNotification) => {
      console.log('[WebSocket] New notification received:', newNotification);
      setNotifications(prev => {
        // Avoid duplicates
        if (prev.some(n => n.id === newNotification.id)) return prev;
        return [newNotification, ...prev];
      });
      setUnreadNotificationCount(prev => prev + 1);

      // Dispatch event to notify other pages (like TicketListPage)
      if (newNotification.type === 'ticket_approved' || newNotification.type === 'ticket_cancelled') {
        window.dispatchEvent(new CustomEvent('ticketStatusUpdated', { detail: newNotification }));
      }
    });

    const interval = setInterval(fetchNotifications, 60000);

    const handleNotificationUpdate = () => fetchNotifications();
    window.addEventListener('notificationUpdated', handleNotificationUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationUpdated', handleNotificationUpdate);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user?.id]);

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
      disconnectWebSocket();
      if (onLogout) onLogout();
      if (setUser) setUser(null);
      setIsUserDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      disconnectWebSocket();
      if (onLogout) onLogout();
      if (setUser) setUser(null);
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
      setNotifications(prev =>
        prev.map(notif =>
          (notif.id === notificationId || notif._id === notificationId)
            ? { ...notif, isRead: true, readAt: new Date().toISOString() }
            : notif
        )
      );
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      if (user && user.id) {
        const updatedNotifications = await getNotificationsByUser(user.id);
        setNotifications(updatedNotifications);
        await refreshNotificationCount();
      }

      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Error marking notification as read: ' + error.message);
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
      alert('Error marking all notifications as read: ' + error.message);
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
        return '';
      case 'ticket_approved':
        return '';
      case 'ticket_cancelled':
        return '';
      default:
        return 'ℹ';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return t('Just now');
    if (diffInMinutes < 60) return `${diffInMinutes} ${t('minutes ago')}`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ${t('hours ago')}`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} ${t('days ago')}`;

    return date.toLocaleDateString('en-EN', {
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
  const handleLoginSuccess = (loggedInUser) => {
    if (!loggedInUser || !loggedInUser.id) return;

    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    const finalUser = applyAvatarMapping({ ...loggedInUser });

    localStorage.setItem('currentUser', JSON.stringify(finalUser));

    setHeaderAvatar(finalUser);

    if (setUser) {
      setUser(finalUser);
    }

    if (onLogin) {
      onLogin(finalUser);
    }
  };

  // Handle avatar change from UserProfile
  const handleAvatarChange = useCallback((newAvatarUrl, updatedUser) => {
    if (!updatedUser) return;

    const finalUser = {
      ...updatedUser,
      avatarUrl: newAvatarUrl || updatedUser.avatarUrl || updatedUser.avatar
    };

    setHeaderAvatar(finalUser);

    if (setUser) {
      setUser(finalUser);
    }

    console.log('Avatar updated from profile:', finalUser.avatarUrl);
  }, [setUser]);

  // Display admin header
  if (isAdminMode) {
    if (!isAdminLoggedIn) {
      return null;
    }
    return (
      <header className="header adminHeader">
        <div className="header-container">
          <div className="header-left"></div>

          <div className="header-right admin-header-right">
            <div className="admin-user-info">
              <span className="admin-welcome">{t('helloAdmin')}</span>
              <button
                type="button"
                className="admin-logout-btn"
                onClick={handleAdminLogout}
              >
                <LogOut size={16} />
                <span>{t('logout')}</span>
              </button>
            </div>

            <LanguageSwitcher />
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
              <img src="/logo.png" alt="CINEVERSE HAK" />
            </Link>
          </div>

          {/* Hamburger button - mobile only */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>

          <div className="header-center">
            <div className="search-container" ref={searchRef}>
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-container">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder={t('searchMovies')}
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    className="input-search"
                  />
                  {isSearching && (
                    <div className="search-loading">
                      <div className="loading-spinner-small"></div>
                    </div>
                  )}
                </div>
              </form>

              {/* Search History Dropdown - shown when focused and no query */}
              {isSearchFocused && !searchQuery.trim() && searchHistory.length > 0 && !isSearchDropdownOpen && (
                <div className="search-history-dropdown">
                  <div className="search-history-header">
                    <div className="search-history-title">
                      <Clock size={14} />
                      <span>{t('searchHistory') || 'Lịch sử tìm kiếm'}</span>
                    </div>
                    <button
                      className="search-history-clear-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearSearchHistory();
                      }}
                    >
                      <Trash2 size={12} />
                      <span>{t('clearAll') || 'Xóa tất cả'}</span>
                    </button>
                  </div>
                  <div className="search-history-list">
                    {searchHistory.map((term, index) => (
                      <div
                        key={`${term}-${index}`}
                        className="search-history-item"
                        onClick={() => handleHistoryItemClick(term)}
                      >
                        <div className="search-history-item-left">
                          <Clock size={14} className="search-history-icon" />
                          <span className="search-history-text">{term}</span>
                        </div>
                        <button
                          className="search-history-remove"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeFromSearchHistory(term);
                          }}
                          title={t('remove') || 'Xóa'}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                            addToSearchHistory(searchQuery);
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
                      <p>{t('noMoviesFound')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <nav className="header-nav">
            <Link to="/" className="nav-link">{t('schedule')}</Link>
            <Link to="/cinemas" className="nav-link">{t('cinemas-system')}</Link>

            <div className="cinema-dropdown" ref={dropdownRef}>
              <button
                className="nav-link cinema-dropdown-btn"
                onClick={() => setIsCinemaDropdownOpen(!isCinemaDropdownOpen)}
              >
                {t('cinemas')}
                <ChevronDown size={16} />
              </button>
              {isCinemaDropdownOpen && (
                <>
                  <div className="cinema-dropdown-backdrop" onClick={() => setIsCinemaDropdownOpen(false)}></div>
                  <div className="cinema-dropdown-content">
                    <div className="cinema-search-section">
                      <div className="cinema-search-header">
                        <h3>{t('bookMovie')}</h3>
                        <div className="cinema-search-bar">
                          <input
                            type="text"
                            placeholder={t('searchCinema')}
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
                              <option value="">{t('allCities')}</option>
                              {cityOptions.length === 0 ? null : (
                                cityOptions.map(city => (
                                  <option key={city} value={city}>{city}</option>
                                ))
                              )}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="cinema-list">
                        {loading ? (
                          <div className="loading-message">{t('loadingCinemaList')}</div>
                        ) : error ? (
                          <div className="error-message">{error}</div>
                        ) : filteredCinemas.length === 0 ? (
                          <div className="no-cinemas-message">
                            {cinemaSearchQuery ? t('noCinemasFound') : t('noCinemasInCity')}
                          </div>
                        ) : (
                          filteredCinemas.map(cinema => {
                            const fallbackLogo = `https://via.placeholder.com/40x40/3b82f6/ffffff?text=${cinema.name.charAt(0)}`;
                            return (
                              <div
                                key={cinema.id}
                                className="cinema-item"
                                onClick={() => handleCinemaClick(cinema.id)}
                              >
                                <div className="logo-cinema">
                                  {cinema.imageUrl ? (
                                    <img
                                      src={cinema.imageUrl}
                                      alt={cinema.name}
                                      className="logo-cinema-image"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className="logo-cinema-circle"
                                    style={{
                                      backgroundColor: fallbackLogo.bgColor,
                                      display: cinema.imageUrl ? 'none' : 'flex'
                                    }}
                                  >
                                    <span className="logo-cinema-text">{fallbackLogo.text}</span>
                                  </div>
                                </div>
                                <div className="cinema-info">
                                  <div className="cinema-name-row">
                                    <h4 className="cinema-name">
                                      {cinema.name || cinema.cinemaName || t('cinemaNameNotFound')}
                                    </h4>
                                    <span className="status-badge">{cinema.status === 'ACTIVE' ? t('sellTickets') : (cinema.status || t('sellTickets'))}</span>
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
            <Link to="/news" className="nav-link">{t('news')}</Link>
            <Link to="/tickets" className="nav-link">{t('myTickets')}</Link>
          </nav>

          <div className="header-right">

            {user ? (
              <>
                {/* Notification Dropdown */}
                <div className="notification-dropdown" ref={notificationRef}>
                  <button
                    className="notification-btn"
                    onClick={() => setShowNotifications(!showNotifications)}
                    title="{t('notifications')}"
                  >
                    <Bell size={20} />
                    {unreadNotificationCount > 0 && (
                      <span className="notification-badge">{unreadNotificationCount}</span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="notification-dropdown-content">
                      <div className="notification-header">
                        <h3>{t('notifications')}</h3>
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
                              {t('markAllAsRead')}
                            </button>
                          );
                        })()}
                      </div>

                      <div className="notification-list">
                        {notificationLoading ? (
                          <div className="notification-loading">
                            <div className="loading-spinner"></div>
                            <p>{t('loadingNotifications')}</p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="no-notifications">
                            <Bell size={32} />
                            <p>{t('noNotifications')}</p>
                          </div>
                        ) : (
                          (showAllNotifications ? notifications : notifications.slice(0, 5)).map(notification => (
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
                                  title={t('delete notification')}
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
                              setShowAllNotifications(prev => !prev);
                            }}
                          >
                            {showAllNotifications ? t('showLessNotifications') || 'Show less' : t('viewAllNotifications')}
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
                        isImageAvatar(userAvatar) ? (
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
                          <span>{t('personalInformation')}</span>
                        </button>
                        <Link to="/tickets" className="user-menu-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <Ticket size={16} />
                          <span>{t('myTickets')}</span>
                        </Link>
                        <Link to="/game" className="user-menu-item" onClick={() => setIsUserDropdownOpen(false)}>
                          <CheckCircle size={16} />
                          <span>{t('checkIn')}</span>
                        </Link>
                        <button className="user-menu-item" onClick={() => {
                          setIsUserDropdownOpen(false);
                          setIsUserSettingsOpen(true);
                        }}>
                          <Settings size={16} />
                          <span>{t('settings')}</span>
                        </button>
                        <hr className="user-menu-divider" />
                        <button className="user-menu-item logout-btn" onClick={handleLogout}>
                          <LogOut size={16} />
                          <span>{t('logout')}</span>
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
                title={t('login')}
              >
                <User size={20} />
                <span>{t('login')}</span>
              </button>
            )}
            <LanguageSwitcher />
          </div>
        </div>

        {/* Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLoginSuccess}
        />
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
            {/* Mobile user info */}
            {user ? (
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  {userAvatar ? (
                    isImageAvatar(userAvatar) ? (
                      <img src={userAvatar} alt={user.fullName || user.username} />
                    ) : (
                      <div className="user-initials-mobile">{userAvatar}</div>
                    )
                  ) : (
                    <User size={22} />
                  )}
                </div>
                <div className="mobile-user-details">
                  <h4>{user.fullName || user.username}</h4>
                  <p>{user.email}</p>
                </div>
                <button className="mobile-logout-btn" onClick={handleLogout} title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="mobile-login-section">
                <button
                  className="mobile-login-btn"
                  onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }}
                >
                  <User size={18} />
                  <span>{t('login')}</span>
                </button>
              </div>
            )}

            <nav className="mobile-nav">
              <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>{t('schedule')}</Link>
              <Link to="/cinemas" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>{t('cinemas-system')}</Link>
              <Link to="/news" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>{t('news')}</Link>
              <Link to="/tickets" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>{t('myTickets')}</Link>
              {user && (
                <>
                  <Link to="/game" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>{t('checkIn')}</Link>
                  <button className="mobile-nav-link mobile-nav-btn" onClick={() => { setIsMobileMenuOpen(false); setIsUserProfileOpen(true); }}>{t('personalInformation')}</button>
                  <button className="mobile-nav-link mobile-nav-btn" onClick={() => { setIsMobileMenuOpen(false); setIsUserSettingsOpen(true); }}>{t('settings')}</button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* User Profile Popup */}
      {isUserProfileOpen && (
        <UserProfile
          isPopup={true}
          onClose={() => setIsUserProfileOpen(false)}
          onAvatarChange={handleAvatarChange}
        />
      )}

      {isUserSettingsOpen && (
        <UserSettingsModal
          isOpen={isUserSettingsOpen}
          onClose={() => setIsUserSettingsOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
