import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className={`main-footer`}> 
      <div className={`footer-content`}>
        <div className={`company-section`}>
          <div className={`company-logo`}>
            <img className={`company-logo-img`} src="https://cdn.moveek.com/bundles/ornweb/img/favicon-large.png" alt="HAK" />
          </div>
          
          <div className={`company-info`}>
            <h3 className={`company-name`}>CÔNG TY TNHH HAK</h3>
            
            <div className={`company-details`}>
              <p><strong>SỐ ĐKKD:</strong> 0315367026</p>
              <p><strong>Nơi cấp:</strong> Sở kế hoạch và đầu tư Tp. Hồ Chí Minh</p>
              <p><strong>Đăng ký lần đầu ngày:</strong> 01/09/2025</p>
              <p><strong>Địa chỉ:</strong> 146A Nguyễn Văn Quá, P.Đông Hưng Thuận, Q.12, Tp. Hồ Chí Minh</p>
            </div>
            
            <div className={`footer-links`}>
              <Link to="/about">Về chúng tôi</Link>
              <span> - </span>
              <Link to="/privacy">Chính sách bảo mật</Link>
              <span> - </span>
              <Link to="/support">Hỗ trợ</Link>
              <span> - </span>
              <Link to="/contact">Liên hệ</Link>
              <span> - </span>
              <span className={`version`}>v8.1</span>
            </div>
          </div>
        </div>

        {/* Right Section - Partners */}
        <div className={`partners-section`}>
          <h3 className={`partners-title`}>ĐỐI TÁC</h3>
          
          <div className={`partners-grid`}>
            <div className={`partners-row`}>
              <a href="https://betacineplex.vn/" target="_blank" rel="noopener noreferrer" className={`partner-logo`}>
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/beta-cineplex-v2.jpg" alt="Beta Cinemas" />
              </a>
              <a href="https://www.megagscinemas.vn/" target="_blank" rel="noopener noreferrer" className={`partner-logo`}>
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/mega-gs-cinemas.png" alt="Mega GS" />
              </a>
              <a href="https://cinestar.com.vn/" target="_blank" rel="noopener noreferrer" className={`partner-logo`}>
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/cinestar.png" alt="Cinestar" />
              </a>
              <a href="https://ddcinema.vn/" target="_blank" rel="noopener noreferrer" className={`partner-logo`}>
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/dcine.png" alt="DDC Dongda Cinema" />
              </a>
              <a href="https://ddcinema.vn/" target="_blank" rel="noopener noreferrer" className={`partner-logo`}>
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/dong-da-cinemas.png" alt="Dongda Cinema" />
              </a>
              <a href="https://www.online.gov.vn/" target="_blank" rel="noopener noreferrer" className={`partner-logo certified`}>
                <div className={`certified-badge`}>
                  <img src="https://cdn.moveek.com/bundles/ornweb/img/20150827110756-dathongbao.png" alt="Đã thông báo Bộ Công Thương" />
                </div>
              </a>
            </div>
            
            {/* Second Row */}
            <div className={`partners-row`}>
              <a href="https://cinemaxvn.com/" target="_blank" rel="noopener noreferrer" className={`partner-logo`}>
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/cinemax.png" alt="Cinemas" />
              </a>
              <a href="https://touchcinema.com/" target="_blank" rel="noopener noreferrer" className={`partner-logo`}>
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/touch-cinemas.png" alt="Touch Cinema" />
              </a>
              <a href="https://payoo.vn/" target="_blank" rel="noopener noreferrer" className={`partner-logo`}>
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/payoo.jpg" alt="Payoo" />
              </a>
              <a href="https://www.momo.vn/" target="_blank" rel="noopener noreferrer" className={`partner-logo`}>
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/momo.png" alt="MoMo" />
              </a>
              <a href="https://zalopay.vn/" target="_blank" rel="noopener noreferrer" className={`partner-logo`}>
                <img src="https://cdn.moveek.com/bundles/ornweb/partners/zalopay-icon.png" alt="ZaloPay" />
              </a>
              
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
