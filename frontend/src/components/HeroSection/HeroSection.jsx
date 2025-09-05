import React from 'react';
import { Play } from 'lucide-react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Chào mừng đến với HAK cinema</h1>
            <p className="hero-subtitle">Nền tảng đặt vé xem phim hàng đầu Việt Nam</p>
            <div className="hero-actions">
              <button className="hero-btn primary">
                <Play size={20} />
                Khám phá ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
