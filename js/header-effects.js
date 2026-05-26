/**
 * header-effects.js
 *
 * Two responsibilities:
 *
 *   1. Toggle .scrolled on nav.top once the user clearly passes the hero
 *      edge. Uses two IntersectionObserver sentinels (hysteresis) so the
 *      class doesn't chatter on trackpad jitter around the threshold,
 *      which would interrupt the .62s pill morph mid-animation.
 *
 *   2. Drive the mobile menu: hamburger ↔ overlay, body scroll lock,
 *      ESC + link-click + viewport-widen close paths.
 *
 * Why IntersectionObserver and not window.addEventListener('scroll'):
 * IO callbacks are rAF-aligned by the browser, so we never run a scroll
 * handler on the main thread. Cheaper, smoother, and no manual throttling.
 */
(() => {
  const ADD_AT = 80;     // px scrolled before nav shrinks
  const REMOVE_AT = 36;  // px scroll position to release back to full pill

  const setup = () => {
    const nav = document.querySelector('nav.top');
    if (!nav) return;

    // ── 1. Scroll-state hysteresis ────────────────────────────────────────
    const makeSentinel = (height) => {
      const el = document.createElement('div');
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText =
        'position:absolute;top:0;left:0;width:1px;pointer-events:none;height:' +
        height + 'px';
      document.body.prepend(el);
      return el;
    };

    const addSentinel = makeSentinel(ADD_AT);
    const removeSentinel = makeSentinel(REMOVE_AT);

    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) nav.classList.add('scrolled');
    }, { threshold: 0 }).observe(addSentinel);

    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) nav.classList.remove('scrolled');
    }, { threshold: 0 }).observe(removeSentinel);

    // ── 2. Mobile menu ────────────────────────────────────────────────────
    const burger = nav.querySelector('.nav-burger');
    const menu = document.getElementById('mobile-menu');
    if (!burger || !menu) return;

    const setOpen = (open) => {
      burger.classList.toggle('open', open);
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
      // Lock background scroll while the overlay is up.
      document.body.style.overflow = open ? 'hidden' : '';
    };

    burger.addEventListener('click', () => {
      setOpen(!burger.classList.contains('open'));
    });

    // Close on any link click — links are hash anchors, so the browser
    // jumps to the section as the overlay fades out.
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => setOpen(false));
    });

    // ESC closes when open.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && burger.classList.contains('open')) {
        setOpen(false);
      }
    });

    // If the viewport widens past the mobile breakpoint while the overlay
    // is open (rotate device, resize window), close it so we never leave
    // the desktop nav competing with a phantom overlay.
    const mq = window.matchMedia('(min-width: 1101px)');
    const onMQ = (e) => { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', onMQ);
    else if (mq.addListener) mq.addListener(onMQ);
  };

  if (document.querySelector('nav.top')) {
    setup();
  } else {
    document.addEventListener('partials:loaded', setup, { once: true });
  }
})();
