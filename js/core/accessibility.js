// ── MICRO ANIMATIONS ─────────────────────────────────────────────────────────
// Ripple effect on any button-like element
document.addEventListener('click', function(e) {
  const el = e.target.closest('button, .btn, .search-icon-btn, .theme-menu-btn, .mobile-nav-btn, .mobile-theme-btn, .footer-social-btn, .search-close-btn, .hamburger, .mobile-nav-close, .search-result-item, .team-item');
  if (!el) return;
  spawnRipple(el, e);
});

function spawnRipple(el, e) {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement('span');
  ripple.className = 'ripple-el';
  ripple.style.width = ripple.style.height = size + 'px';
  const cx = (typeof e.clientX === 'number' && e.clientX !== 0) ? e.clientX : rect.left + rect.width/2;
  const cy = (typeof e.clientY === 'number' && e.clientY !== 0) ? e.clientY : rect.top + rect.height/2;
  ripple.style.left = (cx - rect.left - size/2) + 'px';
  ripple.style.top  = (cy - rect.top  - size/2) + 'px';

  const computed = getComputedStyle(el);
  if (computed.position === 'static') el.style.position = 'relative';
  if (computed.overflow !== 'hidden') el.style.overflow = 'hidden';

  el.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

// Top page-loading progress bar (fires on section navigation)
let _progressTimer = null;
function triggerPageProgress() {
  const bar = $('page-progress');
  if (!bar) return;
  clearTimeout(_progressTimer);
  bar.classList.remove('done');
  bar.style.width = '0%';
  requestAnimationFrame(() => { bar.style.width = '65%'; });
  _progressTimer = setTimeout(() => {
    bar.style.width = '100%';
    setTimeout(() => {
      bar.classList.add('done');
      setTimeout(() => { bar.style.width = '0%'; }, 300);
    }, 150);
  }, 120);
}

// Initial app loading skeleton — gives the first paint a moment of polish
function hideAppLoadingSkeleton() {
  const el = $('app-loading-skeleton');
  if (!el) return;
  el.classList.add('hide');
  setTimeout(() => el.remove(), 500);
}
// Safety net: never let the skeleton block the site if something above errors
setTimeout(hideAppLoadingSkeleton, 2500);

