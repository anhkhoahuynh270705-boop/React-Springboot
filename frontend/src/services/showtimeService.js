const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to format showtime data for API
export const formatShowtimeForAPI = (showtimeData) => {
  const formatted = {
    movieId: showtimeData.movieId,
    movieName: showtimeData.movieName || 'Unknown Movie',
    cinemaId: showtimeData.cinemaId,
    cinemaName: showtimeData.cinemaName || 'Unknown Cinema',
    startTime: showtimeData.startTime,
    room: showtimeData.room || 'Phòng 1',
    totalSeats: Number(showtimeData.totalSeats) || 100,
    availableSeats: Number(showtimeData.availableSeats) || 100,
    price: Number(showtimeData.price) || 80000,
    format: showtimeData.format || '2D'
  };
  
  // Ensure startTime is in proper ISO format
  if (formatted.startTime && !formatted.startTime.includes('T')) {
    formatted.startTime = new Date(formatted.startTime).toISOString();
  }
  
  return formatted;
};

// Get all showtimes
export const getAllShowtimes = async () => {
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
    console.error('Error fetching showtime:', error);
    throw error;
  }
};

// Get showtimes by movie ID
export const getShowtimesByMovie = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/showtimes/movie/${movieId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching showtimes by movie:', error);
    throw error;
  }
};

// Get showtimes by cinema ID
export const getShowtimesByCinema = async (cinemaId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/showtimes/cinema/${cinemaId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching showtimes by cinema:', error);
    throw error;
  }
};

// Get showtimes by cinema and movie
export const getShowtimesByCinemaAndMovie = async (cinemaId, movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/showtimes/cinema/${cinemaId}/movie/${movieId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching showtimes by cinema and movie:', error);
    throw error;
  }
};

// Get showtimes by date and cinema
export const getShowtimesByDateAndCinema = async (cinemaId, date) => {
  try {
    const response = await fetch(`${API_BASE_URL}/showtimes/cinema/${cinemaId}/date/${date}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching showtimes by date and cinema:', error);
    throw error;
  }
};

// Create new showtime
export const createShowtime = async (showtimeData) => {
  try {
    const formattedData = formatShowtimeForAPI(showtimeData);
    console.log('Sending showtime data to server:', formattedData);
    
    const response = await fetch(`${API_BASE_URL}/showtimes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Showtime created successfully:', data);
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

// Helper function to format date for API
export const formatDateForAPI = (date) => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  return date;
};

// Helper function to format datetime for API (LocalDateTime format)
export const formatDateTimeForAPI = (dateTime) => {
  if (dateTime instanceof Date) {
    return dateTime.toISOString().replace('Z', '').replace(/\.\d{3}$/, ''); // YYYY-MM-DDTHH:mm:ss
  }
  return dateTime;
};

// Helper function to format time for display
export const formatTimeForDisplay = (dateTimeString) => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to format date for display
export const formatDateForDisplay = (dateTimeString) => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to check if showtime is in the past
export const isShowtimeInPast = (dateTimeString) => {
  if (!dateTimeString) return true;
  const showtimeDate = new Date(dateTimeString);
  const now = new Date();
  return showtimeDate < now;
};