import { Link } from 'react-router-dom';
import './Footer.css';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="main-footer">
      <div className="footer-content">
        {/* Company Info Section */}
        <div className="footer-section company-section">
          <div className="company-logo">
            <img className="company-logo-img" src="https://cdn.moveek.com/bundles/ornweb/img/favicon-large.png" alt="Galaxy Studio" />
          </div>
          
          <div className="company-info">
            <h3 className="company-name">HAK Studio Cinema</h3>
            <p className="company-description">
              {t('Leading cinema chain providing premium movie experiences with state-of-the-art technology and comfortable seating.')}
            </p>
            
            <div className="company-details">
              <p><strong>{t('Issued by:')}</strong> Department of Planning and Investment of Ho Chi Minh City</p>
              <p><strong>{t('First registration date:')}</strong> 01/09/2025</p>
              <p><strong>{t('Address')}:</strong> 146A Nguyen Van Qua Street, Dong Hung Thuan Ward, District 12, Ho Chi Minh City</p>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="footer-section quick-links-section">
          <h4 className="title-section">{t('Quick Links')}</h4>
          <ul className="footer-links-list">
            <li><Link to="/movies">{t('Movies')}</Link></li>
            <li><Link to="/cinemas">{t('Cinemas')}</Link></li>
            <li><Link to="/showtimes">{t('Showtimes')}</Link></li>
            <li><Link to="/news">{t('News')}</Link></li>
            <li><Link to="/membership">{t('Membership')}</Link></li>
            <li><Link to="/rewards">{t('Rewards')}</Link></li>
            <li><Link to="/gift-cards">{t('Gift Cards')}</Link></li>
            <li><Link to="/about">{t('About Us')}</Link></li>
          </ul>
        </div>

        {/* Customer Service Section */}
        <div className="footer-section customer-service-section">
          <h4 className="title-section">{t('Customer Service')}</h4>
          <ul className="footer-links-list">
            <li><Link to="/help">{t('Help Center')}</Link></li>
            <li><Link to="/faq">{t('FAQ')}</Link></li>
            <li><Link to="/contact">{t('Contact Us')}</Link></li>
            <li><Link to="/support">{t('Technical Support')}</Link></li>
            <li><Link to="/feedback">{t('Feedback')}</Link></li>
            <li><Link to="/complaints">{t('Complaints')}</Link></li>
            <li><Link to="/refund-policy">{t('Refund Policy')}</Link></li>
            <li><Link to="/terms">{t('Terms of Service')}</Link></li>
          </ul>
        </div>

        {/* Contact & Social Section */}
        <div className="footer-section contact-section">
          <h4 className="title-section">{t('Contact & Follow Us')}</h4>
          
          <div className="contact-info">
            <div className="contact-item">
              <div>
                <p className="contact-label">{t('Hotline')}</p>
                <p className="contact-value">093 208 2976</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div>
                <p className="contact-label">{t('Email')}</p>
                <p className="contact-value">HAKCINEVERSE@galaxystudio.vn</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div>
                <p className="contact-label">{t('Business Hours')}</p>
                <p className="contact-value">{t('8:00 AM - 12:00 PM')}</p>
              </div>
            </div>

            <div className="social-links">
              <h5 className="social-title">{t('Follow Us')}</h5>
              <div className="social-icons">
              <a
                href="https://www.facebook.com/moveekvn"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon facebook"
              >
                <svg className="icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <a
                href="https://www.instagram.com/cineversecinemasvietnam"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon instagram"
              >
                <svg className="icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a
                href="https://www.youtube.com/cineversevietnam"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon youtube"
              >
                <svg className="icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              <a
                href="https://www.tiktok.com/@cineverse_vn"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon tiktok"
              >
                <svg className="icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              </div>
            </div>
            </div>
          </div>
        </div>

      {/* Partners Section */}
      <div className="partners-section">
        <h4 className="partners-title">{t('Our Partners')}</h4>
        
        <div className="partners-grid">
          <div className="partners-row">
            <a href="https://betacinemas.vn/home.htm" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/beta-cineplex-v2.jpg" alt="Beta Cinemas" />
              </a>
            <a href="https://www.megagscinemas.vn/" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/mega-gs-cinemas.png" alt="Mega GS" />
              </a>
            <a href="https://cinestar.com.vn/" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/cinestar.png" alt="Cinestar" />
              </a>
            <a href="https://ddcinema.vn/" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/dcine.png" alt="DDC Dongda Cinema" />
              </a>
            <a href="https://ddcinema.vn/" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/dong-da-cinemas.png" alt="Dongda Cinema" />
              </a>
            <a href="https://www.online.gov.vn/" target="_blank" rel="noopener noreferrer" className="partner-logo certified">
              <div className="certified-badge">
                  <img src="https://cdn.moveek.com/bundles/ornweb/img/20150827110756-dathongbao.png" alt="Đã thông báo Bộ Công Thương" />
                </div>
              </a>
            </div>
            
          <div className="partners-row">
            <a href="https://cinemaxvn.com/" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/cinemax.png" alt="Cinemas" />
              </a>
            <a href="https://touchcinema.com/" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/touch-cinemas.png" alt="Touch Cinema" />
              </a>
            <a href="https://payoo.vn/" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/payoo.jpg" alt="Payoo" />
              </a>
            <a href="https://www.momo.vn/" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/momo.png" alt="MoMo" />
              </a>
            <a href="https://zalopay.vn/" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/zalopay-icon.png" alt="ZaloPay" />
              </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-links">
            <Link to="/privacy">{t('Privacy Policy')}</Link>
            <span> - </span>
            <Link to="/terms">{t('Terms of Use')}</Link>
            <span> - </span>
            <Link to="/cookies">{t('Cookie Policy')}</Link>
            <span> - </span>
            <Link to="/accessibility">{t('Accessibility')}</Link>
          </div>
          <div className="copyright">
            <p>&copy; 2026 Huỳnh Anh Khoa. {t('All rights reserved.')} | <span className="version">v8.1</span></p>
            </div>
          </div>
        </div>
    </footer>
  );
};

export default Footer;
