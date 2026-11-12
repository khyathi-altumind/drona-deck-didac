const test = require('node:test');
const assert = require('node:assert/strict');
const { newSession, applyTap, answer, estimate, goTo, HAND_SIZE } = require('../server/state');
const { parseTapPath } = require('../server/codes');
const { buildReport, compareWithClass, sampleClass } = require('../server/report');
const engine = require('../engine');

const tap = (path) => parseTapPath(path);
const play = () => newSession('t', 0);
const wrongChoice = (q) => (q.answer + 1) % q.options.length;

// Subject → level card → skill, ready for question 1.
function toQuestion(s, { subject = 'SCI', skill = 'DEP', level = 'EASY' } = {}) {
  applyTap(s, tap(`/s/${subject}/1`), engine);
  applyTap(s, tap(`/d/${level}/1`), engine);
  applyTap(s, tap(`/p/${skill}/1`), engine);
  return s;
}

// Plays a full hand. `plan` is one entry per question: 'right', 'wrong', 'assist-right' or 'pass'.
function playHand(s, plan) {
  for (const step of plan) {
    if (step === 'pass') { applyTap(s, tap('/k/PAS/1'), engine); continue; }
    applyTap(s, tap(step.startsWith('assist') ? '/k/AST/1' : '/k/RDY/1'), engine);
    answer(s, step.endsWith('right') ? s.question.answer : wrongChoice(s.question), engine);
  }
  return s;
}

test('flow follows the booth order: subject → Easy/Tough card → skill → question', () => {
  const s = play();
  assert.equal(applyTap(s, tap('/s/HIS/1'), engine), 'subject');
  assert.equal(s.phase, 'DIFFICULTY');
  assert.equal(applyTap(s, tap('/d/TOUGH/1'), engine), 'difficulty');
  assert.equal(s.phase, 'SKILL');
  assert.equal(applyTap(s, tap('/p/UNT/1'), engine), 'hand-start');
  assert.equal(s.phase, 'QUESTION');
  assert.equal(s.question.subject, 'HIS');
  assert.equal(s.question.skill, 'UNT');
  assert.equal(s.question.level, 5, 'Tough starts in the middle of levels 4-6');
});

test('Easy starts at level 2', () => {
  const s = toQuestion(play());
  assert.equal(s.question.level, 2);
});

test('a skill card tapped early is remembered and the hand starts once the level is picked', () => {
  const s = play();
  assert.equal(applyTap(s, tap('/p/STR/1'), engine), 'skill-early');
  assert.equal(s.phase, 'IDLE');
  applyTap(s, tap('/s/SCI/1'), engine);
  assert.equal(s.phase, 'DIFFICULTY');
  assert.equal(applyTap(s, tap('/d/EASY/1'), engine), 'hand-start');
  assert.equal(s.phase, 'QUESTION');
  assert.equal(s.question.skill, 'STR');
});

test('level cards: refused before a subject, can be switched before the skill, locked during a hand', () => {
  const s = play();
  assert.equal(applyTap(s, tap('/d/EASY/1'), engine), 'difficulty-too-early');
  assert.equal(s.phase, 'IDLE');
  assert.match(s.notice.text, /subject card/);
  assert.equal(parseTapPath('/d/MEDIUM/1').card, null, 'only Easy and Tough exist');

  applyTap(s, tap('/s/SCI/1'), engine);
  applyTap(s, tap('/d/EASY/1'), engine);
  assert.equal(applyTap(s, tap('/d/TOUGH/1'), engine), 'difficulty');
  assert.equal(s.phase, 'SKILL');
  assert.equal(s.difficulty, 'TOUGH');

  applyTap(s, tap('/p/DEP/1'), engine);
  assert.equal(applyTap(s, tap('/d/EASY/1'), engine), 'locked');
  assert.equal(s.difficulty, 'TOUGH');
  assert.equal(s.question.level, 5);
});

test('after a hand, a level card changes the level and waits for a skill card', () => {
  const s = toQuestion(play(), { level: 'EASY' });
  playHand(s, ['right', 'right', 'right']);
  estimate(s, 3);
  assert.equal(applyTap(s, tap('/d/TOUGH/1'), engine), 'difficulty');
  assert.equal(s.phase, 'SKILL');
  assert.equal(applyTap(s, tap('/p/PIV/1'), engine), 'hand-start');
  assert.equal(s.question.level, 5);
  assert.equal(s.subject, 'SCI');
});

test('call chips before a question are refused with a helpful prompt', () => {
  const s = play();
  assert.equal(applyTap(s, tap('/k/RDY/1'), engine), 'call-too-early');
  assert.match(s.notice.text, /subject card/);
  applyTap(s, tap('/s/SCI/1'), engine);
  assert.equal(applyTap(s, tap('/k/AST/1'), engine), 'call-too-early');
  assert.match(s.notice.text, /Easy or Tough/);
});

test('English stays off and leaves the game untouched', () => {
  const s = toQuestion(play());
  const qid = s.question.id;
  assert.equal(applyTap(s, tap('/s/ENG/1'), engine), 'inactive');
  assert.equal(s.question.id, qid);
  assert.equal(s.phase, 'QUESTION');
});

test('subject and skill cards are locked during a hand', () => {
  const s = toQuestion(play());
  const qid = s.question.id;
  assert.equal(applyTap(s, tap('/s/HIS/1'), engine), 'locked');
  assert.equal(applyTap(s, tap('/p/PIV/1'), engine), 'locked');
  assert.equal(s.question.id, qid);
  assert.equal(s.subject, 'SCI');
});

test('a hand is exactly three questions, then the estimate screen', () => {
  const s = toQuestion(play());
  playHand(s, ['right', 'wrong']);
  assert.equal(s.phase, 'QUESTION');
  assert.equal(s.hand.length, 2);
  playHand(s, ['assist-right']);
  assert.equal(s.hand.length, HAND_SIZE);
  assert.equal(s.phase, 'ESTIMATE');
  assert.equal(s.question, null, 'no question is on screen while estimating');
});

test('a pass counts as one of the three questions', () => {
  const s = toQuestion(play());
  assert.equal(applyTap(s, tap('/k/PAS/1'), engine), 'pass');
  assert.equal(s.hand.length, 1);
  assert.deepEqual(s.hand[0].call, 'PAS');
  assert.equal(s.hand[0].correct, false);
  playHand(s, ['pass', 'pass']);
  assert.equal(s.phase, 'ESTIMATE');
});

test('no question repeats within a hand', () => {
  for (let i = 0; i < 30; i++) {
    const s = toQuestion(play(), { subject: i % 2 ? 'HIS' : 'SCI', skill: ['DEP', 'STR', 'UNT', 'PIV'][i % 4], level: i % 3 ? 'EASY' : 'TOUGH' });
    playHand(s, ['assist-right', 'assist-right', 'assist-right']);
    const ids = s.hand.map((h) => h.question.id);
    assert.equal(new Set(ids).size, HAND_SIZE, ids.join(','));
  }
});

test('levels move inside the band: Ready+right up, wrong down, Assist holds', () => {
  const s = toQuestion(play(), { level: 'EASY' });
  playHand(s, ['right']);
  assert.equal(s.level, 3);
  playHand(s, ['right']);
  assert.equal(s.level, 3, 'Easy never goes above level 3');

  const t = toQuestion(play(), { level: 'TOUGH' });
  playHand(t, ['wrong']);
  assert.equal(t.level, 4);
  playHand(t, ['wrong']);
  assert.equal(t.level, 4, 'Tough never goes below level 4');

  const u = toQuestion(play());
  playHand(u, ['assist-right']);
  assert.equal(u.level, 2);
});

test('Ready can switch to Assist, but not back', () => {
  const s = toQuestion(play());
  applyTap(s, tap('/k/RDY/1'), engine);
  assert.equal(applyTap(s, tap('/k/AST/1'), engine), 'assist');
  assert.equal(applyTap(s, tap('/k/RDY/1'), engine), 'call-ignored');
  assert.equal(s.call, 'AST');
});

test('estimate accepts 0-3 only, then shows the result', () => {
  const s = toQuestion(play());
  assert.equal(estimate(s, 2), 'estimate-ignored');
  playHand(s, ['right', 'right', 'wrong']);
  assert.equal(estimate(s, 4), 'estimate-invalid');
  assert.equal(estimate(s, -1), 'estimate-invalid');
  assert.equal(estimate(s, 3), 'estimate');
  assert.equal(s.phase, 'RESULT');
  assert.equal(s.estimate, 3);
});

test('end screens: result → class → share, only after the hand', () => {
  const s = toQuestion(play());
  assert.equal(goTo(s, 'CLASS'), 'goto-ignored');
  playHand(s, ['right', 'right', 'right']);
  estimate(s, 3);
  assert.equal(goTo(s, 'CLASS'), 'goto-class');
  assert.equal(goTo(s, 'SHARE'), 'goto-share');
  assert.equal(goTo(s, 'RESULT'), 'goto-result');
  assert.equal(goTo(s, 'QUESTION'), 'goto-ignored');
});

test('after a hand, a skill card plays again and a subject card starts fresh', () => {
  const s = toQuestion(play(), { subject: 'HIS', level: 'TOUGH' });
  playHand(s, ['right', 'right', 'right']);
  estimate(s, 2);
  assert.equal(applyTap(s, tap('/p/STR/1'), engine), 'hand-start');
  assert.equal(s.phase, 'QUESTION');
  assert.equal(s.subject, 'HIS');
  assert.equal(s.difficulty, 'TOUGH');
  assert.equal(s.hand.length, 0);

  playHand(s, ['pass', 'pass', 'pass']);
  estimate(s, 0);
  assert.equal(applyTap(s, tap('/s/SCI/1'), engine), 'subject');
  assert.equal(s.phase, 'DIFFICULTY');
  assert.equal(s.skill, null);
  assert.equal(s.difficulty, null);
});

test('Rules card resets the game', () => {
  const s = toQuestion(play());
  playHand(s, ['right']);
  assert.equal(applyTap(s, tap('/r/1'), engine), 'reset');
  assert.equal(s.phase, 'IDLE');
  assert.equal(s.subject, null);
  assert.equal(s.hand.length, 0);
});

test('answers outside ANSWERING or out of range are ignored', () => {
  const s = toQuestion(play());
  assert.equal(answer(s, 0, engine), 'answer-ignored');
  applyTap(s, tap('/k/RDY/1'), engine);
  assert.equal(answer(s, 9, engine), 'answer-invalid');
  assert.equal(s.phase, 'ANSWERING');
});

test('report: score, calibration, call messages and class comparison', () => {
  const s = toQuestion(play(), { subject: 'HIS', skill: 'PIV' });
  playHand(s, ['right', 'assist-right', 'pass']);
  estimate(s, 3);
  const r = buildReport(s);
  assert.equal(r.correct, 2);
  assert.equal(r.points, 3);
  assert.equal(r.calibration, 'over');
  assert.deepEqual(r.calls, { RDY: 1, AST: 1, PAS: 1 });
  assert.equal(r.subject.name, 'History');
  assert.equal(r.skill.name, 'Pivot');
  assert.equal(r.difficulty.name, 'Easy');
  assert.match(r.questions[0].message, /Right call/);
  assert.match(r.questions[1].message, /Smart use of help/);
  assert.match(r.questions[2].message, /deliberate skip/);
  assert.equal(r.class.size, 40);
  assert.equal(r.class.lower + r.class.same + r.class.higher, 40);
  assert.equal(r.class.scoreDist.reduce((a, b) => a + b, 0), 40);
});

test('the sample class is the same for every visitor, and Tough scores lower than Easy', () => {
  assert.deepEqual(sampleClass('SCI', 'EASY'), sampleClass('SCI', 'EASY'));
  const avg = (d) => compareWithClass({ subject: 'SCI', difficulty: d, correct: 1, calls: { RDY: 3, AST: 0, PAS: 0 }, total: 3 }).avgCorrect;
  assert.ok(avg('TOUGH') < avg('EASY'), `${avg('TOUGH')} < ${avg('EASY')}`);
});

test('options are shuffled but the answer always points at the right option', () => {
  const bank = require('../engine/bank');
  const original = bank.find((q) => q.id === 'HIS-DEP-1a');
  const positions = new Set();
  for (let i = 0; i < 40; i++) {
    const q = engine.generateQuestion({ subject: 'HIS', skill: 'DEP', level: 1, seenIds: ['HIS-DEP-1b'] });
    assert.equal(q.id, 'HIS-DEP-1a');
    assert.equal(q.options[q.answer], original.options[original.answer]);
    assert.deepEqual([...q.options].sort(), [...original.options].sort());
    positions.add(q.answer);
  }
  assert.ok(positions.size > 1, 'the right answer moves around');
});

test('question bank: Science and History cover every skill and level with valid items', () => {
  const bank = require('../engine/bank');
  for (const subject of ['SCI', 'HIS']) {
    for (const skill of ['DEP', 'STR', 'UNT', 'PIV']) {
      for (let level = 1; level <= engine.MAX_LEVEL; level++) {
        const qs = bank.filter((q) => q.subject === subject && q.skill === skill && q.level === level);
        assert.ok(qs.length >= 2, `${subject}/${skill}/L${level} needs at least 2 questions`);
        for (const q of qs) {
          assert.ok(q.options.length >= 2 && q.options.length <= 4, q.id);
          assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, q.id);
          assert.ok(q.stem && q.hint && q.explanation, q.id);
          assert.equal(new Set(q.options).size, q.options.length, `${q.id} has duplicate options`);
        }
      }
    }
  }
  assert.equal(new Set(bank.map((q) => q.id)).size, bank.length, 'ids are unique');
});

test('History practice sources are always labelled as written for this activity', () => {
  const bank = require('../engine/bank');
  for (const q of bank.filter((x) => x.subject === 'HIS')) {
    const text = `${q.context || ''} ${q.stem}`;
    if (/[“"]/.test(q.context || '') && /letter|source|diary|memoir/i.test(text)) {
      assert.match(text, /written for this activity/, q.id);
    }
  }
});
