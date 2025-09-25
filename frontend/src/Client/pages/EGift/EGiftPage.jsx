import React from 'react';

const EGiftPage = () => {
  return (
    <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>CGV eGift</h1>
      <p style={{ color: '#4b5563' }}>Tặng quà xem phim nhanh chóng qua thẻ quà tặng điện tử.</p>

      <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>Lợi ích</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
          <li>Gửi tặng tức thì qua email/SMS.</li>
          <li>Tùy chọn mệnh giá linh hoạt.</li>
          <li>Áp dụng tại toàn bộ hệ thống CGV.</li>
        </ul>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>Cách sử dụng</h2>
        <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
          <li>Chọn mệnh giá eGift và người nhận.</li>
          <li>Thanh toán online.</li>
          <li>Người nhận sử dụng mã eGift khi đặt vé/mua combo.</li>
        </ol>
      </div>
    </div>
  );
};

export default EGiftPage;


