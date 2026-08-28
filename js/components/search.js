// ── SEARCH ────────────────────────────────────────────────────────────────────
function openSearch() {
  $('search-overlay').classList.add('show');
  $('search-overlay').setAttribute('aria-hidden', 'false');
  $('search-input').focus();
}
function closeSearch() {
  $('search-overlay').classList.remove('show');
  $('search-overlay').setAttribute('aria-hidden', 'true');
  $('search-results').innerHTML = '';
  $('search-input').value = '';
}
function performSearch() {
  const query = $('search-input').value.toLowerCase();
  if (!query) { $('search-results').innerHTML = ''; return; }

  const results = {
    teams: data.teams.filter(t => t.name.toLowerCase().includes(query)),
    matches: data.matches.filter(m => {
      const ht = getTeam(m.home).name.toLowerCase();
      const at = getTeam(m.away).name.toLowerCase();
      return ht.includes(query) || at.includes(query) || (m.venue||'').toLowerCase().includes(query);
    }),
    players: (data.players||[]).filter(p => p.name.toLowerCase().includes(query)),
  };

  let html = '';
  if (results.teams.length > 0) {
    html += `<div class="search-group-label">Teams</div>`;
    html += results.teams.map(t => `
      <button type="button" class="search-result-item" style="border:none;background:none;font:inherit;text-align:left;width:100%" onclick="closeSearch();openTeamModal(${t.id})">
        <div style="width:32px;height:32px">${teamLogo(t,32)}</div>
        <div><div class="search-result-title">${escapeHtml(t.name)}</div><div class="search-result-sub">Group ${t.group}</div></div>
      </button>`).join('');
  }
  if (results.matches.length > 0) {
    html += `<div class="search-group-label">Matches</div>`;
    html += results.matches.map(m => {
      const ht = getTeam(m.home), at = getTeam(m.away);
      return `
        <button type="button" class="search-result-item" style="border:none;background:none;font:inherit;text-align:left;width:100%" onclick="closeSearch();openMatchModal(${m.id})">
          <div style="width:32px;display:flex;align-items:center;justify-content:center">${escapeHtml(getTeam(m.home).code)}</div>
          <div><div class="search-result-title">${escapeHtml(ht.name)} vs ${escapeHtml(at.name)}</div><div class="search-result-sub">${m.round||'Match'}</div></div>
        </button>`;
    }).join('');
  }
  if (results.players.length > 0) {
    html += `<div class="search-group-label">Players</div>`;
    html += results.players.map(p => {
      const t = getTeam(p.team);
      return `
        <button type="button" class="search-result-item" style="border:none;background:none;font:inherit;text-align:left;width:100%" onclick="closeSearch();openPlayerModal(${p.id})">
          <div style="width:32px;height:32px;border-radius:50%;background:${t.color};display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:800;color:#fff">${escapeHtml(t.code)}</div>
          <div><div class="search-result-title">${escapeHtml(p.name)}</div><div class="search-result-sub">${escapeHtml(t.name)} · ${p.position}</div></div>
        </button>`;
    }).join('');
  }
  if (!html) html = `<div class="tl-empty">No results found for "${query}"</div>`;
  $('search-results').innerHTML = html;
}

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
  if (e.key === 'Escape') closeSearch();
});

function improveFormLabelAssociations(root = document) {
  let generatedId = 0;
  root.querySelectorAll('label').forEach(label => {
    if (label.htmlFor) return;
    const next = label.nextElementSibling;
    if (!next || !next.matches('input, select, textarea')) return;
    if (!next.id) {
      generatedId += 1;
      next.id = `a11y-field-${generatedId}`;
    }
    label.htmlFor = next.id;
    if (!next.getAttribute('aria-label') && !next.getAttribute('aria-labelledby')) {
      const txt = (label.textContent || '').trim();
      if (txt) next.setAttribute('aria-label', txt);
    }
  });
}

/**
 * Safety net for any remaining non-button clickable elements (currently:
 * the mobile-nav and search-overlay backdrops, which use onclick purely to
 * close on an outside click and aren't meant to be reachable by keyboard
 * as standalone controls). Genuinely actionable UI — player cards, fixture
 * rows, search results, team badges, gallery photos — now use real
 * <button> elements instead of a div/span + onclick, so this no longer
 * needs to run continuously; see initAccessibilityEnhancements().
 */
function enhanceKeyboardAccessibility(root = document) {
  root.querySelectorAll('[onclick]:not(button):not(a):not(input):not(select):not(textarea)').forEach(el => {
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
  });
}

document.addEventListener('keydown', e => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  if ((e.key === 'Enter' || e.key === ' ') && target.getAttribute('role') === 'button') {
    e.preventDefault();
    target.click();
  }
});

/**
 * One-time accessibility pass, run once at startup.
 *
 * This used to re-run on every DOM mutation via a MutationObserver, because
 * a number of clickable "cards" (player cards, fixture rows, search results,
 * team badges, gallery photos) were plain <div>/<span> elements re-rendered
 * via innerHTML, and needed tabindex/role="button" re-applied every time
 * they were redrawn. Those elements are now real <button>s (native focus,
 * keyboard activation, and semantics for free), so there's no longer a
 * stream of newly-injected non-button clickables to keep patching — a
 * single pass at load time is enough. This also drops the cost of
 * re-scanning the whole document on every re-render.
 *
 * Form labels (admin panel inputs) are static markup present from page
 * load, not regenerated at runtime, so they only need associating once too.
 */
function initAccessibilityEnhancements() {
  improveFormLabelAssociations();
  enhanceKeyboardAccessibility();
}

