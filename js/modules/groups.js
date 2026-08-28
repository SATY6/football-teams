// ── GROUPS ────────────────────────────────────────────────────────────────────
function renderGroups() {
  const container = $('groups-container');
  const groups = ['A','B'];
  container.innerHTML = groups.map(g => {
    const teams = data.teams.filter(t => t.group === g);
    const rows  = computeStandings(g);
    return `<div>
      <div class="group-label" style="margin-top:0">${g==='A'?'🟢':'🔵'} Group ${g}</div>
      <div class="card" style="overflow:hidden">
        <table style="width:100%;border-collapse:collapse;font-size:0.88rem">
          <thead><tr style="background:var(--green-dark);color:#fff">
            <th style="padding:10px 14px;text-align:left;font-family:var(--font-display);font-size:0.8rem;letter-spacing:1px">Team</th>
            <th style="padding:10px 8px;font-family:var(--font-display);font-size:0.8rem;letter-spacing:1px">P</th>
            <th style="padding:10px 8px;font-family:var(--font-display);font-size:0.8rem;letter-spacing:1px">W</th>
            <th style="padding:10px 8px;font-family:var(--font-display);font-size:0.8rem;letter-spacing:1px">D</th>
            <th style="padding:10px 8px;font-family:var(--font-display);font-size:0.8rem;letter-spacing:1px">L</th>
            <th style="padding:10px 8px;font-family:var(--font-display);font-size:0.8rem;letter-spacing:1px">Pts</th>
          </tr></thead>
          <tbody>${rows.map((r,i)=>`
            <tr style="border-bottom:1px solid var(--border);${i===0?'background:#f0f9f3':''};cursor:pointer;transition:background 0.15s" onclick="openTeamModal(${r.team.id})" onmouseover="this.style.background='#e8f5ec'" onmouseout="this.style.background='${i===0?'#f0f9f3':'#fff'}'">
              <td style="padding:10px 14px"><div style="display:flex;align-items:center;gap:8px">
                <div style="width:28px;height:28px;flex-shrink:0">${teamLogo(r.team,28)}</div>
                <span style="font-weight:700">${escapeHtml(r.team.name)}</span>
                ${i===0?'<span style="font-size:0.62rem;background:var(--gold);color:#fff;padding:1px 6px;border-radius:10px;font-weight:700">👑 Leader</span>':''}
              </div></td>
              <td style="text-align:center;padding:10px 8px">${r.p}</td>
              <td style="text-align:center;padding:10px 8px">${r.w}</td>
              <td style="text-align:center;padding:10px 8px">${r.d}</td>
              <td style="text-align:center;padding:10px 8px">${r.l}</td>
              <td style="text-align:center;padding:10px 8px;font-family:var(--font-display);font-size:1.1rem;font-weight:800;color:var(--green-dark)">${r.w*3+r.d}</td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div style="padding:10px 14px;background:var(--bg);border-top:1px solid var(--border);font-size:0.72rem;color:var(--muted)">
          Tap a team to view their full profile
        </div>
      </div>
    </div>`;
  }).join('');
}

