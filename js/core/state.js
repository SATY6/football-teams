// ── DATA ──────────────────────────────────────────────────────────────────────
const DEFAULT_DATA = {
  tournamentName: 'SLIET Football Tournament',
  teams: [
    { id:1, name:'BH-1',  code:'BH1', color:'#1a3a6e', color2:'#f5c518', group:'A', shield:'classic',  emblem:'👑' },
    { id:2, name:'BH-5',  code:'BH5', color:'#8b0000', color2:'#ffffff', group:'A', shield:'stripes',  emblem:'🔥' },
    { id:3, name:'BH-6',  code:'BH6', color:'#1e6b2e', color2:'#ffd700', group:'A', shield:'pointed',  emblem:'🦁' },
    { id:4, name:'BH-7',  code:'BH7', color:'#4a1078', color2:'#e8c4f0', group:'B', shield:'modern',   emblem:'⚡' },
    { id:5, name:'BH-8',  code:'BH8', color:'#b35c00', color2:'#1a1a1a', group:'B', shield:'split',    emblem:'🦅' },
    { id:6, name:'BH-9',  code:'BH9', color:'#003580', color2:'#c0392b', group:'B', shield:'round',    emblem:'⭐' },
    { id:7, name:'BH-34', code:'B34', color:'#006060', color2:'#f0f0f0', group:'B', shield:'classic',  emblem:'🏆' },
  ],
  matches: [],
  scorers: [],
  players: [],
  news: [
    { id: 1, title: 'SLIET Football Cup 2026 — Registration Open!', body: 'All hostels are invited to register their teams for the SLIET Football Cup 2026. Registration deadline is soon. Contact the Sports Committee for details.', date: '2026-01-01', tag: 'Announcement' },
    { id: 2, title: 'Tournament Schedule Released', body: 'The full fixture schedule for Group A and Group B matches has been released. Check the Fixtures tab for your team\'s match dates and timings.', date: '2026-01-05', tag: 'Schedule' },
  ],
  gallery: [],
  awards: { bestDefender: null, mvp: null },
  sponsors: [],
  committee: [
    { id: 1, name: 'Dr. R.K. Sharma', role: 'Chief Patron' },
    { id: 2, name: 'Prof. Suresh Kumar', role: 'Tournament Director' },
    { id: 3, name: 'Rahul Verma', role: 'Sports Secretary' }
  ],
  contactInfo: { email: 'sports@sliet.ac.in', phone: '+91 98765 43210' },
  socialLinks: { instagram: '', youtube: '', facebook: '' },
  venueInfo: 'Main Ground, SLIET Campus, Longowal, Punjab',
  nextSponsorId: 1,
  nextCommitteeId: 4,
  nextId: 1,
  nextNewsId: 3,
  nextPlayerId: 1,
  nextGalleryId: 1
};

