# Drona Deck · DIDAC booth

NFC card flow for the Drona Deck (print kit spec v2), built for **Science and History** (all four skills).
Each NFC tag holds a plain URL, and tapping a card opens that URL in the phone's browser. **So opening a URL in the
browser is exactly the same as tapping a card.** The flow can be fully tested now; when the cards arrive you only
write the URLs onto the tags.

No dependencies. Needs Node 20+.

```
npm test        # 35 automated tests (state machine + real HTTP flow)
npm start       # dev mode: player + simulator + code map + tap log
npm run booth   # booth mode: dev tools and the DEV TAP bar switched off
```

## Card URLs

| Card | Path | At this booth |
|---|---|---|
| Science, History | `/s/SCI/<set>`, `/s/HIS/<set>` | Live |
| Easy, Tough (level cards) | `/d/EASY/<set>`, `/d/TOUGH/<set>` | Live: the only way to pick the level |
| Depth, Stretch, Untangle, Pivot | `/p/DEP/<set>`, `/p/STR/<set>`, `/p/UNT/<set>`, `/p/PIV/<set>` | Live |
| Ready / Assist / Pass | `/k/RDY/<set>`, `/k/AST/<set>`, `/k/PAS/<set>` | Live |
| Rules | `/r/<set>` | Live: shows rules, starts a new game |
| English | `/s/ENG/<set>` | Shows "not live at this booth", game unchanged |

`<set>` is 1, 2 or 3. It is logged on every tap so a faulty tag can be traced to its physical set, but it never changes the game.

## Game flow (one "Quick Hand")

1. **Tap a subject card**: Science or History.
2. **Tap a level card**: Easy or Tough (NFC only, no screen buttons). Easy plays levels 1–3, Tough plays levels 4–6.
3. **Tap a skill card**: Depth, Stretch, Untangle or Pivot. A skill card tapped earlier is remembered,
   so the hand starts as soon as the level is picked.
4. **Three questions.** Each one shows first, then the visitor taps a call chip:
   - **Ready**: answer alone. Correct gives +2 and moves up a level.
   - **Assist**: shows a hint first. Correct gives +1 and stays on the same level.
   - **Pass**: a deliberate skip. It counts as one of the three questions.

   A wrong answer drops one level. Levels never leave the Easy or Tough band.
   Right/wrong is **not** shown during the hand.
5. **Estimate**: "How many do you think you got right?" (0–3).
6. **Result**: score, guess vs. actual (calibration), points, and a message per call (spec 11.2).
7. **Compared with the class**: score spread, how many guessed their own score, and the Ready/Assist/Pass mix.
   The class is an illustrative Grade 8 class of 40, always labelled **Sample data** (spec 11.4).
8. **Share report**: QR code (scan with a phone), WhatsApp, email or copy link. The report opens at
   `/report/<id>` on any device.

After a hand: tap another skill card to play again in the same subject and level, tap a subject card to start
fresh, or press **New player**. The Rules card resets at any time. During a hand, subject and skill cards are
locked. After 3 minutes idle, the next tap starts a fresh game. The same tag read twice within 2 s counts once.

Options are shuffled every time a question is served, so the right answer is not always in the same place.

## Question bank

`engine/bank.js` (Science · Depth), `engine/bank-science.js` (Science · Stretch, Untangle, Pivot, mostly Friction)
and `engine/bank-history.js` (History · all four skills, the Revolt of 1857). At least 2 questions per subject,
skill and level, 108 in total. History follows the spec 8.3 safeguards: practice sources are labelled
"Practice source (written for this activity)", reasoning questions reward the best-supported answer, and wording
is neutral. **All new items are marked `review: 'pending'` and need sign-off from the named Science and Social
Science reviewers before the event.**

## Configuration (environment variables)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4300` | |
| `BASE_URL` | `http://<your LAN IP>:4300` | Domain used in the code map, QR codes and CSV, i.e. **what gets written to the tags** |
| `IDLE_TIMEOUT_MS` | `180000` | Shared-device reset |
| `DEBOUNCE_MS` | `2000` | Ignore repeat reads of the same tag |
| `DEV_TOOLS` | `true` | `/dev/*` pages and the DEV TAP bar |
| `LOG_FILE` | `logs/taps.jsonl` | One JSON line per tap |
| `REPORT_FILE` | `logs/reports.jsonl` | Finished-hand reports, reloaded on start so shared links keep working |

PowerShell example: `$env:BASE_URL="http://192.168.1.20:4300"; npm start`

## Testing without cards

1. **Automated:** run `npm test`. All 34 should pass.
2. **Simulator (laptop):** open http://localhost:4300/dev/deck. Click card buttons, and the phone frame loads the exact tag URL.
   The live session state and tap log show alongside.
3. **Real phone (closest to a real NFC tap):** open http://localhost:4300/dev/codes on the laptop and scan the QR codes with
   a phone on the same Wi‑Fi. If the phone can't load the page, check that `BASE_URL` shows your Wi‑Fi IP (`ipconfig`) and
   that Windows Firewall allows Node on private networks.
4. **Log check:** open http://localhost:4300/dev/log, or `logs/taps.jsonl`.

## Deploying on Render

`render.yaml` sets up a free Node web service. On render.com go to **New → Blueprint**, pick this repo and click **Apply**.
The app uses Render's https URL (`RENDER_EXTERNAL_URL`) for the code map and QR codes automatically.
The free plan sleeps after 15 minutes idle, so the first request then takes about 30–50 s. Use a paid instance for the event.
The tap log and the saved reports reset on every deploy or restart there, so shared report links from before a restart stop working.

## When the cards arrive

1. Deploy to the real domain over **HTTPS** (iPhones only open NFC URL tags in the background for https), and start it
   with `BASE_URL=https://<domain>` and `DEV_TOOLS=false`.
2. Download `/dev/codes.csv` (run once with dev tools on and the final `BASE_URL`) for the URL list.
3. In **NFC Tools** (Android/iOS), use *Write → Add a record → URL* with the card's URL. Read it back to check, then *Other → Lock tag*.
   Lock only after the read-back works, because locking can't be undone.
4. Smoke test per set: Rules → History → Easy card → Depth → three calls → estimate → result → class → share (scan the QR), on one Android and one iPhone.
   In `/dev/log` (or `logs/taps.jsonl`) every line should show the right `set`.

## Layout

```
engine/   question engine + Science×Depth bank (24 questions, L1–L6)
server/   app.js (routes), state.js (game state machine), codes.js (code map),
          sessions.js, tapLog.js, views.js (HTML), config.js
tests/    state.test.js, routes.test.js
```
