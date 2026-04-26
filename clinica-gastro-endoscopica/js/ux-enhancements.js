/* ============================================================
   CLÍNICA GASTRO ENDOSCÓPICA – Dr. Byron H. Lewin
   ux-enhancements.js | UX & Conversion JavaScript
   Vanilla JS — no frameworks
   ============================================================ */

'use strict';

/* ============================================================
   a) BACK TO TOP BUTTON
   ============================================================ */
(function initBackToTop() {
  const backToTop = document.getElementById('back-to-top');
  if (!backToTop) return;

  // Show/hide based on scroll position
  window.addEventListener('scroll', function () {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // Smooth scroll to top on click
  backToTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   b) MOBILE CTA BAR — resize listener for dynamic updates
   ============================================================ */
(function initMobileCTABar() {
  const bar = document.querySelector('.mobile-cta-bar');
  if (!bar) return;

  // CSS already handles show/hide via media query.
  // JS listener keeps state in sync if orientation changes.
  function updateBarVisibility() {
    const isMobile = window.innerWidth <= 768;
    // Force display style to complement CSS (handles edge cases
    // where dynamically injected content may reset styles)
    bar.setAttribute('aria-hidden', String(!isMobile));
  }

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(updateBarVisibility, 120);
  }, { passive: true });

  updateBarVisibility();
})();


/* ============================================================
   c) TESTIMONIALS SWIPE (mobile touch events)
   ============================================================ */
(function initTestimonialsSwipe() {
  const grid = document.querySelector('.testimonials-grid');
  if (!grid) return;

  let startX = 0;
  let startScrollLeft = 0;
  let isDragging = false;

  grid.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startScrollLeft = grid.scrollLeft;
    isDragging = true;
  }, { passive: true });

  grid.addEventListener('touchmove', function (e) {
    if (!isDragging) return;
    const dx = startX - e.touches[0].clientX;
    grid.scrollLeft = startScrollLeft + dx;
  }, { passive: true });

  grid.addEventListener('touchend', function () {
    isDragging = false;

    // Snap to nearest card
    const cards = grid.querySelectorAll('.testimonial-card');
    if (!cards.length) return;
    const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(grid).gap || '16');
    const snapIndex = Math.round(grid.scrollLeft / cardWidth);
    grid.scrollTo({
      left: snapIndex * cardWidth,
      behavior: 'smooth'
    });
  }, { passive: true });

  // Keyboard navigation for accessibility
  grid.addEventListener('keydown', function (e) {
    const cards = grid.querySelectorAll('.testimonial-card');
    if (!cards.length) return;
    const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(grid).gap || '16');

    if (e.key === 'ArrowRight') {
      grid.scrollBy({ left: cardWidth, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      grid.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  });
})();


/* ============================================================
   d) SMOOTH FORM UX — real-time validation
   ============================================================ */
(function initFormValidation() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');

  // Validation rules per field
  const validators = {
    nombre: {
      validate: function (val) { return val.trim().length >= 2; },
      errorMsg: 'Ingrese su nombre completo (mínimo 2 caracteres).',
      okMsg: 'Nombre válido.'
    },
    telefono: {
      validate: function (val) { return /[\d\s\+\-\(\)]{7,}/.test(val.trim()); },
      errorMsg: 'Ingrese un número de teléfono válido.',
      okMsg: 'Teléfono válido.'
    },
    email: {
      validate: function (val) {
        // Email is optional — only validate if not empty
        if (val.trim() === '') return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
      },
      errorMsg: 'Ingrese un correo electrónico válido.',
      okMsg: 'Correo válido.'
    },
    motivo: {
      validate: function (val) { return val !== ''; },
      errorMsg: 'Seleccione el motivo de consulta.',
      okMsg: 'Motivo seleccionado.'
    }
  };

  // Attach blur-based validators (validates when user leaves field)
  Object.keys(validators).forEach(function (fieldName) {
    const field = form.elements[fieldName];
    if (!field) return;
    const rule = validators[fieldName];

    function runValidation() {
      const isValid = rule.validate(field.value);
      const isOptional = (fieldName === 'email');
      const isEmpty = field.value.trim() === '';

      // Clear previous hints
      clearFieldHint(field);

      if (!isValid) {
        setFieldState(field, 'invalid', rule.errorMsg);
      } else if (!isEmpty || !isOptional) {
        // Only show green tick if there's actual value
        if (!isEmpty) {
          setFieldState(field, 'valid', rule.okMsg);
        } else {
          // Empty optional field — just clear
          field.classList.remove('field-valid', 'field-invalid');
        }
      }
    }

    field.addEventListener('blur', runValidation);
    field.addEventListener('change', runValidation); // For <select>

    // For text inputs: validate on input after first blur
    let touched = false;
    field.addEventListener('blur', function () { touched = true; });
    if (field.type !== 'select-one') {
      field.addEventListener('input', function () {
        if (touched) runValidation();
      });
    }
  });

  function setFieldState(field, state, msg) {
    field.classList.remove('field-valid', 'field-invalid');
    clearFieldHint(field);

    if (state === 'valid') {
      field.classList.add('field-valid');
    } else if (state === 'invalid') {
      field.classList.add('field-invalid');
    }

    if (msg) {
      const hint = document.createElement('p');
      hint.className = 'field-hint field-hint--' + (state === 'valid' ? 'ok' : 'error');
      hint.textContent = msg;
      hint.setAttribute('role', 'alert');
      field.parentElement.appendChild(hint);
    }
  }

  function clearFieldHint(field) {
    const existing = field.parentElement.querySelector('.field-hint');
    if (existing) existing.remove();
  }

  // Loading state on submit
  if (submitBtn) {
    form.addEventListener('submit', function () {
      // Add loading state briefly (form redirects to WA, so it's short-lived)
      submitBtn.classList.add('btn--loading');
      // Remove loading state after 3s in case user returns
      setTimeout(function () {
        submitBtn.classList.remove('btn--loading');
      }, 3000);
    });
  }
})();


/* ============================================================
   e) PHONE NUMBER CLICK TRACKING
   ============================================================ */
(function initPhoneTracking() {
  // Track all phone-related links
  document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
    link.addEventListener('click', function () {
      const number = link.getAttribute('href').replace('tel:', '');
      console.log('[CGE Analytics] Phone call initiated:', number, '| Source element:', link.className || link.closest('[class]')?.className || 'unknown');

      // If a real analytics library is available (e.g. gtag, fbq), fire it here:
      // Example: gtag('event', 'phone_call', { phone_number: number });
    });
  });

  // Track WhatsApp link clicks
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (link) {
    link.addEventListener('click', function () {
      const href = link.getAttribute('href');
      console.log('[CGE Analytics] WhatsApp contact initiated | href:', href, '| Source:', link.className || 'unknown');

      // Example: gtag('event', 'whatsapp_click', { destination: href });
    });
  });
})();


/* ============================================================
   TOAST NOTIFICATION SYSTEM
   (Can be called by other scripts: window.showToast(msg, type))
   ============================================================ */
(function initToastSystem() {
  // Create toast container if not present
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
  }

  /**
   * Show a toast notification.
   * @param {string} message  — text to display
   * @param {'success'|'error'|'info'} type — toast style
   * @param {number} duration — auto-dismiss after ms (default 5000)
   */
  window.showToast = function (message, type, duration) {
    type = type || 'success';
    duration = duration || 5000;

    const iconMap = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
      info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    const toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.setAttribute('role', 'status');
    toast.innerHTML =
      '<span class="toast-icon">' + (iconMap[type] || iconMap.info) + '</span>' +
      '<span class="toast-message">' + message + '</span>' +
      '<button class="toast-close" aria-label="Cerrar notificación">&times;</button>';

    container.appendChild(toast);

    function dismiss() {
      toast.classList.add('toast--exit');
      toast.addEventListener('animationend', function () {
        toast.remove();
      }, { once: true });
    }

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', dismiss);

    // Auto-dismiss
    const timer = setTimeout(dismiss, duration);

    // Pause auto-dismiss on hover
    toast.addEventListener('mouseenter', function () { clearTimeout(timer); });
    toast.addEventListener('mouseleave', function () { setTimeout(dismiss, 1500); });
  };
})();
