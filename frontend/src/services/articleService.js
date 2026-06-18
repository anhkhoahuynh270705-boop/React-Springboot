import { API_BASE_URL, adminFetch } from './apiClient';

// get all articles
export const getArticles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

// get article by id
export const getArticleById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching article:', error);
    throw error;
  }
};

// get articles by movie id
export const getArticlesByMovieId = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/movie/${movieId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles by movie:', error);
    throw error;
  }
};

// search articles by title
export const searchArticles = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/search?title=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
};

// get articles by category
export const getArticlesByCategory = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/articles/category/${category}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    throw error;
  }
};



// Get articles for a specific movie
export const getMovieArticles = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}/articles`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie articles:', error);
    throw error;
  }
};

// Add article to movie
export const addArticleToMovie = async (movieId, articleId) => {
  try {
    const response = await adminFetch(`/movies/${movieId}/articles/${articleId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding article to movie:', error);
    throw error;
  }
};

// Remove article from movie
export const removeArticleFromMovie = async (movieId, articleId) => {
  try {
    const response = await adminFetch(`/movies/${movieId}/articles/${articleId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.ok;
  } catch (error) {
    console.error('Error removing article from movie:', error);
    throw error;
  }
};

// Create a new article
export const createArticle = async (articleData) => {
  try {
    const response = await adminFetch(`/articles`, {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
};
