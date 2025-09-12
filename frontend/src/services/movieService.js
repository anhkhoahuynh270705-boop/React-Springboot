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