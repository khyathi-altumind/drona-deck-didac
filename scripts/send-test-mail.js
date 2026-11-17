// Sends one test email with the SMTP settings from .env / the environment, to check the login works.
// Usage: npm run mail-test -- you@example.com
const cfg = require('../server/config');
const { createMailer, validEmail } = require('../server/mailer');

const to = process.argv[2];
if (!validEmail(to || '')) {
  console.error('Usage: npm run mail-test -- you@example.com');
  process.exit(1);
}
const mailer = createMailer({ ...cfg, SMTP_TIMEOUT_MS: 30000 });
if (!mailer) {
  console.error('SMTP_HOST is not set (check didac/.env).');
  process.exit(1);
}
console.log(`Sending a test email via ${cfg.SMTP_HOST}:${cfg.SMTP_PORT} as ${cfg.SMTP_USER} to ${to} ...`);
mailer
  .send({ to, subject: 'Drona booth: test email', text: 'SMTP works. Reports will be sent from this address.', html: '<p>SMTP works. Reports will be sent from this address.</p>' })
  .then(() => console.log('Sent. Check the inbox (and spam).'))
  .catch((err) => {
    console.error('Failed:', err.message);
    if (/535|5\.7\.139|SmtpClientAuthentication/i.test(err.message)) {
      console.error('Microsoft 365 rejected the login: check the password, and that Authenticated SMTP is enabled for this mailbox.');
    }
    process.exit(1);
  });
