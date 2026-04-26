/**
 * capsule-faq.js
 * Cápsula Endoscópica Section — Interactive Enhancements
 * - FAQ Accordion
 * - SVG Digestive Tract Path Animation (capsule journey)
 * - Condition icons stagger reveal via IntersectionObserver
 *
 * Vanilla JS, no dependencies.
 */

(function () {
  'use strict';

  /* ============================================================
     UTILITY
     ============================================================ */

  /**
   * Run fn when DOM is ready (or immediately if already ready).
   */
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  /**
   * Prefer reduced motion check.
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ============================================================
     1. FAQ ACCORDION
     ============================================================ */

  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      const btn = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (!btn || !answer) return;

      // Ensure initial aria state
      btn.setAttribute('aria-expanded', 'false');
      answer.style.maxHeight = '0';

      btn.addEventListener('click', function () {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';

        // Close all items first
        items.forEach(function (i) {
          const ib = i.querySelector('.faq-question');
          const ia = i.querySelector('.faq-answer');
          if (ib) ib.setAttribute('aria-expanded', 'false');
          if (ia) ia.style.maxHeight = '0';
          i.classList.remove('faq-open');
        });

        // Open the clicked item if it was closed
        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          item.classList.add('faq-open');

          // Scroll into view gently on mobile
          if (window.innerWidth < 768) {
            setTimeout(function () {
              item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
          }
        }
      });

      // Keyboard: allow Enter/Space (default button behavior, but make explicit)
      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  /* ============================================================
     2. SVG CAPSULE JOURNEY ANIMATION
     ============================================================ */

  function initCapsuleAnimation() {
    const section = document.getElementById('capsula');
    const svg = section && section.querySelector('.capsule-journey-svg');
    if (!svg) return;

    const highlightPath = svg.querySelector('.digestive-path-highlight');
    const capsuleGroup = svg.querySelector('.capsule-pill-group');
    const organLabels = svg.querySelectorAll('.organ-label');
    const organDots = svg.querySelectorAll('.organ-dot');
    const mainPath = svg.querySelector('.digestive-path-main');

    if (!highlightPath || !capsuleGroup || !mainPath) return;

    // Get total path length
    let totalLength;
    try {
      totalLength = mainPath.getTotalLength();
    } catch (e) {
      totalLength = 1200; // fallback
    }

    // Set up the animated highlight path
    highlightPath.style.strokeDasharray = totalLength;
    highlightPath.style.strokeDashoffset = totalLength;

    let animationId = null;
    let started = false;
    let progress = 0; // 0 to 1
    const DURATION_MS = prefersReducedMotion() ? 100 : 4500;

    // Label reveal checkpoints (fraction of path 0-1)
    const labelCheckpoints = [0.05, 0.22, 0.42, 0.62, 0.82, 0.95];

    function revealLabelsUpTo(frac) {
      organLabels.forEach(function (label, idx) {
        if (frac >= (labelCheckpoints[idx] || 0)) {
          label.classList.add('revealed');
        }
      });
      organDots.forEach(function (dot, idx) {
        if (frac >= (labelCheckpoints[idx] || 0)) {
          dot.classList.add('revealed');
        }
      });
    }

    function animate(timestamp) {
      if (!animate.startTime) animate.startTime = timestamp;
      const elapsed = timestamp - animate.startTime;
      progress = Math.min(elapsed / DURATION_MS, 1);

      // Easing: ease-in-out cubic
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Draw the path
      highlightPath.style.strokeDashoffset = totalLength * (1 - eased);

      // Move capsule pill along the path
      try {
        const point = mainPath.getPointAtLength(eased * totalLength);
        // Tangent for rotation
        const tangentLength = Math.min(eased * totalLength + 5, totalLength);
        const tangentPoint = mainPath.getPointAtLength(tangentLength);
        const dx = tangentPoint.x - point.x;
        const dy = tangentPoint.y - point.y;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        capsuleGroup.setAttribute(
          'transform',
          'translate(' + point.x + ',' + point.y + ') rotate(' + angle + ')'
        );
        capsuleGroup.classList.add('visible');
      } catch (e) {
        // SVG path API not available (e.g. hidden element)
      }

      // Reveal labels at checkpoints
      revealLabelsUpTo(eased);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        // Animation complete — keep capsule at end
        capsuleGroup.classList.add('visible');
      }
    }

    // If reduced motion, just instantly reveal everything
    if (prefersReducedMotion()) {
      highlightPath.style.strokeDashoffset = '0';
      capsuleGroup.classList.add('visible');
      organLabels.forEach(function (l) { l.classList.add('revealed'); });
      organDots.forEach(function (d) { d.classList.add('revealed'); });
      return;
    }

    // Use IntersectionObserver to trigger animation when section is in view
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !started) {
            started = true;
            animate.startTime = null;
            animationId = requestAnimationFrame(animate);
            observer.disconnect();
          }
        });
      }, { threshold: 0.2 });
      observer.observe(svg);
    } else {
      // Fallback: run immediately
      animate.startTime = null;
      animationId = requestAnimationFrame(animate);
    }
  }

  /* ============================================================
     3. CONDITION ICONS — STAGGER REVEAL
     ============================================================ */

  function initConditionReveal() {
    const list = document.querySelector('.condition-list');
    if (!list) return;

    const items = list.querySelectorAll('.condition-item');
    if (!items.length) return;

    if (prefersReducedMotion()) {
      items.forEach(function (item) {
        item.classList.add('revealed');
      });
      return;
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Reveal items with stagger already defined by CSS transition-delay
            items.forEach(function (item) {
              item.classList.add('revealed');
            });
            observer.disconnect();
          }
        });
      }, { threshold: 0.15 });
      observer.observe(list);
    } else {
      items.forEach(function (item) {
        item.classList.add('revealed');
      });
    }
  }

  /* ============================================================
     4. SECTION REVEAL (fallback for .reveal elements inside #capsula)
     ============================================================ */

  function initSectionReveal() {
    const section = document.getElementById('capsula');
    if (!section) return;

    const revealEls = section.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    if (prefersReducedMotion()) {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }
  }

  /* ============================================================
     INIT
     ============================================================ */

  onReady(function () {
    initFAQ();
    initCapsuleAnimation();
    initConditionReveal();
    initSectionReveal();
  });

})();
