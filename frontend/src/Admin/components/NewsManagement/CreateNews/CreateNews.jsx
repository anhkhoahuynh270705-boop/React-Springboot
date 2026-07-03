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
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear inline error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
    }

    if (!formData.summary.trim()) {
      newErrors.summary = 'Tóm tắt không được để trống';
    } else if (formData.summary.trim().length < 10) {
      newErrors.summary = 'Tóm tắt phải có ít nhất 10 ký tự';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Nội dung không được để trống';
    } else if (formData.content.trim().length < 20) {
      newErrors.content = 'Nội dung phải có ít nhất 20 ký tự';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Tên tác giả không được để trống';
    }

    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }

    if (formData.imageUrl && !/^https?:\/\/.+/.test(formData.imageUrl.trim())) {
      newErrors.imageUrl = 'URL hình ảnh không hợp lệ (phải bắt đầu bằng http:// hoặc https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

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
      setErrors({});
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
              placeholder="Type your news title"
              style={errors.title ? { borderColor: '#ef4444' } : {}}
            />
            {errors.title && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.title}</span>}
          </div>

          <div className={`${styles['form-group']}`}>
            <label htmlFor="summary">Summary *</label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows="3"
              placeholder="Type summary news"
              style={errors.summary ? { borderColor: '#ef4444' } : {}}
            />
            {errors.summary && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.summary}</span>}
          </div>

          <div className={`${styles['form-group']}`}>
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="8"
              placeholder="Type content in details"
              style={errors.content ? { borderColor: '#ef4444' } : {}}
            />
            {errors.content && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.content}</span>}
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
                placeholder="Author name"
                style={errors.author ? { borderColor: '#ef4444' } : {}}
              />
              {errors.author && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.author}</span>}
            </div>

            <div className={`${styles['form-group']}`}>
              <label htmlFor="category">Category *</label>  
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={errors.category ? { borderColor: '#ef4444' } : {}}
              >
                <option value="">Choose Category</option>
                <option value="Phim ảnh">Film</option>
                <option value="Giải trí">Entertainment</option>
                <option value="Công nghệ">Technology</option>
                <option value="Thể thao">Sport</option>
                <option value="Du lịch">Travel</option>
                <option value="Khác">Others</option>
              </select>
              {errors.category && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.category}</span>}
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
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              style={errors.imageUrl ? { borderColor: '#ef4444' } : {}}
            />
            {errors.imageUrl && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.imageUrl}</span>}
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
