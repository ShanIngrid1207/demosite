document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasGSAP = typeof window.gsap !== "undefined";

    setupAccordion();

    if (!hasGSAP || prefersReducedMotion) {
        document.documentElement.classList.add("motion-ready");
        return;
    }

    const { gsap } = window;
    const plugins = [];

    if (typeof window.ScrollTrigger !== "undefined") {
        plugins.push(window.ScrollTrigger);
    }

    if (typeof window.MotionPathPlugin !== "undefined") {
        plugins.push(window.MotionPathPlugin);
    }

    if (plugins.length) {
        gsap.registerPlugin(...plugins);
    }

    gsap.defaults({
        duration: 0.8,
        ease: "power2.out"
    });

    runIntro();
    setupHeroParallax();
    setupHeroTilt();
    setupSectionHeadings();
    setupTrustBadges();
    setupWhyUsCards();
    setupServiceCards();
    setupServiceAreas();
    setupProcessAnimation();
    setupReviews();
    setupFaqReveal();
    setupContactReveal();
    setupCountUps();

    window.addEventListener("load", () => {
        if (window.ScrollTrigger) {
            window.ScrollTrigger.refresh();
        }
    });
});

function setupAccordion() {
    /* New flip-card FAQ: clicking a card toggles aria-pressed which the CSS
       hooks for the rotateY flip. Only one card flipped at a time. */
    const cards = document.querySelectorAll(".faq-card");
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            const open = card.getAttribute("aria-pressed") === "true";
            cards.forEach(c => c.setAttribute("aria-pressed", "false"));
            card.setAttribute("aria-pressed", open ? "false" : "true");
        });

        /* Keyboard parity — Enter/Space already toggles by default for buttons */
    });
}

function runIntro() {
    const { gsap } = window;
    const preloader = document.getElementById("preloader");

    if (!preloader) {
        playHeroAnimation();
        return;
    }

    const lines = preloader.querySelectorAll(".loader-line");
    const revealEl = preloader.querySelector(".loader-reveal");

    if (!lines.length) {
        playHeroAnimation();
        return;
    }

    // Manually split each line's text into individual <span> chars
    function splitChars(el) {
        const text = el.textContent || "";
        el.textContent = "";
        el.style.display = "block";
        const chars = [];
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement("span");
            span.textContent = text[i] === " " ? "\u00A0" : text[i];
            span.style.display = "inline-block";
            span.style.backfaceVisibility = "hidden";
            if (text[i] !== " " && i % 4 === 1) span.style.color = "#3088F4";
            el.appendChild(span);
            chars.push(span);
        }
        return chars;
    }

    const width = window.innerWidth;
    const depth = -width / 8;
    const transformOrigin = `50% 50% ${depth}px`;

    const allSplits = Array.from(lines).map(line => {
        gsap.set(line, { perspective: 700, transformStyle: "preserve-3d" });
        return splitChars(line);
    });

    gsap.set(preloader, { autoAlpha: 1 });
    if (revealEl) gsap.set(revealEl, { opacity: 0 });

    const animTime = 0.9;

    // Single roll — repeat: 0
    const loopTl = gsap.timeline({ repeat: 0 });

    allSplits.forEach((chars, index) => {
        loopTl.fromTo(
            chars,
            { rotationX: -90 },
            {
                rotationX: 90,
                stagger: 0.07,
                duration: animTime,
                ease: "none",
                transformOrigin
            },
            index * 0.45
        );
    });

    // After 1 roll: hide the tube, show the centered name with shine, then wipe up
    loopTl.then(() => {
        const master = gsap.timeline({
            onComplete: () => {
                preloader.setAttribute("aria-hidden", "true");
                playHeroAnimation();
            }
        });

        // Fade out the rolling tube
        master.to(".tube", {
            autoAlpha: 0,
            duration: 0.35,
            ease: "power2.in"
        });

        // Pop in the centered reveal name with per-letter shine
        if (revealEl) {
            // Split the reveal spans into individual chars for per-letter shine
            function splitRevealChars(el) {
                const spans = el.querySelectorAll(".loader-reveal-quest, .loader-reveal-roofing");
                const allChars = [];
                spans.forEach(span => {
                    const text = span.textContent || "";
                    // Capture computed color BEFORE clearing textContent so CSS
                    // class colours (.loader-reveal-quest / -roofing) are resolved
                    const color = window.getComputedStyle(span).color;
                    span.textContent = "";
                    span.style.color = color;
                    span.style.display = "inline-block";
                    text.split("").forEach(ch => {
                        const charSpan = document.createElement("span");
                        charSpan.textContent = ch === " " ? " " : ch;
                        charSpan.style.cssText =
                            `display:inline-block;color:${color};position:relative;`;
                        span.appendChild(charSpan);
                        allChars.push(charSpan);
                    });
                });
                return allChars;
            }

            const revealChars = splitRevealChars(revealEl);

            // Whole name pops in — use xPercent/yPercent so GSAP doesn't clobber the centering
            gsap.set(revealEl, { xPercent: -50, yPercent: -50, left: "50%", top: "50%", y: 0 });
            master.fromTo(revealEl,
                { opacity: 0, scale: 0.88 },
                { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(1.6)" }
            );

            // Per-letter shine: a bright flash travels letter by letter
            master.to(revealChars, {
                keyframes: [
                    { color: "rgba(255,255,255,1)", textShadow: "0 0 24px rgba(255,255,255,0.95), 0 0 8px rgba(48,136,244,0.8)", duration: 0.12, ease: "power2.in" },
                    { color: "", textShadow: "none", duration: 0.18, ease: "power2.out" }
                ],
                stagger: 0.055,
                onStart: function() {
                    // restore each char's original color after flash
                    revealChars.forEach(c => { c.dataset.origColor = c.style.color; });
                }
            }, "-=0.05");

            // Hold a beat, then fade out
            master.to({}, { duration: 0.3 });
            master.to(revealEl, { scale: 1.04, opacity: 0, duration: 0.38, ease: "power2.in" });
        } else {
            master.to({}, { duration: 0.6 });
        }

        // Wipe the whole preloader up
        master.to(preloader, {
            yPercent: -100,
            duration: 0.85,
            ease: "power3.inOut"
        });
    });
}

function playHeroAnimation() {
    const { gsap } = window;

    const mainTitle = document.querySelector(".hero-title-main");
    const subTitle  = document.querySelector(".hero-title-sub");
    const areaTitle = document.querySelector(".hero-title-area");

    const mainChars = mainTitle ? domSplitChars(mainTitle) : [];
    const subWords  = subTitle  ? domSplitWords(subTitle)  : [];

    // Wrap each char in a clip sleeve so it slams up from behind a mask
    mainChars.forEach(char => {
        const sleeve = document.createElement("span");
        sleeve.style.cssText = "display:inline-block;overflow:hidden;vertical-align:bottom;line-height:1.08;";
        char.parentNode.insertBefore(sleeve, char);
        sleeve.appendChild(char);
    });

    // Chars start fully below their clip sleeve — no opacity fade, pure positional slam
    gsap.set(mainChars, { y: "110%", skewX: 8 });

    // Everything else
    gsap.set(".hero-badge",       { autoAlpha: 0, y: -12 });
    gsap.set(".hero-eyeline",     { autoAlpha: 0, y: 8 });
    gsap.set(subWords,            { autoAlpha: 0, y: 22 });
    gsap.set(areaTitle,           { autoAlpha: 0, y: 14 });
    gsap.set(".hero-description", { autoAlpha: 0, y: 14 });
    gsap.set(".hero-actions a",   { autoAlpha: 0, y: 14 });

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl
        // Badge + eyeline — sharp, instant
        .to(".hero-badge",   { autoAlpha: 1, y: 0, duration: 0.32 })
        .to(".hero-eyeline", { autoAlpha: 1, y: 0, duration: 0.28 }, "-=0.14")

        // Main title — clip-slam: characters shoot up, skew snaps off
        .to(mainChars, {
            y: "0%",
            skewX: 0,
            duration: 0.58,
            stagger: 0.028,
            ease: "power4.out",
        }, "-=0.08")

        // Sub words — fast stagger fade-up
        .to(subWords, {
            autoAlpha: 1, y: 0,
            duration: 0.38, stagger: 0.055,
            ease: "power3.out"
        }, "-=0.28")

        // Area line
        .to(areaTitle, { autoAlpha: 1, y: 0, duration: 0.3 }, "-=0.18")

        // Description
        .to(".hero-description", { autoAlpha: 1, y: 0, duration: 0.3 }, "-=0.18")

        // Buttons
        .to(".hero-actions a", {
            autoAlpha: 1, y: 0,
            duration: 0.3, stagger: 0.1,
            ease: "power3.out"
        }, "-=0.18");

    // Kick off the hero tilt now that chars exist in the DOM
    setupHeroTilt();
}

function setupHeroParallax() {
    const { gsap } = window;
    const hero = document.querySelector(".hero");
    const glow = document.querySelector(".hero-glow");

    if (!hero || !glow) return;

    hero.addEventListener("pointermove", (event) => {
        if (window.innerWidth <= 768) return;

        const rect = hero.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        gsap.to(glow, {
            x: x * 0.25,
            y: y * 0.25,
            duration: 1,
            overwrite: "auto"
        });
    });
}

function setupHeroTilt() {
    const { gsap } = window;
    const hero   = document.querySelector(".hero");
    const title  = document.querySelector(".hero-title-main");
    const sub    = document.querySelector(".hero-title-sub");
    const area   = document.querySelector(".hero-title-area");

    if (!hero || !title) return;

    // Give the title its own perspective so rotationX/Y is relative to itself
    gsap.set(title, { transformPerspective: 800, transformOrigin: "center center" });

    const titleRX = gsap.quickTo(title, "rotationX", { duration: 0.55, ease: "power3" });
    const titleRY = gsap.quickTo(title, "rotationY", { duration: 0.55, ease: "power3" });
    const subX    = sub  ? gsap.quickTo(sub,  "x", { duration: 0.7, ease: "power3" }) : null;
    const areaX   = area ? gsap.quickTo(area, "x", { duration: 0.9, ease: "power3" }) : null;

    hero.addEventListener("pointermove", (e) => {
        if (window.innerWidth <= 768) return;
        const nx = e.clientX / window.innerWidth;   // 0–1
        const ny = e.clientY / window.innerHeight;  // 0–1

        titleRX(gsap.utils.interpolate(12, -12, ny));
        titleRY(gsap.utils.interpolate(-18, 18, nx));
        if (subX)  subX(gsap.utils.interpolate(-10, 10, nx));
        if (areaX) areaX(gsap.utils.interpolate(-6, 6, nx));
    });

    hero.addEventListener("pointerleave", () => {
        titleRX(0);
        titleRY(0);
        if (subX)  subX(0);
        if (areaX) areaX(0);
    });
}

// ─── Shared text-split helpers (reusable across hero + sections) ──────────────
function domSplitChars(el) {
    /* IMPORTANT: capture the computed colour of each child node WHILE the
       node is still in the DOM. getComputedStyle on a detached element
       returns the user-agent default styles, not the author-stylesheet
       rules — meaning class colours like .text-orange would be lost. */
    const childData = Array.from(el.childNodes).map(node => {
        if (node.nodeType !== 3 && node.nodeName === "BR") {
            return { kind: "br" };
        }
        if (node.nodeType !== 3) {
            return {
                kind: "text",
                text: node.textContent || "",
                color: window.getComputedStyle(node).color
            };
        }
        return { kind: "text", text: node.textContent || "", color: null };
    });

    el.innerHTML = "";
    const chars = [];

    function emitChunk(text, color) {
        if (!text) return;
        const parts = text.split(/(\s+)/);
        parts.forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
                el.appendChild(document.createTextNode(part));
                return;
            }
            // Wrap each word in inline-block, nowrap so chars can't break a word.
            const wordWrap = document.createElement("span");
            wordWrap.className = "word-wrap";
            wordWrap.style.display = "inline-block";
            wordWrap.style.whiteSpace = "nowrap";
            part.split("").forEach(ch => {
                const span = document.createElement("span");
                span.className = "char";
                span.style.display = "inline-block";
                if (color) span.style.color = color;
                span.textContent = ch;
                wordWrap.appendChild(span);
                chars.push(span);
            });
            el.appendChild(wordWrap);
        });
    }

    childData.forEach(d => {
        if (d.kind === "br") {
            el.appendChild(document.createElement("br"));
        } else {
            emitChunk(d.text, d.color);
        }
    });
    return chars;
}

function domSplitWords(el) {
    /* Same pattern as domSplitChars: read computed colours from the in-DOM
       child nodes BEFORE we wipe the parent's innerHTML. */
    const childData = Array.from(el.childNodes).map(node => {
        if (node.nodeType !== 3 && node.nodeName === "BR") return { kind: "br" };
        if (node.nodeType !== 3) {
            return { kind: "el", text: node.textContent || "", color: window.getComputedStyle(node).color };
        }
        return { kind: "text", text: node.textContent || "" };
    });

    el.innerHTML = "";
    const words = [];

    const emitWords = (text, color) => {
        if (!text || !text.trim()) return;
        text.trim().split(/\s+/).forEach(w => {
            const span = document.createElement("span");
            span.className = "word";
            span.style.display = "inline-block";
            if (color) span.style.color = color;
            span.textContent = w;
            el.appendChild(span);
            el.appendChild(document.createTextNode(" "));
            words.push(span);
        });
    };

    childData.forEach(d => {
        if (d.kind === "br") {
            el.appendChild(document.createElement("br"));
        } else if (d.kind === "el") {
            emitWords(d.text, d.color);
        } else {
            emitWords(d.text, null);
        }
    });
    return words;
}

function setupSectionHeadings() {
    if (!window.ScrollTrigger) return;
    const { gsap } = window;

    // Target every h2 and h3 that is NOT inside the hero
    const h2s = Array.from(document.querySelectorAll("h2")).filter(
        el => !el.closest(".hero")
    );
    const h3s = Array.from(document.querySelectorAll("h3")).filter(
        el => !el.closest(".hero")
    );

    // h2 — char-flip (same rotationX effect as hero h1 but scroll-triggered)
    h2s.forEach(el => {
        const chars = domSplitChars(el);
        gsap.set(chars, { autoAlpha: 0, y: 40, rotationX: -70, transformOrigin: "50% 100%",
                          transformPerspective: 600 });
        gsap.to(chars, {
            autoAlpha: 1, y: 0, rotationX: 0,
            stagger: 0.03, duration: 0.65, ease: "back.out(1.5)",
            scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
    });

    // h3 — word tumble (skip headings whose internal markup we want to preserve)
    h3s.forEach(el => {
        if (el.classList.contains("sa-headline")) return;

        const words = domSplitWords(el);
        gsap.set(words, { autoAlpha: 0, y: -30, rotation: "random(-20,20)" });
        gsap.to(words, {
            autoAlpha: 1, y: 0, rotation: 0,
            stagger: 0.09, duration: 0.55, ease: "back.out(1.4)",
            scrollTrigger: { trigger: el, start: "top 88%", once: true }
        });
    });
}

function setupTrustBadges() {
    /* Marquee entrance — fade the whole strip in as it enters viewport */
    gsapFromTo(".trust-marquee",
        { autoAlpha: 0, y: 12 },
        {
            scrollTrigger: scrollOnce(".trust-badges", "top 92%"),
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out"
        }
    );
}

function setupWhyUsCards() {
    if (!window.ScrollTrigger) return;

    const { gsap } = window;
    const cards = gsap.utils.toArray(".why-us-deck .feature-card");

    if (!cards.length) return;

    // Stack all cards dead-center in the deck container
    gsap.set(cards, {
        position: "absolute",
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "center center",
        zIndex: (index) => index + 1
    });

    // Cards 1–3 start slammed off-screen below, rotated & scaled down
    gsap.set(cards.slice(1), {
        yPercent: 140,
        autoAlpha: 0,
        scale: 0.82,
        rotation: 6,
    });

    // Animate why-us text + stats in on scroll enter
    gsap.fromTo(".why-us-text .section-eyebrow, .why-us-text .section-title, .why-us-text p",
        { autoAlpha: 0, x: -40 },
        {
            autoAlpha: 1, x: 0,
            duration: 0.55, stagger: 0.1, ease: "power3.out",
            scrollTrigger: { trigger: ".why-us", start: "top 80%", once: true }
        }
    );

    gsap.fromTo(".why-us-stat",
        { autoAlpha: 0, y: 30, scale: 0.85 },
        {
            autoAlpha: 1, y: 0, scale: 1,
            duration: 0.45, stagger: 0.1, ease: "back.out(1.8)",
            scrollTrigger: { trigger: ".why-us-stats", start: "top 88%", once: true }
        }
    );

    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".why-us",
            pin: true,
            start: "top top",
            end: "+=2200",
            scrub: 0.35,
            invalidateOnRefresh: true
        }
    });

    cards.forEach((card, index) => {
        if (index === 0) return;

        const prev = cards.slice(0, index);
        const t = index * 0.8;

        // Previous cards: hard retreat — scale down, drift up, ghost out
        timeline.to(prev, {
            scale: 0.86,
            yPercent: -68 - index * 8,
            autoAlpha: 0.28,
            rotation: -3 * index,
            duration: 0.55,
            ease: "power3.out"
        }, t);

        // New card: slam in — rotation snaps, scale punches to 1.03 then settles
        timeline.fromTo(card,
            { yPercent: 150, autoAlpha: 0, scale: 0.78, rotation: 8, skewY: 2 },
            {
                yPercent: -50,
                autoAlpha: 1,
                scale: 1,
                rotation: 0,
                skewY: 0,
                duration: 0.55,
                ease: "power4.out"
            },
        t);
    });
}

function setupServiceCards() {
    if (!window.ScrollTrigger) return;
    const { gsap } = window;

    const rows = gsap.utils.toArray(".service-row");
    if (!rows.length) return;

    // Header entrance
    if (document.querySelector(".services-header")) {
        gsap.fromTo(".services-header > *",
            { autoAlpha: 0, y: 28 },
            {
                autoAlpha: 1, y: 0,
                duration: 0.7, stagger: 0.1, ease: "power3.out",
                scrollTrigger: { trigger: ".services-header", start: "top 85%", once: true }
            }
        );
    }

    // Rows reveal one by one — slide in from the left, numbers settle last
    gsap.set(rows, { autoAlpha: 0, x: -40 });
    gsap.to(rows, {
        autoAlpha: 1, x: 0,
        duration: 0.6,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".services-list",
            start: "top 80%",
            once: true
        }
    });
}

function setupServiceAreas() {
    if (!window.ScrollTrigger) return;
    const { gsap } = window;

    /* ── Headline entrance — preserves <br> and gradient span ──── */
    if (document.querySelector(".sa-headline")) {
        gsap.fromTo(".sa-headline",
            { y: 36, autoAlpha: 0, skewY: 2 },
            {
                y: 0, autoAlpha: 1, skewY: 0,
                duration: 0.85, ease: "power3.out",
                scrollTrigger: { trigger: ".sa-headline", start: "top 85%", once: true }
            }
        );
    }

    /* ── Stat block entrance — slide up + fade ─────────────────── */
    if (document.querySelector(".sa-stats")) {
        gsap.fromTo(".sa-stat",
            { y: 30, autoAlpha: 0 },
            {
                y: 0, autoAlpha: 1,
                duration: 0.6, stagger: 0.12,
                ease: "power3.out",
                scrollTrigger: { trigger: ".sa-stats", start: "top 88%", once: true }
            }
        );
    }

    /* ── Map hint pop-in ───────────────────────────────────────── */
    if (document.querySelector(".sa-map-hint")) {
        gsap.fromTo(".sa-map-hint",
            { y: 20, autoAlpha: 0, scale: 0.85 },
            {
                y: 0, autoAlpha: 1, scale: 1,
                duration: 0.55, ease: "back.out(1.6)",
                scrollTrigger: { trigger: ".service-areas-map-wrap", start: "top 70%", once: true }
            }
        );
    }

    /* ── City chip cascade ─────────────────────────────────────── */
    if (document.querySelectorAll(".sa-city-list li").length) {
        gsap.fromTo(".sa-city-list li",
            { y: 12, autoAlpha: 0, scale: 0.9 },
            {
                y: 0, autoAlpha: 1, scale: 1,
                duration: 0.4, stagger: 0.05,
                ease: "back.out(1.4)",
                scrollTrigger: { trigger: ".sa-city-list", start: "top 90%", once: true }
            }
        );
    }
}

function setupProcessAnimation() {
    if (!window.ScrollTrigger) return;

    const { gsap } = window;

    const steps     = gsap.utils.toArray(".active-step");
    const railItems = gsap.utils.toArray(".step-rail-item");
    if (!steps.length) return;

    // Roof pieces
    const deck     = document.querySelector("#roof-deck");
    const lines    = document.querySelector("#roof-lines");
    const shingles = gsap.utils.toArray("#roof-shingles path");
    const cap      = document.querySelector("#ridge-cap");

    if (deck)  gsap.set(deck,  { autoAlpha: 0, y: 18, scale: 0.96, transformOrigin: "center bottom" });
    if (lines) gsap.set(lines, { strokeDasharray: 440, strokeDashoffset: 440 });
    if (shingles.length) gsap.set(shingles, { autoAlpha: 0, x: -24 });
    if (cap)   gsap.set(cap,   { autoAlpha: 0, y: -30, rotation: -2, transformOrigin: "center center" });

    /* ── MOBILE ──────────────────────────────────────────────
       All steps render inline; just scrub the roof build through
       the section. No pinning, no slot-machine swap. */
    if (window.innerWidth <= 768) {
        gsap.set(steps, { clearProps: "all" });

        const mobileRoof = gsap.timeline({
            scrollTrigger: {
                trigger: ".process-section",
                start: "top 75%",
                end: "bottom 30%",
                scrub: 0.5,
                invalidateOnRefresh: true
            }
        });
        if (deck)  mobileRoof.to(deck,  { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: "power3.out" });
        if (lines) mobileRoof.to(lines, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, ">-0.2");
        if (shingles.length) mobileRoof.to(shingles, { autoAlpha: 1, x: 0, stagger: 0.18, duration: 0.55, ease: "power2.out" }, ">-0.2");
        if (cap)   mobileRoof.to(cap,   { autoAlpha: 1, y: 0, rotation: 0, duration: 0.7, ease: "back.out(1.6)" }, ">-0.15");
        return;
    }

    /* ── DESKTOP ─────────────────────────────────────────────
       Pin the section. As the user scrolls, swap the active step
       slot-machine style (current wipes up, next wipes in from
       below) and build the matching roof piece. */

    // Initial state — step 0 visible, others parked below the stage
    gsap.set(steps, { autoAlpha: 0, yPercent: 100 });
    gsap.set(steps[0], { autoAlpha: 1, yPercent: 0 });

    const railDim    = { color: "rgba(56,63,80,0.32)", duration: 0.4 };
    const railActive = { color: "#3088F4",             duration: 0.4 };

    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".process-section",
            pin: true,
            start: "top top",
            end: "+=2400",
            scrub: 1,
            invalidateOnRefresh: true
        }
    });

    // STEP 1 — INSPECTION: roof deck rises into place
    timeline.addLabel("inspection");
    if (deck) timeline.to(deck, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }, "<");
    timeline.to({}, { duration: 0.7 });

    // STEP 1 → STEP 2: blueprint lines draw on
    timeline.addLabel("proposal");
    timeline.to(steps[0], { autoAlpha: 0, yPercent: -100, duration: 0.6, ease: "power3.in" }, "<");
    timeline.fromTo(steps[1],
        { autoAlpha: 0, yPercent: 100 },
        { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: "power3.out" }, "<");
    if (railItems[0]) timeline.to(railItems[0], railDim, "<");
    if (railItems[1]) timeline.to(railItems[1], railActive, "<");
    if (lines) timeline.to(lines, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, "<");
    timeline.to({}, { duration: 0.7 });

    // STEP 2 → STEP 3: shingles cascade in
    timeline.addLabel("installation");
    timeline.to(steps[1], { autoAlpha: 0, yPercent: -100, duration: 0.6, ease: "power3.in" }, "<");
    timeline.fromTo(steps[2],
        { autoAlpha: 0, yPercent: 100 },
        { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: "power3.out" }, "<");
    if (railItems[1]) timeline.to(railItems[1], railDim, "<");
    if (railItems[2]) timeline.to(railItems[2], railActive, "<");
    if (shingles.length) timeline.to(shingles, {
        autoAlpha: 1, x: 0, stagger: 0.18, duration: 0.55, ease: "power2.out"
    }, "<");
    timeline.to({}, { duration: 0.7 });

    // STEP 3 → STEP 4: ridge cap snaps down
    timeline.addLabel("completion");
    timeline.to(steps[2], { autoAlpha: 0, yPercent: -100, duration: 0.6, ease: "power3.in" }, "<");
    timeline.fromTo(steps[3],
        { autoAlpha: 0, yPercent: 100 },
        { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: "power3.out" }, "<");
    if (railItems[2]) timeline.to(railItems[2], railDim, "<");
    if (railItems[3]) timeline.to(railItems[3], railActive, "<");
    if (cap) timeline.to(cap, {
        autoAlpha: 1, y: 0, rotation: 0, duration: 0.8, ease: "back.out(1.6)"
    }, "<");
    timeline.to({}, { duration: 1 });
    timeline.addLabel("end");
}

/* Generic stat count-up — any element with [data-count-to] */
function setupCountUps() {
    if (!window.ScrollTrigger) return;
    const { gsap } = window;

    const els = gsap.utils.toArray("[data-count-to]");
    els.forEach((el) => {
        const target = parseFloat(el.getAttribute("data-count-to") || "0");
        const suffix = el.getAttribute("data-count-suffix") || "";
        const counter = { value: 0 };

        gsap.to(counter, {
            value: target,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onUpdate: () => {
                el.textContent = Math.round(counter.value) + suffix;
            }
        });
    });
}

function setupReviews() {
    if (!window.ScrollTrigger) return;

    const { gsap } = window;
    const section = document.querySelector(".reviews-section");
    const track = document.querySelector(".reviews-track");

    if (!section || !track) return;

    const getDistance = () => Math.max(0, track.scrollWidth - window.innerWidth + 100);

    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            pin: true,
            start: "top top",
            end: () => `+=${getDistance()}`,
            scrub: 1,
            invalidateOnRefresh: true
        }
    });

    timeline.to(track, {
        x: () => -getDistance(),
        ease: "none"
    });

    timeline.to(".reviews-header", { autoAlpha: 0.35, duration: 0.5 }, 0);
}

function setupFaqReveal() {
    /* Cards rise + cascade in from the right as the rail enters viewport */
    if (!document.querySelector(".faq-card")) return;
    window.gsap.fromTo(".faq-card",
        { y: 36, autoAlpha: 0 },
        {
            scrollTrigger: scrollOnce(".faq-section", "top 80%"),
            y: 0,
            autoAlpha: 1,
            stagger: 0.08,
            duration: 0.55,
            ease: "power3.out"
        }
    );
}

function setupContactReveal() {
    if (!window.ScrollTrigger) return;

    window.gsap.timeline({
        scrollTrigger: {
            trigger: ".contact-section",
            start: "top 80%"
        }
    })
        .fromTo(".contact-info-block",
            { x: -80, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, duration: 0.8 }
        )
        .fromTo(".contact-form-block",
            { x: 80, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, duration: 0.8 },
            "<"
        )
        .fromTo(".form-row input, .form-row select, .form-row textarea, .contact-form-block .btn-primary",
            { y: 18, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, stagger: 0.08, ease: "back.out(1.35)" },
            "-=0.35"
        );
}

function gsapFromTo(targets, fromVars, toVars) {
    if (!document.querySelector(targets)) return;
    window.gsap.fromTo(targets, fromVars, toVars);
}

function scrollOnce(trigger, start) {
    if (!window.ScrollTrigger) return undefined;

    return {
        trigger,
        start,
        once: true
    };
}
