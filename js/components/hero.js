// ── HERO ──────────────────────────────────────────────────────────────────────
function buildHero() {
  // Stars
  const sc = $('stars-container');
  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      top:${Math.random()*55}%;
      --d:${2+Math.random()*4}s;
      --delay:${Math.random()*4}s;
      --min:${0.1+Math.random()*0.3};
    `;
    sc.appendChild(s);
  }

  // Crowd dots
  const colors = ['#00E5FF','#FFD700','#F8FAFC','#00B8D4','#FFEE99','#4DD9EA','#FFC700'];
  [1,2,3].forEach(n => {
    const row = $(`crowd${n}`);
    if (!row) return;
    const count = n === 1 ? 90 : n === 2 ? 110 : 130;
    for (let i = 0; i < count; i++) {
      const d = document.createElement('div');
      d.className = 'crowd-dot';
      d.style.cssText = `
        background:${colors[Math.floor(Math.random()*colors.length)]};
        --cd:${1.5+Math.random()*3}s;
        --cdelay:${Math.random()*3}s;
      `;
      row.appendChild(d);
    }
  });

  // Countdown — reads first upcoming match date, else defaults to a fixed date
  function getCountdownTarget() {
    const upcoming = data.matches
      .filter(m => m.status === 'upcoming' && m.datetime)
      .map(m => new Date(m.datetime))
      .filter(d => d > new Date())
      .sort((a,b) => a-b);
    if (upcoming.length > 0) return upcoming[0];
    // Default fallback: 30 days from now
    return new Date(Date.now() + 30*24*60*60*1000);
  }

  function updateCountdown() {
    const target = getCountdownTarget();
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      $('countdown-wrap').style.display = 'none';
      $('hero-live-badge').style.display = 'inline-flex';
      return;
    }

    const days  = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
    const mins  = Math.floor((diff % (1000*60*60)) / (1000*60));
    const secs  = Math.floor((diff % (1000*60)) / 1000);

    const pad = n => String(n).padStart(2,'0');
    $('cd-days').textContent  = pad(days);
    $('cd-hours').textContent = pad(hours);
    $('cd-mins').textContent  = pad(mins);
    $('cd-secs').textContent  = pad(secs);

    // Show live badge alongside if any match is live
    const hasLive = data.matches.some(m => m.status === 'live');
    $('hero-live-badge').style.display = hasLive ? 'inline-flex' : 'none';
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

