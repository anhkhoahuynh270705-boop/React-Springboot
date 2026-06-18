/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Eye, Search, Filter, Clock, Tag } from 'lucide-react';
import { getAllNews, getNewsCategories } from '../../../services/newsService';
import styles from './NewsPage.module.css';
import { useTranslation } from 'react-i18next';

const NewsPage = () => {
  const { t } = useTranslation();
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
      console.error(t('Error fetching news:'), err);
      setError(t('Unable to load news'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getNewsCategories();
      setCategories(data);
    } catch (err) {
      console.error(t('Error fetching categories:'), err);
    }
  };

  // Function to remove Vietnamese diacritics for search
  const removeVietnameseDiacritics = (str) => {
    if (!str) return '';

    return str
      .normalize('NFD') //
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase();
  };

  // Function to check if text contains search querye
  const containsSearchQuery = (text, query) => {
    if (!text || !query) return false;

    const normalizedText = removeVietnameseDiacritics(text);
    const normalizedQuery = removeVietnameseDiacritics(query);

    return normalizedText.includes(normalizedQuery);
  };

  const filterAndSortArticles = () => {
    let filtered = [...articles];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(article =>
        containsSearchQuery(article.title, searchQuery) ||
        containsSearchQuery(article.summary, searchQuery) ||
        containsSearchQuery(article.content, searchQuery) ||
        (article.tags || []).some(tag => containsSearchQuery(tag, searchQuery))
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
      <div className={`${styles['cnews-page']}`}>
        <div className={`${styles['cnews-loading-container']}`}>
          <div className={`${styles['cnews-loading-spinner']}`}></div>
          <p>{t('Loading news...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles['cnews-page']}`}>
        <div className={`${styles['cnews-error-container']}`}>
          <p>{error}</p>
          <button onClick={fetchNews} className={`${styles['cnews-retry-btn']}`}>{t('Retry')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles['cnews-page']}`}>
      <div className={`${styles['cnews-container']}`}>
        <div className={`${styles['cnews-header']}`}>
          <h1>{t('CGV HAK News')}</h1>
          <p>{t('Stay updated with the latest news on movies, cinemas, and promotions')}</p>
        </div>

        {/* Filters */}
        <div className={`${styles['cnews-filters']}`}>
          <div className={`${styles['cnews-search-box']}`}>
            <Search size={20} />
            <input
              type="text"
              placeholder={t('Search news...')}
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>

          <div className={`${styles['cnews-filter-controls']}`}>
            <div className={`${styles['cnews-filter-group']}`}>
              <Filter size={16} />
              <select value={selectedCategory} onChange={handleCategoryChange}>
                <option value="all">{t('All categories')}</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className={`${styles['cnews-filter-group']}`}>
              <Clock size={16} />
              <select value={sortBy} onChange={handleSortChange}>
                <option value="newest">{t('Latest')}</option>
                <option value="oldest">{t('Oldest')}</option>
                <option value="most_viewed">{t('Most viewed')}</option>
                <option value="title">{t('By name')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className={`${styles['cnews-results']}`}>
          <p>{t('Find')} {filteredArticles.length} {t('article')}</p>
        </div>

        {/* Articles Grid */}
        <div className={`${styles['cnews-articles-grid']}`}>
          {filteredArticles.map(article => (
            <article key={article.id} className={`${styles['cnews-news-card']}`}>
              <div className={`${styles['cnews-news-card-image']}`}>
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  onError={(e) => {
                    e.target.src = '/default-news.jpg';
                  }}
                />
                {article.featured && (
                  <div className={`${styles['cnews-featured-badge']}`}>{t('Outstanding')}</div>
                )}
              </div>

              <div className={`${styles['cnews-news-card-content']}`}>
                <div className={`${styles['cnews-news-card-meta']}`}>
                  <div className={`${styles['cnews-news-category']}`}>{article.category}</div>
                  <div className={`${styles['cnews-news-date']}`}>
                    <Calendar size={14} />
                    {formatDate(article.publishDate)}
                  </div>
                </div>

                <h2 className={`${styles['cnews-news-card-title']}`}>
                  <Link to={`/news/${article.id}`}>{article.title}</Link>
                </h2>

                <p className={`${styles['cnews-news-card-summary']}`}>{article.summary}</p>

                <div className={`${styles['cnews-news-card-tags']}`}>
                  {(article.tags || []).slice(0, 3).map(tag => (
                    <span key={tag} className={`${styles['cnews-news-tag']}`}>
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className={`${styles['cnews-news-card-footer']}`}>
                  <div className={`${styles['cnews-news-author']}`}>
                    <User size={14} />
                    {article.author}
                  </div>
                  <div className={`${styles['cnews-news-views']}`}>
                    <Eye size={14} />
                    {Number(article.views || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* No results */}
        {filteredArticles.length === 0 && (
          <div className={`${styles['cnews-no-results']}`}>
            <h3>{t('No posts found')}</h3>
            <p>{t('Please try searching with different keywords or selecting a different category.')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
