const fs = require('node:fs');
const path = require('node:path');

// Every tap is appended to a JSONL file (one line per tap) and kept in a small ring buffer for /dev/log.
// The set number is recorded on every line so a faulty tag can be traced to its physical set.
class TapLog {
  constructor({ file, limit = 500 }) {
    this.file = file;
    this.limit = limit;
    this.entries = [];
    if (file) fs.mkdirSync(path.dirname(file), { recursive: true });
  }

  add(entry) {
    this.entries.push(entry);
    if (this.entries.length > this.limit) this.entries.shift();
    if (!this.file) return; // in-memory only (tests)
    fs.appendFile(this.file, JSON.stringify(entry) + '\n', (err) => {
      if (err) console.error('[tap-log] write failed:', err.message);
    });
    console.log(
      `[tap] ${entry.ts} set=${entry.set ?? entry.setRaw ?? '-'} ${entry.path}${entry.source === 'button' ? ' [button]' : ''} -> ${entry.outcome}` +
        (entry.phase ? ` (${entry.phase}, L${entry.level})` : ''),
    );
  }

  recent(n = 50) {
    return this.entries.slice(-n).reverse();
  }
}

module.exports = { TapLog };
