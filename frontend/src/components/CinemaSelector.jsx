import React from 'react';

const CinemaSelector = ({ cinemas, onSelectCinema }) => (
  <div style={{ marginBottom: 16 }}>
    <label htmlFor="cinema" style={{ marginRight: 8 }}>Chọn rạp:</label>
    <select id="cinema" onChange={(e) => onSelectCinema(e.target.value)} style={{ padding: 8, borderRadius: 4 }}>
      <option value="">Tất cả</option>
      {cinemas.map((cinema) => (
        <option key={cinema.id} value={cinema.id}>
          {cinema.name} - {cinema.address}
        </option>
      ))}
    </select>
  </div>
);

export default CinemaSelector;
