import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Ticket, 
  BarChart3, 
  Settings, 
  LogOut, 
  FileText,
  Package,
  Film,
  Building2,
  Clock
} from 'lucide-react';
import { getAdminStats } from '../../../services/adminService';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/Toast/ToastContainer';
import UserManagement from '../../components/UserManagement/UserManagement';
import NewsManagement from '../../components/NewsManagement/NewsManagement';
import TicketManagement from '../../components/TicketManagement/TicketManagement';
import ComboManagement from '../../components/ComboManagement/ComboManagement';
import SeatManagement from '../../components/SeatManagement/SeatManagement';
import MovieManagement from '../../components/MovieManagement/MovieManagement';
import CinemaManagement from '../../components/CinemaManagement/CinemaManagement';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalUsers: 0,
    confirmedTickets: 0,
    cancelledTickets: 0,
    totalRevenue: 0
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('authToken');
    
    if (userToken) {
      showWarning('Vui lòng đăng xuất tài khoản người dùng trước khi truy cập Admin Panel');
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
      const statsData = await getAdminStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showError('Lỗi khi tải dữ liệu admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
    return (
          <div className={styles.dashboardContent}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
          <Ticket size={24} />
        </div>
                <div className={styles.statInfo}>
                  <h3>Tổng vé</h3>
                  <p className={styles.statNumber}>{stats.totalTickets}</p>
        </div>
      </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                    <Users size={24} />
                  </div>
                <div className={styles.statInfo}>
                  <h3>Tổng người dùng</h3>
                  <p className={styles.statNumber}>{stats.totalUsers}</p>
                  </div>
                </div>
                
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <BarChart3 size={24} />
                  </div>
                <div className={styles.statInfo}>
                  <h3>Vé đã xác nhận</h3>
                  <p className={styles.statNumber}>{stats.confirmedTickets}</p>
                  </div>
                </div>
                
              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Settings size={24} />
                  </div>
                <div className={styles.statInfo}>
                  <h3>Vé đã hủy</h3>
                  <p className={styles.statNumber}>{stats.cancelledTickets}</p>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <BarChart3 size={24} />
                        </div>
                <div className={styles.statInfo}>
                  <h3>Tổng doanh thu</h3>
                  <p className={styles.statNumber}>{formatCurrency(stats.totalRevenue)}</p>
                      </div>
                      </div>
                    </div>
            
            <div className={styles.welcomeSection}>
              <h2>Chào mừng đến với Admin Panel</h2>
              <p>Quản lý hệ thống rạp chiếu phim CGV HAK</p>
              <div className={styles.quickActions}>
                    <button
                  className={styles.quickActionBtn}
                  onClick={() => setActiveTab('users')}
                    >
                  <Users size={20} />
                  Quản lý người dùng
                    </button>
                    <button
                  className={styles.quickActionBtn}
                  onClick={() => setActiveTab('tickets')}
                    >
                  <Ticket size={20} />
                  Quản lý vé
                    </button>
                    <button
                  className={styles.quickActionBtn}
                  onClick={() => setActiveTab('news')}
                    >
                  <FileText size={20} />
                  Quản lý tin tức
                    </button>
                        <button
                  className={styles.quickActionBtn}
                  onClick={() => setActiveTab('combos')}
                >
                  <Package size={20} />
                  Quản lý combo
                        </button>
                                  </div>
                                  </div>
                                </div>
                              );
      case 'users':
        return <UserManagement />;
      case 'tickets':
        return <TicketManagement />;
      case 'news':
        return <NewsManagement />;
      case 'combos':
        return <ComboManagement />;
      case 'seats':
        return <SeatManagement />;
      case 'movies':
        return <MovieManagement />;
      case 'cinemas':
        return <CinemaManagement />;
      
      default:
        return <div>Tab không tồn tại</div>;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>Admin Panel</h2>
        </div>  
        {/* Navbar Section */}
        <nav className={styles.nav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')} >
            <BarChart3 size={20}/> 
          Dashboard 
          </button>
                        
          <button 
            className={`${styles.navItem} ${activeTab === 'movies' ? styles.active : ''}`}
            onClick={() => setActiveTab('movies')}
                  >
            <Film size={20} />
            Quản lý phim
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === 'cinemas' ? styles.active : ''}`}
            onClick={() => setActiveTab('cinemas')}
                  >
            <Building2 size={20} />
            Quản lý rạp
          </button>

          

          <button 
            className={`${styles.navItem} ${activeTab === 'tickets' ? styles.active : ''}`}
            onClick={() => setActiveTab('tickets')}
                            >
            <Ticket size={20} />
            Quản lý vé
          </button>
          
          <button 
            className={`${styles.navItem} ${activeTab === 'news' ? styles.active : ''}`}
            onClick={() => setActiveTab('news')}
                  >
            <FileText size={20} />
            Quản lý tin tức
          </button>
          
          <button 
            className={`${styles.navItem} ${activeTab === 'combos' ? styles.active : ''}`}
            onClick={() => setActiveTab('combos')}
                  >
            <Package size={20} />
            Quản lý combo
          </button>
          
          <button 
            className={`${styles.navItem} ${activeTab === 'seats' ? styles.active : ''}`}
            onClick={() => setActiveTab('seats')}
          >
            <Settings size={20} />
            Quản lý ghế
          </button>
        
          <button 
            className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
                  >
            <Users size={20} />
            Quản lý người dùng
          </button>
        </nav>

       {/* Logout Section */}
        <div className={styles.logoutSection}>
                    <button 
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            <LogOut size={20} />
            Đăng xuất
                    </button>
                  </div>
                </div>
      
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'users' && 'Quản lý người dùng'}
            {activeTab === 'tickets' && 'Quản lý vé'}
            {activeTab === 'news' && 'Quản lý tin tức'}
            {activeTab === 'combos' && 'Quản lý combo'}
            {activeTab === 'seats' && 'Quản lý ghế'}
            {activeTab === 'movies' && 'Quản lý phim'}
            {activeTab === 'cinemas' && 'Quản lý rạp chiếu'}
            
          </h1>
      </div>

        <div className={styles.content}>
          {renderTabContent()}
                  </div>
                </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AdminDashboard;