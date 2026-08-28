// ── PWA: INSTALL & OFFLINE ───────────────────────────────────────────────────
let _deferredInstallPrompt = null;

function isStandaloneMode() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
}
function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function showInstallButtons() {
  const b1 = $('install-app-btn');
  const b2 = $('mobile-install-btn');
  if (b1) b1.style.display = 'inline-flex';
  if (b2) b2.style.display = 'block';
}
function hideInstallButtons() {
  const b1 = $('install-app-btn');
  const b2 = $('mobile-install-btn');
  if (b1) b1.style.display = 'none';
  if (b2) b2.style.display = 'none';
}

function triggerInstall() {
  if (_deferredInstallPrompt) {
    _deferredInstallPrompt.prompt();
    _deferredInstallPrompt.userChoice.finally(() => { _deferredInstallPrompt = null; hideInstallButtons(); });
    return;
  }
  if (isIOSDevice()) {
    alert('To install this app on your iPhone/iPad:\n\n1. Tap the Share icon in Safari\n2. Scroll down and tap "Add to Home Screen"');
    return;
  }
  alert('Open this site in Chrome or Edge on Android/desktop to install it, or use your browser\'s "Add to Home Screen" / "Install App" option.');
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _deferredInstallPrompt = e;
  showInstallButtons();
});

window.addEventListener('appinstalled', () => {
  _deferredInstallPrompt = null;
  hideInstallButtons();
});

if (!isStandaloneMode() && isIOSDevice()) showInstallButtons();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      // Expected to fail if opened directly as a local file:// path — offline support
      // and full installability require hosting index.html, manifest.json, sw.js and
      // the icon-*.png files together on a real http/https server.
      console.warn('Service worker not registered:', err.message);
    });
  });
}

