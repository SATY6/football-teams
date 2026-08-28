// ── LIVE ──────────────────────────────────────────────────────────────────────
function renderLive() {
  const live = data.matches.filter(m=>m.status==='live');
  const container = $('live-container');
  if (live.length===0) {
    container.innerHTML = `<div style="text-align:center;padding:4rem 2rem;background:var(--card);border:1px solid var(--border);border-radius:10px">
      <div style="font-size:3rem;margin-bottom:12px">📺</div>
      <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--green-dark);text-transform:uppercase;margin-bottom:8px">No Live Matches Right Now</div>
      <p style="color:var(--muted);font-size:0.9rem">When a match goes live, it will appear here in real time.</p>
    </div>`;
    return;
  }
  container.innerHTML = `<div style="display:flex;flex-direction:column;gap:14px">${live.map(m=>{
    const ht=getTeam(m.home),at=getTeam(m.away);
    return `<div style="background:var(--card);border:2px solid #c0392b;border-radius:12px;padding:1.5rem;position:relative;box-shadow:0 4px 24px rgba(192,57,43,0.1)">
      <div style="position:absolute;top:12px;right:14px;background:#c0392b;color:#fff;font-family:var(--font-display);font-weight:700;font-size:0.75rem;letter-spacing:2px;padding:3px 10px;border-radius:20px;animation:livePulse 1.5s ease infinite">🔴 LIVE</div>
      <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:44px;height:44px">${teamLogo(ht,44)}</div>
          <span style="font-weight:700;font-size:1rem">${escapeHtml(ht.name)}</span>
        </div>
        <div style="text-align:center">
          <div style="font-family:var(--font-display);font-size:2.8rem;font-weight:800;color:var(--green-dark);letter-spacing:4px">${m.homeScore} – ${m.awayScore}</div>
          <div style="font-size:0.78rem;color:var(--muted)">${escapeHtml(m.venue||'Main Ground')}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;justify-content:flex-end">
          <span style="font-weight:700;font-size:1rem">${escapeHtml(at.name)}</span>
          <div style="width:44px;height:44px">${teamLogo(at,44)}</div>
        </div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

