// ── BRACKET ADMIN ─────────────────────────────────────────────────────────────
function renderBracketAdmin() {
  const b   = getBracket();
  const con = $('bracket-admin-content');
  if (!con) return;

  const teamOptions = (sel) =>
    `<option value="">— TBD —</option>` +
    data.teams.map(t=>`<option value="${t.id}" ${sel==t.id?'selected':''}>${escapeHtml(t.name)}</option>`).join('');

  const matchRow = (mid, label) => {
    const m = b[mid];
    return `<div style="margin-bottom:6px">
      <div style="font-size:0.72rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">${label} — ${mid}</div>
      <div class="bracket-admin-match">
        <select id="bracket-admin-${mid}-home" style="font-size:0.8rem">${teamOptions(m.home)}</select>
        <div class="bracket-admin-sep">vs</div>
        <select id="bracket-admin-${mid}-away" style="font-size:0.8rem">${teamOptions(m.away)}</select>
        <input type="number" id="bracket-admin-${mid}-hs" min="0" max="20" value="${m.homeScore??''}" placeholder="H" style="text-align:center;font-size:0.85rem;padding:6px 4px">
        <input type="number" id="bracket-admin-${mid}-as" min="0" max="20" value="${m.awayScore??''}" placeholder="A" style="text-align:center;font-size:0.85rem;padding:6px 4px">
        <select id="bracket-admin-${mid}-status" style="font-size:0.75rem;padding:6px 4px;grid-column:span 5">
          <option value="upcoming" ${m.status==='upcoming'?'selected':''}>Upcoming</option>
          <option value="live"     ${m.status==='live'?'selected':''}>🔴 Live</option>
          <option value="completed"${m.status==='completed'?'selected':''}>✅ Completed</option>
        </select>
      </div>
    </div>`;
  };

  con.innerHTML = `
    <div class="bracket-admin-round-section">
      <div class="bracket-admin-round-label">⚽ Quarter Finals</div>
      ${matchRow('QF1','QF 1')}${matchRow('QF2','QF 2')}${matchRow('QF3','QF 3')}${matchRow('QF4','QF 4')}
    </div>
    <div class="bracket-admin-round-section">
      <div class="bracket-admin-round-label">🥊 Semi Finals</div>
      ${matchRow('SF1','SF 1')}${matchRow('SF2','SF 2')}
    </div>
    <div class="bracket-admin-round-section">
      <div class="bracket-admin-round-label">🏆 Final</div>
      ${matchRow('F1','Final')}
    </div>
    <div style="margin-top:10px">
      <label>Champion (override)</label>
      <select id="bracket-admin-champion" style="margin-top:4px">
        <option value="">— Auto from Final result —</option>
        ${data.teams.map(t=>`<option value="${t.id}" ${b.champion==t.id?'selected':''}>${escapeHtml(t.name)}</option>`).join('')}
      </select>
    </div>`;
}

function saveBracket() {
  if (!data.bracket) data.bracket = getDefaultBracket();
  const b = data.bracket;
  const all = ['QF1','QF2','QF3','QF4','SF1','SF2','F1'];
  all.forEach(mid => {
    const hEl = $(`bracket-admin-${mid}-home`);
    const aEl = $(`bracket-admin-${mid}-away`);
    if (!hEl) return;
    b[mid].home       = parseInt(hEl.value)||null;
    b[mid].away       = parseInt($(`bracket-admin-${mid}-away`).value)||null;
    b[mid].homeScore  = $(`bracket-admin-${mid}-hs`).value!=='' ? parseInt($(`bracket-admin-${mid}-hs`).value) : null;
    b[mid].awayScore  = $(`bracket-admin-${mid}-as`).value!=='' ? parseInt($(`bracket-admin-${mid}-as`).value) : null;
    b[mid].status     = $(`bracket-admin-${mid}-status`).value;
  });
  const champEl = $('bracket-admin-champion');
  b.champion = parseInt(champEl?.value)||null;
  autoAdvanceBracket();
  save();
  showAlert($('bracket-admin-alert'),'success','Bracket saved! Winners auto-advanced.');
}

function resetBracket() {
  if (!confirm('Reset the entire bracket?')) return;
  data.bracket = getDefaultBracket();
  save(); renderAdmin();
}

