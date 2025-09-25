import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Calendar, Building2, Film, ChevronDown, ChevronRight } from 'lucide-react';
import { getAllShowtimes } from '../../../services/showtimeService';
import { getAllCinemas } from '../../../services/cinemaService';
import styles from './ShowtimeSchedule.module.css';

const ShowtimeSchedule = ({ movieId, movieTitle }) => {
  const [showtimes, setShowtimes] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCity, setSelectedCity] = useState(() => {
    try {
      return localStorage.getItem('selectedCity') || 'Tp. Hồ Chí Minh';
    } catch {
      return 'Tp. Hồ Chí Minh';
    }
  });
  const [availableCities, setAvailableCities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [movieId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [showtimesData, cinemasData] = await Promise.all([
        getAllShowtimes(),
        getAllCinemas()
      ]);
      
      setShowtimes(showtimesData);
      setCinemas(cinemasData);
      
      // Extract unique cities from cinemas data
      const cities = [...new Set(cinemasData.map(cinema => cinema.city).filter(Boolean))];
      if (cities.length > 0) {
        setAvailableCities(cities);
      }
    } catch (err) {
      console.error('Error fetching showtime data:', err);
      setError('Không thể tải lịch chiếu');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return timeString;
      }
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return timeString;
      }
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Ho_Chi_Minh'
      });
    } catch (error) {
      console.error('Error formatting time:', error, timeString);
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleShowtimeClick = (showtime) => {
    navigate('/seat-selection', {
      state: {
        showtime: showtime,
        movie: { id: movieId, title: movieTitle }
      }
    });
  };

  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    try {
      localStorage.setItem('selectedCity', newCity);
    } catch (error) {
      console.warn('Could not save city to localStorage:', error);
    }
  };

  // Filter showtimes by movie and date
  const filteredShowtimes = showtimes.filter(showtime => {
    const matchesMovie = showtime.movieId === movieId;
    const showtimeDate = showtime.startTime ? new Date(showtime.startTime).toISOString().split('T')[0] : '';
    const matchesDate = showtimeDate === selectedDate;
    return matchesMovie && matchesDate;
  });

  // Group showtimes by cinema (only cinemas in selected city)
  const groupedShowtimes = filteredShowtimes.reduce((groups, showtime) => {
    const cinemaId = showtime.cinemaId;
    const cinema = cinemas.find(c => c.id === cinemaId);
    
    // Only include cinemas in the selected city
    if (cinema && cinema.city === selectedCity) {
      if (!groups[cinemaId]) {
        groups[cinemaId] = {
          cinema: cinema,
          showtimes: []
        };
      }
      groups[cinemaId].showtimes.push(showtime);
    }
    return groups;
  }, {});

  // Group showtimes by format within each cinema
  const formatGroupedShowtimes = Object.keys(groupedShowtimes).reduce((result, cinemaId) => {
    const cinemaData = groupedShowtimes[cinemaId];
    const formatGroups = cinemaData.showtimes.reduce((formats, showtime) => {
      const format = showtime.format || '2D';
      if (!formats[format]) {
        formats[format] = [];
      }
      formats[format].push(showtime);
      return formats;
    }, {});

    result[cinemaId] = {
      cinema: cinemaData.cinema,
      formats: formatGroups
    };
    return result;
  }, {});

  // Helper: detect cinema system/brand from cinema name
  const detectCinemaSystem = (cinema) => {
    // Ưu tiên trường brand/cinemaSystem nếu có
    if (cinema.brand) return cinema.brand;
    if (cinema.cinemaSystem) return cinema.cinemaSystem;
    // Nếu không có, tách từ tên rạp
    const name = (cinema.name || cinema.cinemaName || '').toLowerCase();
    if (name.includes('cgv')) return 'CGV';
    if (name.includes('galaxy')) return 'Galaxy Cinema';
    if (name.includes('lotte')) return 'Lotte Cinema';
    if (name.includes('bhd')) return 'BHD Star Cineplex';
    if (name.includes('mega gs')) return 'Mega GS Cinemas';
    if (name.includes('dcine')) return 'Dcine';
    if (name.includes('đống đa') || name.includes('dong da')) return 'Đống Đa Cinema';
    return 'Khác';
  };

  // Group cinemas theo hệ thống
  const cinemaSystems = {};
  cinemas.forEach(cinema => {
    if (cinema.city !== selectedCity) return;
    const system = detectCinemaSystem(cinema);
    if (!cinemaSystems[system]) cinemaSystems[system] = [];
    cinemaSystems[system].push(cinema);
  });
  const systemNames = Object.keys(cinemaSystems);

  // State cho expand/collapse hệ thống và rạp con
  const [expandedSystems, setExpandedSystems] = useState([]);
  const [expandedCinemas, setExpandedCinemas] = useState([]);

  const toggleSystem = (system) => {
    setExpandedSystems(prev => prev.includes(system)
      ? prev.filter(s => s !== system)
      : [...prev, system]);
  };
  const toggleCinema = (cinemaId) => {
    setExpandedCinemas(prev => prev.includes(cinemaId)
      ? prev.filter(id => id !== cinemaId)
      : [...prev, cinemaId]);
  };

  const cinemaSystemLogos = {
    'CGV': 'https://cdn.moveek.com/storage/media/cache/square/524ba157cd271c9c24d15f367a57c13abc26af06.jpg',
    'Galaxy Cinema': 'https://cdn1.vieclam24h.vn/images/default/2024/04/10/images_171276257558.w-240.h-240.jpg',
    'Lotte Cinema': '/public/payment-icons/lotte.png',
    'BHD Star Cineplex': '/public/payment-icons/bhd.png',
    'Mega GS Cinemas': '/public/payment-icons/megags.png',
    'Dcine': '/public/payment-icons/dcine.png',
    'Đống Đa Cinema': '/public/payment-icons/dongda.png',
    'Khác': '/public/payment-icons/default-cinema.png'
  };
  const getCinemaSystemLogo = (system) => cinemaSystemLogos[system] || cinemaSystemLogos['Khác'];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Đang tải lịch chiếu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button onClick={fetchData} className={styles.retryBtn}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className={styles.showtimeSchedule}>
      <div className={styles.header}>
        <h2>Lịch chiếu - {movieTitle}</h2>
        <div className={styles.controls}>
          <div className={styles.dateSelector}>
            <Calendar size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.citySelector}>
            <MapPin size={16} />
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className={styles.citySelect}
            >
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.scheduleContent}>
        {systemNames.length === 0 ? (
          <div className={styles.noShowtimes}>
            <Film size={48} />
            <h3>Không có lịch chiếu</h3>
            <p>Không có hệ thống rạp nào tại {selectedCity}</p>
          </div>
        ) : (
          <div className={styles.cinemaSystemsList}>
            {systemNames.map(system => (
              <div key={system} className={styles.cinemaSystemCard}>
                <div className={styles.cinemaSystemHeader} onClick={() => toggleSystem(system)}>
                  <img
                    src={getCinemaSystemLogo(system)}
                    alt={system + ' logo'}
                    className={styles.cinemaSystemLogo}
                  />
                  <div className={styles.cinemaSystemText}>
                    <span className={styles.cinemaSystemName}>{system} Cinemas</span>
                    <span className={styles.cinemaSystemCount}>{cinemaSystems[system].length} rạp</span>
                  </div>
                  {expandedSystems.includes(system)
                    ? <ChevronDown size={20} />
                    : <ChevronRight size={20} />}
                </div>
                {expandedSystems.includes(system) && (
                  <div className={styles.cinemaBranchesList}>
                    {cinemaSystems[system].map(cinema => (
                      <div key={cinema.id} className={styles.cinemaBranchCard}>
                        <div className={styles.cinemaBranchHeader} onClick={() => toggleCinema(cinema.id)}>
                          <span className={styles.cinemaBranchTitle}>{cinema.name || cinema.cinemaName}</span>
                          {expandedCinemas.includes(cinema.id)
                            ? <ChevronDown size={16} />
                            : <ChevronRight size={16} />}
                        </div>
                        {expandedCinemas.includes(cinema.id) && (
                          <div className={styles.cinemaShowtimesDetail}>
                            {/* Lấy showtimes của cinema này */}
                            {(() => {
                              const cinemaShowtimes = showtimes.filter(st => st.cinemaId === cinema.id && st.movieId === movieId && (st.startTime ? new Date(st.startTime).toISOString().split('T')[0] === selectedDate : false));
                              if (cinemaShowtimes.length === 0) return <div className={styles.noShowtimesSmall}>Không có lịch chiếu cho ngày này</div>;
                              const byFormat = cinemaShowtimes.reduce((acc, st) => {
                                const fmt = st.format || '2D';
                                if (!acc[fmt]) acc[fmt] = [];
                                acc[fmt].push(st);
                                return acc;
                              }, {});
                              return Object.entries(byFormat).map(([format, sts]) => (
                                <div key={format} className={styles.formatGroup}>
                                  <div className={styles.formatLabel}>{format}</div>
                                  <div className={styles.showtimesGrid}>
                                    {sts.map((showtime, idx) => (
                                      <button
                                        key={showtime.id + '-' + idx}
                                        className={styles.showtimeBtn}
                                        onClick={() => handleShowtimeClick(showtime)}
                                        title={`${formatTime(showtime.startTime)} - ${format} - ${showtime.room}`}
                                      >
                                        <div className={styles.showtimeTime}>{formatTime(showtime.startTime)}</div>
                                        <div className={styles.showtimeRoom}>{showtime.room}</div>
                                        <div className={styles.showtimePrice}>{showtime.price ? `${showtime.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}</div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowtimeSchedule;
