/* eslint-disable no-unused-vars */
import { getAllNews, deleteNews } from '../../../../services/newsService';
import React from 'react';
import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  X
} from 'lucide-react';
import CreateNews from '../CreateNews/CreateNews';
import NewsDetailModal from '../NewsDetailModal/NewsDetailModal';
import EditNewsModal from '../EditNewsModal/EditNewsModal';
import useToast from '../../../hooks/useToast';
import { useTranslation } from 'react-i18next';
import ToastContainer from '../../Toast/ToastContainer';
import styles from './NewsManagement.module.css';

const NewsManagement = () => {
  const { t } = useTranslation();
  const { showSuccess, showError, toasts, removeToast } = useToast();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateNews, setShowCreateNews] = useState(false);
  const [showNewsDetail, setShowNewsDetail] = useState(false);
  const [showEditNews, setShowEditNews] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const newsData = await getAllNews();
      setNews(newsData);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const filteredNews = news.filter(article => {

    // Filter by search term
    const matchesSearch = searchTerm === '' ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by type
    if (filterType === 'featured') {
      return matchesSearch && article.featured === true;
    } else if (filterType === 'normal') {
      return matchesSearch && article.featured === false;
    }

    // Show all if no filter selected
    return matchesSearch;
  });

  const handleViewNews = (article) => {
    setSelectedNews(article);
    setShowNewsDetail(true);
  };

  const handleEditNews = (article) => {
    setSelectedNews(article);
    setShowEditNews(true);
  };

  const handleDeleteNews = async (newsId) => {
    if (window.confirm('Are you sure you want to delete this news??')) {
      try {
        await deleteNews(newsId);
        showSuccess('Delete news successfully!');
        await fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
      }
    }
  };

  const handleNewsCreated = (newNews) => {
    setShowCreateNews(false);
    showSuccess('Create news successfully!');
    fetchNews();
  };

  const handleNewsUpdated = (updatedNews) => {
    setShowEditNews(false);
    setSelectedNews(null);
    showSuccess('Update news successfully!');
    fetchNews();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not yet updated';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Not yet updated';
    }
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading news list...</p>
      </div>
    );
  }

  return (
    <div className={styles.newsManagement}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className={styles.controls} style={{ marginBottom: '16px' }}>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateNews(true)}
          style={{ marginBottom: 0 }}
        >
          <Plus size={18} />
          Create News
        </button>
        <button
          className={styles.refreshButton}
          onClick={fetchNews}
          title={t('Refresh')}
        >
          <RefreshCw size={18} />
        </button>
      </div>
      <div className={styles.newsFilters}>
        <div className={styles.searchBox}>
          <Search size={22} />
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filterType === 'all' ? styles.active : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'featured' ? styles.active : ''}`}
            onClick={() => handleFilterChange('featured')}
          >
            Featured
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'normal' ? styles.active : ''}`}
            onClick={() => handleFilterChange('normal')}
          >
            Normal
          </button>
        </div>
      </div>

      <div className={styles.newsGrid}>
        {filteredNews.map((article) => (
          <div key={article.id} className={styles.newsCard}>
            <div className={styles.newsImage}>
              {article.imageUrl ? (
                <img src={article.imageUrl} alt={article.title} />
              ) : (
                <div className={styles.placeholderImage}>
                  <FileText size={48} />
                </div>
              )}
            </div>
            <div className={styles.newsContent}>
              <h3 className={styles.newsTitle}>{article.title}</h3>
              <p className={styles.newsExcerpt}>
                {truncateContent(article.content)}
              </p>
              <div className={styles.newsMeta}>
                <span className={styles.newsDate}>
                  {formatDate(article.createdAt)}
                </span>
                <span className={`${styles.newsStatus} ${article.featured ? styles.featured : styles.normal}`}>
                  {article.featured ? 'Featured' : 'Normal'}
                </span>
              </div>
              <div className={styles.newsActions}>
                <button
                  className={`${styles.actionBtn} ${styles.viewBtn}`}
                  onClick={() => handleViewNews(article)}
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={() => handleEditNews(article)}
                  title="Edit"
                >
                  <Edit size={18} />
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDeleteNews(article.id)}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className={styles.emptyState}>

          <h3>No news available</h3>
          <p>Create your first news item</p>
          <button
            className={styles.createButton}
            onClick={() => setShowCreateNews(true)}
          >
            Create News
          </button>
        </div>
      )}

      {/* Create News Modal */}
      {showCreateNews && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Create New News</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowCreateNews(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <CreateNews
                onNewsCreated={handleNewsCreated}
                onClose={() => setShowCreateNews(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* News Detail Modal */}
      {showNewsDetail && selectedNews && (
        <NewsDetailModal
          news={selectedNews}
          onClose={() => {
            setShowNewsDetail(false);
            setSelectedNews(null);
          }}
          onEdit={handleEditNews}
        />
      )}

      {/* Edit News Modal */}
      {showEditNews && selectedNews && (
        <EditNewsModal
          news={selectedNews}
          onNewsUpdated={handleNewsUpdated}
          onClose={() => {
            setShowEditNews(false);
            setSelectedNews(null);
          }}
        />
      )}
    </div>
  );
};

export default NewsManagement;
