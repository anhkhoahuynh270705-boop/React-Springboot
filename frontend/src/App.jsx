import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './Client/components/Header/Header';
import Footer from './Client/components/Footer/Footer';
import ScrollToTop from './Client/components/ScrollToTop';
import Homepage from './Client/pages/Homepage/Homepage';
import MovieDetailPage from './Client/pages/MovieDetailPage/MovieDetailPage';
import CinemasPage from './Client/pages/CinemasPage/CinemasPage';
import TicketListPage from './Client/pages/TicketListPage/TicketListPage';
import ProfilePage from './Client/pages/ProfilePage/ProfilePage';
import SeatMapPage from './Client/pages/SeatMap/SeatMapPage';
import ComboSelectionPage from './Client/pages/ComboSelectionPage/ComboSelectionPage';
import NewsPage from './Client/pages/NewsPage/NewsPage';
import NewsDetailPage from './Client/pages/NewsDetailPage/NewsDetailPage';
import AdminLogin from './Admin/pages/Admin/AdminLogin';
import AdminDashboard from './Admin/pages/Admin/AdminDashboard';
import AdminRoute from './Admin/components/Admin/AdminRoute';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { getCurrentUser, logoutUser, isAuthenticated } from './services/userService';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra user đã đăng nhập khi component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = await getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    }
  };

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang kiểm tra đăng nhập...</p>
        </div>
      );
    }
    
    return user ? children : <Navigate to="/" replace />;
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải ứng dụng...</p>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Header user={user} setUser={setUser} onLogout={handleLogout} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/cinemas" element={<CinemasPage />} />
            <Route path="/movie/:movieId" element={<MovieDetailPage />} />
            <Route path="/tickets" element={<TicketListPage userId={user?.id} />} />
            <Route path="/seat-selection" element={<SeatMapPage />} />
            <Route path="/combo-selection" element={<ComboSelectionPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            
            {/* Protected routes - chỉ cho user đã đăng nhập */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {!window.location.pathname.startsWith('/admin') && <Footer />}
      </div>
    </Router>
  );
}

export default App;
