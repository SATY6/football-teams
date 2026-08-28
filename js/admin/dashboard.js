// ── ADMIN ─────────────────────────────────────────────────────────────────────
// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
function renderAdminDashboard() {
  const teams = data.teams || [];
  const players = data.players || [];
  const matches = data.matches || [];
  const completed = matches.filter(m => m.status === 'completed');
  const upcoming = matches.filter(m => m.status === 'upcoming').sort((a,b)=>new Date(a.datetime)-new Date(b.datetime));
  const live = matches.filter(m => m.status === 'live');
  const totalGoals = completed.reduce((s,m)=>s+(m.homeScore||0)+(m.awayScore||0), 0);

  // Stat cards
  const statsGrid = $('admin-stats-grid');
  const stats = [
    ['👕','Teams', teams.length],
    ['👟','Players', players.length],
    ['⚽','Matches Played', completed.length],
    ['📅','Upcoming', upcoming.length],
    ['🔴','Live Now', live.length],
    ['🥅','Total Goals', totalGoals],
    ['🖼','Gallery Photos', (data.gallery||[]).length],
    ['📰','News Posts', (data.news||[]).length],
  ];
  statsGrid.innerHTML = stats.map(([icon,label,val]) => `
    <div class="card" style="padding:14px;text-align:center;margin-bottom:0">
      <div style="font-size:1.4rem;margin-bottom:4px">${icon}</div>
      <div style="font-family:var(--font-display);font-size:1.7rem;font-weight:800;color:var(--green-dark)">${val}</div>
      <div style="font-size:0.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-weight:600">${label}</div>
    </div>`).join('');

  // Notifications
  const notes = [];
  const now = new Date();
  const overdue = matches.filter(m => m.status === 'upcoming' && m.datetime && new Date(m.datetime) < now);
  if (overdue.length) notes.push({ icon:'⏰', text:`${overdue.length} match${overdue.length===1?'':'es'} ${overdue.length===1?'is':'are'} past kickoff time but still marked "Upcoming" — update the score or status.`, type:'warn' });
  const noVenue = matches.filter(m => m.status !== 'completed' && !m.venue);
  if (noVenue.length) notes.push({ icon:'📍', text:`${noVenue.length} match${noVenue.length===1?'':'es'} missing a venue.`, type:'warn' });
  const emptyTeams = teams.filter(t => !players.some(p => p.team === t.id));
  if (emptyTeams.length) notes.push({ icon:'👥', text:`${emptyTeams.length} team${emptyTeams.length===1?'':'es'} — ${emptyTeams.map(t=>t.name).join(', ')} — ${emptyTeams.length===1?'has':'have'} no players registered yet.`, type:'info' });
  if (!data.awards?.mvp) notes.push({ icon:'🌟', text:'MVP award not yet announced.', type:'info' });
  if (!data.awards?.bestDefender) notes.push({ icon:'🦾', text:'Best Defender award not yet announced.', type:'info' });
  if (matches.length === 0) notes.push({ icon:'📅', text:'No matches scheduled yet — add fixtures to get started.', type:'info' });
  if (teams.length === 0) notes.push({ icon:'👕', text:'No teams added yet — add teams to get started.', type:'info' });

  const notesEl = $('admin-notifications-list');
  notesEl.innerHTML = notes.length
    ? notes.map(n => `
      <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:1.1rem;flex-shrink:0">${n.icon}</span>
        <span style="font-size:0.85rem;color:${n.type==='warn'?'var(--danger)':'var(--text)'}">${n.text}</span>
      </div>`).join('')
    : `<div style="color:var(--muted);font-size:0.85rem;padding:6px 0">🎉 All caught up — nothing needs attention.</div>`;

  // Quick actions
  const qa = $('admin-quick-actions');
  qa.innerHTML = `
    <button class="btn btn-primary btn-sm" onclick="$('card-add-match').scrollIntoView({behavior:'smooth'})">+ Schedule Match</button>
    <button class="btn btn-primary btn-sm" onclick="$('card-add-player').scrollIntoView({behavior:'smooth'})">+ Add Player</button>
    <button class="btn btn-primary btn-sm" onclick="$('card-add-team').scrollIntoView({behavior:'smooth'})">+ Add Team</button>
    <button class="btn btn-primary btn-sm" onclick="$('card-add-news').scrollIntoView({behavior:'smooth'})">+ Post News</button>
    <button class="btn btn-gold btn-sm" onclick="quickGoLive()">🔴 Set Next Match Live</button>
    <button class="btn btn-gold btn-sm" onclick="exportJSON()">⬇ Export Data</button>
    <button class="btn btn-gold btn-sm" onclick="saveAndDownload()">⬇ Save & Download Site</button>
  `;

  // Recent results
  const recentEl = $('admin-recent-matches');
  const recent = [...completed].sort((a,b)=>new Date(b.datetime)-new Date(a.datetime)).slice(0,5);
  recentEl.innerHTML = recent.length ? recent.map(m => {
    const ht = getTeam(m.home), at = getTeam(m.away);
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.86rem">
      <span>${escapeHtml(ht.name)} <strong>${m.homeScore}–${m.awayScore}</strong> ${escapeHtml(at.name)}</span>
      <span style="color:var(--muted);font-size:0.75rem">${smartDate(m.datetime).day||''}</span>
    </div>`;
  }).join('') : `<div style="color:var(--muted);font-size:0.85rem">No results yet.</div>`;

  // Upcoming matches
  const upcomingEl = $('admin-upcoming-matches');
  const nextFive = upcoming.slice(0,5);
  upcomingEl.innerHTML = nextFive.length ? nextFive.map(m => {
    const ht = getTeam(m.home), at = getTeam(m.away);
    const { day, time } = smartDate(m.datetime);
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:0.86rem">
      <span>${escapeHtml(ht.name)} vs ${escapeHtml(at.name)}</span>
      <span style="color:var(--muted);font-size:0.75rem">${day||''} ${time||''}</span>
    </div>`;
  }).join('') : `<div style="color:var(--muted);font-size:0.85rem">No upcoming matches scheduled.</div>`;

  // Chart: match status breakdown
  const statusCounts = { upcoming: upcoming.length, live: live.length, completed: completed.length };
  $('admin-chart-status').innerHTML = buildMiniBarChart([
    { label:'Upcoming', value: statusCounts.upcoming, color:'#2471a3' },
    { label:'Live', value: statusCounts.live, color:'#c0392b' },
    { label:'Completed', value: statusCounts.completed, color:'var(--green)' },
  ]);

  // Chart: goals by team
  const goalsByTeam = teams.map(t => {
    const gf = completed.reduce((s,m) => s + (m.home===t.id?(m.homeScore||0):0) + (m.away===t.id?(m.awayScore||0):0), 0);
    return { label: t.code || t.name, value: gf, color: t.color || 'var(--green)' };
  }).sort((a,b)=>b.value-a.value).slice(0,8);
  $('admin-chart-goals').innerHTML = buildMiniBarChart(goalsByTeam);
  animateBarsIn();
}

function buildMiniBarChart(items) {
  if (!items.length || items.every(i => i.value === 0)) {
    return `<div style="color:var(--muted);font-size:0.85rem;padding:6px 0">No data yet.</div>`;
  }
  const max = Math.max(...items.map(i=>i.value), 1);
  return `<div style="display:flex;flex-direction:column;gap:10px">
    ${items.map(i => `
      <div>
        <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:3px">
          <span style="color:var(--text);font-weight:600">${i.label}</span>
          <span style="color:var(--muted)">${i.value}</span>
        </div>
        <div style="height:8px;border-radius:5px;background:var(--bg);overflow:hidden">
          <div class="animated-bar-fill" style="height:100%;width:0%;background:${i.color};border-radius:5px;transition:width 0.8s cubic-bezier(.22,1,.36,1)" data-target="${(i.value/max*100).toFixed(0)}%"></div>
        </div>
      </div>`).join('')}
  </div>`;
}

function animateBarsIn() {
  requestAnimationFrame(() => {
    $$('.animated-bar-fill, .stat-bar-fill[data-target], .team-modal-stat-bar-fill[data-target]').forEach(el => {
      el.style.width = el.dataset.target;
    });
  });
}

function quickGoLive() {
  const upcoming = (data.matches||[]).filter(m => m.status === 'upcoming').sort((a,b)=>new Date(a.datetime)-new Date(b.datetime));
  if (!upcoming.length) { alert('No upcoming matches to set live.'); return; }
  if (!confirm(`Set "${getTeam(upcoming[0].home).name} vs ${getTeam(upcoming[0].away).name}" to LIVE now?`)) return;
  upcoming[0].status = 'live';
  save(); renderAdmin();
}

