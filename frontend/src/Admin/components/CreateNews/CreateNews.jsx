import React, { useState } from 'react';
import { createNews } from '../../../services/newsService';
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
      
      alert('Tạo tin tức thành công!');
    } catch (error) {
      setError(error.message || 'Có lỗi xảy ra khi tạo tin tức');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles['create-news-overlay']}`}> 
      <div className={`${styles['create-news-modal']}`}>
        <div className={`${styles['create-news-header']}`}>
          <h2>Tạo tin tức mới</h2>
          <button className={styles['close-btn']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={`${styles['create-news-form']}`}>
          {error && <div className={styles['error-message']}>{error}</div>}
          
          <div className={`${styles['form-group']}`}>
            <label htmlFor="title">Tiêu đề *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Nhập tiêu đề tin tức"
            />
          </div>

          <div className={`${styles['form-group']}`}>
            <label htmlFor="summary">Tóm tắt *</label>
            <textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              required
              rows="3"
              placeholder="Nhập tóm tắt tin tức"
            />
          </div>

          <div className={`${styles['form-group']}`}>
            <label htmlFor="content">Nội dung *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows="8"
              placeholder="Nhập nội dung chi tiết"
            />
          </div>

          <div className={`${styles['form-row']}`}>
            <div className={`${styles['form-group']}`}>
              <label htmlFor="author">Tác giả *</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                placeholder="Tên tác giả"
              />
            </div>

            <div className={`${styles['form-group']}`}>
              <label htmlFor="category">Danh mục *</label>  
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Chọn danh mục</option>
                <option value="Phim ảnh">Phim ảnh</option>
                <option value="Giải trí">Giải trí</option>
                <option value="Công nghệ">Công nghệ</option>
                <option value="Thể thao">Thể thao</option>
                <option value="Du lịch">Du lịch</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div className={`${styles['form-group']}`}>
            <label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Ví dụ: phim, điện ảnh, giải trí"
            />
          </div>

          <div className={`${styles['form-group']}`}>
            <label htmlFor="imageUrl">URL hình ảnh</label>
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
              <span>Tin tức nổi bật</span>
            </label>
          </div>

          <div className={`${styles['form-actions']}`}>
            <button type="button" onClick={onClose} className={styles['btn-cancel']}> 
              Hủy
            </button>
            <button type="submit" className={`${styles['btn-submit']}`} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo tin tức'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNews;
