import React from 'react';
import './RewardsPage.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function RewardsPage() {
  const { t } = useTranslation();
  return (
    <div className="rewards-page">
      <section className="rewards-hero">
        <div className="rewards-hero-content">
          <h1 className="rewards-title">{t('HAK Rewards')}</h1>
          <p className="rewards-subtitle">{t('Earn points when buying tickets/combos, level up to unlock exclusive benefits.')}</p>
          <div className="rewards-cta-group">
            <Link to="/membership" className="btn btn-primary">{t('Join for free')}</Link>
            <Link to="/help" className="btn btn-outline">{t('Learn more')}</Link>
          </div>
        </div>
      </section>

      <section className="rewards-how-it-works">
        <h2>{t('How it works')}</h2>
        <div className="steps">
          <div className="step">
            <div className="step-icon">①</div>
            <h3>{t('Register')}</h3>
            <p>{t('Create a free HAK account to start earning points.')}</p>
          </div>
          <div className="step">
            <div className="step-icon">②</div>
            <h3>{t('Buy tickets/combos')}</h3>
            <p>{t('Each 10,000VND spent = 1 point, applies to both tickets and snacks.')}</p>
          </div>
          <div className="step">
            <div className="step-icon">③</div>
            <h3>{t('Redeem rewards')}</h3>
            <p>{t('Redeem points for movie tickets, snack combos, partner vouchers, and other exclusive benefits.')}</p>
          </div>
        </div>
      </section>

      <section className="rewards-tiers">
        <h2>{t('Membership tiers')}</h2>
        <div className="tiers-grid">
          <div className="tier-card tier-bronze">
            <h3>{t('Bronze')}</h3>
            <p>{t('Automatically awarded upon registration.')}</p>
            <ul>
              <li>{t('+5% reward points')}</li>
              <li>{t('Birthday benefits')}</li>
              <li>{t('Priority support')}</li>
            </ul>
          </div>
          <div className="tier-card tier-silver">
            <h3>{t('Silver')}</h3>
            <p>{t('From 1,500 points/year.')}</p>
            <ul>
              <li>{t('+8% reward points')}</li>
              <li>{t('Free double seat selection each month')}</li>
              <li>{t('Regular combo offers')}</li>
            </ul>
          </div>
          <div className="tier-card tier-gold">
            <h3>{t('Gold')}</h3>
            <p>{t('From 5,000 points/year.')}</p>
            <ul>
              <li>{t('+12% reward points')}</li>
              <li>{t('VIP seat discount')}</li>
              <li>{t('Early screening access')}</li>
            </ul>
          </div>
          <div className="tier-card tier-diamond">
            <h3>{t('Diamond')}</h3>
            <p>{t('By invitation.')}</p>
            <ul>
              <li>{t('+15% reward points')}</li>
              <li>{t('Private waiting area')}</li>
              <li>{t('Exclusive gift')}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rewards-benefits">
        <h2>{t('Highlighted benefits')}</h2>
        <div className="benefits-grid">
          <div className="benefit">
            <h4>{t('Free ticket exchange')}</h4>
            <p>{t('Use points to exchange 2D/3D tickets, available daily.')}</p>
          </div>
          <div className="benefit">
            <h4>{t('Savings combo')}</h4>
            <p>{t('30% discount on snack combos for Silver members.')}</p>
          </div>
          <div className="benefit">
            <h4>{t('Partner voucher')}</h4>
            <p>{t('Exchange food vouchers, shopping, transportation from partners.')}</p>
          </div>
          <div className="benefit">
            <h4>{t('Birthday gift')}</h4>
            <p>{t('Receive a gift and special offers in your birthday month.')}</p>
          </div>
        </div>
      </section>

      <section className="rewards-faq">
        <h2>{t('Frequently asked questions')}</h2>
        <div className="faq-list">
          <details>
            <summary>{t('Do points expire?')}</summary>
            <p>{t('Points are valid for 12 months from the date of issuance. Points will be automatically deducted when they expire.')}</p>
          </details>
          <details>
            <summary>{t('Can I transfer points to someone else?')}</summary>
            <p>{t('Currently not supported. You can exchange vouchers to gift.')}</p>
          </details>
          <details>
            <summary>{t('Does online booking count towards points?')}</summary>
            <p>{t('Yes. As long as you login before payment, the system will automatically add points.')}</p>
          </details>
        </div>
      </section>

      <section className="rewards-cta-bottom">
        <div className="cta-card">
          <div className="cta-text">
            <h3>{t('Start earning points today')}</h3>
            <p>{t('Join HAK Rewards to miss out on hundreds of attractive offers.')}</p>
          </div>
          <Link to="/membership" className="btn btn-primary">{t('Join now')}</Link>
        </div>
      </section>
    </div>
  );
}

export default RewardsPage;


