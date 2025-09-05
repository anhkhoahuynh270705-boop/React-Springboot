import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop';
import Homepage from './pages/Homepage/Homepage';
import MovieDetailPage from './pages/MovieDetailPage/MovieDetailPage';
import CinemasPage from './pages/CinemasPage/CinemasPage';
import TicketListPage from './pages/TicketListPage/TicketListPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import SeatMapPage from './pages/SeatMap/SeatMapPage';
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
        // Xóa token nếu không hợp lệ
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
      // Vẫn xóa user state ngay cả khi API fail
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
            
            {/* Protected routes - chỉ cho user đã đăng nhập */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
