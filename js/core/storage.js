// ── EMBEDDED DATA (auto-updated on every save) ────────────────────────────────
const SAVED_DATA = null; // DATA_PLACEHOLDER

let data = (SAVED_DATA && SAVED_DATA.teams)
  ? JSON.parse(JSON.stringify(SAVED_DATA))
  : JSON.parse(JSON.stringify(DEFAULT_DATA));

// Tracks whether changes have been written to localStorage but not yet
// baked into the downloaded file via saveToFile() — used to warn the
// admin before they lose edits (e.g. by opening the original file again
// on another device, where SAVED_DATA is still the old baked-in copy).
let _hasUnsavedFileChanges = false;

function updateUnsavedFileBanner() {
  const banner = $('unsaved-file-banner');
  if (!banner) return;
  banner.style.display = _hasUnsavedFileChanges ? 'flex' : 'none';
}

/**
 * Persists the in-memory `data` object to localStorage as a fallback copy
 * (the primary save path is exporting/downloading the JSON file from the
 * admin panel). Marks the unsaved-changes banner so the admin knows this
 * browser has edits that haven't been baked into a downloaded file yet.
 */
function save() {
  try {
    localStorage.setItem('ftdata', JSON.stringify(data));
  } catch (err) {
    // Most likely a full/blocked storage (e.g. private browsing, quota
    // exceeded). Not fatal — data still lives in memory for this session —
    // but worth surfacing so it's not a silent failure during debugging.
    console.warn('Could not save to localStorage:', err);
  }
  _hasUnsavedFileChanges = true;
  updateUnsavedFileBanner();
  renderFooter();
}

