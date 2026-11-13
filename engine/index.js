// The question engine. The cards only choose subject + skill; the engine picks the question.
// v1 serves the hand-checked bank. To plug in another engine (LLM, existing Drona service),
// keep this signature and fall back to the bank on failure.

const BANK = require('./bank');

// Six levels per skill (spec v2, section 7), so "level 3" means the same step on every card.
const SKILL_LEVELS = {
  DEP: ['Remember', 'Understand', 'Apply', 'Analyse', 'Evaluate', 'Create'],
  STR: ['Near', 'Near, modified', 'Adjacent', 'Cross-context', 'Cross-domain', 'Far'],
  UNT: ['Structured', 'Select the facts', 'Diagnose', 'Define', 'Reframe', 'Problem finding'],
  PIV: ['Select', 'Compare', 'Respond to evidence', 'Revise', 'Trade-off', 'Adapt to change'],
};
const MAX_LEVEL = 6;

// Easy plays levels 1-3, Tough plays levels 4-6. A hand starts in the middle of its band.
const BANDS = {
  EASY: { name: 'Easy', min: 1, max: 3, start: 2 },
  TOUGH: { name: 'Tough', min: 4, max: 6, start: 5 },
};

// Subjects with a fixed ladder instead of the adaptive one. Civics has exactly one question per level,
// so moving up and down would repeat questions. Instead every hand serves its band in order:
// Easy = questions 1 → 2 → 3, Tough = questions 4 → 5 → 6.
const SUBJECT_PLANS = {
  CIV: { EASY: [1, 2, 3], TOUGH: [4, 5, 6] },
};
const planFor = (subject, difficulty) => (SUBJECT_PLANS[subject] || {})[difficulty] || null;

function levelName(skill, level) {
  return (SKILL_LEVELS[skill] || [])[level - 1] || '';
}

function hasQuestions(subject, skill) {
  return BANK.some((q) => q.subject === subject && q.skill === skill);
}

// Picks a question at `level`, avoiding repeats: first anything unseen this session, then anything
// unseen this hand, then the neighbouring level inside the band, and only then a recycled question.
function generateQuestion({ subject, skill, level, seenIds = [], handIds = [], min = 1, max = MAX_LEVEL }, random = Math.random) {
  const at = (l) => BANK.filter((q) => q.subject === subject && q.skill === skill && q.level === l);
  const pool = at(level);
  if (!pool.length) throw new Error(`No questions for ${subject}/${skill}/L${level}`);
  // Nearest other level in the band that still has a question unused this hand. With one question per
  // level (the Forces pool), this keeps a 3-question hand inside a 3-level band free of repeats.
  let nearest = [];
  for (let d = 1; d <= max - min && !nearest.length; d++) {
    nearest = [level - d, level + d].filter((l) => l >= min && l <= max).flatMap(at).filter((q) => !handIds.includes(q.id));
  }
  const last = handIds[handIds.length - 1] || seenIds[seenIds.length - 1];
  const tiers = [
    pool.filter((q) => !seenIds.includes(q.id)),
    pool.filter((q) => !handIds.includes(q.id)),
    nearest,
    pool.length > 1 ? pool.filter((q) => q.id !== last) : pool,
  ];
  const from = tiers.find((t) => t.length);
  return shuffleOptions(from[Math.floor(random() * from.length)], random);
}

// Serves a copy with the options in a fresh order, so the right answer is not always in the same place.
function shuffleOptions(q, random) {
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}

module.exports = { generateQuestion, hasQuestions, levelName, MAX_LEVEL, SKILL_LEVELS, BANDS, SUBJECT_PLANS, planFor };
