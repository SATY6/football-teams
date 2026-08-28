// ── MATCH MODAL ───────────────────────────────────────────────────────────────
let _modalMatchId = null;

const EV_ICONS = { goal:'⚽', yellow:'🟨', red:'🟥', sub:'🔄', penalty:'🎯', owngoal:'😬' };
const EV_LABELS = { goal:'Goal', yellow:'Yellow Card', red:'Red Card', sub:'Substitution', penalty:'Penalty', owngoal:'Own Goal' };

function openMatchModal(id) {
  _modalMatchId = id;
  const m  = data.matches.find(x=>x.id===id);
  if (!m) return;
  const ht = getTeam(m.home), at = getTeam(m.away);

  // Header
  $('md-round').textContent = m.round || '—';
  $('md-status-tag').textContent =
    m.status==='live' ? '🔴 LIVE' : m.status==='completed' ? '✅ Full Time (40\')' : '🕐 Upcoming';

  // Scoreboard
  $('md-home-logo').innerHTML = teamLogo(ht, 56);
  $('md-away-logo').innerHTML = teamLogo(at, 56);
  $('md-home-name').textContent = ht.name;
  $('md-away-name').textContent = at.name;
  $('md-sb-score').textContent =
    (m.status==='completed'||m.status==='live') ? `${m.homeScore} – ${m.awayScore}` : 'VS';
  const { day, time } = smartDate(m.datetime);
  $('md-sb-meta').textContent = `${day}${time?' · '+time:''}`;

  // Info chips
  const chips = [];
  if (m.venue)   chips.push(`📍 ${escapeHtml(m.venue)}`);
  if (m.weather) chips.push(m.weather);
  if (m.referee) chips.push(`🧑‍⚖️ ${escapeHtml(m.referee)}`);
  $('md-chips').innerHTML = chips.map(c=>`<span class="md-chip">${c}</span>`).join('');

  // Admin tab visibility
  $('md-admin-tab').style.display = adminLoggedIn ? '' : 'none';

  // Show modal
  $('match-modal').classList.add('open');
  $('match-modal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Load tabs
  mdTab('timeline', document.querySelector('.md-tab'));
  renderModalTimeline(m, ht, at);
  renderModalStats(m, ht, at);
  if (adminLoggedIn) renderModalAdminEvents(m, ht, at);

  // Populate admin team names
  document.querySelector('#ev-team option[value="home"]').textContent = ht.name;
  document.querySelector('#ev-team option[value="away"]').textContent = at.name;

  // Load existing stats into inputs
  const st = m.stats || {};
  ['possession','shots','shotsOnTarget','corners','fouls','offsides'].forEach(k=>{
    const hEl = $(`ms-home-${k}`);
    const aEl = $(`ms-away-${k}`);
    if(hEl) hEl.value = st[k]?.[0]??'';
    if(aEl) aEl.value = st[k]?.[1]??'';
  });
}

function closeMatchModal() {
  $('match-modal').classList.remove('open');
  $('match-modal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  _modalMatchId = null;
}

function mdTab(name, btn) {
  $$('.md-tab').forEach(b=>b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const tabs = { timeline:0, stats:1, admin:2 };
    $$('.md-tab')[tabs[name]]?.classList.add('active');
  }
  ['timeline','stats','admin'].forEach(t=>{
    const p = $(`md-panel-${t}`);
    if (p) p.style.display = t===name ? '' : 'none';
  });
}

function renderModalTimeline(m, ht, at) {
  const events = [...(m.events||[])].sort((a,b)=>a.minute-b.minute);
  const el = $('md-timeline-content');

  if (events.length === 0 && m.status === 'upcoming') {
    el.innerHTML = `<div class="tl-empty">⏳ Match hasn't started yet.<br>Events will appear here once the match begins.</div>`; return;
  }
  if (events.length === 0) {
    el.innerHTML = `<div class="tl-empty">No events recorded yet.<br>Login as admin to add goals, cards, and substitutions.</div>`; return;
  }

  // Team header row
  let html = `<div class="tl-centre-line"><span class="tl-centre-label" style="color:${ht.color}">${escapeHtml(ht.name)}</span><span class="tl-centre-label">TIMELINE</span><span class="tl-centre-label" style="color:${at.color||'#c0392b'}">${escapeHtml(at.name)}</span></div>`;

  // Halftime divider at 20 mins (2×20 format)
  let htShown = false;
  events.forEach(ev => {
    if (!htShown && ev.minute > 20) {
      html += `<div class="tl-centre-line"><span class="tl-centre-label">— Half Time (20') —</span></div>`;
      htShown = true;
    }
    const side   = ev.team === 'home' ? 'tl-home' : 'tl-away';
    const icon   = EV_ICONS[ev.type] || '•';
    const label  = EV_LABELS[ev.type] || ev.type;
    const sub2   = ev.type==='sub' && ev.playerOut ? ` ↑ ${ev.player} ↓ ${ev.playerOut}` : '';
    html += `<div class="tl-event ${side}">
      <div class="tl-minute">${ev.minute}'</div>
      <div style="width:20px;flex-shrink:0"></div>
      <div class="tl-icon ${ev.type}">${icon}</div>
      <div class="tl-text">
        <div class="tl-player">${ev.player||''}${sub2}</div>
        <div class="tl-event-label">${label}</div>
      </div>
    </div>`;
  });

  el.innerHTML = html;
}

function renderModalStats(m, ht, at) {
  const st  = m.stats || {};
  const el  = $('md-stats-content');
  const keys = ['possession','shots','shotsOnTarget','corners','fouls','offsides'];
  const labels = { possession:'Possession %', shots:'Shots', shotsOnTarget:'Shots on Target', corners:'Corners', fouls:'Fouls', offsides:'Offsides' };

  if (!m.stats || Object.keys(m.stats).length===0) {
    el.innerHTML = `<div class="tl-empty">📊 No match stats recorded yet.<br>Admin can add stats from the Edit tab.</div>`; return;
  }

  el.innerHTML = keys.map(k=>{
    const hv = st[k]?.[0]??0, av = st[k]?.[1]??0;
    const tot = hv+av || 1;
    const hp  = Math.round(hv/tot*100), ap = 100-hp;
    return `<div class="ms-row">
      <div class="ms-val" style="color:${ht.color||'var(--green-dark)'}">${hv}${k==='possession'?'%':''}</div>
      <div class="ms-bar-wrap">
        <div class="ms-label">${labels[k]}</div>
        <div class="ms-bar-track">
          <div class="ms-bar-home" style="width:${hp}%"></div>
          <div class="ms-bar-away" style="width:${ap}%"></div>
        </div>
      </div>
      <div class="ms-val" style="color:${at.color||'#c0392b'}">${av}${k==='possession'?'%':''}</div>
    </div>`;
  }).join('');
}

function renderModalAdminEvents(m, ht, at) {
  const events = [...(m.events||[])].sort((a,b)=>a.minute-b.minute);
  const el = $('md-events-list');
  el.innerHTML = events.length===0
    ? '<div style="color:var(--muted);font-size:0.82rem">No events yet.</div>'
    : events.map((ev,i)=>`
      <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.82rem">
        <span>${EV_ICONS[ev.type]||'•'}</span>
        <span style="font-weight:700">${ev.minute}'</span>
        <span style="flex:1">${ev.player||''}${ev.playerOut?' / '+ev.playerOut:''}</span>
        <span style="color:var(--muted);font-size:0.72rem">${ev.team==='home'?ht.name:at.name}</span>
        <button class="btn btn-danger btn-sm" onclick="removeMatchEvent(${m.id},${i})">✕</button>
      </div>`).join('');
}

function toggleEvPlayer() {
  const type = $('ev-type').value;
  $('ev-sub-row').style.display = type==='sub' ? '' : 'none';
}

function addMatchEvent() {
  const m = data.matches.find(x=>x.id===_modalMatchId);
  if (!m) return;
  const type      = $('ev-type').value;
  const team      = $('ev-team').value;
  const minute    = parseInt($('ev-minute').value)||1;
  const player    = $('ev-player').value.trim();
  const playerOut = $('ev-player-out').value.trim();
  if (!m.events) m.events = [];
  m.events.push({ type, team, minute, player, playerOut: playerOut||undefined });
  // Auto update score for goals
  if (type==='goal'||type==='penalty') {
    if(team==='home') m.homeScore=(m.homeScore||0)+1;
    else m.awayScore=(m.awayScore||0)+1;
  }
  if (type==='owngoal') {
    if(team==='home') m.awayScore=(m.awayScore||0)+1;
    else m.homeScore=(m.homeScore||0)+1;
  }
  save();
  const ht=getTeam(m.home),at=getTeam(m.away);
  renderModalTimeline(m,ht,at);
  renderModalAdminEvents(m,ht,at);
  $('md-sb-score').textContent = `${m.homeScore} – ${m.awayScore}`;
  showAlert($('md-admin-alert'),'success','Event added!');
  $('ev-player').value='';
  $('ev-minute').value='';
  $('ev-player-out').value='';
}

function removeMatchEvent(matchId, idx) {
  const m = data.matches.find(x=>x.id===matchId);
  if (!m||!m.events) return;
  m.events.splice(idx,1);
  save();
  const ht=getTeam(m.home),at=getTeam(m.away);
  renderModalTimeline(m,ht,at);
  renderModalAdminEvents(m,ht,at);
}

function saveMatchStats() {
  const m = data.matches.find(x=>x.id===_modalMatchId);
  if (!m) return;
  if (!m.stats) m.stats = {};
  ['possession','shots','shotsOnTarget','corners','fouls','offsides'].forEach(k=>{
    const hv = parseInt($(`ms-home-${k}`)?.value)||0;
    const av = parseInt($(`ms-away-${k}`)?.value)||0;
    m.stats[k] = [hv,av];
  });
  save();
  const ht=getTeam(m.home),at=getTeam(m.away);
  renderModalStats(m,ht,at);
  showAlert($('md-admin-alert'),'success','Stats saved!');
}

// Close modal on backdrop click
$('match-modal').addEventListener('click', function(e){
  if (e.target === this) closeMatchModal();
});

