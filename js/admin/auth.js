// ── ADMIN AUTH ────────────────────────────────────────────────────────────────
//
// ⚠️  NOT REAL SECURITY — READ BEFORE RELYING ON THIS.
//
// This app is a single static HTML file with no backend/server. The
// password check below runs entirely in the visitor's browser: anyone can
// open DevTools, read ADMIN_PASSWORD in plain text, or simply edit
// `adminLoggedIn = false` to `true` in the console to bypass it completely.
// The "5 attempts" lockout is client-side state too — reloading the page
// resets it instantly.
//
// What this DOES do: hide the admin editing UI from casual visitors so the
// public-facing site stays clean and uneditable-by-accident.
// What this does NOT do: protect the tournament data from a determined or
// technical visitor, or provide any real access control.
//
// If genuine access control is ever required (e.g. this becomes a
// multi-user or publicly-hosted app rather than an export-and-share HTML
// file), authentication must move server-side — a client-side password
// can never provide real security, no matter how it's implemented.
//
let adminLoggedIn = false;
let adminAttempts = 0;
const ADMIN_PASSWORD = 'sliet@2026'; // Visible to anyone who views source — see notice above.
let _playerPhoto = null;
let _playerPhotoRemoved = false;
function openAdminLogin() {
  $('login-overlay').classList.add('show');
  $('login-overlay').setAttribute('aria-hidden', 'false');
  $('admin-pw-input').focus();
}
function closeLoginOverlay() {
  $('login-overlay').classList.remove('show');
  $('login-overlay').setAttribute('aria-hidden', 'true');
  $('admin-pw-input').value = '';
  $('login-error').textContent = '';
}
function attemptLogin() {
  const pw = $('admin-pw-input').value;
  const errorEl = $('login-error');
  const attemptsEl = $('login-attempts');

  if (adminAttempts >= 5) {
    errorEl.textContent = 'Too many attempts. Try again in 5 minutes.';
    return;
  }

  if (pw !== ADMIN_PASSWORD) {
    adminAttempts++;
    errorEl.textContent = 'Incorrect password.';
    attemptsEl.textContent = `Attempts: ${adminAttempts}/5`;
    $('admin-pw-input').value = '';
    return;
  }

  adminLoggedIn = true;
  adminAttempts = 0;
  closeLoginOverlay();
  showSection('admin');

  // Show admin UI elements
  $('logout-btn').classList.add('show');
  $('mobile-logout-btn').style.display = 'block';
  $('gallery-upload-btn').style.display = 'inline-flex';

  renderAdmin();
}
function adminLogout() {
  adminLoggedIn = false;
  $('logout-btn').classList.remove('show');
  $('mobile-logout-btn').style.display = 'none';
  $('gallery-upload-btn').style.display = 'none';
  goHome();
}
function togglePwVisibility() {
  const input = $('admin-pw-input');
  input.type = input.type === 'password' ? 'text' : 'password';
}

