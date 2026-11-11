const http = require('node:http');
const defaults = require('./config');
const engine = require('../engine');
const { parseTapPath, codeMap } = require('./codes');
const { SessionStore } = require('./sessions');
const { TapLog } = require('./tapLog');
const state = require('./state');
const views = require('./views');
const { buildReport, ReportStore } = require('./report');

const SCREEN_ACTIONS = new Set(['/difficulty', '/answer', '/estimate', '/goto', '/new']);

const COOKIE = 'drona_sid';
const STATION_COOKIE = 'drona_station';

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

  // On-screen buttons (difficulty, answers, estimate, end screens) post here.
  function screenAction(s, p, body) {
    switch (p) {
      case '/difficulty':
        return state.chooseDifficulty(s, body.get('level'), engine);
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

  function loadSession(req, res, t) {
    const sid = parseCookies(req.headers.cookie)[COOKIE];
    const loaded = sessions.load(sid, t);
    if (loaded.isNew) {
      addCookie(res, `${COOKIE}=${loaded.session.sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    }
    if (loaded.expired) {
      loaded.session.notice = { tone: 'info', text: 'That game timed out, so a fresh one has started.' };
    }
    return loaded;
  }

  function handleTap(req, res, url, tap) {
    const t = now();
    const { session: s, expired } = loadSession(req, res, t);
    const entry = {
      ts: new Date(t).toISOString(),
      sid: s.sid,
      path: url.pathname,
      kind: tap.kind,
      code: tap.code,
      set: tap.set,
      setRaw: tap.set ? undefined : tap.setRaw,
      source: url.searchParams.get('src') === 'button' ? 'button' : 'tag',
      expired: expired || undefined,
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

    tapLog.add({ ...entry, outcome, phase: s.phase, level: s.level });
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
      station = /^[1-3]$/.test(station || '') ? Number(station) : null;
      const { session: s } = loadSession(req, res, now());
      const report = s.reportId ? reports.get(s.reportId) : null;
      const reportUrl = report ? `${cfg.BASE_URL}/report/${report.id}` : null;
      const html = views.playPage(s, { devTools: cfg.DEV_TOOLS, station, report, reportUrl });
      s.notice = null; // notices show once
      return send(res, 200, html);
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
      tapLog.add({ ts: new Date(t).toISOString(), sid: s.sid, path: p, outcome, phase: s.phase, level: s.level });
      return redirect(res, '/play');
    }

    // Shareable report: opened on the visitor's own phone from the QR code, WhatsApp or email link.
    const reportMatch = /^\/report\/([A-Za-z0-9_-]{4,32})\/?$/.exec(p);
    if (method === 'GET' && reportMatch) {
      const report = reports.get(reportMatch[1]);
      if (!report) return send(res, 404, views.reportMissingPage());
      return send(res, 200, views.reportPage(report, { url: `${cfg.BASE_URL}/report/${report.id}` }));
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

  return { server, sessions, tapLog, reports, cfg };
}

module.exports = { createApp };
