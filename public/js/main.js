// Shared behaviour for every page: mobile nav, syntax highlighting,
// copy-to-clipboard, reveal animations and animated counters.
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    const setNav = (open) => {
      navLinks.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    navToggle.addEventListener('click', () => setNav(!navLinks.classList.contains('open')));
    navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setNav(false); });
  }

  /* ---------- Syntax highlighting (tiny tokenizer, no libraries) ---------- */
  const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const JS_RE = /(\/\/.*$)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|\b(const|let|var|async|await|function|return|new|if|else|try|catch|for|of)\b|(\.?[A-Za-z_$][\w$]*)(?=\()|\b(\d+(?:\.\d+)?)\b/gm;
  const JS_CLASSES = [null, 'tok-com', 'tok-str', 'tok-kw', 'tok-fn', 'tok-num'];

  const JSON_RE = /(\/\/.*$)|("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)/gm;
  const JSON_CLASSES = [null, 'tok-com', 'tok-key', 'tok-str', 'tok-bool', 'tok-num'];

  function tokenize(source, regex, classes) {
    let out = '';
    let last = 0;
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(source))) {
      out += escapeHtml(source.slice(last, match.index));
      let cls = '';
      for (let i = 1; i < classes.length; i++) {
        if (match[i] !== undefined) { cls = classes[i]; break; }
      }
      out += `<span class="${cls}">${escapeHtml(match[0])}</span>`;
      last = regex.lastIndex;
      if (match[0] === '') regex.lastIndex++; // safety: never loop forever
    }
    return out + escapeHtml(source.slice(last));
  }

  function highlight(codeEl) {
    const text = codeEl.textContent;
    if (codeEl.classList.contains('hl-json')) {
      codeEl.innerHTML = tokenize(text, JSON_RE, JSON_CLASSES);
    } else {
      codeEl.innerHTML = tokenize(text, JS_RE, JS_CLASSES);
    }
  }
  document.querySelectorAll('code.hl').forEach(highlight);

  /* ---------- Copy to clipboard ---------- */
  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers or non-secure origins.
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    if (button) {
      const label = button.querySelector('span');
      const original = label ? label.textContent : '';
      button.classList.add('copied');
      if (label) label.textContent = 'Copied!';
      setTimeout(() => {
        button.classList.remove('copied');
        if (label) label.textContent = original;
      }, 1600);
    }
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const code = button.closest('.code').querySelector('code');
    copyText(code.textContent, button);
  });

  window.MockBase = { highlight, copyText };

  /* ---------- Reveal on scroll ---------- */
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduceMotion && counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        counterObserver.unobserve(el);
        const target = Number(el.dataset.count) || 0;
        const start = performance.now();
        const duration = 900;
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => counterObserver.observe(el));
  }
})();
