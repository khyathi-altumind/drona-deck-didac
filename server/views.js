const { CARDS, tapPath } = require('./codes');
const { levelName, MAX_LEVEL } = require('../engine');

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
  --muted:#9FB3A6; --depth:#6E9FD6; --rdy:#3E8A5C; --ast:#D69A2D; --pas:#6E7A72; --bad:#D9705A;
  --serif:'Source Serif 4',Georgia,'Times New Roman',serif; --sans:'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif;
  color-scheme:dark;
}
*{box-sizing:border-box}
html,body{margin:0;background:var(--forest);color:var(--ivory);font-family:var(--sans);-webkit-text-size-adjust:100%}
a{color:var(--gold)}
.screen{max-width:560px;margin:0 auto;padding:16px 16px 96px;min-height:100vh;display:flex;flex-direction:column;gap:16px}
.top{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--line)}
.wordmark{font-family:var(--serif);font-weight:700;font-size:22px}
.dot{color:var(--gold)}
.meta{font-size:13px;color:var(--muted);text-align:right}
.meta b{color:var(--ivory);font-weight:600}
.eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px}
.slots{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.slot{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px 14px;min-height:74px}
.slot.on{border-top:3px solid var(--gold)}
.slot.skill.on{border-top-color:var(--depth)}
.slot .val{font-family:var(--serif);font-weight:700;font-size:20px;margin-top:4px}
.slot .val.empty{color:var(--line)}
.ladder{display:flex;align-items:center;gap:6px;margin-top:8px}
.ladder i{width:11px;height:11px;border-radius:50%;border:1.5px solid var(--depth);display:inline-block}
.ladder i.f{background:var(--depth)}
.ladder span{font-size:12px;color:var(--muted);margin-left:4px}
.notice{border-radius:10px;padding:10px 14px;font-size:14px;border:1px solid var(--line);background:#0F3021}
.notice.warn{border-color:var(--ast);color:#F3D7A6}
h1,h2{font-family:var(--serif);font-weight:700;margin:0}
h1{font-size:30px;line-height:1.15}
.stem{font-family:var(--serif);font-size:22px;line-height:1.35;margin:8px 0 0}
.lead{font-size:15px;color:var(--ivory-warm);line-height:1.5;margin:6px 0 0}
.rules{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:10px}
.rules li{display:flex;gap:12px;font-size:15px;line-height:1.4}
.rules b{color:var(--gold);font-variant-numeric:tabular-nums}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.chip{border-radius:999px;padding:7px 14px;font-size:14px;font-weight:600;color:#fff}
.chip.RDY{background:var(--rdy)} .chip.AST{background:var(--ast)} .chip.PAS{background:var(--pas)}
.hint{border-left:3px solid var(--ast);background:#2A2412;padding:10px 14px;border-radius:6px;font-size:15px;line-height:1.45;margin-top:14px}
.opts{display:grid;gap:10px;margin-top:16px}
.opt{display:block;width:100%;text-align:left;font:inherit;font-size:16px;line-height:1.35;color:var(--ivory);background:#0F3021;border:1px solid var(--line);border-radius:12px;padding:14px 16px;cursor:pointer;min-height:52px}
.opt:hover,.opt:focus-visible{border-color:var(--gold);outline:none}
.opt.correct{border-color:var(--rdy);background:#123A26}
.opt.chosen.wrong{border-color:var(--bad);background:#3A1A14}
.opt .tag{float:right;font-size:12px;font-weight:600;color:var(--muted)}
.verdict{font-family:var(--serif);font-size:34px;font-weight:700}
.verdict.ok{color:#8FD3A8} .verdict.no{color:#F0A08C}
.btn{display:inline-block;font:inherit;font-weight:600;font-size:16px;border:0;border-radius:12px;padding:14px 18px;background:var(--gold);color:#1B1606;cursor:pointer;text-decoration:none;text-align:center}
.btn.ghost{background:transparent;color:var(--ivory);border:1px solid var(--line)}
.devbar{position:fixed;left:0;right:0;bottom:0;background:#04140C;border-top:1px dashed var(--gold);padding:8px 12px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;justify-content:center;font-size:12px}
.devbar b{color:var(--gold);letter-spacing:.1em;margin-right:4px}
.devbar a{color:var(--ivory);text-decoration:none;border:1px solid var(--line);border-radius:6px;padding:5px 8px}
.devbar a:hover{border-color:var(--gold)}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:middle}
th{color:var(--muted);font-weight:600;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
code{font-family:ui-monospace,Consolas,monospace;font-size:12px}
.dim{opacity:.45}
`;

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

function ladder(level) {
  let dots = '';
  for (let i = 1; i <= MAX_LEVEL; i++) dots += `<i class="${i <= level ? 'f' : ''}"></i>`;
  return `<div class="ladder" aria-label="Level ${level} of ${MAX_LEVEL}">${dots}<span>L${level} · ${esc(levelName(level))}</span></div>`;
}

function header(s) {
  const meta = s.answered
    ? `Score <b>${s.score}</b> · ${s.correct}/${s.answered} correct`
    : 'DIDAC booth';
  return `<header class="top"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">${meta}</span></header>`;
}

function slots(s) {
  const subj = s.subject ? CARDS.s[s.subject].name : null;
  const skill = s.skill ? CARDS.p[s.skill].name : null;
  return `<section class="slots">
  <div class="slot ${subj ? 'on' : ''}"><div class="eyebrow">Subject</div><div class="val ${subj ? '' : 'empty'}">${subj ? esc(subj) + '<span class="dot">.</span>' : '—'}</div></div>
  <div class="slot skill ${skill ? 'on' : ''}"><div class="eyebrow">Skill</div><div class="val ${skill ? '' : 'empty'}">${skill ? esc(skill) + '<span class="dot">.</span>' : '—'}</div>${skill ? ladder(s.level) : ''}</div>
</section>`;
}

function rulesList() {
  return `<ol class="rules">
  <li><b>01</b><span>Tap a subject card.</span></li>
  <li><b>02</b><span>Tap a skill card. (Either order.)</span></li>
  <li><b>03</b><span>Read the question, then tap your call: Ready, Assist or Pass.</span></li>
  <li><b>04</b><span>Answer. See your result.</span></li>
  <li><b>05</b><span>Swap one card and tap again.</span></li>
</ol>`;
}

function questionEyebrow(s) {
  return `<div class="eyebrow">${esc(CARDS.s[s.subject].name)} · ${esc(CARDS.p[s.skill].name)} · Level ${s.level} · ${esc(levelName(s.level))}</div>`;
}

function phaseBody(s) {
  switch (s.phase) {
    case 'IDLE':
      return `<section class="panel"><div class="eyebrow">How to play</div><h1>The Drona Deck<span class="dot">.</span></h1>${rulesList()}</section>`;

    case 'HALF': {
      const need = s.subject ? 'skill' : 'subject';
      return `<section class="panel"><div class="eyebrow">Almost there</div>
<h1>Now tap a ${need} card<span class="dot">.</span></h1>
<p class="lead">${need === 'skill' ? 'Depth asks: how deep can you think?' : 'Science is live at this booth.'}</p></section>`;
    }

    case 'QUESTION':
      return `<section class="panel">${questionEyebrow(s)}
<p class="stem">${esc(s.question.stem)}</p>
<p class="lead" style="margin-top:18px">Make your call. Tap a chip:</p>
<div class="chips"><span class="chip RDY">Ready</span><span class="chip AST">Assist</span><span class="chip PAS">Pass</span></div>
<p class="lead" style="font-size:13px;color:var(--muted)">Ready: answer alone (+2, level up). Assist: get a hint (+1). Pass: new question.</p>
</section>`;

    case 'ANSWERING': {
      const q = s.question;
      const opts = q.options
        .map((o, i) => `<button class="opt" name="choice" value="${i}">${esc(o)}</button>`)
        .join('');
      return `<section class="panel">${questionEyebrow(s)}
<p class="stem">${esc(q.stem)}</p>
${s.call === 'AST' ? `<div class="hint"><b>Hint.</b> ${esc(q.hint)}</div>` : ''}
<form method="post" action="/answer"><input type="hidden" name="qid" value="${esc(q.id)}"><div class="opts">${opts}</div></form>
</section>`;
    }

    case 'RESULT': {
      const q = s.question;
      const r = s.result;
      const opts = q.options
        .map((o, i) => {
          const cls = ['opt', i === q.answer ? 'correct' : '', i === r.choice ? 'chosen' : '', i === r.choice && !r.correct ? 'wrong' : '']
            .filter(Boolean)
            .join(' ');
          const tag = i === q.answer ? 'Correct answer' : i === r.choice ? 'Your answer' : '';
          return `<div class="${cls}">${esc(o)}${tag ? `<span class="tag">${tag}</span>` : ''}</div>`;
        })
        .join('');
      const move =
        r.levelAfter > r.levelBefore ? `Level up: L${r.levelBefore} → L${r.levelAfter}`
        : r.levelAfter < r.levelBefore ? `Level down: L${r.levelBefore} → L${r.levelAfter}`
        : `Staying at L${r.levelAfter}`;
      return `<section class="panel">
<div class="verdict ${r.correct ? 'ok' : 'no'}">${r.correct ? 'Correct' : 'Not quite'}<span class="dot">.</span></div>
<p class="lead">${r.correct ? `+${r.points} point${r.points === 1 ? '' : 's'} (${r.call === 'RDY' ? 'Ready' : 'Assist'})` : 'No points this time'} · ${move}</p>
<p class="stem" style="font-size:18px">${esc(q.stem)}</p>
<div class="opts">${opts}</div>
<p class="lead" style="margin-top:14px">${esc(q.explanation)}</p>
</section>
<section class="panel"><div class="eyebrow">Next</div>
<p class="lead">Swap one card and tap again, or re-tap the Depth card.</p>
<form method="post" action="/next" style="margin-top:12px"><button class="btn">Next question</button></form></section>`;
    }
  }
  return '';
}

function devBar(set) {
  const links = [
    ['s', 'SCI', 'Science'], ['p', 'DEP', 'Depth'], ['k', 'RDY', 'Ready'], ['k', 'AST', 'Assist'], ['k', 'PAS', 'Pass'], ['r', 'R', 'Rules'], ['s', 'ENG', 'English (off)'],
  ]
    .map(([k, c, n]) => `<a href="${tapPath(k, c, set)}">${esc(n)}</a>`)
    .join('');
  return `<nav class="devbar"><b>DEV TAP</b>${links}<a href="/dev">Tools</a></nav>`;
}

function playPage(s, { devTools }) {
  const n = s.notice ? `<div class="notice ${s.notice.tone}" role="status">${esc(s.notice.text)}</div>` : '';
  return layout(
    'Drona Deck',
    `<main class="screen">${header(s)}${n}${slots(s)}${phaseBody(s)}</main>${devTools ? devBar(1) : ''}`,
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

module.exports = { playPage, unknownCardPage, notFoundPage, devIndexPage, devDeckPage, devCodesPage, devLogPage };
