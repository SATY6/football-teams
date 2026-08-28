// ── HELPERS ───────────────────────────────────────────────────────────────────
// Small, generic utilities used throughout the file. Kept at the top so
// every section below can rely on them without forward-reference confusion
// (they're only ever called from event handlers / render functions that run
// after the whole script has parsed).

/** Shorthand for document.getElementById — cuts a very common repeated call
 *  down to a single character and keeps render code readable. */
const $ = id => document.getElementById(id);

/** Shorthand for document.querySelectorAll, scoped to `root` (defaults to
 *  the whole document) so it can also be used to query within a fragment. */
const $$ = (selector, root = document) => root.querySelectorAll(selector);

/**
 * Escapes HTML-significant characters in a string before it's interpolated
 * into an innerHTML template literal. Applied to any field that originates
 * from a free-text admin input (team/player names, news, sponsor names,
 * venues, etc.) so that a value like `<img src=x onerror=...>` renders as
 * inert text instead of executing. Non-string input (undefined, numbers)
 * is coerced to '' / stringified rather than throwing.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validates a user-entered URL (e.g. a sponsor link) before it's placed in
 * an href attribute. Only allows http(s) links through; anything else
 * (including a `javascript:` scheme, which would execute on click) falls
 * back to '#'. The result is also HTML-escaped for safe attribute use.
 */
function safeUrl(url) {
  if (!url) return '#';
  try {
    const parsed = new URL(String(url), window.location.href);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return escapeHtml(parsed.href);
    }
  } catch (e) { /* fall through to '#' below */ }
  return '#';
}

/**
 * Builds the HTML for a player's photo/avatar, falling back to a position
 * icon when no photo has been uploaded. This was previously duplicated
 * (with tiny inconsistencies) in four different render functions — squad
 * grid, player cards, the player modal, and the awards leaderboard.
 * @param {object} p - player record (needs .photo, .name, .position)
 * @param {object} [opts]
 * @param {string} [opts.iconSize='1.8rem'] - font-size for the fallback icon
 * @param {boolean} [opts.circular=false]   - round the photo (used in the player modal)
 * @returns {string} HTML for the photo/avatar
 */
function playerPhotoHTML(p, { iconSize = '1.8rem', circular = false } = {}) {
  if (p.photo) {
    const radius = circular ? ';border-radius:50%' : '';
    return `<img src="${p.photo}" alt="${escapeHtml(p.name)} portrait" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover${radius}">`;
  }
  return `<span style="font-size:${iconSize}">${posIcon(p.position)}</span>`;
}

// ── ALERTS ────────────────────────────────────────────────────────────────────
function showAlert(el, type, msg) {
  if (!el) return;
  el.className = `alert ${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(()=>{ el.style.display='none'; }, 3000);
}

