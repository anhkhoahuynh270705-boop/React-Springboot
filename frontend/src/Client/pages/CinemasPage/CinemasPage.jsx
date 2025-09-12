import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import CinemaList from '../../components/CinemaList/CinemaList';
import { getCinemas } from '../../../services/cinemaService';
import styles from './CinemasPage.module.css';

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

  // Function to remove Vietnamese diacritics for search
  const removeVietnameseDiacritics = (str) => {
    if (!str) return '';
    
    return str
      .normalize('NFD') // Decompose characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Handle đ/Đ specifically
      .toLowerCase();
  };

  // Function to check if text contains search query (case-insensitive, diacritic-insensitive)
  const containsSearchQuery = (text, query) => {
    if (!text || !query) return false;
    
    const normalizedText = removeVietnameseDiacritics(text);
    const normalizedQuery = removeVietnameseDiacritics(query);
    
    return normalizedText.includes(normalizedQuery);
  };

  const filteredCinemas = cinemas.filter(cinema => {
    const matchesSearch = containsSearchQuery(cinema.name, searchQuery) ||
                         containsSearchQuery(cinema.address, searchQuery) ||
                         containsSearchQuery(cinema.cinemaName, searchQuery);
    const matchesDistrict = !selectedDistrict || selectedDistrict === 'Tất cả quận' ||
                           cinema.address?.includes(selectedDistrict);
    return matchesSearch && matchesDistrict;
  });

  if (loading) {
    return (
      <div className={`${styles['cinemas-page']}`}>      
        <div className={`${styles['page-header']}`}>
          <div className={styles['header-content']}>  
            <h1>Rạp chiếu phim</h1>
            <p>Đang tải danh sách rạp phim...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles['cinemas-page']}`}>
        <div className={`${styles['page-header']}`}>
          <div className={`${styles['header-content']}`}>
            <h1>Rạp chiếu phim</h1>
            <p>Không thể tải danh sách rạp phim</p>
          </div>
        </div>
          <div className={`${styles['page-content']}`}>
          <div className={`${styles['error-message']}`}>   
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles['cinemas-page']}`}>
      <div className={`${styles['page-header']}`}>
        <div className={styles['header-content']}>
          <h1>Rạp chiếu phim</h1>
          <p>Khám phá các rạp chiếu phim chất lượng cao tại TP.HCM</p>
        </div>
      </div>

      <div className={`${styles['page-content']}`}>
        <div className={`${styles['search-filters']}`}>
          <div className={`${styles['search-section']}`}> 
            <div className={`${styles['search-container']}`}>
              <Search size={20} className={`${styles['search-icon']}`} />
              <input
                type="text"
                placeholder="Tìm kiếm rạp chiếu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${styles['search-input']}`}
              />
            </div>
          </div>

          <div className={`${styles['filters-section']}`}>
            <div className={`${styles['filter-group']}`}>
              <label className={`${styles['filter-label']}`}> 
                <MapPin size={16} />
                Quận/Huyện
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className={`${styles['filter-select']}`}
              >
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className={`${styles['filter-group']}`}>
              <label className={`${styles['filter-label']}`}>  
                <Filter size={16} />
                Sắp xếp
              </label>
              <select className={`${styles['filter-select']}`}> 
                <option value="rating">Đánh giá cao nhất</option>
                <option value="name">Tên A-Z</option>
                <option value="distance">Gần nhất</option>
              </select>
            </div>
          </div>
        </div>

        <div className={`${styles['results-section']}`}>
          <div className={`${styles['results-header']}`}>
            <h2 className={`${styles['results-header-title']}`}>Kết quả tìm kiếm</h2>
            <span className={`${styles['results-count']}`}>
              {filteredCinemas.length} rạp chiếu
            </span>
          </div>

          {filteredCinemas.length === 0 ? (
            <div className={`${styles['no-results']}`}>
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