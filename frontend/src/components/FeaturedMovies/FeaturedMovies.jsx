import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Calendar, Play, Info } from 'lucide-react';
import MovieCard from '../MovieCard/MovieCard';
import './FeaturedMovies.css';

const FeaturedMovies = ({ movies, title = "Phim nổi bật", subtitle = "Khám phá những bộ phim hay nhất" }) => {
  if (!movies || movies.length === 0) {
    return (
      <section className="featured-movies">
        <div className="container">
          <div className="section-header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className="no-movies">
            <p>Không có phim nào để hiển thị</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-movies">
      <div className="container">
        <div className="info-banner">
          <Info size={20} className="info-icon" />
          <span className="banner-text">{title}</span>
        </div>
        
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMovies;
