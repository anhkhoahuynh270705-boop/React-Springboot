// Service gọi API cho Movie
export async function getMovies() {
  try {
    const res = await fetch('http://localhost:8080/api/movies');
    if (!res.ok) throw new Error('Không thể lấy danh sách phim');
    return await res.json();
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw new Error('Không thể kết nối đến server');
  }
}

export async function getMovieById(id) {
  try {
    const res = await fetch(`http://localhost:8080/api/movies/${id}`);
    if (!res.ok) throw new Error('Không thể lấy thông tin phim');
    return await res.json();
  } catch (error) {
    console.error('Error fetching movie:', error);
    throw new Error('Không thể kết nối đến server');
  }
}

// Function to remove Vietnamese diacritics for search
function removeVietnameseDiacritics(str) {
  if (!str) return '';
  
  return str
    .normalize('NFD') // Decompose characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Handle đ/Đ specifically
    .toLowerCase();
}

// Function to check if text contains search query (case-insensitive, diacritic-insensitive)
function containsSearchQuery(text, query) {
  if (!text || !query) return false;
  
  const normalizedText = removeVietnameseDiacritics(text);
  const normalizedQuery = removeVietnameseDiacritics(query);
  
  return normalizedText.includes(normalizedQuery);
}

export async function searchMovies(query) {
  if (!query || query.trim().length < 2) {
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
      console.warn('Server returned 400, likely query validation failed, using fallback');
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
    if (!res.ok) throw new Error('Không thể lấy danh sách phim');
    return await res.json();
  } catch (error) {
    console.error('Error fetching all movies:', error);
    throw new Error('Không thể kết nối đến server');
  }
}

export async function createMovie(movieData) {
  try {
    const res = await fetch('http://localhost:8080/api/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movieData)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể tạo phim');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error creating movie:', error);
    throw error;
  }
}

export async function updateMovie(movieId, movieData) {
  try {
    const res = await fetch(`http://localhost:8080/api/movies/${movieId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(movieData)
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể cập nhật phim');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error updating movie:', error);
    throw error;
  }
}

export async function deleteMovie(movieId) {
  try {
    const res = await fetch(`http://localhost:8080/api/movies/${movieId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể xóa phim');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw error;
  }
}

// Lấy danh sách phim theo rạp chiếu
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

// Thêm phim vào rạp chiếu
export async function addMovieToCinema(movieId, cinemaId) {
  try {
    const res = await fetch(`http://localhost:8080/api/movies/${movieId}/cinemas/${cinemaId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể thêm phim vào rạp chiếu');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error adding movie to cinema:', error);
    throw error;
  }
}

// Xóa phim khỏi rạp chiếu
export async function removeMovieFromCinema(movieId, cinemaId) {
  try {
    const res = await fetch(`http://localhost:8080/api/movies/${movieId}/cinemas/${cinemaId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể xóa phim khỏi rạp chiếu');
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error removing movie from cinema:', error);
    throw error;
  }
}