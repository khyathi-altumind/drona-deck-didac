// Visitor contact details (name, phone, email), saved before the report is sent. One JSONL line when an address is saved,
// and one more line each time its status changes (sent / failed / not-configured); on start the lines
// are merged by id. This is personal data: keep the file off public hosting and delete it after the event.

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

class EmailStore {
  constructor({ file }) {
    this.file = file;
    this.records = new Map();
    if (!file) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file)) return;
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
        const r = JSON.parse(line);
        this.records.set(r.id, { ...(this.records.get(r.id) || {}), ...r });
      } catch {
        // skip a partly written line
      }
    }
  }

  write(line) {
    if (!this.file) return;
    fs.appendFile(this.file, JSON.stringify(line) + '\n', (err) => {
      if (err) console.error('[emails] write failed:', err.message);
    });
  }

  add({ reportId, name, phone, email, source, ts }) {
    const rec = { id: crypto.randomBytes(9).toString('base64url'), ts, reportId, name, phone, email, source, status: 'saved' };
    this.records.set(rec.id, rec);
    this.write(rec);
    return rec;
  }

  update(id, patch) {
    const rec = this.records.get(id);
    if (!rec) return;
    Object.assign(rec, patch);
    this.write({ id, ...patch });
  }

  countFor(reportId) {
    let n = 0;
    for (const r of this.records.values()) if (r.reportId === reportId) n += 1;
    return n;
  }

  recent(n = 200) {
    return [...this.records.values()].slice(-n).reverse();
  }
}

module.exports = { EmailStore };
