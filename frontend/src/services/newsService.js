const API_BASE_URL = 'http://localhost:8080/api';

// Get all news articles
export const getAllNews = async (page = 0, size = 10, category = null, featured = null, search = null) => {
  try {
    let url = `${API_BASE_URL}/news?page=${page}&size=${size}`;
    
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (featured !== null) url += `&featured=${featured}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.news;
    } else {
      throw new Error(data.message || 'Không thể tải tin tức');
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('Không thể kết nối đến server tin tức');
  }
};

// Get news by ID
export const getNewsById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.news;
    } else {
      throw new Error(data.message || 'Không tìm thấy bài viết');
    }
  } catch (error) {
    console.error('Error fetching news article:', error);
    throw new Error('Không thể tải bài viết');
  }
};

// Get featured news
export const getFeaturedNews = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/featured`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.news;
    } else {
      throw new Error(data.message || 'Không thể tải tin tức nổi bật');
    }
  } catch (error) {
    console.error('Error fetching featured news:', error);
    throw new Error('Không thể tải tin tức nổi bật');
  }
};

// Get news by category
export const getNewsByCategory = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/category/${encodeURIComponent(category)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.news;
    } else {
      throw new Error(data.message || 'Không thể tải tin tức theo danh mục');
    }
  } catch (error) {
    console.error('Error fetching news by category:', error);
    throw new Error('Không thể tải tin tức theo danh mục');
  }
};

// Search news
export const searchNews = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.news;
    } else {
      throw new Error(data.message || 'Không thể tìm kiếm tin tức');
    }
  } catch (error) {
    console.error('Error searching news:', error);
    throw new Error('Không thể tìm kiếm tin tức');
  }
};

// Get news categories
export const getNewsCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.categories;
    } else {
      throw new Error(data.message || 'Không thể tải danh mục tin tức');
    }
  } catch (error) {
    console.error('Error fetching news categories:', error);
    throw new Error('Không thể tải danh mục tin tức');
  }
};

// Get popular news
export const getPopularNews = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/popular`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.news;
    } else {
      throw new Error(data.message || 'Không thể tải tin tức phổ biến');
    }
  } catch (error) {
    console.error('Error fetching popular news:', error);
    throw new Error('Không thể tải tin tức phổ biến');
  }
};

// Get recent news
export const getRecentNews = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/recent`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.news;
    } else {
      throw new Error(data.message || 'Không thể tải tin tức gần đây');
    }
  } catch (error) {
    console.error('Error fetching recent news:', error);
    throw new Error('Không thể tải tin tức gần đây');
  }
};

// Create news (Admin only)
export const createNews = async (newsData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newsData),
    });

    const data = await response.json();

    if (data.success) {
      return data.news;
    } else {
      throw new Error(data.message || 'Không thể tạo tin tức');
    }
  } catch (error) {
    console.error('Error creating news:', error);
    throw new Error('Không thể tạo tin tức');
  }
};

// Update news (Admin only)
export const updateNews = async (id, newsData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newsData),
    });

    const data = await response.json();

    if (data.success) {
      return data.news;
    } else {
      throw new Error(data.message || 'Không thể cập nhật tin tức');
    }
  } catch (error) {
    console.error('Error updating news:', error);
    throw new Error('Không thể cập nhật tin tức');
  }
};

export const deleteNews = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return true;
    } else {
      throw new Error(data.message || 'Không thể xóa tin tức');
    }
  } catch (error) {
    console.error('Error deleting news:', error);
    throw new Error('Không thể xóa tin tức');
  }
};