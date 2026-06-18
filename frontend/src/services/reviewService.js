// Service gọi API cho Reviews
import { authFetch, publicFetch } from './apiClient';

// get all reviews
export const getReviews = async () => {
  try {
    const response = await publicFetch(`/reviews`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// get review by ID
export const getReviewById = async (reviewId) => {
  try {
    const response = await publicFetch(`/reviews/${reviewId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    throw error;
  }
};

// get reviews by movie ID
export const getReviewsByMovieId = async (movieId) => {
  try {
    const response = await publicFetch(`/reviews/movie/${movieId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews by movie ID:', error);
    throw error;
  }
};

// get reviews by user ID
export const getReviewsByUserId = async (userId) => {
  try {
    const response = await publicFetch(`/reviews/user/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews by user ID:', error);
    throw error;
  }
};

// create new review
export const createReview = async (reviewData) => {
  try {
    const response = await authFetch('/reviews', {
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

// update review
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await authFetch(`/reviews/${reviewId}`, {
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

// like review
export const likeReview = async (reviewId) => {
  try {
    const response = await authFetch(`/reviews/${reviewId}/like`, {
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

// dislike review
export const dislikeReview = async (reviewId) => {
  try {
    const response = await authFetch(`/reviews/${reviewId}/dislike`, {
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

// delete review
export const deleteReview = async (reviewId) => {
  try {
    const response = await authFetch(`/reviews/${reviewId}`, {
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
