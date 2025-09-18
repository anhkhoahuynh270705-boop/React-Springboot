import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Calendar } from 'lucide-react';
import { getShowtimesByMovie, getShowtimesByCinemaAndMovie, getShowtimesByDateAndCinema } from '../../../services/showtimeService';
import './MovieCard.css';

const MovieCard = ({ movie, cinemaId, selectedDate }) => {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.log('MovieCard: Received movie:', movie);
  const getImageUrl = (movie) => {
    return movie.posterUrl || movie.poster || movie.imageUrl || movie.image || '/default-movie.jpg';
  };

  const getTitle = (movie) => {
    return movie.title || movie.name || movie.movieName || 'Unknown Title';
  };

  const getGenre = (movie) => {
    return movie.genre || movie.genres || movie.category || 'Unknown Genre';
  };

  const getDuration = (movie) => {
    return movie.duration || movie.runtime || movie.length || '133';
  };

  const getFormat = (movie) => {
    return movie.format || '2D Phụ Đề Việt - Anh';
  };

  const getAgeRating = (movie) => {
    return movie.ageRating || movie.ageLimit || movie.certification || 'N/A';
  };

  const getEnglishTitle = (movie) => {
    return movie.englishTitle || movie.originalTitle || movie.altTitle || '';
  };

  const getReleaseDate = (movie) => {
    if (movie.releaseDate) {
      const date = new Date(movie.releaseDate);
      return date.toLocaleDateString('vi-VN');
    }
    return movie.releaseYear || movie.year || 'Chưa có thông tin';
  };

  // Fetch showtimes from API (hidden on homepage; still used on cinema page)
  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setLoading(true);     
        let data = [];
        if (cinemaId && selectedDate) {
          const byDate = await getShowtimesByDateAndCinema(cinemaId, selectedDate);
          data = Array.isArray(byDate) ? byDate.filter(s => (s.movieId === movie.id || s.movieId === movie._id)) : [];
        } else if (cinemaId) {
          data = await getShowtimesByCinemaAndMovie(cinemaId, movie.id);
        } else {
          data = await getShowtimesByMovie(movie.id);
        }
        if (Array.isArray(data)) {
          const filteredShowtimes = data.filter(showtime => {
            const matchesMovie = showtime.movieId === movie.id || showtime.movieId === movie._id;
            const matchesCinema = cinemaId ? (showtime.cinemaId === cinemaId || showtime.cinema?.id === cinemaId) : true;
            return matchesMovie && matchesCinema;
          });
          setShowtimes(filteredShowtimes);
        } else {
          setShowtimes([]);
        }
      } catch (error) {
        setShowtimes([]);
      } finally {
        setLoading(false);
      }
    };

    if (movie.id || movie._id) {
      fetchShowtimes();
    } else {
      console.log('MovieCard: No movie ID found:', movie);
    }
  }, [movie.id, movie._id, cinemaId, selectedDate, movie]);

  // Listen for showtime updates
  useEffect(() => {
    const handleShowtimeUpdate = () => {
      const fetchShowtimes = async () => {
        try {
          let data = [];
          if (cinemaId && selectedDate) {
            const byDate = await getShowtimesByDateAndCinema(cinemaId, selectedDate);
            data = Array.isArray(byDate) ? byDate.filter(s => (s.movieId === movie.id || s.movieId === movie._id)) : [];
          } else if (cinemaId) {
            data = await getShowtimesByCinemaAndMovie(cinemaId, movie.id);
          } else {
            data = await getShowtimesByMovie(movie.id);
          }
          if (Array.isArray(data)) {
            const filteredShowtimes = data.filter(showtime => {
              const matchesMovie = showtime.movieId === movie.id || showtime.movieId === movie._id;
              const matchesCinema = cinemaId ? (showtime.cinemaId === cinemaId || showtime.cinema?.id === cinemaId) : true;
              return matchesMovie && matchesCinema;
            });
            setShowtimes(filteredShowtimes);
          }
        } catch (error) {
          console.error('Error refreshing showtimes:', error);
        }
      };

      if (movie.id || movie._id) {
        fetchShowtimes();
      }
    };

    // Listen for custom event when showtimes are updated
    window.addEventListener('showtimesUpdated', handleShowtimeUpdate);
    
    return () => {
      window.removeEventListener('showtimesUpdated', handleShowtimeUpdate);
    };
  }, [movie.id, movie._id, cinemaId, selectedDate]);

  // Format time for display
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

  // Handle showtime click
  const handleShowtimeClick = (showtime) => {
    navigate('/seat-selection', {
      state: {
        showtime: showtime,
        movie: movie
      }
    });
  };

  return (
    <div className="movie-card">
      <div className="movie-card-image">
        <img 
          src={getImageUrl(movie)} 
          alt={getTitle(movie)}
          onError={(e) => {
            e.target.src = '/default-movie.jpg';
          }}
        />
      </div>
      
      <div className="movie-card-content">
        <h3 className="movie-title">{getTitle(movie)}</h3> 
        {getEnglishTitle(movie) && (
          <p className="movie-english-title">{getEnglishTitle(movie)}</p>
        )}
        <div className="movie-rating-format">
        <span className="rating-badge">{getAgeRating(movie)}</span>
        </div>
  
        
        <div className="movie-meta">
          <div className="meta-item">
            <Clock size={16} />
            <span>{getDuration(movie)} phút</span>
          </div>
          <div className="meta-item">
            <Calendar size={16} />
            <span>{getReleaseDate(movie)}</span>
          </div>
        </div>
        
          <p className="movie-genre">{getGenre(movie)}</p>
        
        <div className="trailer-link">
          <Link to={`/movie/${movie.id}?tab=info`} className="btn-trailer">Trailer</Link>
        </div>

        {/* Showtimes hidden on homepage; still visible on cinema page via props */}
        {cinemaId ? (
          <div className="showtimes-section">
            {loading ? (
              <div className="showtimes-loading">Đang tải...</div> 
            ) : showtimes.length > 0 ? (
              <div className="showtimes-grid">
                {showtimes.slice(0, 4).map((showtime, index) => (
                  <button 
                    key={index} 
                    className="showtime-btn"
                    onClick={() => handleShowtimeClick(showtime)}
                  >
                    {formatTime(showtime.startTime || showtime.time || showtime.showTime)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-showtimes">Chưa có lịch chiếu</div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MovieCard;
