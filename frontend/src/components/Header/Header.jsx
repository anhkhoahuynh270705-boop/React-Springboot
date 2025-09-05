import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Search, MapPin, ChevronDown, User, LogOut, Settings, Ticket, Building2 } from 'lucide-react';
import { getCinemas, getCinemasByCity, searchCinemas, getCinemaLogo } from '../../services/cinemaService';
import { logoutUser } from '../../services/userService';

import LoginModal from '../LoginModal/LoginModal';
import UserProfile from '../UserProfile/UserProfile';
import './Header.css';

const Header = ({ user, setUser, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Handle ESC key to close dropdowns
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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search functionality here
    console.log('Searching for:', searchQuery);
  };

  // Fetch cinemas from API
  const fetchCinemas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCinemas();
      console.log('API Response - All cinemas:', data); // Debug log
      setCinemas(data);
      filterCinemas(data, selectedCity, cinemaSearchQuery);
    } catch (err) {
      setError('Không thể tải danh sách rạp chiếu');
      console.error('Error fetching cinemas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter cinemas by city and search query
  const filterCinemas = (cinemaList, city, searchQuery) => {
    let filtered = cinemaList.filter(cinema => 
      cinema.city === city
    );
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(cinema =>
        cinema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cinema.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    console.log('Filtered cinemas:', filtered); // Debug log
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
      // Kiểm tra nếu user có custom avatar
      if (user.customAvatar && user.avatarUrl) {
        setUserAvatar(user.avatarUrl);
        setIsCustomAvatar(true);
        console.log('Custom avatar loaded for header:', user.avatarUrl);
      } else {
        // Tạo initials từ tên người dùng
        const generateInitials = (name) => {
          if (!name) return 'U';
          
          // Lấy fullName nếu có, không thì dùng username
          const displayName = user.fullName || user.username;
          
          // Tách các từ và lấy chữ cái đầu
          const words = displayName.trim().split(/\s+/);
          if (words.length >= 2) {
            // Nếu có 2 từ trở lên, lấy chữ cái đầu của 2 từ đầu
            return (words[0][0] + words[1][0]).toUpperCase();
          } else {
            // Nếu chỉ có 1 từ, lấy 2 chữ cái đầu
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCinemaDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
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
    // Nếu là custom avatar (upload), hiển thị ảnh
    // Nếu là AI avatar, hiển thị initials
    if (updatedUser.customAvatar) {
      setUserAvatar(newAvatarUrl);
      setIsCustomAvatar(true);
    } else {
      // Tạo initials cho AI avatar
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

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src="/logo.png" alt="CGV HAK" />
          </Link>
        </div>

        <div className="header-center">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </form>
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
                        console.log('Cinema data:', cinema); // Debug log
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
                              {/* Debug info */}
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
                          // Fallback to initials if image fails to load
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
                  <div className="user-info">
                    <div className="user-avatar-large">
                      {userAvatar ? (
                        isCustomAvatar ? (
                          <img 
                            src={userAvatar} 
                            alt={user.fullName || user.username}
                            onError={() => {
                              // Fallback to initials if image fails to load
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
                          <div className="user-initials-large">
                            {userAvatar}
                          </div>
                        )
                      ) : (
                        <User size={32} />
                      )}
                    </div>
                    <div className="user-details">
                      <h4>{user.fullName || user.username}</h4>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  
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

        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <Link to="/" className="mobile-nav-link">Trang chủ</Link>
            <Link to="/news" className="mobile-nav-link">Tin tức</Link>
            <Link to="/cinemas" className="mobile-nav-link">Rạp chiếu</Link>
            <Link to="/tickets" className="mobile-nav-link">Vé của tôi</Link>
          </nav>
          <div className="mobile-auth">
            {user ? (
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  {userAvatar ? (
                    isCustomAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt={user.fullName || user.username}
                        onError={() => {
                          // Fallback to initials if image fails to load
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
                      <div className="user-initials-mobile">
                        {userAvatar}
                      </div>
                    )
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div className="mobile-user-details">
                  <h4>{user.fullName || user.username}</h4>
                  <p>{user.email}</p>
                </div>
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                className="mobile-user-icon-btn"
                onClick={() => {
                  setIsLoginModalOpen(true);
                  setIsMenuOpen(false);
                }}
                title="Đăng nhập / Đăng ký"
              >
                <User size={24} />
                <span>Đăng nhập / Đăng ký</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLoginSuccess}
      />

      {/* User Profile Popup */}
      {isUserProfileOpen && (
        <UserProfile 
          isPopup={true}
          onClose={() => setIsUserProfileOpen(false)}
          onAvatarChange={handleAvatarChange}
        />
      )}
    </header>
  );
};

export default Header;
