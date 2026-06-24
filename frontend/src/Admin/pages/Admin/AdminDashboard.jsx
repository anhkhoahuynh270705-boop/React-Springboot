/* eslint-disable no-unused-vars */
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Ticket,
  BarChart3,
  FileText,
  Package,
  Film,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Armchair,
  RefreshCw
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { getAdminStats } from '../../../services/adminService';
import useToast from '../../hooks/useToast';
import ToastContainer from '../../components/Toast/ToastContainer';
import UserManagement from '../../components/UserManagement/UserManagements/UserManagement';
import NewsManagement from '../../components/NewsManagement/NewManagement/NewsManagement';
import TicketManagement from '../../components/TicketManagement/TicketManagement';
import ComboManagement from '../../components/ComboManagement/ComboManagement/ComboManagement';
import SeatManagement from '../../components/SeatManagement/SeatManagement';
import MovieManagement from '../../components/MovieManagement/MovieManagement';
import CinemaManagement from '../../components/CinemaManagement/CinemaManagement/CinemaManagement';
import PaymentManagement from '../PaymentManagement/PaymentManagement';
import styles from './AdminDashboard.module.css';
import { useTranslation } from 'react-i18next';


// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toasts, showSuccess, showError, showWarning, showInfo, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTickets: 0,
    totalUsers: 0,
    confirmedTickets: 0,
    cancelledTickets: 0,
    totalRevenue: 0,
    monthlyRevenue: {},
    weeklyTicketSales: {},
    weeklyUserGrowth: {},
    popularMovies: {}
  });
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Chart data from API
  const revenueData = {
    labels: Object.keys(stats.monthlyRevenue || {}),
    datasets: [
      {
        label: t('Revenue (VND)'),
        data: Object.values(stats.monthlyRevenue || {}),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const ticketSalesData = {
    labels: Object.keys(stats.weeklyTicketSales || {}),
    datasets: [
      {
        label: t('Tickets sold'),
        data: Object.values(stats.weeklyTicketSales || {}),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const userGrowthData = {
    labels: Object.keys(stats.weeklyUserGrowth || {}),
    datasets: [
      {
        label: t('New users'),
        data: Object.values(stats.weeklyUserGrowth || {}),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: t('Statistics chart')
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const revenueChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: t('Revenue by month')
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(value);
          }
        }
      }
    }
  };

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('authToken');

    if (userToken) {
      showWarning(t('Please logout user account before accessing Admin Panel'));
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
      showError(t('Error fetching admin data: ') + error.message);
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
                  <h3>{t('Total')}</h3>
                  <p className={styles.statNumber}>{stats.totalTickets}</p>
                  <div className={styles.statTrend}>
                    <TrendingUp size={16} />
                    <span>+12%</span>
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <Users size={24} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{t('Total users')}</h3>
                  <p className={styles.statNumber}>{stats.totalUsers}</p>
                  <div className={styles.statTrend}>
                    <TrendingDown size={16} />
                    <span>+8%</span>
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <CheckCircle size={24} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{t('Confirmed tickets')}</h3>
                  <p className={styles.statNumber}>{stats.confirmedTickets}</p>
                  <div className={styles.statTrend}>
                    <TrendingUp size={16} />
                    <span>+15%</span>
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <XCircle size={24} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{t('Cancelled tickets')}</h3>
                  <p className={styles.statNumber}>{stats.cancelledTickets}</p>
                  <div className={styles.statTrend}>
                    <TrendingDown size={16} />
                    <span>-5%</span>
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIcon}>
                  <DollarSign size={24} />
                </div>
                <div className={styles.statInfo}>
                  <h3>{t('Total revenue')}</h3>
                  <p className={styles.statNumber}>{formatCurrency(stats.totalRevenue)}</p>
                  <div className={styles.statTrend}>
                    <TrendingUp size={16} />
                    <span>+22%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className={styles.chartsSection}>
              <div className={styles.chartContainer}>
                <h3>{t('Revenue by month')}</h3>
                <Line data={revenueData} options={revenueChartOptions} />
              </div>

              <div className={styles.chartContainer}>
                <h3>{t('Ticket sales by day in week')}</h3>
                <Bar data={ticketSalesData} options={chartOptions} />
              </div>

              <div className={styles.chartContainer}>
                <h3>{t('New users registered')}</h3>
                <Bar data={userGrowthData} options={chartOptions} />
              </div>
            </div>

            {/* Popular Movies Section */}
            {stats.popularMovies && Object.keys(stats.popularMovies).length > 0 && (
              <div className={styles.popularMoviesSection}>
                <h3>{t('Most viewed movies')}</h3>
                <div className={styles.popularMoviesList}>
                  {Object.entries(stats.popularMovies).map(([key, movieTitle], index) => (
                    <div key={key} className={styles.popularMovieItem}>
                      <div className={styles.movieRank}>#{index + 1}</div>
                      <div className={styles.movieTitle}>{movieTitle}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'payments':
        return <PaymentManagement />;
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
        return <div>{t('Tab does not exist')}</div>;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>{t('Loading...')}</p>
      </div>
    );
  }

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>{t('Admin Panel')}</h2>
        </div>
        {/* Navbar Section */}
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')} >
            <BarChart3 size={20} />
            {t('Dashboard')}
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'payments' ? styles.active : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={20} />
            {t('Payment management')}
          </button>
          <button
            className={`${styles.navItem} ${activeTab === 'movies' ? styles.active : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            <Film size={20} />
            {t('Movie management')}
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'cinemas' ? styles.active : ''}`}
            onClick={() => setActiveTab('cinemas')}
          >
            <Building2 size={20} />
            {t('Cinema management')}
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'tickets' ? styles.active : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <Ticket size={20} />
            {t('Ticket management')}
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'news' ? styles.active : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <FileText size={20} />
            {t('News management')}
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'combos' ? styles.active : ''}`}
            onClick={() => setActiveTab('combos')}
          >
            <Package size={20} />
            {t('Combo management')}
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'seats' ? styles.active : ''}`}
            onClick={() => setActiveTab('seats')}
          >
            <Armchair size={20} />
            {t('Seat management')}
          </button>

          <button
            className={`${styles.navItem} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            {t('User management')}
          </button>

        </nav>
        {/* Logout Section */}
      </div>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>
            {activeTab === 'dashboard' && t('Dashboard')}
            {activeTab === 'payments' && t('Payment management')}
            {activeTab === 'users' && t('User management')}
            {activeTab === 'tickets' && t('Ticket management')}
            {activeTab === 'news' && t('News management')}
            {activeTab === 'combos' && t('Combo management')}
            {activeTab === 'seats' && t('Seat management')}
            {activeTab === 'movies' && t('Movie management')}
            {activeTab === 'cinemas' && t('Cinema management')}

          </h1>
          {activeTab === 'dashboard' && (
            <button
              className={styles.refreshBtn}
              onClick={fetchData}
              title={t('Refresh')}
            >
              <RefreshCw size={18} />
            </button>
          )}
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