import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import CinemaList from '../../components/CinemaList/CinemaList';
import { getCinemas } from '../../services/cinemaService';
import './CinemasPage.module.css';

const CinemasPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        const data = await getCinemas();
        setCinemas(data);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách rạp phim');
        console.error('Error fetching cinemas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, []);

  const districts = [
    'Tất cả quận',
    'Quận 1',
    'Quận 3',
    'Quận 5',
    'Quận 7',
    'Quận Tân Phú',
    'Quận Bình Tân'
  ];

  const filteredCinemas = cinemas.filter(cinema => {
    const matchesSearch = cinema.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cinema.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = !selectedDistrict || selectedDistrict === 'Tất cả quận' ||
                           cinema.address?.includes(selectedDistrict);
    return matchesSearch && matchesDistrict;
  });

  if (loading) {
    return (
      <div className="cinemas-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Rạp chiếu phim</h1>
            <p>Đang tải danh sách rạp phim...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cinemas-page">
        <div className="page-header">
          <div className="header-content">
            <h1>Rạp chiếu phim</h1>
            <p>Không thể tải danh sách rạp phim</p>
          </div>
        </div>
        <div className="page-content">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cinemas-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Rạp chiếu phim</h1>
          <p>Khám phá các rạp chiếu phim chất lượng cao tại TP.HCM</p>
        </div>
      </div>

      <div className="page-content">
        <div className="search-filters">
          <div className="search-section">
            <div className="search-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm rạp chiếu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filters-section">
            <div className="filter-group">
              <label className="filter-label">
                <MapPin size={16} />
                Quận/Huyện
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="filter-select"
              >
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <Filter size={16} />
                Sắp xếp
              </label>
              <select className="filter-select">
                <option value="rating">Đánh giá cao nhất</option>
                <option value="name">Tên A-Z</option>
                <option value="distance">Gần nhất</option>
              </select>
            </div>
          </div>
        </div>

        <div className="results-section">
          <div className="results-header">
            <h2>Kết quả tìm kiếm</h2>
            <span className="results-count">
              {filteredCinemas.length} rạp chiếu
            </span>
          </div>

          {filteredCinemas.length === 0 ? (
            <div className="no-results">
              <p>Không tìm thấy rạp phim nào phù hợp với tiêu chí tìm kiếm.</p>
            </div>
          ) : (
            <CinemaList cinemas={filteredCinemas} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CinemasPage;