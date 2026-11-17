// Sends each visitor's details to a Google Sheet through a Google Apps Script web app
// (scripts/google-sheet.gs). The sheet is the lasting copy: Render's disk is wiped on every restart.
// Returns null when SHEET_WEBHOOK_URL is not set.

function createSheet(cfg) {
  if (!cfg.SHEET_WEBHOOK_URL) return null;
  const timeoutMs = cfg.SHEET_TIMEOUT_MS || 10000;
  return {
    async add(row) {
      const res = await fetch(cfg.SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Apps Script reads the raw body
        body: JSON.stringify({ secret: cfg.SHEET_SECRET || '', row }),
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
      });
      const text = await res.text();
      let out;
      try {
        out = JSON.parse(text);
      } catch {
        throw new Error(`sheet replied ${res.status}: ${text.slice(0, 120)}`);
      }
      if (!out.ok) throw new Error(`sheet refused the row: ${out.error || 'unknown error'}`);
    },
  };
}

module.exports = { createSheet };
