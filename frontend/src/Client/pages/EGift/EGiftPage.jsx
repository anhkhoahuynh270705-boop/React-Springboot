import React from 'react';
import { useTranslation } from 'react-i18next';

const EGiftPage = () => {
  const { t } = useTranslation();
  return (
    <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>CINEVERSE eGift</h1>
      <p style={{ color: '#4b5563' }}>{t('GiveTheGift')}.</p>

      <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>{t('Benefit')}</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
          <li>{t('Sendgift')}.</li>
          <li>{t('Options')}.</li> 
          <li>{t('ApplyAll')}.</li>
        </ul>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>{t('Use')}</h2>
        <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
          <li>{t('SelectEGift')}.</li>
          <li>{t('OnlinePayment')}.</li>
          <li>{t('eGiftCode')}.</li>
        </ol>
      </div>
    </div>
  );
};

export default EGiftPage;


