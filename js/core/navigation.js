// ── NAVIGATION ────────────────────────────────────────────────────────────────
const NAV_MAP = {
  standings: 'nav-standings', matches: 'nav-fixtures', stats: null,
  groups: 'nav-groups', players: 'nav-players', scorers: 'nav-scorers',
  gallery: 'nav-gallery', news: 'nav-news', live: 'nav-live',
  about: 'nav-about', contact: 'nav-contact', admin: 'admin-nav-btn',
  bracket: 'nav-bracket', awards: 'nav-awards'
};

function setActiveNav(id) {
  $$('#desktop-nav button').forEach(b => {
    b.classList.remove('active');
    b.removeAttribute('aria-current');
  });
  const btn = $(NAV_MAP[id] || '');
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-current', 'page');
  }
}

function announceForScreenReader(message) {
  const live = $('sr-announcer');
  if (!live) return;
  live.textContent = '';
  setTimeout(() => { live.textContent = message; }, 30);
}

// Maps a section id to the render function responsible for populating it.
// Centralizing this avoids a long if/else chain and makes it obvious which
// sections are "dumb" (just toggled visible, e.g. hero/home) vs rendered.
//
// NOTE (multi-file split): this used to hold direct function references
// (e.g. `standings: renderStandings`). That relied on every render function
// being hoisted ahead of this line, which was true when everything lived in
// one <script> block. Now that each module is its own <script src>, a
// function declared in a file that loads *after* navigation.js is not yet
// defined when this object literal would be evaluated. Storing the function
// *names* and resolving them from `window` at call time (see showSection
// below) defers the lookup until a section is actually opened — by which
// point every script has loaded — so behavior is unchanged.
const SECTION_RENDERERS = {
  standings: 'renderStandings',
  matches:   'renderMatches',
  stats:     'renderStats',
  groups:    'renderGroups',
  players:   'renderPlayers',
  scorers:   'renderScorers',
  awards:    'renderAwards',
  news:      'renderNews',
  gallery:   'renderGallery',
  live:      'renderLive',
  bracket:   'renderBracket',
  admin:     'renderAdmin',
};

// Every render* function above fully repopulates its container from `data`
// on each call (none of them merge into or preserve prior DOM state), so a
// section's markup can be safely thrown away the moment you navigate off
// it — visiting it again just re-renders from scratch, identically. That
// lets us keep only the *active* section's content in the DOM instead of
// every section ever visited during the session, which was previously the
// single largest contributor to DOM size in Lighthouse audits.
//
// `admin` is deliberately excluded: several of its controls are static
// input fields (new-team-name, new-player-name, etc.) that hold in-progress
// text the admin is actively typing. Clearing them on nav-away would
// silently discard whatever the admin hadn't submitted yet, which is a
// data-loss bug, not a DOM optimization — so admin content is left mounted
// for the rest of the session once first rendered.
const SECTION_CONTAINERS = {
  standings: ['group-a-table', 'group-b-table'],
  matches:   ['matches-container'],
  stats:     ['stats-container'],
  groups:    ['groups-container'],
  players:   ['players-container'],
  scorers:   ['scorers-container'],
  awards:    ['awards-container'],
  news:      ['news-container'],
  gallery:   ['gallery-container'],
  live:      ['live-container'],
  bracket:   ['bracket-container'],
  // admin: intentionally omitted — see note above.
};

let _activeSectionId = null;

/**
 * Switches the visible section and (re)renders its content.
 * A render failure is caught and logged instead of leaving the UI in a
 * half-updated state with no feedback. Before switching, the outgoing
 * section's dynamic content is cleared (see SECTION_CONTAINERS) so the DOM
 * only ever holds one rendered section's worth of markup at a time.
 */
function showSection(id) {
  triggerPageProgress();
  $('hero').style.display = 'none';
  $('home-dashboard').style.display = 'none';

  if (_activeSectionId && _activeSectionId !== id) {
    const outgoingContainers = SECTION_CONTAINERS[_activeSectionId];
    if (outgoingContainers) {
      outgoingContainers.forEach(containerId => {
        const el = $(containerId);
        if (el) el.innerHTML = '';
      });
    }
  }
  _activeSectionId = id;

  $$('.section').forEach(s => s.classList.remove('active'));
  const sec = $(id);
  if (sec) sec.classList.add('active');
  setActiveNav(id);
  window.scrollTo(0, 0);

  const renderFn = window[SECTION_RENDERERS[id]];
  if (renderFn) {
    try {
      renderFn();
    } catch (err) {
      console.error(`Failed to render section "${id}":`, err);
    }
  }
  announceForScreenReader(`${id.charAt(0).toUpperCase() + id.slice(1)} section opened`);
}

function openMobileNav()  {
  const nav = $('mobile-nav');
  nav.classList.add('open');
  nav.setAttribute('aria-hidden', 'false');
  $('hamburger-btn')?.setAttribute('aria-expanded', 'true');
}
function closeMobileNav() {
  const nav = $('mobile-nav');
  nav.classList.remove('open');
  nav.setAttribute('aria-hidden', 'true');
  $('hamburger-btn')?.setAttribute('aria-expanded', 'false');
}

