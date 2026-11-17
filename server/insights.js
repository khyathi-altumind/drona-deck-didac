// Rule-based analytics for one Quick Hand: At a glance, Thinking depth, Decision-making, and
// Strengths / focus areas / next steps. Same sections as the CBSE Science student report, but every
// number and every sentence here comes from fixed rules: no AI, no network call.
//
// Works on a stored report (server/report.js), so reports saved before this module existed get the
// same analytics when they are opened.

const { SKILL_LEVELS, MAX_LEVEL, BANDS } = require('../engine');
const { CARDS } = require('./codes');

const CALL = { RDY: 'Ready', AST: 'Assist', PAS: 'Pass' };

// [min score, label, tone]. Tone drives the colour: good / mid / low.
// A hand never repeats a level, so a perfect Easy hand (L1+L2+L3) scores 33 and a perfect Tough hand
// (L4+L5+L6) scores 83. The depth bands are set against those ceilings.
const DEPTH_BANDS = [[60, 'Advanced', 'good'], [30, 'Strong', 'good'], [15, 'Developing', 'mid'], [0, 'Emerging', 'low']];
const DECISION_BANDS = [[75, 'Strong', 'good'], [50, 'Sound', 'mid'], [25, 'Mixed', 'mid'], [0, 'Needs a rethink', 'low']];

function bandOf(bands, v) {
  const [, label, tone] = bands.find(([min]) => v >= min);
  return { label, tone };
}

// Every call + outcome is one decision. Pass is never "correct", so PAS-1 cannot happen.
const DECISION = {
  'RDY-1': { kind: 'good', score: 100, label: 'Confident and right' },
  'AST-1': { kind: 'good', score: 75, label: 'Smart use of help' },
  'PAS-0': { kind: 'partial', score: 50, label: 'Deliberate skip' },
  'AST-0': { kind: 'partial', score: 25, label: 'Help did not close the gap' },
  'RDY-0': { kind: 'bad', score: 0, label: 'Confident but off' },
};
const decisionOf = (q) => DECISION[`${q.call}-${q.correct ? 1 : 0}`];

// A correct answer earns its level's share of the six-level ladder; a hint takes a quarter off.
const depthOf = (q) => (q.correct ? (q.level / MAX_LEVEL) * 100 * (q.call === 'AST' ? 0.75 : 1) : 0);

const NEXT_SKILL = { DEP: 'STR', STR: 'UNT', UNT: 'PIV', PIV: 'DEP' };

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const qList = (qs) => qs.map((q) => `Q${q.n}`).join(', ').replace(/, ([^,]*)$/, ' and $1');
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function buildInsights(r) {
  const skill = r.skill.code;
  const levels = SKILL_LEVELS[skill] || [];
  const lname = (l) => levels[l - 1] || '';
  const band = BANDS[r.difficulty.code] || { min: 1, max: MAX_LEVEL };
  const qs = r.questions;
  const total = r.total;

  const right = qs.filter((q) => q.correct);
  const readyRight = qs.filter((q) => q.call === 'RDY' && q.correct);
  const readyWrong = qs.filter((q) => q.call === 'RDY' && !q.correct);
  const assistRight = qs.filter((q) => q.call === 'AST' && q.correct);
  const assistWrong = qs.filter((q) => q.call === 'AST' && !q.correct);
  const passed = qs.filter((q) => q.call === 'PAS');
  const missed = qs.filter((q) => !q.correct && q.call !== 'PAS');

  // ---------- Thinking depth ----------
  const depthScore = Math.round(mean(qs.map(depthOf)));
  const secured = right.length ? Math.max(...right.map((q) => q.level)) : null;
  const securedAlone = readyRight.length ? Math.max(...readyRight.map((q) => q.level)) : null;
  const ladder = levels.map((name, i) => {
    const level = i + 1;
    return {
      level,
      name,
      inBand: level >= band.min && level <= band.max,
      questions: qs.filter((q) => q.level === level).map((q) => ({ n: q.n, call: q.call, correct: q.correct })),
    };
  });

  const depthText = [];
  if (secured === null) {
    depthText.push(`No question was answered correctly in this hand, so it does not show a secure level yet. The place to start is L${band.min} · ${lname(band.min)}.`);
  } else {
    depthText.push(`Highest level secured: L${secured} · ${lname(secured)}${securedAlone === secured ? ', answered without a hint' : ', with a hint'}.`);
    if (secured === band.max && r.difficulty.code === 'EASY') {
      depthText.push(`That is the top of the Easy band (L1–L3). The Tough card (L4–L6) shows how much further the thinking goes.`);
    } else if (secured === MAX_LEVEL) {
      depthText.push('That is the top of the ladder.');
    }
  }
  // Lowest level missed that was not also answered right somewhere else in the hand.
  const unsecured = missed.filter((q) => !right.some((x) => x.level === q.level));
  const missedLow = unsecured.length ? unsecured.reduce((a, q) => (q.level < a.level ? q : a)) : null;
  if (missedLow) depthText.push(`Not yet secure: L${missedLow.level} · ${lname(missedLow.level)} (Q${missedLow.n}).`);
  if (r.difficulty.code === 'EASY' && secured !== null) {
    depthText.push('Easy questions stay at L1–L3, so this score tops out at 33 on the Easy card.');
  }

  // ---------- Decision-making ----------
  const decisions = qs.map((q) => ({ n: q.n, call: q.call, correct: q.correct, ...decisionOf(q) }));
  const decisionScore = Math.round(mean(decisions.map((d) => d.score)));
  const mix = { good: 0, partial: 0, bad: 0 };
  for (const d of decisions) mix[d.kind] += 1;

  const decisionText = [];
  if (readyRight.length === total) decisionText.push('Every call was Ready and every answer was right: confidence fully backed by results.');
  else if (readyRight.length) decisionText.push(`Ready and right on ${qList(readyRight)}: the confidence was earned.`);
  if (readyWrong.length) decisionText.push(`Confident but off on ${qList(readyWrong)}. These are the answers to check before tapping Ready.`);
  if (assistRight.length) decisionText.push(`Good judgement on ${qList(assistRight)}: asked for a hint, and it worked.`);
  if (assistWrong.length) decisionText.push(`On ${qList(assistWrong)} the hint was not enough, which points to an idea that needs revisiting, not just a slip.`);
  if (passed.length) decisionText.push(`${qList(passed)} ${passed.length === 1 ? 'was' : 'were'} passed. A skip is a fair decision; Assist would have given a hint and a chance at a point.`);

  // ---------- Knowing what you know ----------
  const gap = r.estimate - r.correct;
  const calibration = {
    gap,
    kind: r.calibration,
    label: gap === 0 ? 'Spot on' : gap > 0 ? `${gap} over` : `${-gap} under`,
    tone: gap === 0 ? 'good' : Math.abs(gap) === 1 ? 'mid' : 'low',
    text: gap === 0 ? `You guessed ${r.estimate} and got ${r.correct}: an exact read of your own work.`
      : gap > 0 ? `You guessed ${r.estimate} but got ${r.correct}: more sure than your results.`
      : `You guessed ${r.estimate} but got ${r.correct}: better than you expected.`,
  };

  // ---------- Strengths, focus areas, next steps ----------
  const strengths = [];
  if (right.length === total) strengths.push(`All ${total} right in ${r.skill.name} at the ${r.difficulty.name} level.`);
  if (securedAlone !== null) strengths.push(`Answered an L${securedAlone} · ${lname(securedAlone)} question correctly without a hint.`);
  if (gap === 0) strengths.push('You knew exactly how well you had done: guess and score matched.');
  if (gap < 0) strengths.push('You did better than you thought: your thinking is ahead of your confidence.');
  if (assistRight.length) strengths.push(`Used a hint well (${qList(assistRight)}), turning help into a right answer.`);
  if (readyWrong.length === 0 && readyRight.length > 0 && right.length < total) strengths.push('Never confidently wrong: every Ready call was right.');
  if (!strengths.length) strengths.push('Finished the full hand and made a deliberate call on every question.');

  const focus = [];
  if (readyWrong.length) focus.push(`Check before committing: ${plural(readyWrong.length, 'Ready answer')} ${readyWrong.length === 1 ? 'was' : 'were'} wrong (${qList(readyWrong)}).`);
  if (gap > 0) focus.push(`Confidence ran ahead of results: guessed ${r.estimate}, got ${r.correct}.`);
  for (const q of assistWrong) focus.push(`L${q.level} · ${lname(q.level)}${q.competency ? ` (${q.competency})` : ''}: the hint did not close the gap on Q${q.n}.`);
  if (passed.length >= 2) focus.push(`Passed ${passed.length} of ${total} questions. Try at least one with Assist next time.`);
  if (missedLow && !assistWrong.includes(missedLow)) focus.push(`L${missedLow.level} · ${lname(missedLow.level)}${missedLow.competency ? ` (${missedLow.competency})` : ''} is not secure yet.`);
  if (!focus.length) {
    focus.push(r.difficulty.code === 'EASY'
      ? 'Nothing to fix at this level. The next test is harder questions.'
      : `Keep this up across the other skills, not just ${r.skill.name}.`);
  }

  const next = [];
  if (r.difficulty.code === 'EASY' && right.length >= 2) next.push(`Try the Tough card in ${r.skill.name} (levels 4 to 6).`);
  if (r.difficulty.code === 'TOUGH' && right.length <= 1) next.push(`Warm up with the Easy card in ${r.skill.name}, then come back to Tough.`);
  if (readyWrong.length) next.push('Before tapping Ready, say the answer in one line. If that is hard, tap Assist instead.');
  if (gap > 0) next.push('After each answer, rate how sure you are (1 to 3), then check. This closes the confidence gap fastest.');
  if (passed.length) next.push('Swap a Pass for an Assist: a hint and a try still earns a point.');
  if (assistWrong.length || (missedLow && !readyWrong.length)) next.push(`Re-read the explanation for ${qList(missed)} below and try a similar question.`);
  const other = CARDS.p[NEXT_SKILL[skill]];
  if (other) next.push(`Play the ${other.name} card next: ${other.prompt}`);

  const glance = [
    right.length
      ? `${r.correct} of ${total} right in ${r.subject.name} · ${r.skill.name} (${r.difficulty.name}), highest level secured L${secured} · ${lname(secured)}.`
      : `${r.correct} of ${total} right in ${r.subject.name} · ${r.skill.name} (${r.difficulty.name}).`,
    `${mix.good} of ${total} calls were good decisions${mix.bad ? `, ${mix.bad} confident but off` : ''}${mix.partial ? `, ${mix.partial} partly right` : ''}.`,
    calibration.text,
  ];

  return {
    glance,
    depth: { score: depthScore, ...bandOf(DEPTH_BANDS, depthScore), secured, securedName: secured ? lname(secured) : null, ladder, text: depthText },
    decision: { score: decisionScore, ...bandOf(DECISION_BANDS, decisionScore), mix, decisions, text: decisionText },
    calibration,
    strengths: strengths.slice(0, 3),
    focus: focus.slice(0, 3),
    next: next.slice(0, 3),
  };
}

// Plain-text version for the email body (mailto: cannot carry HTML).
function insightsEmail(r, ins, url, when) {
  const L = [];
  L.push(`Drona Quick Hand report`, `${r.subject.name} · ${r.skill.name} · ${r.difficulty.name}${when ? ` · ${when}` : ''}`, '');
  L.push('AT A GLANCE');
  L.push(`- Score: ${r.correct} of ${r.total} correct (${plural(r.points, 'point')})`);
  L.push(`- Thinking depth: ${ins.depth.score}/100 (${ins.depth.label})${ins.depth.secured ? `, highest level L${ins.depth.secured} · ${ins.depth.securedName}` : ''}`);
  L.push(`- Decision-making: ${ins.decision.score}/100 (${ins.decision.label}), ${ins.decision.mix.good} of ${r.total} good calls`);
  L.push(`- Knowing what you know: ${ins.calibration.text}`, '');
  L.push('THINKING DEPTH');
  for (const q of r.questions) L.push(`- Q${q.n}: L${q.level} · ${q.levelName} · ${q.call === 'PAS' ? 'Passed' : q.correct ? 'Correct' : 'Not quite'}`);
  for (const t of ins.depth.text) L.push(t);
  L.push('', 'DECISION-MAKING');
  for (const d of ins.decision.decisions) L.push(`- Q${d.n}: ${CALL[d.call]} · ${d.label}`);
  for (const t of ins.decision.text) L.push(t);
  L.push('', 'STRENGTHS', ...ins.strengths.map((t) => `- ${t}`));
  L.push('', 'FOCUS AREAS', ...ins.focus.map((t) => `- ${t}`));
  L.push('', 'NEXT STEPS', ...ins.next.map((t) => `- ${t}`));
  if (url) L.push('', `Full report with every question and answer: ${url}`);
  return L.join('\r\n');
}

module.exports = { buildInsights, insightsEmail, DECISION, DEPTH_BANDS, DECISION_BANDS };
