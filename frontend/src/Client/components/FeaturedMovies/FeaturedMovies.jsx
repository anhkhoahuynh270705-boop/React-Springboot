import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FeaturedMovies.module.css';
import { useTranslation } from 'react-i18next';

// Lazy-load CinemaTunnel
const CinemaTunnel = lazy(() =>
  import('./CinemaTunnel').catch(() => ({
    default: ({ onComplete }) => { onComplete(); return null; }
  }))
);

const FeaturedMovies = ({ movies, title = 'Now Showing' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState({});
  const [sectionIntersected, setSectionIntersected] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);
  const [tunnelActive, setTunnelActive] = useState(false);

  const cardsRef = useRef(null);
  const sectionRef = useRef(null);

  // Trigger tunnel animation when movies/tab changes
  useEffect(() => {
    setCurrentIndex(0);
    setFlippedCards({});
    if (hasBeenSeen) {
      setTunnelActive(true);
      setSectionIntersected(false);
    }
  }, [movies]); // eslint-disable-line react-hooks/exhaustive-deps

  // IntersectionObserver to start the tunnel when first scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenSeen(true);
          setTunnelActive(true);
          observer.disconnect(); // trigger once on scroll
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleTunnelComplete = () => {
    setTunnelActive(false);
    setSectionIntersected(true);
  };

  const getPosterUrl = (movie) =>
    movie?.posterUrl || movie?.poster || movie?.imageUrl || movie?.image || '/default-movie.jpg';

  const getTitle = (movie) =>
    movie?.title || movie?.name || movie?.movieName || 'Unknown Movie';

  const getSubtitle = (movie) =>
    movie?.englishTitle || movie?.originalTitle || movie?.genre || 'Cinema Movie';

  const getId = (movie, idx) =>
    movie?.id || movie?._id || movie?.movieId || `card-${idx}`;

  const handleFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleViewDetail = (e, movie) => {
    e.stopPropagation();
    const movieId = movie?.id || movie?._id || movie?.movieId;
    if (movieId) navigate(`/movie/${movieId}`);
  };

  const handleNext = () => {
    if (!movies || currentIndex + 3 >= movies.length) return;
    setCurrentIndex((i) => i + 3);
    setFlippedCards({});
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => Math.max(0, i - 3));
    setFlippedCards({});
  };

  if (!movies || movies.length === 0) {
    return (
      <section className={styles.featuredMovies}>
        <div className={styles.emptyState}>
          <h2>{title}</h2>
          <p>{t('NoMoviesToDisplay')}</p>
        </div>
      </section>
    );
  }

  const visibleMovies = movies.slice(currentIndex, currentIndex + 3);
  const canPrev = currentIndex > 0;
  const canNext = currentIndex + 3 < movies.length;
  const totalGroups = Math.ceil(movies.length / 3);
  const currentGroup = Math.floor(currentIndex / 3);

  return (
    <section className={styles.featuredMovies}>

      {/* CARDS SECTION WITH CINEMA TUNNEL */}
      <div id="featured-cards" ref={sectionRef} className={styles.cardsSection}>
        {tunnelActive && (
          <Suspense fallback={null}>
            <CinemaTunnel onComplete={handleTunnelComplete} />
          </Suspense>
        )}

        {/* Content wrapper fades in after tunnel completes */}
        <div className={`${styles.cardsContent} ${tunnelActive ? styles.contentHidden : styles.contentVisible}`}>
          {/* Section heading */}
          <div className={styles.sectionHeading}>
            <p className={styles.headingLabel}>Choose Your Movie</p>
            <h2 className={styles.headingTitle}>{title}</h2>
            <div className={styles.headingLine} />
          </div>
          <div className={styles.sliderRow}>
            {/* Previous button */}
            <button
              className={`${styles.navBtn} ${!canPrev ? styles.navBtnDisabled : ''}`}
              onClick={handlePrev}
              disabled={!canPrev}
            >
              <span className={styles.navBtnLabel}>Previous</span>
            </button>

            {/* Cards grid */}
            <div className={styles.cardsGrid} ref={cardsRef}>
              {visibleMovies.map((movie, idx) => {
                const id = getId(movie, currentIndex + idx);
                const isFlipped = !!flippedCards[id];
                return (
                  <div
                    key={id}
                    style={{ '--card-index': idx }}
                    className={`${styles.cardContainer} ${isFlipped ? styles.flippedContainer : ''}`}
                  >
                    {/* Card wrapper which flips when clicked */}
                    <div
                      className={`${styles.card} ${isFlipped ? styles.cardFlipped : ''} ${sectionIntersected ? styles.revealed : ''}`}
                      onClick={() => handleFlip(id)}
                    >
                      <div className={styles.cardInner}>
                        {/* Face-down (cover) */}
                        <div className={`${styles.cardFace} ${styles.cardCover}`}>
                          <div className={styles.coverBorder}>
                            <div className={styles.coverGem} />
                            <div className={styles.coverDiamondTop} />
                            <div className={styles.coverDiamondBot} />
                            <p className={styles.coverLabel}>K&amp;L</p>
                            <small className={styles.coverHint}>Click to reveal</small>
                          </div>
                        </div>

                        {/* Face-up */}
                        <div className={`${styles.cardFace} ${styles.cardDetail}`}>
                          <img
                            src={getPosterUrl(movie)}
                            alt={getTitle(movie)}
                            className={styles.detailImg}
                            onError={(e) => { e.currentTarget.src = '/default-movie.jpg'; }}
                          />
                          <div className={styles.detailGradient} />
                          <div className={styles.detailInfo}>
                            <h3 className={styles.detailTitle}>{getTitle(movie)}</h3>
                            <p className={styles.detailSub}>{getSubtitle(movie)}</p>
                            <div className={styles.detailMeta}>
                              {movie?.duration && <span>{movie.duration} min</span>}
                              {movie?.ageRating && <span>{movie.ageRating}</span>}
                              {movie?.genre && <span>{movie.genre}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* View Detail Button Outside */}
                    <div className={`${styles.cardAction} ${isFlipped ? styles.actionVisible : ''}`}>
                      <button
                        className={styles.viewBtnOutside}
                        onClick={(e) => handleViewDetail(e, movie)}
                      >
                        View Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next button */}
            <button
              className={`${styles.navBtn} ${!canNext ? styles.navBtnDisabled : ''}`}
              onClick={handleNext}
              disabled={!canNext}
            >
              <span className={styles.navBtnLabel}>Next</span>
            </button>
          </div>

          {/* Dot pagination */}
          <div className={styles.dots}>
            {Array.from({ length: totalGroups }).map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === currentGroup ? styles.dotActive : ''}`}
                onClick={() => { setCurrentIndex(i * 3); setFlippedCards({}); }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMovies;