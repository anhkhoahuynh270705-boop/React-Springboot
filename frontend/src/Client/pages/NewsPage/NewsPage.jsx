import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Eye, Search, Filter, Clock, Tag } from 'lucide-react';
import { getAllNews, getNewsByCategory, searchNews, getNewsCategories } from '../../../services/newsService';
import styles from './NewsPage.module.css';

const NewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterAndSortArticles();
  }, [articles, searchQuery, selectedCategory, sortBy]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getAllNews(0, 50); 
      setArticles(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Không thể tải tin tức');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getNewsCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const filterAndSortArticles = () => {
    let filtered = [...articles];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishDate) - new Date(a.publishDate);
        case 'oldest':
          return new Date(a.publishDate) - new Date(b.publishDate);
        case 'most_viewed':
          return b.views - a.views;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredArticles(filtered);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={ `${styles['news-page']}`}> 
        <div className={ `${styles['loading-container']}`}>
          <div className={ `${styles['loading-spinner']}`}></div>
          <p>Đang tải tin tức...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={ `${styles['news-page']}`}>
        <div className={ `${styles['error-container']}`}>
          <p>{error}</p>
          <button onClick={fetchNews} className={ `${styles['retry-btn']}`}>Thử lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className={ `${styles['news-page']}`}>
      <div className={ `${styles['news-container']}`}>
        {/* Header */}
        <div className={ `${styles['news-header']}`}>
          <h1>Tin Tức CGV HAK</h1>
          <p>Cập nhật những tin tức mới nhất về phim ảnh, rạp chiếu và ưu đãi</p>
        </div>

        {/* Filters */}
        <div className={ `${styles['news-filters']}`}>
          <div className={ `${styles['search-box']}`}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm tin tức..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className={ `${styles['filter-controls']}`}>
            <div className={ `${styles['filter-group']}`}>
              <Filter size={16} />
              <select value={selectedCategory} onChange={handleCategoryChange}>
                <option value="all">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

              <div className={ `${styles['filter-group']}`}>  
              <Clock size={16} />
              <select value={sortBy} onChange={handleSortChange}>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="most_viewed">Xem nhiều nhất</option>
                <option value="title">Theo tên</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className={ `${styles['news-results']}`}>
          <p>Tìm thấy {filteredArticles.length} bài viết</p>
        </div>

        {/* Articles Grid */}
        <div className={ `${styles['articles-grid']}`}>
          {filteredArticles.map(article => (
            <article key={article.id} className={ `${styles['news-card']}`}>
              <div className={ `${styles['news-card-image']}`}>
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  onError={(e) => {
                    e.target.src = '/default-news.jpg';
                  }}
                />
                {article.featured && (
                  <div className={ `${styles['featured-badge']}`}>Nổi bật</div>
                )}
              </div>

              <div className={ `${styles['news-card-content']}`}>
                <div className={ `${styles['news-card-meta']}`}>
                  <div className={ `${styles['news-category']}`}>{article.category}</div>
                  <div className={ `${styles['news-date']}`}>
                    <Calendar size={14} />
                    {formatDate(article.publishDate)}
                  </div>
                </div>

                <h2 className={ `${styles['news-card-title']}`}>
                  <Link to={`/news/${article.id}`}>{article.title}</Link>
                </h2>

                <p className={ `${styles['news-card-summary']}`}>{article.summary}</p>

                <div className={ `${styles['news-card-tags']}`}>
                  {article.tags.slice(0, 3).map(tag => (
                    <span key={tag} className={ `${styles['news-tag']}`}>
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className={ `${styles['news-card-footer']}`}>
                  <div className={ `${styles['news-author']}`}>
                    <User size={14} />
                    {article.author}
                  </div>
                  <div className={ `${styles['news-views']}`}>
                    <Eye size={14} />
                    {article.views.toLocaleString()}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* No results */}
        {filteredArticles.length === 0 && (
          <div className={ `${styles['no-results']}`}> 
            <h3>Không tìm thấy bài viết nào</h3>
            <p>Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
