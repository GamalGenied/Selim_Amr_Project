/**
 * ============================================================
 * SELIM AMR — LANDING PAGE JAVASCRIPT
 * Handles:
 *   1. Navbar scroll glass effect + mobile toggle
 *   2. Smooth-reveal (fade-in) via Intersection Observer
 *   3. Active nav-link highlighting on scroll
 *   4. Contact form submission with validation
 * ============================================================
 */

'use strict';

/* --------------------------------------------------
   DOM References
-------------------------------------------------- */
const navbar     = document.getElementById('navbar');
const navToggle  = document.getElementById('navToggle');
const navLinks   = document.getElementById('navLinks');
const allLinks   = document.querySelectorAll('.nav-link');
const fadeEls    = document.querySelectorAll('.fade-in');
const sections   = document.querySelectorAll('section[id]');
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

/* --------------------------------------------------
   1. NAVBAR — Glassmorphism on scroll
-------------------------------------------------- */
function handleNavScroll() {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

// Initialise on load in case user refreshes mid-page
handleNavScroll();
window.addEventListener('scroll', handleNavScroll, { passive: true });

/* --------------------------------------------------
   2. NAVBAR — Mobile hamburger toggle
-------------------------------------------------- */
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('active', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close mobile menu when any nav link is clicked
allLinks.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* --------------------------------------------------
   3. FADE-IN — Intersection Observer
   Reveals elements as they enter the viewport
-------------------------------------------------- */
const fadeObserverOptions = {
  threshold: 0.12,           // trigger when 12% visible
  rootMargin: '0px 0px -40px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target); // animate only once
    }
  });
}, fadeObserverOptions);

fadeEls.forEach(el => fadeObserver.observe(el));

/* --------------------------------------------------
   4. ACTIVE NAV LINK — Highlight based on scroll position
-------------------------------------------------- */
const navHeight = parseInt(getComputedStyle(document.documentElement)
  .getPropertyValue('--nav-height'), 10) || 70;

function updateActiveLink() {
  let currentId = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop - navHeight - 40;
    if (window.scrollY >= sectionTop) {
      currentId = section.getAttribute('id');
    }
  });

  allLinks.forEach(link => {
    link.classList.remove('active-link');
    if (link.getAttribute('href') === `#${currentId}`) {
      link.classList.add('active-link');
    }
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink(); // run on load

/* --------------------------------------------------
   5. CONTACT FORM — Validation & Submission
-------------------------------------------------- */
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default page reload

    /* --- Basic client-side validation --- */
    const nameField  = document.getElementById('fullName');
    const emailField = document.getElementById('emailAddress');
    const msgField   = document.getElementById('message');

    const name  = nameField.value.trim();
    const email = emailField.value.trim();
    const msg   = msgField.value.trim();

    // Simple email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
      shakeField(nameField, 'Please enter your full name.');
      return;
    }

    if (!email || !emailRegex.test(email)) {
      shakeField(emailField, 'Please enter a valid email address.');
      return;
    }

    if (!msg) {
      shakeField(msgField, 'Please write a message before sending.');
      return;
    }

    /* --- Success flow --- */
    // Hide form, show success message
    contactForm.style.display = 'none';
    formSuccess.hidden = false;

    // Clear all form fields
    contactForm.reset();

    // Optional: reset form view after 6 seconds
    setTimeout(() => {
      formSuccess.hidden = true;
      contactForm.style.display = '';
    }, 6000);
  });
}

/**
 * Adds a shake animation + temporary error border to a form field.
 * Removes itself after 600ms so it can be re-triggered.
 * @param {HTMLElement} field - The input / textarea element
 * @param {string}      msg   - Accessible description of the error
 */
function shakeField(field, msg) {
  field.focus();
  field.setAttribute('aria-invalid', 'true');
  field.style.borderColor = '#FF5C5C';
  field.style.boxShadow   = '0 0 0 3px rgba(255, 92, 92, 0.2)';

  // Inject shake keyframes once
  if (!document.getElementById('shakeStyle')) {
    const style = document.createElement('style');
    style.id = 'shakeStyle';
    style.textContent = `
      @keyframes shakeField {
        0%, 100% { transform: translateX(0); }
        20%       { transform: translateX(-8px); }
        40%       { transform: translateX(8px); }
        60%       { transform: translateX(-5px); }
        80%       { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
  }

  field.style.animation = 'shakeField 0.5s ease';

  setTimeout(() => {
    field.style.borderColor = '';
    field.style.boxShadow   = '';
    field.style.animation   = '';
    field.setAttribute('aria-invalid', 'false');
  }, 600);

  // Brief visible alert as fallback (screen-reader friendly)
  console.warn(`Form error: ${msg}`);
}

/* --------------------------------------------------
   6. SMOOTH SCROLL POLYFILL for older Safari
   (in case CSS scroll-behavior isn't supported)
-------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
