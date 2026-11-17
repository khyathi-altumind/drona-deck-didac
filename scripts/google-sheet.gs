// Drona booth → Google Sheet. Paste this into the sheet's Extensions → Apps Script, then
// Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone) and copy the URL.
// Set SECRET to the same value as SHEET_SECRET on the server, so nobody else can add rows.

const SECRET = 'change-me';
const HEADERS = ['Time (IST)', 'Name', 'Phone', 'Email', 'Subject', 'Skill', 'Level', 'Score', 'Guess', 'Email status', 'From', 'Report link'];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.secret !== SECRET) return reply({ ok: false, error: 'bad secret' });
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    const r = data.row || {};
    // A leading ' keeps text as text: phone numbers keep their + and leading 0, and nothing runs as a formula.
    const text = (v) => "'" + String(v == null ? '' : v);
    sheet.appendRow([r.time, text(r.name), text(r.phone), text(r.email), text(r.subject), text(r.skill), text(r.level),
      r.score, r.guess, text(r.status), text(r.source), text(r.report)]);
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
