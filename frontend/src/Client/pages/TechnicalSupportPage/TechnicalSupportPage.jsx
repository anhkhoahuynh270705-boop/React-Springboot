import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Settings, 
  Monitor, 
  Smartphone, 
  Wifi, 
  AlertCircle, 
  CheckCircle, 
  Phone, 
  Mail, 
  MessageCircle,
  ArrowLeft,
  Shield,
  Globe,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './TechnicalSupportPage.css';

const TechnicalSupportPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const categories = [
    { id: 'all', name: t('All Issues') },
    { id: 'website', name: t('Website Issues') },
    { id: 'mobile', name: t('Mobile App') },
    { id: 'payment', name: t('Payment System') },
    { id: 'performance', name: t('Performance') },
    { id: 'browser', name: t('Browser Issues') },
    { id: 'network', name: t('Network Issues') }
  ];

  const technicalIssues = [
    {
      id: 1,
      category: 'website',
      title: t('Website not loading or showing blank page'),
      description: t('The website is not loading properly or showing a blank page'),
      solutions: [
        t('Clear your browser cache and cookies'),
        t('Disable browser extensions temporarily'),
        t('Try using a different browser (Chrome, Firefox, Safari)'),
        t('Check your internet connection'),
        t('Try accessing the website in incognito/private mode')
      ],
      severity: 'high',
      popular: true
    },
    {
      id: 2,
      category: 'payment',
      title: t('Payment page not working or transaction failed'),
      description: t('Unable to complete payment or payment page is not responding'),
      solutions: [
        t('Ensure you have a stable internet connection'),
        t('Try refreshing the payment page'),
        t('Clear browser cache and cookies'),
        t('Try using a different payment method'),
        t('Disable ad blockers and popup blockers'),
        t('Check if your bank supports online transactions')
      ],
      severity: 'high',
      popular: true
    },
    {
      id: 3,
      category: 'mobile',
      title: t('Mobile app crashes or won\'t open'),
      description: t('The mobile app is crashing or not opening properly'),
      solutions: [
        t('Update the app to the latest version'),
        t('Restart your mobile device'),
        t('Clear app cache and data'),
        t('Uninstall and reinstall the app'),
        t('Check if your device meets minimum requirements'),
        t('Ensure you have enough storage space')
      ],
      severity: 'high',
      popular: true
    },
    {
      id: 4,
      category: 'performance',
      title: t('Website is slow or taking too long to load'),
      description: t('The website is loading slowly or timing out'),
      solutions: [
        t('Check your internet connection speed'),
        t('Close other tabs and applications'),
        t('Clear browser cache and cookies'),
        t('Try using a different browser'),
        t('Disable browser extensions'),
        t('Check if your device has sufficient RAM')
      ],
      severity: 'medium',
      popular: false
    },
    {
      id: 5,
      category: 'browser',
      title: t('Browser compatibility issues'),
      description: t('Website features not working properly in your browser'),
      solutions: [
        t('Update your browser to the latest version'),
        t('Enable JavaScript in your browser settings'),
        t('Allow cookies and popups for our website'),
        t('Try using a different browser'),
        t('Clear browser cache and cookies'),
        t('Disable browser extensions temporarily')
      ],
      severity: 'medium',
      popular: false
    },
    {
      id: 6,
      category: 'network',
      title: t('Connection timeout or network errors'),
      description: t('Getting connection timeout or network error messages'),
      solutions: [
        t('Check your internet connection'),
        t('Try switching between WiFi and mobile data'),
        t('Restart your router/modem'),
        t('Check if other websites are working'),
        t('Try accessing the website later'),
        t('Contact your internet service provider')
      ],
      severity: 'high',
      popular: false
    },
    {
      id: 7,
      category: 'website',
      title: t('Login issues or authentication problems'),
      description: t('Unable to log in or getting authentication errors'),
      solutions: [
        t('Verify your email and password are correct'),
        t('Try resetting your password'),
        t('Clear browser cache and cookies'),
        t('Check if your account is locked or suspended'),
        t('Try logging in from a different device'),
        t('Contact support if the issue persists')
      ],
      severity: 'high',
      popular: true
    },
    {
      id: 8,
      category: 'mobile',
      title: t('Push notifications not working'),
      description: t('Not receiving push notifications from the mobile app'),
      solutions: [
        t('Check notification permissions in app settings'),
        t('Enable notifications in device settings'),
        t('Restart the mobile app'),
        t('Update the app to the latest version'),
        t('Check if Do Not Disturb mode is enabled'),
        t('Reinstall the app if necessary')
      ],
      severity: 'low',
      popular: false
    },
    {
      id: 9,
      category: 'performance',
      title: t('Seat selection not loading or freezing'),
      description: t('The seat selection page is not loading or freezing'),
      solutions: [
        t('Refresh the page and try again'),
        t('Clear browser cache and cookies'),
        t('Try using a different browser'),
        t('Check your internet connection'),
        t('Disable browser extensions'),
        t('Try selecting seats on a different device')
      ],
      severity: 'medium',
      popular: false
    },
    {
      id: 10,
      category: 'website',
      title: t('Error messages or system errors'),
      description: t('Getting error messages or system error notifications'),
      solutions: [
        t('Take a screenshot of the error message'),
        t('Note down the exact error message and time'),
        t('Try refreshing the page'),
        t('Clear browser cache and cookies'),
        t('Try using a different browser'),
        t('Contact technical support with error details')
      ],
      severity: 'high',
      popular: false
    }
  ];

  const systemRequirements = [
    {
      platform: t('Web Browser'),
      requirements: [
        t('Chrome 90+ or Firefox 88+ or Safari 14+ or Edge 90+'),
        t('JavaScript enabled'),
        t('Cookies enabled'),
        t('Minimum 4GB RAM'),
        t('Stable internet connection (5 Mbps recommended)')
      ]
    },
    {
      platform: t('Mobile App - iOS'),
      requirements: [
        t('iOS 13.0 or later'),
        t('iPhone 6s or later'),
        t('Minimum 2GB RAM'),
        t('100MB free storage space'),
        t('Internet connection (WiFi or 4G/5G)')
      ]
    },
    {
      platform: t('Mobile App - Android'),
      requirements: [
        t('Android 7.0 (API level 24) or later'),
        t('Minimum 2GB RAM'),
        t('100MB free storage space'),
        t('Internet connection (WiFi or 4G/5G)'),
        t('Google Play Services')
      ]
    }
  ];

  const contactMethods = [
    {
      title: t('Phone Support'),
      description: t('Call our technical support team'),
      contact: '+84 1900 1234',
      available: t('24/7 Available'),
      responseTime: t('Immediate'),
      color: '#10b981'
    },
    {
      title: t('Email Support'),
      description: t('Send detailed technical issues via email'),
      contact: 'tech-support@galaxystudio.com',
      available: t('24/7 Available'),
      responseTime: t('Within 2 hours'),
      color: '#3b82f6'
    },
    {
      title: t('Live Chat'),
      description: t('Chat with our technical team in real-time'),
      contact: t('Click the chat button'),
      available: t('9 AM - 10 PM'),
      responseTime: t('Immediate'),
      color: '#8b5cf6'
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

  const filteredIssues = technicalIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.solutions.some(solution => solution.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularIssues = technicalIssues.filter(issue => issue.popular);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'high': return t('High Priority');
      case 'medium': return t('Medium Priority');
      case 'low': return t('Low Priority');
      default: return t('Unknown');
    }
  };

  return (
    <div className="technical-support-page">
      <div className="technical-support-container">
        {/* Header */}
        <div className="technical-support-header">
          <div className="breadcrumb">
            <Link to="/" className="breadcrumb-link">
                <ArrowLeft size={16} />
              {t('Back to Home')}
            </Link>
          </div>
          <h1 className="technical-support-title">{t('Technical Support')}</h1>
          <p className="technical-support-subtitle">
            {t('Get help with technical issues and system problems')}
          </p>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
                <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder={t('Search technical issues...')}
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

        {/* Popular Issues */}
        {selectedCategory === 'all' && (
          <div className="popular-section">
            <h2 className="section-title">{t('Common Technical Issues')}</h2>
            <div className="issues-list">
              {popularIssues.map((issue) => (
                <div key={issue.id} className="issue-card popular">
                  <div className="issue-header">
                    <div className="issue-info">
                      <h3 className="issue-title">{issue.title}</h3>
                      <p className="issue-description">{issue.description}</p>
                      <div className="issue-meta">
                        <span 
                          className="severity-badge"
                          style={{ backgroundColor: getSeverityColor(issue.severity) }}
                        >
                          {getSeverityText(issue.severity)}
                        </span>
                        <span className="popular-badge">{t('Common')}</span>
                      </div>
                    </div>
                    <button
                      className="expand-btn"
                      onClick={() => toggleExpanded(issue.id)}
                    >
                      {expandedItems.has(issue.id)  ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                  {expandedItems.has(issue.id) && (
                    <div className="issue-solutions">
                      <h4>{t('Solutions:')}</h4>
                      <ol className="solutions-list">
                        {issue.solutions.map((solution, index) => (
                          <li key={index} className="solution-item">
                            {solution}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Issues */}
        <div className="issues-section">
          <h2 className="section-title">
            {selectedCategory === 'all' 
              ? t('All Technical Issues') 
              : categories.find(cat => cat.id === selectedCategory)?.name
            }
            {searchQuery && ` - ${t('Search Results')}`}
          </h2>
          <div className="issues-list">
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => (
                <div key={issue.id} className="issue-card">
                  <div className="issue-header">
                    <div className="issue-info">
                      <h3 className="issue-title">{issue.title}</h3>
                      <p className="issue-description">{issue.description}</p>
                      <div className="issue-meta">
                        <span 
                          className="severity-badge"
                          style={{ backgroundColor: getSeverityColor(issue.severity) }}
                        >
                          {getSeverityText(issue.severity)}
                        </span>
                        {issue.popular && (
                          <span className="popular-tag">{t('Common')}</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="expand-btn"
                      onClick={() => toggleExpanded(issue.id)}
                    >
                      {expandedItems.has(issue.id)  ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                  {expandedItems.has(issue.id) && (
                    <div className="issue-solutions">
                      <h4>{t('Solutions:')}</h4>
                      <ol className="solutions-list">
                        {issue.solutions.map((solution, index) => (
                          <li key={index} className="solution-item">
                            {solution}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-results">
                <AlertCircle size={48} className="no-results-icon" />
                <h3>{t('No issues found')}</h3>
                <p>{t('Try adjusting your search terms or browse different categories')}</p>
              </div>
            )}
          </div>
        </div>

        {/* System Requirements */}
        <div className="requirements-section">
          <h2 className="section-title">{t('System Requirements')}</h2>
          <div className="requirements-grid">
            {systemRequirements.map((req, index) => (
              <div key={index} className="requirement-card">
                <h3 className="requirement-title">{req.platform}</h3>
                <ul className="requirement-list">
                  {req.requirements.map((requirement, reqIndex) => (
                    <li key={reqIndex} className="requirement-item">
                <CheckCircle size={16} className="check-icon" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="contact-section">
          <h2 className="section-title">{t('Need More Help?')}</h2>
          <p className="contact-subtitle">
            {t('Our technical support team is available 24/7 to help you resolve any issues')}
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
                  <div className="contact-meta">
                    <span className="contact-availability">{method.available}</span>
                    <span className="contact-response">{method.responseTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="resources-section">
          <h2 className="section-title">{t('Additional Resources')}</h2>
          <div className="resources-grid">
            <Link to="/help" className="resource-card">
                <HelpCircle size={24} />
              <h3>{t('Help Center')}</h3>
              <p>{t('Comprehensive help articles and guides')}</p>
            </Link>
            <Link to="/faq" className="resource-card">
                <Settings size={24} />
              <h3>{t('FAQ')}</h3>
              <p>{t('Frequently asked questions and answers')}</p>
            </Link>
            <Link to="/contact" className="resource-card">
                <Phone size={24} />
              <h3>{t('Contact Us')}</h3>
              <p>{t('Get in touch with our support team')}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSupportPage;
