# Drona Deck Â· DIDAC booth

NFC card flow for the Drona Deck (print kit spec v2), built for **Science and Civics** (all four skills).
Each NFC tag holds a plain URL, and tapping a card opens that URL in the phone's browser. **So opening a URL in the
browser is exactly the same as tapping a card.** The flow can be fully tested now; when the cards arrive you only
write the URLs onto the tags.

No dependencies. Needs Node 20+.

```
npm test        # 61 automated tests (state machine + real HTTP flow)
npm start       # dev mode: player + simulator + code map + tap log
npm run booth   # booth mode: dev tools and the DEV TAP bar switched off
```

## Card URLs

| Card | Path | At this booth |
|---|---|---|
| Science, Civics | `/s/SCI/<set>`, `/s/CIV/<set>` | Live. Civics uses the print kit's third subject slot (History in kit v2), so that card needs reprinting |
| Easy, Tough (level cards) | `/d/EASY/<set>`, `/d/TOUGH/<set>` | Live: the only way to pick the level |
| Depth, Stretch, Untangle, Pivot | `/p/DEP/<set>`, `/p/STR/<set>`, `/p/UNT/<set>`, `/p/PIV/<set>` | Live |
| Ready / Assist / Pass | `/k/RDY/<set>`, `/k/AST/<set>`, `/k/PAS/<set>` | Live |
| Rules | `/r/<set>` | Live: shows rules, starts a new game |
| English, History | `/s/ENG/<set>`, `/s/HIS/<set>` | Shows "not live at this booth", game unchanged |

`<set>` is 1, 2 or 3. It is logged on every tap so a faulty tag can be traced to its physical set, but it never changes the game.

## Game flow (one "Quick Hand")

1. **Tap a subject card**: Science or Civics.
2. **Tap a level card**: Easy or Tough. Easy plays levels 1â€“3, Tough plays levels 4â€“6.
   Civics has one question per level, so its hands follow a fixed order: Easy = questions 1 â†’ 2 â†’ 3,
   Tough = questions 4 â†’ 5 â†’ 6, whatever the visitor answers.
3. **Tap a skill card**: Depth, Stretch, Untangle or Pivot. A skill card tapped earlier is remembered,
   so the hand starts as soon as the level is picked.
4. **Three questions.** Each one shows first, then the visitor taps a call chip:
   - **Ready**: answer alone. Correct gives +2 and moves up a level.
   - **Assist**: shows a hint first. Correct gives +1 and stays on the same level.
   - **Pass**: a deliberate skip. It counts as one of the three questions.

   A wrong answer drops one level. Levels never leave the Easy or Tough band. (Civics follows its fixed order.)
   Right/wrong is **not** shown during the hand.
5. **Estimate**: "How many do you think you got right?" (0â€“3).
6. **Result**: score, guess vs. actual (calibration), points, and a message per call (spec 11.2).
7. **Compared with the class**: score spread, how many guessed their own score, and the Ready/Assist/Pass mix.
   The class is an illustrative Grade 8 class of 40, always labelled **Sample data** (spec 11.4).
8. **Share report**: QR code (scan with a phone), "Get my complete report" (email) or copy link. The report opens at
   `/report/<id>` on any device.

The report adds rule-based analytics (`server/insights.js`, no AI or network calls): **At a glance**, **Thinking
depth** (level-weighted score /100 and the six-level ladder), **Decision-making** (each call + outcome rated
good / partial / needs a rethink) and **Strengths, focus areas and next steps**.

### Get my complete report

The Result screen is a **preview** (score + At a glance). Below it, **Get my complete report** opens a pop-up form
asking for **name, phone number and email** (also on the Share screen and on the report page on the visitor's phone).
The server **first saves all three** (`logs/emails.jsonl`), then **emails the complete report** over SMTP: an HTML
email greeting the visitor by name, with the four analytics sections and a link to the full report, plus a plain-text
copy (`server/mailer.js`, no npm packages). A missing name, bad phone (7-15 digits, optional +) or bad email re-opens the form.

**Resend (used on Render).** Render's free plan blocks outgoing SMTP, so with `RESEND_API_KEY` set the server
sends through Resend's HTTPS API instead (`server/mailer.js`, no npm packages). `MAIL_FROM` must be on a domain
verified in Resend: add `dronafy.com` under Resend → Domains and create the DNS records it lists at GoDaddy.

- No `SMTP_HOST` set: contact details are still saved (status `not-configured`), and nothing is sent.
- Send fails (for example, no internet at the booth): the address stays saved with status `failed` and the error,
  and the visitor is told it will be emailed once the internet is back. The server retries failed emails and
  failed Google Sheet rows by itself, 1, 2, 4 … up to 15 minutes apart (48 tries, `RETRY_MAX`), and keeps doing so
  after a restart because `logs/emails.jsonl` and `logs/reports.jsonl` are reloaded. `/dev/emails` shows the result.
- `/dev/emails` (and `/dev/emails.csv`) lists every name, phone and email with its send status, so the team can follow up.
- A report can be emailed at most `EMAILS_PER_REPORT` times (default 3). The booth screen shows only a masked
  address (`stâ€¢â€¢â€¢â€¢@example.com`) and never autofills, so the next visitor cannot see it.
- These details are personal data: delete `logs/emails.jsonl` after the event.

Locally, put the mail settings in `didac/.env` (copy `.env.example`; git ignores `.env`). Real environment variables,
such as Render's dashboard settings, override the file. Or set them in the shell.
The booth sends from the Microsoft 365 mailbox `hello@Dronafy.com`:

```powershell
$env:SMTP_HOST="smtp.office365.com"; $env:SMTP_PORT="587"; $env:SMTP_USER="hello@Dronafy.com"
$env:SMTP_PASS="<mailbox password>"; $env:MAIL_FROM="Drona <hello@Dronafy.com>"; npm start
```

Microsoft 365 needs **Authenticated SMTP** switched on for that mailbox (Microsoft 365 admin center → Users →
the user → Mail → Manage email apps), and `MAIL_FROM` must be the same address as `SMTP_USER`.
Gmail also works: `smtp.gmail.com` with a Google [app password](https://myaccount.google.com/apppasswords).

Port 587 upgrades with STARTTLS; port 465 uses TLS from the start. A password is never sent without TLS.

Subject, level and skill can also be picked with the mouse or touch: click a card slot at the top to open it and
choose a card, or click an Easy/Tough or skill card on the screen. A click opens the same URL as the NFC tag
(logged with `source: screen`), so it plays exactly the same. Next to **Send my report**, the download button saves
the complete report as one HTML file (`/report/<id>/download`).

After a hand: tap another skill card to play again in the same subject and level, tap a subject card to start
fresh, or press **New player**. The Rules card resets at any time. During a hand, subject and skill cards are
locked. After 3 minutes idle, the next tap starts a fresh game. The same tag read twice within 2 s counts once.

Options are shuffled every time a question is served, so the right answer is not always in the same place.

## Question bank

- `engine/bank-science-forces.js`: all 24 items of the DIDAC Science Pool, Class 8 "Exploring Forces". These are
  the **only** Science questions in play: one per skill and level (L1â€“L6). Science keeps the adaptive ladder; when
  the level it moves to is already used in the hand, the engine serves the nearest unused level in the band, so a
  hand never repeats a question.
- The older Science items (`SCIENCE_DEPTH` in `engine/bank.js`, and `engine/bank-science.js`) are kept on disk but
  not loaded, so they never appear in play.
- `engine/bank-civics.js`: all 24 items of the DIDAC Civics Pool v2, Class 8 Indian Constitution unit (secularism).
  The fixed order lives in `SUBJECT_PLANS` in `engine/index.js`.

Pool items keep their proposed competency, distractor logic and source-fact references (`sourceFacts`, SF#), and
`format` records any conversion. The booth only scores single-answer multiple choice, so:
- `yes_no_grid` items list their four statements in the stimulus and ask for the right set (e.g. "2 and 4"); the
  grid's trap statement is built into the wrong sets.
- `one_line` items are rebuilt as four options, with the rubric's full-credit answer as the key and the
  partial/no-credit answers as distractors.

`engine/bank-history.js` (the Revolt of 1857) is still in the bank but History is not live at this booth.

The Science (Forces) and Civics items have been reviewed and approved by the Science and Social Science reviewers,
and are marked `review: 'approved'`.

## Configuration (environment variables)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4300` | |
| `BASE_URL` | `http://<your LAN IP>:4300` | Domain used in the code map, QR codes and CSV, i.e. **what gets written to the tags** |
| `IDLE_TIMEOUT_MS` | `180000` | Shared-device reset |
| `DEBOUNCE_MS` | `2000` | Ignore repeat reads of the same tag |
| `DEV_TOOLS` | `true` | `/dev/*` pages (contacts, tap log, code map, simulator) |
| `DEV_BAR` | `false` | `true` shows the DEV TAP bar on the game screen (needs `DEV_TOOLS` on) |
| `LOG_FILE` | `logs/taps.jsonl` | One JSON line per tap |
| `REPORT_FILE` | `logs/reports.jsonl` | Finished-hand reports, reloaded on start so shared links keep working |
| `EMAIL_FILE` | `logs/emails.jsonl` | Visitor email addresses and send status |
| `SMTP_HOST` | (unset) | Mail server. Unset = save addresses only, send nothing |
| `SMTP_PORT` | `587` | `587` (STARTTLS) or `465` (TLS) |
| `SMTP_SECURE` | `true` when port is 465 | Force TLS from the start |
| `SMTP_USER` / `SMTP_PASS` | (unset) | Mail account login |
| `MAIL_FROM` | `SMTP_USER` | Sender, e.g. `Drona <reports@yourschool.org>` |
| `SHEET_WEBHOOK_URL` | (unset) | Google Apps Script web app that adds each visitor to a Google Sheet |
| `SHEET_SECRET` | (unset) | Must match `SECRET` in `scripts/google-sheet.gs` |
| `RESEND_API_KEY` | (unset) | Resend API key. Set = send via Resend's HTTPS API; unset = SMTP |
| `MAIL_REPLY_TO` | (unset) | Reply-To on report emails, e.g. `hello@Dronafy.com` |
| `EMAILS_PER_REPORT` | `3` | Most times one report can be emailed |

PowerShell example: `$env:BASE_URL="http://192.168.1.20:4300"; npm start`

## Testing without cards

1. **Automated:** run `npm test`. All 61 should pass.
2. **Simulator (laptop):** open http://localhost:4300/dev/deck. Click card buttons, and the phone frame loads the exact tag URL.
   The live session state and tap log show alongside.
3. **Real phone (closest to a real NFC tap):** open http://localhost:4300/dev/codes on the laptop and scan the QR codes with
   a phone on the same Wiâ€‘Fi. If the phone can't load the page, check that `BASE_URL` shows your Wiâ€‘Fi IP (`ipconfig`) and
   that Windows Firewall allows Node on private networks.
4. **Log check:** open http://localhost:4300/dev/log, or `logs/taps.jsonl`.

## Deploying on Render

`render.yaml` sets up a free Node web service. On render.com go to **New â†’ Blueprint**, pick this repo and click **Apply**.
The app uses Render's https URL (`RENDER_EXTERNAL_URL`) for the code map and QR codes automatically.
The free plan sleeps after 15 minutes idle, so the first request then takes about 30â€“50 s. Use a paid instance for the event.
The tap log and the saved reports reset on every deploy or restart there, so shared report links from before a restart stop working.

## Laptop screen (no screen mirroring)

The game can show on a laptop while the visitor taps cards with a phone. No mirroring, external reader, Android
app or card rewrite is needed: every card already opens a page on this server, and the server plays the tap on
the laptop.

1. On the laptop, open `https://<domain>/screen/1` in Chrome once (use `/screen/2` or `/screen/3` for other
   stations). It turns into the Station 1 game screen, and the browser remembers it. For a clean full screen,
   press F11, or start Chrome with `chrome.exe --kiosk https://<domain>/screen/1`.
2. Tap cards with the phone as usual. Every card whose URL ends in `/1` is played on the Station 1 laptop
   screen, which updates within a second. The phone only shows "Sent to the screen ✓".
3. Answers, the score guess and the share screen are used on the laptop (mouse, touch, or the R/A/P and 1–4 keys).
   Ready / Assist / Pass chips and the Rules card can also be tapped with the phone.

How it works: the laptop page keeps an event stream open (`/screen-events`). A tap is sent to the screen only while
that stream is open, so with the laptop page closed the phone plays the game itself, exactly as before.
`/screen/off` turns a laptop back into a normal player.

- **Wi‑Fi drops:** the laptop shows "Lost the link to the phone taps. Reconnecting…" and reconnects by itself
  every 2 s. Taps made in the meantime show as soon as it is back. If the phone is offline, Chrome on the phone
  shows its usual "no internet" page; tap the card again once it reconnects.
- **Safety:** a phone can only drive the Drona game on the screen. It cannot open other websites on the laptop.
  Anyone holding a set-1 card (or its URL) can play on the Station 1 screen, the same as with the cards today.
- The laptop and phone need internet access to the deployed site, not the same Wi‑Fi. For a local test,
  run the server on the laptop and tap the QR codes on `/dev/codes` with the phone (same Wi‑Fi).
- On Render's free plan the service sleeps after 15 minutes with nothing open; an open laptop screen keeps it awake.

## When the cards arrive

1. Deploy to the real domain over **HTTPS** (iPhones only open NFC URL tags in the background for https), and start it
   with `BASE_URL=https://<domain>` and `DEV_TOOLS=false`.
2. Download `/dev/codes.csv` (run once with dev tools on and the final `BASE_URL`) for the URL list.
3. In **NFC Tools** (Android/iOS), use *Write â†’ Add a record â†’ URL* with the card's URL. Read it back to check, then *Other â†’ Lock tag*.
   Lock only after the read-back works, because locking can't be undone.
4. Smoke test per set: Rules â†’ Civics â†’ Easy card â†’ Depth â†’ three calls â†’ estimate â†’ result â†’ class â†’ share (scan the QR), on one Android and one iPhone.
   In `/dev/log` (or `logs/taps.jsonl`) every line should show the right `set`.

## Layout

```
engine/   question engine; banks: bank.js (Science Ã— Depth), bank-science.js, bank-civics.js, bank-history.js (not live)
server/   app.js (routes), state.js (game state machine), codes.js (code map),
          sessions.js, tapLog.js, views.js (HTML), config.js
tests/    state.test.js, routes.test.js
```

## Checking the mail login

After setting `RESEND_API_KEY` (or `SMTP_PASS`), run `npm run mail-test -- you@example.com`. It sends one test email with the same
settings the booth uses and prints the SMTP error if the login fails.

## Google Sheet of visitors

Every completed form (name, phone, email, subject/skill/level, score, guess, email status, report link) is also
added as a row to a Google Sheet, because Render's disk is wiped on every restart. A sheet error never stops the
visitor getting their report; `logs/emails.jsonl` records `sheet: saved` or `sheet: failed` per visitor.

1. Create a Google Sheet. **Extensions → Apps Script**, paste `scripts/google-sheet.gs`, and change `SECRET` to a
   long random value.
2. **Deploy → New deployment → Web app**, Execute as **Me**, Who has access **Anyone**. Authorise, copy the URL.
3. Set `SHEET_WEBHOOK_URL` (the URL) and `SHEET_SECRET` (the same secret) in `.env` and in Render's dashboard.

The header row is added on the first visitor. After editing the script, use **Manage deployments → Edit → New
version** so the same URL picks up the change.
