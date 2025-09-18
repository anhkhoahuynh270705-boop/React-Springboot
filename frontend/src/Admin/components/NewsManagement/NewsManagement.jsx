import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { getAllNews, createNews, updateNews, deleteNews } from '../../../services/newsService';
import CreateNews from '../CreateNews/CreateNews';
import NewsDetailModal from '../NewsDetailModal/NewsDetailModal';
import EditNewsModal from '../EditNewsModal/EditNewsModal';
import useToast from '../../hooks/useToast';
import ToastContainer from '../Toast/ToastContainer';
import styles from './NewsManagement.module.css';

const NewsManagement = () => {
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
      showError('Lỗi khi tải danh sách tin tức: ' + error.message);
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
    if (window.confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
      try {
        await deleteNews(newsId);
        showSuccess('Xóa tin tức thành công!');
        await fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
        showError('Xóa tin tức thất bại: ' + error.message);
      }
    }
  };

  const handleNewsCreated = (newNews) => {
    setShowCreateNews(false);
    showSuccess('Tạo tin tức thành công!');
    fetchNews();
  };

  const handleNewsUpdated = (updatedNews) => {
    setShowEditNews(false);
    setSelectedNews(null);
    showSuccess('Cập nhật tin tức thành công!');
    fetchNews();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
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
      return 'Chưa cập nhật';
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
        <p>Đang tải danh sách tin tức...</p>
      </div>
    );
  }

  return (
    <div className={styles.newsManagement}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <button 
        className={styles.createButton}
        onClick={() => setShowCreateNews(true)}
      >
        <Plus size={22} />
        Tạo tin tức
      </button>
      <br/>
      <div className={styles.newsFilters}>
        <div className={styles.searchBox}>
          <Search size={22} />
          <input
            type="text"
            placeholder="Tìm kiếm tin tức..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterBtn} ${filterType === 'all' ? styles.active : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            Tất cả
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'featured' ? styles.active : ''}`}
            onClick={() => handleFilterChange('featured')}
          >
            Nổi bật
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'normal' ? styles.active : ''}`}
            onClick={() => handleFilterChange('normal')}
          >
            Thường
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
                  {article.featured ? 'Nổi bật' : 'Thường'}
                </span>
              </div>
              <div className={styles.newsActions}>
                <button
                  className={`${styles.actionBtn} ${styles.viewBtn}`}
                  onClick={() => handleViewNews(article)}
                  title="Xem chi tiết"
                >
                  <Eye size={20} />
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={() => handleEditNews(article)}
                  title="Chỉnh sửa"
                >
                  <Edit size={20} />
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDeleteNews(article.id)}
                  title="Xóa"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className={styles.emptyState}>
          <FileText size={48} />
          <h3>Không có tin tức nào</h3>
          <p>Hãy tạo tin tức đầu tiên của bạn</p>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateNews(true)}
          >
            Tạo tin tức
          </button>
        </div>
      )}

      {/* Create News Modal */}
      {showCreateNews && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Tạo tin tức mới</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowCreateNews(false)}
              >
                <XCircle size={20} />
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
