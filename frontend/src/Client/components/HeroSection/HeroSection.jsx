import styles from './HeroSection.module.css';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';


const CurtainIntro = lazy(() =>
  import('../CurtainIntro/CurtainIntro').catch(() => ({
    default: () => null, // fallback: skip curtain
  }))
);

const HeroSection = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const progressRef = useRef(0);
  const videoRef = useRef(null);


  // States controlled by scroll progress
  const [showCurtain, setShowCurtain] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hideWelcome, setHideWelcome] = useState(false);
  const [showTv, setShowTv] = useState(false);
  const [showBookBtn, setShowBookBtn] = useState(false);

  // Scroll to movie section below hero
  const handleBookTicket = () => {
    const moviesEl = document.querySelector('.home-3d-stage');
    if (moviesEl) {
      moviesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollableHeight = rect.height - window.innerHeight;

      // Calculate progress (0 to 1) based on current scroll position relative to container
      const currentScroll = -rect.top;
      const p = Math.min(Math.max(currentScroll / totalScrollableHeight, 0), 1);

      progressRef.current = p;

      // 1. Curtain opening progress (0.0 to 0.3)//
      setShowCurtain(p < 0.35);

      // 2. Welcome text appearance (0.15 to 0.55)
      setShowWelcome(p >= 0.12);
      setHideWelcome(p >= 0.50);

      // 3. TV Drop appearance (0.45 to 1.0)
      setShowTv(p >= 0.45);

      // 4. Book Ticket button appearance (0.75 to 1.0)
      setShowBookBtn(p >= 0.75);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once initially to set correct state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Play video only when TV is visible (user scrolled to that stage)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (showTv) {
      video.play().catch(() => { }); // catch AbortError if component unmounts fast
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [showTv]);

  return (
    <section ref={containerRef} className={styles['hero-section']}>
      <div className={styles['sticky-viewport']}>
        {/* Background */}
        <div className={styles['hero-bg']} />

        {/* Three.js curtain */}
        {showCurtain && (
          <Suspense fallback={null}>
            <CurtainIntro progressRef={progressRef} />
          </Suspense>
        )}

        {/* STEP 1: Welcome text */}
        <div className={`${styles['welcome-area']} ${showWelcome ? styles['welcome-area--visible'] : ''} ${hideWelcome ? styles['welcome-area--hidden'] : ''}`}>
          <div className={styles['hero-text']}>
            <h1 className={styles['hero-title']}>
              {t('Welcometocinema')}
            </h1>
            <p className={styles['hero-subtitle']}>
              {t('Ticketbookingplatform')}
            </p>
          </div>
          <div className={styles['hero-divider']} />
        </div>

        {/* STEP 2 & 3: TV and Book Button */}
        <div className={`${styles['tv-area']} ${showTv ? styles['tv-area--visible'] : ''}`}>
          <div className={`${styles['tv-wrapper']} ${showTv ? styles['tv-drop'] : ''}`}>
            <div className={styles['cable-left']} />
            <div className={styles['cable-right']} />

            <div className={styles['tv-frame']}>
              <div className={styles['tv-screen']}>
                <video
                  ref={videoRef}
                  className={styles['tv-video']}
                  muted loop playsInline
                >
                  <source src="/videos/cineverse_intro.mp4" type="video/mp4" />
                </video>
                <div className={styles['tv-overlay']} />
              </div>
              <div className={styles['tv-bottom']} />
            </div>
          </div>

          {/* STEP 3: Book Ticket button */}
          <div className={`${styles['book-btn-wrap']} ${showBookBtn ? styles['book-btn-wrap--visible'] : ''}`}>
            <button
              id="hero-book-ticket-btn"
              className={styles['book-btn']}
              onClick={handleBookTicket}
            >
              <span className={styles['book-btn_label']}>Book Ticket</span>
              <span className={styles['book-btn_shine']} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;