import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  HelpCircle, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  ChevronRight,
  Ticket,
  CreditCard,
  User,
  Settings,
  Smartphone,
  Monitor,
  Wifi,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './HelpCenterPage.css';

const HelpCenterPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: t('All Topics') },
    { id: 'booking', name: t('Booking & Tickets') },
    { id: 'payment', name: t('Payment & Billing') },
    { id: 'account', name: t('Account & Profile') },
    { id: 'technical', name: t('Technical Issues') },
    { id: 'mobile', name: t('Mobile App') },
    { id: 'website', name: t('Website') }
  ];

  const helpArticles = [
    {
      id: 1,
      category: 'booking',
      title: t('How to book movie tickets online'),
      content: t('To book movie tickets online, follow these steps: 1) Select your preferred movie and showtime, 2) Choose your seats, 3) Add any combos or snacks, 4) Proceed to payment, 5) Complete your booking and receive confirmation.'),
      popular: true
    },
    {
      id: 2,
      category: 'booking',
      title: t('How to cancel or modify my booking'),
      content: t('You can cancel or modify your booking up to 2 hours before the showtime. Go to "My Tickets" section, select your booking, and choose "Cancel" or "Modify". Refunds will be processed within 3-5 business days.'),
      popular: true
    },
    {
      id: 3,
      category: 'payment',
      title: t('What payment methods are accepted'),
      content: t('We accept various payment methods including: Credit/Debit cards (Visa, Mastercard), Bank transfers, E-wallets (MoMo, ZaloPay), VietQR, and our sandbox wallet for testing purposes.'),
      popular: true
    },
    {
      id: 4,
      category: 'payment',
      title: t('How to get a refund'),
      content: t('Refunds are processed automatically for cancelled bookings. For other refund requests, contact our customer service team. Refunds typically take 3-5 business days to appear in your account.'),
      popular: false
    },
    {
      id: 5,
      category: 'account',
      title: t('How to create an account'),
      content: t('Creating an account is easy: 1) Click "Login" in the top right corner, 2) Select "Sign Up", 3) Fill in your details, 4) Verify your email, 5) Start booking tickets!'),
      popular: false
    },
    {
      id: 6,
      category: 'account',
      title: t('How to update my profile information'),
      content: t('To update your profile: 1) Go to your profile page, 2) Click "Edit Profile", 3) Update your information, 4) Click "Save Changes". Your changes will be saved immediately.'),
      popular: false
    },
    {
      id: 7,
      category: 'technical',
      title: t('Website is not loading properly'),
      content: t('If the website is not loading properly, try: 1) Clear your browser cache, 2) Disable browser extensions, 3) Try a different browser, 4) Check your internet connection, 5) Contact technical support if issues persist.'),
      popular: true
    },
    {
      id: 8,
      category: 'technical',
      title: t('Payment page is not working'),
      content: t('If the payment page is not working: 1) Ensure you have a stable internet connection, 2) Try refreshing the page, 3) Clear browser cache, 4) Try a different payment method, 5) Contact support if the issue continues.'),
      popular: false
    },
    {
      id: 9,
      category: 'mobile',
      title: t('How to download the mobile app'),
      content: t('Our mobile app is available on both iOS and Android. Visit the App Store or Google Play Store and search for "Galaxy Studio Cinema" to download the app.'),
      popular: false
    },
    {
      id: 10,
      category: 'website',
      title: t('How to enable notifications'),
      content: t('To enable notifications: 1) Go to your profile settings, 2) Click on "Notifications", 3) Enable the notifications you want to receive, 4) Save your preferences.'),
      popular: false
    }
  ];

  const contactMethods = [
    {
      title: t('Phone Support'),
      description: t('Call us for immediate assistance'),
      contact: '+84 93 208 2976',
      available: t('24/7 Available'),
      color: '#10b981'
    },
    {
      title: t('Email Support'),
      description: t('Send us an email and we\'ll respond within 24 hours'),
      contact: 'hk4744t@gre.ac.uk',
      available: t('24/7 Available'),
      color: '#3b82f6'
    },
    {
      title: t('Live Chat'),
      description: t('Chat with our support team in real-time'),
      contact: t('Click the chat button'),
      available: t('9:00 AM - 22:00 PM'),
      color: '#8b5cf6'
    }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularArticles = helpArticles.filter(article => article.popular);

  return (
    <div className="help-center-page">
      <div className="help-center-container">
        {/* Header */}
        <div className="help-center-header">
          <div className="breadcrumb">
            <Link to="/" className="breadcrumb-link">
                <ArrowLeft size={16} />
              {t('Back to Home')}
            </Link>
          </div>
          <h1 className="help-center-title">{t('Help Center')}</h1>
          <p className="help-center-subtitle">
            {t('Find answers to your questions and get the support you need')}
          </p>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
                <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t('Search for help articles...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Quick Help Categories */}
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
                <ChevronRight size={16} className="category-arrow" />
              </button>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        {selectedCategory === 'all' && (
          <div className="popular-section">
            <h2 className="section-title">{t('Popular Articles')}</h2>
            <div className="articles-grid">
              {popularArticles.map((article) => (
                <div key={article.id} className="article-card popular">
                  <div className="article-header">
                    <h3 className="article-title">{article.title}</h3>
                    <div className="popular-badge">{t('Popular')}</div>
                  </div>
                  <p className="article-content">{article.content}</p>
                  <button className="read-more-btn">
                    {t('Read More')} 
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtered Articles */}
        <div className="articles-section">
          <h2 className="section-title">
            {selectedCategory === 'all' 
              ? t('All Articles') 
              : categories.find(cat => cat.id === selectedCategory)?.name
            }
            {searchQuery && ` - ${t('Search Results')}`}
          </h2>
          <div className="articles-list">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <div key={article.id} className="article-item">
                  <div className="article-info">
                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-content">{article.content}</p>
                    <div className="article-meta">
                      <span className="article-category">
                        {categories.find(cat => cat.id === article.category)?.name}
                      </span>
                      {article.popular && (
                        <span className="popular-tag">{t('Popular')}</span>
                      )}
                    </div>
                  </div>
                  <button className="read-more-btn">
                    {t('Read More')} 
                  </button>
                </div>
              ))
            ) : (
              <div className="no-results">
                <h3>{t('No articles found')}</h3>
                <p>{t('Try adjusting your search terms or browse different categories')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div className="contact-section">
          <h2 className="section-title">{t('Still need help?')}</h2>
          <p className="contact-subtitle">
            {t('Our support team is here to help you with any questions or issues')}
          </p>
          <div className="contact-methods">
            {contactMethods.map((method, index) => (
              <div key={index} className="contact-card">
                <div className="contact-icon" style={{ backgroundColor: method.color }}>
                  </div>
                <div className="contact-info">
                  <h3 className="contact-title">{method.title}</h3>
                  <p className="contact-description">{method.description}</p>
                  <p className="contact-detail">{method.contact}</p>
                  <p className="contact-availability">{method.available}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="resources-section">
          <h2 className="section-title">{t('Additional Resources')}</h2>
          <div className="resources-grid">
            <Link to="/faq" className="resource-card">
                <HelpCircle size={24} />
              <h3>{t('Frequently Asked Questions')}</h3>
              <p>{t('Find quick answers to common questions')}</p>
            </Link>
            <Link to="/support" className="resource-card">
                <Settings size={24} />
              <h3>{t('Technical Support')}</h3>
              <p>{t('Get help with technical issues')}</p>
            </Link>
            <Link to="/contact" className="resource-card">
                <Phone size={24} />
              <h3>{t('Contact Us')}</h3>
              <p>{t('Get in touch with our team')}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
