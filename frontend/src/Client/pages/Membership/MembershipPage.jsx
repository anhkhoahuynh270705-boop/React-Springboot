import React from 'react';
import { getCurrentUserSync } from '../../../services/userService';
import { getMemberOverview, getMemberTransactions } from '../../../services/memberService';
import { useTranslation } from 'react-i18next';

const MembershipPage = () => {
  const { t } = useTranslation();
  const user = getCurrentUserSync();
  const [overview, setOverview] = React.useState({ name: user?.fullName || user?.username || 'Thành viên CINEVERSE', tier: user?.tier || 'Member', points: user?.rewardPoints ?? 0, promotions: [] });
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const [ov, tx] = await Promise.all([
          getMemberOverview().catch(() => null),
          getMemberTransactions().catch(() => [])
        ]);
        if (ov) setOverview(ov);
        setTransactions(tx || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{t('CGVMember')}</h1>
      <p style={{ color: '#4b5563' }}>{t('Earn points when buying tickets/combos, level up to unlock exclusive benefits.')}</p>

      {/* info */}
      <section style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>1. {t('Member account information')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem' }}>
            <strong>{t('Name')}</strong>
            <div>{overview.name}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem' }}>
            <strong>{t('Membership tier')}</strong>
            <div>{overview.tier}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem' }}>
            <strong>{t('Accumulated points')}</strong>
            <div>{Number(overview.points || 0).toLocaleString('vi-VN')}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem' }}>
            <strong>{t('Tier-based promotions')}</strong>
          <div>  {overview.promotions?.[0] || t('Discounts and combos for {{tier}} tier', { tier: overview.tier })}</div>
        </div>
      </div>

        <div style={{ marginTop: '0.75rem' }}>
          <strong>{t('Transaction history')}</strong>
          {loading ? (
            <div>{t('Loading...')}</div>
          ) : (
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
              {transactions.length === 0 ? (
                <li>{t('No transactions yet')}</li>
              ) : (
                transactions.slice(0, 5).map((tx, idx) => (
                  <li key={idx}>{tx.type} - {Number(tx.amount || 0).toLocaleString('vi-VN')}đ - {new Date(tx.time).toLocaleString('vi-VN')}</li>
                ))
              )}
            </ul>
          )}
        </div>
      </section>

      {/* tier system */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>2. {t('Membership tier system')}</h2>
        <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}>{t('Description and conditions to reach tier within the year:')}</p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
          <li><strong>Member</strong>: {t('Total spending < 1,000,000đ/year or < 12 tickets; basic benefits.')}</li>
          <li><strong>VIP</strong>: {t('1,000,000–3,000,000đ/year or 12–30 tickets; 1.2x benefits, discounted combos.')}</li>
          <li><strong>VVIP</strong>: {t('> 3,000,000đ/year or > 30 tickets; 1.5x benefits, special screenings, event priority.')}</li>
        </ul>
      </section>

      {/* benefits */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>3. {t('Exclusive offers and promotions')}</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
          <li>Voucher/coupon {t('ticket discounts by tier.')}</li>
          <li>Combo {t('exclusive popcorn & drink deals for members.')}</li>
          <li>{t('Members Day program, birthday perks.')}</li>
          <li>{t('Partner offers (banks, e-wallets,...')}</li>
        </ul>
      </section>

      {/* points */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>4. {t('Point accumulation & usage policy')}</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
          <li>{t('Earn 5–10% of bill value as reward points.')}</li>
          <li>{t('Points can be redeemed for tickets, combos, vouchers.')}</li>
          <li>{t('Points have expiration dates; please check your account.')}</li>
        </ul>
      </section>

      {/* news */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>{t('5. News & Events')}</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
          <li>{t('Member-only events: sneak previews, early screenings.')}</li>
          <li>{t('Regular member appreciation activities.')}</li>
        </ul>
      </section>
    </div>
  );
};

export default MembershipPage;


