import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Ticket,
  CreditCard,
  User,
  Settings,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './FAQPage.css';

const FAQPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const categories = [
    { id: 'all', name: t('All Questions') },
    { id: 'booking', name: t('Booking & Tickets') },
    { id: 'payment', name: t('Payment & Billing') },
    { id: 'account', name: t('Account & Profile') },
    { id: 'technical', name: t('Technical Issues') },
    { id: 'mobile', name: t('Mobile App') },
    { id: 'website', name: t('Website') }
  ];

  const faqItems = [
    {
      id: 1,
      category: 'booking',
      question: t('How do I book movie tickets online?'),
      answer: t('To book movie tickets online: 1) Browse our movie selection and choose your preferred film, 2) Select your cinema and showtime, 3) Choose your seats from the interactive seat map, 4) Add any combos or snacks to your order, 5) Proceed to payment and complete your booking. You will receive a confirmation email with your ticket details.'),
      popular: true
    },
    {
      id: 2,
      category: 'booking',
      question: t('Can I cancel or modify my booking?'),
      answer: t('Yes, you can cancel or modify your booking up to 2 hours before the showtime. Go to the "My Tickets" section in your profile, select the booking you want to change, and choose either "Cancel" or "Modify". Please note that modifications are subject to seat availability.'),
      popular: true
    },
    {
      id: 3,
      category: 'booking',
      question: t('How far in advance can I book tickets?'),
      answer: t('You can book tickets up to 30 days in advance. We recommend booking early for popular movies and weekend shows to secure your preferred seats.'),
      popular: false
    },
    {
      id: 4,
      category: 'booking',
      question: t('What if I arrive late for my movie?'),
      answer: t('We recommend arriving at least 15 minutes before the showtime. If you arrive late, you may miss the beginning of the movie, and we cannot guarantee that your seats will still be available. No refunds are provided for late arrivals.'),
      popular: false
    },
    {
      id: 5,
      category: 'payment',
      question: t('What payment methods do you accept?'),
      answer: t('We accept various payment methods including: Credit and Debit cards (Visa, Mastercard), Bank transfers, E-wallets (MoMo, ZaloPay), VietQR payments, and our sandbox wallet for testing purposes. All payments are processed securely.'),
      popular: true
    },
    {
      id: 6,
      category: 'payment',
      question: t('Is my payment information secure?'),
      answer: t('Yes, we use industry-standard encryption to protect your payment information. We do not store your credit card details on our servers. All transactions are processed through secure payment gateways.'),
      popular: true
    },
    {
      id: 7,
      category: 'payment',
      question: t('How do I get a refund?'),
      answer: t('Refunds are automatically processed for cancelled bookings within 3-5 business days. For other refund requests, please contact our customer service team. Refunds will be credited back to your original payment method.'),
      popular: false
    },
    {
      id: 8,
      category: 'account',
      question: t('How do I create an account?'),
      answer: t('Creating an account is simple: 1) Click "Login" in the top right corner of our website, 2) Select "Sign Up" or "Create Account", 3) Fill in your personal details including name, email, and password, 4) Verify your email address, 5) Start booking tickets and enjoying our services!'),
      popular: true
    },
    {
      id: 9,
      category: 'account',
      question: t('How do I reset my password?'),
      answer: t('To reset your password: 1) Go to the login page and click "Forgot Password", 2) Enter your email address, 3) Check your email for a password reset link, 4) Click the link and create a new password, 5) Log in with your new password.'),
      popular: false
    },
    {
      id: 10,
      category: 'account',
      question: t('Can I have multiple accounts?'),
      answer: t('We recommend having only one account per person. Having multiple accounts may lead to confusion and issues with bookings. If you need to merge accounts or have questions about this, please contact our support team.'),
      popular: false
    },
    {
      id: 11,
      category: 'technical',
      question: t('The website is not loading properly. What should I do?'),
      answer: t('If the website is not loading properly, try these steps: 1) Clear your browser cache and cookies, 2) Disable browser extensions temporarily, 3) Try using a different browser, 4) Check your internet connection, 5) If the problem persists, contact our technical support team.'),
      popular: true
    },
    {
      id: 12,
      category: 'technical',
      question: t('I\'m having trouble with the payment page. What can I do?'),
      answer: t('If you\'re experiencing issues with the payment page: 1) Ensure you have a stable internet connection, 2) Try refreshing the page, 3) Clear your browser cache, 4) Try using a different payment method, 5) Disable any ad blockers, 6) Contact our support team if the issue continues.'),
      popular: false
    },
    {
      id: 13,
      category: 'mobile',
      question: t('Do you have a mobile app?'),
      answer: t('Yes, we have mobile apps available for both iOS and Android devices. You can download our app from the App Store or Google Play Store by searching for "Galaxy Studio Cinema". The app offers the same features as our website with added convenience.'),
      popular: true
    },
    {
      id: 14,
      category: 'mobile',
      question: t('Can I book tickets through the mobile app?'),
      answer: t('Absolutely! Our mobile app provides full booking functionality. You can browse movies, select showtimes, choose seats, make payments, and manage your bookings all through the app. The app also supports push notifications for booking confirmations and reminders.'),
      popular: false
    },
    {
      id: 15,
      category: 'website',
      question: t('How do I enable notifications?'),
      answer: t('To enable notifications: 1) Log in to your account, 2) Go to your profile settings, 3) Click on "Notifications" or "Preferences", 4) Enable the types of notifications you want to receive (email, SMS, push notifications), 5) Save your preferences. You can change these settings anytime.'),
      popular: false
    },
    {
      id: 16,
      category: 'website',
      question: t('Can I change the language of the website?'),
      answer: t('Yes, you can change the website language using the language switcher in the top right corner of the page. We currently support Vietnamese and English. The language preference will be saved for your next visit.'),
      popular: false
    }
  ];

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredItems = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularItems = faqItems.filter(item => item.popular);

  return (
    <div className="faq-page">
      <div className="faq-container">
        {/* Header */}
        <div className="faq-header">
          <div className="breadcrumb">
            <Link to="/" className="breadcrumb-link">
                <ArrowLeft size={16} />
              {t('Back to Home')}
            </Link>
          </div>
          <h1 className="faq-title">{t('Frequently Asked Questions')}</h1>
          <p className="faq-subtitle">
            {t('Find quick answers to the most common questions about our services')}
          </p>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
                <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t('Search FAQ...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="categories-section">
          <h2 className="section-title">{t('Browse by Category')}</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Questions */}
        {selectedCategory === 'all' && (
          <div className="popular-section">
            <h2 className="section-title">{t('Popular Questions')}</h2>
            <div className="faq-list">
              {popularItems.map((item) => (
                <div key={item.id} className="faq-item popular">
                  <button
                    className="faq-question"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className="question-content">
                      <h3 className="question-text">{item.question}</h3>
                      <div className="popular-badge">{t('Popular')}</div>
                    </div>
                    {expandedItems.has(item.id)  ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedItems.has(item.id) && (
                    <div className="faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Questions */}
        <div className="questions-section">
          <h2 className="section-title">
            {selectedCategory === 'all' 
              ? t('All Questions') 
              : categories.find(cat => cat.id === selectedCategory)?.name
            }
            {searchQuery && ` - ${t('Search Results')}`}
          </h2>
          <div className="faq-list">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div key={item.id} className="faq-item">
                  <button
                    className="faq-question"
                    onClick={() => toggleExpanded(item.id)}
                  >
                    <div className="question-content">
                      <h3 className="question-text">{item.question}</h3>
                      {item.popular && (
                        <div className="popular-tag">{t('Popular')}</div>
                      )}
                    </div>
                    {expandedItems.has(item.id)  ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedItems.has(item.id) && (
                    <div className="faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-results">
                <AlertCircle size={48} className="no-results-icon" />
                <h3>{t('No questions found')}</h3>
                <p>{t('Try adjusting your search terms or browse different categories')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="contact-section">
          <div className="contact-card">
            <div className="contact-icon">
                <HelpCircle size={32} />
            </div>
            <div className="contact-content">
              <h3>{t('Still have questions?')}</h3>
              <p>{t('Can\'t find what you\'re looking for? Our support team is here to help!')}</p>
              <div className="contact-actions">
                <Link to="/help" className="contact-btn primary">
                  {t('Visit Help Center')}
                </Link>
                <Link to="/support" className="contact-btn secondary">
                  {t('Contact Support')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
