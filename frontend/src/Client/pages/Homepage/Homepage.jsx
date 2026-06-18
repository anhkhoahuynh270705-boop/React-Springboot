import React, { useState, useEffect } from 'react';
import HeroSection from '../../components/HeroSection/HeroSection';
import MovieCarousel from '../../components/MovieCarousel/MovieCarousel';
import FeaturedMovies from '../../components/FeaturedMovies/FeaturedMovies';
import { getMovies } from '../../../services/movieService';
import { HoneypotLink } from '../../../services/useHoneypot';
import './Homepage.css';
import { useTranslation } from 'react-i18next';

const Homepage = () => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('nowShowing');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const data = await getMovies();
        setMovies(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Cannot load movie list');
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const nowShowingMovies = movies.filter(
    (movie) => movie.releaseDate && new Date(movie.releaseDate) <= today
  );
  const comingSoonMovies = movies.filter(
    (movie) => movie.releaseDate && new Date(movie.releaseDate) > today
  );
  const featuredMovies = movies.filter((movie) => movie.featured === true);

  const tabs = [
    { key: 'nowShowing', label: t('nowShowing'), movies: nowShowingMovies },
    { key: 'comingSoon', label: t('comingSoon'), movies: comingSoonMovies },
  ];

  if (loading) {
    return (
      <div className="landingpage">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('Loadinghomepage')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="landingpage">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            {t('Reload Server')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="landingpage">
      {/* Honeypot links - hidden URLs for bot detection */}
      <HoneypotLink href="/admin/secret-panel" text="Secret Admin Panel" />
      <HoneypotLink href="/api/internal/admin" text="Internal Admin API" />

      <main className="main-content">
        {/* HeroSection handles CurtainIntro internally */}
        <HeroSection />

        <div className="home-3d-stage">
          <MovieCarousel
            movies={featuredMovies.length > 0 ? featuredMovies : movies.slice(0, 8)}
          />

          <div
            className="content-wrapper home-3d-content"
            style={{ maxWidth: 1200, margin: '0 auto' }}
          >
            <div className="movie-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`movie-tab-btn${selectedTab === tab.key ? ' active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <FeaturedMovies
            movies={tabs.find(tab => tab.key === selectedTab).movies}
            title={tabs.find(tab => tab.key === selectedTab).label}
          />
        </div>
      </main>
    </div>
  );
};

export default Homepage;