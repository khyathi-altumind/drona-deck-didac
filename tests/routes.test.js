const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server/app');
const { codeMap } = require('../server/codes');

// Boots the real HTTP server on a random port with a controllable clock.
async function boot(overrides = {}) {
  const clock = { t: 1_000_000 };
  const app = createApp({ LOG_FILE: null, DEV_TOOLS: true, DEBOUNCE_MS: 2000, IDLE_TIMEOUT_MS: 60_000, now: () => clock.t, ...overrides });
  await new Promise((r) => app.server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  return { app, base, clock, close: () => new Promise((r) => app.server.close(r)) };
}

// A tiny browser: keeps the cookie, does not follow redirects automatically.
function browser(base) {
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
    tap: (path) => req(path),
    get: (path) => req(path),
    post: (path, form) => req(path, { method: 'POST', body: new URLSearchParams(form).toString(), headers: { 'content-type': 'application/x-www-form-urlencoded' } }),
    state: async () => (await req('/dev/api/state')).json(),
  };
}

test('full NFC flow: Science → Depth → Ready → answer → result', async (t) => {
  const { app, base, clock, close } = await boot();
  t.after(close);
  const b = browser(base);

  let res = await b.tap('/s/SCI/1');
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), '/play');
  assert.match(res.headers.get('set-cookie'), /drona_sid=/);

  clock.t += 3000;
  await b.tap('/p/DEP/1');
  let s = await b.state();
  assert.equal(s.phase, 'QUESTION');

  const page = await (await b.get('/play')).text();
  assert.ok(page.includes(escapeHtml(s.question.stem)), 'question is on the player page');

  clock.t += 3000;
  await b.tap('/k/RDY/1');
  s = await b.state();
  assert.equal(s.phase, 'ANSWERING');

  res = await b.post('/answer', { qid: s.question.id, choice: String(s.question.answer) });
  assert.equal(res.status, 303);
  s = await b.state();
  assert.equal(s.phase, 'RESULT');
  assert.equal(s.result.correct, true);
  assert.equal(s.level, 2);

  const result = await (await b.get('/play')).text();
  assert.match(result, /Correct/);

  const outcomes = app.tapLog.recent(10).reverse().map((e) => e.outcome);
  assert.deepEqual(outcomes, ['selected', 'question', 'ready', 'answer-correct']);
});

test('set number is logged on every tap but does not change the flow', async (t) => {
  const { app, base, clock, close } = await boot();
  t.after(close);
  const b = browser(base);
  await b.tap('/s/SCI/2');
  clock.t += 3000;
  await b.tap('/p/DEP/3');
  clock.t += 3000;
  await b.tap('/k/AST'); // no set number at all
  clock.t += 3000;
  await b.tap('/k/PAS/x9'); // garbage set number
  const log = app.tapLog.recent(10).reverse();
  assert.deepEqual(log.map((e) => e.set ?? null), [2, 3, null, null]);
  assert.equal(log[3].setRaw, 'x9');
  assert.deepEqual(log.map((e) => e.outcome), ['selected', 'question', 'assist', 'pass']);
});

test('repeat reads of the same tag within the debounce window are ignored', async (t) => {
  const { app, base, clock, close } = await boot();
  t.after(close);
  const b = browser(base);
  await b.tap('/s/SCI/1');
  await b.tap('/p/DEP/1');
  const q1 = (await b.state()).question.id;
  clock.t += 500;
  await b.tap('/p/DEP/1');
  assert.equal(app.tapLog.recent(1)[0].outcome, 'debounced');
  assert.equal((await b.state()).question.id, q1);
});

test('inactive and unknown cards', async (t) => {
  const { app, base, close } = await boot();
  t.after(close);
  const b = browser(base);

  const res = await b.tap('/s/ENG/1');
  assert.equal(res.status, 303);
  const page = await (await b.get('/play')).text();
  assert.match(page, /isn’t live at this booth/);

  const unknown = await b.tap('/p/XYZ/1');
  assert.equal(unknown.status, 404);
  assert.match(await unknown.text(), /don’t recognise this card/);
  assert.equal(app.tapLog.recent(1)[0].outcome, 'unknown-card');
});

test('codes are case-insensitive and trailing slashes are fine', async (t) => {
  const { base, clock, close } = await boot();
  t.after(close);
  const b = browser(base);
  await b.tap('/s/sci/1/');
  clock.t += 3000;
  await b.tap('/p/Dep/1');
  assert.equal((await b.state()).phase, 'QUESTION');
});

test('idle timeout starts a fresh game', async (t) => {
  const { base, clock, close } = await boot({ IDLE_TIMEOUT_MS: 60_000 });
  t.after(close);
  const b = browser(base);
  await b.tap('/s/SCI/1');
  await b.tap('/p/DEP/1');
  clock.t += 61_000;
  await b.tap('/s/SCI/1');
  const s = await b.state();
  assert.equal(s.phase, 'HALF', 'old Depth selection is gone');
  assert.equal(s.skill, null);
});

test('stale answer forms are ignored', async (t) => {
  const { base, clock, close } = await boot();
  t.after(close);
  const b = browser(base);
  await b.tap('/s/SCI/1');
  await b.tap('/p/DEP/1');
  clock.t += 3000;
  await b.tap('/k/RDY/1');
  await b.post('/answer', { qid: 'SCI-DEP-nope', choice: '0' });
  assert.equal((await b.state()).phase, 'ANSWERING');
});

test('Rules card resets and dev tools can be switched off', async (t) => {
  const { base, close } = await boot({ DEV_TOOLS: false });
  t.after(close);
  const b = browser(base);
  await b.tap('/s/SCI/1');
  const res = await b.tap('/r/1');
  assert.equal(res.status, 303);
  const page = await (await b.get('/play')).text();
  assert.match(page, /The Drona Deck/);
  assert.doesNotMatch(page, /DEV TAP/);
  assert.equal((await b.get('/dev/deck')).status, 404);
});

test('call button box: station is remembered and button presses are logged as such', async (t) => {
  const { app, base, clock, close } = await boot();
  t.after(close);
  const b = browser(base);

  let page = await (await b.get('/play?set=2')).text();
  assert.match(page, /Station 2/);
  assert.match(page, /var station = 2;/);
  page = await (await b.get('/play')).text();
  assert.match(page, /Station 2/, 'station survives without the query string');
  assert.match(page, /\/k\/RDY\/2/, 'dev bar uses the station set');

  await b.tap('/s/SCI/2');
  clock.t += 3000;
  await b.tap('/p/DEP/2');
  clock.t += 3000;
  // What the page script requests when the READY button (R key) is pressed.
  await b.tap('/k/RDY/2?src=button');
  const last = app.tapLog.recent(1)[0];
  assert.equal(last.outcome, 'ready');
  assert.equal(last.source, 'button');
  assert.equal(last.set, 2);
  assert.equal(app.tapLog.recent(2)[1].source, 'tag');
  assert.equal((await b.state()).phase, 'ANSWERING');

  page = await (await b.get('/play')).text();
  assert.match(page, /<button class="opt" name="choice" value="0">/, 'answer buttons are present for keys 1-4');
});

test('code map has all 33 tag URLs in the print-kit format', async (t) => {
  const rows = codeMap('https://drona.example');
  assert.equal(rows.length, 33);
  const urls = rows.map((r) => r.url);
  assert.ok(urls.includes('https://drona.example/s/SCI/1'));
  assert.ok(urls.includes('https://drona.example/p/DEP/2'));
  assert.ok(urls.includes('https://drona.example/k/RDY/3'));
  assert.ok(urls.includes('https://drona.example/r/1'));
  // NTAG213 holds ~132 bytes of URL; keep a wide margin.
  assert.ok(urls.every((u) => Buffer.byteLength(u) < 100));

  const { base, close } = await boot({ BASE_URL: 'https://drona.example' });
  t.after(close);
  const csv = await (await fetch(base + '/dev/codes.csv')).text();
  assert.equal(csv.trim().split('\n').length, 34);
});

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
