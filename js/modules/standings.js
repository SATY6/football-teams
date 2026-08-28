// ── STANDINGS ─────────────────────────────────────────────────────────────────
function computeStandings(groupFilter) {
  const rows = {};
  data.teams.filter(t => !groupFilter || t.group === groupFilter).forEach(t => {
    rows[t.id] = { team: t, p:0, w:0, d:0, l:0, gf:0, ga:0, form:[] };
  });
  const completed = data.matches.filter(m => m.status === 'completed');
  completed.sort((a,b) => new Date(a.datetime) - new Date(b.datetime));
  completed.forEach(m => {
    const h = rows[m.home], a = rows[m.away];
    if (!h || !a) return;
    h.p++; a.p++;
    h.gf += m.homeScore; h.ga += m.awayScore;
    a.gf += m.awayScore; a.ga += m.homeScore;
    if (m.homeScore > m.awayScore) { h.w++; a.l++; h.form.push('W'); a.form.push('L'); }
    else if (m.homeScore < m.awayScore) { a.w++; h.l++; h.form.push('L'); a.form.push('W'); }
    else { h.d++; a.d++; h.form.push('D'); a.form.push('D'); }
  });
  return Object.values(rows).sort((a,b) => {
    const pa = a.w*3+a.d*1, pb = b.w*3+b.d*1;
    if (pb !== pa) return pb - pa;
    const gda = a.gf-a.ga, gdb = b.gf-b.ga;
    if (gdb !== gda) return gdb - gda;
    return b.gf - a.gf;
  });
}

function qualStatus(i, total) {
  // Top 1 of each group qualifies, 2nd is in contention, rest eliminated
  if (i === 0) return { cls: 'qual-q', label: '✅ Qualified', stripe: 'var(--green)' };
  if (i === 1) return { cls: 'qual-c', label: '⚠ Contention', stripe: '#f39c12' };
  return { cls: 'qual-e', label: '❌ Eliminated', stripe: '#e0e0e0' };
}

function renderGroupTable(rows, containerId, prevRows) {
  const container = $(containerId);
  if (!container) return;

  // Header
  const header = `
    <div class="st-header">
      <div style="width:4px;flex-shrink:0"></div>
      <div style="width:36px;text-align:center;flex-shrink:0">#</div>
      <div style="width:38px;margin:0 10px 0 4px;flex-shrink:0">Logo</div>
      <div style="flex:1">Team</div>
      <div style="width:32px;text-align:center">P</div>
      <div style="width:32px;text-align:center">W</div>
      <div style="width:32px;text-align:center">D</div>
      <div style="width:32px;text-align:center">L</div>
      <div style="width:36px;text-align:center">GD</div>
      <div style="width:42px;text-align:center">Pts</div>
      <div style="width:6px;text-align:center;padding:0 6px 0 0" title="Position change">↕</div>
      <div style="padding:0 10px 0 6px">Form</div>
    </div>`;

  const rows_html = rows.map((r, i) => {
    const pts  = r.w * 3 + r.d;
    const gd   = r.gf - r.ga;
    const gdStr = (gd > 0 ? '+' : '') + gd;
    const gdColor = gd > 0 ? 'var(--green)' : gd < 0 ? 'var(--danger)' : 'var(--muted)';
    const qs   = qualStatus(i, rows.length);
    const formLast5 = r.form.slice(-5);
    const formHtml  = formLast5.map(f => `<span class="form-badge ${f}">${f}</span>`).join('');

    // Position change vs previous render
    let moveHtml = '';
    if (prevRows) {
      const prevIdx = prevRows.findIndex(p => p.team.id === r.team.id);
      if (prevIdx > i)       moveHtml = `<span class="st-move up"  title="Moved up">▲</span>`;
      else if (prevIdx < i)  moveHtml = `<span class="st-move down" title="Moved down">▼</span>`;
      else                   moveHtml = `<span class="st-move same" title="No change">—</span>`;
    } else {
      moveHtml = `<span class="st-move same">—</span>`;
    }

    return `
      <div class="st-card">
        <div class="st-stripe" style="background:${qs.stripe}"></div>
        <div class="st-rank-col">
          <span class="rank ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${i+1}</span>
        </div>
        <button type="button" class="st-logo" style="background:transparent;overflow:visible;margin:8px 10px 8px 4px;cursor:pointer;border:none;padding:0;font:inherit" onclick="openTeamModal(${r.team.id})" aria-label="View ${escapeHtml(r.team.name)}">${teamLogo(r.team, 38)}</button>
        <div class="st-name-col">
          <div class="st-team-name">${escapeHtml(r.team.name)}</div>
          <span class="st-qual-badge ${qs.cls}">${qs.label}</span>
        </div>
        <div class="st-stat">${r.p}</div>
        <div class="st-stat">${r.w}</div>
        <div class="st-stat">${r.d}</div>
        <div class="st-stat">${r.l}</div>
        <div class="st-gd" style="color:${gdColor}">${gdStr}</div>
        <div class="st-pts-col"><span class="st-pts">${pts}</span></div>
        <div style="width:20px;text-align:center;padding:0 2px">${moveHtml}</div>
        <div class="st-form-col">${formHtml}</div>
      </div>`;
  }).join('');

  container.innerHTML = header + rows_html;
}

let _prevRowsA = null, _prevRowsB = null;

function renderStandings() {
  const rowsA = computeStandings('A');
  const rowsB = computeStandings('B');
  renderGroupTable(rowsA, 'group-a-table', _prevRowsA);
  renderGroupTable(rowsB, 'group-b-table', _prevRowsB);
  _prevRowsA = rowsA;
  _prevRowsB = rowsB;
}

