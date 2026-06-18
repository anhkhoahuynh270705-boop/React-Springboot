import styles from './NewsDetailModal.module.css';

import { Calendar, User, Eye, Tag, X } from 'lucide-react';
const NewsDetailModal = ({ news, onClose, onEdit }) => {
  if (!news) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatContent = (content) => {
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className={`${styles['news-detail-paragraph']}`}>
        {paragraph}
      </p>
    ));
  };

  return (
    <div className={`${styles['news-detail-overlay']}`}>
      <div className={styles['news-detail-modal']}>
        <div className={`${styles['news-detail-header']}`}>
          <div className={styles['news-detail-title-section']}>
            <h2>{news.title}</h2>
            <div className={`${styles['news-detail-meta']}`}>
              <div className={styles['news-detail-meta-item']}>
                <span>{news.author}</span>
              </div>
              <div className={`${styles['news-detail-meta-item']}`}>
                <span>{formatDate(news.createdAt)}</span>
              </div>
              <div className={`${styles['news-detail-meta-item']}`}>
                <span>{news.views || 0} View</span>
              </div>
            </div>
          </div>
          <div className={`${styles['news-detail-actions']}`}>
            <button 
              className={`${styles['news-detail-edit-btn']}`}
              onClick={() => onEdit(news)}
              title="Edit"
            >
              Edit
            </button>
            <button 
              className={`${styles['news-detail-close-btn']}`}
              onClick={onClose}
              title="Close"
            >Close</button>
          </div>
        </div>

        <div className={`${styles['news-detail-content']}`}>
          <div className={`${styles['news-detail-image']}`}>  
            {news.imageUrl ? (
              <img 
                src={news.imageUrl} 
                alt={news.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`${styles['news-detail-no-image']}`}
              style={{ display: news.imageUrl ? 'none' : 'flex' }}
            >
              <div className={`${styles['no-image-content']}`}>
                <p>No image available</p>
              </div>
            </div>
          </div>

            <div className={`${styles['news-detail-info']}`}>
            <div className={`${styles['news-detail-category']}`}>
              <span className={`${styles['category-badge']} ${news.featured ? styles['featured'] : styles['normal']}`}>   
                {news.category}
                {news.featured && 'Featured'}
              </span>
            </div>

            <div className={`${styles['news-detail-summary']}`}>
              <h3>Summary</h3>
              <p>{news.summary}</p>
            </div>

            {news.tags && news.tags.length > 0 && (
              <div className={`${styles['news-detail-tags']}`}>
                <h3>Tags</h3>
                <div className={`${styles['tags-container']}`}>
                  {news.tags.map((tag, index) => (
                    <span key={index} className={`${styles['tag-item']}`}>
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={`${styles['news-detail-body']}`}>
              <h3>Content</h3>
              <div className={`${styles['news-detail-text']}`}>
                {formatContent(news.content)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailModal;
