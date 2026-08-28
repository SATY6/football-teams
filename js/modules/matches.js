// ── MATCHES ───────────────────────────────────────────────────────────────────
/**
 * Looks up a team by id, returning a safe placeholder object instead of
 * `undefined` if the id doesn't match anything — this lets callers read
 * `.name` / `.color` etc. without needing a null check at every call site.
 */
function getTeam(id) { return data.teams.find(t => t.id === id) || {name:'Unknown',code:'?',color:'#999',shield:'classic',emblem:'⚽'}; }

function filterByVenue(venue) {
  _venueFilter = venue;
  $('match-filter').value = 'all';
  showSection('matches');
}

function clearVenueFilter() {
  _venueFilter = null;
  renderMatches();
}

function smartDate(datetime) {
  if (!datetime) return { day:'TBD', time:'' };
  const dt  = new Date(datetime);
  const now = new Date();
  const diffD = Math.floor((dt - now) / 86400000);
  const time  = dt.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
  const date  = dt.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
  if (diffD === 0)  return { day:'Today',    time };
  if (diffD === 1)  return { day:'Tomorrow', time };
  if (diffD === -1) return { day:'Yesterday',time };
  return { day: date, time };
}

function renderMatches() {
  const filter = $('match-filter').value;
  let matches = [...data.matches].sort((a,b) => new Date(a.datetime) - new Date(b.datetime));
  if (filter !== 'all') matches = matches.filter(m => m.status === filter);
  if (_venueFilter) matches = matches.filter(m => (m.venue||'') === _venueFilter);

  const chip = $('venue-filter-chip');
  if (chip) {
    if (_venueFilter) { chip.style.display = 'inline-block'; chip.textContent = `📍 ${_venueFilter} ✕`; }
    else chip.style.display = 'none';
  }

  const groups = {};
  matches.forEach(m => { const g = m.round||'Other'; if(!groups[g]) groups[g]=[]; groups[g].push(m); });

  const container = $('matches-container');
  container.innerHTML = '';

  if (matches.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:3rem;background:var(--card);border-radius:12px;border:1px solid var(--border);color:var(--muted)">
      <div style="font-size:2.5rem;margin-bottom:10px">📅</div>
      <div style="font-weight:700;color:var(--text);margin-bottom:4px">No Matches Found</div>
      <div style="font-size:0.85rem">Try a different filter or schedule matches in Admin.</div>
    </div>`;
    return;
  }

  Object.entries(groups).forEach(([round, ms]) => {
    const label = document.createElement('div');
    label.className = 'group-label';
    label.innerHTML = `⚽ ${round}`;
    container.appendChild(label);

    ms.forEach(m => {
      const ht = getTeam(m.home), at = getTeam(m.away);
      const { day, time } = smartDate(m.datetime);
      const isLive      = m.status === 'live';
      const isCompleted = m.status === 'completed';
      const isUpcoming  = m.status === 'upcoming';

      const card = document.createElement('div');
      card.className = 'fixture-card';
      if (isLive) card.classList.add('fixture-live');

      // Goals by team from timeline
      const events  = m.events || [];
      const hGoals  = events.filter(e=>e.type==='goal'&&e.team==='home').map(e=>`${e.minute}'`).join(', ');
      const aGoals  = events.filter(e=>e.type==='goal'&&e.team==='away').map(e=>`${e.minute}'`).join(', ');
      const hYellow = events.filter(e=>e.type==='yellow'&&e.team==='home').length;
      const aYellow = events.filter(e=>e.type==='yellow'&&e.team==='away').length;
      const hRed    = events.filter(e=>e.type==='red'&&e.team==='home').length;
      const aRed    = events.filter(e=>e.type==='red'&&e.team==='away').length;

      card.innerHTML = `
        <!-- TOP BAR -->
        <div class="fixture-topbar">
          <span class="fixture-round-tag">${round}</span>
          <span class="fixture-status-tag ${isLive?'fixture-live-tag':isCompleted?'fixture-ft-tag':'fixture-up-tag'}">
            ${isLive?'🔴 LIVE':isCompleted?'✅ Full Time (40\')':'🕐 Upcoming'}
          </span>
          ${isLive?'<span class="fixture-live-pulse"></span>':''}
        </div>

        <!-- MAIN MATCH ROW -->
        <div class="fixture-main">

          <!-- HOME TEAM -->
          <div class="fixture-team fixture-home">
            <div class="fixture-logo">${teamLogo(ht, 64)}</div>
            <div class="fixture-team-name">${escapeHtml(ht.name)}</div>
            <div class="fixture-cards-row">
              ${hYellow>0?`<span class="fixture-card-icon yellow">${hYellow}🟨</span>`:''}
              ${hRed>0?`<span class="fixture-card-icon red">${hRed}🟥</span>`:''}
            </div>
            ${hGoals?`<div class="fixture-goal-times">${hGoals}</div>`:''}
          </div>

          <!-- SCORE / VS -->
          <div class="fixture-score-col">
            ${isCompleted||isLive
              ? `<div class="fixture-score-box">
                  <span class="fixture-score-num ${isLive?'fixture-score-live':''}">${m.homeScore}</span>
                  <span class="fixture-score-sep">–</span>
                  <span class="fixture-score-num ${isLive?'fixture-score-live':''}">${m.awayScore}</span>
                 </div>`
              : `<div class="fixture-vs-box"><span class="fixture-vs-text">VS</span></div>`}
            <div class="fixture-datetime">
              <span class="fixture-day">${day}</span>
              ${time?`<span class="fixture-time">${time}</span>`:''}
            </div>
          </div>

          <!-- AWAY TEAM -->
          <div class="fixture-team fixture-away">
            <div class="fixture-logo">${teamLogo(at, 64)}</div>
            <div class="fixture-team-name">${escapeHtml(at.name)}</div>
            <div class="fixture-cards-row">
              ${aYellow>0?`<span class="fixture-card-icon yellow">${aYellow}🟨</span>`:''}
              ${aRed>0?`<span class="fixture-card-icon red">${aRed}🟥</span>`:''}
            </div>
            ${aGoals?`<div class="fixture-goal-times">${aGoals}</div>`:''}
          </div>
        </div>

        <!-- BOTTOM INFO BAR -->
        <div class="fixture-infobar">
          ${m.venue    ? `<span class="fixture-info-chip">📍 ${escapeHtml(m.venue)}</span>`   : ''}
          ${m.weather  ? `<span class="fixture-info-chip">${m.weather}</span>`    : ''}
          ${m.referee  ? `<span class="fixture-info-chip">🧑‍⚖️ ${escapeHtml(m.referee)}</span>` : ''}
          ${(m.stats?.possession)?`<span class="fixture-info-chip">🏃 ${m.stats.possession[0]}% – ${m.stats.possession[1]}%</span>`:''}
        </div>

        <!-- VIEW DETAILS BUTTON -->
        <div class="fixture-footer">
          <button class="fixture-detail-btn" onclick="openMatchModal(${m.id})">
            ${isCompleted||isLive ? '📊 Match Details' : '📋 Match Info'}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>`;

      container.appendChild(card);
    });
  });
}

