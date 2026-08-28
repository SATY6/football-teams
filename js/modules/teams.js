// ── TEAM PAGE MODAL ───────────────────────────────────────────────────────────
let _teamModalId = null;
let _venueFilter = null;

function openTeamModal(teamId) {
  const team = data.teams.find(t => t.id === teamId);
  if (!team) return;
  _teamModalId = teamId;

  // Compute standings for this team
  const allRows   = computeStandings(team.group);
  const teamRow   = allRows.find(r => r.team.id === teamId) || { p:0,w:0,d:0,l:0,gf:0,ga:0 };
  const pts       = teamRow.w*3 + teamRow.d;
  const gd        = teamRow.gf - teamRow.ga;

  // Banner
  const banner = $('team-modal-banner');
  banner.style.background = `linear-gradient(135deg, ${team.color}ff 0%, ${team.color2||'#0a0a0a'}dd 100%)`;

  $('team-modal-logo-wrap').innerHTML = teamLogo(team, 90);
  $('team-modal-group-tag').textContent = `Group ${team.group} · SLIET Football Cup 2026`;
  $('team-modal-name').textContent = team.name;

  const coachChip   = $('team-modal-coach-chip');
  const captainChip = $('team-modal-captain-chip');
  if (team.coach)   { coachChip.textContent = `🧑‍💼 Coach: ${team.coach}`;     coachChip.style.display = ''; }
  else              { coachChip.style.display = 'none'; }
  if (team.captain) { captainChip.textContent = `🏅 Captain: ${team.captain}`; captainChip.style.display = ''; }
  else              { captainChip.style.display = 'none'; }

  // Quick stats bar
  $('team-modal-stats-bar').innerHTML = [
    ['Played',  teamRow.p],
    ['Won',     teamRow.w],
    ['Drawn',   teamRow.d],
    ['Lost',    teamRow.l],
    ['Points',  pts],
  ].map(([label,val]) => `
    <div class="team-modal-stat-cell">
      <div class="team-modal-stat-val">${val}</div>
      <div class="team-modal-stat-label">${label}</div>
    </div>`).join('');

  // Open modal & render default tab
  $('team-modal').classList.add('open');
  $('team-modal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  tmTab('squad', document.querySelector('.team-modal-tab'));
  renderTmSquad(team);
  renderTmFixtures(team, false);
  renderTmResults(team, teamRow);
  renderTmStatistics(team, teamRow);
  renderTmGallery(team);
}

function closeTeamModal() {
  $('team-modal').classList.remove('open');
  $('team-modal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  _teamModalId = null;
}

function tmTab(name, btn) {
  $$('.team-modal-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  ['squad','fixtures','results','statistics','gallery'].forEach(t => {
    const p = $(`team-modal-panel-${t}`);
    if (p) p.style.display = t === name ? '' : 'none';
  });
}

function renderTmSquad(team) {
  const players = (data.players||[]).filter(p => String(p.team) === String(team.id));
  const el = $('team-modal-squad-content');

  if (players.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--muted)">
      <div style="font-size:2rem;margin-bottom:8px">👟</div>
      <div style="font-weight:700;color:var(--text);margin-bottom:4px">No Players Registered</div>
      <div style="font-size:0.82rem">Admin can add players from the Players section.</div>
    </div>`;
    return;
  }

  // Group by position
  const posOrder = ['GK','DEF','MID','FWD'];
  const grouped  = {};
  posOrder.forEach(pos => { grouped[pos] = players.filter(p => p.position === pos); });
  const posLabels = { GK:'Goalkeepers', DEF:'Defenders', MID:'Midfielders', FWD:'Forwards' };

  let html = '';
  posOrder.forEach(pos => {
    if (!grouped[pos].length) return;
    html += `<div style="margin-bottom:16px">
      <div style="font-family:var(--font-display);font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--border)">${posLabels[pos]}</div>
      <div class="team-modal-squad-grid">
        ${grouped[pos].map(p => {
          const pc = posColor(p.position);
          const photoHtml = playerPhotoHTML(p);
          const isCaptain = team.captain && p.name.toLowerCase().includes(team.captain.toLowerCase().split(' ')[0]);
          return `<button type="button" class="team-modal-player-card" onclick="closeTeamModal();setTimeout(()=>openPlayerModal(${p.id}),200)" aria-label="View ${escapeHtml(p.name)}">
            <div class="team-modal-player-photo" style="background:linear-gradient(to bottom,${team.color}44,${pc}33)">${photoHtml}</div>
            <div style="background:${pc};padding:2px 6px;display:flex;align-items:center;justify-content:space-between">
              ${p.number?`<span style="font-family:var(--font-display);font-size:0.7rem;font-weight:800;color:rgba(255,255,255,0.8)">#${escapeHtml(p.number)}</span>`:'<span></span>'}
              ${isCaptain?`<span style="font-size:0.65rem;font-weight:800;color:#fff">C</span>`:''}
            </div>
            <div class="team-modal-player-name">${escapeHtml(p.name)}</div>
            <div style="display:flex;justify-content:center;gap:8px;padding:4px 6px 8px;font-size:0.68rem;color:var(--muted);font-weight:600">
              ${p.goals?`⚽${p.goals}`:''}
              ${p.assists?`🎯${p.assists}`:''}
            </div>
          </button>`;
        }).join('')}
      </div>
    </div>`;
  });

  el.innerHTML = html;
}

function renderTmFixtures(team, resultsOnly) {
  const matches   = data.matches.filter(m =>
    (m.home === team.id || m.away === team.id) && m.status === 'upcoming'
  ).sort((a,b) => new Date(a.datetime) - new Date(b.datetime));

  const el = $('team-modal-fixtures-content');
  if (matches.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--muted);font-size:0.88rem">No upcoming fixtures scheduled.</div>`;
    return;
  }

  el.innerHTML = matches.map(m => {
    const isHome = m.home === team.id;
    const opp    = getTeam(isHome ? m.away : m.home);
    const { day, time } = smartDate(m.datetime);
    return `<button type="button" class="team-modal-fixture-row" onclick="closeTeamModal();setTimeout(()=>openMatchModal(${m.id}),200)" aria-label="View match vs ${escapeHtml(opp.name)}">
      <div style="width:32px;height:32px;flex-shrink:0">${teamLogo(opp,32)}</div>
      <div class="team-modal-fix-teams">
        <div>${isHome?'vs':'@'} ${escapeHtml(opp.name)}</div>
        <div class="team-modal-fix-meta">${m.round||''} · ${day}${time?' · '+time:''} · ${escapeHtml(m.venue||'TBD')}</div>
      </div>
      <div style="font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:10px;background:var(--bg);color:var(--muted);border:1px solid var(--border)">${isHome?'HOME':'AWAY'}</div>
    </button>`;
  }).join('');
}

function renderTmResults(team, teamRow) {
  const matches = data.matches.filter(m =>
    (m.home === team.id || m.away === team.id) && m.status === 'completed'
  ).sort((a,b) => new Date(b.datetime) - new Date(a.datetime));

  const el = $('team-modal-results-content');
  if (matches.length === 0) {
    el.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--muted);font-size:0.88rem">No results yet. Matches will appear here once played.</div>`;
    return;
  }

  el.innerHTML = matches.map(m => {
    const isHome = m.home === team.id;
    const opp    = getTeam(isHome ? m.away : m.home);
    const myScore  = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;
    const result   = myScore > oppScore ? 'W' : myScore < oppScore ? 'L' : 'D';
    const scoreStr = `${myScore} – ${oppScore}`;
    const dt = new Date(m.datetime);
    const dateStr = dt.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
    return `<button type="button" class="team-modal-fixture-row" onclick="closeTeamModal();setTimeout(()=>openMatchModal(${m.id}),200)" aria-label="View result vs ${escapeHtml(opp.name)}">
      <div style="width:32px;height:32px;flex-shrink:0">${teamLogo(opp,32)}</div>
      <div class="team-modal-fix-teams">
        <div>${isHome?'vs':'@'} ${escapeHtml(opp.name)}</div>
        <div class="team-modal-fix-meta">${m.round||''} · ${dateStr}</div>
      </div>
      <div class="team-modal-fix-score">${scoreStr}</div>
      <span class="team-modal-result-badge team-modal-result-${result}">${result}</span>
    </button>`;
  }).join('');
}

function renderTmStatistics(team, teamRow) {
  const el  = $('team-modal-statistics-content');
  const gd  = teamRow.gf - teamRow.ga;
  const pts = teamRow.w*3 + teamRow.d;

  // Top scorers from this team
  const scorers = (data.scorers||[])
    .filter(s => String(s.team) === String(team.id))
    .sort((a,b) => b.goals - a.goals)
    .slice(0,5);

  // Player stats
  const players = (data.players||[]).filter(p => String(p.team) === String(team.id));
  const topScorer  = [...players].sort((a,b)=>(b.goals||0)-(a.goals||0))[0];
  const topAssist  = [...players].sort((a,b)=>(b.assists||0)-(a.assists||0))[0];
  const mostMins   = [...players].sort((a,b)=>(b.mins||0)-(a.mins||0))[0];

  const maxGF = Math.max(...computeStandings(null).map(r=>r.gf), 1);
  const maxPts = Math.max(...computeStandings(null).map(r=>r.w*3+r.d), 1);

  el.innerHTML = `
    <!-- Performance bars -->
    <div style="margin-bottom:18px">
      <div style="font-family:var(--font-display);font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-bottom:10px">Performance</div>
      ${[
        ['Points',     pts,        maxPts,  'var(--green)'],
        ['Goals For',  teamRow.gf, maxGF,   '#2471a3'],
        ['Goals Against', teamRow.ga, maxGF, '#c0392b'],
        ['Wins',       teamRow.w,  teamRow.p||1, 'var(--green)'],
      ].map(([label,val,max,color])=>`
        <div class="team-modal-stat-bar-row">
          <div class="team-modal-stat-bar-label">${label}</div>
          <div class="team-modal-stat-bar-track">
            <div class="team-modal-stat-bar-fill" style="width:0%;background:${color}" data-target="${Math.round(val/(max||1)*100)}%"></div>
          </div>
          <div class="team-modal-stat-bar-val">${val}</div>
        </div>`).join('')}
    </div>

    <!-- Key players -->
    ${players.length > 0 ? `
    <div style="margin-bottom:18px">
      <div style="font-family:var(--font-display);font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-bottom:10px">Key Players</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px">
        ${[
          topScorer  ? [`⚽ Top Scorer`,  topScorer.name,  `${topScorer.goals||0} goals`]   : null,
          topAssist  ? [`🎯 Top Assist`,  topAssist.name,  `${topAssist.assists||0} assists`]: null,
          mostMins   ? [`⏱ Most Minutes`, mostMins.name,   `${mostMins.mins||0} mins`]       : null,
        ].filter(Boolean).map(([label,name,stat])=>`
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;text-align:center">
            <div style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:4px">${label}</div>
            <div style="font-family:var(--font-display);font-weight:800;font-size:0.95rem;color:var(--text)">${name}</div>
            <div style="font-size:0.75rem;color:var(--green-dark);font-weight:700;margin-top:2px">${stat}</div>
          </div>`).join('')}
      </div>
    </div>` : ''}

    <!-- Record -->
    <div>
      <div style="font-family:var(--font-display);font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-bottom:10px">Summary</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        ${[['⚽','Goals For',teamRow.gf],['🥅','Goals Against',teamRow.ga],['📊','Goal Diff',(gd>0?'+':'')+gd],['🏆','Points',pts]].map(([icon,label,val])=>`
          <div style="text-align:center;padding:12px 6px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
            <div style="font-size:1.2rem">${icon}</div>
            <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--green-dark)">${val}</div>
            <div style="font-size:0.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.8px;font-weight:700">${label}</div>
          </div>`).join('')}
      </div>
    </div>`;
  animateBarsIn();
}

function renderTmGallery(team) {
  const el = $('team-modal-gallery-content');
  const photos = team.gallery || [];
  if (photos.length === 0) {
    el.innerHTML = `
      <div style="text-align:center;padding:2rem;color:var(--muted)">
        <div style="font-size:2.5rem;margin-bottom:10px">🖼️</div>
        <div style="font-weight:700;color:var(--text);margin-bottom:4px">No Photos Yet</div>
        <div style="font-size:0.82rem">Team gallery will appear here as photos are added.</div>
      </div>
      ${adminLoggedIn ? `
      <div style="margin-top:12px;text-align:center">
        <button class="btn btn-gold" onclick="$('team-modal-gallery-upload').click()">📷 Add Photo</button>
        <input type="file" id="team-modal-gallery-upload" accept="image/*" multiple onchange="addTeamGalleryPhoto(event)" style="display:none">
      </div>` : ''}`;
    return;
  }

  el.innerHTML = `
    ${adminLoggedIn ? `
    <div style="margin-bottom:10px;display:flex;gap:8px;align-items:center">
      <button class="btn btn-gold btn-sm" onclick="$('team-modal-gallery-upload').click()">📷 Add Photo</button>
      <input type="file" id="team-modal-gallery-upload" accept="image/*" multiple onchange="addTeamGalleryPhoto(event)" style="display:none">
    </div>` : ''}
    <div class="team-modal-gallery-grid">
      ${photos.map((src,i)=>`
        <div style="position:relative">
          <img src="${src}" alt="${escapeHtml(team.name)} gallery photo ${i+1}" class="team-modal-gallery-img" loading="lazy" decoding="async" onclick="viewGalleryPhoto('${src}')">
          ${adminLoggedIn?`<button onclick="removeTeamGalleryPhoto(${i})" style="position:absolute;top:4px;right:4px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:50%;width:20px;height:20px;font-size:0.7rem;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>`:''}
        </div>`).join('')}
    </div>`;
}

function addTeamGalleryPhoto(event) {
  const team = data.teams.find(t => t.id === _teamModalId);
  if (!team) return;
  if (!team.gallery) team.gallery = [];
  const files = Array.from(event.target.files);
  let loaded  = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      team.gallery.push(e.target.result);
      loaded++;
      if (loaded === files.length) { save(); renderTmGallery(team); }
    };
    reader.readAsDataURL(file);
  });
  event.target.value = '';
}

function removeTeamGalleryPhoto(idx) {
  const team = data.teams.find(t => t.id === _teamModalId);
  if (!team?.gallery) return;
  team.gallery.splice(idx, 1);
  save(); renderTmGallery(team);
}

function viewGalleryPhoto(src) {
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out';
  ov.innerHTML = `<img src="${src}" alt="Expanded gallery image" style="max-width:94vw;max-height:94vh;object-fit:contain;border-radius:8px">`;
  ov.onclick = () => ov.remove();
  document.body.appendChild(ov);
}

// Close team modal on backdrop
$('team-modal').addEventListener('click', function(e){
  if (e.target === this) closeTeamModal();
});

function handlePlayerPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    _playerPhoto = e.target.result;
    $('player-photo-img').src = _playerPhoto;
    $('player-photo-img').style.display = 'block';
    $('player-photo-placeholder').style.display = 'none';
    $('clear-photo-btn').style.display = 'inline-flex';
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function clearPlayerPhoto() {
  _playerPhoto = null;
  $('player-photo-img').style.display = 'none';
  $('player-photo-img').src = '';
  $('player-photo-placeholder').style.display = 'block';
  $('clear-photo-btn').style.display = 'none';
}

function posColor(pos) {
  return { GK:'#e67e22', DEF:'#2980b9', MID:'var(--green)', FWD:'#c0392b' }[pos] || '#888';
}

function posLabel(pos) {
  return { GK:'Goalkeeper', DEF:'Defender', MID:'Midfielder', FWD:'Forward' }[pos] || pos;
}

function posIcon(pos) {
  return { GK:'🧤', DEF:'🛡️', MID:'⚙️', FWD:'⚽' }[pos] || '👟';
}

function renderPlayers() {
  const filter = $('players-team-filter').value;
  const sel = $('players-team-filter');
  sel.innerHTML = '<option value="all">All Teams</option>' +
    data.teams.map(t=>`<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');
  sel.value = filter;

  const players = (data.players||[]).filter(p => filter==='all' || p.team==filter);
  const container = $('players-container');

  if (!data.players || data.players.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;background:var(--card);border:1px solid var(--border);border-radius:12px;color:var(--muted)">
      <div style="font-size:3rem;margin-bottom:12px">👤</div>
      <div style="font-weight:700;color:var(--text);font-size:1.1rem;margin-bottom:4px">No Players Added Yet</div>
      <div style="font-size:0.85rem">Login as admin → Add Player to build your squad.</div>
    </div>`;
    return;
  }

  if (players.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--muted)">No players in this team.</div>`;
    return;
  }

  container.innerHTML = players.map(p => {
    const team  = getTeam(p.team);
    const col   = posColor(p.position);
    const icon  = posIcon(p.position);
    const photoHtml = playerPhotoHTML(p);

    return `<button type="button" class="player-card" onclick="openPlayerModal(${p.id})" aria-label="View ${escapeHtml(p.name)}">
      <!-- Banner with gradient -->
      <div class="pc-banner" style="background:linear-gradient(135deg,${team.color} 0%,${col} 100%)">
        ${p.number?`<div class="pc-jersey">#${escapeHtml(p.number)}</div>`:''}
        <div class="pc-photo-wrap">
          <div class="pc-photo">${photoHtml}</div>
        </div>
        <span class="pc-pos">${posLabel(p.position)}</span>
      </div>
      <!-- Card body -->
      <div class="pc-body">
        <div class="pc-name">${escapeHtml(p.name)}</div>
        <div class="pc-team">
          ${escapeHtml(team.name)}
          ${p.age?` · Age ${p.age}`:''}
          ${p.hostel?' · 🏠 '+escapeHtml(p.hostel):''}
        </div>
        <!-- 4 mini stats -->
        <div class="pc-mini-stats" style="grid-template-columns:repeat(4,1fr)">
          <div class="pc-stat"><div class="pc-stat-val">${p.goals||0}</div><div class="pc-stat-label">⚽ Goals</div></div>
          <div class="pc-stat"><div class="pc-stat-val">${p.assists||0}</div><div class="pc-stat-label">🎯 Ast</div></div>
          <div class="pc-stat"><div class="pc-stat-val">${p.yellow||0}</div><div class="pc-stat-label">🟨</div></div>
          <div class="pc-stat"><div class="pc-stat-val">${p.mins||0}′</div><div class="pc-stat-label">⏱ Mins</div></div>
        </div>
      </div>
    </button>`;
  }).join('');
}

// ── TEAM LOGO / SHIELD SYSTEM ─────────────────────────────────────────────────
let _uploadedLogoB64 = null;

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    _uploadedLogoB64 = e.target.result;
    $('logo-upload-img').src = _uploadedLogoB64;
    $('logo-upload-preview').style.display = 'flex';
    $('shield-preview').innerHTML = `<img src="${_uploadedLogoB64}" alt="Uploaded team logo preview" style="width:100px;height:100px;object-fit:contain;border-radius:10px;border:2px solid var(--border)">`;
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function clearLogoUpload() {
  _uploadedLogoB64 = null;
  $('logo-upload-preview').style.display = 'none';
  $('logo-upload-img').src = '';
  previewShield();
}

function buildShieldSVG(color1, color2, style, emblem, size=100) {
  const s = size, h = size;
  const c1 = color1 || '#1a3a6e';
  const c2 = color2 || '#FFD700';
  const em = emblem || '⚽';
  const fontSize = Math.round(size * 0.28);
  const emY = Math.round(size * 0.58);

  let shapePath = '';
  let pattern = '';

  if (style === 'classic') {
    shapePath = `M${s/2},${h*0.96} C${s*0.1},${h*0.75} 0,${h*0.55} 0,${h*0.28} L0,${h*0.08} Q0,0 ${s*0.08},0 L${s*0.92},0 Q${s},0 ${s},${h*0.08} L${s},${h*0.28} C${s},${h*0.55} ${s*0.9},${h*0.75} ${s/2},${h*0.96}Z`;
    pattern = `
      <clipPath id="cp${size}"><path d="${shapePath}"/></clipPath>
      <rect x="0" y="0" width="${s}" height="${h}" fill="${c1}" clip-path="url(#cp${size})"/>
      <path d="M${s/2},0 L${s/2},${h}" stroke="${c2}" stroke-width="${s*0.04}" clip-path="url(#cp${size})"/>
      <path d="M0,${h*0.38} L${s},${h*0.38}" stroke="${c2}" stroke-width="${s*0.03}" clip-path="url(#cp${size})"/>
      <path d="${shapePath}" fill="none" stroke="${c2}" stroke-width="${s*0.04}"/>`;
  } else if (style === 'modern') {
    shapePath = `M${s/2},0 L${s*0.97},${h*0.27} L${s*0.82},${h*0.92} L${s/2},${h} L${s*0.18},${h*0.92} L${s*0.03},${h*0.27}Z`;
    pattern = `
      <clipPath id="cp${size}"><path d="${shapePath}"/></clipPath>
      <rect width="${s}" height="${h}" fill="${c1}" clip-path="url(#cp${size})"/>
      <polygon points="${s/2},0 ${s*0.97},${h*0.27} ${s/2},${h*0.5}" fill="${c2}" opacity="0.35" clip-path="url(#cp${size})"/>
      <path d="${shapePath}" fill="none" stroke="${c2}" stroke-width="${s*0.045}"/>`;
  } else if (style === 'round') {
    shapePath = `M${s/2},${h} C${s*0.1},${h*0.8} 0,${h*0.5} 0,${h*0.28} A${s/2},${s/2} 0 0,1 ${s},${h*0.28} C${s},${h*0.5} ${s*0.9},${h*0.8} ${s/2},${h}Z`;
    pattern = `
      <clipPath id="cp${size}"><path d="${shapePath}"/></clipPath>
      <rect width="${s}" height="${h}" fill="${c1}" clip-path="url(#cp${size})"/>
      <circle cx="${s/2}" cy="${h*0.38}" r="${s*0.3}" fill="${c2}" opacity="0.25" clip-path="url(#cp${size})"/>
      <path d="${shapePath}" fill="none" stroke="${c2}" stroke-width="${s*0.04}"/>`;
  } else if (style === 'pointed') {
    shapePath = `M${s*0.08},0 L${s*0.92},0 Q${s},0 ${s},${h*0.08} L${s},${h*0.6} L${s/2},${h} L0,${h*0.6} L0,${h*0.08} Q0,0 ${s*0.08},0Z`;
    pattern = `
      <clipPath id="cp${size}"><path d="${shapePath}"/></clipPath>
      <rect width="${s}" height="${h}" fill="${c1}" clip-path="url(#cp${size})"/>
      <polygon points="0,0 ${s},0 ${s},${h*0.45} 0,${h*0.45}" fill="${c2}" opacity="0.3" clip-path="url(#cp${size})"/>
      <path d="${shapePath}" fill="none" stroke="${c2}" stroke-width="${s*0.04}"/>`;
  } else if (style === 'split') {
    shapePath = `M${s*0.08},0 L${s*0.92},0 Q${s},0 ${s},${h*0.08} L${s},${h*0.7} C${s},${h*0.85} ${s*0.75},${h*0.94} ${s/2},${h} C${s*0.25},${h*0.94} 0,${h*0.85} 0,${h*0.7} L0,${h*0.08} Q0,0 ${s*0.08},0Z`;
    pattern = `
      <clipPath id="cp${size}"><path d="${shapePath}"/></clipPath>
      <rect width="${s}" height="${h}" fill="${c1}" clip-path="url(#cp${size})"/>
      <polygon points="0,0 ${s},${h} 0,${h}" fill="${c2}" opacity="0.45" clip-path="url(#cp${size})"/>
      <path d="${shapePath}" fill="none" stroke="${c2}" stroke-width="${s*0.04}"/>`;
  } else if (style === 'stripes') {
    shapePath = `M${s*0.08},0 L${s*0.92},0 Q${s},0 ${s},${h*0.08} L${s},${h*0.7} C${s},${h*0.85} ${s*0.75},${h*0.94} ${s/2},${h} C${s*0.25},${h*0.94} 0,${h*0.85} 0,${h*0.7} L0,${h*0.08} Q0,0 ${s*0.08},0Z`;
    pattern = `
      <clipPath id="cp${size}"><path d="${shapePath}"/></clipPath>
      <rect width="${s}" height="${h}" fill="${c1}" clip-path="url(#cp${size})"/>
      <rect x="${s*0.25}" y="0" width="${s*0.165}" height="${h}" fill="${c2}" opacity="0.5" clip-path="url(#cp${size})"/>
      <rect x="${s*0.585}" y="0" width="${s*0.165}" height="${h}" fill="${c2}" opacity="0.5" clip-path="url(#cp${size})"/>
      <path d="${shapePath}" fill="none" stroke="${c2}" stroke-width="${s*0.04}"/>`;
  }

  return `<svg viewBox="0 0 ${s} ${h}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" style="display:block;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.25))">
    <defs>${pattern.includes('<clipPath') ? '' : `<clipPath id="cp${size}"><path d="${shapePath}"/></clipPath>`}</defs>
    ${pattern}
    <text x="${s/2}" y="${emY}" text-anchor="middle" font-size="${fontSize}" style="dominant-baseline:middle">${em}</text>
  </svg>`;
}

function teamLogo(team, size=38) {
  if (team.logoImg) {
    return `<img src="${team.logoImg}" alt="${escapeHtml(team.name)} logo" style="width:${size}px;height:${size}px;object-fit:contain;border-radius:${size*0.15}px;display:block">`;
  }
  return buildShieldSVG(team.color, team.color2||'#FFD700', team.shield||'classic', team.emblem||'⚽', size);
}

function previewShield() {
  if (_uploadedLogoB64) return;
  const c1 = $('new-team-color').value;
  const c2 = $('new-team-color2').value;
  const style = $('new-team-shield').value;
  const emblem = $('new-team-emblem').value;
  $('shield-preview').innerHTML = buildShieldSVG(c1, c2, style, emblem, 100);
}

function addTeam() {
  const name    = $('new-team-name').value.trim();
  const code    = $('new-team-code').value.trim().toUpperCase();
  const color   = $('new-team-color').value;
  const color2  = $('new-team-color2').value;
  const group   = $('new-team-group').value;
  const shield  = $('new-team-shield').value;
  const emblem  = $('new-team-emblem').value;
  const coach   = $('new-team-coach').value.trim();
  const captain = $('new-team-captain').value.trim();
  const alert   = $('add-team-alert');
  if (!name || !code) { showAlert(alert,'error','Name and code are required.'); return; }
  if (data.teams.find(t=>t.name.toLowerCase()===name.toLowerCase())) { showAlert(alert,'error','Team already exists.'); return; }
  const team = { id: Date.now(), name, code, color, color2, group, shield, emblem, coach, captain };
  if (_uploadedLogoB64) { team.logoImg = _uploadedLogoB64; _uploadedLogoB64 = null; $('logo-upload-preview').style.display='none'; }
  data.teams.push(team);
  save(); renderAdmin();
  showAlert(alert,'success',`${name} added to Group ${group}!`);
  $('new-team-name').value='';
  $('new-team-code').value='';
  $('new-team-coach').value='';
  $('new-team-captain').value='';
  previewShield();
}

function removeTeam(id) {
  if (!confirm('Remove this team? Their match records will remain.')) return;
  data.teams = data.teams.filter(t=>t.id!==id);
  save(); renderAdmin();
}

function addMatch() {
  const home     = parseInt($('match-home').value);
  const away     = parseInt($('match-away').value);
  const datetime = $('match-datetime').value;
  const venue    = $('match-venue').value.trim();
  const round    = $('match-round').value;
  const referee  = $('match-referee').value.trim();
  const weather  = $('match-weather').value;
  const alert    = $('add-match-alert');
  if (home === away) { showAlert(alert,'error','Home and away teams must be different.'); return; }
  if (!datetime)     { showAlert(alert,'error','Please select date and time.'); return; }
  data.matches.push({ id:data.nextId++, home, away, homeScore:0, awayScore:0, datetime, venue, round, referee, weather, status:'upcoming' });
  save(); renderAdmin();
  showAlert(alert,'success','Match scheduled!');
}

function loadScheduleToEdit() {
  const id = parseInt($('edit-schedule-select').value);
  const area = $('edit-schedule-area');
  const match = data.matches.find(m => m.id === id);
  if (!match) { area.style.display = 'none'; return; }
  area.style.display = 'block';
  $('edit-match-home').value     = match.home;
  $('edit-match-away').value     = match.away;
  $('edit-match-datetime').value = match.datetime || '';
  $('edit-match-venue').value    = match.venue || '';
  $('edit-match-round').value    = match.round || 'Group A';
  $('edit-match-referee').value  = match.referee || '';
  $('edit-match-weather').value  = match.weather || '';
}

function saveScheduleEdit() {
  const id = parseInt($('edit-schedule-select').value);
  const match = data.matches.find(m => m.id === id);
  const alert = $('edit-schedule-alert');
  if (!match) { showAlert(alert, 'error', 'No match selected.'); return; }
  const home = parseInt($('edit-match-home').value);
  const away = parseInt($('edit-match-away').value);
  const datetime = $('edit-match-datetime').value;
  const venue    = $('edit-match-venue').value.trim();
  const round    = $('edit-match-round').value;
  const referee  = $('edit-match-referee').value.trim();
  const weather  = $('edit-match-weather').value;
  if (home === away) { showAlert(alert, 'error', 'Home and away teams must be different.'); return; }
  if (!datetime) { showAlert(alert, 'error', 'Please set a date and time.'); return; }
  match.home = home; match.away = away; match.datetime = datetime;
  match.venue = venue; match.round = round;
  match.referee = referee; match.weather = weather;
  save(); renderAdmin();
  showAlert(alert, 'success', 'Match schedule updated!');
}

function cancelScheduleEdit() {
  $('edit-schedule-select').value = '';
  $('edit-schedule-area').style.display = 'none';
}

function addPlayer() {
  const name     = $('player-name').value.trim();
  const team     = parseInt($('player-team').value);
  const position = $('player-position').value;
  const number   = $('player-number').value.trim();
  const age      = parseInt($('player-age').value)||0;
  const hostel   = $('player-hostel').value.trim();
  const goals    = parseInt($('player-goals').value)||0;
  const assists  = parseInt($('player-assists').value)||0;
  const mins     = parseInt($('player-mins').value)||0;
  const yellow   = parseInt($('player-yellow').value)||0;
  const red      = parseInt($('player-red').value)||0;
  const cleanSheets = parseInt($('player-cleansheets').value)||0;
  const alert    = $('add-player-alert');

  if (!name) { showAlert(alert,'error','Player name is required.'); return; }
  if (!data.players) data.players = [];

  const player = {
    id: data.nextPlayerId||Date.now(),
    name, team, position, number, age, hostel,
    goals, assists, mins, yellow, red, cleanSheets
  };

  if (_playerPhoto) {
    player.photo  = _playerPhoto;
    _playerPhoto  = null;
    clearPlayerPhoto();
  }

  data.players.push(player);
  data.nextPlayerId = (data.nextPlayerId||1) + 1;
  save(); renderAdmin();
  showAlert(alert,'success',`${name} added to the squad!`);

  // Reset form
  ['player-name','player-number','player-hostel'].forEach(id=>{ const el=$(id); if(el) el.value=''; });
  ['player-goals','player-assists','player-mins','player-yellow','player-red'].forEach(id=>{ const el=$(id); if(el) el.value='0'; });
  $('player-age').value='';
}

function removePlayer(id) {
  data.players = (data.players||[]).filter(p=>p.id!==id);
  save(); renderAdmin();
}

function addNews() {
  const title = $('news-title').value.trim();
  const body = $('news-body').value.trim();
  const tag = $('news-tag').value;
  const alert = $('add-news-alert');
  if (!title || !body) { showAlert(alert,'error','Title and content required.'); return; }
  if (!data.news) data.news = [];
  data.news.push({ id: data.nextNewsId||Date.now(), title, body, tag, date: new Date().toISOString().slice(0,10) });
  data.nextNewsId = (data.nextNewsId||1) + 1;
  save(); renderAdmin();
  showAlert(alert,'success','News posted!');
  $('news-title').value='';
  $('news-body').value='';
}

function removeNews(id) {
  data.news = (data.news||[]).filter(n=>n.id!==id);
  save(); renderAdmin();
}

function loadMatchToEdit() {
  const id = parseInt($('score-match-select').value);
  const area = $('score-edit-area');
  const match = data.matches.find(m=>m.id===id);
  if (!match) { area.style.display='none'; return; }
  area.style.display='block';
  $('score-home-label').textContent = getTeam(match.home).name;
  $('score-away-label').textContent = getTeam(match.away).name;
  $('score-home').value = match.homeScore;
  $('score-away').value = match.awayScore;
  $('score-status').value = match.status;
}

function updateScore() {
  const id = parseInt($('score-match-select').value);
  const match = data.matches.find(m=>m.id===id);
  const alert = $('update-score-alert');
  if (!match) { showAlert(alert,'error','Select a match first.'); return; }
  match.homeScore = parseInt($('score-home').value)||0;
  match.awayScore = parseInt($('score-away').value)||0;
  match.status = $('score-status').value;
  save(); renderAdmin();
  showAlert(alert,'success','Score updated!');
}

function deleteMatch() {
  const id = parseInt($('score-match-select').value);
  if (!id || !confirm('Delete this match?')) return;
  data.matches = data.matches.filter(m=>m.id!==id);
  save(); renderAdmin();
}

function addScorer() {
  const name = $('scorer-name').value.trim();
  const team = parseInt($('scorer-team').value);
  const goals = parseInt($('scorer-goals').value)||1;
  if (!name) return;
  const existing = data.scorers.find(s=>s.name.toLowerCase()===name.toLowerCase());
  if (existing) { existing.goals = goals; existing.team = team; }
  else data.scorers.push({ name, team, goals });
  save(); renderAdmin();
  $('scorer-name').value='';
}

function removeScorer(name) {
  data.scorers = data.scorers.filter(s=>s.name!==name);
  save(); renderAdmin();
}

function resetMatches() {
  if (!confirm('Reset all match scores to 0 and set status to Upcoming?')) return;
  data.matches.forEach(m => { m.homeScore=0; m.awayScore=0; m.status='upcoming'; });
  save(); renderAdmin();
}

function clearAll() {
  if (!confirm('This will delete ALL data. Are you sure?')) return;
  localStorage.removeItem('ftdata');
  location.reload();
}

function saveAndDownload() {
  save(); // also update localStorage
  const html = document.documentElement.outerHTML;
  const updated = html.replace(
    /const SAVED_DATA = .*?;/,
    `const SAVED_DATA = ${JSON.stringify(data)};`
  );
  const blob = new Blob(['<!DOCTYPE html>\n' + updated], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'index.html';
  a.click();
  URL.revokeObjectURL(url);
  showAlert($('savefile-alert'), 'success', 'Downloaded! Replace your old index.html with this file.');
}

function exportData() { saveAndDownload(); }
function importData() {}

