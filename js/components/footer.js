// ── FOOTER ────────────────────────────────────────────────────────────────────
function renderFooter() {
  const sponsorsEl = $('footer-sponsors');
  if (!sponsorsEl) return; // footer not in DOM yet

  const sponsors = data.sponsors || [];
  sponsorsEl.innerHTML = sponsors.length
    ? sponsors.map(s => `<a class="footer-sponsor-chip" href="${safeUrl(s.link)}" target="_blank" rel="noopener">${s.logo?`<img src="${s.logo}" alt="${escapeHtml(s.name)} logo" loading="lazy" decoding="async">`:''}${escapeHtml(s.name)}</a>`).join('')
    : `<div style="font-size:0.82rem;color:rgba(248,250,252,0.55)">Interested in sponsoring? <a href="#" onclick="showSection('contact');return false" style="color:var(--gold)">Contact us</a>.</div>`;

  const committeeEl = $('footer-committee');
  committeeEl.innerHTML = (data.committee||[]).map(c => `
    <div class="footer-committee-item"><span>${escapeHtml(c.name)}</span><span>${escapeHtml(c.role)}</span></div>
  `).join('') || `<div style="font-size:0.82rem;color:rgba(248,250,252,0.55)">To be announced.</div>`;

  $('footer-venue').textContent = data.venueInfo || 'TBA';

  const ci = data.contactInfo || {};
  $('footer-contact').innerHTML = `
    ${ci.email ? `<div>📧 <a href="mailto:${ci.email}" style="color:rgba(248,250,252,0.85);text-decoration:none">${ci.email}</a></div>`:''}
    ${ci.phone ? `<div>📞 <a href="tel:${ci.phone.replace(/\s+/g,'')}" style="color:rgba(248,250,252,0.85);text-decoration:none">${ci.phone}</a></div>`:''}
    ${!ci.email && !ci.phone ? '<div style="color:rgba(248,250,252,0.55)">Contact info coming soon.</div>':''}
  `;

  const sl = data.socialLinks || {};
  const socialEl = $('footer-social');
  const socialIcons = { instagram:'📷', youtube:'▶️', facebook:'📘' };
  const active = Object.entries(sl).filter(([k,v]) => v);
  socialEl.innerHTML = active.length
    ? active.map(([k,v]) => `<a class="footer-social-btn" href="${v}" target="_blank" rel="noopener" title="${k}">${socialIcons[k]||'🔗'}</a>`).join('')
    : `<div style="font-size:0.82rem;color:rgba(248,250,252,0.55)">Coming soon.</div>`;

  const year = new Date().getFullYear();
  $('footer-copyright').textContent = `© ${year} ${data.tournamentName || 'SLIET Football Tournament'}. All rights reserved.`;
}

function saveFooterInfo() {
  data.venueInfo = $('admin-venue').value.trim();
  if (!data.contactInfo) data.contactInfo = {};
  data.contactInfo.email = $('admin-contact-email').value.trim();
  data.contactInfo.phone = $('admin-contact-phone').value.trim();
  if (!data.socialLinks) data.socialLinks = {};
  data.socialLinks.instagram = $('admin-social-instagram').value.trim();
  data.socialLinks.youtube   = $('admin-social-youtube').value.trim();
  data.socialLinks.facebook  = $('admin-social-facebook').value.trim();
  save();
  showAlert($('footer-info-alert'), 'success', 'Footer info saved!');
}

function renderSponsorList() {
  const el = $('sponsor-list-display');
  if (!el) return;
  const sponsors = data.sponsors || [];
  el.innerHTML = sponsors.map(s => `
    <div class="team-item">
      ${s.logo ? `<img src="${s.logo}" alt="${escapeHtml(s.name)} logo" loading="lazy" decoding="async" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0">` : `<span style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0">🏅</span>`}
      <span>${escapeHtml(s.name)}</span>
      <button class="btn btn-danger btn-sm" onclick="removeSponsor(${s.id})">✕</button>
    </div>`).join('') || '<div style="color:var(--muted);font-size:0.85rem;padding:4px">No sponsors added yet.</div>';
}

function addSponsor() {
  const name = $('sponsor-name').value.trim();
  const link = $('sponsor-link').value.trim();
  const fileInput = $('sponsor-logo');
  const alertEl = $('sponsor-alert');
  if (!name) { showAlert(alertEl, 'error', 'Sponsor name is required.'); return; }
  if (!data.sponsors) data.sponsors = [];

  const finish = (logo) => {
    data.sponsors.push({ id: data.nextSponsorId || Date.now(), name, link, logo: logo || '' });
    data.nextSponsorId = (data.nextSponsorId || 1) + 1;
    save(); renderSponsorList();
    $('sponsor-name').value = '';
    $('sponsor-link').value = '';
    fileInput.value = '';
    showAlert(alertEl, 'success', 'Sponsor added!');
  };

  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => finish(e.target.result);
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    finish('');
  }
}

function removeSponsor(id) {
  data.sponsors = (data.sponsors||[]).filter(s => s.id !== id);
  save(); renderSponsorList();
}

function renderCommitteeList() {
  const el = $('committee-list-display');
  if (!el) return;
  const committee = data.committee || [];
  el.innerHTML = committee.map(c => `
    <div class="team-item">
      <span style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0">👤</span>
      <span>${escapeHtml(c.name)} <span style="color:var(--muted);font-size:0.78rem">— ${escapeHtml(c.role)}</span></span>
      <button class="btn btn-danger btn-sm" onclick="removeCommitteeMember(${c.id})">✕</button>
    </div>`).join('') || '<div style="color:var(--muted);font-size:0.85rem;padding:4px">No committee members added yet.</div>';
}

function addCommitteeMember() {
  const name = $('committee-name').value.trim();
  const role = $('committee-role').value.trim();
  const alertEl = $('committee-alert');
  if (!name || !role) { showAlert(alertEl, 'error', 'Name and role are both required.'); return; }
  if (!data.committee) data.committee = [];
  data.committee.push({ id: data.nextCommitteeId || Date.now(), name, role });
  data.nextCommitteeId = (data.nextCommitteeId || 1) + 1;
  save(); renderCommitteeList();
  $('committee-name').value = '';
  $('committee-role').value = '';
  showAlert(alertEl, 'success', 'Committee member added!');
}

function removeCommitteeMember(id) {
  data.committee = (data.committee||[]).filter(c => c.id !== id);
  save(); renderCommitteeList();
}

/**
 * Resolves which copy of the tournament data to use, in priority order:
 *  1. SAVED_DATA baked into this HTML file (from a previous "export").
 *  2. localStorage — this browser's local edits, used if they contain at
 *     least as many matches as the baked-in copy (i.e. they're not older).
 *  3. DEFAULT_DATA (already the fallback `data` was initialized with).
 */
function load() {
  // Priority 1: embedded data in file (SAVED_DATA) — already loaded above
  // Priority 2: localStorage
  try {
    const s = localStorage.getItem('ftdata');
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed && parsed.teams) {
        const parsedCount = parsed.matches ? parsed.matches.length : 0;
        const savedCount  = data.matches ? data.matches.length : 0;
        // Use localStorage only if it has at least as many matches as the
        // embedded/default data — this is the browser-local copy of edits
        // that were never baked into the file via "Save to File".
        if (!SAVED_DATA || parsedCount >= savedCount) {
          data = parsed;
          if (!SAVED_DATA) {
            // No data baked into this file at all, but this browser has
            // saved edits sitting in localStorage — flag it so the admin
            // knows to download a copy before those edits are only
            // reachable from this one browser.
            _hasUnsavedFileChanges = true;
          }
        }
      }
    }
  } catch(e) {}
  updateUnsavedFileBanner();
}

// Saves data AND downloads an updated copy of the HTML file with data baked in
function saveToFile() {
  const htmlEl = document.documentElement.cloneNode(true);
  // Remove any existing script content and replace placeholder
  const scripts = htmlEl.querySelectorAll('script');
  scripts.forEach(s => {
    if (s.textContent.includes('DATA_PLACEHOLDER')) {
      s.textContent = s.textContent.replace(
        /const SAVED_DATA = .*?;/,
        `const SAVED_DATA = ${JSON.stringify(data)};`
      );
    }
  });
  const blob = new Blob(['<!DOCTYPE html>\n' + htmlEl.outerHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'index.html';
  a.click();
  URL.revokeObjectURL(url);
  _hasUnsavedFileChanges = false;
  updateUnsavedFileBanner();
}

