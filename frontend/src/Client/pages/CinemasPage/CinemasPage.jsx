import { getAllCinemas as getCinemas } from '../../../services/cinemaService';
import { useState, useEffect, useMemo, useCallback } from 'react';
import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter, Phone, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CinemasPage.module.css';
import { useTranslation } from 'react-i18next';

const CinemasPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        const data = await getCinemas();
        setCinemas(data);
        setError(null);
      } catch (err) {
        setError(t('CinemaNotFound'));
        console.error('Error fetching cinemas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cities = useMemo(() => {
    const set = new Set();
    cinemas.forEach(c => { if (c.city) set.add(c.city); });
    return Array.from(set).sort();
  }, [cinemas]);

  // Extract district from address
  const districts = useMemo(() => {
    const set = new Set();
    cinemas.forEach(c => {
      if (c.district) {
        set.add(c.district);
      } else if (c.address) {
        const match = c.address.match(/(Quận|Huyện|Thành phố|TP\.?)\s[\w\s]+/i);
        if (match) set.add(match[0].trim());
      }
    });
    return Array.from(set).sort();
  }, [cinemas]);

  const normalizedCinemas = useMemo(() => {
    const normalize = (str) => {
      if (!str) return '';
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
    };
    return cinemas.map(cinema => ({
      ...cinema,
      _normName: normalize(cinema.name),
      _normAddress: normalize(cinema.address),
      _normCinemaName: normalize(cinema.cinemaName),
    }));
  }, [cinemas]);

  const filteredCinemas = useMemo(() => {
    const normalize = (str) => {
      if (!str) return '';
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
    };
    const normalizedQuery = normalize(searchQuery);

    return normalizedCinemas.filter(cinema => {
      const matchesCity = !selectedCity || cinema.city === selectedCity;
      const matchesDistrict = !selectedDistrict ||
        cinema.address?.includes(selectedDistrict) ||
        cinema.district === selectedDistrict;
      const matchesSearch = !searchQuery ||
        cinema._normName.includes(normalizedQuery) ||
        cinema._normAddress.includes(normalizedQuery) ||
        cinema._normCinemaName.includes(normalizedQuery);
      return matchesCity && matchesSearch && matchesDistrict;
    });
  }, [normalizedCinemas, searchQuery, selectedCity, selectedDistrict]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity, selectedDistrict]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCinemas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCinemas = filteredCinemas.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  }, [currentPage, handlePageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  }, [currentPage, totalPages, handlePageChange]);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className={`${styles['cinemas-page']}`}>
        <div className={`${styles['page-hero']}`}>
          <div className={styles['hero-inner']}>
            <h1>{t('Cinema')}</h1>
            <p>{t('LoadingCinemaData')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles['cinemas-page']}`}>
        <div className={`${styles['page-hero']}`}>
          <div className={`${styles['hero-inner']}`}>
            <h1>{t('Cinema')}</h1>
            <p>{t('LoadingCinemaDataFailed')}</p>
          </div>
        </div>
        <div className={`${styles['page-content']}`}>
          <div className={`${styles['error-message']}`}>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>{t('TryAgain')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles['cinemas-page']}`}>
      <div className={`${styles['page-hero']}`}>
        <div className={styles['hero-inner']}>
          <h1>{t('Cinema')}</h1>
          <p>{t('FindYourFavoriteCinema') || 'Find theaters near you and book tickets quickly'}</p>

          <div className={styles['hero-search']}>
            <div className={styles['search-input-wrap']}>
              <Search size={18} className={styles['search-icon']} />
              <input
                type="text"
                placeholder={t('searchCinema')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles['search-input']}
              />
            </div>

            <div className={styles['hero-filters']}>
              <div className={styles['chip']}>
                <MapPin size={14} />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <option value="">{t('AllCities')}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles['chip']}>
                <Filter size={14} />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="">{t('allDistricts')}</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles['page-content']}`}>
        <div className={styles['results-header']}>
          <h2>{t('SearchResults')}</h2>
          <span className={styles['results-count']}>
            {filteredCinemas.length} {t('Cinemas')}
          </span>
        </div>

        {filteredCinemas.length === 0 ? (
          <div className={`${styles['no-results']}`}>
            <p>{t('NoCinemasFound')}</p>
          </div>
        ) : (
          <>
            <div className={styles['grid']}>
              {paginatedCinemas.map((cinema, index) => (
                <div key={cinema.id || cinema._id || index} className={styles['card']}>
                  <div className={styles['card-header']}>
                    <div className={styles['card-media']}>
                      {cinema.imageUrl ? (
                        <img
                          src={cinema.imageUrl}
                          alt={cinema.name}
                          loading="lazy"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className={styles['media-placeholder']}>{cinema.name?.charAt(0) || 'C'}</div>
                      )}
                    </div>
                    <div className={styles['card-title']}>
                      <h3>{cinema.name || cinema.cinemaName}</h3>
                    </div>
                  </div>
                  <div className={styles['card-body']}>
                    <div className={styles['line']}>
                      <MapPin size={14} />
                      <span>{cinema.address}</span>
                    </div>
                    <div className={styles['line']}>
                      <Phone size={14} />
                      <span>{cinema.phone || '028 1234 5678'}</span>
                    </div>
                    <div className={styles['line']}>
                      <Clock size={14} />
                      <span>{cinema.openingHours || '08:00 - 23:00'}</span>
                    </div>
                  </div>
                  <div className={styles['card-actions']}>
                    <Link
                      to={`/cinema/${cinema.id || cinema._id}`}
                      className={styles['btn-primary']}
                      style={{ textAlign: 'center', gridColumn: 'span 2', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {t('viewDetail') || 'View Detail'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className={styles['pagination']}>
                <button
                  className={styles['pagination-button']}
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                  aria-label={t('Previous page')}
                ><ChevronLeft size={20} /></button>

                <div className={styles['pagination-numbers']}>
                  {getPageNumbers().map((page, index) => {
                    if (page === 'ellipsis') {
                      return (
                        <span key={`ellipsis-${index}`} className={styles['ellipsis']}>
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        className={`${styles['pagination-number']} ${currentPage === page ? styles['active'] : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  className={styles['pagination-button']}
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  aria-label={t('Next page')}
                ><ChevronRight size={20} /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CinemasPage;