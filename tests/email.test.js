const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server/app');
const { validEmail, buildMessage } = require('../server/mailer');

// Records what would have been sent; `fail` makes the next sends throw.
function fakeMailer() {
  const sent = [];
  return { sent, fail: false, async send(msg) { if (this.fail) throw new Error('smtp down'); sent.push(msg); } };
}

async function boot(overrides = {}) {
  const clock = { t: 1_000_000 };
  const app = createApp({ LOG_FILE: null, REPORT_FILE: null, EMAIL_FILE: null, mailer: null, DEV_TOOLS: true, BASE_URL: 'https://drona.example', now: () => clock.t, ...overrides });
  await new Promise((r) => app.server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  return { app, base, clock, close: () => new Promise((r) => app.server.close(r)) };
}

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
    tap: (path) => { clock.t += 3000; return req(path); },
    page: async (path = '/play') => (await req(path)).text(),
    post: (path, form) => req(path, { method: 'POST', body: new URLSearchParams(form).toString(), headers: { 'content-type': 'application/x-www-form-urlencoded' } }),
    state: async () => (await req('/dev/api/state')).json(),
  };
}

const who = { name: 'Asha', phone: '9876543210' };

async function finishHand(b) {
  await b.tap('/s/SCI/1');
  await b.tap('/d/EASY/1');
  await b.tap('/p/DEP/1');
  for (let i = 0; i < 3; i++) {
    await b.tap('/k/RDY/1');
    const s = await b.state();
    await b.post('/answer', { qid: s.question.id, choice: String(s.question.answer) });
  }
  await b.post('/estimate', { n: '2' });
  await b.post('/goto', { to: 'SHARE' });
  return (await b.state()).reportId;
}

test('booth: the address is saved, then the report is sent to it', async (t) => {
  const mailer = fakeMailer();
  const { app, base, clock, close } = await boot({ mailer });
  t.after(close);
  const b = browser(base, clock);
  const reportId = await finishHand(b);

  const res = await b.post('/email', { name: ' Asha  Rao ', phone: '+91 98765-43210', email: '  student.one@example.com ' });
  assert.equal(res.status, 303);
  const [rec] = app.emails.recent();
  assert.equal(rec.email, 'student.one@example.com');
  assert.equal(rec.name, 'Asha Rao');
  assert.equal(rec.phone, '+919876543210');
  assert.equal(rec.reportId, reportId);
  assert.match(mailer.sent[0].html, /Hi Asha Rao/);
  assert.equal(rec.status, 'sent');
  assert.equal(mailer.sent.length, 1);
  assert.equal(mailer.sent[0].to, 'student.one@example.com');
  assert.match(mailer.sent[0].html, /Thinking depth/);
  assert.ok(mailer.sent[0].html.includes(`https://drona.example/report/${reportId}`));

  const page = await b.page();
  assert.match(page, /Report sent/);
  assert.doesNotMatch(page, /student\.one@example\.com/, 'the full address is not shown on the shared booth screen');
  assert.match(page, /st•+@example\.com/);
});

test('booth: a bad address is rejected and nothing is saved or sent', async (t) => {
  const mailer = fakeMailer();
  const { app, base, clock, close } = await boot({ mailer });
  t.after(close);
  const b = browser(base, clock);
  await finishHand(b);
  for (const email of ['not-an-email', 'a@b', 'x@example.com\r\nBcc: victim@example.com', '']) {
    await b.post('/email', { ...who, email });
  }
  assert.equal(app.emails.recent().length, 0);
  assert.equal(mailer.sent.length, 0);
  assert.match(await b.page(), /doesn’t look right/);
});

test('booth: a missing name or a bad phone is rejected and the form re-opens', async (t) => {
  const mailer = fakeMailer();
  const { app, base, clock, close } = await boot({ mailer });
  t.after(close);
  const b = browser(base, clock);
  await finishHand(b);
  await b.post('/email', { name: '  ', phone: '9876543210', email: 'a@example.com' });
  assert.match(await b.page(), /Please enter your name/);
  await b.post('/email', { name: 'Asha', phone: '12ab', email: 'a@example.com' });
  const page = await b.page();
  assert.match(page, /phone number doesn’t look right/);
  assert.match(page, /data-open="1"/);
  assert.match(await b.page(), /data-open=""/, 'the form re-opens only once');
  assert.equal(app.emails.recent().length, 0);
  assert.equal(mailer.sent.length, 0);

  await b.post('/email', { ...who, email: 'a@example.com' });
  const csv = await (await fetch(`${base}/dev/emails.csv`)).text();
  assert.match(csv, /^time,name,phone,email,/);
  assert.match(csv, /"Asha","9876543210","a@example\.com"/);
});

test('booth: without a finished hand there is nothing to email', async (t) => {
  const mailer = fakeMailer();
  const { app, base, clock, close } = await boot({ mailer });
  t.after(close);
  const b = browser(base, clock);
  await b.tap('/s/SCI/1');
  await b.post('/email', { ...who, email: 'a@example.com' });
  assert.equal(app.emails.recent().length, 0);
  assert.match(await b.page(), /Finish a hand first/);
});

test('a failed send keeps the saved address and marks it failed', async (t) => {
  const mailer = fakeMailer();
  mailer.fail = true;
  const { app, base, clock, close } = await boot({ mailer });
  t.after(close);
  const b = browser(base, clock);
  await finishHand(b);
  await b.post('/email', { ...who, email: 'a@example.com' });
  const [rec] = app.emails.recent();
  assert.equal(rec.status, 'failed');
  assert.equal(rec.error, 'smtp down');
  assert.match(await b.page(), /sending failed just now/);
});

test('without SMTP set up the address is still saved', async (t) => {
  const { app, base, clock, close } = await boot({ mailer: null });
  t.after(close);
  const b = browser(base, clock);
  await finishHand(b);
  await b.post('/email', { ...who, email: 'a@example.com' });
  assert.equal(app.emails.recent()[0].status, 'not-configured');
  assert.match(await b.page(), /Details saved/);
  const dev = await (await fetch(`${base}/dev/emails`)).text();
  assert.match(dev, /a@example\.com/);
});

test('phone: the report page emails its own report, and each report is capped', async (t) => {
  const mailer = fakeMailer();
  const { app, base, clock, close } = await boot({ mailer, EMAILS_PER_REPORT: 2 });
  t.after(close);
  const reportId = await finishHand(browser(base, clock));

  const post = (email) => fetch(`${base}/report/${reportId}/email`, { method: 'POST', redirect: 'manual', body: new URLSearchParams({ ...who, email }).toString(), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  let res = await post('parent@example.com');
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('location'), `/report/${reportId}?mail=sent#email`);
  assert.doesNotMatch(res.headers.get('location'), /parent/, 'the address never goes into the URL');
  assert.match(await (await fetch(base + res.headers.get('location'))).text(), /Report sent/);

  await post('b@example.com');
  res = await post('c@example.com');
  assert.equal(res.headers.get('location'), `/report/${reportId}?mail=limit#email`);
  assert.equal(mailer.sent.length, 2);
  assert.equal(app.emails.recent()[0].source, 'report-page');

  const missing = await fetch(`${base}/report/nope1234/email`, { method: 'POST', body: 'email=a%40example.com', headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  assert.equal(missing.status, 404);
});

test('address check and message format', () => {
  assert.ok(validEmail('first.last+tag@school.edu.in'));
  for (const bad of ['', 'a@b', 'a b@example.com', 'a@example.com\nBcc: x@y.com', '<a@example.com>', 'a@example.com,b@example.com']) assert.ok(!validEmail(bad), bad);
  const msg = buildMessage({ from: 'Drona <reports@drona.example>', to: 'a@example.com', subject: 'Your report · Science', text: 'hi', html: '<p>hi</p>' });
  assert.match(msg, /^From: Drona <reports@drona\.example>\r\nTo: <a@example\.com>\r\nSubject: =\?UTF-8\?B\?/);
  assert.match(msg, /multipart\/alternative/);
  assert.match(msg, /text\/plain; charset=utf-8[\s\S]*text\/html; charset=utf-8/);
});


test('each visitor is added to the Google Sheet with the send result; a sheet error does not block them', async (t) => {
  const mailer = fakeMailer();
  const rows = [];
  const sheet = { fail: false, async add(row) { if (this.fail) throw new Error('sheet down'); rows.push(row); } };
  const { app, base, clock, close } = await boot({ mailer, sheet });
  t.after(close);
  const b = browser(base, clock);
  const reportId = await finishHand(b);

  await b.post('/email', { name: 'Asha Rao', phone: '+91 98765 43210', email: 'a@example.com' });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Asha Rao');
  assert.equal(rows[0].phone, '+919876543210');
  assert.equal(rows[0].email, 'a@example.com');
  assert.equal(rows[0].status, 'sent');
  assert.equal(rows[0].subject, 'Science');
  assert.equal(rows[0].score, '3/3');
  assert.equal(rows[0].report, `https://drona.example/report/${reportId}`);
  assert.equal(app.emails.recent()[0].sheet, 'saved');

  await b.post('/email', { name: 'Not Valid', phone: '1', email: 'b@example.com' });
  assert.equal(rows.length, 1, 'invalid details never reach the sheet');

  sheet.fail = true;
  await b.post('/email', { ...who, email: 'c@example.com' });
  assert.equal(app.emails.recent()[0].sheet, 'failed');
  assert.equal(app.emails.recent()[0].status, 'sent', 'the report is still sent');
  assert.match(await b.page(), /Report sent/);
});
