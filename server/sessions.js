const crypto = require('node:crypto');
const { newSession } = require('./state');

// In-memory sessions keyed by the drona_sid cookie. A restart clears all games, which is fine for a booth.
class SessionStore {
  constructor({ idleTimeoutMs }) {
    this.idleTimeoutMs = idleTimeoutMs;
    this.sessions = new Map();
  }

  // Returns { session, isNew, expired }. An expired session is replaced by a fresh one under a new id.
  load(sid, now) {
    const existing = sid && this.sessions.get(sid);
    if (existing && now - existing.updatedAt <= this.idleTimeoutMs) {
      return { session: existing, isNew: false, expired: false };
    }
    if (existing) this.sessions.delete(sid);
    const session = newSession(crypto.randomUUID(), now);
    this.sessions.set(session.sid, session);
    return { session, isNew: true, expired: Boolean(existing) };
  }

  get(sid) {
    return this.sessions.get(sid) || null;
  }

  delete(sid) {
    this.sessions.delete(sid);
  }

  // Drop long-dead sessions so memory stays flat over a multi-day event.
  sweep(now) {
    for (const [sid, s] of this.sessions) {
      if (now - s.updatedAt > this.idleTimeoutMs * 10) this.sessions.delete(sid);
    }
  }
}

module.exports = { SessionStore };
