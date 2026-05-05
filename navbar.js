/* navbar.js — Smart Global Navbar
 * Injects the Quest Roofing navbar into <div id="navbar-placeholder"></div>
 * on every page, then handles:
 *   - Active link highlighting based on the current URL
 *   - Scroll-spy on index.html (highlights nav as you scroll past sections)
 *   - Mobile menu toggle
 *   - Sticky show/hide on scroll
 *   - Smart "Free Estimate" link (→ #estimate on subpages, #contact on home)
 *
 * Usage: include <script src="navbar.js"></script> on every page that has
 * <div id="navbar-placeholder"></div>. Make sure nav-footer.css is also linked.
 */

(function () {
  'use strict';

  /* ── Navbar markup (single source of truth) ───────────────────────── */
  const NAVBAR_HTML = `
<div class="top-bar">
  <div class="container top-bar-inner">
    <span class="top-bar-text"><span class="top-bar-dot" aria-hidden="true"></span>Monsoon Season Ready &mdash; Free Roof Inspections across the East Valley</span>
    <a href="tel:6023996455" class="top-bar-phone">
      <span class="top-bar-phone-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.91.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
      </span>
      602-399-6455
    </a>
  </div>
</div>

<header class="site-header">
  <div class="container nav-container">
    <a href="index.html" class="logo">
      <span class="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16 L16 5 L28 16"></path><path d="M7 14 L7 27 L25 27 L25 14"></path></svg>
      </span>
      <span class="logo-text">Quest<span class="text-orange">Roofing</span></span>
    </a>

    <button class="mobile-toggle" aria-label="Toggle Menu" aria-expanded="false">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </button>

    <nav class="main-nav" aria-label="Primary">
      <div class="nav-dropdown">
        <a href="index.html#services" class="nav-link nav-has-dropdown" data-key="services">
          <span class="nav-link-text">Services</span>
          <svg class="nav-dropdown-caret" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <ul class="nav-dropdown-menu">
          <li><a href="tile-roofing.html">Tile Roofing</a></li>
          <li><a href="shingle-roofing.html">Shingle Roofing</a></li>
          <li><a href="metal-roofing.html">Metal Roofing</a></li>
          <li><a href="foam-roof.html">Foam Roofing</a></li>
          <li><a href="roof-repairs.html">Roof Repair</a></li>
          <li><a href="free-roof-inspection.html">Free Inspection</a></li>
        </ul>
      </div>

      <div class="nav-dropdown">
        <a href="index.html#service-areas" class="nav-link nav-has-dropdown" data-key="service-areas">
          <span class="nav-link-text">Service Areas</span>
          <svg class="nav-dropdown-caret" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true"><path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <ul class="nav-dropdown-menu">
          <li><a href="roofing-queen-creek-az.html">Queen Creek</a></li>
          <li><a href="index.html#service-areas">Gilbert</a></li>
          <li><a href="index.html#service-areas">Chandler</a></li>
          <li><a href="index.html#service-areas">Mesa</a></li>
          <li><a href="index.html#service-areas">Tempe</a></li>
          <li><a href="index.html#service-areas">Apache Junction</a></li>
          <li><a href="index.html#service-areas">San Tan Valley</a></li>
        </ul>
      </div>

      <a href="index.html#process"   class="nav-link" data-key="process"><span class="nav-link-text">Process</span></a>
      <a href="index.html#reviews"   class="nav-link" data-key="reviews"><span class="nav-link-text">Reviews</span></a>
      <a href="index.html#resources" class="nav-link" data-key="faq"><span class="nav-link-text">FAQ</span></a>
      <a href="blog.html"            class="nav-link" data-key="blog"><span class="nav-link-text">Blog</span></a>
      <a href="#estimate" class="btn-primary-nav">
        <span>Free Estimate</span>
        <span class="btn-primary-nav-arrow" aria-hidden="true">→</span>
      </a>
    </nav>
  </div>
</header>
`;

  /* ── Routing tables ───────────────────────────────────────────────── */
  // Subpage filename → which nav link (data-key) should be highlighted.
  const PAGE_TO_NAV_KEY = {
    'tile-roofing.html':           'services',
    'shingle-roofing.html':        'services',
    'metal-roofing.html':          'services',
    'foam-roof.html':              'services',
    'roof-repairs.html':           'services',
    'free-roof-inspection.html':   'services',
    'roofing-queen-creek-az.html': 'service-areas',
    'blog.html':                   'blog',
  };

  // Section id on index.html → nav-link key (used by scroll-spy on home).
  const SECTION_TO_NAV_KEY = {
    services:        'services',
    'service-areas': 'service-areas',
    process:         'process',
    reviews:         'reviews',
    resources:       'faq',
  };

  /* ── Helpers ──────────────────────────────────────────────────────── */
  function getCurrentPage() {
    const file = window.location.pathname.split('/').pop().toLowerCase();
    return file || 'index.html';
  }
  function isHome() {
    const p = getCurrentPage();
    return p === 'index.html' || p === '';
  }

  /* ── Inject + wire everything ─────────────────────────────────────── */
  function inject() {
    const slot = document.getElementById('navbar-placeholder');
    if (!slot) {
      console.warn('navbar.js: <div id="navbar-placeholder"></div> not found.');
      return;
    }
    slot.innerHTML = NAVBAR_HTML;
    setEstimateLink();
    setActiveLink();
    wireMobileToggle();
    wireDropdowns();
    wireStickyBehavior();
    wireIndexScrollSpy();
  }

  // Dropdown menus: hover on desktop (CSS-driven), tap-to-toggle on mobile,
  // outside-click to close.
  function wireDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    if (!dropdowns.length) return;

    const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

    dropdowns.forEach(dd => {
      const toggle = dd.querySelector('.nav-has-dropdown');
      if (!toggle) return;
      toggle.addEventListener('click', (e) => {
        // On mobile, the menu is part of the slide-out — tapping the parent
        // expands its children instead of navigating immediately.
        if (isMobile()) {
          e.preventDefault();
          dropdowns.forEach(other => { if (other !== dd) other.classList.remove('is-open'); });
          dd.classList.toggle('is-open');
        }
      });
    });

    // Close any open dropdown when the user clicks outside the navbar.
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-dropdown')) {
        dropdowns.forEach(dd => dd.classList.remove('is-open'));
      }
    });

    // Close dropdowns on Escape.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dropdowns.forEach(dd => dd.classList.remove('is-open'));
    });
  }

  // Free Estimate button → in-page form on subpages, contact section on home.
  function setEstimateLink() {
    const btn = document.querySelector('.btn-primary-nav');
    if (!btn) return;
    btn.setAttribute('href', isHome() ? 'index.html#contact' : '#estimate');
  }

  // Add `is-active` to whichever link maps to the current page.
  function setActiveLink() {
    if (isHome()) return; // index uses scroll-spy below instead
    const key = PAGE_TO_NAV_KEY[getCurrentPage()];
    if (!key) return;
    const link = document.querySelector('.main-nav .nav-link[data-key="' + key + '"]');
    if (link) link.classList.add('is-active');
  }

  function wireMobileToggle() {
    const btn = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.main-nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('active');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // Close menu after tapping a link on mobile.
    nav.addEventListener('click', (e) => {
      if (e.target.closest('.nav-link, .btn-primary-nav') && nav.classList.contains('active')) {
        nav.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Hide the header on scroll-down past 140px, reveal on scroll-up / mouse-near-top.
  function wireStickyBehavior() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const nav = document.querySelector('.main-nav');
    const HIDE_AFTER = 140, TOP_ZONE = 80, SCROLL_TOP = 12;

    const getY    = () => window.pageYOffset || document.documentElement.scrollTop || 0;
    const menuOn  = () => nav && nav.classList.contains('active');
    const reveal  = () => header.classList.remove('is-hidden');
    const hide    = () => { if (!menuOn()) header.classList.add('is-hidden'); };

    let lastY = getY();
    let ticking = false;

    const onScroll = () => {
      ticking = false;
      const y = getY();
      if (y <= SCROLL_TOP) {
        header.classList.remove('is-scrolled');
        reveal();
      } else {
        header.classList.add('is-scrolled');
        if (y > lastY && y > HIDE_AFTER) hide();
        else if (y < lastY) reveal();
      }
      lastY = y;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });

    window.addEventListener('wheel',     (e) => { if (e.deltaY < 0) reveal(); }, { passive: true });
    window.addEventListener('mousemove', (e) => { if (e.clientY <= TOP_ZONE) reveal(); });

    let touchY = null;
    window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove',  (e) => {
      if (touchY === null) return;
      const cy = e.touches[0].clientY;
      if (cy - touchY > 4) reveal();
      touchY = cy;
    }, { passive: true });
    window.addEventListener('touchend',   () => { touchY = null; });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'PageUp' || e.key === 'Home' || e.key === 'ArrowUp') reveal();
    });

    onScroll();
  }

  // On index.html, highlight whichever section is currently in view.
  function wireIndexScrollSpy() {
    if (!isHome() || !('IntersectionObserver' in window)) return;

    const targets = Object.keys(SECTION_TO_NAV_KEY)
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!targets.length) return;

    const links = document.querySelectorAll('.main-nav .nav-link');
    const setActive = (id) => {
      const key = SECTION_TO_NAV_KEY[id];
      links.forEach(l => l.classList.toggle('is-active', l.getAttribute('data-key') === key));
    };

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    targets.forEach(t => obs.observe(t));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
