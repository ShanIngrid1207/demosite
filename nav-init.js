// nav-init.js - Navbar interactivity

document.addEventListener("DOMContentLoaded", () => {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mainNav      = document.querySelector('.main-nav');
    const header       = document.querySelector('.site-header');

    /* Mobile menu toggle */
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            const open = mainNav.classList.toggle('active');
            mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        document.querySelectorAll('.nav-link, .btn-primary-nav').forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    mobileToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    /* Multi-signal reveal — the nav comes back if ANY of these fire:
         - mouse is in the top 80px of the viewport
         - wheel rotated upward (deltaY < 0)
         - touch was dragged down (= scrolling up on a phone)
         - the page scrolled up
         - we're back near the top of the document
       The nav HIDES when the page is scrolled DOWN and we're past 140px.
       Combining inputs makes the reveal robust against missed scroll
       events while a CSS transform is still animating. */
    if (header) {
        const HIDE_AFTER  = 140;
        const TOP_ZONE    = 80;
        const SCROLL_TOP  = 12;

        const getY = () => window.pageYOffset || document.documentElement.scrollTop || 0;
        const isMenuOpen = () => mainNav && mainNav.classList.contains('active');
        const reveal = () => header.classList.remove('is-hidden');
        const hide   = () => { if (!isMenuOpen()) header.classList.add('is-hidden'); };

        let lastY = getY();
        let scrollTicking = false;

        const onScroll = () => {
            scrollTicking = false;
            const y = getY();

            if (y <= SCROLL_TOP) {
                header.classList.remove('is-scrolled');
                reveal();
            } else {
                header.classList.add('is-scrolled');
                if (y > lastY && y > HIDE_AFTER) {
                    hide();
                } else if (y < lastY) {
                    reveal();
                }
            }
            lastY = y;
        };

        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(onScroll);
                scrollTicking = true;
            }
        }, { passive: true });

        // Wheel — fires immediately on input, not gated by actual page scroll
        window.addEventListener('wheel', (e) => {
            if (e.deltaY < 0) reveal();
        }, { passive: true });

        // Mouse near the top edge — instant reveal
        window.addEventListener('mousemove', (e) => {
            if (e.clientY <= TOP_ZONE) reveal();
        });

        // Touch drag — pulling down means scrolling up
        let touchY = null;
        window.addEventListener('touchstart', (e) => {
            touchY = e.touches[0].clientY;
        }, { passive: true });
        window.addEventListener('touchmove', (e) => {
            if (touchY === null) return;
            const cy = e.touches[0].clientY;
            if (cy - touchY > 4) reveal();
            touchY = cy;
        }, { passive: true });
        window.addEventListener('touchend', () => { touchY = null; });

        // Keyboard — pressing PageUp / Home / ArrowUp reveals
        window.addEventListener('keydown', (e) => {
            if (e.key === 'PageUp' || e.key === 'Home' || e.key === 'ArrowUp') {
                reveal();
            }
        });

        onScroll();
    }

    /* Active section tracking — highlights the matching nav link */
    const navLinks = document.querySelectorAll('.nav-link[data-nav-target]');
    if (navLinks.length && 'IntersectionObserver' in window) {
        const targets = Array.from(navLinks)
            .map(l => document.getElementById(l.getAttribute('data-nav-target')))
            .filter(Boolean);

        const setActive = (id) => {
            navLinks.forEach(l => {
                l.classList.toggle('is-active', l.getAttribute('data-nav-target') === id);
            });
        };

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) setActive(e.target.id);
            });
        }, {
            rootMargin: '-40% 0px -55% 0px',
            threshold: 0
        });

        targets.forEach(t => obs.observe(t));
    }
});
