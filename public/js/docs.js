// Documentation page: sidebar drawer, active section highlight, Show/Hide Output.
(function () {
  'use strict';

  const sidebar = document.getElementById('docsSidebar');
  const overlay = document.getElementById('docsOverlay');
  const menuBtn = document.getElementById('docsMenuBtn');
  const closeBtn = document.getElementById('docsClose');
  const links = Array.from(document.querySelectorAll('.side-link'));

  /* ---------- Mobile drawer ---------- */
  function setDrawer(open) {
    sidebar.classList.toggle('open', open);
    overlay.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', () => setDrawer(true));
  closeBtn.addEventListener('click', () => setDrawer(false));
  overlay.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setDrawer(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 980) setDrawer(false); });

  /* ---------- Active link ---------- */
  function setActive(id) {
    links.forEach((link) => {
      const isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  // Clicking a link: close the drawer and highlight at once (smooth scroll is CSS).
  links.forEach((link) => {
    link.addEventListener('click', () => {
      setActive(link.getAttribute('href').slice(1));
      if (window.innerWidth <= 980) setDrawer(false);
    });
  });

  // Scroll spy: highlight the section that crosses a band near the top.
  const sections = document.querySelectorAll('[data-section]');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-15% 0px -75% 0px' });
    sections.forEach((section) => spy.observe(section));
  }
  const firstId = location.hash ? location.hash.slice(1) : 'introduction';
  const startSection = document.getElementById(firstId);
  setActive(startSection && startSection.hasAttribute('data-section') ? firstId : 'introduction');

  /* ---------- Show / Hide Output ---------- */
  document.querySelectorAll('[data-toggle-output]').forEach((button) => {
    button.addEventListener('click', () => {
      const output = button.closest('.endpoint').querySelector('.output');
      const willShow = output.hidden;
      output.hidden = !willShow;
      button.textContent = willShow ? 'Hide Output' : 'Show Output';
      button.setAttribute('aria-expanded', String(willShow));
    });
  });
})();
