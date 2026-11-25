const http = require('node:http');
const defaults = require('./config');
const engine = require('../engine');
const { parseTapPath, codeMap } = require('./codes');
const { SessionStore } = require('./sessions');
const { TapLog } = require('./tapLog');
const state = require('./state');
const views = require('./views');
const { buildReport, ReportStore } = require('./report');
const { EmailStore } = require('./emails');
const { createMailer, validEmail } = require('./mailer');
const { createSheet } = require('./sheet');

// Shows enough of an address on the shared booth screen to confirm it, not enough for the next visitor to read it.
function maskEmail(email) {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 2)}${'•'.repeat(Math.max(1, Math.min(6, user.length - 2)))}@${domain}`;
}

// A visitor's name: 1-80 characters, no control characters (it goes into the email greeting).
function cleanName(v) {
  const name = String(v || '').trim().replace(/\s+/g, ' ');
  return name.length >= 1 && name.length <= 80 && !/[\u0000-\u001f\u007f<>]/.test(name) ? name : null;
}

// A phone number: 7-15 digits, an optional leading +; spaces, dashes, dots and brackets are dropped.
function cleanPhone(v) {
  const phone = String(v || '').trim().replace(/[\s().-]/g, '');
  return /^\+?\d{7,15}$/.test(phone) ? phone : null;
}

const INVALID = new Set(['invalid', 'invalid-name', 'invalid-phone']);

const SCREEN_ACTIONS = new Set(['/answer', '/estimate', '/goto', '/new']);

const COOKIE = 'drona_sid';
const STATION_COOKIE = 'drona_station';
// Set on a laptop opened at /screen/N: that browser shows station N's game, and card taps from a phone
// (tag URLs end in /N) are played there instead of on the phone. See "Laptop screen" in the README.
const SCREEN_COOKIE = 'drona_screen';
const HEARTBEAT_MS = 20_000;

function addCookie(res, cookie) {
  const prev = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', prev ? [].concat(prev, cookie) : cookie);
}

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function readBody(req, limit = 10_000) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > limit) reject(new Error('body too large'));
    });
    req.on('end', () => resolve(new URLSearchParams(data)));
    req.on('error', reject);
  });
}

function createApp(overrides = {}) {
  const cfg = { ...defaults, ...overrides };
  const now = overrides.now || Date.now;
  const sessions = new SessionStore({ idleTimeoutMs: cfg.IDLE_TIMEOUT_MS });
  const tapLog = new TapLog({ file: cfg.LOG_FILE });
  const reports = new ReportStore({ file: cfg.REPORT_FILE });
  const emails = new EmailStore({ file: cfg.EMAIL_FILE });
  // Tests pass a fake mailer; null means SMTP is not set up (addresses are saved, nothing is sent).
  const mailer = 'mailer' in overrides ? overrides.mailer : createMailer(cfg);
  // Tests pass a fake sheet; null means no Google Sheet is set up (details stay in logs/emails.jsonl only).
  const sheet = 'sheet' in overrides ? overrides.sheet : createSheet(cfg);

  // Adds the visitor to the Google Sheet once the send result is known. A sheet error never blocks the visitor.
  async function toSheet(report, rec) {
    if (!sheet) return;
    try {
      await sheet.add({
        time: new Date(rec.ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        name: rec.name, phone: rec.phone, email: rec.email,
        subject: report.subject.name, skill: report.skill.name, level: report.difficulty.name,
        score: `${report.correct}/${report.total}`, guess: report.estimate,
        status: rec.status, source: rec.source, report: `${cfg.BASE_URL}/report/${report.id}`,
      });
      emails.update(rec.id, { sheet: 'saved' });
    } catch (err) {
      console.error('[sheet] save failed:', err.message);
      emails.update(rec.id, { sheet: 'failed', sheetError: err.message });
    }
  }

  // Checks and saves the visitor's name, phone and email. Returns { error } (a MAIL_RESULT key) or { rec }.
  function saveContact(report, body, source) {
    const name = cleanName(body.get('name'));
    if (!name) return { error: 'invalid-name' };
    const phone = cleanPhone(body.get('phone'));
    if (!phone) return { error: 'invalid-phone' };
    const email = String(body.get('email') || '').trim();
    if (!validEmail(email)) return { error: 'invalid' };
    if (emails.countFor(report.id) >= cfg.EMAILS_PER_REPORT) return { error: 'limit' };
    return { rec: emails.add({ reportId: report.id, name, phone, email, source, ts: new Date(now()).toISOString() }) };
  }

  // Saves the visitor's details first, then emails them the report over SMTP. Returns a MAIL_RESULT key.
  async function emailReport(report, body, source) {
    const { error, rec } = saveContact(report, body, source);
    if (error) return error;
    const outcome = await sendReport(report, rec);
    await toSheet(report, rec);
    return outcome;
  }

  async function sendReport(report, rec) {
    if (!mailer) {
      emails.update(rec.id, { status: 'not-configured' });
      return 'saved';
    }
    try {
      await mailer.send({ to: rec.email, ...views.reportEmail(report, `${cfg.BASE_URL}/report/${report.id}`, { name: rec.name }) });
      emails.update(rec.id, { status: 'sent', sentAt: new Date(now()).toISOString() });
      return 'sent';
    } catch (err) {
      console.error('[mail] send failed:', err.message);
      emails.update(rec.id, { status: 'failed', error: err.message });
      return 'failed';
    }
  }

  // On-screen buttons (answers, estimate, end screens) post here. Easy/Tough are NFC cards only.
  function screenAction(s, p, body) {
    switch (p) {
      case '/answer':
        // Ignore a stale form (e.g. back button) that belongs to a different question.
        return s.question && body.get('qid') === s.question.id
          ? state.answer(s, Number.parseInt(body.get('choice'), 10), engine)
          : 'answer-stale';
      case '/estimate':
        return state.estimate(s, Number.parseInt(body.get('n'), 10));
      case '/goto':
        return state.goTo(s, body.get('to'));
      case '/new':
        state.resetSession(s);
        s.notice = { tone: 'info', text: 'New player. Tap a subject card to begin.' };
        return 'new-player';
    }
    return 'unknown-action';
  }

  function send(res, status, body, type = 'text/html; charset=utf-8', extra = {}) {
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', ...extra });
    res.end(body);
  }

  // 303 so a refresh of the player page never repeats the tap.
  function redirect(res, location) {
    res.writeHead(303, { Location: location, 'Cache-Control': 'no-store' });
    res.end();
  }

  // ---------- Laptop screens ----------
  // One game per station screen, kept here rather than in the laptop's cookie, so a phone tap and the
  // laptop's own buttons always reach the same game (also after the idle timeout replaces it).
  const stationSids = new Map(); // station number -> session id
  const screenListeners = new Map(); // station number -> Set of open event-stream responses

  const screenOf = (req) => {
    const v = parseCookies(req.headers.cookie)[SCREEN_COOKIE];
    return /^[1-3]$/.test(v || '') ? Number(v) : null;
  };
  const screenLive = (station) => (screenListeners.get(station) || new Set()).size > 0;

  function stationSession(station, t) {
    const loaded = sessions.load(stationSids.get(station), t);
    loaded.session.station = station;
    stationSids.set(station, loaded.session.sid);
    return loaded;
  }

  // Every change to a station's game bumps its version and tells that station's screens to reload.
  function changed(s) {
    s.version = (s.version || 0) + 1;
    if (!s.station) return;
    for (const res of screenListeners.get(s.station) || []) res.write(`data: ${s.version}\n\n`);
  }

  function screenEvents(req, res, station) {
    const { session: s } = stationSession(station, now());
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    // Sent on every (re)connect, so a screen that missed taps while offline catches up at once.
    res.write(`retry: 2000\ndata: ${s.version || 0}\n\n`);
    if (!screenListeners.has(station)) screenListeners.set(station, new Set());
    screenListeners.get(station).add(res);
    const beat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);
    req.on('close', () => {
      clearInterval(beat);
      screenListeners.get(station).delete(res);
    });
  }

  function loadSession(req, res, t) {
    const screen = screenOf(req);
    const loaded = screen ? stationSession(screen, t) : sessions.load(parseCookies(req.headers.cookie)[COOKIE], t);
    if (loaded.isNew && !screen) {
      addCookie(res, `${COOKIE}=${loaded.session.sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    }
    if (loaded.expired) {
      loaded.session.notice = { tone: 'info', text: 'That game timed out, so a fresh one has started.' };
    }
    return loaded;
  }

  function handleTap(req, res, url, tap) {
    const t = now();
    // A phone tapping a card whose station has a laptop screen open plays it on that screen.
    const forward = !screenOf(req) && tap.set && screenLive(tap.set);
    const { session: s, expired } = forward ? stationSession(tap.set, t) : loadSession(req, res, t);
    const entry = {
      ts: new Date(t).toISOString(),
      sid: s.sid,
      path: url.pathname,
      kind: tap.kind,
      code: tap.code,
      set: tap.set,
      setRaw: tap.set ? undefined : tap.setRaw,
      source: ['button', 'screen'].includes(url.searchParams.get('src')) ? url.searchParams.get('src') : 'tag',
      expired: expired || undefined,
      screen: forward || undefined,
      ua: req.headers['user-agent'],
    };

    if (!tap.card) {
      tapLog.add({ ...entry, outcome: 'unknown-card' });
      return send(res, 404, views.unknownCardPage(tap, { devTools: cfg.DEV_TOOLS }));
    }

    // NFC readers can fire the same tag several times while the phone hovers over it.
    const key = `${tap.kind}/${tap.code}`;
    let outcome;
    if (s.lastTap && s.lastTap.key === key && t - s.lastTap.at < cfg.DEBOUNCE_MS) {
      outcome = 'debounced';
    } else {
      try {
        outcome = state.applyTap(s, tap, engine);
      } catch (err) {
        console.error('[engine]', err);
        s.notice = { tone: 'warn', text: 'Couldn’t write a question just now. Please tap the card again.' };
        outcome = 'engine-error';
      }
      s.lastTap = { key, at: t };
    }
    s.updatedAt = t;
    if (outcome !== 'debounced') changed(s);

    tapLog.add({ ...entry, outcome, phase: s.phase, level: s.level });
    if (forward) return send(res, 200, views.sentToScreenPage(tap, { station: tap.set, debounced: outcome === 'debounced' }));
    redirect(res, '/play');
  }

  async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    const p = url.pathname;
    const method = req.method;

    if (method === 'GET' && (p === '/' || p === '/play')) {
      if (p === '/') return redirect(res, '/play');
      // Each booth device is set up once with /play?set=N; button presses are then logged against that station.
      let station = parseCookies(req.headers.cookie)[STATION_COOKIE];
      const setParam = url.searchParams.get('set');
      if (/^[1-3]$/.test(setParam || '')) {
        station = setParam;
        addCookie(res, `${STATION_COOKIE}=${station}; Path=/; SameSite=Lax; Max-Age=31536000`);
      }
      const screen = screenOf(req);
      station = screen || (/^[1-3]$/.test(station || '') ? Number(station) : null);
      const { session: s } = loadSession(req, res, now());
      const report = s.reportId ? reports.get(s.reportId) : null;
      const reportUrl = report ? `${cfg.BASE_URL}/report/${report.id}` : null;
      const html = views.playPage(s, { devTools: cfg.DEV_TOOLS, station, report, reportUrl, screen });
      s.notice = null; // notices show once
      s.showRules = false; // so does the rules pop-up
      s.openForm = false;
      return send(res, 200, html);
    }

    // Laptop screen: /screen/N makes this browser station N's screen; /screen/off undoes it.
    const screenMatch = /^\/screen\/([1-3]|off)\/?$/.exec(p);
    if (method === 'GET' && screenMatch) {
      if (screenMatch[1] === 'off') {
        addCookie(res, `${SCREEN_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`);
        return redirect(res, '/play');
      }
      const n = screenMatch[1];
      addCookie(res, `${SCREEN_COOKIE}=${n}; Path=/; SameSite=Lax; Max-Age=31536000`);
      addCookie(res, `${STATION_COOKIE}=${n}; Path=/; SameSite=Lax; Max-Age=31536000`);
      return redirect(res, '/play');
    }
    if (method === 'GET' && p === '/screen-events') {
      const screen = screenOf(req);
      if (!screen) return send(res, 404, 'Not a station screen', 'text/plain');
      return screenEvents(req, res, screen);
    }

    // Booth share screen: email the report of the hand just played.
    if (method === 'POST' && p === '/email') {
      const t = now();
      const { session: s } = loadSession(req, res, t);
      const body = await readBody(req);
      s.updatedAt = t;
      const report = s.reportId ? reports.get(s.reportId) : null;
      if (!report) {
        s.notice = { tone: 'warn', text: 'Finish a hand first, then you can email its report.' };
        return redirect(res, '/play');
      }
      const outcome = await emailReport(report, body, 'booth');
      const [tone, text] = views.MAIL_RESULT[outcome];
      const who = outcome === 'sent' || outcome === 'saved' || outcome === 'failed' ? ` (${maskEmail(String(body.get('email')).trim())})` : '';
      s.notice = { tone, text: text + who };
      // Re-open the form so the visitor can fix the field. Nothing is prefilled on the shared device.
      s.openForm = INVALID.has(outcome);
      changed(s);
      tapLog.add({ ts: new Date(t).toISOString(), sid: s.sid, path: p, outcome: `email-${outcome}`, phase: s.phase, level: s.level });
      return redirect(res, '/play');
    }

    // Report page on the visitor's own phone. The result goes in the query, never the address.
    const emailMatch = /^\/report\/([A-Za-z0-9_-]{4,32})\/email\/?$/.exec(p);
    if (method === 'POST' && emailMatch) {
      const report = reports.get(emailMatch[1]);
      if (!report) return send(res, 404, views.reportMissingPage());
      const body = await readBody(req);
      const outcome = await emailReport(report, body, 'report-page');
      return redirect(res, `/report/${report.id}?mail=${outcome}#email`);
    }


    if (method === 'POST' && SCREEN_ACTIONS.has(p)) {
      const t = now();
      const { session: s } = loadSession(req, res, t);
      const body = await readBody(req);
      s.updatedAt = t;
      let outcome;
      try {
        outcome = screenAction(s, p, body);
      } catch (err) {
        console.error('[engine]', err);
        s.notice = { tone: 'warn', text: 'Couldn’t load a question just now. Please try again.' };
        outcome = 'engine-error';
      }
      if (outcome === 'estimate') {
        // The hand is finished: build the report once, so the result, class and share screens all use it.
        s.reportId = reports.create(buildReport(s)).id;
      }
      changed(s);
      tapLog.add({ ts: new Date(t).toISOString(), sid: s.sid, path: p, outcome, phase: s.phase, level: s.level });
      return redirect(res, '/play');
    }

    // Shareable report: opened on the visitor's own phone from the QR code or the email link.
    const reportMatch = /^\/report\/([A-Za-z0-9_-]{4,32})\/?$/.exec(p);
    if (method === 'GET' && reportMatch) {
      const report = reports.get(reportMatch[1]);
      if (!report) return send(res, 404, views.reportMissingPage());
      return send(res, 200, views.reportPage(report, { url: `${cfg.BASE_URL}/report/${report.id}`, mail: url.searchParams.get('mail') }));
    }

    if (method === 'GET' && p === '/health') {
      return send(res, 200, JSON.stringify({ ok: true, baseUrl: cfg.BASE_URL }), 'application/json');
    }

    if (method === 'GET' && cfg.DEV_TOOLS && p.startsWith('/dev')) {
      return handleDev(req, res, url);
    }

    if (method === 'GET') {
      const tap = parseTapPath(p);
      if (tap) return handleTap(req, res, url, tap);
    }

    return send(res, 404, views.notFoundPage());
  }

  function handleDev(req, res, url) {
    const p = url.pathname.replace(/\/+$/, '') || '/dev';
    if (p === '/dev') return send(res, 200, views.devIndexPage(cfg.BASE_URL));
    if (p === '/dev/deck') return send(res, 200, views.devDeckPage());
    if (p === '/dev/log') return send(res, 200, views.devLogPage(tapLog.recent(200)));
    if (p === '/dev/emails') return send(res, 200, views.devEmailsPage(emails.recent(500), { baseUrl: cfg.BASE_URL, smtp: Boolean(mailer) }));
    if (p === '/dev/emails.csv') {
      const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = emails.recent(100000).reverse().map((e) => [e.ts, e.name, e.phone, e.email, e.source, e.status, e.error, `${cfg.BASE_URL}/report/${e.reportId}`].map(q).join(','));
      return send(res, 200, ['time,name,phone,email,source,status,error,report', ...rows].join('\n') + '\n', 'text/csv; charset=utf-8', { 'Content-Disposition': 'attachment; filename="drona-contacts.csv"' });
    }
    if (p === '/dev/codes') {
      const set = Number(url.searchParams.get('set')) || null;
      return send(res, 200, views.devCodesPage(codeMap(cfg.BASE_URL), cfg.BASE_URL, set));
    }
    if (p === '/dev/codes.csv') {
      const rows = codeMap(cfg.BASE_URL);
      const csv = ['set,item,type,code,booth,url', ...rows.map((r) => `${r.set},${r.item},${r.type},${r.code},${r.active ? 'live' : 'off'},${r.url}`)].join('\n');
      return send(res, 200, csv + '\n', 'text/csv; charset=utf-8', { 'Content-Disposition': 'attachment; filename="drona-deck-codes.csv"' });
    }
    if (p === '/dev/api/state') {
      const sid = parseCookies(req.headers.cookie)[COOKIE];
      return send(res, 200, JSON.stringify(sessions.get(sid), null, 2), 'application/json');
    }
    if (p === '/dev/api/log') {
      const limit = Math.min(500, Number(url.searchParams.get('limit')) || 50);
      return send(res, 200, JSON.stringify(tapLog.recent(limit)), 'application/json');
    }
    return send(res, 404, views.notFoundPage());
  }

  const server = http.createServer((req, res) => {
    handle(req, res).catch((err) => {
      console.error(err);
      if (!res.headersSent) send(res, 500, 'Something went wrong', 'text/plain');
      else res.end();
    });
  });

  const sweeper = setInterval(() => sessions.sweep(now()), 60_000);
  sweeper.unref();
  server.on('close', () => clearInterval(sweeper));

  // Event streams never end on their own, so end them as soon as the server starts closing
  // (its 'close' event only fires once every connection is gone).
  const closeServer = server.close.bind(server);
  server.close = (cb) => {
    for (const set of screenListeners.values()) for (const r of set) r.end();
    return closeServer(cb);
  };

  return { server, sessions, tapLog, reports, emails, cfg };
}

module.exports = { createApp };
