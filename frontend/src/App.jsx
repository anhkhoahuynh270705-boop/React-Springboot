import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser, logoutUser, isAuthenticated } from './services/userService';
import { HoneypotLink, HoneypotButton } from './services/useHoneypot.js';
import './App.css';
import { useTranslation } from 'react-i18next';

import Header from './Client/components/Header/Header';
import Footer from './Client/components/Footer/Footer';
import ScrollToTop from './Client/components/ScrollToTop';
import Homepage from './Client/pages/Homepage/Homepage';
import MovieDetailPage from './Client/pages/MovieDetailPage/MovieDetailPage';
import CinemasPage from './Client/pages/CinemasPage/CinemasPage';
import CinemaDetailPage from './Client/pages/CinemaDetailPage/CinemaDetailPage';
import TicketListPage from './Client/pages/TicketListPage/TicketListPage';
import ProfilePage from './Client/pages/ProfilePage/ProfilePage';
import SeatSelectionPage from './Client/pages/SeatSelectionPage/SeatSelectionPage';
import ComboSelectionPage from './Client/pages/ComboSelectionPage/ComboSelectionPage';
import NewsPage from './Client/pages/NewsPage/NewsPage';
import NewsDetailPage from './Client/pages/NewsDetailPage/NewsDetailPage';
import MembershipPage from './Client/pages/Membership/MembershipPage';
import EGiftPage from './Client/pages/EGift/EGiftPage';
import RewardsPage from './Client/pages/RewardsPage/RewardsPage';
import AdminDashboard from './Admin/pages/Admin/AdminDashboard';
import AdminRoute from './Admin/components/Admin/AdminRoute';
import PaymentManagement from './Admin/pages/PaymentManagement/PaymentManagement';
import DailySpinPage from './Client/pages/DailySpinPage';
import ChatBox from './Client/components/ChatBox/ChatBox';
import VietQRPayment from './Client/pages/VietQRPayment/VietQRPayment.jsx';
import ZaloPayPayment from './Client/pages/ZaloPayPayment/ZaloPayPayment.jsx';
import MoMoPayment from './Client/pages/MoMoPayment/MoMoPayment.jsx';
import GiftCardsPage from './Client/pages/GiftCardsPage/GiftCardsPage';
import AboutUsPage from './Client/pages/AboutUsPage/AboutUsPage';
import HelpCenterPage from './Client/pages/HelpCenterPage/HelpCenterPage';
import FAQPage from './Client/pages/FAQPage/FAQPage';
import TechnicalSupportPage from './Client/pages/TechnicalSupportPage/TechnicalSupportPage';
import ContactUsPage from './Client/pages/ContactUsPage/ContactUsPage';
import FeedbackPage from './Client/pages/FeedbackPage/FeedbackPage';
import TermsOfServicePage from './Client/pages/TermsOfServicePage/TermsOfServicePage';
import RefundPolicyPage from './Client/pages/RefundPolicyPage/RefundPolicyPage';
import ComplaintPage from './Client/pages/ComplaintPage/ComplaintPage';
import ForgotPasswordPage from './Client/pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from './Client/pages/ResetPasswordPage/ResetPasswordPage';
import GithubLoginSuccess from './Client/pages/GithubLoginSuccess/GithubLoginSuccess';
import PaymentSuccess from './Client/pages/PaymentSuccessPage/PaymentSuccess';
import FloatingContactLinks from './Client/components/FloatingContactLinks/FloatingContactLinks';

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" replace />;
}

function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (isAuthenticated()) {
          const currentUser = await getCurrentUser();
          if (currentUser) setUser(currentUser);
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

  const handleLogin = useCallback((loggedInUser) => {
    if (!loggedInUser || !loggedInUser.id) return;

    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    setUser(loggedInUser);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    }
  };


  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>{t('Loading...')}</p>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <RouteAwareLayout user={user} setUser={setUser} onLogin={handleLogin} onLogout={handleLogout} />
    </Router>
  );
}

function RouteAwareLayout({ user, setUser, onLogin, onLogout }) {
  const location = useLocation();
  const hideHeader = location.pathname === '/forgot-password' || location.pathname === '/reset-password';

  return (
    <div className="app">
      {/* Honeypot links - hidden URLs that only bots can see/crawl */}
      <HoneypotLink href="/admin/dashboard" text="Admin Dashboard" />
      <HoneypotLink href="/admin/login" text="Admin Login" />
      <HoneypotLink href="/api/admin/secret" text="Secret Admin API" />
      <HoneypotLink href="/wp-admin" text="WordPress Admin" />
      <HoneypotButton text="Delete All Data" />

      {!hideHeader && <Header user={user} setUser={setUser} onLogin={onLogin} onLogout={onLogout} />}
      <main className={`app-main ${hideHeader ? 'no-header' : ''}`}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/cinemas" element={<CinemasPage />} />
          <Route path="/cinema/:cinemaId" element={<CinemaDetailPage />} />
          <Route path="/movie/:movieId" element={<MovieDetailPage />} />
          <Route path="/tickets" element={<TicketListPage userId={user?.id} />} />
          <Route path="/seat-selection" element={<SeatSelectionPage />} />
          <Route path="/combo-selection" element={<ComboSelectionPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/egift" element={<EGiftPage />} />
          <Route path="/game" element={<DailySpinPage />} />
          <Route path="/payment/vietqr" element={<VietQRPayment />} />
          <Route path="/payment/zalopay" element={<ZaloPayPayment />} />
          <Route path="/payment/momo" element={<MoMoPayment />} />
          <Route path="/gift-cards" element={<GiftCardsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/support" element={<TechnicalSupportPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/complaint" element={<ComplaintPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/github-login-success" element={<GithubLoginSuccess onLogin={onLogin} />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <AdminRoute>
                <PaymentManagement />
              </AdminRoute>
            }
          />
          <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer & ChatBox (Hide on admin and auth pages) */}
      {!location.pathname.startsWith('/admin') && !hideHeader && <Footer />}
      {!location.pathname.startsWith('/admin') && !hideHeader && <ChatBox />}
      {!location.pathname.startsWith('/admin') && !hideHeader && <FloatingContactLinks />}
    </div>
  );
}

export default App;
