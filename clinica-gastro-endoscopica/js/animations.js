/* ============================================================
   CLÍNICA GASTRO ENDOSCÓPICA – Premium Animations
   animations.js | Vanilla JS | No frameworks
   ============================================================ */

'use strict';

/* ─── a) Scroll Progress Bar ─────────────────────────────── */
(function initScrollProgress() {
  const scrollBar = document.getElementById('scroll-progress');
  if (!scrollBar) return;

  function updateProgress() {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const pct          = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollBar.style.width = Math.min(pct, 100) + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress(); // run once on load in case page starts scrolled
})();


/* ─── b) Loading Screen ──────────────────────────────────── */
(function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  function hideLoading() {
    screen.classList.add('loading-hidden');
    setTimeout(() => {
      screen.style.display = 'none';
    }, 700);
  }

  if (document.readyState === 'complete') {
    // Page already loaded (e.g., hard refresh with cache)
    setTimeout(hideLoading, 400);
  } else {
    window.addEventListener('load', () => {
      setTimeout(hideLoading, 300);
    });
  }
})();


/* ─── c) Counter Animation ───────────────────────────────── */
(function initCounters() {
  /**
   * Formats a number: if >= 1000, inserts commas.
   * @param {number} n
   * @returns {string}
   */
  function formatNumber(n) {
    return n >= 1000
      ? n.toLocaleString('en-US')
      : String(n);
  }

  /**
   * Animates a single counter element from 0 to target.
   * @param {HTMLElement} el      - The element to update
   * @param {number}      target  - Final numeric value
   * @param {number}      duration - Animation duration in ms
   * @param {string}      suffix  - Text appended after number (e.g. '+')
   */
  function animateCounter(el, target, duration, suffix) {
    duration = duration || 2000;
    suffix   = suffix   || '';

    // Special case: year-style numbers animate faster
    if (target >= 1900 && target <= new Date().getFullYear()) {
      duration = 1400;
    }

    const startTime = performance.now();
    const startVal  = 0;

    function step(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);

      el.textContent = formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatNumber(target) + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  // Observe all [data-counter] elements
  const counterEls = document.querySelectorAll('[data-counter]');
  if (!counterEls.length) return;

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el      = entry.target;
        const target  = parseInt(el.dataset.counter, 10);
        const suffix  = el.dataset.suffix !== undefined ? el.dataset.suffix : '';
        const dur     = parseInt(el.dataset.duration, 10) || 2000;

        if (!isNaN(target)) {
          animateCounter(el, target, dur, suffix);
        }

        // Only animate once
        counterObserver.unobserve(el);

        // Mark parent stat-item as visible for CSS transition
        const statItem = el.closest('.stat-item');
        if (statItem) statItem.classList.add('stat-visible');
      });
    },
    { threshold: 0.25, rootMargin: '0px 0px -40px 0px' }
  );

  counterEls.forEach(el => counterObserver.observe(el));

  // Also trigger stat-item reveal via a separate observer for stagger
  const statItems = document.querySelectorAll('.stat-item');
  if (statItems.length) {
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, idx) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.style.transitionDelay = (idx * 0.08) + 's';
          el.classList.add('stat-visible');
          statObserver.unobserve(el);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -30px 0px' }
    );
    statItems.forEach(el => statObserver.observe(el));
  }
})();


/* ─── d) Parallax on Hero Image ─────────────────────────── */
(function initHeroParallax() {
  // Skip on mobile and if user prefers reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  if (window.innerWidth < 768) return;

  const heroBg = document.querySelector('.hero-bg-img');
  if (!heroBg) return;

  let ticking = false;

  function applyParallax() {
    // Subtle: 0.18 factor keeps motion gentle
    const offset = window.scrollY * 0.18;
    heroBg.style.transform = `scale(1.04) translateY(${offset}px)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive: true });
})();


/* ─── e) Timeline Reveal with Stagger ───────────────────── */
(function initTimelineReveal() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (!timelineItems.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // Show all immediately without animation
    timelineItems.forEach(item => item.classList.add('tl-visible'));
    return;
  }

  const tlObserver = new IntersectionObserver(
    (entries) => {
      // Sort by DOM order for consistent stagger
      entries
        .filter(e => e.isIntersecting)
        .forEach((entry, idx) => {
          const el = entry.target;
          const itemIndex = [...timelineItems].indexOf(el);
          const delay = itemIndex * 0.12; // stagger each item by 120ms

          el.style.transitionDelay = delay + 's';
          el.classList.add('tl-visible');
          tlObserver.unobserve(el);
        });
    },
    { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
  );

  timelineItems.forEach(item => tlObserver.observe(item));
})();


/* ─── f) Shimmer — add card-shimmer class to service cards ── */
(function initCardShimmer() {
  // Add class on DOMContentLoaded so CSS ::before shimmer is ready on hover
  const cards = document.querySelectorAll('.service-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.classList.add('card-shimmer');
  });
})();
