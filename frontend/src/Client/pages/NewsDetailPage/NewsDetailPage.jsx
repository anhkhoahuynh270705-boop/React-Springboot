import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, User, Eye, ArrowLeft, Share2, Bookmark, Tag } from 'lucide-react';
import { getNewsById, getAllNews } from '../../../services/newsService';
import styles from './NewsDetailPage.module.css'; 

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const [articleData, allArticles] = await Promise.all([
        getNewsById(id),
        getAllNews(0, 50) 
      ]);
        
      setArticle(articleData);

      const related = allArticles
        .filter(item => item.category === articleData.category && item.id !== articleData.id)
        .slice(0, 3);
      setRelatedArticles(related);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Đã sao chép link vào clipboard');
    }
  };

  const handleBookmark = () => {
    alert('Đã thêm vào danh sách đánh dấu');
  };

  if (loading) {
    return (
      <div className={`${styles['news-detail-page']}`}>
        <div className={`${styles['loading-container']}`}>
          <div className={`${styles['loading-spinner']}`}></div>
          <p>Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`${styles['news-detail-page']}`}>
        <div className={`${styles['error-container']}`}>
          <h3>Không tìm thấy bài viết</h3>
          <p>{error || 'Bài viết không tồn tại hoặc đã bị xóa'}</p>
          <button onClick={() => navigate('/news')}>
            <ArrowLeft size={16} />
            Quay lại tin tức
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles['news-detail-page']}`}>
      <div className={`${styles['news-detail-container']}`}>
        {/* Back button */}
        <div className={`${styles['news-detail-header']}`}>
          <button 
            className={`${styles['back-button']}`}
            onClick={() => navigate('/news')}
          >
            <ArrowLeft size={20} />
            Quay lại tin tức
          </button>
        </div>

        {/* Article content */}
        <article className={`${styles['news-article']}`}>
          <div className={`${styles['article-meta']}`}>
            <div className={`${styles['article-category']}`}>{article.category}</div>
            <div className={`${styles['article-date']}`}>
              <Calendar size={16} />
              {formatDate(article.publishDate)}
            </div>
            <div className={`${styles['article-views']}`}>
              <Eye size={16} />
              {article.views.toLocaleString()} lượt xem
            </div>
          </div>

          {/* Article title */}
          <h1 className={`${styles['article-title']}`}>{article.title}</h1>

          {/* Article summary */}
          <p className={`${styles['article-summary']}`}>{article.summary}</p>

          {/* Article image */}
          <div className={`${styles['article-image']}`}>
            <img 
              src={article.imageUrl} 
              alt={article.title}
              onError={(e) => {
                e.target.src = '/default-news.jpg';
              }}
            />
            {article.featured && (
              <div className={`${styles['featured-badge']}`}>Nổi bật</div>
            )}
          </div>

          {/* Article content */}
          <div 
            className={`${styles['article-content']}`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Article tags */}
          <div className={`${styles['article-tags']}`}>
            <h4>Tags:</h4>
            <div className={`${styles['tags-list']}`}>
              {article.tags.map(tag => (
                <span key={tag} className={`${styles['article-tag']}`}>
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Article footer */}
          <div className={`${styles['article-footer']}`}>
            <div className={`${styles['article-author']}`}> 
              <User size={16} />
              <span>Tác giả: {article.author}</span>
            </div>
            <div className={`${styles['article-actions']}`}>
              <button className={`${styles['action-btn']}`} onClick={handleShare}>
                <Share2 size={16} />
                Chia sẻ
              </button>
              <button className={`${styles['action-btn']}`} onClick={handleBookmark}>
                <Bookmark size={16} />
                Đánh dấu
              </button>
            </div>
          </div>
        </article>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className={`${styles['related-articles']}`}>
            <h3>Bài viết liên quan</h3>
            <div className={`${styles['related-grid']}`}>
              {relatedArticles.map(relatedArticle => (
                <div key={relatedArticle.id} className={`${styles['related-card']}`}>
                  <div className={`${styles['related-image']}`}>
                    <img 
                      src={relatedArticle.imageUrl} 
                      alt={relatedArticle.title}
                      onError={(e) => {
                        e.target.src = '/default-news.jpg';
                      }}
                    />
                  </div>
                  <div className={`${styles['related-content']}`}>
                    <div className={`${styles['related-category']}`}>{relatedArticle.category}</div>
                    <h4>
                      <Link to={`/news/${relatedArticle.id}`}>
                        {relatedArticle.title}
                      </Link>
                    </h4>
                    <p>{relatedArticle.summary}</p>
                    <div className={`${styles['related-meta']}`}>
                      <span className={`${styles['related-date']}`}> 
                        <Calendar size={12} />
                        {formatDate(relatedArticle.publishDate)}
                      </span>
                      <span className={`${styles['related-views']}`}>
                        <Eye size={12} />
                        {relatedArticle.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default NewsDetailPage;
