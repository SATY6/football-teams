// ── AWARDS / PLAYER STATISTICS ───────────────────────────────────────────────
function renderAwards() {
  const container = $('awards-container');
  const players = data.players || [];
  const gks = players.filter(p => p.position === 'GK');

  const topBy = (arr, key) => [...arr].filter(p => (p[key]||0) > 0).sort((a,b) => (b[key]||0) - (a[key]||0));

  const scorersList      = topBy(players, 'goals');
  const assistsList      = topBy(players, 'assists');
  const cleanSheetsList  = topBy(gks, 'cleanSheets');

  const bestDefenderPlayer = data.awards?.bestDefender ? players.find(p => p.id === data.awards.bestDefender) : null;
  const mvpPlayer          = data.awards?.mvp ? players.find(p => p.id === data.awards.mvp) : null;

  const avatar = p => playerPhotoHTML(p, { iconSize: '1.5rem' });

  function leaderCard(icon, title, list, statKey, statLabel) {
    const winner = list[0];
    return `
    <div class="stat-card">
      <div class="stat-card-header">${icon} ${title}</div>
      ${winner ? `
      <div style="display:flex;align-items:center;gap:14px;padding:16px 18px;border-bottom:1px solid var(--border)">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;border:2px solid var(--gold)">
          ${avatar(winner)}
        </div>
        <div style="flex:1">
          <div style="font-family:var(--font-display);font-weight:800;font-size:1.05rem;color:var(--text)">${escapeHtml(winner.name)}</div>
          <div style="font-size:0.78rem;color:var(--muted)">${escapeHtml(getTeam(winner.team).name)}</div>
        </div>
        <div style="text-align:center">
          <div style="font-family:var(--font-display);font-weight:800;font-size:1.6rem;color:var(--gold-dark)">${winner[statKey]||0}</div>
          <div style="font-size:0.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px">${statLabel}</div>
        </div>
      </div>` : `<div style="padding:20px 18px;color:var(--muted);font-size:0.88rem">Not yet decided.</div>`}
      ${list.length > 1 ? `<ul class="stat-list">
        ${list.slice(1,5).map((p,i) => `<li class="stat-item">
          <span class="stat-rank">${i+2}</span>
          <div class="stat-bar-wrap"><span class="stat-label">${escapeHtml(p.name)}<br><span style="font-size:0.72rem;color:var(--muted)">${escapeHtml(getTeam(p.team).name)}</span></span></div>
          <span class="stat-value">${p[statKey]||0}</span>
        </li>`).join('')}
      </ul>` : ''}
    </div>`;
  }

  function manualAwardCard(icon, title, player, note) {
    return `
    <div class="stat-card">
      <div class="stat-card-header">${icon} ${title}</div>
      ${player ? `
      <div style="display:flex;align-items:center;gap:14px;padding:16px 18px">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--bg);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;border:2px solid var(--gold)">
          ${avatar(player)}
        </div>
        <div style="flex:1">
          <div style="font-family:var(--font-display);font-weight:800;font-size:1.05rem;color:var(--text)">${escapeHtml(player.name)}</div>
          <div style="font-size:0.78rem;color:var(--muted)">${escapeHtml(getTeam(player.team).name)}</div>
        </div>
      </div>` : `<div style="padding:20px 18px;color:var(--muted);font-size:0.88rem">${note}</div>`}
    </div>`;
  }

  container.innerHTML =
    leaderCard('👟', 'Golden Boot', scorersList, 'goals', 'Goals') +
    leaderCard('🎯', 'Most Assists', assistsList, 'assists', 'Assists') +
    leaderCard('🧤', 'Golden Glove', cleanSheetsList, 'cleanSheets', 'Clean Sheets') +
    leaderCard('🛡', 'Most Clean Sheets', cleanSheetsList, 'cleanSheets', 'Clean Sheets') +
    manualAwardCard('🦾', 'Best Defender', bestDefenderPlayer, 'Not yet announced — decided by the tournament committee.') +
    manualAwardCard('🌟', 'Most Valuable Player', mvpPlayer, 'Not yet announced — decided by the tournament committee.');
}

function saveSpecialAwards() {
  const bd  = $('award-best-defender').value;
  const mvp = $('award-mvp').value;
  if (!data.awards) data.awards = {};
  data.awards.bestDefender = bd ? parseInt(bd) : null;
  data.awards.mvp          = mvp ? parseInt(mvp) : null;
  save();
  showAlert($('awards-admin-alert'), 'success', 'Awards saved!');
}

