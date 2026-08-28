// ── PLAYER PROFILE MODAL ──────────────────────────────────────────────────────
let _currentPlayerId = null;

function openPlayerModal(id) {
  _currentPlayerId = id;
  const p    = (data.players||[]).find(x=>x.id===id);
  if (!p) return;
  const team = getTeam(p.team);
  const col  = posColor(p.position);

  // Header gradient
  $('player-modal-header').style.background =
    `linear-gradient(135deg,${team.color} 0%,${col} 100%)`;

  // Photo
  const pmPhoto = $('player-modal-photo');
  pmPhoto.style.background = 'rgba(255,255,255,0.15)';
  pmPhoto.innerHTML = playerPhotoHTML(p, { iconSize: '2.5rem', circular: true });

  // Jersey
  const jerseyEl = $('player-modal-jersey');
  jerseyEl.textContent = p.number ? `#${p.number}` : '';
  jerseyEl.style.display = p.number ? '' : 'none';

  // Name
  $('player-modal-name').textContent = p.name;

  // Position + Team badges
  const posBadge = $('player-modal-pos-badge');
  posBadge.textContent = posLabel(p.position);
  posBadge.style.background = col;

  $('player-modal-team-badge').textContent = team.name;

  // Info row — age, hostel, group
  const infoChips = [];
  if (p.age)    infoChips.push(`🎂 Age ${p.age}`);
  if (p.hostel) infoChips.push(`🏠 ${escapeHtml(p.hostel)}`);
  if (team.group) infoChips.push(`📍 Group ${team.group}`);
  $('player-modal-info-row').innerHTML =
    infoChips.map(c=>`<span class="player-modal-info-chip">${c}</span>`).join('');

  // Stats grid — all 5 stats
  const stats = [
    { val: p.goals||0,   label: 'Goals',    icon:'⚽', color:'var(--green)' },
    { val: p.assists||0, label: 'Assists',  icon:'🎯', color:'#2471a3' },
    { val: p.yellow||0,  label: 'Yellow',   icon:'🟨', color:'#f39c12' },
    { val: p.red||0,     label: 'Red Cards',icon:'🟥', color:'#c0392b' },
    { val: p.mins||0,    label: "Mins",     icon:'⏱',  color:'var(--green-dark)' },
  ];
  if (p.position === 'GK') {
    stats.push({ val: p.cleanSheets||0, label: 'Clean Sheets', icon:'🧤', color:'#8e44ad' });
  }
  $('player-modal-stats-grid').innerHTML = stats.map(s=>`
    <div class="player-modal-stat-item">
      <div style="font-size:1.3rem;margin-bottom:4px">${s.icon}</div>
      <div class="player-modal-stat-val" style="color:${s.color}">${s.val}${s.label==='Mins'?"'":''}</div>
      <div class="player-modal-stat-label">${s.label}</div>
    </div>`).join('');

  // Admin edit panel
  const editWrap = $('player-modal-edit-wrap');
  editWrap.style.display = adminLoggedIn ? '' : 'none';
  $('player-modal-edit-panel').style.display = 'none';

  // Show modal
  $('player-modal').classList.add('open');
  $('player-modal').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closePlayerModal() {
  $('player-modal').classList.remove('open');
  $('player-modal').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  _currentPlayerId = null;
}

function openEditPlayer() {
  const p = (data.players||[]).find(x=>x.id===_currentPlayerId);
  if (!p) return;
  $('edit-p-goals').value   = p.goals||0;
  $('edit-p-assists').value = p.assists||0;
  $('edit-p-mins').value    = p.mins||0;
  $('edit-p-yellow').value  = p.yellow||0;
  $('edit-p-red').value     = p.red||0;
  $('edit-p-cleansheets').value = p.cleanSheets||0;
  $('edit-p-age').value     = p.age||'';

  // Reset any pending (unsaved) photo change and show the player's
  // current photo, or the placeholder if they don't have one.
  _playerPhoto = null;
  _playerPhotoRemoved = false;
  const img = $('edit-player-photo-img');
  const placeholder = $('edit-player-photo-placeholder');
  const clearBtn = $('edit-clear-photo-btn');
  if (p.photo) {
    img.src = p.photo;
    img.style.display = 'block';
    placeholder.style.display = 'none';
    clearBtn.style.display = 'inline-flex';
  } else {
    img.style.display = 'none';
    img.src = '';
    placeholder.style.display = 'block';
    clearBtn.style.display = 'none';
  }

  $('player-modal-edit-panel').style.display = '';
  $('player-modal-edit-wrap').style.display  = 'none';
}

function handleEditPlayerPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    _playerPhoto = e.target.result;
    _playerPhotoRemoved = false;
    $('edit-player-photo-img').src = _playerPhoto;
    $('edit-player-photo-img').style.display = 'block';
    $('edit-player-photo-placeholder').style.display = 'none';
    $('edit-clear-photo-btn').style.display = 'inline-flex';
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function clearEditPlayerPhoto() {
  _playerPhoto = null;
  _playerPhotoRemoved = true;
  $('edit-player-photo-img').style.display = 'none';
  $('edit-player-photo-img').src = '';
  $('edit-player-photo-placeholder').style.display = 'block';
  $('edit-clear-photo-btn').style.display = 'none';
}

function savePlayerStats() {
  const p = (data.players||[]).find(x=>x.id===_currentPlayerId);
  if (!p) return;
  p.goals   = parseInt($('edit-p-goals').value)||0;
  p.assists = parseInt($('edit-p-assists').value)||0;
  p.mins    = parseInt($('edit-p-mins').value)||0;
  p.yellow  = parseInt($('edit-p-yellow').value)||0;
  p.red     = parseInt($('edit-p-red').value)||0;
  p.cleanSheets = parseInt($('edit-p-cleansheets').value)||0;
  p.age     = parseInt($('edit-p-age').value)||0;

  if (_playerPhoto) {
    p.photo = _playerPhoto;
  } else if (_playerPhotoRemoved) {
    delete p.photo;
  }
  _playerPhoto = null;
  _playerPhotoRemoved = false;

  save();
  showAlert($('player-modal-edit-alert'),'success','Stats saved!');
  openPlayerModal(_currentPlayerId);
}

function deleteCurrentPlayer() {
  if (!confirm('Delete this player?')) return;
  data.players = (data.players||[]).filter(x=>x.id!==_currentPlayerId);
  save(); closePlayerModal(); renderPlayers();
}

