// Code map from the Drona Deck print kit (spec v2, section 06).
// Every printed card has a route; only the cards marked active drive the game at this booth.

const CARDS = {
  s: {
    SCI: { name: 'Science', active: true },
    ENG: { name: 'English', active: false },
    CIV: { name: 'Civics', active: true },
    // History is not played at this booth (replaced by Civics). Kept so a stray History tag gets a clear message.
    HIS: { name: 'History', active: false },
  },
  d: {
    EASY: { name: 'Easy', active: true, accent: '#8DBA6B', prompt: 'Warm-up questions: levels 1 to 3.' },
    TOUGH: { name: 'Tough', active: true, accent: '#D27E5C', prompt: 'Questions that stretch your thinking: levels 4 to 6.' },
  },
  p: {
    DEP: { name: 'Depth', active: true, accent: '#6E9FD6', prompt: 'How deep can they think?' },
    STR: { name: 'Stretch', active: true, accent: '#D27E5C', prompt: 'Can they use it somewhere new?' },
    UNT: { name: 'Untangle', active: true, accent: '#DB8F3C', prompt: 'Can they make sense of a messy problem?' },
    PIV: { name: 'Pivot', active: true, accent: '#8DBA6B', prompt: "Can they change approach when it isn't working?" },
  },
  k: {
    RDY: { name: 'Ready', active: true, accent: '#3E8A5C' },
    AST: { name: 'Assist', active: true, accent: '#D69A2D' },
    PAS: { name: 'Pass', active: true, accent: '#6E7A72' },
  },
  r: {
    R: { name: 'Rules', active: true },
  },
};

const KIND_LABEL = { s: 'Subject', d: 'Level', p: 'Skill', k: 'Call chip', r: 'Rules' };
const SETS = [1, 2, 3];

const TAP_RE = /^\/([sdpk])\/([A-Za-z]+)(?:\/([^/]*))?\/?$/;
const RULES_RE = /^\/r(?:\/([^/]*))?\/?$/;

function parseSet(raw) {
  if (raw === undefined || raw === '') return { set: null, setRaw: null };
  return /^[1-3]$/.test(raw) ? { set: Number(raw), setRaw: raw } : { set: null, setRaw: raw };
}

// Returns null when the path is not a tap route at all.
// Returns { kind, code, card: null } for a tap route with an unknown code (e.g. /p/XYZ/1).
function parseTapPath(pathname) {
  let m = RULES_RE.exec(pathname);
  if (m) return { kind: 'r', code: 'R', card: CARDS.r.R, ...parseSet(m[1]) };
  m = TAP_RE.exec(pathname);
  if (!m) return null;
  const kind = m[1];
  const code = m[2].toUpperCase();
  return { kind, code, card: CARDS[kind][code] || null, ...parseSet(m[3]) };
}

function tapPath(kind, code, set) {
  const base = kind === 'r' ? '/r' : `/${kind}/${code}`;
  return set ? `${base}/${set}` : base;
}

// All 39 tag/QR rows in the same order as the print kit. The third subject slot (History in print
// kit v2) is Civics at this booth, so that card needs reprinting as Civics.
function codeMap(baseUrl) {
  const order = [
    ['s', 'SCI'], ['s', 'ENG'], ['s', 'CIV'],
    ['d', 'EASY'], ['d', 'TOUGH'],
    ['p', 'DEP'], ['p', 'STR'], ['p', 'UNT'], ['p', 'PIV'],
    ['k', 'RDY'], ['k', 'AST'], ['k', 'PAS'],
    ['r', 'R'],
  ];
  const rows = [];
  for (const set of SETS) {
    for (const [kind, code] of order) {
      const card = CARDS[kind][code];
      rows.push({
        set,
        item: card.name,
        type: KIND_LABEL[kind],
        code,
        kind,
        active: card.active,
        url: baseUrl + tapPath(kind, code, set),
      });
    }
  }
  return rows;
}

module.exports = { CARDS, KIND_LABEL, SETS, parseTapPath, tapPath, codeMap };
