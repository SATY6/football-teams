// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  // Next upcoming match
  const upcoming = data.matches
    .filter(m => m.status === 'upcoming' && m.datetime)
    .sort((a,b) => new Date(a.datetime) - new Date(b.datetime));

  if (upcoming.length > 0) {
    const m = upcoming[0];
    const ht = getTeam(m.home), at = getTeam(m.away);
    const dt = new Date(m.datetime);
    const now = new Date();
    const diffMs = dt - now;
    const diffDays = Math.floor(diffMs / (1000*60*60*24));
    let dateStr;
    if (diffDays === 0) dateStr = 'Today · ' + dt.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
    else if (diffDays === 1) dateStr = 'Tomorrow · ' + dt.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
    else dateStr = dt.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}) + ' · ' + dt.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});

    $('dnm-home-badge').innerHTML = teamLogo(ht, 44);
    $('dnm-home-name').textContent = ht.name;
    $('dnm-away-badge').innerHTML = teamLogo(at, 44);
    $('dnm-away-name').textContent = at.name;
    $('dnm-meta').textContent = dateStr;
    $('dnm-venue').textContent = m.venue || '';
  } else {
    $('dnm-meta').textContent = 'No upcoming matches';
    $('dnm-home-name').textContent = '—';
    $('dnm-away-name').textContent = '—';
  }

  // Latest completed result
  const completed = data.matches
    .filter(m => m.status === 'completed')
    .sort((a,b) => new Date(b.datetime) - new Date(a.datetime));

  if (completed.length > 0) {
    const m = completed[0];
    const ht = getTeam(m.home), at = getTeam(m.away);
    $('dlr-home-badge').innerHTML = teamLogo(ht, 44);
    $('dlr-home-name').textContent = ht.name;
    $('dlr-away-badge').innerHTML = teamLogo(at, 44);
    $('dlr-away-name').textContent = at.name;
    $('dlr-score').textContent = `${m.homeScore} – ${m.awayScore}`;
    $('dlr-round').textContent = m.round || '';
  } else {
    $('dlr-score').textContent = '— — —';
    $('dlr-round').textContent = 'No results yet';
  }

  // Top scorer
  const sorted = [...(data.scorers||[])].sort((a,b)=>b.goals-a.goals);
  if (sorted.length > 0) {
    const s = sorted[0];
    const team = getTeam(s.team);
    $('dashboard-scorer-badge').innerHTML = teamLogo(team, 48);
    $('dashboard-scorer-badge').style.background = 'transparent';
    $('dashboard-scorer-name').textContent = s.name;
    $('dashboard-scorer-team').textContent = team.name;
    $('dashboard-scorer-goals').textContent = s.goals;
  } else {
    $('dashboard-scorer-name').textContent = 'No scorers yet';
    $('dashboard-scorer-team').textContent = '—';
    $('dashboard-scorer-goals').textContent = '0';
  }

  // Summary stats
  const allCompleted = data.matches.filter(m=>m.status==='completed');
  const totalGoals = allCompleted.reduce((s,m)=>s+m.homeScore+m.awayScore, 0);
  const avg = allCompleted.length > 0 ? (totalGoals/allCompleted.length).toFixed(1) : '0.0';
  $('dashboard-total-goals').textContent = totalGoals;
  $('dashboard-matches-played').textContent = allCompleted.length;
  $('dashboard-teams-count').textContent = data.teams.length;
  $('dashboard-avg-goals').textContent = avg;
}

function goHome() {
  $('hero').style.display = '';
  $('home-dashboard').style.display = '';
  $$('.section').forEach(s => s.classList.remove('active'));
  $$('#desktop-nav button').forEach(b => {
    b.classList.remove('active');
    b.removeAttribute('aria-current');
  });
  const homeBtn = $('nav-home');
  homeBtn.classList.add('active');
  homeBtn.setAttribute('aria-current', 'page');
  renderDashboard();
  window.scrollTo(0,0);
  announceForScreenReader('Home view opened');
}

function heroGoTo(section) {
  $('hero').style.display = 'none';
  $('home-dashboard').style.display = 'none';
  showSection(section);
}

// Override showSection to also hide hero (compatibility shim)
const _origShowSection = window.showSection;

