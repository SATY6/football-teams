// ── THEME ─────────────────────────────────────────────────────────────────────
function getSystemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme() {
  const pref = localStorage.getItem('themePref') || 'system';
  const isDark = pref === 'dark' || (pref === 'system' && getSystemPrefersDark());
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

  const btn = $('theme-toggle-btn');
  if (btn) btn.textContent = isDark ? '🌙' : '☀️';

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', '#0A1F30');

  ['light','dark','system'].forEach(m => {
    const el = $(`theme-opt-${m}`);
    if (el) el.classList.toggle('active', m === pref);
    const mel = $(`mobile-theme-${m}`);
    if (mel) mel.classList.toggle('active', m === pref);
  });
}

function setThemePref(pref) {
  localStorage.setItem('themePref', pref);
  const isDark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

  // Update button states
  $$('.theme-menu-btn').forEach(b => b.classList.remove('active'));
  $(`theme-opt-${pref}`)?.classList.add('active');

  // Mobile
  $$('.mobile-theme-btn').forEach(b => b.classList.remove('active'));
  $(`mobile-theme-${pref}`)?.classList.add('active');

  // Close menu
  $('theme-menu').classList.remove('open');
}

function toggleThemeMenu(e) {
  e.stopPropagation();
  const menu = $('theme-menu');
  menu.classList.toggle('open');
  $('theme-toggle-btn')?.setAttribute('aria-expanded', menu.classList.contains('open') ? 'true' : 'false');
}

function closeThemeMenu() {
  $('theme-menu').classList.remove('open');
  $('theme-toggle-btn')?.setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', e => {
  const wrap = document.querySelector('.theme-toggle-wrap');
  if (wrap && !wrap.contains(e.target)) closeThemeMenu();
});

if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((localStorage.getItem('themePref') || 'system') === 'system') applyTheme();
  });
}

// Re-render the bracket if the viewport crosses a size breakpoint while
// it's the active section, so the SVG connectors stay aligned with the
// round/match sizing instead of drifting out of sync with a stale layout.
let _bracketResizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_bracketResizeTimer);
  _bracketResizeTimer = setTimeout(() => {
    const sec = $('bracket');
    if (sec && sec.classList.contains('active')) renderBracket();
  }, 200);
});

