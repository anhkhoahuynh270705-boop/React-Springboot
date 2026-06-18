import { API_BASE_URL, adminFetch } from './apiClient';

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
      throw new Error(data.message || 'Cannot fetch news');
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('Cannot fetch news');
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
      throw new Error(data.message || 'Cannot fetch news article');
    }
  } catch (error) {
    console.error('Error fetching news article:', error);
    throw new Error('Cannot fetch news article');
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
      throw new Error(data.message || 'Cannot fetch featured news');
    }
  } catch (error) {
    console.error('Error fetching featured news:', error);
    throw new Error('Cannot fetch featured news');
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
      throw new Error(data.message || 'Cannot fetch news by category');
    }
  } catch (error) {
    console.error('Error fetching news by category:', error);
    throw new Error('Cannot fetch news by category');
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
      throw new Error(data.message || 'Cannot fetch news categories');
    }
  } catch (error) {
    console.error('Error fetching news categories:', error);
    throw new Error('Cannot fetch news categories');
  }
};

// Create news (Admin only)
export const createNews = async (newsData) => {
  try {
    const response = await adminFetch(`/news`, {
      method: 'POST',
      body: JSON.stringify(newsData),
    });

    const data = await response.json();

    if (data.success) {
      return data.news;
    } else {
      throw new Error(data.message || 'Cannot create news article');
    }
  } catch (error) {
    console.error('Error creating news:', error);
    throw new Error('Cannot create news article');
  }
};

// Update news (Admin only)
export const updateNews = async (id, newsData) => {
  try {
    const response = await adminFetch(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(newsData),
    });

    const data = await response.json();

    if (data.success) {
      return data.news;
    } else {
      throw new Error(data.message || 'Cannot update news article');
    }
  } catch (error) {
    console.error('Error updating news:', error);
    throw new Error('cannot update news article');
  }
};

export const deleteNews = async (id) => {
  try {
    const response = await adminFetch(`/news/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (data.success) {
      return true;
    } else {
      throw new Error(data.message || 'cannot delete news');
    }
  } catch (error) {
    console.error('Error deleting news:', error);
    throw new Error('cannot delete news');
  }
};