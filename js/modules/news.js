// ── NEWS ──────────────────────────────────────────────────────────────────────
function renderNews() {
  const container = $('news-container');
  const news = [...(data.news||[])].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const tagColors = { Announcement:'var(--green)', Schedule:'#1a5276', Result:'#922b21', Update:'#b7770d' };
  container.innerHTML = news.map(n=>`
    <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden;display:flex;gap:0">
      <div style="width:6px;background:${tagColors[n.tag]||'var(--green)'};flex-shrink:0"></div>
      <div style="padding:1.2rem 1.4rem;flex:1">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap">
          <span style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:2px 10px;border-radius:10px;background:${tagColors[n.tag]||'var(--green)'};color:#fff">${n.tag||'News'}</span>
          <span style="font-size:0.78rem;color:var(--muted)">${new Date(n.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span>
        </div>
        <div style="font-family:var(--font-display);font-weight:800;font-size:1.15rem;color:var(--text);margin-bottom:6px">${escapeHtml(n.title)}</div>
        <p style="font-size:0.88rem;color:var(--muted);line-height:1.6">${escapeHtml(n.body)}</p>
      </div>
    </div>`).join('') || `<div style="text-align:center;padding:3rem;background:var(--card);border:1px solid var(--border);border-radius:10px;color:var(--muted)">No news yet.</div>`;
}

