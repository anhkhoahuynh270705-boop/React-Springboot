import React, { useEffect, useState } from 'react';
import { getShowtimesByMovie } from '../services/showtimeService';

const ShowtimeListPage = ({ movieId, onSelectShowtime }) => {
  const [showtimes, setShowtimes] = useState([]);

  useEffect(() => {
    if (movieId) {
      getShowtimesByMovie(movieId).then(setShowtimes);
    }
  }, [movieId]);

  if (!movieId) return null;

  return (
    <div style={{padding: 24}}>
      <h3>Chọn suất chiếu</h3>
      <ul>
        {showtimes.map(showtime => (
          <li key={showtime.id} style={{margin: '8px 0'}}>
            <button onClick={() => onSelectShowtime(showtime)}>
              {showtime.startTime} - Phòng: {showtime.room}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShowtimeListPage;
