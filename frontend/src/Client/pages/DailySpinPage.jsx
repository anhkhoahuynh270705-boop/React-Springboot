import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCoins,
  addCoins,
  getCatalog,
  redeemReward,
  getRedeemHistory
} from '../../services/rewardService';
import { hasCheckedInTodayAPI, checkInTodayAPI } from '../../services/checkInApiService';
import { getCurrentUserSync } from '../../services/userService';
import { useTranslation } from 'react-i18next';


const DailySpinPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = getCurrentUserSync();
  const userId = user?.id;

  const [checkedIn, setCheckedIn] = useState(false);
  const [coins, setCoins] = useState(() => getCoins(userId));
  const [catalog] = useState(() => getCatalog());
  const [redeemHistory, setRedeemHistory] = useState(() => getRedeemHistory(userId));
  const [message, setMessage] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);

  // Kiểm tra trạng thái check-in từ DB khi vào trang
  useEffect(() => {
    if (!userId) return;
    hasCheckedInTodayAPI().then(setCheckedIn);
    setCoins(getCoins(userId));
    setRedeemHistory(getRedeemHistory(userId));
  }, [userId]);

  const handleCheckIn = async () => {
    if (!userId) {
      alert(t('Please CheckIn'));
      navigate('/');
      return;
    }
    if (checkedIn || checkInLoading) return;

    setCheckInLoading(true);
    const result = await checkInTodayAPI();
    setCheckInLoading(false);

    if (result.error === 'already_checked_in') {
      setCheckedIn(true);
      setMessage(t('Attendance has been taken.'));
      return;
    }

    if (!result.success) {
      setMessage(t('CheckInFailed'));
      return;
    }

    // Check-in thành công - cộng coins vào localStorage
    setCheckedIn(true);
    const newCoins = addCoins(userId, result.coinsEarned);
    setCoins(newCoins);
    setMessage(t('CheckInSuccess'));
  };

  const handleRedeem = (rewardId) => {
    if (!userId) {
      alert(t('Please Redeem'));
      navigate('/');
      return;
    }
    const res = redeemReward(userId, rewardId);
    if (res.ok) {
      setCoins(res.coins);
      setRedeemHistory(getRedeemHistory(userId));
      setMessage(t('RedeemSuccess') + res.reward.label);
    } else if (res.reason === 'insufficient') {
      setMessage(t('InsufficientCoins'));
    } else {
      setMessage(t('RedeemFailed'));
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: 8 }}>{t('Coin')}</h1>
      <p style={{ marginTop: 0, color: '#666' }}>{t('Check in daily to earn coins and redeem rewards.')}</p>

      {message && (
        <div style={{ marginBottom: 12, padding: 10, background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: 8, color: '#0e7490' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 360px', minWidth: 320 }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>{t('Coin balance')}</div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>
                  {coins}
                  <span style={{ fontSize: 16, marginLeft: 6 }}>{t('coin')}</span>
                </div>
              </div>
              <button
                onClick={handleCheckIn}
                disabled={!userId || checkedIn || checkInLoading}
                style={{
                  padding: '10px 14px',
                  background: (!userId || checkedIn) ? '#9ca3af' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  cursor: (!userId || checkedIn || checkInLoading) ? 'not-allowed' : 'pointer',
                  fontWeight: 700
                }}
              >
                {checkInLoading
                  ? '...'
                  : checkedIn
                    ? t('Attendance has been taken.')
                    : t('Attendance check (+10 cents)')}
              </button>
            </div>
          </div>
        </div>

        <div style={{ flex: '2 1 480px', minWidth: 360 }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>{t('Redeem rewards')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {catalog.map(item => (
                <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>{item.label}</div>
                  <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>{item.coinCost} {t('coin')}</div>
                  <button
                    onClick={() => handleRedeem(item.id)}
                    disabled={coins < item.coinCost}
                    style={{
                      marginTop: 10,
                      padding: '8px 12px',
                      background: coins < item.coinCost ? '#9ca3af' : '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: coins < item.coinCost ? 'not-allowed' : 'pointer',
                      width: '100%',
                      fontWeight: 700
                    }}
                  >
                    {coins < item.coinCost ? t('Not enough coin') : t('reward exchange now')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 360px', minWidth: 320 }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>{t('Redemption history')}</h3>
            {redeemHistory.length === 0 ? (
              <p style={{ color: '#6b7280' }}>{t('No rewards have been redeemed yet.')}</p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {redeemHistory.map(h => (
                  <li key={h.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>{h.reward.label}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(h.date).toLocaleString('vi-VN')}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySpinPage;
