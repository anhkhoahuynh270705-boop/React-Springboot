import React, { useState, useEffect } from 'react';
import HeroSection from '../../components/HeroSection/HeroSection';
import FeaturedMovies from '../../components/FeaturedMovies/FeaturedMovies';
import DateSelector from '../../components/DateSelector/DateSelector';
import { getMovies } from '../../services/movieService';
import './Homepage.css';

const Homepage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        console.log('Homepage: Fetching movies...');
        const data = await getMovies();
        console.log('Homepage: Movies data received:', data);
        console.log('Homepage: Number of movies:', data.length);
        setMovies(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Không thể tải danh sách phim');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    console.log('Selected date:', date);
    // TODO: Filter movies by selected date
  };

  if (loading) {
    return (
      <div className="homepage">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải trang chủ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="homepage">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <main className="main-content">
        <HeroSection />
        <div className="content-wrapper">
          {/* Date Selector */}
          <DateSelector 
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
          
          {/* Single Movies Section - Display all movies */}
          <div className="movies-section">
            <FeaturedMovies 
              movies={movies} 
              title="Nhấn vào suất chiếu để tiến hành mua vé"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Homepage;
