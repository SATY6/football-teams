// ── TOP SCORERS ───────────────────────────────────────────────────────────────
function renderScorers() {
  const sorted = [...(data.scorers||[])].sort((a,b)=>b.goals-a.goals);
  const max = sorted[0]?.goals || 1;
  const container = $('scorers-container');
  if (sorted.length === 0) {
    container.innerHTML = `<div style="padding:3rem;text-align:center;color:var(--muted)">
      <div style="font-size:2.5rem;margin-bottom:10px">⚽</div>
      <div style="font-weight:700;color:var(--text);margin-bottom:4px">No Goals Scored Yet</div>
      <div style="font-size:0.85rem">Goals will appear here as matches are played.</div>
    </div>`;
    return;
  }
  container.innerHTML = `
    <div style="background:var(--green-dark);color:#fff;padding:14px 20px;font-family:var(--font-display);font-weight:800;font-size:1.1rem;text-transform:uppercase;letter-spacing:1px">⚽ Top Scorers</div>
    ${sorted.map((s,i)=>{
      const team = getTeam(s.team);
      const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
      return `<div style="display:flex;align-items:center;gap:14px;padding:14px 20px;border-bottom:1px solid var(--border);${i===0?'background:var(--gold-highlight)':''}">
        <span style="font-size:1.2rem;width:28px;text-align:center">${medal||`<span style="font-family:var(--font-display);font-weight:800;color:var(--muted);font-size:1rem">${i+1}</span>`}</span>
        <div style="width:36px;height:36px;flex-shrink:0">${teamLogo(team,36)}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:0.95rem">${escapeHtml(s.name)}</div>
          <div style="font-size:0.78rem;color:var(--muted)">${escapeHtml(team.name)}</div>
          <div style="margin-top:6px;height:5px;background:var(--border);border-radius:3px;overflow:hidden">
            <div style="height:100%;background:var(--green);border-radius:3px;width:${(s.goals/max*100).toFixed(0)}%;transition:width 0.5s"></div>
          </div>
        </div>
        <div style="font-family:var(--font-display);font-size:2rem;font-weight:800;color:var(--green-dark);min-width:32px;text-align:right">${s.goals}</div>
      </div>`;
    }).join('')}`;
}

