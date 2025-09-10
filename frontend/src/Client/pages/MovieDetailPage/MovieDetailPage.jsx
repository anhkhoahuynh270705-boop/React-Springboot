import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Heart, Star, Play, ThumbsUp, Calendar, Clock, User, Share, X } from 'lucide-react';
import { getMovieById } from '../../../services/movieService';
import { getArticlesByMovieId } from '../../../services/articleService';
import { getReviewsByMovieId, likeReview, dislikeReview } from '../../../services/reviewService';
import { getCachedAvatar } from '../../../services/avatarService';
import ReviewForm from '../../components/ReviewForm/ReviewForm';
import styles from './MovieDetailPage.module.css';

const MovieDetailPage = () => {
  const { movieId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('info');
  const [selectedCity, setSelectedCity] = useState('Tp. Hồ Chí Minh');
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

  // Format time ago for reviews
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Not found';
    
    const now = new Date();
    const reviewDate = new Date(dateString);
    const diffInMs = now - reviewDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hôm nay';
    if (diffInDays === 1) return '1 ngày trước';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`;
    return `${Math.floor(diffInDays / 30)} tháng trước`;
  };

  // Fetch community reviews from API
  const fetchCommunityReviews = async () => {
    if (!movieId) return;
    
    try {
      setReviewsLoading(true);
      setReviewsError(null);
      const reviews = await getReviewsByMovieId(movieId);
      
      // Transform reviews to match frontend format
      const transformedReviews = reviews.map(review => ({
        id: review.id,
        userName: review.userName,
        rating: review.rating,
        timeAgo: formatTimeAgo(review.createdAt),
        comment: review.comment,
        likes: review.likes || 0,
        dislikes: review.dislikes || 0,
        avatar: getCachedAvatar(review.userName)
      }));
      
      setCommunityReviews(transformedReviews);
    } catch (error) {
      console.error('Error fetching community reviews:', error);
      setReviewsError('Không thể tải đánh giá từ cộng đồng');
    } finally {
      setReviewsLoading(false);
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
        console.error('Error fetching movie:', err);
        setError('Không thể tải thông tin phim. Vui lòng thử lại sau.');
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
        console.error('Error fetching related articles:', err);
        setArticlesError('Không thể tải bài viết liên quan');
        setRelatedArticles([]);
      } finally {
        setArticlesLoading(false);
      }
    };

    fetchRelatedArticles();
    fetchCommunityReviews();
  }, [movieId]);

  const tabs = [
    { id: 'info', label: 'Thông tin phim' },
    { id: 'showtimes', label: 'Lịch chiếu' },
    { id: 'reviews', label: 'Đánh giá' },
    { id: 'news', label: 'Tin tức' },
    { id: 'booking', label: 'Mua vé' }
  ];

  if (loading) {
    return (
      <div className={`${styles['movie-detail-page']}`}>
        <div className={`${styles['loading-container']}`}>
          <div className={`${styles['loading-spinner']}`}></div>
          <p>Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className={`${styles['movie-detail-page']}`}>
        <div className={`${styles['error-container']}`}>
          <h2>Lỗi</h2>
          <p>{error || 'Không tìm thấy thông tin phim'}</p>
        </div>
      </div>
    );
  }

  // Helper functions để xử lý các trường API khác nhau
  const getImageUrl = (movie) => {
    console.log('Movie data:', movie);
    let imageUrl = movie.posterUrl || movie.poster || movie.imageUrl || movie.image || '/default-movie.jpg';
    
    // Xử lý CORS cho external URLs
    if (imageUrl.startsWith('http') && !imageUrl.includes('localhost')) {
      console.log('External image URL detected:', imageUrl);
    }
    
    console.log('Final Image URL:', imageUrl);
    return imageUrl;
  };

  const getTitle = (movie) => {
    return movie.title || movie.name || movie.movieName || 'Không có tiêu đề';
  };

  const getEnglishTitle = (movie) => {
    return movie.englishTitle || movie.originalTitle || movie.altTitle || '';
  };

  const getGenres = (movie) => {
    if (movie.genres && Array.isArray(movie.genres)) {
      return movie.genres.join(', ');
    }
    return movie.genre || movie.category || 'Không có thể loại';
  };

  const getDescription = (movie) => {
    return movie.description || movie.overview || movie.summary || movie.synopsis || 'Không có mô tả.';
  };

  const getRating = (movie) => {
    return movie.rating || movie.score || movie.voteAverage || movie.imdbRating || 'N/A';
  };

  const getDuration = (movie) => {
    const duration = movie.duration || movie.runtime || movie.length;
    return duration ? `${duration} phút` : 'Không có thông tin';
  };

  const getReleaseDate = (movie) => {
    if (movie.releaseDate) {
      const date = new Date(movie.releaseDate);
      return date.toLocaleDateString('vi-VN');
    }
    return movie.releaseYear || movie.year || 'Không có thông tin';
  };

  const getAgeRating = (movie) => {
    return movie.ageRating || movie.ageLimit || movie.certification || 'Không có thông tin';
  };

  const getCast = (movie) => {
    if (movie.cast && Array.isArray(movie.cast)) {
      return movie.cast.join(', ');
    }
    return movie.actors || movie.starring || 'Không có thông tin';
  };

  const getDirector = (movie) => {
    if (movie.director && Array.isArray(movie.director)) {
      return movie.director.join(', ');
    }
    return movie.director || 'Không có thông tin';
  };





  // Handle like review
  const handleLikeReview = async (reviewId) => {
    try {
      await likeReview(reviewId);
      fetchCommunityReviews();
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  // Handle dislike review
  const handleDislikeReview = async (reviewId) => {
    try {
      await dislikeReview(reviewId);
      fetchCommunityReviews();
    } catch (error) {
      console.error('Error disliking review:', error);
    }
  };

  return (
    <div className={`${styles['movie-detail-page']}`}>
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
      
      {/* Movie Header Section */}
      <div className={`${styles['movie-header']}`}>
        <div className={`${styles['movie-header-content']}`}>
          <div className={`${styles['movie-info']}`}>
            <div className={`${styles['movie-text-content']}`}>
              <h1 className={`${styles['movie-title']}`} style={{color: 'white'}}>{getTitle(movie)}</h1>
              {getEnglishTitle(movie) && (
                <p className={`${styles['movie-subtitle']}`}>{getEnglishTitle(movie)} - {getGenres(movie)}</p>
              )}
              
              <div className={`${styles['action-buttons']}`}>
                <button className={`${styles['action-btn']} ${styles['like-btn']}`}>
                  <Heart size={16} />
                  <span>Thích</span>
                </button>
                <button className={`${styles['action-btn']} ${styles['rate-btn']}`}>
                  <Star size={16} />
                  <span>Đánh giá</span>
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
                <button className={`${styles['action-btn']} ${styles['buy-ticket-btn']}`}>
                  <span>Mua vé</span>
                </button>
              </div>

              <p className={`${styles['movie-description']}`}>{getDescription(movie)}</p>

              <div className={`${styles['movie-details']}`}>
                <div className={`${styles['detail-item']}`}>
                  <div className={`${styles['detail-header']}`}>
                    <ThumbsUp size={16} />
                    <span>Hài lòng</span>
                  </div>
                  <div className={`${styles['detail-value']}`}>{getRating(movie)}%</div>
                </div>
                <div className={`${styles['detail-item']}`}>
                  <div className={`${styles['detail-header']}`}>
                    <Calendar size={16} />
                    <span>Khởi chiếu</span>
                  </div>
                  <div className={`${styles['detail-value']}`}>{getReleaseDate(movie)}</div>
                </div>
                <div className={`${styles['detail-item']}`}>
                  <div className={`${styles['detail-header']}`}>
                    <Clock size={16} />
                    <span>Thời lượng</span>
                  </div>
                  <div className={`${styles['detail-value']}`}>{getDuration(movie)}</div>
                </div>
                <div className={`${styles['detail-item']}`}>
                  <div className={`${styles['detail-header']}`}>
                    <User size={16} />
                    <span>Giới hạn tuổi</span>
                  </div>
                  <div className={`${styles['detail-value']}`}>{getAgeRating(movie)}</div>
                </div>
              </div>
            </div>

            <div className={`${styles['movie-poster']}`}>
              <img src={getImageUrl(movie)} alt={getTitle(movie)} />
            </div>

            <div className={`${styles['cast-director']}`}>
              <div className={`${styles['cast-section']}`}>
                <h4>Diễn viên</h4>
                <p>{getCast(movie)}</p>
              </div>
              <div className={`${styles['director-section']}`}>
                <h4>Đạo diễn</h4>
                <p>{getDirector(movie)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`${styles['nav-tabs']}`}>
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
      <div className={`${styles['tab-content']}`}>
        {activeTab === 'showtimes' && (
          <div className={`${styles['showtimes-section']}`}>
            <h2>Lịch chiếu</h2>
            <p className={`${styles['instruction']}`}>
              Chọn khu vực bạn muốn xem lịch chiếu cho phim {getTitle(movie)}.
            </p>
            <div className={`${styles['city-selection']}`}>
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                placeholder="Chọn thành phố"
                className={`${styles['city-input']}`}
              />
              <button className={`${styles['view-showtimes-btn']}`}>
                Xem lịch chiếu
              </button>
            </div>
          </div>
        )}

        {activeTab === 'trailer' && (
          <div className={`${styles['trailer-section']}`}>
            <div className={`${styles['video-player']}`}>
              {movie.trailerUrl ? (
                <iframe
                  src={movie.trailerUrl}
                  title="Movie Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className={`${styles['no-trailer']}`}>
                  <p>Chưa có trailer cho phim này</p>
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
                      title="Movie Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className={`${styles['no-trailer']}`}>
                      <p>Chưa có trailer cho phim này</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Related articles */}
              <div className={`${styles['related-articles']}`}>
                <h3>Bài viết liên quan</h3>
                {articlesLoading ? (
                  <div className={`${styles['loading-message']}`}>Đang tải bài viết liên quan...</div>
                ) : articlesError ? (
                  <div className={`${styles['error-message']}`}>{articlesError}</div>
                ) : relatedArticles.length === 0 ? (
                  <div className={`${styles['no-articles-message']}`}>Chưa có bài viết liên quan nào</div>
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
                movieId={movieId} 
                onReviewAdded={fetchCommunityReviews}
              />

              {/* Community Reviews */}
              <div className={`${styles['community-section']}`}>
                <h3>Cộng đồng</h3>
                
                {/* Loading State */}
                {reviewsLoading && (
                  <div className={`${styles['loading-message']}`}>
                    <div className={`${styles['loading-spinner']}`}></div>
                    <p>Đang tải đánh giá từ cộng đồng...</p>
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

                {/* Reviews Grid - Hiển thị tối đa 3 đánh giá */}
                {!reviewsLoading && !reviewsError && (
                  <div className={`${styles['reviews-grid']}`}>
                    {communityReviews.length === 0 ? (
                      <div className={`${styles['no-reviews-message']}`}>
                        <p>Chưa có đánh giá nào từ cộng đồng. Hãy là người đầu tiên đánh giá!</p>
                      </div>
                    ) : (
                      communityReviews.slice(0, 3).map((review) => (
                        <div className={`${styles['review-card']}`} key={review.id}>
                          <div className={`${styles['review-header']}`}>
                            <div className={`${styles['user-info']}`}>
                              <div className={`${styles['user-avatar']}`}>
                                <img 
                                  src={review.avatar} 
                                  alt={review.userName}
                                  onError={(e) => {
                                    e.target.src = '/default-avatar.jpg';
                                  }}
                                />
                              </div>
                              <div className={`${styles['user-details']}`}>
                                <span className={`${styles['user-name']}`}>{review.userName}</span>
                                <div className={`${styles['rating-time']}`}>
                                  <Star size={16} className={`${styles['star-icon']}`} />
                                  <span className={`${styles['rating']}`}>{review.rating}</span>
                                  <span className={`${styles['time-ago']}`}>{review.timeAgo}</span>
                                </div>
                              </div>
                            </div>
                            <button className={`${styles['share-comment-btn']}`}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                              </svg>
                            </button>
                          </div>
                          <p className={`${styles['review-comment']}`}>{review.comment}</p>
                          <div className={`${styles['review-actions']}`}>
                            <button className={`${styles['like-btn']}`}>
                              <span className={`${styles['like-count']}`}>+{review.likes}</span>
                            </button>
                            <button 
                              className={`${styles['thumbs-up-btn']}`}
                              onClick={() => handleLikeReview(review.id)}
                              title="Thích"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                              </svg>
                            </button>
                            <button 
                              className={`${styles['thumbs-down-btn']}`}
                              onClick={() => handleDislikeReview(review.id)}
                              title="Không thích"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {/* Xem thêm đánh giá  */}
                {!reviewsLoading && !reviewsError && communityReviews.length > 3 && (
                  <button 
                    className={`${styles['view-more-reviews-btn']}`}
                    onClick={() => {
                      setActiveTab('reviews');
                      // Scroll to top khi chuyển tab
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Xem thêm các đánh giá khác
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className={`${styles['reviews-section']}`}>
            <h2>Đánh giá từ cộng đồng</h2>
            
            {/* Review Form */}
            <ReviewForm 
              movieId={movieId} 
              onReviewAdded={fetchCommunityReviews}
            />
            
            {/* All Reviews */}
            <div className={`${styles['all-reviews-section']}`}>
              <h3>Tất cả đánh giá ({communityReviews.length})</h3>
              
              {/* Loading State */}
              {reviewsLoading && (
                <div className={`${styles['loading-message']}`}>
                  <div className={`${styles['loading-spinner']}`}></div>
                  <p>Đang tải đánh giá từ cộng đồng...</p>
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

              {/* All Reviews Grid */}
              {!reviewsLoading && !reviewsError && (
                <div className={`${styles['reviews-grid']}`}>
                  {communityReviews.length === 0 ? (
                    <div className={`${styles['no-reviews-message']}`}>
                      <p>Chưa có đánh giá nào từ cộng đồng. Hãy là người đầu tiên đánh giá!</p>
                    </div>
                  ) : (
                    communityReviews.map((review) => (
                      <div className={`${styles['review-card']}`} key={review.id}>
                        <div className={`${styles['review-header']}`}>
                          <div className={`${styles['user-info']}`}>
                            <div className={`${styles['user-avatar']}`}>
                              <img 
                                src={review.avatar} 
                                alt={review.userName}
                                onError={(e) => {
                                  e.target.src = '/default-avatar.jpg';
                                }}
                              />
                            </div>
                            <div className={`${styles['user-details']}`}>
                              <span className={`${styles['user-name']}`}>{review.userName}</span>
                              <div className={`${styles['rating-time']}`}> 
                                <Star size={16} className={`${styles['star-icon']}`} />
                                <span className={`${styles['rating']}`}>{review.rating}</span>
                                <span className={`${styles['time-ago']}`}>{review.timeAgo}</span>
                              </div>
                            </div>
                          </div>
                          <button className={`${styles['share-comment-btn']}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                            </svg>
                          </button>
                        </div>
                        <p className={`${styles['review-comment']}`}>{review.comment}</p>
                        <div className={`${styles['review-actions']}`}>
                          <button className={`${styles['like-btn']}`}>
                            <span className={`${styles['like-count']}`}>+{review.likes}</span>
                          </button>
                          <button 
                            className={`${styles['thumbs-up-btn']}`}
                            onClick={() => handleLikeReview(review.id)}
                            title="Thích"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                            </svg>
                          </button>
                          <button 
                            className={`${styles['thumbs-down-btn']}`}
                            onClick={() => handleDislikeReview(review.id)}
                            title="Không thích"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && movie.trailerUrl && (
        <div className={`${styles['trailer-modal-overlay']}`} onClick={() => setShowTrailerModal(false)}>
          <div className={`${styles['trailer-modal-content']}`} onClick={(e) => e.stopPropagation()}>  
            <button 
              className={`${styles['close-modal-btn']}`} 
              onClick={() => setShowTrailerModal(false)}
            >
              <X size={24} />
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
