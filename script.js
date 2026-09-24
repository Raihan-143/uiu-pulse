/* ==========================================================================
   UIU Pulse — client-side interactivity only.
   All data, authentication, and page routing now live server-side in PHP.
   This file just handles progressive-enhancement UI: toasts, filters/search
   over already-rendered cards, bookmarking, and small widgets.
   ========================================================================== */

/* ================= Toast ================= */
function showToast(msg) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('leave'); setTimeout(() => t.remove(), 300); }, 3200);
}

/* ================= Small card actions ================= */
function toggleBookmark(btn) {
  const saved = btn.classList.toggle('saved');
  btn.textContent = saved ? '★' : (btn.textContent.includes('Save') ? '🔖 Save' : '🔖');
  showToast(saved ? 'Saved to bookmarks' : 'Removed from bookmarks');
}
function shareItem() {
  const link = window.location.href.split('#')[0] + '#s' + Date.now();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(() => showToast('Link copied to clipboard')).catch(() => showToast('Link copied to clipboard'));
  } else {
    showToast('Link copied to clipboard');
  }
}
function toggleActionBtn(btn, doneLabel, verb) {
  if (btn.disabled) return;
  btn.textContent = doneLabel;
  btn.disabled = true;
  showToast("You're now " + verb);
}
function toggleCalBtn(btn) {
  const added = btn.classList.toggle('added');
  btn.innerHTML = added ? '✓ Added' : '+ Cal';
  showToast(added ? 'Added to your calendar' : 'Removed from calendar');
}

/* ================= Achievement "read more" modal ================= */
function readFullStory(btn) {
  const modal = document.getElementById('story-modal');
  if (!modal) return;
  document.getElementById('story-modal-tag').textContent = btn.dataset.tag || '';
  document.getElementById('story-modal-date').textContent = '⭐ ' + (btn.dataset.date || '');
  document.getElementById('story-modal-title').textContent = btn.dataset.title || '';
  document.getElementById('story-modal-body').textContent = btn.dataset.full || '';
  modal.classList.add('open');
}
function closeStoryModal() {
  const modal = document.getElementById('story-modal');
  if (modal) modal.classList.remove('open');
}

/* ================= News page: search + category filter ================= */
let newsFilter = 'all';
function setNewsFilter(f, btn) {
  newsFilter = f;
  document.querySelectorAll('#page-news .pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  applyNewsFilter();
}
function applyNewsFilter() {
  const searchEl = document.getElementById('news-search');
  const q = (searchEl ? searchEl.value : '').toLowerCase().trim();
  const cards = document.querySelectorAll('#news-grid .news-card');
  let visible = 0;
  cards.forEach(card => {
    const matchCat = newsFilter === 'all' || card.dataset.cat === newsFilter;
    const matchQ = !q || (card.dataset.search || '').includes(q);
    const show = matchCat && matchQ;
    card.classList.toggle('hidden-card', !show);
    if (show) visible++;
  });
  const empty = document.getElementById('news-empty');
  if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
}
const newsSearchInput = document.getElementById('news-search');
if (newsSearchInput) newsSearchInput.addEventListener('input', applyNewsFilter);

/* ================= Home page: Upcoming Events filter ================= */
let homeEventFilter = 'All';
function setHomeEventFilter(f, btn) {
  homeEventFilter = f;
  document.querySelectorAll('#home-event-filters .pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const cards = document.querySelectorAll('#home-events-grid .ev-card');
  cards.forEach(card => {
    const show = homeEventFilter === 'All' || card.dataset.cat === homeEventFilter;
    card.classList.toggle('hidden-card', !show);
  });
}

/* ================= Campus Alerts: severity filter ================= */
let alertFilter = 'All';
function setAlertFilter(f, btn) {
  alertFilter = f;
  document.querySelectorAll('#page-alerts .pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const cards = document.querySelectorAll('#alerts-grid .alert-card');
  let visible = 0;
  cards.forEach(card => {
    const show = alertFilter === 'All' || card.dataset.sev === alertFilter;
    card.classList.toggle('hidden-card', !show);
    if (show) visible++;
  });
  const empty = document.getElementById('alerts-empty');
  if (empty) empty.style.display = visible === 0 ? 'block' : 'none';
}

/* ================= Login / register tab toggle ================= */
function showSignIn() {
  const tabIn = document.getElementById('tab-signin');
  const tabReg = document.getElementById('tab-register');
  const cardIn = document.getElementById('signin-card');
  const cardReg = document.getElementById('register-card');
  if (!tabIn) return;
  tabIn.classList.add('active');
  tabReg.classList.remove('active');
  cardIn.style.display = 'block';
  cardReg.style.display = 'none';
}
function showRegister() {
  const tabIn = document.getElementById('tab-signin');
  const tabReg = document.getElementById('tab-register');
  const cardIn = document.getElementById('signin-card');
  const cardReg = document.getElementById('register-card');
  if (!tabIn) return;
  tabReg.classList.add('active');
  tabIn.classList.remove('active');
  cardReg.style.display = 'block';
  cardIn.style.display = 'none';
}
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
  else { input.type = 'password'; btn.textContent = '👁'; }
}
function handleForgotPassword(e) {
  e.preventDefault();
  const email = prompt('Enter your UIU email to receive a password reset link:');
  if (email && email.trim()) {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    showToast(valid ? 'Password reset link sent to ' + email.trim() : 'Please enter a valid email address');
  }
}

/* ================= Navbar widgets (notifications / mobile nav) ================= */
function toggleNotifPanel() {
  const p = document.getElementById('notif-panel');
  if (!p) return;
  p.style.display = (p.style.display === 'block') ? 'none' : 'block';
  const dot = document.getElementById('notif-dot');
  if (dot) dot.style.display = 'none';
}
function toggleMobileNav() {
  const p = document.getElementById('mobile-nav');
  if (!p) return;
  p.style.display = (p.style.display === 'block') ? 'none' : 'block';
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('.notif-wrap')) {
    const p = document.getElementById('notif-panel');
    if (p) p.style.display = 'none';
  }
  if (!e.target.closest('.menu-wrap')) {
    const m = document.getElementById('mobile-nav');
    if (m) m.style.display = 'none';
  }
});

/* ================= Site-wide search ================= */
const siteSearchPages = [
  ['home.html', 'Home'], ['news.html', 'News'], ['events.html', 'Events'],
  ['achievements.html', 'Achievements'], ['research.html', 'Research'],
  ['competitions.html', 'Competitions'], ['alerts.html', 'Campus Alerts']
];

function siteSearchOverlay() {
  let overlay = document.getElementById('site-search-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'site-search-overlay';
  overlay.className = 'site-search-overlay';
  overlay.innerHTML = `
    <div class="site-search-panel" role="dialog" aria-modal="true" aria-label="Search UIU Pulse">
      <div class="site-search-head">
        <strong>Search UIU Pulse</strong>
        <button type="button" class="site-search-close" aria-label="Close search">&times;</button>
      </div>
      <input class="site-search-input" type="search" placeholder="Search news, events, research, alerts..." autocomplete="off">
      <div class="site-search-status">Search across all campus updates</div>
      <div class="site-search-results"></div>
    </div>`;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('.site-search-input');
  const results = overlay.querySelector('.site-search-results');
  const close = () => overlay.classList.remove('open');
  overlay.querySelector('.site-search-close').addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });

  function render(items, query) {
    results.replaceChildren();
    if (!query) return;
    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'site-search-empty';
      empty.textContent = 'No matching updates found.';
      results.appendChild(empty);
      return;
    }
    items.slice(0, 12).forEach(item => {
      const link = document.createElement('a');
      link.className = 'site-search-result';
      link.href = item.href;
      const title = document.createElement('b');
      title.textContent = item.title;
      const meta = document.createElement('span');
      meta.textContent = item.page;
      const snippet = document.createElement('small');
      snippet.textContent = item.snippet;
      link.append(title, meta, snippet);
      results.appendChild(link);
    });
  }

  async function search(query) {
    const normalized = query.trim().toLowerCase();
    const status = overlay.querySelector('.site-search-status');
    if (!normalized) { status.textContent = 'Search across all campus updates'; render([], ''); return; }
    status.textContent = 'Searching...';
    const found = [];
    await Promise.all(siteSearchPages.map(async ([file, page]) => {
      try {
        const response = await fetch(file);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const cards = [...doc.querySelectorAll('[data-item-key], .page-head, .page-title, .home-hero')];
        (cards.length ? cards : [doc.body]).forEach(card => {
          const text = card.textContent.replace(/\s+/g, ' ').trim();
          if (!text.toLowerCase().includes(normalized)) return;
          const heading = card.querySelector('h1,h2,h3,h4')?.textContent.trim() || page;
          const matchAt = text.toLowerCase().indexOf(normalized);
          const start = Math.max(0, matchAt - 45);
          found.push({
            title: heading,
            page,
            href: file + (card.dataset.itemKey ? '#item=' + encodeURIComponent(card.dataset.itemKey) : ''),
            snippet: (start ? '... ' : '') + text.slice(start, start + 150) + (text.length > start + 150 ? ' ...' : '')
          });
        });
      } catch (_) { /* A page unavailable locally should not break search. */ }
    }));
    status.textContent = `${found.length} result${found.length === 1 ? '' : 's'} found`;
    render(found, normalized);
  }

  input.addEventListener('input', () => search(input.value));
  overlay.openSearch = () => {
    overlay.classList.add('open');
    input.value = '';
    input.focus();
  };
  return overlay;
}

function focusPageSearch() {
  siteSearchOverlay().openSearch();
}
