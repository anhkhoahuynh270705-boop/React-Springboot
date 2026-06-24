import axios from "axios";
import { searchMovies, getMovies } from "./movieService";

const API_URL = "http://localhost:8080/api/chat";
const getMoviesStorageKey = (userId) => `chat_movies_cache_${userId}`;

const GENRE_ALIASES = {
  animation: ['cartoon', 'animated', 'animation', 'hoạt hình'],
  action: ['action', 'hành động'],
  comedy: ['comedy', 'hài'],
  horror: ['horror', 'kinh dị'],
  romance: ['romance', 'tình cảm'],
  thriller: ['thriller'],
  fantasy: ['fantasy', 'kỳ ảo'],
  adventure: ['adventure', 'phiêu lưu'],
  drama: ['drama', 'chính kịch'],
  documentary: ['documentary', 'tài liệu'],
  history: ['history', 'lịch sử', 'cổ trang'],
  war: ['war', 'chiến tranh'],
  sciFi: ['sci-fi', 'science fiction', 'khoa học viễn tưởng']
};

const getRequestedGenre = (message) => {
  const lowerMessage = message.toLowerCase();

  for (const [genreKey, aliases] of Object.entries(GENRE_ALIASES)) {
    if (aliases.some(alias => lowerMessage.includes(alias))) {
      return genreKey;
    }
  }

  return null;
};

const getMovieText = (movie) => {
  const genres = Array.isArray(movie.genres) ? movie.genres.join(' ') : '';

  return `
    ${movie.title || ''}
    ${movie.name || ''}
    ${movie.movieName || ''}
    ${movie.genre || ''}
    ${movie.category || ''}
    ${genres}
    ${movie.description || ''}
  `.toLowerCase();
};

const movieMatchesGenre = (movie, genreKey) => {
  const text = getMovieText(movie);
  const aliases = GENRE_ALIASES[genreKey] || [];

  return aliases.some(alias => text.includes(alias));
};
// sendMessage sends a message to the chat API and returns the response
export const sendMessage = async (message, userId) => {
  try {
    const res = await axios.post(API_URL, {
      message,
      userId
    });

    return res.data.reply;
  } catch (err) {
    console.error("Lỗi gọi API ChatGPT:", err);
    throw err;
  }
};

// sendMessageWithMovies sends a message and includes movie suggestions
export const sendMessageWithMovies = async (message, userId) => {
  try {
    const res = await axios.post(API_URL, {
      message,
      userId
    });

    const reply = res.data.reply;

    let movies = [];

    const requestedGenre = getRequestedGenre(message);

    if (requestedGenre) {
      try {
        const allMovies = await getMovies();

        movies = allMovies.filter(movie =>
          movieMatchesGenre(movie, requestedGenre)
        );
      } catch (err) {
        console.warn("Failed to filter movies by genre:", err);
      }
    } else {
      const movieKeywords = extractMovieKeywords(message);

      if (movieKeywords.length > 0) {
        for (const keyword of movieKeywords) {
          try {
            const searchResults = await searchMovies(keyword);

            if (searchResults && searchResults.length > 0) {
              movies = [...movies, ...searchResults];
            }
          } catch (err) {
            console.warn(`Search failed for keyword "${keyword}":`, err);
          }
        }
      }
    }

    const uniqueMovies = movies
      .filter((movie, index, self) =>
        index === self.findIndex(m =>
          (m.id || m._id || m.movieId) === (movie.id || movie._id || movie.movieId)
        )
      )
      .slice(0, 5);

    if (uniqueMovies.length > 0 && userId) {
      try {
        const storageKey = getMoviesStorageKey(userId);
        const moviesCache = JSON.parse(localStorage.getItem(storageKey) || "{}");
        const cacheKey = message.trim().toLowerCase();

        moviesCache[cacheKey] = {
          movies: uniqueMovies,
          reply: reply.substring(0, 100),
          timestamp: Date.now()
        };

        localStorage.setItem(storageKey, JSON.stringify(moviesCache));
      } catch (err) {
        console.warn("Failed to save movies to localStorage:", err);
      }
    }



    return {
      reply,
      movies: uniqueMovies
    };

  } catch (err) {
    console.error("Lỗi gọi API ChatGPT:", err);
    throw err;
  }
};

// Extract movie-related keywords from message
const extractMovieKeywords = (message) => {
  const keywords = [];
  const lowerMessage = message.toLowerCase();

  // Common movie genres in Vietnamese and English
  const genres = [
    'hành động', 'action',
    'tình cảm', 'romance',
    'kinh dị', 'horror',
    'thriller',
    'hài', 'comedy',
    'khoa học viễn tưởng', 'sci-fi', 'science fiction',
    'fantasy',
    'phiêu lưu', 'adventure',
    'animation', 'animated', 'cartoon', 'hoạt hình',
    'drama', 'chính kịch',
    'tài liệu', 'documentary',
    'cổ trang', 'lịch sử', 'history',
    'war', 'chiến tranh'
  ];

  // Check for genre mentions
  genres.forEach(genre => {
    if (lowerMessage.includes(genre)) {
      keywords.push(genre);
    }
  });

  // Extract quoted movie names or titles
  const quoteMatch = message.match(/"([^"]+)"/);
  if (quoteMatch) {
    keywords.push(quoteMatch[1]);
  }

  // If no specific keywords found, extract key words (3+ characters)
  if (keywords.length === 0) {
    return [];
  }

  return keywords;
};

export const getChatHistory = async (userId) => {
  if (!userId) return [];

  try {
    const res = await axios.get(`${API_URL}/history`, {
      params: { userId }
    });

    const history = res.data;

    try {
      const storageKey = getMoviesStorageKey(userId);
      const moviesCache = JSON.parse(localStorage.getItem(storageKey) || "{}");

      const historyWithMovies = history.map((msg, index) => {
        let matchedMovies = null;

        if ((msg.sender === "bot" || (msg.role && msg.role !== "user")) && index > 0) {
          const prevMsg = history[index - 1];

          if (prevMsg.sender === "user" || (prevMsg.role && prevMsg.role === "user")) {
            const userMessage = (prevMsg.message || prevMsg.content || "")
              .trim()
              .toLowerCase();

            if (moviesCache[userMessage]) {
              matchedMovies = moviesCache[userMessage].movies;
            }
          }
        }

        return {
          ...msg,
          movies: matchedMovies
        };
      });

      return historyWithMovies;
    } catch (cacheErr) {
      console.warn("Failed to load movies from cache:", cacheErr);
      return history;
    }
  } catch (err) {
    console.error("Failed to load chat history:", err);
    return [];
  }
};
