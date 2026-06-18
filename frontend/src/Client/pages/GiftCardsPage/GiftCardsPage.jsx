import React from 'react';
import { useTranslation } from 'react-i18next';
import './GiftCardsPage.css';

const GiftCardsPage = () => {
  const { t } = useTranslation();

  const giftCards = [
    {
      id: 1,
      name: "Galaxy Studio Gift Card - 100K",
      price: "100,000 VNĐ",
      image: "/images/giftcard100k.png",
      description: "Perfect for a movie night with friends or family"
    },
    {
      id: 2,
      name: "Galaxy Studio Gift Card - 200K",
      price: "200,000 VNĐ",
      image: "/images/giftcard200k.png",
      description: "Great for special occasions and celebrations"
    },
    {
      id: 3,
      name: "Galaxy Studio Gift Card - 500K",
      price: "500,000 VNĐ",
      image: "https://via.placeholder.com/300x200/1e293b/dc2626?text=Gift+Card+500K",
      description: "Premium experience for movie enthusiasts"
    },
    {
      id: 4,
      name: "Galaxy Studio Gift Card - 1M",
      price: "1,000,000 VNĐ",
      image: "https://via.placeholder.com/300x200/1e293b/dc2626?text=Gift+Card+1M",
      description: "Ultimate gift for cinema lovers"
    }
  ];

  return (
    <div className="gc-page">
      <div className="gc-container">
        {/* Hero Section */}
        <div className="gc-hero">
          <h1 className="gc-title">{t('Gift Cards')}</h1>
          <p className="gc-subtitle">
            {t('Give the gift of entertainment with Galaxy Studio Cinema gift cards. Perfect for any occasion!')}
          </p>
        </div>

        {/* Features Section */}
        <div className="gc-features">
          <div className="gc-feature-card">
            <h3>{t('Perfect Gift')}</h3>
            <p>{t('Ideal for birthdays, holidays, and special occasions')}</p>
          </div>
          <div className="gc-feature-card">
            <h3>{t('Easy to Use')}</h3>
            <p>{t('Simply present at any Galaxy Studio location')}</p>
          </div>
          <div className="gc-feature-card">
            <h3>{t('No Expiration')}</h3>
            <p>{t('Gift cards never expire, use anytime')}</p>
          </div>
          <div className="gc-feature-card">
            <h3>{t('Any Movie')}</h3>
            <p>{t('Valid for all movies and showtimes')}</p>
          </div>
        </div>

        {/* Gift Cards Grid */}
        <div className="gc-grid">
          <h2 className="gc-section-title">{t('Available Gift Cards')}</h2>
          <div className="gc-cards-grid">
            {giftCards.map((card) => (
              <div key={card.id} className="gc-card">
                <div className="gc-card-image">
                  <img src={card.image} alt={card.name} />
                  <div className="gc-card-overlay">
                    <button className="gc-buy-button">{t('Buy Now')}</button>
                  </div>
                </div>
                <div className="gc-card-content">
                  <h3 className="gc-card-name">{card.name}</h3>
                  <p className="gc-card-price">{card.price}</p>
                  <p className="gc-card-description">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How to Use Section */}
        <div className="gc-how-to-use">
          <h2 className="gc-section-title">{t('How to Use Gift Cards')}</h2>
          <div className="gc-steps">
            <div className="gc-step">
              <div className="gc-step-number">1</div>
              <div className="gc-step-content">
                <h3>{t('Purchase')}</h3>
                <p>{t('Buy a gift card online or at any Galaxy Studio location')}</p>
              </div>
            </div>
            <div className="gc-step">
              <div className="gc-step-number">2</div>
              <div className="gc-step-content">
                <h3>{t('Present')}</h3>
                <p>{t('Give the gift card to your loved one')}</p>
              </div>
            </div>
            <div className="gc-step">
              <div className="gc-step-number">3</div>
              <div className="gc-step-content">
                <h3>{t('Enjoy')}</h3>
                <p>{t('Use it to purchase tickets, snacks, or drinks')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="gc-terms-section">
          <h2 className="gc-section-title">{t('Terms & Conditions')}</h2>
          <div className="gc-terms-content">
            <ul>
              <li>{t('Gift cards are valid at all Galaxy Studio Cinema locations')}</li>
              <li>{t('Gift cards cannot be redeemed for cash')}</li>
              <li>{t('Gift cards do not expire')}</li>
              <li>{t('Lost or stolen gift cards cannot be replaced')}</li>
              <li>{t('Gift cards can be used for tickets, concessions, and merchandise')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardsPage;
