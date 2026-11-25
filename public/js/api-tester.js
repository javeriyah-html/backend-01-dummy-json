// "Try It" panels in the documentation. Every request goes to the real backend.
(function () {
  'use strict';

  const STATUS_TEXT = { 200: 'OK', 400: 'Bad Request', 404: 'Not Found', 500: 'Internal Server Error' };

  document.querySelectorAll('[data-endpoint]').forEach(setup);

  function setup(endpoint) {
    const slug = endpoint.dataset.slug;
    const isList = endpoint.dataset.kind === 'list';

    const toggle = endpoint.querySelector('[data-toggle-tester]');
    const panel = endpoint.querySelector('.tester');
    const urlInput = panel.querySelector('.t-url');
    const limitInput = panel.querySelector('.t-limit');
    const skipInput = panel.querySelector('.t-skip');
    const idInput = panel.querySelector('.t-id');
    const sendBtn = panel.querySelector('.t-send');
    const sendLabel = panel.querySelector('.t-send-label');
    const result = panel.querySelector('.tester-result');
    const statusPill = panel.querySelector('.t-status');
    const timeLabel = panel.querySelector('.t-time');
    const bodyEl = panel.querySelector('.t-body');
    const copyBtn = panel.querySelector('.t-copy');

    // Builds the URL from the small form fields.
    function buildUrl() {
      const base = `${location.origin}/api/${slug}`;
      if (isList) {
        const params = new URLSearchParams();
        if (limitInput.value.trim() !== '') params.set('limit', limitInput.value.trim());
        if (skipInput.value.trim() !== '') params.set('skip', skipInput.value.trim());
        const query = params.toString();
        return query ? `${base}?${query}` : base;
      }
      return `${base}/${encodeURIComponent(idInput.value.trim() || ':id')}`;
    }

    [limitInput, skipInput, idInput].forEach((input) => {
      if (input) input.addEventListener('input', () => { urlInput.value = buildUrl(); });
    });

    toggle.addEventListener('click', () => {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      toggle.setAttribute('aria-expanded', String(willOpen));
      toggle.textContent = willOpen ? 'Close Try It' : 'Try It';
      if (willOpen && !urlInput.value) urlInput.value = buildUrl();
    });

    function showResult(status, ok, text, ms) {
      result.hidden = false;
      statusPill.textContent = status;
      statusPill.className = 'status-pill t-status ' + (ok ? 'ok' : 'err');
      timeLabel.textContent = ms === null ? '' : `${ms} ms`;
      bodyEl.textContent = text;
      window.MockBase.highlight(bodyEl);
    }

    async function send() {
      let url;
      try {
        url = new URL(urlInput.value.trim(), location.origin);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Only http and https URLs are allowed.');
      } catch (err) {
        showResult('Invalid URL', false, 'Enter a full URL such as ' + location.origin + '/api/' + slug, null);
        return;
      }

      sendBtn.disabled = true;
      sendBtn.classList.add('loading');
      sendLabel.textContent = 'Sending...';
      showResult('Loading', true, 'Waiting for the server...', null);
      statusPill.className = 'status-pill t-status';

      const started = performance.now();
      try {
        const response = await fetch(url.href, { method: 'GET', headers: { Accept: 'application/json' } });
        const raw = await response.text();
        let pretty = raw;
        try { pretty = JSON.stringify(JSON.parse(raw), null, 2); } catch (e) { /* not JSON, show as is */ }
        const label = `${response.status} ${response.statusText || STATUS_TEXT[response.status] || ''}`.trim();
        showResult(label, response.ok, pretty, Math.round(performance.now() - started));
      } catch (err) {
        showResult('Network error', false, 'Could not reach the server: ' + err.message, null);
      } finally {
        sendBtn.disabled = false;
        sendBtn.classList.remove('loading');
        sendLabel.textContent = 'Send request';
      }
    }

    sendBtn.addEventListener('click', send);
    urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
    copyBtn.addEventListener('click', () => window.MockBase.copyText(bodyEl.textContent, copyBtn));
  }
})();
