import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Calendar, Play, Info } from 'lucide-react';
import MovieCard from '../MovieCard/MovieCard';
import styles from './FeaturedMovies.module.css';

const FeaturedMovies = ({ movies, title = "Phim nổi bật", subtitle = "Khám phá những bộ phim hay nhất" }) => {
  if (!movies || movies.length === 0) {
    return (
      <section className={`${styles['featured-movies']}`}>
        <div className={`${styles['container']}`}>
          <div className={`${styles['section-header']}`}>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <div className={`${styles['no-movies']}`}>
            <p>Không có phim nào để hiển thị</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles['featured-movies']}`}>
      <div className={styles['container']}>
        <div className={`${styles['info-banner']}`}>
          <Info size={20} className={`${styles['info-icon']}`} />
          <span className={`${styles['banner-text']}`}>{title}</span>
        </div>
        
        <div className={`${styles['movies-grid']}`}>
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMovies;
