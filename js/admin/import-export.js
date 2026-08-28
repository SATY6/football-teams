// ── DATA EXPORT / IMPORT / BACKUP ────────────────────────────────────────────
function exportJSON() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(data.tournamentName||'tournament').replace(/\s+/g,'_')}_data.json`;
  a.click();
  URL.revokeObjectURL(url);
  showAlert($('data-io-alert'), 'success', 'Data exported!');
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported || !Array.isArray(imported.teams)) throw new Error('Not a valid tournament data file.');
      if (!confirm('This will REPLACE all current data with the imported file. Continue?')) return;
      data = imported;
      save();
      renderAdmin();
      showAlert($('data-io-alert'), 'success', 'Data imported successfully!');
    } catch (err) {
      showAlert($('data-io-alert'), 'error', 'Import failed: ' + err.message);
    }
  };
  reader.onerror = () => {
    showAlert($('data-io-alert'), 'error', 'Could not read the selected file.');
  };
  reader.readAsText(file);
  event.target.value = '';
}

function createBackup() {
  exportJSON();
  const now = new Date();
  localStorage.setItem('lastBackupAt', now.toISOString());
  updateLastBackupInfo();
}

function updateLastBackupInfo() {
  const el = $('last-backup-info');
  if (!el) return;
  const last = localStorage.getItem('lastBackupAt');
  el.textContent = last
    ? `Last backup: ${new Date(last).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}`
    : 'No backup created yet in this browser.';
}

function renderAdmin() {
  updateUnsavedFileBanner();
  renderAdminDashboard();
  updateLastBackupInfo();

  // Footer info
  $('admin-venue').value = data.venueInfo || '';
  $('admin-contact-email').value = data.contactInfo?.email || '';
  $('admin-contact-phone').value = data.contactInfo?.phone || '';
  $('admin-social-instagram').value = data.socialLinks?.instagram || '';
  $('admin-social-youtube').value = data.socialLinks?.youtube || '';
  $('admin-social-facebook').value = data.socialLinks?.facebook || '';
  renderSponsorList();
  renderCommitteeList();

  // Tournament name
  $('admin-tournament-name').value = data.tournamentName;

  // Team selects
  const teamOptions = data.teams.map(t => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');
  ['match-home','match-away','scorer-team','edit-match-home','edit-match-away','player-team'].forEach(id => {
    const el = $(id);
    if (el) el.innerHTML = teamOptions;
  });

  // Team list
  const teamList = $('team-list-display');
  teamList.innerHTML = data.teams.map(t => `
    <div class="team-item">
      <div style="width:36px;height:36px;flex-shrink:0;display:flex;align-items:center;justify-content:center">${teamLogo(t,36)}</div>
      <span>${escapeHtml(t.name)}</span>
      <span style="font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:10px;background:${t.group==='A'?'var(--green-light)':'#dce8f5'};color:${t.group==='A'?'var(--green-dark)':'#1a5276'}">Grp ${t.group||'?'}</span>
      <button class="btn btn-danger btn-sm" onclick="removeTeam(${t.id})">✕</button>
    </div>`).join('') || '<div style="color:var(--muted);font-size:0.85rem;padding:4px">No teams yet.</div>';

  // Special award selects
  const playerOptions = (data.players||[]).map(p => `<option value="${p.id}">${escapeHtml(p.name)} — ${escapeHtml(getTeam(p.team).name)}</option>`).join('');
  const bdSel  = $('award-best-defender');
  const mvpSel = $('award-mvp');
  if (bdSel)  bdSel.innerHTML  = '<option value="">— Not selected —</option>' + playerOptions;
  if (mvpSel) mvpSel.innerHTML = '<option value="">— Not selected —</option>' + playerOptions;
  if (bdSel)  bdSel.value  = data.awards?.bestDefender || '';
  if (mvpSel) mvpSel.value = data.awards?.mvp || '';

  // Match select for score update
  const matchSelect = $('score-match-select');
  matchSelect.innerHTML = '<option value="">— Select Match —</option>' +
    data.matches.map(m => {
      const ht = getTeam(m.home), at = getTeam(m.away);
      return `<option value="${m.id}">${escapeHtml(ht.name)} vs ${escapeHtml(at.name)} (${m.round||''})</option>`;
    }).join('');
  $('score-edit-area').style.display = 'none';

  // Match select for schedule edit
  const editScheduleSelect = $('edit-schedule-select');
  editScheduleSelect.innerHTML = '<option value="">— Select Match —</option>' +
    data.matches.map(m => {
      const ht = getTeam(m.home), at = getTeam(m.away);
      const dt = m.datetime ? new Date(m.datetime).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : '';
      return `<option value="${m.id}">${escapeHtml(ht.name)} vs ${escapeHtml(at.name)} · ${m.round||''} · ${dt}</option>`;
    }).join('');
  $('edit-schedule-area').style.display = 'none';

  // Player list in admin
  const playerListEl = $('player-list-display');
  if (playerListEl) {
    const players = data.players || [];
    playerListEl.innerHTML = players.length === 0
      ? '<div style="color:var(--muted);font-size:0.82rem">No players added yet.</div>'
      : players.map(p => {
          const t = getTeam(p.team);
          return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.85rem">
            <div class="team-badge" style="background:${t.color};width:24px;height:24px;font-size:0.58rem;flex-shrink:0">${escapeHtml(t.code)}</div>
            <span style="flex:1;font-weight:600">${escapeHtml(p.name)}</span>
            <span style="color:var(--muted);font-size:0.75rem">${p.position}${p.number?' #'+p.number:''}</span>
            <button class="btn btn-danger btn-sm" onclick="removePlayer(${p.id})">✕</button>
          </div>`;
        }).join('');
  }

  // News list in admin
  const newsListEl = $('news-list-display');
  if (newsListEl) {
    const news = [...(data.news||[])].sort((a,b)=>new Date(b.date)-new Date(a.date));
    newsListEl.innerHTML = news.length === 0
      ? '<div style="color:var(--muted);font-size:0.82rem">No news posted yet.</div>'
      : news.map(n => `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.85rem">
          <span style="flex:1;font-weight:600;font-size:0.82rem">${escapeHtml(n.title)}</span>
          <button class="btn btn-danger btn-sm" onclick="removeNews(${n.id})">✕</button>
        </div>`).join('');
  }
  const sorted = [...data.scorers].sort((a,b)=>b.goals-a.goals);
  const scorerDisplay = $('scorer-list-display');
  if (scorerDisplay) scorerDisplay.innerHTML = sorted.length === 0
    ? '<div style="color:var(--muted);font-size:0.85rem">No scorers yet.</div>'
    : `<div style="font-size:0.82rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px">Current Scorers</div>` +
      sorted.map(s=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--bg);border-radius:6px;margin-bottom:6px;font-size:0.88rem">
          <span><strong>${escapeHtml(s.name)}</strong> — ${escapeHtml(getTeam(s.team).name)}</span>
          <span style="font-weight:800;color:var(--green-dark)">${s.goals} ⚽</span>
          <button class="btn btn-danger btn-sm" onclick="removeScorer('${escapeHtml(s.name)}')">✕</button>
        </div>`).join('');

  // Bracket admin
  renderBracketAdmin();
}

function saveTournamentName() {
  const name = $('admin-tournament-name').value.trim();
  if (!name) return;
  data.tournamentName = name;
  $('tournament-name-display').textContent = name;
  save();
}

