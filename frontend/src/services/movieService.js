import { adminFetch } from './apiClient';

export async function getMovies() {
  try {
    const res = await fetch('http://localhost:8080/api/movies');
    if (!res.ok) throw new Error('Cannot get movie list');
    return await res.json();
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw new Error('Cannot connect to server');
  }
}

export async function getMovieById(id) {
  try {
    const res = await fetch(`http://localhost:8080/api/movies/${id}`);
    if (!res.ok) throw new Error('Cannot get movie information');
    return await res.json();
  } catch (error) {
    console.error('Error fetching movie:', error);
    throw new Error('Cannot connect to server');
  }
}

// function to remove Vietnamese diacritics for search
function removeVietnameseDiacritics(str) {
  if (!str) return '';
  
  return str
    .normalize('NFD') 
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D') 
    .toLowerCase();
}

// Function to check if text contains search query 
function containsSearchQuery(text, query) {
  if (!text || !query) return false;
  
  const normalizedText = removeVietnameseDiacritics(text);
  const normalizedQuery = removeVietnameseDiacritics(query);
  
  return normalizedText.includes(normalizedQuery);
}

export async function searchMovies(query) {
  if (!query || query.trim().length < 1) {
    console.log('Query too short, skipping API call');
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    console.log('API call to search movies:', `http://localhost:8080/api/movies/search?q=${encodedQuery}`);
    
    const res = await fetch(`http://localhost:8080/api/movies/search?q=${encodedQuery}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Search API response status:', res.status);
    
    if (res.status === 400) {
      console.warn('Server returned 400');
      throw new Error('Query validation failed');
    }
    
    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Search API response data:', data);
    return data;
  } catch (error) {
    console.warn('Search API failed, using fallback:', error.message);
    
    try {
      const allMovies = await getMovies();
      const filteredMovies = allMovies.filter(movie => 
        containsSearchQuery(movie.title, query) ||
        containsSearchQuery(movie.genre, query) ||
        containsSearchQuery(movie.director, query) ||
        containsSearchQuery(movie.movieName, query) ||
        containsSearchQuery(movie.name, query) ||
        containsSearchQuery(movie.description, query) ||
        containsSearchQuery(movie.cast, query)
      );
      
      console.log(`Fallback search found ${filteredMovies.length} movies`);
      return filteredMovies;
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError);
      return [];
    }
  }
}

// CRUD operations for admin
export async function getAllMovies() {
  try {
    const res = await fetch('http://localhost:8080/api/movies');
    if (!res.ok) throw new Error('Cannot get movie list');
    return await res.json();
  } catch (error) {
    console.error('Error fetching all movies:', error);
    throw new Error('Cannot connect to server');
  }
}

export async function createMovie(movieData) {
  try {
    const res = await adminFetch('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Cannot create movie');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error creating movie:', error);
    throw error;
  }
}

export async function updateMovie(movieId, movieData) {
  try {
    const res = await adminFetch(`/movies/${movieId}`, {
      method: 'PUT',
      body: JSON.stringify(movieData),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Cannot update movie');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error updating movie:', error);
    throw error;
  }
}

export async function deleteMovie(movieId) {
  try {
    const res = await adminFetch(`/movies/${movieId}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Cannot delete movie');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw error;
  }
}

// get movies by cinema
export async function getMoviesByCinema(cinemaId) {
  try {
    const res = await fetch(`http://localhost:8080/api/movies/cinema/${cinemaId}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching movies by cinema:', error);
    throw error;
  }
}

// add movie to cinema
export async function addMovieToCinema(movieId, cinemaId) {
  try {
    const res = await adminFetch(`/movies/${movieId}/cinemas/${cinemaId}`, {
      method: 'POST',
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Cannot add movie to cinema');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error adding movie to cinema:', error);
    throw error;
  }
}

// remove movie from cinema
export async function removeMovieFromCinema(movieId, cinemaId) {
  try {
    const res = await adminFetch(`/movies/${movieId}/cinemas/${cinemaId}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Cannot remove movie from cinema');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error removing movie from cinema:', error);
    throw error;
  }
}