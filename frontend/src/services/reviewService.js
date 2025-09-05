// Service gọi API cho Reviews
const API_BASE_URL = 'http://localhost:8080/api';

// Lấy tất cả reviews
export const getReviews = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Lấy review theo ID
export const getReviewById = async (reviewId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    throw error;
  }
};

// Lấy reviews theo movie ID
export const getReviewsByMovieId = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/movie/${movieId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews by movie ID:', error);
    throw error;
  }
};

// Lấy reviews theo user ID
export const getReviewsByUserId = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/user/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews by user ID:', error);
    throw error;
  }
};

// Lấy reviews theo movie ID và rating
export const getReviewsByMovieIdAndRating = async (movieId, rating) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/movie/${movieId}/rating/${rating}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews by movie ID and rating:', error);
    throw error;
  }
};

// Lấy số lượng reviews theo movie ID
export const getReviewCountByMovieId = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/movie/${movieId}/count`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching review count by movie ID:', error);
    throw error;
  }
};

// Lấy số lượng reviews theo movie ID và rating
export const getReviewCountByMovieIdAndRating = async (movieId, rating) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/movie/${movieId}/rating/${rating}/count`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching review count by movie ID and rating:', error);
    throw error;
  }
};

// Tạo review mới
export const createReview = async (reviewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Cập nhật review
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Like review
export const likeReview = async (reviewId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/like`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error liking review:', error);
    throw error;
  }
};

// Dislike review
export const dislikeReview = async (reviewId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}/dislike`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error disliking review:', error);
    throw error;
  }
};

// Xóa review
export const deleteReview = async (reviewId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};
