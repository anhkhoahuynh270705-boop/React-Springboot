import React from 'react';
import { getCurrentUserSync } from '../../../services/userService';
import { getMemberOverview, getMemberTransactions, getMemberNews } from '../../../services/memberService';

const MembershipPage = () => {
  const user = getCurrentUserSync();
  const [overview, setOverview] = React.useState({ name: user?.fullName || user?.username || 'Thành viên CGV', tier: user?.tier || 'Member', points: user?.rewardPoints ?? 0, promotions: [] });
  const [transactions, setTransactions] = React.useState([]);
  const [news, setNews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const [ov, tx, nw] = await Promise.all([
          getMemberOverview().catch(() => null),
          getMemberTransactions().catch(() => []),
          getMemberNews().catch(() => [])
        ]);
        if (ov) setOverview(ov);
        setTransactions(tx || []);
        setNews(nw || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container" style={{ maxWidth: '960px', margin: '0 auto', padding: '1.5rem' }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Thành viên CGV</h1>
      <p style={{ color: '#4b5563' }}>Tích điểm khi mua vé/combos, lên hạng để nhận ưu đãi độc quyền.</p>

      {/* 1. Thông tin tài khoản thành viên */}
      <section style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>1. Thông tin tài khoản thành viên</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.75rem' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem' }}>
            <strong>Tên</strong>
            <div>{overview.name}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem' }}>
            <strong>Hạng thẻ</strong>
            <div>{overview.tier}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem' }}>
            <strong>Điểm tích lũy</strong>
            <div>{Number(overview.points || 0).toLocaleString('vi-VN')}</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.75rem' }}>
            <strong>Khuyến mãi theo hạng</strong>
            <div>{overview.promotions?.[0] || `Ưu đãi giảm giá và combo theo hạng ${overview.tier}`}</div>
          </div>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <strong>Lịch sử giao dịch</strong>
          {loading ? (
            <div>Đang tải...</div>
          ) : (
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
              {transactions.length === 0 ? (
                <li>Chưa có giao dịch</li>
              ) : (
                transactions.slice(0, 5).map((tx, idx) => (
                  <li key={idx}>{tx.type} - {Number(tx.amount || 0).toLocaleString('vi-VN')}đ - {new Date(tx.time).toLocaleString('vi-VN')}</li>
                ))
              )}
            </ul>
          )}
        </div>
      </section>

      {/* 2. Hệ thống hạng thẻ */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>2. Hệ thống hạng thẻ</h2>
        <p style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}>Mô tả và điều kiện đạt hạng trong năm:</p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
          <li><strong>Member</strong>: tổng chi tiêu &lt; 1.000.000đ/năm hoặc &lt; 12 vé; ưu đãi cơ bản.</li>
          <li><strong>VIP</strong>: 1.000.000–3.000.000đ/năm hoặc 12–30 vé; ưu đãi tăng 1.2x, combo giảm giá.</li>
          <li><strong>VVIP</strong>: &gt; 3.000.000đ/năm hoặc &gt; 30 vé; ưu đãi 1.5x, suất chiếu đặc biệt, ưu tiên sự kiện.</li>
        </ul>
      </section>

      {/* 3. Ưu đãi và khuyến mãi dành riêng cho thành viên */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>3. Ưu đãi và khuyến mãi dành riêng</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
          <li>Voucher/coupon giảm giá vé theo hạng.</li>
          <li>Combo bắp nước ưu đãi dành riêng cho hội viên.</li>
          <li>Chương trình Members Day, Sinh nhật thành viên.</li>
          <li>Ưu đãi đối tác (ngân hàng, ví điện tử...).</li>
        </ul>
      </section>

      {/* 4. Chính sách tích & sử dụng điểm */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>4. Chính sách tích & sử dụng điểm</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
          <li>Tích 5–10% giá trị hóa đơn vào điểm thưởng.</li>
          <li>Điểm dùng để đổi vé, combo, voucher.</li>
          <li>Điểm có thời hạn sử dụng; vui lòng theo dõi trong tài khoản.</li>
        </ul>
      </section>

      {/* 5. Tin tức & sự kiện cho thành viên */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem', marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>5. Tin tức & sự kiện</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', lineHeight: 1.8 }}>
          <li>Sự kiện dành riêng cho hội viên: sneak show, suất chiếu sớm.</li>
          <li>Hoạt động tri ân thành viên định kỳ.</li>
        </ul>
      </section>
    </div>
  );
};

export default MembershipPage;


