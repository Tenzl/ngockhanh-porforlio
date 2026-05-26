/**
 * pdf-modal.js
 *
 * Generic "click this thing → PDF viewer modal" wiring.
 *
 * Usage in markup:
 *   <article data-pdf-trigger="path/to/file.pdf"
 *            data-pdf-title="Optional friendly title"
 *            role="button" tabindex="0">
 *     …card content…
 *   </article>
 *
 * The script wires up:
 *   • Click + keyboard (Enter / Space) on every trigger.
 *   • ESC + backdrop click + close button to dismiss.
 *   • Body scroll lock while open.
 *   • iframe src is cleared after the fade so the 14 MB PDF stops streaming
 *     once the user closes the viewer.
 *   • Focus is moved to the close button on open and returned to the trigger
 *     on close (basic a11y, no full focus trap).
 */
(() => {
  const init = () => {
    const modal = document.getElementById('pdf-modal');
    if (!modal) return;

    const frame = modal.querySelector('.pdf-modal-frame');
    const titleEl = modal.querySelector('.pdf-modal-title');
    const openBtn = modal.querySelector('.pdf-modal-open');
    const closeBtn = modal.querySelector('.pdf-modal-close');

    let lastFocused = null;

    const open = (url, title) => {
      if (!url) return;
      lastFocused = document.activeElement;

      titleEl.textContent = title || 'Project document';
      openBtn.href = url;
      // Set iframe src last so the load starts right before the animation.
      frame.src = url;

      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Move keyboard focus inside the modal.
      requestAnimationFrame(() => closeBtn.focus({ preventScroll: true }));
    };

    const close = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      // Wait for the fade-out before tearing the iframe down so the user
      // doesn't see a white flash mid-animation.
      setTimeout(() => { frame.src = ''; }, 400);

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus({ preventScroll: true });
      }
    };

    // ── Wire up triggers ─────────────────────────────────────────────────
    document.querySelectorAll('[data-pdf-trigger]').forEach((el) => {
      const fire = (e) => {
        e.preventDefault();
        open(el.dataset.pdfTrigger, el.dataset.pdfTitle);
      };

      el.addEventListener('click', fire);

      // Native <button>/<a> already fire `click` on Enter/Space — only wire
      // keydown for synthetic role="button" elements (the IBEC <article>).
      const isNative = el.tagName === 'BUTTON' || el.tagName === 'A';
      if (!isNative) {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') fire(e);
        });
      }
    });

    // ── Wire up close paths ──────────────────────────────────────────────
    closeBtn.addEventListener('click', close);

    // Click on the scrim (modal itself) but NOT the panel inside.
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
