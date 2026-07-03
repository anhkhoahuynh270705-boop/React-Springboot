/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  TrendingUp, DollarSign, Ticket, Users, Film, Building2,
  RefreshCw, BarChart3, PieChart, Activity, Award, CreditCard
} from 'lucide-react';
import './PowerBIEmbed.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

const API = 'http://localhost:8080/api/analytics';

const fmt = (n) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);
const fmtNum = (n) => new Intl.NumberFormat('vi-VN').format(n || 0);

const CHART_COLORS = ['#f2c94c', '#60a5fa', '#34d399', '#f472b6', '#a78bfa', '#fb923c', '#38bdf8', '#4ade80'];
const GRAD_GOLD = 'rgba(242,201,76,0.18)';

export default function PowerBIEmbed() {
  const [dash, setDash] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, ticketsRes, usersRes, moviesRes, cinemasRes] = await Promise.all([
        fetch(`${API}/dashboard`).then(r => r.json()),
        fetch(`${API}/tickets`).then(r => r.json()),
        fetch(`${API}/users`).then(r => r.json()),
        fetch(`${API}/movies`).then(r => r.json()),
        fetch(`${API}/cinemas`).then(r => r.json()),
      ]);
      setDash(dashRes);
      setTickets(Array.isArray(ticketsRes) ? ticketsRes : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setMovies(Array.isArray(moviesRes) ? moviesRes : []);
      setCinemas(Array.isArray(cinemasRes) ? cinemasRes : []);
      setLastUpdated(new Date());
    } catch (e) {
      setError('Không thể kết nối tới server. Hãy đảm bảo Spring Boot đang chạy.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Derived data ── */
  // Revenue by movie (top 8)
  const revenueByMovie = Object.entries(dash?.revenueByMovie || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Revenue by payment method
  const revenueByMethod = Object.entries(dash?.revenueByPaymentMethod || {});

  // Ticket status breakdown
  const ticketStatusMap = dash?.ticketStatus || {};

  // Bookings by month from raw tickets
  const bookingsByMonth = (() => {
    const map = {};
    tickets.forEach(t => {
      if (!t.bookingTime) return;
      const d = new Date(t.bookingTime);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-12);
  })();

  // Revenue by month
  const revenueByMonth = (() => {
    const map = {};
    tickets.filter(t => t.paymentStatus?.toLowerCase() === 'paid' && t.status?.toLowerCase() !== 'cancelled')
      .forEach(t => {
        if (!t.bookingTime) return;
        const d = new Date(t.bookingTime);
        if (isNaN(d)) return;
        const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        map[key] = (map[key] || 0) + (t.price || 0);
      });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-12);
  })();

  // Users registered by month
  const usersByMonth = (() => {
    const map = {};
    users.forEach(u => {
      if (!u.createdAt) return;
      const d = new Date(u.createdAt);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-12);
  })();

  // Provider breakdown
  const providerMap = users.reduce((acc, u) => {
    const p = u.provider || 'local';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  // Cinema by city
  const cinemaByCity = cinemas.reduce((acc, c) => {
    const city = c.city || 'Khác';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  // Movie genre breakdown
  const genreMap = movies.reduce((acc, m) => {
    const g = m.genre || 'Khác';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  const topCinemas = cinemas
    .map(c => ({ ...c, ticketCount: tickets.filter(t => t.cinemaName === c.name).length }))
    .sort((a, b) => b.ticketCount - a.ticketCount).slice(0, 5);

  /* ── Chart configs ── */
  const baseChartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };

  const revenueMovieChart = {
    labels: revenueByMovie.map(([k]) => k.length > 18 ? k.slice(0, 18) + '…' : k),
    datasets: [{
      label: 'Doanh thu (VND)',
      data: revenueByMovie.map(([, v]) => v),
      backgroundColor: CHART_COLORS,
      borderRadius: 6,
    }],
  };

  const methodChart = {
    labels: revenueByMethod.map(([k]) => k.toUpperCase()),
    datasets: [{
      data: revenueByMethod.map(([, v]) => v),
      backgroundColor: CHART_COLORS,
      borderWidth: 0,
      hoverOffset: 10,
    }],
  };

  const statusChart = {
    labels: Object.keys(ticketStatusMap).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [{
      data: Object.values(ticketStatusMap),
      backgroundColor: ['#34d399', '#f2c94c', '#f472b6', '#60a5fa', '#fb923c'],
      borderWidth: 0,
      hoverOffset: 10,
    }],
  };

  const bookingMonthChart = {
    labels: bookingsByMonth.map(([k]) => k),
    datasets: [{
      label: 'Số vé đặt',
      data: bookingsByMonth.map(([, v]) => v),
      borderColor: '#60a5fa',
      backgroundColor: 'rgba(96,165,250,0.12)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#60a5fa',
    }],
  };

  const revenueMonthChart = {
    labels: revenueByMonth.map(([k]) => k),
    datasets: [{
      label: 'Doanh thu (VND)',
      data: revenueByMonth.map(([, v]) => v),
      borderColor: '#f2c94c',
      backgroundColor: GRAD_GOLD,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#f2c94c',
    }],
  };

  const userMonthChart = {
    labels: usersByMonth.map(([k]) => k),
    datasets: [{
      label: 'Người dùng mới',
      data: usersByMonth.map(([, v]) => v),
      borderColor: '#34d399',
      backgroundColor: 'rgba(52,211,153,0.12)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#34d399',
    }],
  };

  const providerChart = {
    labels: Object.keys(providerMap).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [{
      data: Object.values(providerMap),
      backgroundColor: ['#60a5fa', '#f2c94c', '#34d399', '#f472b6'],
      borderWidth: 0,
      hoverOffset: 10,
    }],
  };

  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 12 }, padding: 14 } },
    },
  };

  const lineOpts = { ...baseChartOpts, scales: { ...baseChartOpts.scales, y: { ...baseChartOpts.scales.y, beginAtZero: true } } };

  if (loading) return (
    <div className="pbi-loading">
      <div className="pbi-spinner" />
      <p>Đang tải dữ liệu phân tích...</p>
    </div>
  );

  if (error) return (
    <div className="pbi-error">
      <Activity size={48} />
      <h3>Không thể tải dữ liệu</h3>
      <p>{error}</p>
      <button className="pbi-retry-btn" onClick={fetchAll}>Thử lại</button>
    </div>
  );

  return (
    <div className="pbi-wrapper">
      {/* Header */}
      <div className="pbi-header">
        <div className="pbi-header-left">
          <div className="pbi-logo"><BarChart3 size={22} /></div>
          <div>
            <h2 className="pbi-title">Analytics Dashboard</h2>
            <p className="pbi-subtitle">
              {lastUpdated ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString('vi-VN')}` : 'Dữ liệu thời gian thực từ hệ thống'}
            </p>
          </div>
        </div>
        <button className="pbi-refresh-btn" onClick={fetchAll}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      <div className="pbi-body">
        {/* KPI Cards */}
        <div className="pbi-kpi-grid">
          <div className="pbi-kpi-card pbi-kpi-gold">
            <div className="pbi-kpi-icon"><DollarSign size={24} /></div>
            <div className="pbi-kpi-info">
              <span className="pbi-kpi-label">Tổng doanh thu</span>
              <span className="pbi-kpi-value">{fmt(dash?.totalRevenue)}</span>
              <span className="pbi-kpi-sub">Vé đã thanh toán</span>
            </div>
          </div>
          <div className="pbi-kpi-card pbi-kpi-blue">
            <div className="pbi-kpi-icon"><Ticket size={24} /></div>
            <div className="pbi-kpi-info">
              <span className="pbi-kpi-label">Tổng số vé</span>
              <span className="pbi-kpi-value">{fmtNum(dash?.totalTickets)}</span>
              <span className="pbi-kpi-sub">{tickets.filter(t => t.paymentStatus?.toLowerCase() === 'paid').length} đã thanh toán</span>
            </div>
          </div>
          <div className="pbi-kpi-card pbi-kpi-green">
            <div className="pbi-kpi-icon"><Users size={24} /></div>
            <div className="pbi-kpi-info">
              <span className="pbi-kpi-label">Người dùng</span>
              <span className="pbi-kpi-value">{fmtNum(users.length)}</span>
              <span className="pbi-kpi-sub">{Object.keys(providerMap).length} phương thức đăng nhập</span>
            </div>
          </div>
          <div className="pbi-kpi-card pbi-kpi-purple">
            <div className="pbi-kpi-icon"><Film size={24} /></div>
            <div className="pbi-kpi-info">
              <span className="pbi-kpi-label">Phim</span>
              <span className="pbi-kpi-value">{fmtNum(movies.length)}</span>
              <span className="pbi-kpi-sub">{cinemas.length} rạp chiếu</span>
            </div>
          </div>
        </div>

        {/* Row 1: Revenue by month + Payment method */}
        <div className="pbi-row pbi-row-7-3">
          <div className="pbi-chart-card">
            <div className="pbi-chart-header">
              <TrendingUp size={18} />
              <h3>Doanh thu theo tháng</h3>
            </div>
            <div className="pbi-chart-body" style={{ height: 260 }}>
              <Line data={revenueMonthChart} options={{
                ...lineOpts, plugins: { ...lineOpts.plugins, legend: { display: false } },
                scales: { ...lineOpts.scales, y: { ...lineOpts.scales.y, ticks: { ...lineOpts.scales.y.ticks, callback: v => (v / 1000000).toFixed(0) + 'M' } } }
              }} />
            </div>
          </div>
          <div className="pbi-chart-card">
            <div className="pbi-chart-header">
              <CreditCard size={18} />
              <h3>Phương thức TT</h3>
            </div>
            <div className="pbi-chart-body" style={{ height: 260 }}>
              {revenueByMethod.length > 0
                ? <Doughnut data={methodChart} options={doughnutOpts} />
                : <div className="pbi-no-data">Chưa có dữ liệu</div>}
            </div>
          </div>
        </div>

        {/* Row 2: Top movies revenue bar chart */}
        <div className="pbi-chart-card pbi-chart-full">
          <div className="pbi-chart-header">
            <Award size={18} />
            <h3>Top phim theo doanh thu</h3>
          </div>
          <div className="pbi-chart-body" style={{ height: 280 }}>
            {revenueByMovie.length > 0
              ? <Bar data={revenueMovieChart} options={{
                ...baseChartOpts,
                plugins: { ...baseChartOpts.plugins, legend: { display: false } },
                scales: {
                  ...baseChartOpts.scales,
                  y: { ...baseChartOpts.scales.y, ticks: { ...baseChartOpts.scales.y.ticks, callback: v => (v / 1000000).toFixed(0) + 'M' } }
                }
              }} />
              : <div className="pbi-no-data">Chưa có dữ liệu doanh thu phim</div>}
          </div>
        </div>

        {/* Row 3: Bookings/month + Ticket status */}
        <div className="pbi-row pbi-row-7-3">
          <div className="pbi-chart-card">
            <div className="pbi-chart-header">
              <Activity size={18} />
              <h3>Số vé đặt theo tháng</h3>
            </div>
            <div className="pbi-chart-body" style={{ height: 240 }}>
              <Line data={bookingMonthChart} options={{
                ...lineOpts, plugins: { ...lineOpts.plugins, legend: { display: false } }
              }} />
            </div>
          </div>
          <div className="pbi-chart-card">
            <div className="pbi-chart-header">
              <Ticket size={18} />
              <h3>Trạng thái vé</h3>
            </div>
            <div className="pbi-chart-body" style={{ height: 240 }}>
              {Object.keys(ticketStatusMap).length > 0
                ? <Doughnut data={statusChart} options={doughnutOpts} />
                : <div className="pbi-no-data">Chưa có dữ liệu</div>}
            </div>
          </div>
        </div>

        {/* Row 4: User growth + Provider + Cinema city */}
        <div className="pbi-row pbi-row-3col">
          <div className="pbi-chart-card">
            <div className="pbi-chart-header">
              <Users size={18} />
              <h3>Người dùng mới / tháng</h3>
            </div>
            <div className="pbi-chart-body" style={{ height: 220 }}>
              <Line data={userMonthChart} options={{
                ...lineOpts, plugins: { ...lineOpts.plugins, legend: { display: false } }
              }} />
            </div>
          </div>
          <div className="pbi-chart-card">
            <div className="pbi-chart-header">
              <PieChart size={18} />
              <h3>Đăng nhập theo nền tảng</h3>
            </div>
            <div className="pbi-chart-body" style={{ height: 220 }}>
              {Object.keys(providerMap).length > 0
                ? <Doughnut data={providerChart} options={doughnutOpts} />
                : <div className="pbi-no-data">Chưa có dữ liệu</div>}
            </div>
          </div>
          <div className="pbi-chart-card">
            <div className="pbi-chart-header">
              <Building2 size={18} />
              <h3>Top 5 rạp hoạt động nhất</h3>
            </div>
            <div className="pbi-chart-body">
              <div className="pbi-table">
                {topCinemas.length > 0 ? topCinemas.map((c, i) => (
                  <div key={c.id} className="pbi-table-row">
                    <span className="pbi-table-rank">{i + 1}</span>
                    <div className="pbi-table-info">
                      <span className="pbi-table-name">{c.name}</span>
                      <span className="pbi-table-sub">{c.city}</span>
                    </div>
                    <span className="pbi-table-val">{fmtNum(c.ticketCount)} vé</span>
                  </div>
                )) : <div className="pbi-no-data">Chưa có dữ liệu</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Row 5: Recent tickets table */}
        <div className="pbi-chart-card pbi-chart-full">
          <div className="pbi-chart-header">
            <Ticket size={18} />
            <h3>Vé gần đây nhất (20 vé)</h3>
          </div>
          <div className="pbi-recent-tickets">
            <table className="pbi-tickets-table">
              <thead>
                <tr>
                  <th>Số vé</th>
                  <th>Phim</th>
                  <th>Khách hàng</th>
                  <th>Rạp</th>
                  <th>Giá</th>
                  <th>Phương thức TT</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {[...tickets]
                  .sort((a, b) => new Date(b.bookingTime || 0) - new Date(a.bookingTime || 0))
                  .slice(0, 20)
                  .map(t => (
                    <tr key={t.id}>
                      <td className="pbi-td-mono">{t.ticketNumber || t.id?.slice(-6)}</td>
                      <td>{t.movieTitle || '—'}</td>
                      <td>{t.userName || t.userEmail || '—'}</td>
                      <td>{t.cinemaName || '—'}</td>
                      <td className="pbi-td-amount">{fmt(t.price)}</td>
                      <td>
                        <span className={`pbi-method-badge pbi-method-${t.paymentMethod?.toLowerCase() || 'unknown'}`}>
                          {t.paymentMethod || '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`pbi-status-badge pbi-status-${t.status?.toLowerCase() || 'unknown'}`}>
                          {t.status || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
