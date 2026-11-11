// Turns a finished hand into a report, compares it with a sample class, and keeps reports so the
// visitor can open and share them by link.
//
// The class is a pre-seeded, illustrative Grade 8 class of 40 (spec v2, section 11.4). It is always
// labelled "Sample data" on screen. It is deterministic per subject + difficulty, so every visitor
// is compared with the same class.

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { BANDS, levelName } = require('../engine');
const { CARDS } = require('./codes');

const CLASS_SIZE = 40;

// Spec 11.2: what each call + outcome means. Multiple-choice answers are either right or wrong.
function callMessage(call, correct) {
  if (call === 'PAS') return 'A deliberate skip is a decision, and it is logged.';
  if (call === 'RDY') return correct ? 'Right call. Your confidence matched your answer.' : 'Confident but off. This gap is what Drona tracks.';
  return correct ? 'Smart use of help.' : 'Help did not close the gap. Worth a closer look.';
}

function calibrationOf(estimate, correct) {
  if (estimate === correct) return 'matched';
  return estimate > correct ? 'over' : 'under';
}

// ---------- Sample class ----------

function seededRandom(seedText) {
  let h = 2166136261;
  for (const ch of seedText) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleClass(subject, difficulty, total = 3) {
  const rand = seededRandom(`${subject}-${difficulty}`);
  const base = difficulty === 'TOUGH' ? 0.45 : 0.7;
  const students = [];
  for (let i = 0; i < CLASS_SIZE; i++) {
    const ability = Math.min(0.95, Math.max(0.1, base + (rand() - 0.5) * 0.5));
    const calls = { RDY: 0, AST: 0, PAS: 0 };
    let correct = 0;
    for (let q = 0; q < total; q++) {
      const r = rand();
      const call = r < 0.12 ? 'PAS' : r < 0.4 ? 'AST' : 'RDY';
      calls[call] += 1;
      const p = call === 'PAS' ? 0 : call === 'AST' ? Math.min(0.95, ability + 0.1) : ability;
      if (rand() < p) correct += 1;
    }
    // Students tend to be a little more sure than their results.
    const b = rand();
    const bias = b < 0.15 ? -1 : b < 0.6 ? 0 : b < 0.93 ? 1 : 2;
    const estimate = Math.min(total, Math.max(0, correct + bias));
    students.push({ correct, estimate, calls });
  }
  return students;
}

function compareWithClass({ subject, difficulty, correct, calls, total }) {
  const students = sampleClass(subject, difficulty, total);
  const scoreDist = Array.from({ length: total + 1 }, (_, n) => students.filter((st) => st.correct === n).length);
  const cal = { matched: 0, over: 0, under: 0 };
  const classCalls = { RDY: 0, AST: 0, PAS: 0 };
  for (const st of students) {
    cal[calibrationOf(st.estimate, st.correct)] += 1;
    for (const k of Object.keys(classCalls)) classCalls[k] += st.calls[k];
  }
  const pct = (counts) => {
    const sum = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, Math.round((v / sum) * 100)]));
  };
  return {
    size: students.length,
    sample: true,
    scoreDist,
    lower: students.filter((st) => st.correct < correct).length,
    same: students.filter((st) => st.correct === correct).length,
    higher: students.filter((st) => st.correct > correct).length,
    avgCorrect: Math.round((students.reduce((a, st) => a + st.correct, 0) / students.length) * 10) / 10,
    calibration: cal,
    callMix: { class: pct(classCalls), you: pct(calls) },
  };
}

// ---------- Report ----------

function buildReport(s) {
  const total = s.hand.length;
  const correct = s.hand.filter((h) => h.correct).length;
  const calls = { RDY: 0, AST: 0, PAS: 0 };
  for (const h of s.hand) calls[h.call] += 1;
  return {
    createdAt: new Date(s.updatedAt).toISOString(),
    subject: { code: s.subject, name: CARDS.s[s.subject].name },
    skill: { code: s.skill, name: CARDS.p[s.skill].name, prompt: CARDS.p[s.skill].prompt },
    difficulty: { code: s.difficulty, name: BANDS[s.difficulty].name },
    total,
    correct,
    estimate: s.estimate,
    calibration: calibrationOf(s.estimate, correct),
    points: s.hand.reduce((a, h) => a + h.points, 0),
    calls,
    questions: s.hand.map((h, i) => ({
      n: i + 1,
      level: h.level,
      levelName: levelName(s.skill, h.level),
      context: h.question.context || null,
      stem: h.question.stem,
      options: h.question.options,
      answer: h.question.answer,
      choice: h.choice,
      call: h.call,
      correct: h.correct,
      explanation: h.question.explanation,
      message: callMessage(h.call, h.correct),
    })),
    class: compareWithClass({ subject: s.subject, difficulty: s.difficulty, correct, calls, total }),
  };
}

// Reports live in memory and, when a file is set, in a JSONL file that is reloaded on start,
// so links keep working after a restart (on Render's free plan the file resets on each deploy).
class ReportStore {
  constructor({ file, limit = 5000 }) {
    this.file = file;
    this.limit = limit;
    this.reports = new Map();
    if (!file) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file)) return;
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      if (!line.trim()) continue;
      try {
        const r = JSON.parse(line);
        this.reports.set(r.id, r);
      } catch {
        // skip a partly written line
      }
    }
  }

  create(data) {
    const report = { id: crypto.randomBytes(6).toString('base64url'), ...data };
    this.reports.set(report.id, report);
    if (this.reports.size > this.limit) this.reports.delete(this.reports.keys().next().value);
    if (this.file) {
      fs.appendFile(this.file, JSON.stringify(report) + '\n', (err) => {
        if (err) console.error('[reports] write failed:', err.message);
      });
    }
    return report;
  }

  get(id) {
    return this.reports.get(id) || null;
  }
}

module.exports = { buildReport, compareWithClass, sampleClass, callMessage, calibrationOf, ReportStore, CLASS_SIZE };
