// ── STATS ─────────────────────────────────────────────────────────────────────
function renderStats() {
  const container = $('stats-container');
  const standings = computeStandings(null);

  // Top Scorers
  const sortedScorers = [...data.scorers].sort((a,b) => b.goals - a.goals).slice(0,8);
  const maxGoals = sortedScorers[0]?.goals || 1;

  // Team attack / defense
  const sortedAttack = [...standings].sort((a,b) => b.gf - a.gf).slice(0,6);
  const maxGF = sortedAttack[0]?.gf || 1;
  const sortedDefense = [...standings].sort((a,b) => a.ga - b.ga).slice(0,6);
  const minGA = sortedDefense[sortedDefense.length-1]?.ga || 1;

  // Summary stats
  const totalGoals = standings.reduce((s,r)=>s+r.gf,0);
  const completedMatches = data.matches.filter(m=>m.status==='completed').length;
  const totalMatches = data.matches.length;

  container.innerHTML = `
    <div class="card" style="padding:1.2rem; display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:12px; margin-bottom:0">
      ${[
        ['Total Matches', totalMatches],
        ['Played', completedMatches],
        ['Total Goals', totalGoals],
        ['Avg Goals/Match', completedMatches ? (totalGoals/completedMatches).toFixed(1) : '—'],
        ['Teams', data.teams.length],
      ].map(([label,val])=>`
        <div style="text-align:center;padding:10px;background:var(--bg);border-radius:8px">
          <div style="font-size:0.75rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-weight:600">${label}</div>
          <div style="font-family:var(--font-display);font-size:2rem;font-weight:800;color:var(--green-dark)">${val}</div>
        </div>`).join('')}
    </div>

    <div class="stat-card">
      <div class="stat-card-header">⚽ Top Scorers</div>
      <ul class="stat-list">
        ${sortedScorers.length === 0
          ? '<li style="padding:14px 16px;color:var(--muted);font-size:0.88rem">No scorers added yet.</li>'
          : sortedScorers.map((s,i)=>{
          const team = getTeam(s.team);
          return `<li class="stat-item">
            <span class="stat-rank ${i<3?'top':''}">${i+1}</span>
            <div class="stat-bar-wrap">
              <span class="stat-label">${escapeHtml(s.name)}<br><span style="font-size:0.75rem;color:var(--muted);font-weight:400">${escapeHtml(team.name)}</span></span>
              <div class="stat-bar"><div class="stat-bar-fill" style="width:0%" data-target="${(s.goals/maxGoals*100).toFixed(0)}%"></div></div>
            </div>
            <span class="stat-value">${s.goals}</span>
          </li>`;}).join('')}
      </ul>
    </div>

    <div class="stat-card">
      <div class="stat-card-header">🏹 Most Goals Scored</div>
      <ul class="stat-list">
        ${sortedAttack.map((r,i)=>`<li class="stat-item">
          <span class="stat-rank ${i<3?'top':''}">${i+1}</span>
          <div class="stat-bar-wrap">
            <div class="team-badge" style="background:${r.team.color};width:24px;height:24px;font-size:0.6rem;flex-shrink:0">${escapeHtml(r.team.code)}</div>
            <span class="stat-label">${escapeHtml(r.team.name)}</span>
            <div class="stat-bar"><div class="stat-bar-fill" style="width:0%" data-target="${(r.gf/maxGF*100).toFixed(0)}%"></div></div>
          </div>
          <span class="stat-value">${r.gf}</span>
        </li>`).join('')}
      </ul>
    </div>

    <div class="stat-card">
      <div class="stat-card-header">🛡 Best Defense (Fewest Conceded)</div>
      <ul class="stat-list">
        ${sortedDefense.map((r,i)=>{
          const maxGA = Math.max(...sortedDefense.map(x=>x.ga),1);
          return `<li class="stat-item">
            <span class="stat-rank ${i<3?'top':''}">${i+1}</span>
            <div class="stat-bar-wrap">
              <div class="team-badge" style="background:${r.team.color};width:24px;height:24px;font-size:0.6rem;flex-shrink:0">${escapeHtml(r.team.code)}</div>
              <span class="stat-label">${escapeHtml(r.team.name)}</span>
              <div class="stat-bar"><div class="stat-bar-fill" style="width:0%; background:var(--green-dark)" data-target="${r.ga===0?5:(100 - r.ga/maxGA*90).toFixed(0)}%"></div></div>
            </div>
            <span class="stat-value">${r.ga}</span>
          </li>`;}).join('')}
      </ul>
    </div>
  `;
  animateBarsIn();
}

