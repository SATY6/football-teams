// ── INIT ──────────────────────────────────────────────────────────────────────
initAccessibilityEnhancements();
applyTheme();
load();
buildHero();
$('tournament-name-display').textContent = data.tournamentName;
$('nav-home').classList.add('active');
$('nav-home').setAttribute('aria-current', 'page');
renderDashboard();
renderStandings();
renderFooter();
setTimeout(previewShield, 100);
setTimeout(hideAppLoadingSkeleton, 350);

// Close dropdown menus on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.theme-toggle-wrap')) {
    $('theme-menu').classList.remove('open');
  }
});
// Prevent mobile nav overlay close on button clicks
$('mobile-nav').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeMobileNav();
});
// Close search overlay on outside click
$('search-overlay').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeSearch();
});
