// Game state machine for one device session.
//
//   IDLE --subject|skill (either order)--> HALF --other card--> QUESTION
//   QUESTION --RDY--> ANSWERING --answer--> RESULT
//   QUESTION --AST--> ANSWERING (hint shown) --answer--> RESULT
//   QUESTION --PAS--> QUESTION (new question, same level)
//   RESULT --re-tap or swap a card / Next--> QUESTION
//   any --Rules card--> IDLE (fresh game)
//
// Every function mutates the session and returns an outcome string for the tap log.

const { MAX_LEVEL } = require('../engine');

function freshFields() {
  return {
    phase: 'IDLE',
    subject: null,
    skill: null,
    level: 1,
    question: null,
    call: null,
    result: null,
    seen: [],
    score: 0,
    answered: 0,
    correct: 0,
    passes: 0,
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

function nextQuestion(s, engine) {
  const q = engine.generateQuestion({ subject: s.subject, skill: s.skill, level: s.level, seenIds: s.seen });
  s.seen.push(q.id);
  s.question = q;
  s.call = null;
  s.result = null;
  s.phase = 'QUESTION';
}

function notice(s, tone, text) {
  s.notice = { tone, text };
}

function applyTap(s, tap, engine) {
  const { kind, code, card } = tap;

  if (kind === 'r') {
    resetSession(s);
    notice(s, 'info', 'New game. Tap a subject card and a skill card.');
    return 'reset';
  }

  if (!card.active) {
    notice(s, 'warn', `${card.name} isn’t live at this booth yet. Try the Science and Depth cards.`);
    return 'inactive';
  }

  if (kind === 's' || kind === 'p') return selectCard(s, kind === 's' ? 'subject' : 'skill', code, card, engine);
  return callChip(s, code, card, engine);
}

function selectCard(s, field, code, card, engine) {
  const same = s[field] === code;
  s[field] = code;

  if (!s.subject || !s.skill) {
    s.phase = 'HALF';
    notice(s, 'info', `${card.name} chosen. Now tap a ${field === 'subject' ? 'skill' : 'subject'} card.`);
    return 'selected';
  }

  if ((s.phase === 'QUESTION' || s.phase === 'ANSWERING') && same) {
    notice(s, 'info', `${card.name} is already in play. Answer this question, or tap a call chip.`);
    return 'already-selected';
  }

  const swapped = s.phase === 'QUESTION' || s.phase === 'ANSWERING';
  nextQuestion(s, engine);
  s.notice = swapped ? { tone: 'info', text: `Swapped to ${card.name}. Here’s a new question.` } : null;
  return swapped ? 'swapped' : 'question';
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

  if (s.phase === 'RESULT') {
    notice(s, 'info', 'Tap a subject or skill card again for your next question.');
    return 'call-ignored';
  }

  notice(s, 'warn', `${card.name} is a call chip. Tap a subject card and a skill card first.`);
  return 'call-too-early';
}

function pass(s, engine) {
  s.passes += 1;
  nextQuestion(s, engine);
  notice(s, 'info', 'Passed. Here’s another question at the same level.');
  return 'pass';
}

function answer(s, choice) {
  if (s.phase !== 'ANSWERING') return 'answer-ignored';
  const q = s.question;
  if (!Number.isInteger(choice) || choice < 0 || choice >= q.options.length) return 'answer-invalid';

  const correct = choice === q.answer;
  const levelBefore = s.level;
  if (correct && s.call === 'RDY') s.level = Math.min(MAX_LEVEL, s.level + 1);
  if (!correct) s.level = Math.max(1, s.level - 1);
  const points = correct ? (s.call === 'RDY' ? 2 : 1) : 0;

  s.score += points;
  s.answered += 1;
  if (correct) s.correct += 1;
  s.result = { choice, correct, call: s.call, points, levelBefore, levelAfter: s.level };
  s.phase = 'RESULT';
  s.notice = null;
  return correct ? 'answer-correct' : 'answer-wrong';
}

function next(s, engine) {
  if (s.phase !== 'RESULT') return 'next-ignored';
  nextQuestion(s, engine);
  s.notice = null;
  return 'next';
}

module.exports = { newSession, resetSession, applyTap, answer, next };
