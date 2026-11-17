const test = require('node:test');
const assert = require('node:assert/strict');
const { buildInsights, insightsEmail } = require('../server/insights');
const views = require('../server/views');

// Minimal stored report: q = [call, correct, level].
function report({ difficulty = 'EASY', skill = 'DEP', estimate = 2, q }) {
  const questions = q.map(([call, correct, level], i) => ({
    n: i + 1, level, levelName: `L${level}`, call, correct, choice: call === 'PAS' ? null : 0, answer: 0,
    stem: 'Stem', options: ['a', 'b', 'c', 'd'], explanation: 'Because.', message: 'm', context: null, competency: null,
  }));
  const correct = questions.filter((x) => x.correct).length;
  return {
    id: 'abc123', createdAt: '2026-11-17T06:00:00.000Z',
    subject: { code: 'SCI', name: 'Science' }, skill: { code: skill, name: 'Depth', prompt: 'p' },
    difficulty: { code: difficulty, name: difficulty === 'EASY' ? 'Easy' : 'Tough' },
    total: 3, correct, estimate, calibration: estimate === correct ? 'matched' : estimate > correct ? 'over' : 'under',
    points: questions.reduce((a, x) => a + (x.correct ? (x.call === 'RDY' ? 2 : 1) : 0), 0),
    calls: { RDY: 0, AST: 0, PAS: 0 }, questions,
    class: { size: 40, sample: true, scoreDist: [1, 2, 3, 4], lower: 1, same: 1, higher: 1, avgCorrect: 2, calibration: { matched: 1, over: 1, under: 1 }, callMix: { class: { RDY: 50, AST: 30, PAS: 20 }, you: { RDY: 100, AST: 0, PAS: 0 } } },
  };
}

test('a perfect Easy hand hits the Easy ceiling and is told to try Tough', () => {
  const ins = buildInsights(report({ estimate: 3, q: [['RDY', true, 2], ['RDY', true, 3], ['RDY', true, 1]] }));
  assert.equal(ins.depth.score, 33);
  assert.equal(ins.depth.label, 'Strong');
  assert.equal(ins.decision.score, 100);
  assert.equal(ins.depth.secured, 3);
  assert.ok(ins.next.some((t) => t.includes('Tough card')));
  assert.ok(ins.strengths.length >= 1 && ins.strengths.length <= 3);
});

test('a level answered right is never also called not secure', () => {
  const ins = buildInsights(report({ difficulty: 'TOUGH', q: [['RDY', false, 5], ['AST', false, 4], ['AST', true, 4]] }));
  assert.equal(ins.depth.secured, 4);
  assert.ok(!ins.depth.text.some((t) => t.startsWith('Not yet secure: L4')));
  assert.ok(ins.depth.text.some((t) => t.startsWith('Not yet secure: L5')));
});

test('decision kinds follow the call + outcome rules', () => {
  const ins = buildInsights(report({ q: [['RDY', false, 2], ['AST', true, 1], ['PAS', false, 2]] }));
  assert.deepEqual(ins.decision.decisions.map((d) => d.kind), ['bad', 'good', 'partial']);
  assert.deepEqual(ins.decision.mix, { good: 1, partial: 1, bad: 1 });
  assert.equal(ins.decision.score, 42);
  assert.ok(ins.focus[0].startsWith('Check before committing'));
});

test('a hand with nothing right still gives every section something to say', () => {
  const ins = buildInsights(report({ estimate: 0, q: [['PAS', false, 2], ['PAS', false, 1], ['RDY', false, 1]] }));
  assert.equal(ins.depth.secured, null);
  assert.equal(ins.depth.label, 'Emerging');
  for (const k of ['strengths', 'focus', 'next']) assert.ok(ins[k].length >= 1, k);
});

test('the email body carries all four sections and the link', () => {
  const r = report({ q: [['RDY', true, 2], ['AST', true, 3], ['RDY', false, 3]] });
  const body = insightsEmail(r, buildInsights(r), 'https://drona.example/report/abc123');
  for (const h of ['AT A GLANCE', 'THINKING DEPTH', 'DECISION-MAKING', 'STRENGTHS', 'FOCUS AREAS', 'NEXT STEPS']) assert.ok(body.includes(h), h);
  assert.ok(body.includes('https://drona.example/report/abc123'));
});

test('the shared report page shows the analytics and an email form', () => {
  const r = report({ q: [['RDY', true, 2], ['AST', true, 3], ['RDY', false, 3]] });
  const html = views.reportPage(r, { url: 'https://drona.example/report/abc123' });
  for (const h of ['At a glance', 'Thinking depth', 'Decision-making', 'Strengths, focus areas and next steps']) assert.ok(html.includes(h), h);
  assert.match(html, /action="\/report\/abc123\/email"/);
});

test('the emailed report has an HTML and a text part with all four sections', () => {
  const r = report({ q: [['RDY', true, 2], ['AST', true, 3], ['RDY', false, 3]] });
  const mail = views.reportEmail(r, 'https://drona.example/report/abc123');
  assert.match(mail.subject, /Drona Quick Hand report/);
  for (const h of ['At a glance', 'Thinking depth', 'Decision-making', 'Strengths, focus areas and next steps']) assert.ok(mail.html.includes(h), h);
  assert.ok(mail.html.includes('https://drona.example/report/abc123'));
  assert.ok(mail.text.includes('NEXT STEPS'));
});
