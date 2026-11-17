// Minimal SMTP client on Node's built-in net/tls, so the booth stays dependency-free.
// Works with any SMTP account (Gmail/Workspace app password, Zoho, Outlook, Amazon SES SMTP, ...):
//   port 465 → TLS from the start (SMTP_SECURE=true), port 587 → STARTTLS upgrade.
// Sends one message to one recipient: multipart/alternative with a plain-text and an HTML part.

const net = require('node:net');
const tls = require('node:tls');
const crypto = require('node:crypto');
const os = require('node:os');

// Strict enough to block header injection (no spaces, CR/LF, <, >, commas) and obvious typos.
const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
function validEmail(v) {
  return typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v);
}

// "Drona <reports@x.com>" → "reports@x.com"
function addressOf(from) {
  const m = /<([^>]+)>/.exec(from);
  return (m ? m[1] : from).trim();
}

function b64Lines(text) {
  return Buffer.from(text, 'utf8').toString('base64').replace(/.{76}/g, '$&\r\n');
}

function buildMessage({ from, to, subject, text, html }) {
  const boundary = `drona-${crypto.randomBytes(9).toString('hex')}`;
  const domain = addressOf(from).split('@')[1] || 'localhost';
  return [
    `From: ${from}`,
    `To: <${to}>`,
    `Subject: =?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64Lines(text),
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64Lines(html),
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

async function smtpSend(cfg, msg) {
  let socket;
  let buf = '';
  let lines = [];
  const queue = [];
  let waiter = null;
  let failure = null;

  function onData(chunk) {
    buf += chunk;
    let i;
    while ((i = buf.indexOf('\r\n')) !== -1) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 2);
      lines.push(line);
      if (/^\d{3}(?: |$)/.test(line)) {
        const reply = { code: Number(line.slice(0, 3)), text: lines.join(' | ') };
        lines = [];
        if (waiter) { const w = waiter; waiter = null; w.resolve(reply); } else queue.push(reply);
      }
    }
  }
  function onError(err) {
    failure = err;
    if (waiter) { const w = waiter; waiter = null; w.reject(err); }
  }
  function attach(s) {
    s.setEncoding('utf8');
    s.setTimeout(cfg.SMTP_TIMEOUT_MS || 15000, () => s.destroy(new Error('SMTP server stopped responding')));
    s.on('data', onData);
    s.on('error', onError);
    s.on('close', () => onError(failure || new Error('SMTP connection closed')));
  }
  const read = () => {
    if (queue.length) return Promise.resolve(queue.shift());
    if (failure) return Promise.reject(failure);
    return new Promise((resolve, reject) => { waiter = { resolve, reject }; });
  };
  async function step(line, okCodes, label = line) {
    if (line !== null) socket.write(`${line}\r\n`);
    const reply = await read();
    if (!okCodes.includes(reply.code)) throw new Error(`SMTP ${String(label).split(' ')[0]} failed: ${reply.text}`);
    return reply;
  }

  const host = cfg.SMTP_HOST;
  const port = cfg.SMTP_PORT;
  const hello = `EHLO ${os.hostname().replace(/[^A-Za-z0-9.-]/g, '') || 'localhost'}`;
  socket = cfg.SMTP_SECURE ? tls.connect({ host, port, servername: host }) : net.connect({ host, port });
  attach(socket);
  try {
    await step(null, [220], 'greeting');
    let ehlo = await step(hello, [250]);
    // Upgrade whenever the server offers it. Without STARTTLS, only a no-login relay is allowed:
    // a password is never sent in clear text.
    if (!cfg.SMTP_SECURE && (/STARTTLS/i.test(ehlo.text) || cfg.SMTP_USER)) {
      if (!/STARTTLS/i.test(ehlo.text)) throw new Error('SMTP server does not offer STARTTLS; refusing to send the password in clear text');
      await step('STARTTLS', [220]);
      const plain = socket;
      plain.removeAllListeners('data');
      plain.removeAllListeners('close');
      socket = tls.connect({ socket: plain, servername: host });
      attach(socket);
      await new Promise((resolve, reject) => { socket.once('secureConnect', resolve); socket.once('error', reject); });
      ehlo = await step(hello, [250]);
    }
    if (cfg.SMTP_USER) {
      await step('AUTH LOGIN', [334]);
      await step(Buffer.from(cfg.SMTP_USER).toString('base64'), [334], 'AUTH user');
      await step(Buffer.from(cfg.SMTP_PASS || '').toString('base64'), [235], 'AUTH password');
    }
    await step(`MAIL FROM:<${addressOf(cfg.MAIL_FROM)}>`, [250]);
    await step(`RCPT TO:<${msg.to}>`, [250, 251]);
    await step('DATA', [354]);
    const data = buildMessage({ from: cfg.MAIL_FROM, ...msg }).replace(/^\./gm, '..');
    await step(`${data}\r\n.`, [250], 'DATA body');
    socket.write('QUIT\r\n');
  } finally {
    socket.end();
    setTimeout(() => socket.destroy(), 1000).unref();
  }
}

// Returns null when SMTP is not configured: addresses are still saved, nothing is sent.
function createMailer(cfg) {
  if (!cfg.SMTP_HOST) return null;
  const timeoutMs = cfg.SMTP_TIMEOUT_MS || 15000;
  return {
    send(msg) {
      if (!validEmail(msg.to)) return Promise.reject(new Error('invalid recipient'));
      let timer;
      const timeout = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('SMTP timed out')), timeoutMs); });
      return Promise.race([smtpSend(cfg, msg), timeout]).finally(() => clearTimeout(timer));
    },
  };
}

module.exports = { createMailer, validEmail, buildMessage };
