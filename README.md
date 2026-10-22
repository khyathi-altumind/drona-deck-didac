# Drona Deck · DIDAC booth

NFC card flow for the Drona Deck (print kit spec v2), built for **Science × Depth**.
Each NFC tag holds a plain URL, and tapping a card opens that URL in the phone's browser. **So opening a URL in the
browser is exactly the same as tapping a card.** The flow can be fully tested now; when the cards arrive you only
write the URLs onto the tags.

No dependencies. Needs Node 20+.

```
npm test        # 24 automated tests (state machine + real HTTP flow)
npm start       # dev mode: player + simulator + code map + tap log
npm run booth   # booth mode: dev tools and the DEV TAP bar switched off
```

## Card URLs

| Card | Path | At this booth |
|---|---|---|
| Science | `/s/SCI/<set>` | Live |
| Depth | `/p/DEP/<set>` | Live |
| Ready / Assist / Pass | `/k/RDY/<set>`, `/k/AST/<set>`, `/k/PAS/<set>` | Live |
| Rules | `/r/<set>` | Live: shows rules, starts a new game |
| English, History, Stretch, Untangle, Pivot | `/s/ENG/…` etc. | Shows "not live at this booth", game unchanged |

`<set>` is 1, 2 or 3. It is logged on every tap so a faulty tag can be traced to its physical set, but it never changes the game.

## Game rules implemented

- Tap the subject and skill in either order, and a question appears (Depth level 1 = Recall … 6 = Create).
- Then tap a call chip:
  - **Ready**: answer alone. Correct gives +2 and moves up a level.
  - **Assist**: shows a hint first. Correct gives +1 and you stay on the same level.
  - **Pass**: gives a new question at the same level.
- A wrong answer drops one level (never below L1).
- After the result, re-tap a card (or press "Next question") for the next question.
- The Rules card resets the game. After 3 minutes idle, the next tap starts a fresh game.
- The same tag read twice within 2 s counts once.

## Configuration (environment variables)

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4300` | |
| `BASE_URL` | `http://<your LAN IP>:4300` | Domain used in the code map, QR codes and CSV, i.e. **what gets written to the tags** |
| `IDLE_TIMEOUT_MS` | `180000` | Shared-device reset |
| `DEBOUNCE_MS` | `2000` | Ignore repeat reads of the same tag |
| `DEV_TOOLS` | `true` | `/dev/*` pages and the DEV TAP bar |
| `LOG_FILE` | `logs/taps.jsonl` | One JSON line per tap |

PowerShell example: `$env:BASE_URL="http://192.168.1.20:4300"; npm start`

## Testing without cards

1. **Automated:** run `npm test`. All 24 should pass.
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
The tap log file resets on every deploy or restart there.

## When the cards arrive

1. Deploy to the real domain over **HTTPS** (iPhones only open NFC URL tags in the background for https), and start it
   with `BASE_URL=https://<domain>` and `DEV_TOOLS=false`.
2. Download `/dev/codes.csv` (run once with dev tools on and the final `BASE_URL`) for the URL list.
3. In **NFC Tools** (Android/iOS), use *Write → Add a record → URL* with the card's URL. Read it back to check, then *Other → Lock tag*.
   Lock only after the read-back works, because locking can't be undone.
4. Smoke test per set: Rules → Science → Depth → Ready → answer → result, on one Android and one iPhone.
   In `/dev/log` (or `logs/taps.jsonl`) every line should show the right `set`.

## Layout

```
engine/   question engine + Science×Depth bank (24 questions, L1–L6)
server/   app.js (routes), state.js (game state machine), codes.js (code map),
          sessions.js, tapLog.js, views.js (HTML), config.js
tests/    state.test.js, routes.test.js
```
