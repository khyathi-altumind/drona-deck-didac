const { CARDS, tapPath } = require('./codes');
const { levelName, MAX_LEVEL, BANDS } = require('../engine');
const { HAND_SIZE } = require('./state');

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CSS = `
:root{
  --forest:#092215; --panel:#0C2A1B; --line:#2A4A38; --gold:#C9A84C; --ivory:#F1EBDB; --ivory-warm:#E3D9BE;
  --muted:#9FB3A6; --depth:#6E9FD6; --rdy:#3E8A5C; --ast:#D69A2D; --pas:#6E7A72; --bad:#D9705A; --ok:#8FD3A8;
  --serif:'Source Serif 4',Georgia,'Times New Roman',serif; --sans:'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif;
  color-scheme:dark;
}
*{box-sizing:border-box}
html,body{margin:0;background:var(--forest);color:var(--ivory);font-family:var(--sans);-webkit-text-size-adjust:100%}
a{color:var(--gold)}
.screen{max-width:620px;margin:0 auto;padding:16px 16px 96px;min-height:100vh;display:flex;flex-direction:column;gap:16px}
.top{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--line)}
.wordmark{font-family:var(--serif);font-weight:700;font-size:22px}
.dot{color:var(--gold)}
.meta{font-size:13px;color:var(--muted);text-align:right}
.meta b{color:var(--ivory);font-weight:600}
.eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px}
.slots{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.slot{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 14px;min-height:74px;min-width:0}
.slot.on{border-top:3px solid var(--gold)}
.slot.skill.on{border-top-color:var(--depth)}
.slot .val{font-family:var(--serif);font-weight:700;font-size:19px;margin-top:4px;overflow-wrap:anywhere}
.slot .val.empty{color:var(--line)}
.steps{display:flex;gap:6px}
.steps i{flex:1;height:5px;border-radius:3px;background:var(--line)}
.steps i.done{background:var(--gold)} .steps i.now{background:var(--ivory)}
.ladder{display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap}
.ladder i{width:11px;height:11px;border-radius:50%;border:1.5px solid var(--depth);display:inline-block}
.ladder i.f{background:var(--depth)}
.ladder i.out{opacity:.3}
.ladder span{font-size:12px;color:var(--muted);margin-left:4px}
.notice{border-radius:10px;padding:10px 14px;font-size:14px;border:1px solid var(--line);background:#0F3021}
.notice.warn{border-color:var(--ast);color:#F3D7A6}
h1,h2{font-family:var(--serif);font-weight:700;margin:0}
h1{font-size:30px;line-height:1.15}
h2{font-size:22px;line-height:1.2}
.stem{font-family:var(--serif);font-size:22px;line-height:1.35;margin:8px 0 0}
.context{background:#0F3021;border:1px solid var(--line);border-radius:10px;padding:12px 14px;font-size:15px;line-height:1.5;margin-top:12px;color:var(--ivory-warm)}
.lead{font-size:15px;color:var(--ivory-warm);line-height:1.5;margin:6px 0 0}
.small{font-size:13px;color:var(--muted)}
.rules{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:10px}
.rules li{display:flex;gap:12px;font-size:15px;line-height:1.4}
.rules b{color:var(--gold);font-variant-numeric:tabular-nums}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.chip{border-radius:999px;padding:7px 14px;font-size:14px;font-weight:600;color:#fff;display:inline-block}
.chip.sm{padding:3px 10px;font-size:12px}
.chip.RDY{background:var(--rdy)} .chip.AST{background:var(--ast)} .chip.PAS{background:var(--pas)}
.hint{border-left:3px solid var(--ast);background:#2A2412;padding:10px 14px;border-radius:6px;font-size:15px;line-height:1.45;margin-top:14px}
.opts{display:grid;gap:10px;margin-top:16px}
.opt{display:block;width:100%;text-align:left;font:inherit;font-size:16px;line-height:1.35;color:var(--ivory);background:#0F3021;border:1px solid var(--line);border-radius:12px;padding:14px 16px;cursor:pointer;min-height:52px}
.opt:hover,.opt:focus-visible{border-color:var(--gold);outline:none}
.big{display:grid;gap:12px;margin-top:16px}
.big.two{grid-template-columns:1fr 1fr}
.big.four{grid-template-columns:repeat(4,1fr)}
.pick{font:inherit;color:var(--ivory);background:#0F3021;border:1px solid var(--line);border-radius:14px;padding:18px 14px;cursor:pointer;text-align:left;min-height:64px}
.pick:hover,.pick:focus-visible{border-color:var(--gold);outline:none}
.pick b{display:block;font-family:var(--serif);font-size:24px}
.pick small{display:block;color:var(--muted);font-size:13px;margin-top:4px;line-height:1.4}
.cardhint{cursor:default;border-top:4px solid var(--acc)}
.cardhint:hover{border-color:var(--line);border-top-color:var(--acc)}
.big.four .pick{text-align:center;padding:18px 6px}
.big.four .pick b{font-size:34px}
.score{font-family:var(--serif);font-size:48px;font-weight:700;line-height:1}
.score small{font-size:20px;color:var(--muted);font-weight:400}
.verdict{font-family:var(--serif);font-size:22px;font-weight:700;margin-top:10px}
.verdict.matched{color:var(--ok)} .verdict.over{color:#F3C47A} .verdict.under{color:#9CC3EE}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}
.stat{background:#0F3021;border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.stat b{display:block;font-family:var(--serif);font-size:24px}
.qlist{display:grid;gap:10px;margin-top:12px}
.qrow{background:#0F3021;border:1px solid var(--line);border-radius:12px;padding:12px 14px}
.qrow summary{cursor:pointer;display:flex;gap:10px;align-items:center;flex-wrap:wrap;list-style:none}
.qrow summary::-webkit-details-marker{display:none}
.qrow .mark{font-weight:700;min-width:64px}
.mark.ok{color:var(--ok)} .mark.no{color:#F0A08C} .mark.skip{color:var(--muted)}
.qrow .msg{font-size:14px;color:var(--ivory-warm);flex-basis:100%}
.qrow .body{margin-top:10px;font-size:14px;line-height:1.5;color:var(--ivory-warm)}
.qrow .body p{margin:6px 0}
.bars{display:grid;gap:8px;margin-top:12px}
.bar{display:grid;grid-template-columns:76px 1fr 76px;align-items:center;gap:10px;font-size:14px;white-space:nowrap}
.bar small{color:var(--gold);font-size:12px}
.legend{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;font-size:12px;color:var(--muted)}
.legend i{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.bar .track{background:#0F3021;border:1px solid var(--line);border-radius:6px;height:22px;overflow:hidden}
.bar .fill{height:100%;background:var(--muted)}
.bar.you .fill{background:var(--gold)}
.bar.you{font-weight:600}
.mix{display:flex;height:24px;border-radius:6px;overflow:hidden;border:1px solid var(--line)}
.mix span{display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#fff;min-width:0;overflow:hidden;white-space:nowrap}
.mix .RDY{background:var(--rdy)} .mix .AST{background:var(--ast)} .mix .PAS{background:var(--pas)}
.mixrow{display:grid;grid-template-columns:72px 1fr;gap:10px;align-items:center;font-size:14px;margin-top:8px}
.sample{display:inline-block;border:1px dashed var(--gold);color:var(--gold);border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600;letter-spacing:.04em}
.share{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center;margin-top:12px}
.qr{background:#fff;border-radius:10px;padding:8px;width:184px;height:184px;display:flex;align-items:center;justify-content:center;color:#092215;font-size:12px;text-align:center;overflow-wrap:anywhere}
.qr svg{width:100%;height:100%;display:block}
.actions{display:grid;gap:10px}
.link{font-size:12px;color:var(--muted);overflow-wrap:anywhere;margin-top:10px}
.btn{display:inline-block;font:inherit;font-weight:600;font-size:16px;border:0;border-radius:12px;padding:14px 18px;background:var(--gold);color:#1B1606;cursor:pointer;text-decoration:none;text-align:center}
.btn.ghost{background:transparent;color:var(--ivory);border:1px solid var(--line)}
.btn.wa{background:#25D366;color:#06210F}
.row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.devbar{position:fixed;left:0;right:0;bottom:0;background:#04140C;border-top:1px dashed var(--gold);padding:8px 12px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;justify-content:center;font-size:12px}
.devbar b{color:var(--gold);letter-spacing:.1em;margin-right:4px}
.devbar a{color:var(--ivory);text-decoration:none;border:1px solid var(--line);border-radius:6px;padding:5px 8px}
.devbar a:hover{border-color:var(--gold)}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:middle}
th{color:var(--muted);font-weight:600;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
code{font-family:ui-monospace,Consolas,monospace;font-size:12px}
.dim{opacity:.45}
@media (max-width:480px){
  .slots{grid-template-columns:1fr 1fr}
  .slots .slot.skill{grid-column:1/-1}
  .big.two{grid-template-columns:1fr}
  .big.four{grid-template-columns:1fr 1fr}
  .share{grid-template-columns:1fr;justify-items:center}
  .stats{grid-template-columns:1fr 1fr 1fr}
  .bar{grid-template-columns:70px 1fr 70px;gap:8px}
}
`;

const QR_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';

function layout(title, body, { refresh } = {}) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#092215">
${refresh ? `<meta http-equiv="refresh" content="${refresh}">` : ''}
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&family=Source+Serif+4:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head><body>${body}</body></html>`;
}

const CALL_NAME = { RDY: 'Ready', AST: 'Assist', PAS: 'Pass' };
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Six dots for the skill's ladder; levels outside the chosen band are faded.
function ladder(skill, level, difficulty) {
  const band = BANDS[difficulty];
  let dots = '';
  for (let i = 1; i <= MAX_LEVEL; i++) {
    const cls = [i <= level ? 'f' : '', band && (i < band.min || i > band.max) ? 'out' : ''].filter(Boolean).join(' ');
    dots += `<i class="${cls}"></i>`;
  }
  return `<div class="ladder" aria-label="Level ${level} of ${MAX_LEVEL}">${dots}<span>L${level} · ${esc(levelName(skill, level))}</span></div>`;
}

function header(s, station) {
  const where = station ? `Station ${station}` : 'DIDAC booth';
  const inHand = s.phase === 'QUESTION' || s.phase === 'ANSWERING';
  const meta = inHand ? `Question <b>${s.hand.length + 1}</b> of ${HAND_SIZE} · ${where}` : where;
  return `<header class="top"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">${meta}</span></header>`;
}

// Progress through the hand: one bar per question.
function steps(s) {
  let out = '';
  for (let i = 0; i < HAND_SIZE; i++) out += `<i class="${i < s.hand.length ? 'done' : i === s.hand.length ? 'now' : ''}"></i>`;
  return `<div class="steps" aria-label="Question ${s.hand.length + 1} of ${HAND_SIZE}">${out}</div>`;
}

function slots(s) {
  const subj = s.subject ? CARDS.s[s.subject].name : null;
  const level = s.difficulty ? BANDS[s.difficulty].name : null;
  const skill = s.skill ? CARDS.p[s.skill].name : null;
  const val = (v) => `<div class="val ${v ? '' : 'empty'}">${v ? esc(v) + '<span class="dot">.</span>' : '—'}</div>`;
  const showLadder = skill && s.level && (s.phase === 'QUESTION' || s.phase === 'ANSWERING');
  return `<section class="slots">
  <div class="slot ${subj ? 'on' : ''}"><div class="eyebrow">1 · Subject</div>${val(subj)}</div>
  <div class="slot ${level ? 'on' : ''}"><div class="eyebrow">2 · Level</div>${val(level)}</div>
  <div class="slot skill ${skill ? 'on' : ''}"><div class="eyebrow">3 · Skill</div>${val(skill)}${showLadder ? ladder(s.skill, s.level, s.difficulty) : ''}</div>
</section>`;
}

function rulesList() {
  return `<ol class="rules">
  <li><b>01</b><span>Tap a subject card: Science or History.</span></li>
  <li><b>02</b><span>Tap a level card: Easy or Tough.</span></li>
  <li><b>03</b><span>Tap a skill card.</span></li>
  <li><b>04</b><span>Three questions. For each one, read it, then tap your call: Ready, Assist or Pass. Then answer.</span></li>
  <li><b>05</b><span>Guess how many you got right.</span></li>
  <li><b>06</b><span>See your result, compare with the class, and take your report with you.</span></li>
</ol>`;
}

function questionEyebrow(s) {
  return `<div class="eyebrow">${esc(CARDS.s[s.subject].name)} · ${esc(CARDS.p[s.skill].name)} · Level ${s.question.level} · ${esc(levelName(s.skill, s.question.level))}</div>`;
}

function context(q) {
  return q.context ? `<div class="context">${esc(q.context)}</div>` : '';
}

// ---------- Result, class and question sections (shared by the booth screen and the report page) ----------

const CALIBRATION = {
  matched: (r) => [`Spot on.`, `You guessed ${r.estimate} and got ${r.correct}. Knowing what you know is exactly what Drona measures.`],
  over: (r) => [`More sure than your answers.`, `You guessed ${r.estimate} but got ${r.correct}. This gap between confidence and results is what Drona tracks.`],
  under: (r) => [`Better than you thought.`, `You guessed ${r.estimate} but got ${r.correct}. Trust your thinking a little more.`],
};

function resultSummary(r) {
  const [title, line] = CALIBRATION[r.calibration](r);
  const calls = ['RDY', 'AST', 'PAS'].map((c) => `<span class="chip sm ${c}">${CALL_NAME[c]} ×${r.calls[c]}</span>`).join(' ');
  return `<div class="eyebrow">${esc(r.subject.name)} · ${esc(r.skill.name)} · ${esc(r.difficulty.name)}</div>
<div class="score" style="margin-top:10px">${r.correct}<small> of ${r.total} correct</small></div>
<div class="verdict ${r.calibration}">${esc(title)}</div>
<p class="lead">${esc(line)}</p>
<div class="stats">
  <div class="stat"><span class="eyebrow">Your guess</span><b>${r.estimate}</b></div>
  <div class="stat"><span class="eyebrow">Points</span><b>${r.points}</b></div>
  <div class="stat"><span class="eyebrow">Capability</span><b>${Math.round((r.correct / r.total) * 100)}</b></div>
</div>
<div class="chips">${calls}</div>
<p class="small" style="margin-top:12px">${esc(r.skill.name)} asks: ${esc(r.skill.prompt)} Three questions is a small sample. More questions give a more reliable picture.</p>`;
}

function questionList(r) {
  const rows = r.questions
    .map((q) => {
      const mark = q.call === 'PAS' ? '<span class="mark skip">Skipped</span>' : q.correct ? '<span class="mark ok">✓ Correct</span>' : '<span class="mark no">✗ Not quite</span>';
      const yours = q.choice === null ? 'Passed' : `${LETTERS[q.choice]}. ${q.options[q.choice]}`;
      return `<details class="qrow"><summary><b>Q${q.n}</b><span class="chip sm ${q.call}">${CALL_NAME[q.call]}</span>${mark}<span class="small">L${q.level} · ${esc(q.levelName)}</span><span class="msg">${esc(q.message)}</span></summary>
<div class="body">${q.context ? `<p>${esc(q.context)}</p>` : ''}<p><b>${esc(q.stem)}</b></p>
<p>Your answer: ${esc(yours)}</p><p>Correct answer: ${LETTERS[q.answer]}. ${esc(q.options[q.answer])}</p><p>${esc(q.explanation)}</p></div></details>`;
    })
    .join('');
  return `<div class="eyebrow">Question by question · tap to open</div><div class="qlist">${rows}</div>`;
}

function classComparison(r) {
  const c = r.class;
  const max = Math.max(...c.scoreDist, 1);
  const bars = c.scoreDist
    .map((count, n) => {
      const you = n === r.correct;
      return `<div class="bar ${you ? 'you' : ''}"><span>${n} correct${you ? '<br><small>You</small>' : ''}</span><div class="track"><div class="fill" style="width:${Math.round((count / max) * 100)}%"></div></div><span>${count} pupil${count === 1 ? '' : 's'}</span></div>`;
    })
    .join('');
  const mix = (m) =>
    ['RDY', 'AST', 'PAS']
      .filter((k) => m[k] > 0)
      .map((k) => `<span class="${k}" style="flex:${m[k]}" title="${CALL_NAME[k]} ${m[k]}%">${m[k] >= 25 ? `${CALL_NAME[k]} ${m[k]}%` : m[k] >= 8 ? `${m[k]}%` : ''}</span>`)
      .join('');
  const youCal = {
    matched: `You were one of the ${c.calibration.matched} who guessed exactly.`,
    over: `You were one of the ${c.calibration.over} who were more sure.`,
    under: 'You were more modest than your result.',
  }[r.calibration];
  return `<div class="row" style="margin-top:0;align-items:center"><span class="eyebrow">Compared with the class</span><span class="sample">Sample data</span></div>
<h2 style="margin-top:8px">You scored higher than ${c.lower} of ${c.size} pupils.</h2>
<p class="lead">${c.same} scored the same as you and ${c.higher} scored higher. The class average was ${c.avgCorrect} of ${r.total}.</p>
<div class="bars">${bars}</div>
<div class="eyebrow" style="margin-top:20px">Knowing what you know</div>
<p class="lead">${c.calibration.matched} of ${c.size} guessed their own score exactly. ${c.calibration.over} were more sure than their results. ${youCal}</p>
<div class="eyebrow" style="margin-top:20px">How calls were made</div>
<div class="mixrow"><span>Class</span><div class="mix">${mix(c.callMix.class)}</div></div>
<div class="mixrow"><span><b>You</b></span><div class="mix">${mix(c.callMix.you)}</div></div>
<div class="legend"><span><i style="background:var(--rdy)"></i>Ready</span><span><i style="background:var(--ast)"></i>Assist</span><span><i style="background:var(--pas)"></i>Pass</span></div>
<p class="small" style="margin-top:12px">This is an illustrative Grade 8 class of ${c.size}. In a school pilot, this view shows your real class, with each pupil’s thinking, decisions and confidence over the term.</p>`;
}

function shareText(r, url) {
  return `My Drona Quick Hand: ${r.correct} of ${r.total} correct in ${r.subject.name} · ${r.skill.name} (${r.difficulty.name}). I guessed ${r.estimate}. See my report: ${url}`;
}

// ---------- Booth screens ----------

function phaseBody(s, { report, reportUrl }) {
  switch (s.phase) {
    case 'IDLE':
      return `<section class="panel"><div class="eyebrow">How to play</div><h1>The Drona Deck<span class="dot">.</span></h1>${rulesList()}
<p class="lead" style="margin-top:16px">Start by tapping a <b>Science</b> or <b>History</b> card.</p></section>`;

    case 'DIFFICULTY':
      return `<section class="panel"><div class="eyebrow">${esc(CARDS.s[s.subject].name)} chosen</div>
<h1>Now tap a level card<span class="dot">.</span></h1>
<div class="big two">${['EASY', 'TOUGH'].map((k) => `<div class="pick cardhint" style="--acc:${CARDS.d[k].accent}"><b>${esc(CARDS.d[k].name)}</b><small>${esc(CARDS.d[k].prompt)}</small></div>`).join('')}</div>${s.skill ? `<p class="small" style="margin-top:12px">${esc(CARDS.p[s.skill].name)} is saved. Your hand starts as soon as you tap a level card.</p>` : ''}</section>`;

    case 'SKILL':
      return `<section class="panel"><div class="eyebrow">${esc(CARDS.s[s.subject].name)} · ${esc(BANDS[s.difficulty].name)}</div>
<h1>Now tap a skill card<span class="dot">.</span></h1>
<ul class="rules">${['DEP', 'STR', 'UNT', 'PIV'].map((k) => `<li><b>${esc(CARDS.p[k].name)}</b><span>${esc(CARDS.p[k].prompt)}</span></li>`).join('')}</ul></section>`;

    case 'QUESTION':
      return `<section class="panel">${steps(s)}<div style="margin-top:14px">${questionEyebrow(s)}</div>
${context(s.question)}<p class="stem">${esc(s.question.stem)}</p>
<p class="lead" style="margin-top:18px">Make your call. Tap a chip:</p>
<div class="chips"><span class="chip RDY">Ready</span><span class="chip AST">Assist</span><span class="chip PAS">Pass</span></div>
<p class="small" style="margin-top:8px">Ready: answer on your own. Assist: see a hint first. Pass: skip it on purpose.</p>
</section>`;

    case 'ANSWERING': {
      const q = s.question;
      const opts = q.options
        .map((o, i) => `<button class="opt" name="choice" value="${i}" data-key="${i + 1}"><b>${LETTERS[i]}.</b> ${esc(o)}</button>`)
        .join('');
      return `<section class="panel">${steps(s)}<div style="margin-top:14px">${questionEyebrow(s)}</div>
${context(q)}<p class="stem">${esc(q.stem)}</p>
${s.call === 'AST' ? `<div class="hint"><b>Hint.</b> ${esc(q.hint)}</div>` : ''}
<form method="post" action="/answer"><input type="hidden" name="qid" value="${esc(q.id)}"><div class="opts">${opts}</div></form>
</section>`;
    }

    case 'ESTIMATE': {
      const picks = Array.from({ length: HAND_SIZE + 1 }, (_, n) => `<button class="pick" name="n" value="${n}" data-key="${n}"><b>${n}</b></button>`).join('');
      return `<section class="panel"><div class="eyebrow">All ${HAND_SIZE} questions done</div>
<h1>How many do you think you got right<span class="dot">?</span></h1>
<p class="lead">Be honest. Knowing what you know is part of your result.</p>
<form method="post" action="/estimate" class="big four">${picks}</form></section>`;
    }

    case 'RESULT':
      if (!report) break;
      return `<section class="panel">${resultSummary(report)}</section>
<section class="panel">${questionList(report)}</section>
<form method="post" action="/goto"><button class="btn" name="to" value="CLASS" style="width:100%">Compare with the class →</button></form>`;

    case 'CLASS':
      if (!report) break;
      return `<section class="panel">${classComparison(report)}</section>
<div class="row" style="margin-top:0">
<form method="post" action="/goto" style="flex:1"><button class="btn ghost" name="to" value="RESULT" style="width:100%">← My result</button></form>
<form method="post" action="/goto" style="flex:2"><button class="btn" name="to" value="SHARE" style="width:100%">Share my report →</button></form></div>`;

    case 'SHARE': {
      if (!report) break;
      const text = shareText(report, reportUrl);
      const subject = `My Drona Quick Hand report (${report.subject.name} · ${report.skill.name})`;
      return `<section class="panel"><div class="eyebrow">Share report</div>
<h1>Take your report with you<span class="dot">.</span></h1>
<div class="share">
  <div class="qr" id="qr" data-url="${esc(reportUrl)}">Scan code loading…</div>
  <div class="actions">
    <p class="lead" style="margin:0">Scan the code with your phone camera to open your report.</p>
    <a class="btn wa" href="https://wa.me/?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">Share on WhatsApp</a>
    <a class="btn ghost" href="mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}">Email my report</a>
    <button class="btn ghost" type="button" id="copy" data-url="${esc(reportUrl)}">Copy link</button>
  </div>
</div>
<p class="link">${esc(reportUrl)}</p></section>
<section class="panel"><div class="eyebrow">Play again</div>
<p class="lead">Tap another skill card for a new hand in ${esc(report.subject.name)}, or a subject card to switch subject.</p>
<div class="row"><form method="post" action="/goto"><button class="btn ghost" name="to" value="CLASS">← Class view</button></form>
<form method="post" action="/new"><button class="btn">New player</button></form></div></section>
${shareScript()}`;
    }
  }
  return `<section class="panel"><h1>Tap a subject card to begin<span class="dot">.</span></h1></section>`;
}

// QR code drawn in the browser; if the library can't load (offline booth), the link text still shows.
function shareScript() {
  return `<script src="${QR_LIB}"></script>
<script>
(function () {
  var el = document.getElementById('qr');
  if (el) {
    if (typeof qrcode === 'function') {
      var q = qrcode(0, 'M'); q.addData(el.dataset.url); q.make();
      el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    } else {
      el.textContent = 'Scan code unavailable offline. Use the link below.';
    }
  }
  var copy = document.getElementById('copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () { copy.textContent = 'Link copied'; };
    if (navigator.clipboard) navigator.clipboard.writeText(copy.dataset.url).then(done, function () { copy.textContent = 'Copy failed'; });
  });
})();
</script>`;
}

function devBar(set) {
  const links = [
    ['s', 'SCI', 'Science'], ['s', 'HIS', 'History'], ['d', 'EASY', 'Easy'], ['d', 'TOUGH', 'Tough'], ['p', 'DEP', 'Depth'], ['p', 'STR', 'Stretch'], ['p', 'UNT', 'Untangle'], ['p', 'PIV', 'Pivot'],
    ['k', 'RDY', 'Ready'], ['k', 'AST', 'Assist'], ['k', 'PAS', 'Pass'], ['r', 'R', 'Rules'], ['s', 'ENG', 'English (off)'],
  ]
    .map(([k, c, n]) => `<a href="${tapPath(k, c, set)}">${esc(n)}</a>`)
    .join('');
  return `<nav class="devbar"><b>DEV TAP</b>${links}<a href="/dev">Tools</a></nav>`;
}

// The call button box is a USB/Bluetooth keyboard: R/A/P (or F13/F14/F15) send Ready/Assist/Pass
// through the same /k/ routes as the chips. Other keys press the on-screen button with a matching
// data-key: 1-4 for an answer, 0-3 for the estimate. Easy/Tough are NFC cards only.
function buttonScript(station) {
  return `<script>
(function () {
  var station = ${station ? Number(station) : 'null'};
  var calls = { r: 'RDY', a: 'AST', p: 'PAS', F13: 'RDY', F14: 'AST', F15: 'PAS' };
  var busy = false;
  document.addEventListener('keydown', function (e) {
    if (busy || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (calls[k]) {
      busy = true;
      e.preventDefault();
      location.href = '/k/' + calls[k] + (station ? '/' + station : '') + '?src=button';
      return;
    }
    var btn = document.querySelector('button[data-key="' + k + '"]');
    if (btn) { busy = true; e.preventDefault(); btn.click(); }
  });
})();
</script>`;
}

function playPage(s, { devTools, station, report = null, reportUrl = null }) {
  const n = s.notice ? `<div class="notice ${s.notice.tone}" role="status">${esc(s.notice.text)}</div>` : '';
  const done = ['RESULT', 'CLASS', 'SHARE'].includes(s.phase);
  return layout(
    'Drona Deck',
    `<main class="screen">${header(s, station)}${n}${done ? '' : slots(s)}${phaseBody(s, { report, reportUrl })}</main>${devTools ? devBar(station || 1) : ''}${buttonScript(station)}`,
  );
}

// ---------- Shareable report (opened on the visitor's own phone) ----------

function reportPage(r, { url }) {
  const when = new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return layout(
    `Drona report · ${r.subject.name}`,
    `<main class="screen" style="padding-bottom:32px">
<header class="top"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">Quick Hand report<br>${esc(when)} IST</span></header>
<section class="panel">${resultSummary(r)}</section>
<section class="panel">${questionList(r)}</section>
<section class="panel">${classComparison(r)}</section>
<section class="panel"><div class="eyebrow">About Drona</div>
<p class="lead">Drona measures how students think, how they decide, and how well they know their own ability, not just whether an answer was right. Every question starts with a call: answer alone, ask for a hint, or pass.</p>
<div class="row"><a class="btn wa" href="https://wa.me/?text=${encodeURIComponent(shareText(r, url))}" target="_blank" rel="noopener">Share on WhatsApp</a></div></section>
</main>`,
  );
}

function reportMissingPage() {
  return layout(
    'Report not found',
    `<main class="screen"><header class="top"><span class="wordmark">Drona<span class="dot">.</span></span></header>
<section class="panel"><div class="eyebrow">Report not found</div><h1>We can’t find this report<span class="dot">.</span></h1>
<p class="lead">The link may be incomplete, or the report has expired. Please ask the Drona team at the booth.</p></section></main>`,
  );
}

function unknownCardPage(tap, { devTools }) {
  return layout(
    'Unknown card',
    `<main class="screen"><header class="top"><span class="wordmark">Drona<span class="dot">.</span></span></header>
<section class="panel"><div class="eyebrow">Unknown card</div><h1>We don’t recognise this card<span class="dot">.</span></h1>
<p class="lead">Code <code>${esc(tap.code)}</code> isn’t in the Drona Deck. Please hand it to the booth team.</p>
<p style="margin-top:16px"><a class="btn" href="/play">Back to the game</a></p></section></main>${devTools ? devBar(1) : ''}`,
  );
}

function notFoundPage() {
  return layout('Not found', `<main class="screen"><section class="panel"><h1>Not found<span class="dot">.</span></h1><p><a href="/play">Go to the game</a></p></section></main>`);
}

// ---------- Dev tools ----------

function devIndexPage(baseUrl) {
  return layout(
    'Drona Deck dev tools',
    `<main class="screen"><header class="top"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">Dev tools</span></header>
<section class="panel"><div class="eyebrow">Testing without cards</div>
<ul class="rules" style="list-style:disc;padding-left:18px;display:block">
<li style="display:list-item"><a href="/dev/deck">Simulator</a>: click cards and watch the phone screen, state and tap log update.</li>
<li style="display:list-item"><a href="/dev/codes">Code map + QR codes</a>: all 33 tag URLs. Scan a QR with a phone to "tap" a card.</li>
<li style="display:list-item"><a href="/dev/codes.csv">codes.csv</a>: the URLs to write onto the NFC tags.</li>
<li style="display:list-item"><a href="/dev/log">Tap log</a>: every tap with set number and outcome.</li>
<li style="display:list-item"><a href="/play">Player screen</a></li>
</ul>
<p class="lead">Tag base URL: <code>${esc(baseUrl)}</code></p></section></main>`,
  );
}

function devDeckPage() {
  const group = (kind, title) =>
    `<div class="eyebrow" style="margin-top:12px">${title}</div><div class="simgrid">` +
    Object.entries(CARDS[kind])
      .map(([code, c]) => `<button class="sim ${c.active ? '' : 'off'}" data-kind="${kind}" data-code="${code}" style="--acc:${c.accent || 'var(--gold)'}">${esc(c.name)}<small>${code}${c.active ? '' : ' · off'}</small></button>`)
      .join('') +
    '</div>';

  return layout(
    'Drona Deck simulator',
    `<style>
.simwrap{display:grid;grid-template-columns:minmax(220px,300px) 400px minmax(260px,1fr);gap:16px;padding:16px;align-items:start}
@media (max-width:1100px){.simwrap{grid-template-columns:1fr}}
.simgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:6px}
.sim{font:inherit;font-weight:600;color:var(--ivory);background:var(--panel);border:1px solid var(--line);border-top:3px solid var(--acc);border-radius:10px;padding:10px;cursor:pointer;text-align:left}
.sim small{display:block;font-weight:400;color:var(--muted);font-size:11px;margin-top:2px}
.sim.off{opacity:.55}
.sim:hover{border-color:var(--gold)}
.phone{width:100%;max-width:400px;height:780px;border:10px solid #000;border-radius:28px;background:var(--forest);overflow:hidden}
.phone iframe{width:100%;height:100%;border:0}
pre{white-space:pre-wrap;word-break:break-word;font-size:12px;background:#04140C;border:1px solid var(--line);border-radius:8px;padding:10px;max-height:340px;overflow:auto;margin:6px 0 0}
select{font:inherit;background:var(--panel);color:var(--ivory);border:1px solid var(--line);border-radius:8px;padding:6px}
</style>
<div class="simwrap">
<section class="panel">
  <div class="top" style="padding-bottom:10px"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">Simulator</span></div>
  <label class="eyebrow" style="display:block;margin-top:12px">Physical set
    <select id="set"><option value="1">Set 1 · Station 1</option><option value="2">Set 2 · Station 2</option><option value="3">Set 3 · Spare</option><option value="">No set number</option></select>
  </label>
  ${group('s', 'Subject cards')}
  ${group('d', 'Level cards')}
  ${group('p', 'Skill cards')}
  ${group('k', 'Call chips')}
  ${group('r', 'Rules card')}
  <p class="lead" style="font-size:13px;margin-top:14px">Each button loads the exact URL the NFC tag will hold, inside the phone frame. Last URL:<br><code id="last">—</code></p>
  <p style="margin-top:10px;font-size:13px"><a href="/dev/codes">Code map</a> · <a href="/dev/log">Full log</a> · <a href="/play" target="_blank">Open player in new tab</a></p>
</section>
<div class="phone"><iframe id="frame" src="/play" title="Player screen"></iframe></div>
<section class="panel">
  <div class="eyebrow">Session state (this browser)</div><pre id="state">loading…</pre>
  <div class="eyebrow" style="margin-top:14px">Recent taps</div><pre id="log">loading…</pre>
</section>
</div>
<script>
const frame = document.getElementById('frame');
const setSel = document.getElementById('set');
document.querySelectorAll('.sim').forEach(b => b.addEventListener('click', () => {
  const k = b.dataset.kind, c = b.dataset.code, s = setSel.value;
  const path = (k === 'r' ? '/r' : '/' + k + '/' + c) + (s ? '/' + s : '');
  document.getElementById('last').textContent = path;
  frame.src = path;
}));
async function refresh() {
  try {
    const st = await (await fetch('/dev/api/state', {cache:'no-store'})).json();
    document.getElementById('state').textContent = JSON.stringify(st, null, 2);
    const log = await (await fetch('/dev/api/log?limit=12', {cache:'no-store'})).json();
    document.getElementById('log').textContent = log.map(e =>
      e.ts.slice(11,19) + '  set=' + (e.set ?? e.setRaw ?? '-') + '  ' + e.path + '  → ' + e.outcome + (e.phase ? '  [' + e.phase + ' L' + e.level + ']' : '')
    ).join('\\n') || '(no taps yet)';
  } catch (e) { document.getElementById('state').textContent = 'Error: ' + e.message; }
}
frame.addEventListener('load', refresh);
refresh();
</script>`,
  );
}

function devCodesPage(rows, baseUrl, setFilter) {
  const shown = setFilter ? rows.filter((r) => r.set === setFilter) : rows;
  const body = shown
    .map(
      (r) => `<tr class="${r.active ? '' : 'dim'}"><td>S${r.set}</td><td>${esc(r.item)}</td><td>${esc(r.type)}</td><td><code>${esc(r.code)}</code></td>
<td><a href="${esc(r.url)}" target="_blank"><code>${esc(r.url)}</code></a></td><td>${r.active ? 'Live' : 'Off'}</td>
<td><div class="qr" data-url="${esc(r.url)}"></div></td></tr>`,
    )
    .join('');
  const tabs = ['', 1, 2, 3]
    .map((s) => `<a href="/dev/codes${s ? '?set=' + s : ''}" style="${(setFilter || '') === s ? 'color:var(--ivory)' : ''}">${s ? 'Set ' + s : 'All'}</a>`)
    .join(' · ');
  return layout(
    'Drona Deck code map',
    `<style>.qr svg{background:#fff;padding:4px;border-radius:4px;display:block}.wrap{padding:16px;max-width:1100px;margin:0 auto}.tablewrap{overflow-x:auto}</style>
<div class="wrap"><div class="top"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">Code map · ${tabs}</span></div>
<p class="lead">Base URL: <code>${esc(baseUrl)}</code>. Set <code>BASE_URL</code> to the real https domain before writing tags.
Scan any QR with a phone on the same Wi-Fi. Opening the URL is exactly what an NFC tap does. <a href="/dev/codes.csv">Download CSV</a></p>
<div class="tablewrap"><table><thead><tr><th>Set</th><th>Item</th><th>Type</th><th>Code</th><th>URL (tag + QR)</th><th>Booth</th><th>QR</th></tr></thead><tbody>${body}</tbody></table></div></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
<script>
document.querySelectorAll('.qr').forEach(el => {
  if (typeof qrcode !== 'function') { el.textContent = 'QR lib offline'; return; }
  const q = qrcode(0, 'M'); q.addData(el.dataset.url); q.make();
  el.innerHTML = q.createSvgTag(3, 2);
});
</script>`,
  );
}

function devLogPage(entries) {
  const body = entries
    .map(
      (e) => `<tr><td><code>${esc(e.ts)}</code></td><td>${esc(e.set ?? e.setRaw ?? '—')}</td><td><code>${esc(e.path)}</code></td><td>${esc(e.outcome)}</td>
<td>${esc(e.phase || '')}${e.level ? ' L' + e.level : ''}</td><td><code>${esc((e.sid || '').slice(0, 8))}</code></td></tr>`,
    )
    .join('');
  return layout(
    'Drona Deck tap log',
    `<div style="padding:16px;max-width:1100px;margin:0 auto"><div class="top"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">Tap log · auto-refresh 3s · <a href="/dev">Tools</a></span></div>
<div style="overflow-x:auto"><table><thead><tr><th>Time (UTC)</th><th>Set</th><th>Path</th><th>Outcome</th><th>State after</th><th>Session</th></tr></thead><tbody>${body || '<tr><td colspan="6">No taps yet.</td></tr>'}</tbody></table></div></div>`,
    { refresh: 3 },
  );
}

module.exports = { playPage, reportPage, reportMissingPage, unknownCardPage, notFoundPage, devIndexPage, devDeckPage, devCodesPage, devLogPage };
