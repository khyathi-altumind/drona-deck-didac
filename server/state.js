// Game state machine for one device session: one "Quick Hand" of three questions.
//
//   IDLE --subject card--> DIFFICULTY --Easy|Tough--> SKILL --skill card--> QUESTION
//   QUESTION --Ready--> ANSWERING --answer--> next QUESTION (3 in total)
//   QUESTION --Assist--> ANSWERING (hint shown) --answer--> next QUESTION
//   QUESTION --Pass--> next QUESTION (the skip counts as one of the three)
//   after the third question --> ESTIMATE --how many correct?--> RESULT --> CLASS --> SHARE
//   any --Rules card--> IDLE (fresh game)
//
// A skill card tapped early is remembered, so the hand starts as soon as the difficulty is picked.
// Results stay hidden until the visitor has estimated their score, so the estimate is honest.
// Every function mutates the session and returns an outcome string for the tap log.

const { BANDS } = require('../engine');

const HAND_SIZE = 3;
const HAND_PHASES = ['QUESTION', 'ANSWERING'];
const DONE_PHASES = ['RESULT', 'CLASS', 'SHARE'];

function freshFields() {
  return {
    phase: 'IDLE',
    subject: null,
    skill: null,
    difficulty: null,
    level: null,
    question: null,
    call: null,
    hand: [], // one entry per question: { question, level, call, choice, correct, points }
    estimate: null,
    reportId: null,
    seen: [],
    notice: null,
    lastTap: null,
  };
}

function newSession(sid, now) {
  return { sid, createdAt: now, updatedAt: now, ...freshFields() };
}

function resetSession(s) {
  Object.assign(s, freshFields());
}

function notice(s, tone, text) {
  s.notice = { tone, text };
}

const questionNumber = (s) => s.hand.length + 1;

function nextQuestion(s, engine) {
  const band = BANDS[s.difficulty];
  const q = engine.generateQuestion({
    subject: s.subject,
    skill: s.skill,
    level: s.level,
    seenIds: s.seen,
    handIds: s.hand.map((h) => h.question.id),
    min: band.min,
    max: band.max,
  });
  s.seen.push(q.id);
  s.question = q;
  s.call = null;
  s.phase = 'QUESTION';
}

function startHand(s, engine) {
  s.hand = [];
  s.estimate = null;
  s.reportId = null;
  s.level = BANDS[s.difficulty].start;
  nextQuestion(s, engine);
}

function applyTap(s, tap, engine) {
  const { kind, code, card } = tap;

  if (kind === 'r') {
    resetSession(s);
    notice(s, 'info', 'New game. Tap a subject card to begin.');
    return 'reset';
  }

  if (!card.active) {
    notice(s, 'warn', `${card.name} isn’t live at this booth yet. Try the Science or History card.`);
    return 'inactive';
  }

  if (kind === 's') return selectSubject(s, code, card);
  if (kind === 'p') return selectSkill(s, code, card, engine);
  return callChip(s, code, card, engine);
}

function selectSubject(s, code, card) {
  if (HAND_PHASES.includes(s.phase)) {
    notice(s, 'info', `Finish this hand first: question ${questionNumber(s)} of ${HAND_SIZE}. The Rules card starts over.`);
    return 'locked';
  }
  if (s.phase === 'ESTIMATE') {
    notice(s, 'info', 'Almost done. How many do you think you got right?');
    return 'locked';
  }
  // After a finished hand, a subject card starts a new game with that subject.
  if (DONE_PHASES.includes(s.phase)) resetSession(s);

  s.subject = code;
  if (s.phase === 'IDLE' || s.phase === 'DIFFICULTY') {
    s.phase = 'DIFFICULTY';
    s.notice = null;
    return 'subject';
  }
  // SKILL phase: switching subject keeps the chosen difficulty.
  notice(s, 'info', `Switched to ${card.name}. Now tap a skill card.`);
  return 'subject';
}

function selectSkill(s, code, card, engine) {
  if (HAND_PHASES.includes(s.phase)) {
    notice(s, 'info', `Finish this hand first: question ${questionNumber(s)} of ${HAND_SIZE}. The Rules card starts over.`);
    return 'locked';
  }
  if (s.phase === 'ESTIMATE') {
    notice(s, 'info', 'Almost done. How many do you think you got right?');
    return 'locked';
  }

  s.skill = code;
  if (s.phase === 'IDLE') {
    notice(s, 'info', `${card.name} saved. Now tap a subject card.`);
    return 'skill-early';
  }
  if (s.phase === 'DIFFICULTY') {
    notice(s, 'info', `${card.name} saved. Now pick Easy or Tough.`);
    return 'skill-early';
  }
  // SKILL phase, or a finished hand: play a new hand with the same subject and difficulty.
  const replay = DONE_PHASES.includes(s.phase);
  startHand(s, engine);
  s.notice = replay ? { tone: 'info', text: `New hand: ${card.name}. Question 1 of ${HAND_SIZE}.` } : null;
  return 'hand-start';
}

function chooseDifficulty(s, difficulty, engine) {
  if (s.phase !== 'DIFFICULTY') return 'difficulty-ignored';
  if (!BANDS[difficulty]) return 'difficulty-invalid';
  s.difficulty = difficulty;
  if (s.skill) {
    startHand(s, engine);
    s.notice = null;
    return 'hand-start';
  }
  s.phase = 'SKILL';
  s.notice = null;
  return 'difficulty';
}

function callChip(s, code, card, engine) {
  if (s.phase === 'QUESTION') {
    if (code === 'PAS') return pass(s, engine);
    s.call = code;
    s.phase = 'ANSWERING';
    s.notice = null;
    return code === 'RDY' ? 'ready' : 'assist';
  }

  if (s.phase === 'ANSWERING') {
    if (code === 'PAS') return pass(s, engine);
    // Asking for help after calling Ready is allowed; going back to Ready after seeing the hint is not.
    if (code === 'AST' && s.call === 'RDY') {
      s.call = 'AST';
      notice(s, 'info', 'Switched to Assist. Here’s a hint.');
      return 'assist';
    }
    notice(s, 'info', `You already called ${s.call === 'RDY' ? 'Ready' : 'Assist'}. Pick an answer below.`);
    return 'call-ignored';
  }

  if (s.phase === 'ESTIMATE') {
    notice(s, 'info', 'Pick a number on the screen: how many do you think you got right?');
    return 'call-ignored';
  }

  if (DONE_PHASES.includes(s.phase)) {
    notice(s, 'info', 'This hand is done. Tap a skill card to play again, or a subject card to start fresh.');
    return 'call-ignored';
  }

  notice(s, 'warn', `${card.name} is a call chip. ${callPrompt(s)}`);
  return 'call-too-early';
}

function callPrompt(s) {
  if (s.phase === 'DIFFICULTY') return 'First pick Easy or Tough.';
  if (s.phase === 'SKILL') return 'First tap a skill card.';
  return 'First tap a subject card.';
}

// Records the question just finished, then serves the next one or moves to the estimate.
function finishQuestion(s, entry, engine) {
  s.hand.push({ question: s.question, level: s.question.level, ...entry });
  s.call = null;
  if (s.hand.length >= HAND_SIZE) {
    s.question = null;
    s.phase = 'ESTIMATE';
    return;
  }
  nextQuestion(s, engine);
}

function pass(s, engine) {
  finishQuestion(s, { call: 'PAS', choice: null, correct: false, points: 0 }, engine);
  notice(s, 'info', s.phase === 'ESTIMATE'
    ? 'Skipped on purpose. That’s a decision, and it’s logged.'
    : `Skipped on purpose. That’s a decision, and it’s logged. Question ${questionNumber(s)} of ${HAND_SIZE}.`);
  return 'pass';
}

// Ready + correct moves up a level, a wrong answer moves down, Assist + correct holds (spec 7.1),
// always inside the band for the chosen difficulty.
function answer(s, choice, engine) {
  if (s.phase !== 'ANSWERING') return 'answer-ignored';
  const q = s.question;
  if (!Number.isInteger(choice) || choice < 0 || choice >= q.options.length) return 'answer-invalid';

  const correct = choice === q.answer;
  const band = BANDS[s.difficulty];
  const call = s.call;
  const points = correct ? (call === 'RDY' ? 2 : 1) : 0;
  if (correct && call === 'RDY') s.level = Math.min(band.max, s.level + 1);
  if (!correct) s.level = Math.max(band.min, s.level - 1);
  finishQuestion(s, { call, choice, correct, points }, engine);

  s.notice = s.phase === 'ESTIMATE' ? null : { tone: 'info', text: `Answer locked in. Question ${questionNumber(s)} of ${HAND_SIZE}.` };
  return correct ? 'answer-correct' : 'answer-wrong';
}

function estimate(s, n) {
  if (s.phase !== 'ESTIMATE') return 'estimate-ignored';
  if (!Number.isInteger(n) || n < 0 || n > HAND_SIZE) return 'estimate-invalid';
  s.estimate = n;
  s.phase = 'RESULT';
  s.notice = null;
  return 'estimate';
}

// Moves between the three end screens once the hand is finished.
function goTo(s, phase) {
  if (!DONE_PHASES.includes(s.phase) || !DONE_PHASES.includes(phase)) return 'goto-ignored';
  s.phase = phase;
  s.notice = null;
  return `goto-${phase.toLowerCase()}`;
}

module.exports = { newSession, resetSession, applyTap, chooseDifficulty, answer, estimate, goTo, HAND_SIZE };
