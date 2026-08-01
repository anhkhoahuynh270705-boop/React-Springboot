/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
import { getCinemaById } from '../../../services/cinemaService';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Film, ArrowLeft, Globe } from 'lucide-react';
import { getMoviesByCinema } from '../../../services/movieService';
import { getShowtimesByDateAndCinema } from '../../../services/showtimeService';
import MovieCard from '../../components/MovieCard/MovieCard';
import './CinemaDetailPage.css';
import { useTranslation } from 'react-i18next';

const CinemaDetailPage = () => {
  const { cinemaId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [cinema, setCinema] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      const url = new URL(window.location.href);
      const d = url.searchParams.get('date');
      return d || new Date().toISOString().slice(0, 10);
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  });

  // Generate 7 days starting from today
  const weekDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });
  }, []);
  const [error, setError] = useState(null);
  const [showtimes, setShowtimes] = useState([]);

  useEffect(() => {
    if (cinemaId && selectedDate) {
      fetchShowtimesForDate();
    }
  }, [cinemaId, selectedDate]);

  const fetchShowtimesForDate = async () => {
    try {
      const data = await getShowtimesByDateAndCinema(cinemaId, selectedDate);
      setShowtimes(data || []);
    } catch (err) {
      console.error('Error fetching showtimes for date:', err);
      setShowtimes([]);
    }
  };

  const displayedMovies = useMemo(() => {
    if (!showtimes || showtimes.length === 0) return [];
    const activeMovieIds = new Set(showtimes.map(s => s.movieId));
    return movies.filter(movie => activeMovieIds.has(movie.id) || activeMovieIds.has(movie._id));
  }, [movies, showtimes]);

  useEffect(() => {
    fetchCinemaData();
  }, [cinemaId]);

  const fetchCinemaData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Run both requests in parallel instead of sequential
      const [foundCinema, cinemaMovies] = await Promise.all([
        getCinemaById(cinemaId),
        getMoviesByCinema(cinemaId).catch((err) => {
          console.error('Error fetching movies by cinema:', err);
          return [];
        }),
      ]);

      if (!foundCinema) {
        setError(t('CinemaNotFound'));
        return;
      }

      const cinemaData = {
        id: foundCinema.id || foundCinema._id,
        name: foundCinema.name || t('CinemaNameNotFound'),
        address: foundCinema.address || t('CinemaAddressNotFound'),
        city: foundCinema.city || t('CinemaCityNotFound'),
        phone: foundCinema.phone || null,
        email: foundCinema.email || null,
        imageUrl: foundCinema.imageUrl || null,
        status: foundCinema.status || t('CinemaStatusNotFound'),
        description: foundCinema.description || null,
        totalSeats: foundCinema.totalSeats || 0,
        totalRooms: foundCinema.totalRooms || 0,
        movieIds: foundCinema.movieIds || []
      };

      setCinema(cinemaData);
      setMovies(cinemaMovies);

    } catch (err) {
      console.error('Error fetching cinema data:', err);
      setError(t('CinemaNotFound'));
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return t('CinemaDateNotFound');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return t('CinemaDateNotFound');
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleDateChange = (dateString) => {
    setSelectedDate(dateString);
    try {
      const url = new URL(window.location.href);
      if (dateString) {
        url.searchParams.set('date', dateString);
      } else {
        url.searchParams.delete('date');
      }
      window.history.replaceState({}, '', url.toString());
    } catch { }
  };

  const formatDateForDisplay = (date) => {
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const day = dayNames[date.getDay()];
    const dayNum = date.getDate();
    const month = date.getMonth() + 1;
    return { day, dateStr: `${dayNum}/${month}` };
  };

  if (error) {
    return (
      <div className="cinema-detail-error">
        <div className="error-content">
          <h2>{t('LoadingCinemaDataFailed')}</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-button">
            <ArrowLeft size={20} />
            {t('BackToHome')}
          </button>
        </div>
      </div>
    );
  }

  if (!loading && !cinema) {
    return (
      <div className="cinema-detail-error">
        <div className="error-content">
          <h2>{t('CinemaNotFound')}</h2>
          <p>{t('CinemaNotFoundDescription')}</p>
          <button onClick={() => navigate('/')} className="back-button">
            {t('BackToHome')}
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="cinema-detail-page">
      {/* Header */}
      <div className="cinema-detail-header">
        <button onClick={() => navigate(-1)} className="back-button">

          {t('Back')}
        </button>
        <h1>{t('CinemaInfo')}</h1>
      </div>

      {/* Cinema Info */}
      <div className="cinema-info-section">
        <div className="cinema-info-card">
          {loading ? (
            <div style={{ padding: '20px 0' }}>
              <div style={{ width: '40%', height: 24, background: '#e2e8f0', borderRadius: 6, marginBottom: 12 }} />
              <div style={{ width: '70%', height: 16, background: '#f1f5f9', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ width: '30%', height: 16, background: '#f1f5f9', borderRadius: 4 }} />
            </div>
          ) : cinema && (
            <>
              <div className="cinema-header">
                <div className="cinema-logo">
                  {cinema.imageUrl ? (
                    <img
                      src={cinema.imageUrl}
                      alt={cinema.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="cinema-placeholder"
                    style={{ display: cinema.imageUrl ? 'none' : 'flex' }}
                  >
                  </div>
                </div>

                <div className="cinema-info">
                  <h2 className="cinema-name">{cinema.name}</h2>
                  <p className="cinema-address">{cinema.address}</p>

                  <div className="cinema-links">
                    <div className="cinema-link">
                      <MapPin size={16} />
                      <a
                        href="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d71201.48065974319!2d106.56698455245727!3d10.784670077217974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752dcece7b50db%3A0xf53f7643a9134531!2zQUVPTiBNQUxMIELDrG5oIFTDom4!5e1!3m2!1svi!2s!4v1758431025675!5m2!1svi!2s"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginLeft: "5px", textDecoration: "none", color: "inherit" }}
                      >
                        {t('Map')}
                      </a>
                    </div>

                    <div className="cinema-link">
                      <Globe size={16} />
                      <span>{cinema.city}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cinema-description">
                {cinema.description ? (
                  <p>{cinema.description}</p>
                ) : (
                  <div className="no-description">
                    <p>{t('CinemaDescriptionNotFound')}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>


      {/* Movies Section */}
      <div className="movies-section">
        <div className="section-header">
          <h2>{t('MoviesPlaying')}</h2>
          <span className="movie-count">{displayedMovies.length} {t('Movies')}</span>
        </div>

        {/* 7-Day Date Selector */}
        <div className="date-selector" style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          overflowX: 'auto',
          padding: '8px 0'
        }}>
          {weekDates.map((date) => {
            const dateString = date.toISOString().slice(0, 10);
            const { day, dateStr } = formatDateForDisplay(date);
            const isSelected = selectedDate === dateString;

            return (
              <button
                key={dateString}
                onClick={() => handleDateChange(dateString)}
                className={`date-button ${isSelected ? 'active' : ''}`}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                <span className="day">{day}</span>
                <span className="date">{dateStr}</span>
              </button>
            );
          })}
        </div>

        {displayedMovies.length === 0 ? (
          <div className="no-movies">
            <Film size={64} />
            <h3>{t('NoMoviesToDisplay')}</h3>
            <p>{t('CinemaNoMovies')}</p>
          </div>
        ) : (
          <div className="movies-grid">
            {displayedMovies.map((movie) => (
              <div key={movie.id} className="movie-card-wrapper">
                <MovieCard
                  movie={movie}
                  cinemaId={cinemaId}
                  selectedDate={selectedDate}
                  onClick={() => handleMovieClick(movie.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaDetailPage;
