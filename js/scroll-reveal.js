/**
 * scroll-reveal.js
 *
 * IntersectionObserver-driven scroll reveals. Adds class `.in` to elements
 * with `.reveal` (single block fade+lift) or `.stagger` (children cascade).
 * Combined with CSS transitions in base.css for a clean cascade entry
 * without scroll listeners.
 *
 * Respects `prefers-reduced-motion: reduce` — CSS already disables motion,
 * we still add `.in` so opacity:0 is overridden and content stays visible.
 */
(() => {
  const setup = () => {
    const els = document.querySelectorAll('.reveal, .stagger');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    els.forEach((el) => io.observe(el));
  };

  if (document.querySelector('.reveal, .stagger')) {
    setup();
  } else {
    document.addEventListener('partials:loaded', setup, { once: true });
  }
})();
