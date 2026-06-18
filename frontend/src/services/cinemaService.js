import { adminFetch, API_BASE_URL } from './apiClient';

// Get all cinemas
export const getAllCinemas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cinemas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 0 || response.status >= 500) {
        console.warn('Cinema service unavailable, returning empty array');
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn('Network error fetching cinemas, backend may be offline. Returning empty array.');
      return [];
    }
    console.error('Error fetching cinemas:', error);

    return [];
  }
};

// Get cinema by ID
export const getCinemaById = async (cinemaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cinemas/${cinemaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 0 || response.status >= 500) {
        console.warn('Cinema service unavailable');
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn('Network error fetching cinema, backend may be offline. Returning null.');
      return null;
    }
    console.error('Error fetching cinema:', error);
    return null;
  }
};

// Get cinemas by movie
export const getCinemasByMovie = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cinemas/movie/${movieId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cinemas by movie:', error);
    throw error;
  }
};

// Create new cinema
export const createCinema = async (cinemaData) => {
  try {
    const response = await adminFetch('/cinemas', {
      method: 'POST',
      body: JSON.stringify(cinemaData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating cinema:', error);
    throw error;
  }
};

// Update cinema
export const updateCinema = async (cinemaId, cinemaData) => {
  try {
    const response = await adminFetch(`/cinemas/${cinemaId}`, {
      method: 'PUT',
      body: JSON.stringify(cinemaData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating cinema:', error);
    throw error;
  }
};

// Delete cinema
export const deleteCinema = async (cinemaId) => {
  try {
    const response = await adminFetch(`/cinemas/${cinemaId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting cinema:', error);
    throw error;
  }
};

// Add movie to cinema
export const addMovieToCinema = async (cinemaId, movieId) => {
  try {
    const response = await adminFetch(`/cinemas/${cinemaId}/movies/${movieId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding movie to cinema:', error);
    throw error;
  }
};

// Remove movie from cinema
export const removeMovieFromCinema = async (cinemaId, movieId) => {
  try {
    const response = await adminFetch(`/cinemas/${cinemaId}/movies/${movieId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error removing movie from cinema:', error);
    throw error;
  }
};

// Get movie counts for all cinemas
export const getCinemaMovieCounts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cinemas/movie-counts`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cinema movie counts:', error);
    throw error;
  }
};