import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import './MovieSuggestionCard.css';
import { useTranslation } from "react-i18next";

const MovieSuggestionCard = ({ movie, onMovieClick }) => {
  const { t } = useTranslation();
  const getImageUrl = (movie) => {
    return movie.posterUrl || movie.poster || movie.imageUrl || movie.image || '/default-movie.jpg';
  };
  const getMovieId = (movie) => {
  return movie.id || movie._id || movie.movieId;
};
  const getTitle = (movie) => {
    return movie.title || movie.name || movie.movieName || 'Unknown Title';
  };

  const getGenre = (movie) => {
    if (movie.genres && Array.isArray(movie.genres)) {
      return movie.genres.join(', ');
    }
    return movie.genre || movie.category || 'Unknown';
  };

  const getDuration = (movie) => {
    return movie.duration || movie.runtime || movie.length || 'N/A';
  };

  const getRating = (movie) => {
    return movie.rating || movie.score || movie.voteAverage || movie.imdbRating || 'N/A';
  };
  const movieId = getMovieId(movie);

  return (
    <Link to={`/movie/${movieId}`} className="movie-suggestion-card"  onClick={onMovieClick}>
      <div className="movie-poster-container">
        <img
          src={getImageUrl(movie)}
          alt={getTitle(movie)}
          className="movie-poster"
          onError={(e) => {
            e.target.src = '/default-movie.jpg';
          }}
        />
        <div className="movie-overlay">
          <div className="movie-rating">
            <span>{getRating(movie)}</span>
          </div>
        </div>
      </div>
      <div className="movie-info">
        <h4 className="movie-title">{getTitle(movie)}</h4>
        <p className="movie-genre">{getGenre(movie)}</p>
        <div className="movie-meta">
          <span className="movie-duration">
            <Clock size={12} />
            {getDuration(movie)} {t('minutes')}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default MovieSuggestionCard;
