const test = require('node:test');
const assert = require('node:assert/strict');
const { newSession, applyTap, answer, next } = require('../server/state');
const { parseTapPath } = require('../server/codes');
const engine = require('../engine');

const tap = (path) => parseTapPath(path);
const play = () => newSession('t', 0);
const wrongChoice = (q) => (q.answer + 1) % q.options.length;

function toQuestion(s) {
  applyTap(s, tap('/s/SCI/1'), engine);
  applyTap(s, tap('/p/DEP/1'), engine);
  return s;
}

test('subject then skill produces a question', () => {
  const s = play();
  assert.equal(applyTap(s, tap('/s/SCI/1'), engine), 'selected');
  assert.equal(s.phase, 'HALF');
  assert.equal(applyTap(s, tap('/p/DEP/1'), engine), 'question');
  assert.equal(s.phase, 'QUESTION');
  assert.equal(s.question.level, 1);
});

test('skill then subject works too (either order)', () => {
  const s = play();
  applyTap(s, tap('/p/DEP/2'), engine);
  assert.equal(s.phase, 'HALF');
  applyTap(s, tap('/s/SCI/2'), engine);
  assert.equal(s.phase, 'QUESTION');
});

test('call chip before a question is refused', () => {
  const s = play();
  assert.equal(applyTap(s, tap('/k/RDY/1'), engine), 'call-too-early');
  assert.equal(s.phase, 'IDLE');
  assert.equal(s.notice.tone, 'warn');
});

test('inactive cards leave the game untouched', () => {
  const s = toQuestion(play());
  const qid = s.question.id;
  for (const p of ['/s/ENG/1', '/s/HIS/1', '/p/STR/1', '/p/UNT/1', '/p/PIV/1']) {
    assert.equal(applyTap(s, tap(p), engine), 'inactive', p);
  }
  assert.equal(s.phase, 'QUESTION');
  assert.equal(s.question.id, qid);
});

test('Ready + correct answer levels up and scores 2', () => {
  const s = toQuestion(play());
  assert.equal(applyTap(s, tap('/k/RDY/1'), engine), 'ready');
  assert.equal(answer(s, s.question.answer), 'answer-correct');
  assert.equal(s.phase, 'RESULT');
  assert.equal(s.level, 2);
  assert.equal(s.score, 2);
});

test('Assist + correct answer stays on level and scores 1', () => {
  const s = toQuestion(play());
  s.level = 3;
  applyTap(s, tap('/k/AST/1'), engine);
  assert.equal(s.call, 'AST');
  answer(s, s.question.answer);
  assert.equal(s.level, 3);
  assert.equal(s.score, 1);
});

test('wrong answer drops a level, never below 1', () => {
  const s = toQuestion(play());
  applyTap(s, tap('/k/RDY/1'), engine);
  assert.equal(answer(s, wrongChoice(s.question)), 'answer-wrong');
  assert.equal(s.level, 1);
  s.level = 4;
  next(s, engine);
  applyTap(s, tap('/k/RDY/1'), engine);
  answer(s, wrongChoice(s.question));
  assert.equal(s.level, 3);
  assert.equal(s.score, 0);
});

test('level caps at 6', () => {
  const s = toQuestion(play());
  for (let i = 0; i < 10; i++) {
    applyTap(s, tap('/k/RDY/1'), engine);
    answer(s, s.question.answer);
    next(s, engine);
  }
  assert.equal(s.level, 6);
  assert.equal(s.question.level, 6);
});

test('Pass gives a different question at the same level', () => {
  const s = toQuestion(play());
  const first = s.question.id;
  assert.equal(applyTap(s, tap('/k/PAS/1'), engine), 'pass');
  assert.equal(s.phase, 'QUESTION');
  assert.notEqual(s.question.id, first);
  assert.equal(s.level, 1);
  assert.equal(s.passes, 1);
});

test('Ready can switch to Assist, but not back', () => {
  const s = toQuestion(play());
  applyTap(s, tap('/k/RDY/1'), engine);
  assert.equal(applyTap(s, tap('/k/AST/1'), engine), 'assist');
  assert.equal(s.call, 'AST');
  assert.equal(applyTap(s, tap('/k/RDY/1'), engine), 'call-ignored');
  assert.equal(s.call, 'AST');
});

test('re-tapping the skill card after a result gives a new question', () => {
  const s = toQuestion(play());
  applyTap(s, tap('/k/RDY/1'), engine);
  answer(s, s.question.answer);
  const prev = s.question.id;
  assert.equal(applyTap(s, tap('/p/DEP/1'), engine), 'question');
  assert.equal(s.phase, 'QUESTION');
  assert.notEqual(s.question.id, prev);
});

test('re-tapping the same card mid-question keeps the question', () => {
  const s = toQuestion(play());
  const qid = s.question.id;
  assert.equal(applyTap(s, tap('/p/DEP/1'), engine), 'already-selected');
  assert.equal(s.question.id, qid);
});

test('Rules card resets the game', () => {
  const s = toQuestion(play());
  applyTap(s, tap('/k/RDY/1'), engine);
  answer(s, s.question.answer);
  assert.equal(applyTap(s, tap('/r/1'), engine), 'reset');
  assert.equal(s.phase, 'IDLE');
  assert.equal(s.subject, null);
  assert.equal(s.score, 0);
  assert.equal(s.level, 1);
});

test('answers outside ANSWERING or out of range are ignored', () => {
  const s = toQuestion(play());
  assert.equal(answer(s, 0), 'answer-ignored');
  applyTap(s, tap('/k/RDY/1'), engine);
  assert.equal(answer(s, 9), 'answer-invalid');
  assert.equal(s.phase, 'ANSWERING');
});

test('question bank covers every Depth level with valid answers', () => {
  const bank = require('../engine/bank');
  for (let level = 1; level <= engine.MAX_LEVEL; level++) {
    const qs = bank.filter((q) => q.subject === 'SCI' && q.skill === 'DEP' && q.level === level);
    assert.ok(qs.length >= 2, `level ${level} needs at least 2 questions`);
    for (const q of qs) {
      assert.ok(q.answer >= 0 && q.answer < q.options.length, q.id);
      assert.ok(q.hint && q.explanation, q.id);
    }
  }
  assert.equal(new Set(bank.map((q) => q.id)).size, bank.length, 'ids are unique');
});
