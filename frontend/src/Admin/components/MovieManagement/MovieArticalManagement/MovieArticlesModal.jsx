import { getMovieArticles, removeArticleFromMovie, createArticle } from '../../../../services/articleService';
import { X, Plus, Search, FileText, Trash2, Calendar, User } from 'lucide-react';
import React from 'react';
import { useState, useEffect } from 'react';
import useToast from '../../../hooks/useToast';
import ToastContainer from '../../Toast/ToastContainer';
import styles from './MovieArticlesModal.module.css';
import { useTranslation } from 'react-i18next';

const MovieArticlesModal = ({ movie, onClose, onArticlesUpdated }) => {
  const [movieArticles, setMovieArticles] = useState([]);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    imageUrl: '',
    status: 'published'
  });
  const [isCreating, setIsCreating] = useState(false);
  const { showSuccess, showError, toasts, removeToast } = useToast();

  useEffect(() => {
    fetchMovieArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie]);

  const fetchMovieArticles = async () => {
    if (!movie || !movie.id) return;
    try {
      setLoading(true);
      const articles = await getMovieArticles(movie.id);
      setMovieArticles(articles);
    } catch (error) {
      console.error('Error fetching movie articles:', error);
      showError(t('Cannot load movie articles'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveArticle = async (articleId) => {
    try {
      await removeArticleFromMovie(movie.id, articleId);
      setMovieArticles(prev => prev.filter(article => article.id !== articleId));
      showSuccess(t('Article removed from movie'));
      if (onArticlesUpdated) {
        onArticlesUpdated();
      }
    } catch (error) {
      console.error('Error removing article from movie:', error);
      showError(t('Cannot remove article from movie'));
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showError(t('Please fill in all fields'));
      return;
    }

    setIsCreating(true);
    try {
      const articleData = {
        ...formData,
        movieId: movie.id,
        movieIds: [movie.id],
        isActive: true,
        isFeatured: false,
        viewCount: 0,
        likeCount: 0,
        shareCount: 0
      };

      await createArticle(articleData);
      
      // Refresh articles list
      await fetchMovieArticles();
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        author: '',
        category: '',
        imageUrl: '',
        status: 'published'
      });
      setShowCreateForm(false);
      
      showSuccess(t('Article created and linked to movie'));
      if (onArticlesUpdated) {
        onArticlesUpdated();
      }
    } catch (error) {
      console.error('Error creating article:', error);
      showError(t('Cannot create article. Please try again.'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredArticles = movieArticles.filter(article =>
    article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return t('No date');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return t('No date');
    }
  };

  if (!movie) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{t('Manage related articles')} - {movie.title}</h2>
          <button onClick={onClose} className={styles.closeButton}><X size={20} /></button>
        </div>

        <div className={styles.modalBody}>
          {/* Create Article Button */}
          <div className={styles.createArticleSection}>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className={styles.createArticleButton}
            >
              
              {showCreateForm ? t('Hide create article form') : t('Create new article')}
            </button>
          </div>

          {/* Create Article Form */}
          {showCreateForm && (
            <div className={styles.createFormContainer}>
              <h3 className={styles.createFormTitle}>{t('Create new article for movie')}</h3>
              <form onSubmit={handleCreateArticle} className={styles.createForm}>
                <div className={styles.formGroup}>
                  <label>{t('Title')} *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                    placeholder={t('Enter article title')}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t('Summary')}</label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleFormChange}
                    placeholder={t('Enter article summary')}
                    rows="3"
                    className={styles.formTextarea}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t('Content')} *</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleFormChange}
                    required
                    placeholder={t('Enter article content')}
                    rows="6"
                    className={styles.formTextarea}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t('Author')}</label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleFormChange}
                      placeholder={t('Enter author name')}
                      className={styles.formInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('Category')}</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      placeholder={t('Enter category')}
                      className={styles.formInput}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>{t('Image URL')}</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleFormChange}
                    placeholder="https://example.com/image.jpg"
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>{t('Status')}</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className={styles.formSelect}
                  >
                    <option value="draft">{t('Draft')}</option>
                    <option value="published">{t('Published')}</option>
                  </select>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className={styles.cancelButton}
                  >
                    {t('Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className={styles.submitButton}
                  >
                    {isCreating ? t('Creating...') : t('Create article')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Search */}
          <div className={styles.searchContainer}>
                <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder={t('Search articles...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Articles List */}
          <div className={styles.articlesContainer}>
            <div className={styles.articlesSection}>
              <h3>{t('Articles for this movie')} ({filteredArticles.length})</h3>
              <div className={styles.articlesList}>
                {loading ? (
                  <div className={styles.loading}>{t('Loading...')}</div>
                ) : filteredArticles.length === 0 ? (
                  <div className={styles.emptyState}>
                <FileText size={48} />
                    <p>{t('No articles yet')}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                      {t('Use the "Create article" button to add an article for this movie')}
                    </p>
                  </div>
                ) : (
                  filteredArticles.map((article) => (
                    <div key={article.id} className={styles.articleItem}>
                      <div className={styles.articleInfo}>
                        <div className={styles.articleImage}>
                          {article.imageUrl || article.image ? (
                            <img 
                              src={article.imageUrl || article.image} 
                              alt={article.title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={styles.placeholderImage}
                            style={{ display: (article.imageUrl || article.image) ? 'none' : 'flex' }}
                          >
                            
                          </div>
                        </div>
                        <div className={styles.articleDetails}>
                          <h4 className={styles.articleTitle}>{article.title}</h4>
                          <div className={styles.articleMeta}>
                            {article.category && (
                              <span className={styles.articleCategory}>{article.category}</span>
                            )}
                            {article.author && (
                              <span className={styles.articleAuthor}>
                <User size={12} />
                                {article.author}
                              </span>
                            )}
                            {article.publishedAt && (
                              <span className={styles.articleDate}>
                <Calendar size={12} />
                                {formatDate(article.publishedAt)}
                              </span>
                            )}
                          </div>
                          <p className={styles.articleExcerpt}>
                            {article.excerpt || article.summary || article.description || 
                             (article.content ? article.content.substring(0, 100) + '...' : t('No description'))}
                          </p>
                        </div>
                      </div>
                      <div className={styles.articleActions}>
                        <button
                          onClick={() => handleRemoveArticle(article.id)}
                          className={`${styles.actionButton} ${styles.removeButton}`}
                          title={t('Remove from movie')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeModalButton}>
            {t('Close')}
          </button>
        </div>

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    </div>
  );
};

export default MovieArticlesModal;
