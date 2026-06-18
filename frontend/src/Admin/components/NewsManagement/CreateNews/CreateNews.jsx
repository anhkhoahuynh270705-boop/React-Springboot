import React, { useState } from 'react';
import { createNews } from '../../../../services/newsService';
import styles from './CreateNews.module.css';

const CreateNews = ({ onNewsCreated, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    author: '',
    category: '',
    tags: '',
    imageUrl: '',
    featured: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const newsData = {
        ...formData,
        tags: tagsArray
      };

      const createdNews = await createNews(newsData);
      
      if (onNewsCreated) {
        onNewsCreated(createdNews);
      }
      
      // Reset form
      setFormData({
        title: '',
        summary: '',
        content: '',
        author: '',
        category: '',
        tags: '',
        imageUrl: '',
        featured: false
      });
    } catch (error) {
      setError(error.message || 'An error occurred while creating the news article.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles['create-news-overlay']}`}> 
      <div className={`${styles['create-news-modal']}`}>
        <div className={`${styles['create-news-header']}`}>
          <h2>Create News</h2>
          <button className={styles['close-btn']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={`${styles['create-news-form']}`}>
          {error && <div className={styles['error-message']}>{error}</div>}
          
          <div className={`${styles['form-group']}`}>
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Type your news title"
            />
          </div>

          <div className={`${styles['form-group']}`}>
            <label htmlFor="summary">Summary *</label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Type summary news"
            />
          </div>

          <div className={`${styles['form-group']}`}>
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="8"
              placeholder="Type content in details"
            />
          </div>

          <div className={`${styles['form-row']}`}>
            <div className={`${styles['form-group']}`}>
              <label htmlFor="author">Author *</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                placeholder="Author name"
              />
            </div>

            <div className={`${styles['form-group']}`}>
              <label htmlFor="category">Category *</label>  
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Choose Category</option>
                <option value="Phim ảnh">Film</option>
                <option value="Giải trí">Entertainment</option>
                <option value="Công nghệ">Technology</option>
                <option value="Thể thao">Sport</option>
                <option value="Du lịch">Travel</option>
                <option value="Khác">Others</option>
              </select>
            </div>
          </div>

          <div className={`${styles['form-group']}`}>
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Examples: movies, cinema, entertainment"
            />
          </div>

          <div className={`${styles['form-group']}`}>
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className={`${styles['form-group']} ${styles['checkbox-group']}`}>
            <label className={`${styles['checkbox-label']}`}>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              <span className={`${styles['checkmark']}`}></span>
              <span>Featured News</span>
            </label>
          </div>

          <div className={`${styles['form-actions']}`}>
            <button type="button" onClick={onClose} className={styles['btn-cancel']}> 
              Cancel
            </button>
            <button type="submit" className={`${styles['btn-submit']}`} disabled={loading}>
              {loading ? 'Creating...' : 'Create News'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNews;
