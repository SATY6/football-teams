// ── TOURNAMENT BRACKET ────────────────────────────────────────────────────────
// Bracket structure: 4 QFs → 2 SFs → 1 Final → Champion
// Each match: { home, away, homeScore, awayScore, status }
// IDs: QF1–QF4, SF1–SF2, F1

const BRACKET_ROUNDS = [
  { id:'qf', label:'Quarter Finals', matchIds:['QF1','QF2','QF3','QF4'] },
  { id:'sf', label:'Semi Finals',    matchIds:['SF1','SF2'] },
  { id:'f',  label:'Final',          matchIds:['F1'] },
];

function getDefaultBracket() {
  const empty = () => ({ home:null, away:null, homeScore:null, awayScore:null, status:'upcoming' });
  return {
    QF1: empty(), QF2: empty(), QF3: empty(), QF4: empty(),
    SF1: empty(), SF2: empty(),
    F1:  empty(),
    champion: null
  };
}

function getBracket() {
  if (!data.bracket) data.bracket = getDefaultBracket();
  return data.bracket;
}

function bracketWinner(match) {
  if (!match || match.status !== 'completed') return null;
  if (match.homeScore > match.awayScore) return match.home;
  if (match.awayScore > match.homeScore) return match.away;
  return null; // draw — no auto advance
}

function autoAdvanceBracket() {
  const b = getBracket();
  // QF winners → SF
  b.SF1.home = bracketWinner(b.QF1) ?? b.SF1.home;
  b.SF1.away = bracketWinner(b.QF2) ?? b.SF1.away;
  b.SF2.home = bracketWinner(b.QF3) ?? b.SF2.home;
  b.SF2.away = bracketWinner(b.QF4) ?? b.SF2.away;
  // SF winners → Final
  b.F1.home  = bracketWinner(b.SF1) ?? b.F1.home;
  b.F1.away  = bracketWinner(b.SF2) ?? b.F1.away;
  // Champion
  b.champion = bracketWinner(b.F1) ?? b.champion;
}

function renderBracket() {
  autoAdvanceBracket();
  const b   = getBracket();
  const con = $('bracket-container');

  // Build rounds config
  const rounds = [
    { label:'Quarter Finals', isFinal:false, matches:['QF1','QF2','QF3','QF4'] },
    { label:'Semi Finals',    isFinal:false, matches:['SF1','SF2'] },
    { label:'Final',          isFinal:true,  matches:['F1'] },
  ];

  // Responsive: scale every pixel-based dimension together so the SVG
  // connectors always line up with the round heights, instead of relying
  // on fixed 120px/200px/176px/28px values that only fit desktop widths.
  const vw          = window.innerWidth || document.documentElement.clientWidth;
  const isMobile     = vw <= 640;
  const isNarrow      = vw <= 400;
  const slotHeight    = isNarrow ? 76 : isMobile ? 92 : 120;
  const roundWidth    = isNarrow ? 128 : isMobile ? 152 : 200;
  const matchWidth    = isNarrow ? 110 : isMobile ? 132 : 176;
  const connectorW    = isNarrow ? 14 : isMobile ? 18 : 28;

  con.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden">
      <!-- Bracket title bar -->
      <div style="background:var(--green-dark);padding:14px 20px;display:flex;align-items:center;gap:12px">
        <span style="font-size:1.4rem">🏆</span>
        <div>
          <div style="font-family:var(--font-display);font-weight:800;font-size:1rem;color:#fff;text-transform:uppercase;letter-spacing:1px">Knockout Stage</div>
          <div style="font-size:0.7rem;color:rgba(255,255,255,0.5);letter-spacing:1px">SLIET Football Cup 2026</div>
        </div>
      </div>

      <!-- Scrollable bracket -->
      <div class="bracket-wrap">
        <div class="bracket-inner" id="bracket-inner">

          ${rounds.map((round, ri) => {
            const totalSlots  = Math.pow(2, rounds.length - 1 - ri); // 4, 2, 1
            const roundHeight = totalSlots * slotHeight;

            return `<div style="display:flex;align-items:center;gap:0">
              <div class="bracket-round" style="height:${roundHeight}px;width:${roundWidth}px">
                <div class="bracket-round-header ${round.isFinal?'final-round':''}">${round.label}</div>
                <div class="bracket-slots" style="height:calc(100% - 36px)">
                  ${round.matches.map((mid,mi) => {
                    const m = b[mid];
                    return `<div class="bracket-slot-wrap" style="height:${roundHeight/round.matches.length}px">
                      ${buildBracketMatch(mid, m, ri < rounds.length-1, matchWidth)}
                    </div>`;
                  }).join('')}
                </div>
              </div>
              ${ri < rounds.length-1 ? buildConnectors(round.matches.length, Math.pow(2, rounds.length-2-ri) * slotHeight, connectorW) : ''}
            </div>`;
          }).join('')}

          <!-- CHAMPION -->
          ${buildChampion(b.champion)}

        </div>
      </div>
    </div>`;
}

function buildBracketMatch(mid, m, showConnector, matchWidth) {
  const widthStyle = matchWidth ? `width:${matchWidth}px` : '';

  if (!m.home && !m.away) {
    return `<div class="bracket-match bracket-match-empty" style="${widthStyle}">
      <div class="bracket-match-tbd">TBD</div>
      <div class="bracket-match-tbd" style="border-top:1px solid var(--border)">TBD</div>
    </div>`;
  }

  const ht = m.home ? getTeam(m.home) : null;
  const at = m.away ? getTeam(m.away) : null;
  const hW = m.status==='completed' && m.homeScore > m.awayScore;
  const aW = m.status==='completed' && m.awayScore > m.homeScore;
  const isLive = m.status==='live';

  const teamRow = (team, score, isWinner, isLoser) => `
    <div class="bracket-match-team ${isWinner?'bracket-match-winner':''} ${isLoser?'bracket-match-loser':''}">
      <div class="bracket-match-logo">${team ? teamLogo(team,26) : '<span style="font-size:1rem">?</span>'}</div>
      <div class="bracket-match-name">${team?.name||'TBD'}</div>
      <div class="bracket-match-score">${score!==null&&score!==undefined?score:''}</div>
      ${isWinner?`<div class="bracket-match-winner-crown">👑</div>`:''}
    </div>`;

  return `<div class="bracket-match ${isLive?'bracket-match-live':m.status==='completed'?'bracket-match-done':''}" style="${widthStyle}">
    ${teamRow(ht, m.homeScore, hW, m.status==='completed'&&!hW)}
    ${teamRow(at, m.awayScore, aW, m.status==='completed'&&!aW)}
    <div class="bracket-match-status ${isLive?'live-s':''}">
      ${isLive?'🔴 LIVE':m.status==='completed'?'✅ FT':mid}
    </div>
  </div>`;
}

function buildConnectors(matchCount, slotH, width) {
  // SVG connector lines between rounds. `width` is passed in from
  // renderBracket() so the connector geometry always matches the
  // current round/match sizing (desktop or mobile) instead of assuming
  // a fixed 28px column.
  const w  = width || 28;
  const mid = w / 2;
  const h = matchCount * slotH;
  const lines = [];
  for (let i=0; i<matchCount/2; i++) {
    const y1 = slotH * (i*2) + slotH/2;
    const y2 = slotH * (i*2+1) + slotH/2;
    const yMid = (y1+y2)/2;
    lines.push(`
      <line x1="0" y1="${y1+36}" x2="${mid}" y2="${y1+36}" stroke="var(--border)" stroke-width="2"/>
      <line x1="0" y1="${y2+36}" x2="${mid}" y2="${y2+36}" stroke="var(--border)" stroke-width="2"/>
      <line x1="${mid}" y1="${y1+36}" x2="${mid}" y2="${y2+36}" stroke="var(--border)" stroke-width="2"/>
      <line x1="${mid}" y1="${yMid+36}" x2="${w}" y2="${yMid+36}" stroke="var(--border)" stroke-width="2"/>
    `);
  }
  return `<svg width="${w}" height="${h+36}" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;align-self:flex-start;margin-top:36px">${lines.join('')}</svg>`;
}

function buildChampion(champId) {
  const team = champId ? getTeam(champId) : null;
  return `
    <div style="display:flex;align-items:center">
      <svg width="28" height="120" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="60" x2="28" y2="60" stroke="var(--border)" stroke-width="2"/>
      </svg>
      <div class="bracket-champion" style="width:140px">
        <div class="champ-trophy">🏆</div>
        <div class="champ-label">Champion</div>
        ${team
          ? `<div class="champ-logo">${teamLogo(team,44)}</div>
             <div class="champ-name">${escapeHtml(team.name)}</div>`
          : `<div style="font-family:var(--font-display);font-size:0.85rem;font-weight:700;color:rgba(0,0,0,0.25);letter-spacing:1px">— TBD —</div>`}
      </div>
    </div>`;
}

