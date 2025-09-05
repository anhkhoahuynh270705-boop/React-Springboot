import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard/MovieCard';
import { getMovies } from '../services/movieService';

const MovieListPage = ({ onSelectMovie }) => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getMovies().then(setMovies);
  }, []);

  return (
    <div style={{padding: 24}}>
      <h2>Danh sách phim</h2>
      <div style={{display: 'flex', flexWrap: 'wrap'}}>
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} onClick={() => onSelectMovie(movie)} />
        ))}
      </div>
    </div>
  );
};

export default MovieListPage;
