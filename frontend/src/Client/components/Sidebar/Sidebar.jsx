import React, { useState } from 'react';
import { Filter, Star, Clock, Plus } from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = ({ onSelectGenre, genres, selectedGenre }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [rating, setRating] = useState(5);
  const [selectedGenres, setSelectedGenres] = useState(['Comedy', 'Drama', 'Action']);

  const handleGenreClick = (genre) => {
    onSelectGenre(genre === selectedGenre ? '' : genre);
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating === rating ? 0 : newRating);
  };

  const handlePriceChange = (e, index) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(e.target.value);
    setPriceRange(newRange);
  };

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const clearAllFilters = () => {
    setRating(0);
    setPriceRange([0, 500]);
    setSelectedGenres([]);
    onSelectGenre('');
  };

  const applyFilters = () => {
    console.log('Applying filters:', { rating, priceRange, selectedGenres });
  };

  return (
    <aside className={`${styles['sidebar']} ${isExpanded ? 'expanded' : ''}`}>
      <div className={`${styles['sidebar-section']}`}> 
        <h3 className={`${styles['sidebar-title']}`}>
          <Filter size={24} />
          Bộ lọc
        </h3>
      </div>

      {/* Genre Filter */}
      <div className={`${styles['sidebar-section']}`}>
        <div className={`${styles['genre-header']}`}>
          <h4 className={`${styles['sidebar-title']}`}>
            Thể loại ({selectedGenres.length})
          </h4>
          <button className={`${styles['add-genre-btn']}`}>
            <Plus size={16} />
          </button>
        </div>
        
        <div className={`${styles['genre-tags']}`}>
          {['Comedy', 'Drama', 'Action', 'Thriller', 'Animation', 'Fantasy', 'Cartoon'].map((genre) => (
            <span
              key={genre}
              className={`${styles['genre-tag']} ${selectedGenres.includes(genre) ? 'selected' : ''}`}
              onClick={() => handleGenreToggle(genre)}
            >
              {genre}
            </span>
          ))}
        </div>

        <div className={`${styles['genre-filters']}`}>
          {genres.map((genre) => (
            <div
              key={genre}
              className={`${styles['genre-item']} ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => handleGenreClick(genre)}
            >
              <input
                type="checkbox"
                checked={selectedGenre === genre}
                onChange={() => {}}
              />
              <label>{genre}</label>
              <span className={`${styles['genre-count']}`}>12</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className={`${styles['sidebar-section']}`}>
        <h4 className={`${styles['sidebar-title']}`}>
          <Star size={20} />
          Đánh giá
        </h4>
        <div className={`${styles['rating-options']}`}>
          {[5, 4, 3, 2, 1].map((star) => (
            <div
              key={star}
              className={`${styles['rating-option']} ${rating >= star ? 'active' : ''}`}
              onClick={() => handleRatingChange(star)}
            >
              <input
                type="radio"
                name="rating"
                checked={rating === star}
                onChange={() => {}}
              />
              <label>
                <div className={`${styles['rating-stars']}`}>
                  {[...Array(star)].map((_, i) => (
                    <Star key={i} size={16} />
                  ))}
                </div>
                {star}+
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className={`${styles['sidebar-section']}`}>
        <div className={`${styles['price-range']}`}>
          <div className={`${styles['price-range-header']}`}>
            <h4 className={styles['price-range-title']}>Khoảng giá</h4>
            <div className={`${styles['price-range-values']}`}>
              {priceRange[0]} - {priceRange[1]}
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="500"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className={`${styles['price-slider']}`}
          />
        </div>
      </div>

      {/* Duration Filter */}
      <div className={`${styles['sidebar-section']}`}>
        <h4 className={`${styles['sidebar-title']}`}>
          <Clock size={20} />
          Thời lượng
        </h4>
        <div className={`${styles['year-filters']}`}>
          <div className={`${styles['year-item']}`}>
            <input type="checkbox" id="duration-1" />
            <label htmlFor="duration-1">Dưới 90 phút</label>
          </div>
          <div className={`${styles['year-item']}`}>
            <input type="checkbox" id="duration-2" />
            <label htmlFor="duration-2">90-120 phút</label>
          </div>
          <div className={`${styles['year-item']}`}>
            <input type="checkbox" id="duration-3" />
            <label htmlFor="duration-3">Trên 120 phút</label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`${styles['action-buttons']}`}>
        <button className={`${styles['clear-filters']}`} onClick={clearAllFilters}>
          Xóa tất cả bộ lọc
        </button>
        <button className={`${styles['apply-filters']}`} onClick={applyFilters}>
          Áp dụng
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
