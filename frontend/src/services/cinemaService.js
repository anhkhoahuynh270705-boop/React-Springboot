const API_BASE_URL = 'http://localhost:8080/api';

// Get all cinemas
export const getAllCinemas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cinemas`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cinemas:', error);
    throw error;
  }
};

// Get cinema by ID
export const getCinemaById = async (cinemaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cinemas/${cinemaId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cinema:', error);
    throw error;
  }
};

// Search cinemas
export const searchCinemas = async (searchParams) => {
  try {
    const queryParams = new URLSearchParams();
    if (searchParams.name) queryParams.append('name', searchParams.name);
    if (searchParams.city) queryParams.append('city', searchParams.city);
    if (searchParams.status) queryParams.append('status', searchParams.status);
    
    const response = await fetch(`${API_BASE_URL}/cinemas/search?${queryParams}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching cinemas:', error);
    throw error;
  }
};

// Get active cinemas
export const getActiveCinemas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cinemas/active`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching active cinemas:', error);
    throw error;
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
    const response = await fetch(`${API_BASE_URL}/cinemas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_BASE_URL}/cinemas/${cinemaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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
    const response = await fetch(`${API_BASE_URL}/cinemas/${cinemaId}`, {
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
    const response = await fetch(`${API_BASE_URL}/cinemas/${cinemaId}/movies/${movieId}`, {
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
    const response = await fetch(`${API_BASE_URL}/cinemas/${cinemaId}/movies/${movieId}`, {
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