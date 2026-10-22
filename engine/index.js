// The question engine. The cards only choose subject + skill; the engine writes the question.
// v1 serves the hand-checked bank. To plug in another engine (LLM, existing Drona service),
// keep this signature and fall back to the bank on failure.

const BANK = require('./bank');

const DEPTH_LEVELS = ['Recall', 'Explain', 'Apply', 'Analyse', 'Evaluate', 'Create'];
const MAX_LEVEL = DEPTH_LEVELS.length;

function levelName(level) {
  return DEPTH_LEVELS[level - 1] || '';
}

function hasQuestions(subject, skill) {
  return BANK.some((q) => q.subject === subject && q.skill === skill);
}

function generateQuestion({ subject, skill, level, seenIds = [] }, random = Math.random) {
  const pool = BANK.filter((q) => q.subject === subject && q.skill === skill && q.level === level);
  if (!pool.length) throw new Error(`No questions for ${subject}/${skill}/L${level}`);
  const unseen = pool.filter((q) => !seenIds.includes(q.id));
  // Once a level is exhausted, recycle it but never repeat the question just shown.
  const last = seenIds[seenIds.length - 1];
  const from = unseen.length ? unseen : pool.length > 1 ? pool.filter((q) => q.id !== last) : pool;
  return from[Math.floor(random() * from.length)];
}

module.exports = { generateQuestion, hasQuestions, levelName, MAX_LEVEL, DEPTH_LEVELS };
