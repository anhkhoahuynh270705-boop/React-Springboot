const API_BASE_URL = 'http://localhost:8080/api';

// Get all showtimes
export const getShowtimes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/showtimes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    throw error;
  }
};

export const getShowtimesByMovie = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/showtimes?movieId=${movieId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (Array.isArray(data)) {
      const filteredData = data.filter(showtime => 
        showtime.movieId === movieId || showtime.movieId === movieId.toString()
      );
      return filteredData;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching showtimes by movie (query param):', error);

    try {
      const response = await fetch(`${API_BASE_URL}/showtimes/movie/${movieId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (Array.isArray(data)) {
        const filteredData = data.filter(showtime => 
          showtime.movieId === movieId || showtime.movieId === movieId.toString()
        );
        return filteredData;
      }
      
      return data;
    } catch (fallbackError) {
      return [];
    }
  }
};

// Get showtime by ID
export const getShowtimeById = async (showtimeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/showtimes/${showtimeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Create new showtime
export const createShowtime = async (showtimeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/showtimes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(showtimeData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating showtime:', error);
    throw error;
  }
};

// Update showtime
export const updateShowtime = async (showtimeId, showtimeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/showtimes/${showtimeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(showtimeData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating showtime:', error);
    throw error;
  }
};

// Delete showtime
export const deleteShowtime = async (showtimeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/showtimes/${showtimeId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting showtime:', error);
    throw error;
  }
};
