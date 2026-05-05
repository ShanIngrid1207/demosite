/* roof-repairs.js — page interactivity */

document.addEventListener('DOMContentLoaded', () => {
  /* FAQ flip cards — clicking a card toggles aria-pressed which the CSS
     uses to flip the card via 3D transform. Only one card open at a time. */
  const cards = document.querySelectorAll('.faq-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const open = card.getAttribute('aria-pressed') === 'true';
      cards.forEach(c => c.setAttribute('aria-pressed', 'false'));
      card.setAttribute('aria-pressed', open ? 'false' : 'true');
    });
  });

  /* Hero estimate form — placeholder submit */
  const form = document.querySelector('.hero-card form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = 'Thanks — we\'ll be in touch';
        btn.disabled = true;
        setTimeout(() => {
          btn.innerHTML = original;
          btn.disabled = false;
          form.reset();
        }, 3500);
      }
    });
  }
});
