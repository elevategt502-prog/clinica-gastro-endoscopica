/* ============================================================
   CLÍNICA GASTRO ENDOSCÓPICA – Dr. Byron H. Lewin
   main.js | Vanilla JS
   ============================================================ */

'use strict';

// ─── Navbar: scroll & active link ────────────────────────────
const navbar    = document.getElementById('navbar');
const navLinks  = document.querySelectorAll('.nav-link:not(.nav-cta)');
const sections  = document.querySelectorAll('section[id]');

function onScroll() {
  // Solid background after 60px
  navbar.classList.toggle('scrolled', window.scrollY > 60);

  // Active nav link based on current section
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === '#' + current);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // run once on load


// ─── Hero: subtle parallax & loaded class ────────────────────
const heroBg = document.querySelector('.hero-bg-img');
const hero   = document.querySelector('.hero');

if (heroBg) {
  heroBg.addEventListener('load', () => hero.classList.add('loaded'));
  if (heroBg.complete) hero.classList.add('loaded');
}

window.addEventListener('scroll', () => {
  if (!heroBg) return;
  const offset = window.scrollY * 0.25;
  heroBg.style.transform = `scale(1) translateY(${offset}px)`;
}, { passive: true });


// ─── Hamburger menu ──────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navList   = document.getElementById('nav-links');

function closeMenu() {
  hamburger.classList.remove('open');
  navList.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navList.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close button inside overlay
const navCloseBtn = document.getElementById('nav-close');
if (navCloseBtn) navCloseBtn.addEventListener('click', closeMenu);

// Close on nav link click
navList.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});


// ─── Smooth scroll for all anchor links ──────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});


// ─── Intersection Observer: reveal animations ────────────────
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ─── Gallery: hide missing images ────────────────────────────
const galleryItems = document.querySelectorAll('.gallery-item');
const validImages  = [];

galleryItems.forEach(item => {
  const img = item.querySelector('img');
  if (!img) return;

  const handleError = () => item.classList.add('hidden');
  const handleLoad  = () => {
    if (img.naturalWidth === 0) {
      handleError();
    } else {
      validImages.push({ src: img.src, caption: item.querySelector('figcaption')?.textContent || '' });
    }
  };

  img.addEventListener('error', handleError);
  img.addEventListener('load',  handleLoad);
  if (img.complete) {
    if (img.naturalWidth === 0) handleError(); else handleLoad();
  }
});


// ─── Lightbox ────────────────────────────────────────────────
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxCap   = document.getElementById('lightbox-caption');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev  = document.getElementById('lightbox-prev');
const lightboxNext  = document.getElementById('lightbox-next');
let currentIndex    = 0;

function openLightbox(index) {
  const visible = [...galleryItems].filter(i => !i.classList.contains('hidden'));
  if (!visible[index]) return;

  currentIndex = index;
  const img = visible[index].querySelector('img');
  const cap = visible[index].querySelector('figcaption');

  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCap.textContent = cap?.textContent || '';

  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

function navigateLightbox(direction) {
  const visible = [...galleryItems].filter(i => !i.classList.contains('hidden'));
  currentIndex = (currentIndex + direction + visible.length) % visible.length;
  openLightbox(currentIndex);
}

galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => {
    const visible = [...galleryItems].filter(g => !g.classList.contains('hidden'));
    const visibleIndex = visible.indexOf(item);
    if (visibleIndex !== -1) openLightbox(visibleIndex);
  });
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.click();
    }
  });
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
lightboxNext.addEventListener('click', () => navigateLightbox(1));

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});


// ─── Contact Form → WhatsApp ──────────────────────────────────
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', e => {
  e.preventDefault();

  // Simple validation
  const nombre  = contactForm.nombre.value.trim();
  const telefono = contactForm.telefono.value.trim();
  const motivo  = contactForm.motivo.value;

  if (!nombre) {
    showFormError(contactForm.nombre, 'Por favor ingrese su nombre.');
    return;
  }
  if (!telefono) {
    showFormError(contactForm.telefono, 'Por favor ingrese su teléfono.');
    return;
  }
  if (!motivo) {
    showFormError(contactForm.motivo, 'Por favor seleccione el motivo de consulta.');
    return;
  }

  // Build WhatsApp message
  const email   = contactForm.email.value.trim();
  const mensaje = contactForm.mensaje.value.trim();

  let text = `Hola, quisiera agendar una cita con el Dr. Lewin.\n\n`;
  text += `*Nombre:* ${nombre}\n`;
  text += `*Teléfono:* ${telefono}\n`;
  if (email)   text += `*Email:* ${email}\n`;
  text += `*Motivo:* ${motivo}\n`;
  if (mensaje) text += `*Mensaje:* ${mensaje}`;

  const encoded = encodeURIComponent(text);
  const waURL   = `https://wa.me/50259792344?text=${encoded}`;

  window.open(waURL, '_blank', 'noopener,noreferrer');

  // Show success feedback
  showFormSuccess();
});

function showFormError(field, message) {
  field.style.borderColor = '#E53E3E';
  field.focus();
  const prev = field.parentElement.querySelector('.field-error');
  if (!prev) {
    const err = document.createElement('p');
    err.className = 'field-error';
    err.textContent = message;
    err.style.cssText = 'color:#E53E3E;font-size:.78rem;margin-top:4px;';
    field.parentElement.appendChild(err);
    setTimeout(() => { err.remove(); field.style.borderColor = ''; }, 4000);
  }
}

function showFormSuccess() {
  const form = document.getElementById('contact-form');
  const successMsg = document.createElement('div');
  successMsg.innerHTML = `
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#25D366" stroke-width="2" style="margin:0 auto 12px;display:block;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <p style="font-weight:700;color:#0A2342;font-size:1.1rem;">¡Mensaje enviado!</p>
    <p style="color:#5A6A80;margin-top:8px;font-size:.9rem;">Le redirigimos a WhatsApp para finalizar su solicitud de cita.</p>
  `;
  successMsg.style.cssText = 'text-align:center;padding:32px 24px;background:#F0FFF4;border-radius:12px;border:1px solid #9AE6B4;';

  form.style.opacity = '0';
  form.style.transition = 'opacity .3s ease';
  setTimeout(() => {
    form.parentElement.insertBefore(successMsg, form);
    form.style.display = 'none';
  }, 300);
}
