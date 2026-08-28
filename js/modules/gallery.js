// ── GALLERY ───────────────────────────────────────────────────────────────────
function renderGallery() {
  const container = $('gallery-container');
  const btn = $('gallery-upload-btn');
  if (btn) btn.style.display = adminLoggedIn ? 'inline-flex' : 'none';

  const photos = [...(data.gallery||[])].sort((a,b)=>b.id-a.id);
  if (photos.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:4rem 2rem;background:var(--card);border:1px solid var(--border);border-radius:10px">
        <div style="font-size:3rem;margin-bottom:1rem">🖼️</div>
        <div style="font-family:var(--font-display);font-size:1.4rem;font-weight:800;color:var(--green-dark);text-transform:uppercase;margin-bottom:8px">Gallery Coming Soon</div>
        <p style="color:var(--muted);font-size:0.9rem">Match photos and highlights will appear here during the tournament.</p>
      </div>`;
    return;
  }

  container.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">
    ${photos.map(p => `
      <div style="position:relative;border-radius:10px;overflow:hidden;aspect-ratio:1;background:var(--bg);border:1px solid var(--border)">
        <button type="button" style="all:unset;position:absolute;inset:0;cursor:zoom-in;display:block;width:100%;height:100%" onclick="viewGalleryPhoto('${p.src}')" aria-label="${p.caption ? escapeHtml(p.caption) : 'View gallery photo'}">
          <img src="${p.src}" alt="${p.caption ? escapeHtml(p.caption) : 'Tournament gallery photo'}" style="width:100%;height:100%;object-fit:cover;display:block">
        </button>
        ${p.caption ? `<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.75));color:#fff;font-size:0.75rem;padding:16px 8px 6px;line-height:1.3;pointer-events:none">${escapeHtml(p.caption)}</div>` : ''}
        ${adminLoggedIn ? `<button onclick="event.stopPropagation();removeGalleryPhoto(${p.id})" style="position:absolute;top:6px;right:6px;width:26px;height:26px;border-radius:50%;background:rgba(192,57,43,0.9);color:#fff;border:none;cursor:pointer;font-size:0.9rem;line-height:1;z-index:1">✕</button>` : ''}
      </div>`).join('')}
  </div>`;
}

function addGalleryPhoto(event) {
  const files = Array.from(event.target.files);
  if (!data.gallery) data.gallery = [];
  let loaded = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      data.gallery.push({ id: data.nextGalleryId || Date.now(), src: e.target.result, caption: '' });
      data.nextGalleryId = (data.nextGalleryId || 1) + 1;
      loaded++;
      if (loaded === files.length) { save(); renderGallery(); }
    };
    reader.readAsDataURL(file);
  });
  event.target.value = '';
}

function removeGalleryPhoto(id) {
  data.gallery = (data.gallery||[]).filter(p => p.id !== id);
  save(); renderGallery();
}

