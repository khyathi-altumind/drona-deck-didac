const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Local secrets (SMTP login) live in didac/.env, which git ignores. Real environment variables win,
// so Render's dashboard settings override the file. Lines: KEY=value, # comments, optional quotes.
function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(raw);
    if (!m || raw.trim().startsWith('#')) continue;
    const value = m[2].replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}
loadDotEnv(path.join(__dirname, '..', '.env'));

// First non-internal IPv4 address, so phones on the same Wi-Fi can reach the dev server.
function lanIp() {
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family === 'IPv4' && !a.internal) return a.address;
    }
  }
  return 'localhost';
}

const PORT = Number(process.env.PORT) || 4300;

module.exports = {
  PORT,
  HOST: process.env.HOST || '0.0.0.0',
  // The domain written onto the NFC tags and QR codes. Set this to the real https domain before writing tags.
  // On Render, RENDER_EXTERNAL_URL is the service's public https URL.
  BASE_URL: (process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || `http://${lanIp()}:${PORT}`).replace(/\/+$/, ''),
  // A shared booth device starts a fresh game after this much inactivity.
  IDLE_TIMEOUT_MS: Number(process.env.IDLE_TIMEOUT_MS) || 3 * 60 * 1000,
  // Repeat reads of the same tag inside this window are ignored.
  DEBOUNCE_MS: Number(process.env.DEBOUNCE_MS) || 2000,
  // Simulator, code map and tap-log pages. Turn off at the booth with DEV_TOOLS=false.
  DEV_TOOLS: process.env.DEV_TOOLS !== 'false',
  LOG_FILE: process.env.LOG_FILE || path.join(__dirname, '..', 'logs', 'taps.jsonl'),
  // Finished-hand reports, so shared report links keep working after a restart.
  REPORT_FILE: process.env.REPORT_FILE || path.join(__dirname, '..', 'logs', 'reports.jsonl'),
  // Visitor email addresses (saved before the report is emailed).
  EMAIL_FILE: process.env.EMAIL_FILE || path.join(__dirname, '..', 'logs', 'emails.jsonl'),
  // Outgoing mail. Without SMTP_HOST, addresses are still saved but nothing is sent.
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : Number(process.env.SMTP_PORT) === 465,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || process.env.SMTP_USER || 'Drona <no-reply@localhost>',
  // A report can be emailed at most this many times (stops the form being used to spam an address).
  EMAILS_PER_REPORT: Number(process.env.EMAILS_PER_REPORT) || 3,
};
