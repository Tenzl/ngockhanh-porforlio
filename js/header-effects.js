/**
 * header-effects.js
 *
 * Toggle class `.scrolled` lên `nav.top` khi user cuộn qua một ngưỡng nhỏ
 * — kích hoạt morph "giọt nước" trong CSS (max-width co lại, glass đậm hơn,
 * shadow hồng xuất hiện, brand mark thu nhỏ).
 *
 * Dùng IntersectionObserver trên 1 sentinel div ở đỉnh document thay vì
 * scroll listener — browser tự rAF-align, không spam main thread.
 *
 * Chờ event `partials:loaded` từ partials-loader.js vì nav được nạp động
 * (data-include); nếu chạy ngay khi script load, querySelector sẽ trả null.
 */
(() => {
  const SCROLL_THRESHOLD = 32; // px

  const setup = () => {
    const nav = document.querySelector('nav.top');
    if (!nav) return;

    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText =
      'position:absolute;top:0;left:0;width:1px;height:' +
      SCROLL_THRESHOLD + 'px;pointer-events:none';
    document.body.prepend(sentinel);

    const io = new IntersectionObserver(
      ([entry]) => nav.classList.toggle('scrolled', !entry.isIntersecting),
      { threshold: 0 }
    );
    io.observe(sentinel);
  };

  if (document.querySelector('nav.top')) {
    setup();
  } else {
    document.addEventListener('partials:loaded', setup, { once: true });
  }
})();
