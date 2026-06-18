import { getMovieById } from '../../../services/movieService';
import { useParams, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { Heart, Star, Play, ThumbsUp, ThumbsDown, Calendar, Clock, User, X } from 'lucide-react';
import { getArticlesByMovieId } from '../../../services/articleService';
import { getReviewsByMovieId, likeReview, dislikeReview } from '../../../services/reviewService';
import { getCachedAvatar } from '../../../services/avatarService';
import { getAllNews, getNewsByCategory } from '../../../services/newsService';
import ReviewForm from '../../components/ReviewForm/ReviewForm';
import ShowtimeSchedule from '../../components/ShowtimeSchedule/ShowtimeSchedule';
import UserProfileView from '../../components/UserProfileView/UserProfileView';
import styles from './MovieDetailPage.module.css';
import newsStyles from './NewsSection.module.css';
import { useTranslation } from 'react-i18next';
import MoviePoster3D from './MoviePoster3D';


const MovieDetailPage = () => {
  const { t } = useTranslation();

  const { movieId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('info');
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState(null);
  const [communityReviews, setCommunityReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [newsArticles, setNewsArticles] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(null);
  const [selectedNewsCategory, setSelectedNewsCategory] = useState('all');
  const [liked, setLiked] = useState(() => {
    if (typeof window !== 'undefined' && movieId) {
      return localStorage.getItem(`liked_movie_${movieId}`) === 'true';
    }
    return false;
  });
  const [disliked, setDisliked] = useState(() => {
    if (typeof window !== 'undefined' && movieId) {
      return localStorage.getItem(`disliked_movie_${movieId}`) === 'true';
    }
    return false;
  });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const reviewFormRef = React.useRef(null);
  const reviewsSectionRef = React.useRef(null);
  const bookingSectionRef = React.useRef(null);
  const [pendingScroll, setPendingScroll] = useState(null);
  // Scroll to section
  useEffect(() => {
    if (pendingScroll === 'reviews' && activeTab === 'reviews') {
      if (reviewsSectionRef.current) {
        reviewsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setPendingScroll(null);
    }
    if (pendingScroll === 'booking' && activeTab === 'booking') {
      if (bookingSectionRef.current) {
        bookingSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setPendingScroll(null);
    }
  }, [activeTab, pendingScroll]);

  // Format time ago for reviews
  const formatTimeAgo = (dateString) => {
  if (!dateString) return t('Not found');

  const now = new Date();
  const reviewDate = new Date(dateString);

  if (isNaN(reviewDate.getTime())) {
    return t('Not found');
  }

  const diffInMs = now - reviewDate;

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return t('Just now');

  if (diffInMinutes < 60) {
    return t('{{count}} minutes ago', { count: diffInMinutes });
  }

  if (diffInHours === 1) {
    return t('1 hour ago');
  }

  if (diffInHours < 24) {
    return t('{{count}} hours ago', { count: diffInHours });
  }

  if (diffInDays === 1) {
    return t('1 day ago');
  }

  if (diffInDays < 7) {
    return t('{{count}} days ago', { count: diffInDays });
  }

  if (diffInDays < 30) {
    return t('{{count}} weeks ago', { count: Math.floor(diffInDays / 7) });
  }

  return t('{{count}} months ago', { count: Math.floor(diffInDays / 30) });
};


  // Fetch community reviews from API
  const fetchCommunityReviews = async () => {
    if (!movieId) return;
    
    try {
      setReviewsLoading(true);
      setReviewsError(null);
      const reviews = await getReviewsByMovieId(movieId);
     
      const transformedReviews = reviews.map(review => ({
        id: review.id,
        userId: review.userId,
        userName: review.userName,
        rating: review.rating,
        timeAgo: formatTimeAgo(review.createdAt),
        comment: review.comment,
        likes: review.likes || 0,
        dislikes: review.dislikes || 0,
        avatar: review.userAvatar || getCachedAvatar(review.userName)
      }));
      
      setCommunityReviews(transformedReviews);
    } catch (error) {
      console.error(t('Error fetching community reviews:'), error);
      setReviewsError(t('Unable to load community reviews'));
    } finally {
      setReviewsLoading(false);
    }
  };

  // Fetch news articles
  const fetchNewsArticles = async (category = 'all') => {
    try {
      setNewsLoading(true);
      setNewsError(null);
      
      let news;
      if (category === 'all') {
        news = await getAllNews(0, 20); 
      } else {
        news = await getNewsByCategory(category);
      }
      
      setNewsArticles(news);
    } catch (error) {
      console.error(t('Error fetching news articles:'), error);
      setNewsError(t('Cannot reload news'));
    } finally {
      setNewsLoading(false);
    }
  };

  // Check URL query parameter for tab and scroll to top
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['info', 'showtimes', 'reviews', 'news', 'booking'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    window.scrollTo(0, 0);
  }, [location.search]);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const movieData = await getMovieById(movieId);
        setMovie(movieData);
      } catch (err) {
        console.error(t('Error fetching movie:'), err);
        setError(t('Unable to load movie information. Please try again later.'));
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovie();
    }
    window.scrollTo(0, 0);
  }, [movieId]);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      if (!movieId) return;
      
      try {
        setArticlesLoading(true);
        setArticlesError(null);
        const articles = await getArticlesByMovieId(movieId);
        setRelatedArticles(articles);
      } catch (err) {
        console.error(t('Error fetching related articles:'), err);
        setArticlesError(t('Unable to load related articles'));
        setRelatedArticles([]);
      } finally {
        setArticlesLoading(false);
      }
    };

    fetchRelatedArticles();
    fetchCommunityReviews();
    fetchNewsArticles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  const tabs = [
    { id: 'info', label: t('Movie info') },
    { id: 'showtimes', label: t('Showtime') },
    { id: 'reviews', label: t('Movie review') },
    { id: 'news', label: t('News') },
    { id: 'booking', label: t('Buy ticket') }
  ];

  if (loading) {
    return (
      <div className={styles['movie-detail-page']}>
        <div className={`${styles['loading-container']}`}>
          <div className={`${styles['loading-spinner']}`}></div>
          <p>{t('Loading movie information...')}</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className={styles['movie-detail-page']}>
        <div className={`${styles['error-container']}`}>
          <h2>Lỗi</h2>
          <p>{error || t('Movie information not found')}</p>
        </div>
      </div>
    );
  }

  // Helper functions to get movie details with fallbacks
  const getImageUrl = (movie) => {
    console.log('Movie data:', movie);
    let imageUrl = movie.posterUrl || movie.poster || movie.imageUrl || movie.image || '/default-movie.jpg';
    
    // Solve relative URLs
    if (imageUrl.startsWith('http') && !imageUrl.includes('localhost')) {
      console.log('External image URL detected:', imageUrl);
    }
    
    console.log('Final Image URL:', imageUrl);
    return imageUrl;
  };

  const getTitle = (movie) => {
    return movie.title || movie.name || movie.movieName || t('No title');
  };

  const getEnglishTitle = (movie) => {
    return movie.englishTitle || movie.originalTitle || movie.altTitle || '';
  };

  const getGenres = (movie) => {
    if (movie.genres && Array.isArray(movie.genres)) {
      return movie.genres.join(', ');
    }
    return movie.genre || movie.category || t('Không có thể loại');
  };

  const getDescription = (movie) => {
    return movie.description || movie.overview || movie.summary || movie.synopsis || t('Không có mô tả.');
  };

  const parseRatingNumber = (raw) => {
    if (raw === null || raw === undefined || raw === '') return null;
    const num = parseFloat(String(raw).replace(',', '.'));
    return Number.isFinite(num) ? num : null;
  };

  const toPercentFromScale = (num) => {
    if (num <= 10) return Math.round(num * 10);
    if (num <= 5) return Math.round((num / 5) * 100);
    if (num <= 100) return Math.round(num);
    return Math.round(num);
  };

  const getOfficialRatingPercent = (movie) => {
    const sources = [movie.rating, movie.score, movie.voteAverage, movie.imdbRating];
    for (const raw of sources) {
      const num = parseRatingNumber(raw);
      if (num !== null) return toPercentFromScale(num);
    }
    return null;
  };

  const getCommunityRatingPercent = (avgStr) => {
    const num = parseRatingNumber(avgStr);
    if (num === null) return null;
    return Math.round((num / 5) * 100);
  };

  const getRatingScoreDisplay = (movie, communityAvg) => {
    const official = getOfficialRatingPercent(movie);
    if (official !== null) return `${official}%`;
    const community = getCommunityRatingPercent(communityAvg);
    if (community !== null) return `${community}%`;
    return t('Không có thông tin');
  };

  const getRatingBadgeDisplay = (movie, communityAvg) => {
    const official = getOfficialRatingPercent(movie);
    if (official !== null) return `${official}%`;
    if (communityAvg) return `${communityAvg}/5`;
    return t('Không có thông tin');
  };

  const getDuration = (movie) => {
    const duration = movie.duration || movie.runtime || movie.length;
    return duration ? `${duration} ${t('minutes')}` : t('Không có thông tin');
  };

  const getReleaseDate = (movie) => {
    if (movie.releaseDate) {
      const date = new Date(movie.releaseDate);
      return date.toLocaleDateString('vi-VN');
    }
    return movie.releaseYear || movie.year || t('Không có thông tin');
  };

  const getAgeRating = (movie) => {
    return movie.ageRating || movie.ageLimit || movie.certification || t('Không có thông tin');
  };

  const getCast = (movie) => {
    if (movie.cast && Array.isArray(movie.cast)) {
      return movie.cast.join(', ');
    }
    return movie.actors || movie.starring || t('Không có thông tin');
  };

  const getDirector = (movie) => {
    if (movie.director && Array.isArray(movie.director)) {
      return movie.director.join(', ');
    }
    return movie.director || t('Không có thông tin');
  };

  // Handle like review
  const handleLikeReview = async (reviewId) => {
    try {
      await likeReview(reviewId);
      fetchCommunityReviews();
    } catch (error) {
      console.error(t('Error liking review:'), error);
    }
  };

  // Handle dislike review
  const handleDislikeReview = async (reviewId) => {
    try {
      await dislikeReview(reviewId);
      fetchCommunityReviews();
    } catch (error) {
      console.error(t('Error disliking review:'), error);
    }
  };

  const handleLikeMovie = () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    if (nextLiked) setDisliked(false);
    if (typeof window !== 'undefined' && movieId) {
      localStorage.setItem(`liked_movie_${movieId}`, String(nextLiked));
      if (nextLiked) localStorage.setItem(`disliked_movie_${movieId}`, 'false');
    }
  };

  const handleDislikeMovie = () => {
    const nextDisliked = !disliked;
    setDisliked(nextDisliked);
    if (nextDisliked) setLiked(false);
    if (typeof window !== 'undefined' && movieId) {
      localStorage.setItem(`disliked_movie_${movieId}`, String(nextDisliked));
      if (nextDisliked) localStorage.setItem(`liked_movie_${movieId}`, 'false');
    }
  };

  const averageReviewRating = communityReviews.length > 0
    ? (communityReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / communityReviews.length).toFixed(1)
    : null;

  const renderReviewActions = (review) => (
    <div className={styles['review-actions']}>
      <button
        type="button"
        className={styles['thumbs-up-btn']}
        onClick={() => handleLikeReview(review.id)}
        title={t('Thích')}
      >
        <ThumbsUp size={18} />
        <span>{review.likes}</span>
      </button>
      <button
        type="button"
        className={styles['thumbs-down-btn']}
        onClick={() => handleDislikeReview(review.id)}
        title={t('Không thích')}
      >
        <ThumbsDown size={18} />
        <span>{review.dislikes}</span>
      </button>
    </div>
  );

  const renderMovieReactionBar = () => (
    <div className={styles['movie-reaction-bar']}>
      <div className={styles['reaction-summary']}>
        <div className={styles['reaction-rating']}>
          <Star size={22} fill="currentColor" className={styles['reaction-star-icon']} />
          <span className={styles['reaction-rating-value']}>
            {getRatingBadgeDisplay(movie, averageReviewRating)}
          </span>
          {averageReviewRating && (
            <span className={styles['reaction-rating-meta']}>
              /5 · {communityReviews.length} {t('Movie review').toLowerCase()}
            </span>
          )}
        </div>
      </div>
      <div className={styles['reaction-buttons']}>
        <button
          type="button"
          className={`${styles['reaction-btn']} ${styles['reaction-like']} ${liked ? styles['reaction-active'] : ''}`}
          onClick={handleLikeMovie}
        >
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          <span>{liked ? t('liked') : t('like')}</span>
        </button>
        <button
          type="button"
          className={`${styles['reaction-btn']} ${styles['reaction-dislike']} ${disliked ? styles['reaction-active'] : ''}`}
          onClick={handleDislikeMovie}
        >
          <ThumbsDown size={20} />
          <span>{t('Không thích')}</span>
        </button>
      </div>
    </div>
  );

  // Solve button rate movie
  const handleRateMovie = () => {
    setActiveTab('reviews');
    setPendingScroll('reviews');
  };
  // Solve button buy ticket
  const handleBuyTicket = () => {
    setActiveTab('booking');
    setPendingScroll('booking');
  };

  return (
    <div className={styles['movie-detail-page']}>
      <div className={`${styles['movie-background']}`}>
        <div className={`${styles['background-overlay']}`}></div>
        <img 
          src={getImageUrl(movie)} 
          alt={getTitle(movie)}
          className={`${styles['background-image']}`}
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB2aWV3Qm94PSIwIDAgMTkyMCAxMDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiBmaWxsPSIjMWEyYTM2Ii8+Cjx0ZXh0IHg9Ijk2MCIgeT0iNTQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Nb3ZpZSBCYWNrZ3JvdW5kPC90ZXh0Pgo8L3N2Zz4K';
          }}
        />
      </div>
      <div className={styles['detail-orb-one']}></div>
      <div className={styles['detail-orb-two']}></div>
      <div className={styles['detail-orb-three']}></div>
      
      {/* Movie Header Section */}
      <div className={`${styles['movie-header']}`}>
        <div className={styles['movie-header-content']}>
          <div className={`${styles['movie-info']}`}>
            <div className={styles['movie-text-content']}>
              <div className={styles['title-row']}>
                <h1 className={`${styles['movie-title']}`} style={{color: 'white'}}>{getTitle(movie)}</h1>
                <div className={styles['movie-rating-badge']} title={t('Rating score')}>
                  <Star size={20} fill="currentColor" className={styles['rating-star-icon']} />
                  <span>{getRatingBadgeDisplay(movie, averageReviewRating)}</span>
                  {averageReviewRating && getOfficialRatingPercent(movie) !== null && (
                    <span className={styles['community-rating']}>
                      ({averageReviewRating}/5)
                    </span>
                  )}
                </div>
              </div>
              {getEnglishTitle(movie) && (
                <p className={`${styles['movie-subtitle']}`}>{getEnglishTitle(movie)} - {getGenres(movie)}</p>
              )}
              
              <div className={`${styles['action-buttons']}`}>
                <button
                  type="button"
                  className={`${styles['action-btn']} ${styles['like-btn']} ${liked ? styles['liked'] : ''}`}
                  onClick={handleLikeMovie}
                  title={liked ? t('liked') : t('like')}
                >
                  <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                  <span>{liked ? t('liked') : t('like')}</span>
                </button>
                <button
                  type="button"
                  className={`${styles['action-btn']} ${styles['dislike-btn']} ${disliked ? styles['disliked'] : ''}`}
                  onClick={handleDislikeMovie}
                  title={t('Không thích')}
                >
                  <ThumbsDown size={18} />
                  <span>{t('Không thích')}</span>
                </button>
                <button
                  type="button"
                  className={`${styles['action-btn']} ${styles['rate-btn']}`}
                  onClick={handleRateMovie}
                  title={t('Đánh giá')}
                >
                  <Star size={18} />
                  <span>{t('Đánh giá')}</span>
                </button>
                
                {movie.trailerUrl ? (
                  <button 
                    onClick={() => setShowTrailerModal(true)}
                    className={`${styles['action-btn']} ${styles['trailer-btn']}`}>
                    <span>Trailer</span>
                  </button>
                ) : (
                  <button className={`${styles['action-btn']} ${styles['trailer-btn']}`} disabled>
                  <span>Trailer</span>
                </button>
                )}
                <button 
                  className={`${styles['action-btn']} ${styles['buy-ticket-btn']}`}
                  onClick={handleBuyTicket}
                >
                  <span>{t('Mua vé')}</span>
                </button>
              </div>

              <p className={`${styles['movie-description']}`}>{getDescription(movie)}</p>

              <div className={`${styles['movie-details']}`}>
                <div className={`${styles['detail-item']}`}>
                  <div className={`${styles['detail-header']}`}>
                <Star size={16} fill="currentColor" />
                    <span>{t('Rating score')}</span>
                  </div>
                  <div className={`${styles['detail-value']}`}>
                    {getRatingScoreDisplay(movie, averageReviewRating)}
                  </div>
                </div>
                <div className={`${styles['detail-item']}`}>
                  <div className={`${styles['detail-header']}`}>
                <Calendar size={16} />
                    <span>{t('Khởi chiếu')}</span>
                  </div>
                  <div className={`${styles['detail-value']}`}>{getReleaseDate(movie)}</div>
                </div>
                <div className={`${styles['detail-item']}`}>
                  <div className={`${styles['detail-header']}`}>
                <Clock size={16} />
                    <span>{t('Thời lượng')}</span>
                  </div>
                  <div className={`${styles['detail-value']}`}>{getDuration(movie)}</div>
                </div>
                <div className={`${styles['detail-item']}`}>
                  <div className={`${styles['detail-header']}`}>
                <User size={16} />
                    <span>{t('Giới hạn tuổi')}</span>
                  </div>
                  <div className={`${styles['detail-value']}`}>{getAgeRating(movie)}</div>
                </div>
              </div>
            </div>

            <div className={styles['movie-poster']}>
              <MoviePoster3D posterUrl={getImageUrl(movie)} title={getTitle(movie)} />
            </div>

            <div className={`${styles['cast-director']}`}>
              <div className={`${styles['cast-section']}`}>
                <h4>{t('Diễn viên')}</h4>
                <p>{getCast(movie)}</p>
              </div>
              <div className={`${styles['director-section']}`}>
                <h4>{t('Đạo diễn')}</h4>
                <p>{getDirector(movie)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles['nav-tabs']}>
        <div className={`${styles['tabs-container']}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles['tab']} ${activeTab === tab.id ? styles['active'] : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles['tab-content']}>
        {activeTab === 'showtimes' && (
          <ShowtimeSchedule 
            movieId={movieId} 
            movieTitle={getTitle(movie)} 
          />
        )}

        {activeTab === 'trailer' && (
          <div className={`${styles['trailer-section']}`}>
            <div className={`${styles['video-player']}`}>
              {movie.trailerUrl ? (
                <iframe
                  src={movie.trailerUrl}
                  title={t('Movie Trailer')}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className={`${styles['no-trailer']}`}>
                  <p>{t('Chưa có trailer cho phim này')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className={`${styles['info-section']}`}>
            <div className={`${styles['movie-full-info']}`}>
              <div className={`${styles['trailer-embed-section']}`}>
                <div className={`${styles['video-player']}`}>  
                  {movie.trailerUrl ? (
                    <iframe
                      src={movie.trailerUrl}
                      title={t('Movie Trailer')}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className={`${styles['no-trailer']}`}>
                      <p>{t('Chưa có trailer cho phim này')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Related articles */}
              <div className={`${styles['related-articles']}`}>
                <h3>{t('Related articles')}</h3>
                {articlesLoading ? (
                  <div className={`${styles['loading-message']}`}>{t('Đang tải bài viết liên quan...')}</div>
                ) : articlesError ? (
                  <div className={`${styles['error-message']}`}>{articlesError}</div>
                ) : relatedArticles.length === 0 ? (
                  <div className={`${styles['no-articles-message']}`}>{t('Chưa có bài viết liên quan nào')}</div>
                ) : (
                  <div className={`${styles['articles-grid']}`}>
                    {relatedArticles.map((item) => (
                      <a className={`${styles['article-card']}`} key={item.id} href={item.href || item.url || '#'}>
                        <div className={`${styles['article-thumb']}`}>
                          <img src={item.image || item.imageUrl || '/placeholder-article.jpg'} alt={item.title} />
                        </div>
                        <div className={`${styles['article-content']}`}>
                          <h4 className={`${styles['article-title']}`}>{item.title}</h4>
                          <span className={`${styles['article-source']}`}>{item.source || item.author || 'Nguồn'}</span>
                          <p className={`${styles['article-excerpt']}`}>{item.excerpt || item.summary || item.description}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Form */}
              <ReviewForm 
                ref={reviewFormRef}
                movieId={movieId} 
                onReviewAdded={fetchCommunityReviews}
              />

              {/* Community Reviews */}
              <div className={`${styles['community-section']}`}>
                <h3>{t('Cộng đồng')}</h3>
                
                {/* Loading State */}
                {reviewsLoading && (
                  <div className={`${styles['loading-message']}`}>
                    <div className={`${styles['loading-spinner']}`}></div>
                    <p>{t('Đang tải đánh giá từ cộng đồng...')}</p>
                  </div>
                )}
                
                {/* Error State */}
                {reviewsError && (
                  <div className={`${styles['error-message']}`}>
                    <p>{reviewsError}</p>
                    <button onClick={fetchCommunityReviews} className={`${styles['retry-btn']}`}>
                      Thử lại
                    </button>
                  </div>
                )}
                
                {/* Reviews Grid*/}
                {!reviewsLoading && !reviewsError && (
                  <div className={`${styles['reviews-grid']}`}>
                    {communityReviews.length === 0 ? (
                      <div className={`${styles['no-reviews-message']}`}>
                        <p>{t('Chưa có đánh giá nào từ cộng đồng. Hãy là người đầu tiên đánh giá!')}</p>
                      </div>
                    ) : (
                      communityReviews.slice(0, 3).map((review) => (
                        <div className={`${styles['review-card']}`} key={review.id}>
                          <div className={`${styles['review-header']}`}>
                            <div className={`${styles['user-info']}`}>
                              <div 
                                className={`${styles['user-avatar']}`}
                                onClick={() => review.userId && setSelectedUserId(review.userId)}
                                style={{ cursor: review.userId ? 'pointer' : 'default' }}
                                title={review.userId ? t('Click to view profile') : ''}
                              >
                                <img 
                                  src={review.avatar || getCachedAvatar(review.userName)} 
                                  alt={review.userName}
                                  onError={(e) => {
                                    const fallback = getCachedAvatar(review.userName) || '/default-avatar.jpg';
                                    if (e.target.src !== fallback) e.target.src = fallback;
                                  }}
                                />
                              </div>
                              <div className={`${styles['user-details']}`}>
                                <span 
                                  className={`${styles['user-name']}`}
                                  onClick={() => review.userId && setSelectedUserId(review.userId)}
                                  style={{ cursor: review.userId ? 'pointer' : 'default' }}
                                  title={review.userId ? t('Click to view profile') : ''}
                                >
                                  {review.userName}
                                </span>
                                <div className={`${styles['rating-time']}`}>
                                  <Star size={16} className={`${styles['star-icon']}`} />
                                  <span className={`${styles['rating']}`}>{review.rating}</span>
                                  <span className={`${styles['time-ago']}`}>{review.timeAgo}</span>
                                </div>
                              </div>
                            </div>
                            <button className={`${styles['share-comment-btn']}`}><X size={20} /></button>
                          </div>
                          <p className={`${styles['review-comment']}`}>{review.comment}</p>
                          {renderReviewActions(review)}
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {/* View more reviews */}
                {!reviewsLoading && !reviewsError && communityReviews.length > 3 && (
                  <button 
                    className={`${styles['view-more-reviews-btn']}`}
                    onClick={() => {
                      setActiveTab('reviews');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    {t('Xem thêm các đánh giá khác')}
                  </button>
                )}

                {!reviewsLoading && !reviewsError && renderMovieReactionBar()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className={`${styles['reviews-section']}`} ref={reviewsSectionRef}>
            <h2>{t('Đánh giá từ cộng đồng')}</h2>
            
            {/* Review Form */}
            <ReviewForm 
              movieId={movieId} 
              onReviewAdded={fetchCommunityReviews}
            />
            
            {/* All Reviews */}
            <div className={`${styles['all-reviews-section']}`}>
              <h3>{t('Tất cả đánh giá')} ({communityReviews.length})</h3>
              
              {/* Loading State */}
              {reviewsLoading && (
                <div className={`${styles['loading-message']}`}>
                  <div className={`${styles['loading-spinner']}`}></div>
                  <p>{t('Đang tải đánh giá từ cộng đồng...')}</p>
                </div>
              )}

              {/* Error State */}
              {reviewsError && (
                <div className={`${styles['error-message']}`}>
                  <p>{reviewsError}</p>
                  <button onClick={fetchCommunityReviews} className={`${styles['retry-btn']}`}>
                  {t('Thử lại')}
                  </button>
                </div>
              )}

              {/* All Reviews Grid */}
              {!reviewsLoading && !reviewsError && (
                <div className={`${styles['reviews-grid']}`}>
                  {communityReviews.length === 0 ? (
                    <div className={`${styles['no-reviews-message']}`}>
                      <p>{t('Chưa có đánh giá nào từ cộng đồng. Hãy là người đầu tiên đánh giá!')}</p>
                    </div>
                  ) : (
                    communityReviews.map((review) => (
                      <div className={`${styles['review-card']}`} key={review.id}>
                        <div className={`${styles['review-header']}`}>
                          <div className={`${styles['user-info']}`}>
                            <div 
                              className={`${styles['user-avatar']}`}
                              onClick={() => review.userId && setSelectedUserId(review.userId)}
                              style={{ cursor: review.userId ? 'pointer' : 'default' }}
                              title={review.userId ? t('Click to view profile') : ''}
                            >
                              <img 
                                src={review.avatar || getCachedAvatar(review.userName)} 
                                alt={review.userName}
                                onError={(e) => {
                                  const fallback = getCachedAvatar(review.userName) || '/default-avatar.jpg';
                                  if (e.target.src !== fallback) e.target.src = fallback;
                                }}
                              />
                            </div>
                            <div className={`${styles['user-details']}`}>
                              <span 
                                className={`${styles['user-name']}`}
                                onClick={() => review.userId && setSelectedUserId(review.userId)}
                                style={{ cursor: review.userId ? 'pointer' : 'default' }}
                                title={review.userId ? t('Click to view profile') : ''}
                              >
                                {review.userName}
                              </span>
                              <div className={`${styles['rating-time']}`}>
                                <Star size={16} fill="currentColor" className={styles['star-icon']} />
                                <span className={`${styles['rating']}`}>{review.rating}</span>
                                <span className={`${styles['time-ago']}`}>{review.timeAgo}</span>
                              </div>
                            </div>
                          </div>
                          <button className={`${styles['share-comment-btn']}`}><X size={20} /></button>
                        </div>
                        <p className={`${styles['review-comment']}`}>{review.comment}</p>
                        {renderReviewActions(review)}
                      </div>
                    ))
                  )}
                </div>
              )}

              {!reviewsLoading && !reviewsError && renderMovieReactionBar()}
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className={newsStyles['news-section']}>
            <div className={newsStyles['news-header']}>
              <h2>{t('Tin tức điện ảnh')}</h2>
              <div className={newsStyles['news-filters']}>
                <button 
                  className={`${newsStyles['filter-btn']} ${selectedNewsCategory === 'all' ? newsStyles['active'] : ''}`}
                  onClick={() => {
                    setSelectedNewsCategory('all');
                    fetchNewsArticles('all');
                  }}
                >
                  {t('Tất cả')}
                </button>
                <button 
                  className={`${newsStyles['filter-btn']} ${selectedNewsCategory === 'phim' ? newsStyles['active'] : ''}`}
                  onClick={() => {
                    setSelectedNewsCategory('phim');
                    fetchNewsArticles('phim');
                  }}
                >
                  {t('Phim')}
                </button>
                <button 
                  className={`${newsStyles['filter-btn']} ${selectedNewsCategory === 'rap' ? newsStyles['active'] : ''}`}
                  onClick={() => {
                    setSelectedNewsCategory('rap');
                    fetchNewsArticles('rap');
                  }}
                >
                  {t('Rạp chiếu')}
                </button>
                <button 
                  className={`${newsStyles['filter-btn']} ${selectedNewsCategory === 'su-kien' ? newsStyles['active'] : ''}`}
                  onClick={() => {
                    setSelectedNewsCategory('su-kien');
                    fetchNewsArticles('su-kien');
                  }}
                >
                  {t('Sự kiện')}
                </button>
              </div>
            </div>

            {/* Loading State */}
            {newsLoading && (
              <div className={styles['loading-message']}>
                <div className={styles['loading-spinner']}></div>
                <p>{t('Đang tải tin tức...')}</p>
              </div>
            )}

            {/* Error State */}
            {newsError && (
              <div className={styles['error-message']}>
                <p>{newsError}</p>
                <button onClick={() => fetchNewsArticles(selectedNewsCategory)} className={styles['retry-btn']}>
                {t('Thử lại')}
                </button>
              </div>
            )}

            {/* News Grid */}
            {!newsLoading && !newsError && (
              <div className={newsStyles['news-grid']}>
                {newsArticles.length === 0 ? (
                  <div className={newsStyles['no-news-message']}>
                    <p>{t('Chưa có tin tức nào trong danh mục này')}</p>
                  </div>
                ) : (
                  newsArticles.map((article) => (
                    <div className={newsStyles['news-card']} key={article.id}>
                      <div className={newsStyles['news-image']}>
                        <img 
                          src={article.imageUrl || article.image || '/placeholder-news.jpg'} 
                          alt={article.title}
                          onError={(e) => {
                            e.target.src = '/placeholder-news.jpg';
                          }}
                        />
                        {article.featured && (
                          <div className={newsStyles['featured-badge']}>{t('Nổi bật')}</div>
                        )}
                      </div>
                      <div className={newsStyles['news-content']}>
                        <div className={newsStyles['news-meta']}>
                          <span className={newsStyles['news-category']}>{article.category || 'Tin tức'}</span>
                          <span className={newsStyles['news-date']}>
                            {article.createdAt ? formatTimeAgo(article.createdAt) : t('Không có ngày')}
                          </span>
                        </div>
                        <h3 className={newsStyles['news-title']}>{article.title}</h3>
                        <p className={newsStyles['news-excerpt']}>
                          {article.excerpt || article.summary || article.content?.substring(0, 150) + '...' || t('Không có mô tả')}
                        </p>
                        <div className={newsStyles['news-footer']}>
                          <span className={newsStyles['news-author']}>
                            {article.author || 'Biên tập viên'}
                          </span>
                          <button className={newsStyles['read-more-btn']}>
                          {t('Đọc thêm')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Load More Button */}
            {!newsLoading && !newsError && newsArticles.length > 0 && (
              <div className={newsStyles['load-more-section']}>
                <button className={newsStyles['load-more-btn']}>
                {t('Xem thêm tin tức')}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'booking' && (
          <div ref={bookingSectionRef}>
            <ShowtimeSchedule 
              movieId={movieId} 
              movieTitle={getTitle(movie)} 
            />
          </div>
        )}
      </div>

      {/* User Profile View Modal */}
      {selectedUserId && (
        <UserProfileView 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      )}

      {/* Trailer Modal */}
      {showTrailerModal && movie.trailerUrl && (
        <div className={`${styles['trailer-modal-overlay']}`} onClick={() => setShowTrailerModal(false)}>
          <div className={`${styles['trailer-modal-content']}`} onClick={(e) => e.stopPropagation()}>  
            <button 
              className={`${styles['close-modal-btn']}`} 
              onClick={() => setShowTrailerModal(false)}
            >
              
            </button>
            <div className={`${styles['modal-video-container']}`}>
              <iframe
                src={(() => {
                  let embedUrl = movie.trailerUrl;
                  if (embedUrl.includes('youtube.com/watch?v=')) {
                    const videoId = embedUrl.split('v=')[1].split('&')[0];
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                  } else if (embedUrl.includes('youtu.be/')) {
                    const videoId = embedUrl.split('youtu.be/')[1].split('?')[0];
                    embedUrl = `https://www.youtube.com/embed/${videoId}`;
                  }
                  return embedUrl;
                })()}
                title="Movie Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetailPage;
