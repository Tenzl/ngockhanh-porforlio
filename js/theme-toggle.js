/* Theme toggle — persists to localStorage, respects prefers-color-scheme,
   uses the View Transitions API where supported for a 280ms crossfade.
   The init that prevents FOUC lives inline in <head>; this script only
   wires up the button and reacts to system preference changes. */
(() => {
  const KEY = 'theme';
  const root = document.documentElement;

  const apply = (theme) => {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
  };

  const current = () =>
    root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

  const persist = (theme) => {
    try { localStorage.setItem(KEY, theme); } catch (_) {}
  };

  const updateButton = (btn) => {
    const isLight = current() === 'light';
    btn.setAttribute('aria-pressed', String(isLight));
    btn.setAttribute(
      'aria-label',
      isLight ? 'Switch to dark mode' : 'Switch to light mode',
    );
  };

  const swap = (btn) => {
    const next = current() === 'light' ? 'dark' : 'light';
    const commit = () => {
      apply(next);
      persist(next);
      updateButton(btn);
    };
    if (document.startViewTransition) {
      document.startViewTransition(commit);
    } else {
      commit();
    }
  };

  const setup = () => {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    updateButton(btn);

    btn.addEventListener('click', () => swap(btn));

    // Respect OS-level changes only when the user hasn't expressed a choice.
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onSystemChange = (e) => {
      let saved = null;
      try { saved = localStorage.getItem(KEY); } catch (_) {}
      if (saved === 'light' || saved === 'dark') return;
      apply(e.matches ? 'light' : 'dark');
      updateButton(btn);
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  };

  if (document.querySelector('.theme-toggle')) setup();
  else document.addEventListener('partials:loaded', setup, { once: true });
})();
