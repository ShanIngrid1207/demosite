/**
 * section-transitions.js
 *
 * Does exactly two things:
 *  1. Wraps .hero-content in a liquid glass panel
 *  2. Adds smooth clip-reveal entrances to sections as they scroll into view
 *
 * Does NOT touch any other styles, layouts, or existing animations.
 */

(function () {
  "use strict";

  /* ── 1. HERO LIQUID GLASS ──────────────────────────────────────────────── */
  function applyHeroGlass() {
    const heroContent = document.querySelector(".hero-content");
    if (!heroContent || heroContent.classList.contains("hero-glass")) return;

    heroContent.classList.add("hero-glass");
  }

  /* ── 2. SECTION ENTRANCE REVEALS ──────────────────────────────────────── */
  /*
    Uses IntersectionObserver — no extra deps, works alongside GSAP perfectly.
    When a section hits the viewport threshold, .is-visible is added
    and the CSS transition plays.
  */

  const REVEAL_SECTIONS = [
    ".trust-badges",
    ".why-us",
    ".services",
    ".service-areas",
    ".process-section",
    ".reviews-section",
    ".faq-section",
    ".contact-section",
  ];

  function setupSectionReveals() {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      {
        threshold: 0.08, // trigger when 8% of section is visible
        rootMargin: "0px 0px -40px 0px",
      }
    );

    REVEAL_SECTIONS.forEach((selector) => {
      const section = document.querySelector(selector);
      if (!section) return;

      section.classList.add("section-reveal");

      // Wrap the section's direct children in clip + content divs
      // so the transition plays cleanly without affecting layout
      const clipDiv    = document.createElement("div");
      const contentDiv = document.createElement("div");
      clipDiv.className    = "reveal-clip";
      contentDiv.className = "reveal-content";

      // Move all children into contentDiv → clipDiv
      while (section.firstChild) {
        contentDiv.appendChild(section.firstChild);
      }
      clipDiv.appendChild(contentDiv);
      section.appendChild(clipDiv);

      observer.observe(section);
    });
  }

  /* ── Init ──────────────────────────────────────────────────────────────── */
  function init() {
    applyHeroGlass();
    setupSectionReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
