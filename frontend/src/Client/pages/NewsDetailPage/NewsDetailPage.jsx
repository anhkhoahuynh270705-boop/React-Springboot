import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Eye, ArrowLeft, Share2, Bookmark, Tag } from 'lucide-react';
import { getNewsById, getAllNews } from '../../../services/newsService';
import styles from './NewsDetailPage.module.css'; 
import { useTranslation } from 'react-i18next';

const NewsDetailPage = () => {
  const { t } = useTranslation();
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
      console.error(t('Error fetching article:'), err);
      setError(t('Can not load article'));
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
      navigator.clipboard.writeText(window.location.href);
      alert(t('Link copied to clipboard'));
    }
  };

  const handleBookmark = () => {
    alert(t('Added to bookmarks'));
  };

  if (loading) {
    return (
      <div className={`${styles['cnewsd-page']}`}>
        <div className={`${styles['cnewsd-loading-container']}`}>
          <div className={`${styles['cnewsd-loading-spinner']}`}></div>
          <p>{t('Loading article...')}</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className={`${styles['cnewsd-page']}`}>
        <div className={`${styles['cnewsd-error-container']}`}>
          <h3>{t('Article not found')}</h3>
          <p>{error || t('Article does not exist or has been deleted')}</p>
          <button onClick={() => navigate('/news')}>
            {t('Back to news')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles['cnewsd-page']}`}>
      <div className={`${styles['cnewsd-container']}`}>
        {/* Back button */}
        <div className={`${styles['cnewsd-header']}`}>
          <button 
            className={`${styles['cnewsd-back-button']}`}
            onClick={() => navigate('/news')}
          >
            <ArrowLeft size={18} />
            {t('Back to news')}
          </button>
        </div>

        {/* Article content */}
        <article className={`${styles['cnewsd-article']}`}>
          <div className={`${styles['cnewsd-article-meta']}`}>
            <div className={`${styles['cnewsd-article-category']}`}>{article.category}</div>
            <div className={`${styles['cnewsd-article-date']}`}>
              {formatDate(article.publishDate)}
            </div>
            <div className={`${styles['cnewsd-article-views']}`}>
                <Eye size={16} />
              {Number(article.views || 0).toLocaleString()} {t('views')}
            </div>
          </div>

          {/* Article title */}
          <h1 className={`${styles['cnewsd-article-title']}`}>{article.title}</h1>

          {/* Article summary */}
          <p className={`${styles['cnewsd-article-summary']}`}>{article.summary}</p>

          {/* Article image */}
          <div className={`${styles['cnewsd-article-image']}`}>
            <img 
              src={article.imageUrl} 
              alt={article.title}
              onError={(e) => {
                e.target.src = '/default-news.jpg';
              }}
            />
            {article.featured && (
              <div className={`${styles['cnewsd-featured-badge']}`}>{t('Featured')}</div>
            )}
          </div>

          {/* Article content */}
          <div 
            className={`${styles['cnewsd-article-content']}`}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Article tags */}
          <div className={`${styles['cnewsd-article-tags']}`}>
            <h4>Tags:</h4>
            <div className={`${styles['cnewsd-tags-list']}`}>
              {(article.tags || []).map(tag => (
                <span key={tag} className={`${styles['cnewsd-article-tag']}`}>
                <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Article footer */}
          <div className={`${styles['cnewsd-article-footer']}`}>
            <div className={`${styles['cnewsd-article-author']}`}> 
                <User size={16} />
              <span>{t('Author:')} {article.author}</span>
            </div>
            <div className={`${styles['cnewsd-article-actions']}`}>
              <button className={`${styles['cnewsd-action-btn']}`} onClick={handleShare}>
                <Share2 size={16} />
                {t('Share')}
              </button>
              <button className={`${styles['cnewsd-action-btn']}`} onClick={handleBookmark}>
                <Bookmark size={16} />
                {t('Bookmark')}
              </button>
            </div>
          </div>
        </article>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className={`${styles['cnewsd-related-articles']}`}>
            <h3>{t('Related articles')}</h3>
            <div className={`${styles['cnewsd-related-grid']}`}>
              {relatedArticles.map(relatedArticle => (
                <div key={relatedArticle.id} className={`${styles['cnewsd-related-card']}`}>
                  <div className={`${styles['cnewsd-related-image']}`}>
                    <img 
                      src={relatedArticle.imageUrl} 
                      alt={relatedArticle.title}
                      onError={(e) => {
                        e.target.src = '/default-news.jpg';
                      }}
                    />
                  </div>
                  <div className={`${styles['cnewsd-related-content']}`}>
                    <div className={`${styles['cnewsd-related-category']}`}>{relatedArticle.category}</div>
                    <h4>
                      <Link to={`/news/${relatedArticle.id}`}>
                        {relatedArticle.title}
                      </Link>
                    </h4>
                    <p>{relatedArticle.summary}</p>
                    <div className={`${styles['cnewsd-related-meta']}`}>
                      <span className={`${styles['cnewsd-related-date']}`}> 
                <Calendar size={12} />
                        {formatDate(relatedArticle.publishDate)}
                      </span>
                      <span className={`${styles['cnewsd-related-views']}`}>
                <Eye size={12} />
                        {Number(relatedArticle.views || 0).toLocaleString()}
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
