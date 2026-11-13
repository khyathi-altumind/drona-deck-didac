const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server/app');
const { codeMap } = require('../server/codes');

// Boots the real HTTP server on a random port with a controllable clock.
async function boot(overrides = {}) {
  const clock = { t: 1_000_000 };
  const app = createApp({ LOG_FILE: null, REPORT_FILE: null, DEV_TOOLS: true, DEBOUNCE_MS: 2000, IDLE_TIMEOUT_MS: 60_000, BASE_URL: 'https://drona.example', now: () => clock.t, ...overrides });
  await new Promise((r) => app.server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  return { app, base, clock, close: () => new Promise((r) => app.server.close(r)) };
}

// A tiny browser: keeps the cookie, does not follow redirects automatically.
function browser(base, clock) {
  const jar = new Map();
  async function req(path, opts = {}) {
    const cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
    const res = await fetch(base + path, { redirect: 'manual', ...opts, headers: { ...(opts.headers || {}), cookie } });
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(';');
      const i = pair.indexOf('=');
      jar.set(pair.slice(0, i), pair.slice(i + 1));
    }
    return res;
  }
  return {
    // Each tap moves the clock past the debounce window, like a real visitor.
    tap: (path) => { if (clock) clock.t += 3000; return req(path); },
    get: (path) => req(path),
    page: async (path = '/play') => (await req(path)).text(),
    post: (path, form) => req(path, { method: 'POST', body: new URLSearchParams(form).toString(), headers: { 'content-type': 'application/x-www-form-urlencoded' } }),
    state: async () => (await req('/dev/api/state')).json(),
  };
}

// Plays the three questions of a hand, answering each one correctly with Ready.
async function playHandCorrectly(b) {
  for (let i = 0; i < 3; i++) {
    await b.tap('/k/RDY/1');
    const s = await b.state();
    await b.post('/answer', { qid: s.question.id, choice: String(s.question.answer) });
  }
}

test('full booth flow: subject → Easy/Tough card → skill → 3 questions → estimate → result → class → share', async (t) => {
  const { app, base, clock, close } = await boot();
  t.after(close);
  const b = browser(base, clock);

  let res = await b.tap('/s/SCI/1');
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/play');
  let first = await b.page();
  assert.match(first, /Now tap a level card/);
  assert.doesNotMatch(first, /<button[^>]*value="(EASY|TOUGH)"/, 'no on-screen level buttons');
  assert.equal((await b.post('/difficulty', { level: 'EASY' })).status, 404, 'level cannot be picked on screen');

  await b.tap('/d/EASY/1');
  assert.match(await b.page(), /Now tap a skill card/);

  await b.tap('/p/DEP/1');
  let s = await b.state();
  assert.equal(s.phase, 'QUESTION');
  let page = await b.page();
  assert.ok(page.includes(escapeHtml(s.question.stem)), 'question is on the player page');
  assert.match(page, /Question <b>1<\/b> of 3/);

  await playHandCorrectly(b);
  s = await b.state();
  assert.equal(s.phase, 'ESTIMATE');
  page = await b.page();
  assert.match(page, /How many do you think you got right/);
  assert.doesNotMatch(page, /Correct answer/, 'results stay hidden until the estimate');

  await b.post('/estimate', { n: '2' });
  s = await b.state();
  assert.equal(s.phase, 'RESULT');
  assert.ok(s.reportId);
  page = await b.page();
  assert.match(page, /3<small> of 3 correct/);
  assert.match(page, /Better than you thought/);
  assert.match(page, /Compare with the class/);

  await b.post('/goto', { to: 'CLASS' });
  page = await b.page();
  assert.match(page, /Sample data/);
  assert.match(page, /You scored higher than \d+ of 40 pupils/);

  await b.post('/goto', { to: 'SHARE' });
  page = await b.page();
  const url = `https://drona.example/report/${s.reportId}`;
  assert.ok(page.includes(url), 'report link uses BASE_URL');
  assert.match(page, /wa\.me\/\?text=/);
  assert.match(page, /mailto:/);

  const outcomes = app.tapLog.recent(30).reverse().map((e) => e.outcome);
  assert.deepEqual(outcomes.slice(0, 3), ['subject', 'difficulty', 'hand-start']);
  assert.ok(outcomes.includes('estimate') && outcomes.includes('goto-share'));
});

test('the shared report opens on another device without the booth cookie', async (t) => {
  const { app, base, clock, close } = await boot();
  t.after(close);
  const b = browser(base, clock);
  await b.tap('/s/SCI/1');
  await b.tap('/d/TOUGH/1');
  await b.tap('/p/PIV/1');
  await playHandCorrectly(b);
  await b.post('/estimate', { n: '3' });
  const { reportId } = await b.state();

  const phone = await fetch(`${base}/report/${reportId}`);
  assert.equal(phone.status, 200);
  const html = await phone.text();
  assert.match(html, /Quick Hand report/);
  assert.match(html, /Science · Pivot · Tough/);
  assert.match(html, /Spot on/);
  assert.match(html, /Sample data/);
  assert.ok(app.reports.get(reportId));

  assert.equal((await fetch(`${base}/report/doesnotexist`)).status, 404);
});

test('a skill card tapped before the level is remembered', async (t) => {
  const { base, clock, close } = await boot();
  t.after(close);
  const b = browser(base, clock);
  await b.tap('/s/SCI/1');
  await b.tap('/p/UNT/1');
  assert.match(await b.page(), /Untangle saved/);
  await b.tap('/d/EASY/1');
  const s = await b.state();
  assert.equal(s.phase, 'QUESTION');
  assert.equal(s.question.skill, 'UNT');
});

test('set number is logged on every tap but does not change the flow', async (t) => {
  const { app, base, clock, close } = await boot();
  t.after(close);
  const b = browser(base, clock);
  await b.tap('/s/SCI/2');
  await b.tap('/d/EASY/2');
  await b.tap('/p/DEP/3');
  await b.tap('/k/AST'); // no set number at all
  await b.tap('/k/PAS/x9'); // garbage set number
  const taps = app.tapLog.recent(10).reverse().filter((e) => e.kind);
  assert.deepEqual(taps.map((e) => e.set ?? null), [2, 2, 3, null, null]);
  assert.equal(taps[4].setRaw, 'x9');
  assert.deepEqual(taps.map((e) => e.outcome), ['subject', 'difficulty', 'hand-start', 'assist', 'pass']);
});

test('repeat reads of the same tag within the debounce window are ignored', async (t) => {
  const { app, base, clock, close } = await boot();
  t.after(close);
  const b = browser(base, clock);
  await b.tap('/s/SCI/1');
  await b.tap('/d/EASY/1');
  await b.tap('/p/DEP/1');
  await b.tap('/k/PAS/1');
  const q2 = (await b.state()).question.id;
  clock.t += 500;
  await b.get('/k/PAS/1'); // same tag again, 0.5 s later
  assert.equal(app.tapLog.recent(1)[0].outcome, 'debounced');
  assert.equal((await b.state()).question.id, q2);
});

test('inactive and unknown cards', async (t) => {
  const { app, base, clock, close } = await boot();
  t.after(close);
  const b = browser(base, clock);

  const res = await b.tap('/s/ENG/1');
  assert.equal(res.status, 303);
  assert.match(await b.page(), /isn’t live at this booth/);

  const unknown = await b.tap('/p/XYZ/1');
  assert.equal(unknown.status, 404);
  assert.match(await unknown.text(), /don’t recognise this card/);
  assert.equal(app.tapLog.recent(1)[0].outcome, 'unknown-card');
});

test('codes are case-insensitive and trailing slashes are fine', async (t) => {
  const { base, clock, close } = await boot();
  t.after(close);
  const b = browser(base, clock);
  await b.tap('/s/civ/1/');
  await b.tap('/d/EASY/1');
  await b.tap('/p/Str/1');
  assert.equal((await b.state()).phase, 'QUESTION');
});

test('idle timeout starts a fresh game', async (t) => {
  const { base, clock, close } = await boot({ IDLE_TIMEOUT_MS: 60_000 });
  t.after(close);
  const b = browser(base, clock);
  await b.tap('/s/SCI/1');
  await b.tap('/d/EASY/1');
  clock.t += 61_000;
  await b.tap('/s/SCI/1');
  const s = await b.state();
  assert.equal(s.phase, 'DIFFICULTY');
  assert.equal(s.subject, 'SCI');
  assert.equal(s.difficulty, null, 'old level choice is gone');
});

test('stale answer forms are ignored', async (t) => {
  const { base, clock, close } = await boot();
  t.after(close);
  const b = browser(base, clock);
  await b.tap('/s/SCI/1');
  await b.tap('/d/EASY/1');
  await b.tap('/p/DEP/1');
  await b.tap('/k/RDY/1');
  await b.post('/answer', { qid: 'SCI-DEP-nope', choice: '0' });
  assert.equal((await b.state()).phase, 'ANSWERING');
});

test('New player and the Rules card reset; dev tools can be switched off', async (t) => {
  const { base, clock, close } = await boot({ DEV_TOOLS: false });
  t.after(close);
  const b = browser(base, clock);
  await b.tap('/s/SCI/1');
  await b.post('/new', {});
  assert.match(await b.page(), /New player/);
  await b.tap('/s/SCI/1');
  const res = await b.tap('/r/1');
  assert.equal(res.status, 303);
  const page = await b.page();
  assert.match(page, /The Drona Deck/);
  assert.doesNotMatch(page, /DEV TAP/);
  assert.equal((await b.get('/dev/deck')).status, 404);
});

test('call button box: station is remembered and button presses are logged as such', async (t) => {
  const { app, base, clock, close } = await boot();
  t.after(close);
  const b = browser(base, clock);

  let page = await b.page('/play?set=2');
  assert.match(page, /Station 2/);
  assert.match(page, /var station = 2;/);
  page = await b.page();
  assert.match(page, /Station 2/, 'station survives without the query string');
  assert.match(page, /\/k\/RDY\/2/, 'dev bar uses the station set');

  await b.tap('/s/SCI/2');
  page = await b.page();
  assert.doesNotMatch(page, /data-key="[et]"/, 'no keyboard shortcut for the level');
  await b.tap('/d/EASY/2');
  await b.tap('/p/DEP/2');
  // What the page script requests when the READY button (R key) is pressed.
  await b.tap('/k/RDY/2?src=button');
  const last = app.tapLog.recent(1)[0];
  assert.equal(last.outcome, 'ready');
  assert.equal(last.source, 'button');
  assert.equal(last.set, 2);
  assert.equal((await b.state()).phase, 'ANSWERING');

  page = await b.page();
  assert.match(page, /<button class="opt" name="choice" value="0" data-key="1">/, 'answer buttons are present for keys 1-4');
});

test('code map has all 39 tag URLs in the print-kit format, with Science and Civics live', async (t) => {
  const rows = codeMap('https://drona.example');
  assert.equal(rows.length, 39);
  const urls = rows.map((r) => r.url);
  assert.ok(urls.includes('https://drona.example/s/SCI/1'));
  assert.ok(urls.includes('https://drona.example/s/CIV/1'));
  assert.ok(!urls.some((u) => u.includes('/s/HIS/')), 'History is not in the code map');
  assert.ok(urls.includes('https://drona.example/d/EASY/1'));
  assert.ok(urls.includes('https://drona.example/d/TOUGH/3'));
  assert.ok(urls.includes('https://drona.example/p/PIV/2'));
  assert.ok(urls.includes('https://drona.example/k/RDY/3'));
  assert.ok(urls.includes('https://drona.example/r/1'));
  assert.deepEqual([...new Set(rows.filter((r) => !r.active).map((r) => r.code))], ['ENG']);
  // NTAG213 holds ~132 bytes of URL; keep a wide margin.
  assert.ok(urls.every((u) => Buffer.byteLength(u) < 100));

  const { base, close } = await boot();
  t.after(close);
  const csv = await (await fetch(base + '/dev/codes.csv')).text();
  assert.equal(csv.trim().split('\n').length, 40);
});

test('Civics flow over HTTP: subject → Tough card → skill → questions 4, 5, 6 → estimate', async (t) => {
  const { base, clock, close } = await boot();
  t.after(close);
  const b = browser(base, clock);
  await b.tap('/s/CIV/1');
  assert.match(await b.page(), /Now tap a level card/);
  await b.tap('/d/TOUGH/1');
  await b.tap('/p/DEP/1');
  const levels = [];
  for (let i = 0; i < 3; i++) {
    const s = await b.state();
    levels.push(s.question.level);
    const page = await b.page();
    assert.ok(page.includes(escapeHtml(s.question.stem)), 'question is on the player page');
    if (s.question.context) assert.ok(page.includes(escapeHtml(s.question.context)), 'stimulus is on the player page');
    await b.tap('/k/RDY/1');
    await b.post('/answer', { qid: s.question.id, choice: String(s.question.answer) });
  }
  assert.deepEqual(levels, [4, 5, 6]);
  assert.equal((await b.state()).phase, 'ESTIMATE');
});

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
