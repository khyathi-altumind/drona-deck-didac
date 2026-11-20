const { CARDS, tapPath } = require('./codes');
const { levelName, BANDS } = require('../engine');
const { HAND_SIZE } = require('./state');
const { buildInsights, insightsEmail } = require('./insights');

function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CSS = `
/* Forest Gold Kiosk (DIDAC Bengaluru 2026). Tokens follow DESIGN.md. */
:root{
  --bg:#041710; --forest:#081B14; --panel:#0D251D; --well:#071c14; --hover:#133329;
  --line:rgba(93,155,126,.24); --edge:rgba(16,185,129,.24);
  --gold:#F4C46A; --gold-base:#E5A93C; --gold-muted:#8A6623; --gold-hi:#ffc665; --gold-ink:#281900;
  --ivory:#F7FAF8; --ivory-warm:#C9D8D0; --soft:#A9C1B6; --muted:#7F9A8E; --emerald:#6EE7B7;
  --depth:#6E9FD6; --rdy:#3B9263; --ast:#E5A93C; --pas:#4E5F58; --bad:#D9705A; --ok:#8FD3A8;
  --rdy-bg:#123724; --ast-bg:#3B2A0D; --pas-bg:#1B2421;
  --serif:'Newsreader',Georgia,'Times New Roman',serif; --sans:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;
  color-scheme:dark;
}
*{box-sizing:border-box}
html{background:var(--bg)}
html,body{margin:0;color:var(--ivory);font-family:var(--sans);-webkit-text-size-adjust:100%}
body{min-height:100vh;overscroll-behavior:none;background:
  radial-gradient(ellipse 70% 45% at 50% -8%,rgba(34,197,94,.13),transparent 70%),
  radial-gradient(circle at -5% 38%,rgba(229,169,60,.08),transparent 32%),
  radial-gradient(circle at 105% 92%,rgba(5,150,105,.09),transparent 34%),var(--bg);background-attachment:fixed}
::selection{background:var(--gold-base);color:var(--gold-ink)}
a{color:var(--gold)}
svg.ic{width:1.1em;height:1.1em;flex:none;vertical-align:-.18em}
.screen{max-width:680px;margin:0 auto;padding:20px 16px 96px;min-height:100vh;display:flex;flex-direction:column;gap:18px}
.screen.booth{max-width:900px;min-height:0;padding-top:28px}

/* Header bars */
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.wordmark{font-family:var(--serif);font-weight:500;font-size:28px;letter-spacing:-.01em;color:var(--gold-hi);display:inline-flex;align-items:baseline;gap:3px;line-height:1}
.wdot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--gold);box-shadow:0 0 10px rgba(244,196,106,.9);animation:pulse 2s infinite}
.dot{color:var(--gold)}
.meta{font-size:13px;color:var(--muted);text-align:right}
.meta b{color:var(--ivory);font-weight:600}
.kbar{position:sticky;top:0;z-index:20;background:rgba(4,23,16,.86);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(16,185,129,.16)}
.kbar-in{max-width:1280px;margin:0 auto;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.kbrand{display:flex;align-items:center;gap:18px;min-width:0}
.pill{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:6px 12px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--soft)}
.pill>i{width:6px;height:6px;border-radius:50%;background:var(--gold);display:inline-block;flex:none}
.pill.live{background:#081e14;border-color:rgba(16,185,129,.28);color:var(--emerald)}
.pill.live>i{width:9px;height:9px;background:#10b981;animation:ping 1.6s ease-out infinite}
.pill.gold{background:rgba(229,169,60,.1);border-color:rgba(229,169,60,.32);color:var(--gold)}
.pill.gold>i{box-shadow:0 0 8px var(--gold)}
.knav{display:flex;gap:4px;padding:4px;border-radius:999px;background:rgba(6,25,17,.9);border:1px solid rgba(16,185,129,.2)}
.knav span{padding:7px 14px;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);border:1px solid transparent;white-space:nowrap}
.knav span.on{background:rgba(16,185,129,.18);color:var(--gold);border-color:rgba(244,196,106,.3)}
@keyframes ping{0%{box-shadow:0 0 0 0 rgba(16,185,129,.65)}80%,100%{box-shadow:0 0 0 7px rgba(16,185,129,0)}}
@keyframes pulse{50%{opacity:.45}}
@keyframes shimmer{0%{transform:translateX(-110%)}100%{transform:translateX(330%)}}
@keyframes flash{0%{box-shadow:0 0 28px rgba(244,196,106,.4)}100%{box-shadow:0 8px 24px rgba(0,0,0,.4)}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}

/* Labels and type */
.eyebrow{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.eyebrow.gold{color:var(--gold)}
h1,h2{font-family:var(--serif);font-weight:600;margin:0;letter-spacing:-.015em;color:var(--ivory)}
h1{font-size:34px;line-height:1.15}
h2{font-size:24px;line-height:1.2}
.lead{font-size:17px;color:var(--soft);line-height:1.55;margin:6px 0 0}
.lead b{color:var(--ivory)}
.small{font-size:13px;color:var(--muted);line-height:1.5}
.notice{border-radius:14px;padding:12px 16px;font-size:15px;border:1px solid rgba(16,185,129,.3);background:rgba(12,36,28,.92);color:var(--ivory-warm)}
.notice.warn{border-color:rgba(229,169,60,.5);background:rgba(40,28,7,.88);color:#F3D7A6}
.badge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:var(--muted);white-space:nowrap}
.badge.em{background:rgba(16,185,129,.14);border-color:rgba(16,185,129,.32);color:var(--emerald)}
.badge.gold{background:rgba(244,196,106,.1);border-color:rgba(244,196,106,.3);color:var(--gold)}

/* Glass panels */
.panel{position:relative;background:linear-gradient(135deg,rgba(13,37,29,.9),rgba(7,30,22,.96));border:1px solid var(--edge);border-radius:20px;padding:22px;box-shadow:0 20px 50px -12px rgba(0,0,0,.6);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
.panel.glow::before{content:'';position:absolute;top:-1px;left:48px;right:48px;height:1px;background:linear-gradient(90deg,transparent,rgba(244,196,106,.75),transparent)}
.panel.hero{border-radius:28px;padding:32px;border-color:rgba(16,185,129,.3);box-shadow:0 24px 60px rgba(0,0,0,.65),0 0 40px -10px rgba(244,196,106,.22)}

/* Card slots: subject / level / skill */
.slots{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.slot{position:relative;background:rgba(8,30,21,.85);border:1px solid rgba(16,185,129,.25);border-radius:18px;padding:14px 16px;min-width:0;box-shadow:0 8px 24px rgba(0,0,0,.4);overflow:hidden}
.slot.on{border-color:rgba(16,185,129,.42)}
.slot.next{border-color:var(--gold);background:#0f2c1f;animation:flash 1.4s ease-out}
.slot .shead{display:flex;align-items:center;justify-content:space-between;gap:8px}
.slot .slab{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.slot .slab i{width:8px;height:8px;border-radius:50%;background:var(--pas);flex:none}
.slot.on .slab i{background:#34d399}
.slot.next .slab i{background:var(--gold);animation:pulse 1.4s infinite}
.slot .sic{color:var(--muted);font-size:18px;line-height:1}
.slot.next .sic{color:var(--gold);animation:pulse 1.6s infinite}
.slot .sbody{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 8px;margin-top:8px}
.slot .val{font-family:var(--serif);font-weight:500;font-size:21px;line-height:1.2;overflow-wrap:break-word;min-width:0;color:var(--ivory)}
.slot .val.empty{color:var(--muted)}
.slot.next .val{color:var(--gold)}
.slot .sbar{margin-top:12px;height:4px;border-radius:4px;background:rgba(255,255,255,.06);position:relative;overflow:hidden}
.slot.on .sbar{background:rgba(16,185,129,.45)}
.slot.next .sbar::after{content:'';position:absolute;top:0;bottom:0;left:0;width:32%;background:linear-gradient(90deg,transparent,var(--gold),transparent);animation:shimmer 1.8s infinite}

/* Question meta + progress */
.qmeta{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:0 2px}
.qmeta .qn{display:flex;align-items:center;gap:10px}
.qmeta .idx{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9px;background:#122f24;border:1px solid rgba(255,198,101,.32);color:var(--gold-hi);font-size:12px;font-weight:700;box-shadow:0 0 12px rgba(255,198,101,.2)}
.qmeta .qt{font-family:var(--serif);font-size:21px;font-weight:500}
.qmeta .qt b{font-weight:500}
.steps{display:flex;gap:10px}
.steps i{flex:1;height:6px;border-radius:6px;background:#0c241c;border:1px solid rgba(255,255,255,.05)}
.steps i.done,.steps i.now{background:linear-gradient(90deg,var(--gold-hi),var(--gold),var(--gold-base));border-color:transparent}
.steps i.done{opacity:.55}
.steps i.now{box-shadow:0 0 12px rgba(244,196,106,.6)}

/* Question card */
.qcard{padding:30px 32px 0;overflow:hidden}
.qcard.answer{padding-bottom:30px}
.qcrumb{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:22px}
.tagbox{padding:5px 10px;border-radius:8px;background:#122f24;border:1px solid rgba(255,255,255,.1);font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--soft)}
.vsep{width:1px;height:14px;background:rgba(255,255,255,.15)}
.lvtag{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gold)}
.crumb-call{margin-left:auto}
.stim{display:flex;gap:16px;align-items:flex-start;background:linear-gradient(135deg,#02100a,#071c14);border:1px solid rgba(16,185,129,.2);border-radius:14px;padding:18px 20px;margin-bottom:24px;box-shadow:inset 0 2px 8px rgba(0,0,0,.35)}
.stim-ic{flex:none;display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;background:#122f24;border:1px solid rgba(255,198,101,.3);color:var(--gold-hi);font-size:20px;box-shadow:0 0 12px rgba(255,198,101,.15)}
.context{white-space:pre-line;font-size:17px;line-height:1.6;color:var(--ivory);min-width:0}
.stem{font-family:var(--serif);font-size:28px;font-weight:500;line-height:1.3;letter-spacing:-.01em;margin:0}
.callzone{margin:28px -32px 0;padding:24px 32px 28px;background:linear-gradient(180deg,#081e16,#04120c);border-top:1px solid rgba(16,185,129,.2)}
.tokens{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px}
.token{position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:flex-start;padding:16px 18px;border-radius:16px;border:1px solid;min-height:56px;color:inherit;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:inset 0 1px 1px rgba(255,255,255,.22),inset 0 -2px 4px rgba(0,0,0,.4),0 8px 24px -4px rgba(0,0,0,.5);transition:transform .15s,opacity .3s,box-shadow .3s}
.token>*{position:relative;z-index:1}
.token>.tfill{position:absolute;inset:0;z-index:0;transform:scaleX(0);transform-origin:left center}
.token.RDY>.tfill{background:linear-gradient(90deg,#2c7a50,#3B9263 60%,#52b07f)}
.token.AST>.tfill{background:linear-gradient(90deg,#e5a93c,#f4c46a 60%,#fabc4d)}
.token.PAS>.tfill{background:linear-gradient(90deg,#3c4a45,#56655f 60%,#6b7a74)}
.tokens:not(.locked) .token:hover{transform:translateY(-2px)}
.tokens:not(.locked) .token:active{transform:translateY(1px)}
.token:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
.tokens.locked .token{cursor:default}
.tokens.locked .token:not(.picked){opacity:.35}
.token.picked{transform:scale(1.03);border-color:transparent}
.token.picked>.tfill{transform:scaleX(1);animation:tokenfill .6s cubic-bezier(.25,.8,.3,1)}
.token.RDY.picked{box-shadow:0 0 0 2px #52b07f,0 0 32px rgba(59,146,99,.55)}
.token.AST.picked{box-shadow:0 0 0 2px var(--gold),0 0 32px rgba(244,196,106,.5)}
.token.PAS.picked{box-shadow:0 0 0 2px #8a9893,0 0 28px rgba(110,125,119,.45)}
.token.picked .tn,.token.picked .td,.token.picked .ti{color:#fff;transition:color .25s .25s}
.token.AST.picked .tn,.token.AST.picked .td,.token.AST.picked .ti{color:var(--gold-ink)}
.token.picked .td{opacity:.85}
@keyframes tokenfill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.token .th{display:flex;align-items:center;justify-content:space-between;width:100%;margin-bottom:12px}
.token .tn{font-size:17px;font-weight:600;color:var(--ivory)}
.token .td{font-size:13px;color:var(--soft);margin-top:4px;line-height:1.4}
.token .ti{font-size:20px;opacity:.85;line-height:1}
.token.RDY{background:linear-gradient(180deg,#123829,#0a2319);border-color:rgba(59,146,99,.6)} .token.RDY .ti{color:#34d399}
.token.AST{background:linear-gradient(180deg,#3a280b,#251805);border-color:rgba(229,169,60,.55)} .token.AST .ti{color:var(--gold)}
.token.PAS{background:linear-gradient(180deg,#1e2730,#121921);border-color:rgba(100,116,139,.55)} .token.PAS .ti{color:#94a3b8}
.hint{display:flex;gap:12px;align-items:flex-start;border:1px solid rgba(229,169,60,.4);background:linear-gradient(135deg,rgba(58,40,11,.75),rgba(37,24,5,.75));padding:14px 16px;border-radius:14px;font-size:17px;line-height:1.5;margin-top:22px;color:#F7E7C4}
.hint b{color:var(--gold)}
.hint .ti{color:var(--gold);font-size:20px;line-height:1.3}
.opts{display:grid;gap:12px;margin-top:22px}
.opt{display:flex;align-items:center;gap:14px;width:100%;text-align:left;font:inherit;font-size:18px;line-height:1.4;color:var(--ivory);background:linear-gradient(180deg,#0f2c1f,#0a2219);border:1px solid rgba(16,185,129,.25);border-radius:14px;padding:14px 18px;cursor:pointer;min-height:60px;box-shadow:0 6px 18px -6px rgba(0,0,0,.5);transition:border-color .15s,transform .1s}
.opt b{flex:none;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:rgba(244,196,106,.12);border:1px solid rgba(244,196,106,.35);color:var(--gold);font-size:14px}
.opt:hover,.opt:focus-visible{border-color:var(--gold);outline:none;background:linear-gradient(180deg,#133329,#0c2a1f)}
.opt:active{transform:scale(.985)}

/* Call pills */
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 12px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;border:1px solid;white-space:nowrap}
.chip::before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor;box-shadow:0 0 6px currentColor}
.chip.sm{padding:3px 10px;font-size:11px}
.chip.RDY{background:var(--rdy-bg);border-color:rgba(59,146,99,.6);color:#7FD3A2}
.chip.AST{background:var(--ast-bg);border-color:rgba(229,169,60,.5);color:var(--gold)}
.chip.PAS{background:var(--pas-bg);border-color:rgba(148,163,184,.35);color:#C3CEC9}

/* Big pickers + NFC card hints */
.big{display:grid;gap:14px;margin-top:22px}
.big.two{grid-template-columns:1fr 1fr}
.big.four{grid-template-columns:repeat(4,1fr)}
.pick{position:relative;font:inherit;color:var(--ivory);background:linear-gradient(180deg,#113123,#0c2319);border:1px solid rgba(16,185,129,.3);border-radius:18px;padding:20px 18px;cursor:pointer;text-align:left;min-height:64px;box-shadow:inset 0 1px 1px rgba(255,255,255,.12),0 10px 26px -10px rgba(0,0,0,.6);transition:border-color .15s,transform .1s}
.pick:hover,.pick:focus-visible{border-color:var(--gold);outline:none}
.pick:active{transform:scale(.985)}
.pick b{display:block;font-family:var(--serif);font-weight:600;font-size:28px}
.pick small{display:block;color:var(--soft);font-size:15px;margin-top:6px;line-height:1.45}
.cardhint{cursor:default;border-top:3px solid var(--acc)}
.cardhint:hover{border-color:rgba(16,185,129,.3);border-top-color:var(--acc)}
.cardhint:active{transform:none}
.cardhint .ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.cardhint .ph .ic{color:var(--acc);font-size:20px;animation:pulse 1.8s infinite}
.pillar{background:linear-gradient(180deg,var(--tint),#0a1a12)}
.pdot{width:10px;height:10px;border-radius:50%;background:var(--acc);box-shadow:0 0 8px var(--acc)}
.big.four .pick{text-align:center;padding:24px 8px;border-radius:999px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;max-width:150px;width:100%;justify-self:center}
.big.four .pick b{font-size:46px;color:var(--gold-hi)}

/* Welcome hero */
.hero-head{display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;padding:4px 0 8px}
.hero h1{font-size:46px;line-height:1.08}
.hero .lead{font-size:19px;max-width:560px}
.howto{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:28px}
.hstep{display:flex;flex-direction:column;gap:14px;background:rgba(9,34,24,.8);border:1px solid rgba(16,185,129,.2);border-radius:18px;padding:18px;min-width:0}
.hstep .hh{display:flex;justify-content:space-between;align-items:center}
.hstep .num{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:rgba(244,196,106,.14);border:1px solid rgba(244,196,106,.3);color:var(--gold);font-size:12px;font-weight:700}
.hstep .hh .ic{color:rgba(244,196,106,.85);font-size:20px}
.hstep .ht{font-size:17px;font-weight:600;color:var(--ivory);line-height:1.3}
.hstep .hd{font-size:13px;color:var(--muted);margin-top:3px}
.hx{margin-top:auto;display:grid;gap:6px}
.hx.two{grid-template-columns:1fr 1fr}
.mini{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:8px 10px;border-radius:10px;border:1px solid;font-size:13px;font-weight:600;min-width:0}
.mini small{font-size:11px;font-weight:500;opacity:.7}
.mini.sub{flex-direction:column;justify-content:center;gap:1px;text-align:center;background:linear-gradient(180deg,#113123,#0c2319);border-color:rgba(16,185,129,.3);color:var(--ivory)}
.mini.sub small{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--emerald);font-weight:700;opacity:1}
.mini.lv{justify-content:center;background:rgba(255,255,255,.03);border-color:var(--acc);color:var(--ivory-warm)}
.mini.pl{justify-content:flex-start;padding:6px 8px;font-size:12px;background:var(--tint);border-color:rgba(255,255,255,.1);color:var(--ivory-warm)}
.mini.pl i{width:8px;height:8px;border-radius:50%;background:var(--acc);flex:none}
.mini.RDY{background:linear-gradient(180deg,#0f2c1c,#081810);border-color:rgba(16,185,129,.3);color:#6ee7b7}
.mini.AST{background:linear-gradient(180deg,#281b08,#150f04);border-color:rgba(245,158,11,.3);color:#fcd34d}
.mini.PAS{background:linear-gradient(180deg,#1c2320,#0f1412);border-color:rgba(120,113,108,.3);color:#d6d3d1}
.mini.RDY,.mini.AST,.mini.PAS{justify-content:center}
.mini.out{background:rgba(6,27,18,.9);border-color:rgba(16,185,129,.2);color:var(--ivory);font-weight:500}
.mini.out .d{width:9px;height:9px;border-radius:50%;background:var(--gold);box-shadow:0 0 8px var(--gold);flex:none}

/* Result, class, report */
.score{font-family:var(--serif);font-size:60px;font-weight:600;line-height:1;color:var(--gold-hi)}
.score small{font-size:20px;color:var(--soft);font-weight:400}
.verdict{font-family:var(--serif);font-size:26px;font-weight:600;margin-top:12px}
.verdict.matched{color:var(--ok)} .verdict.over{color:#F3C47A} .verdict.under{color:#9CC3EE}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}
.stat,.tile{background:rgba(7,28,20,.9);border:1px solid var(--line);border-radius:14px;padding:12px 14px;min-width:0}
.stat b{display:block;font-family:var(--serif);font-size:30px;font-weight:600;margin-top:2px}
.qlist{display:grid;gap:10px;margin-top:12px}
.qrow{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.qrow summary{cursor:pointer;display:flex;gap:10px;align-items:center;flex-wrap:wrap;list-style:none}
.qrow summary::-webkit-details-marker{display:none}
.qrow .mark{font-weight:700;min-width:64px}
.mark.ok{color:var(--ok)} .mark.no{color:#F0A08C} .mark.skip{color:var(--muted)}
.qrow .msg{font-size:14px;color:var(--soft);flex-basis:100%}
.qrow .body{margin-top:10px;font-size:14px;line-height:1.5;color:var(--ivory-warm)}
.qrow .body p{margin:6px 0}
.bars{display:grid;gap:8px;margin-top:14px}
.bar{display:grid;grid-template-columns:76px 1fr 76px;align-items:center;gap:10px;font-size:14px;white-space:nowrap}
.bar small{color:var(--gold);font-size:12px}
.bar .track{background:#0a2018;border:1px solid var(--line);border-radius:999px;height:20px;overflow:hidden}
.bar .fill{height:100%;background:var(--pas);border-radius:999px}
.bar.you .fill{background:linear-gradient(90deg,var(--gold-base),var(--gold));box-shadow:0 0 12px rgba(244,196,106,.4)}
.bar.you{font-weight:600}
.legend{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;font-size:12px;color:var(--muted)}
.legend i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:-1px}
.mix{display:flex;height:24px;border-radius:999px;overflow:hidden;border:1px solid var(--line)}
.mix span{display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#fff;min-width:0;overflow:hidden;white-space:nowrap}
.mix .RDY,.mix .good{background:var(--rdy)} .mix .AST,.mix .partial{background:var(--ast);color:var(--gold-ink)} .mix .PAS{background:var(--pas)} .mix .bad{background:var(--bad)}
.mixrow{display:grid;grid-template-columns:72px 1fr;gap:10px;align-items:center;font-size:14px;margin-top:8px}
.sample{display:inline-block;border:1px dashed var(--gold);color:var(--gold);border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.share{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center;margin-top:16px}
.qr{background:#fff;border-radius:14px;padding:10px;width:188px;height:188px;display:flex;align-items:center;justify-content:center;color:#092215;font-size:12px;text-align:center;overflow-wrap:anywhere;box-shadow:0 0 0 1px rgba(244,196,106,.4),0 10px 30px rgba(0,0,0,.5)}
.qr svg{width:100%;height:100%;display:block}
.actions{display:grid;gap:10px}
.link{font-size:12px;color:var(--muted);overflow-wrap:anywhere;margin-top:10px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:56px;font:inherit;font-weight:600;font-size:17px;border:0;border-radius:14px;padding:14px 20px;background:linear-gradient(90deg,#fabc4d,#f4c46a,#e5a93c);color:var(--gold-ink);cursor:pointer;text-decoration:none;text-align:center;box-shadow:0 8px 26px rgba(244,196,106,.3);transition:filter .15s,transform .1s}
.btn:hover{filter:brightness(1.05)}
.btn:active{transform:scale(.985);filter:brightness(.95)}
.btn:disabled{opacity:.6;cursor:default}
.btn.ghost{background:rgba(255,255,255,.04);color:var(--ivory);border:1px solid rgba(93,155,126,.35);box-shadow:none}
.btn.ghost:hover{border-color:var(--gold);filter:none}
.btn.wide{width:100%}
.cta{border-color:rgba(244,196,106,.45);background:linear-gradient(180deg,#123824,#0b2219);box-shadow:0 20px 50px -12px rgba(0,0,0,.6),0 0 35px -10px rgba(244,196,106,.25)}
.cta ul{margin:12px 0 0;padding-left:18px;font-size:15px;line-height:1.65;color:var(--ivory-warm)}
dialog.getreport{width:min(460px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;background:linear-gradient(160deg,#133329,#0b2219);color:var(--ivory);border:1px solid rgba(244,196,106,.55);border-radius:20px;padding:24px;box-shadow:0 30px 80px rgba(0,0,0,.7),0 0 40px -10px rgba(244,196,106,.3)}
dialog.getreport::backdrop{background:rgba(2,12,8,.8);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.field{display:grid;gap:6px;margin-top:14px}
.field input{width:100%;min-height:52px;font:inherit;font-size:17px;color:var(--ivory);background:#071c14;border:1px solid rgba(93,155,126,.35);border-radius:12px;padding:12px 14px}
.field input:focus{border-color:var(--gold);outline:none;box-shadow:0 0 0 3px rgba(244,196,106,.15)}
.dlgclose{float:right;font:inherit;font-size:24px;line-height:1;background:none;border:0;color:var(--muted);cursor:pointer;padding:0 4px}
.row{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.devbar{position:fixed;left:0;right:0;bottom:0;z-index:30;background:rgba(2,12,8,.95);border-top:1px dashed var(--gold);padding:8px 12px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;justify-content:center;font-size:12px}
.devbar b{color:var(--gold);letter-spacing:.1em;margin-right:4px}
.devbar a{color:var(--ivory);text-decoration:none;border:1px solid var(--line);border-radius:6px;padding:5px 8px}
.devbar a:hover{border-color:var(--gold)}
table{border-collapse:collapse;width:100%;font-size:13px}
th,td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:middle}
th{color:var(--muted);font-weight:600;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
code{font-family:ui-monospace,Consolas,monospace;font-size:12px}
.dim{opacity:.45}
.rules{list-style:none;padding:0;margin:14px 0 0;display:grid;gap:10px}
.rules li{display:flex;gap:12px;font-size:15px;line-height:1.4}
.rules b{color:var(--gold);font-variant-numeric:tabular-nums}
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.tile b{display:block;font-family:var(--serif);font-size:28px;font-weight:600;margin-top:4px}
.tile b small{font-size:13px;color:var(--muted);font-weight:400;font-family:var(--sans)}
.tag{display:inline-block;border-radius:999px;padding:2px 9px;font-size:12px;font-weight:600;margin-top:6px}
.tag.good{background:#1E4A31;color:var(--ok)} .tag.mid{background:#3A2E12;color:#F3C47A} .tag.low{background:#3E1F18;color:#F0A08C}
.ticks{list-style:none;padding:0;margin:12px 0 0;display:grid;gap:8px}
.ticks li{padding-left:22px;position:relative;font-size:15px;line-height:1.45;color:var(--ivory-warm)}
.ticks li:before{content:'✓';position:absolute;left:0;color:var(--gold);font-weight:700}
.explain{border-left:3px solid var(--gold);background:rgba(7,28,20,.9);border-radius:8px;padding:10px 14px;margin-top:14px;font-size:14px;line-height:1.5;color:var(--ivory-warm)}
.explain p{margin:0} .explain p+p{margin-top:6px}
.lvls{display:grid;gap:6px;margin-top:12px}
.lvl{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:10px;align-items:center;background:rgba(7,28,20,.9);border:1px solid var(--line);border-radius:10px;padding:7px 10px;font-size:14px}
.lvl.out{opacity:.35}
.lvl .nm small{color:var(--muted);font-size:12px;margin-left:6px}
.lvl .qs{display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}
.qtag{font-size:12px;font-weight:600;border-radius:6px;padding:2px 7px;background:var(--line)}
.qtag.ok{background:#1E4A31;color:var(--ok)} .qtag.no{background:#3E1F18;color:#F0A08C} .qtag.skip{color:var(--muted)}
.drow{display:grid;grid-template-columns:30px auto minmax(0,1fr);gap:10px;align-items:center;font-size:14px;padding:8px 0;border-bottom:1px solid var(--line)}
.drow:last-child{border-bottom:0}
.drow .k-good{color:var(--ok)} .drow .k-partial{color:#F3C47A} .drow .k-bad{color:#F0A08C}
.boxes{display:grid;gap:10px;margin-top:12px}
.box{background:rgba(7,28,20,.9);border:1px solid var(--line);border-left:3px solid var(--acc);border-radius:10px;padding:10px 14px}
.box ul{margin:6px 0 0;padding-left:18px;font-size:14px;line-height:1.5;color:var(--ivory-warm)}
.box li+li{margin-top:4px}

@media (max-width:1100px){.knav{display:none}}
@media (max-width:860px){.howto{grid-template-columns:1fr 1fr}}
@media (max-width:720px){
  .kbar .pill.event{display:none}
  .tokens{grid-template-columns:1fr;gap:10px}
  .token .th{margin-bottom:6px}
  .qcard{padding:22px 20px 0}
  .qcard.answer{padding-bottom:22px}
  .callzone{margin:24px -20px 0;padding:20px 20px 22px}
  .stem{font-size:23px}
  .hero h1{font-size:36px}
  .panel.hero{padding:22px}
}
@media (max-width:480px){
  .kbar-in{padding:10px 14px}
  .kbrand{gap:10px}
  .wordmark{font-size:24px}
  .pill{padding:5px 10px;font-size:10px}
  .screen.booth{padding-top:18px}
  .slots{grid-template-columns:1fr 1fr}
  .slots .slot.skill{grid-column:1/-1}
  .howto{grid-template-columns:1fr}
  .big.two{grid-template-columns:1fr}
  .big.four{grid-template-columns:1fr 1fr}
  .share{grid-template-columns:1fr;justify-items:center}
  .stats{grid-template-columns:1fr 1fr 1fr}
  .bar{grid-template-columns:70px 1fr 70px;gap:8px}
  .stim{padding:14px;gap:12px}
  .context{font-size:16px}
  .score{font-size:50px}
}
`;

const QR_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';

function layout(title, body, { refresh } = {}) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#041710">
${refresh ? `<meta http-equiv="refresh" content="${refresh}">` : ''}
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head><body>${body}</body></html>`;
}

const CALL_NAME = { RDY: 'Ready', AST: 'Assist', PAS: 'Pass' };
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Inline line icons (no icon font, so the booth still renders if Google Fonts is slow).
const ICON = {
  nfc: '<path d="M7 8.5a5 5 0 0 1 0 7"/><path d="M10.5 6a8.5 8.5 0 0 1 0 12"/><path d="M14 3.5a12 12 0 0 1 0 17"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 9.5"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.5"/><path d="M12 16.8h.01"/>',
  skip: '<path d="M5 6l7 6-7 6V6z"/><path d="M13 6l7 6-7 6V6z"/>',
  flask: '<path d="M9 3h6"/><path d="M10 3v6.5L4.6 18.4A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.4-2.6L14 9.5V3"/><path d="M7.5 15h9"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h14"/>',
  chart: '<path d="M3 21h18"/><path d="M6 17v-5"/><path d="M11 17V7"/><path d="M16 17v-8"/>',
};
const icon = (n) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;

// Dark tints behind each skill card (pillar colours from the print kit).
const PILLAR_TINT = { DEP: '#081a28', STR: '#25120c', UNT: '#231705', PIV: '#0f210d' };

const NAV = [
  ['Welcome', ['IDLE']],
  ['Cards', ['DIFFICULTY', 'SKILL']],
  ['Assessment', ['QUESTION', 'ANSWERING', 'ESTIMATE']],
  ['Result', ['RESULT']],
  ['Cohort', ['CLASS', 'SHARE']],
];

function header(s, station) {
  const where = station ? `Station ${station}` : 'DIDAC booth';
  const nav = NAV.map(([name, phases], i) => `<span class="${phases.includes(s.phase) ? 'on' : ''}">${i + 1}. ${name}</span>`).join('');
  return `<header class="kbar"><div class="kbar-in">
<div class="kbrand"><span class="wordmark">Drona<i class="wdot"></i></span><span class="pill live"><i></i>${esc(where)} · NFC active</span></div>
<nav class="knav" aria-label="Progress">${nav}</nav>
<span class="pill event"><i></i>DIDAC Bengaluru 2026</span>
</div></header>`;
}

function questionMeta(s) {
  const n = s.hand.length + 1;
  return `<div class="qmeta"><div class="qn"><span class="idx">${String(n).padStart(2, '0')}</span><span class="qt">Question <b>${n}</b> of ${HAND_SIZE}</span></div>
<span class="pill"><i></i>${s.phase === 'ANSWERING' ? 'Choose your answer' : 'Make your call'}</span></div>`;
}

// Progress through the hand: one bar per question.
function steps(s) {
  let out = '';
  for (let i = 0; i < HAND_SIZE; i++) out += `<i class="${i < s.hand.length ? 'done' : i === s.hand.length ? 'now' : ''}"></i>`;
  return `<div class="steps" aria-label="Question ${s.hand.length + 1} of ${HAND_SIZE}">${out}</div>`;
}

// The three NFC card slots. The slot waiting for the next tap glows gold.
function slots(s) {
  const next = { IDLE: 'subject', DIFFICULTY: 'level', SKILL: 'skill' }[s.phase];
  const band = s.difficulty ? BANDS[s.difficulty] : null;
  const slot = (key, n, label, value, badge) => {
    const cls = ['slot', key, value ? 'on' : '', next === key ? 'next' : ''].filter(Boolean).join(' ');
    const b = next === key ? '<span class="badge gold">Tap now</span>' : badge || (value ? '' : '<span class="badge">Waiting</span>');
    return `<div class="${cls}"><div class="shead"><span class="slab"><i></i>0${n} · ${label}</span><span class="sic">${icon('nfc')}</span></div>
<div class="sbody"><div class="val ${value ? '' : 'empty'}">${value ? esc(value) : 'Tap card —'}</div>${b}</div><div class="sbar"></div></div>`;
  };
  const tapped = '<span class="badge em">Tapped</span>';
  return `<section class="slots" aria-label="Cards on the reader">
${slot('subject', 1, 'Subject', s.subject && CARDS.s[s.subject].name, s.subject ? tapped : '')}
${slot('level', 2, 'Level', band && band.name, band ? tapped : '')}
${slot('skill', 3, 'Skill', s.skill && CARDS.p[s.skill].name, s.skill ? tapped : '')}
</section>`;
}

// Subject · skill tag and the current rung of the skill ladder.
function questionCrumb(s) {
  const lv = s.level ? `<span class="vsep"></span><span class="lvtag">L${s.level} · ${esc(levelName(s.skill, s.level))}</span>` : '';
  const call = s.phase === 'ANSWERING' && s.call ? `<span class="crumb-call"><span class="chip sm ${s.call}">${CALL_NAME[s.call]}</span></span>` : '';
  return `<div class="qcrumb"><span class="tagbox">${esc(CARDS.s[s.subject].name)} · ${esc(CARDS.p[s.skill].name)}</span>${lv}${call}</div>`;
}

function context(q, subject) {
  return q.context ? `<div class="stim"><span class="stim-ic">${icon(subject === 'CIV' ? 'book' : 'flask')}</span><div class="context">${esc(q.context)}</div></div>` : '';
}

const CALL_TOKENS = [
  ['RDY', 'check', 'Answer on your own'],
  ['AST', 'help', 'See a hint first'],
  ['PAS', 'skip', 'Skip it on purpose'],
];

// Each tile is a link to the same /k/ route as the NFC chip. On click (or R/A/P from the button box),
// buttonScript fills the chosen tile with its colour, then follows the link.
function callTokens(station) {
  return `<div class="tokens" id="calls">${CALL_TOKENS.map(([k, ic, title]) => `<a class="token ${k}" data-call="${k}" href="${tapPath('k', k, station)}?src=screen"><span class="tfill" aria-hidden="true"></span><div class="th"><span class="chip ${k}">${CALL_NAME[k]}</span><span class="ti">${icon(ic)}</span></div><span class="tn">${title}</span></a>`).join('')}</div>`;
}

// Welcome screen: four-step "how to play" plaque.
function welcomeHero() {
  const step = (n, ic, title, desc, extra) => `<div class="hstep"><div class="hh"><span class="num">0${n}</span>${icon(ic)}</div>
<div><div class="ht">${title}</div><div class="hd">${desc}</div></div>${extra}</div>`;
  const subjects = `<div class="hx two">${['SCI', 'CIV'].map((k) => `<div class="mini sub"><small>Live</small>${esc(CARDS.s[k].name)}</div>`).join('')}</div>`;
  const levels = ['EASY', 'TOUGH'].map((k) => `<div class="mini lv" style="--acc:${CARDS.d[k].accent}">${esc(CARDS.d[k].name)}</div>`).join('');
  const pillars = ['DEP', 'STR', 'UNT', 'PIV'].map((k) => `<div class="mini pl" style="--acc:${CARDS.p[k].accent};--tint:${PILLAR_TINT[k]}"><i></i>${esc(CARDS.p[k].name)}</div>`).join('');
  const calls = ['RDY', 'AST', 'PAS'].map((k) => `<div class="mini ${k}">${CALL_NAME[k]}</div>`).join('');
  return `<section class="panel hero glow">
<div class="hero-head"><span class="pill gold"><i></i>DIDAC exhibition kiosk</span>
<h1>The Drona Deck<span class="dot">.</span></h1>
<p class="lead">A tactile three-question thinking check for Grade 8. Tap the cards, make your calls, see how you think.</p></div>
<div class="howto">
${step(1, 'nfc', 'Tap a subject card', 'Science or Civics', subjects)}
${step(2, 'layers', 'Tap level + skill', 'Easy or Tough, then a skill lens', `<div class="hx two">${levels}${pillars}</div>`)}
${step(3, 'check', 'Make your call', 'Before each answer', `<div class="hx">${calls}</div>`)}
${step(4, 'chart', 'See your result', 'Guess your score, then compare', `<div class="hx"><div class="mini out"><span style="display:flex;align-items:center;gap:8px"><span class="d"></span>Guess vs. score</span></div><div class="mini out"><span>Class view</span><span class="badge gold">Report</span></div></div>`)}
</div>
</section>`;
}

// ---------- Result, class and question sections (shared by the booth screen and the report page) ----------

const CALIBRATION = {
  matched: (r) => [`Spot on.`, `You guessed ${r.estimate} and got ${r.correct}. Knowing what you know is exactly what Drona measures.`],
  over: (r) => [`More sure than your answers.`, `You guessed ${r.estimate} but got ${r.correct}. This gap between confidence and results is what Drona tracks.`],
  under: (r) => [`Better than you thought.`, `You guessed ${r.estimate} but got ${r.correct}. Trust your thinking a little more.`],
};

function resultSummary(r) {
  const [title, line] = CALIBRATION[r.calibration](r);
  const calls = ['RDY', 'AST', 'PAS'].map((c) => `<span class="chip sm ${c}">${CALL_NAME[c]} ×${r.calls[c]}</span>`).join(' ');
  return `<div class="eyebrow">${esc(r.subject.name)} · ${esc(r.skill.name)} · ${esc(r.difficulty.name)}</div>
<div class="score" style="margin-top:10px">${r.correct}<small> of ${r.total} correct</small></div>
<div class="verdict ${r.calibration}">${esc(title)}</div>
<p class="lead">${esc(line)}</p>
<div class="stats">
  <div class="stat"><span class="eyebrow">Your guess</span><b>${r.estimate}</b></div>
  <div class="stat"><span class="eyebrow">Points</span><b>${r.points}</b></div>
  <div class="stat"><span class="eyebrow">Capability</span><b>${Math.round((r.correct / r.total) * 100)}</b></div>
</div>
<div class="chips">${calls}</div>
<p class="small" style="margin-top:12px">${esc(r.skill.name)} asks: ${esc(r.skill.prompt)} Three questions is a small sample. More questions give a more reliable picture.</p>`;
}

function questionList(r) {
  const rows = r.questions
    .map((q) => {
      const mark = q.call === 'PAS' ? '<span class="mark skip">Skipped</span>' : q.correct ? '<span class="mark ok">✓ Correct</span>' : '<span class="mark no">✗ Not quite</span>';
      const yours = q.choice === null ? 'Passed' : `${LETTERS[q.choice]}. ${q.options[q.choice]}`;
      return `<details class="qrow"><summary><b>Q${q.n}</b><span class="chip sm ${q.call}">${CALL_NAME[q.call]}</span>${mark}<span class="small">L${q.level} · ${esc(q.levelName)}</span><span class="msg">${esc(q.message)}</span></summary>
<div class="body">${q.context ? `<p>${esc(q.context)}</p>` : ''}<p><b>${esc(q.stem)}</b></p>
<p>Your answer: ${esc(yours)}</p><p>Correct answer: ${LETTERS[q.answer]}. ${esc(q.options[q.answer])}</p><p>${esc(q.explanation)}</p></div></details>`;
    })
    .join('');
  return `<div class="eyebrow">Question by question · tap to open</div><div class="qlist">${rows}</div>`;
}

function classComparison(r) {
  const c = r.class;
  const max = Math.max(...c.scoreDist, 1);
  const bars = c.scoreDist
    .map((count, n) => {
      const you = n === r.correct;
      return `<div class="bar ${you ? 'you' : ''}"><span>${n} correct${you ? '<br><small>You</small>' : ''}</span><div class="track"><div class="fill" style="width:${Math.round((count / max) * 100)}%"></div></div><span>${count} pupil${count === 1 ? '' : 's'}</span></div>`;
    })
    .join('');
  const mix = (m) =>
    ['RDY', 'AST', 'PAS']
      .filter((k) => m[k] > 0)
      .map((k) => `<span class="${k}" style="flex:${m[k]}" title="${CALL_NAME[k]} ${m[k]}%">${m[k] >= 25 ? `${CALL_NAME[k]} ${m[k]}%` : m[k] >= 8 ? `${m[k]}%` : ''}</span>`)
      .join('');
  const youCal = {
    matched: `You were one of the ${c.calibration.matched} who guessed exactly.`,
    over: `You were one of the ${c.calibration.over} who were more sure.`,
    under: 'You were more modest than your result.',
  }[r.calibration];
  return `<div class="row" style="margin-top:0;align-items:center"><span class="eyebrow">Compared with the class</span><span class="sample">Sample data</span></div>
<h2 style="margin-top:8px">You scored higher than ${c.lower} of ${c.size} pupils.</h2>
<p class="lead">${c.same} scored the same as you and ${c.higher} scored higher. The class average was ${c.avgCorrect} of ${r.total}.</p>
<div class="bars">${bars}</div>
<div class="eyebrow" style="margin-top:20px">Knowing what you know</div>
<p class="lead">${c.calibration.matched} of ${c.size} guessed their own score exactly. ${c.calibration.over} were more sure than their results. ${youCal}</p>
<div class="eyebrow" style="margin-top:20px">How calls were made</div>
<div class="mixrow"><span>Class</span><div class="mix">${mix(c.callMix.class)}</div></div>
<div class="mixrow"><span><b>You</b></span><div class="mix">${mix(c.callMix.you)}</div></div>
<div class="legend"><span><i style="background:var(--rdy)"></i>Ready</span><span><i style="background:var(--ast)"></i>Assist</span><span><i style="background:var(--pas)"></i>Pass</span></div>
<p class="small" style="margin-top:12px">This is an illustrative Grade 8 class of ${c.size}. In a school pilot, this view shows your real class, with each pupil’s thinking, decisions and confidence over the term.</p>`;
}

// ---------- Rule-based analytics (server/insights.js) ----------

function glanceSection(r, ins) {
  const tile = (label, value, unit, tag) =>
    `<div class="tile"><span class="eyebrow">${esc(label)}</span><b>${value}${unit ? `<small> ${esc(unit)}</small>` : ''}</b>${tag ? `<span class="tag ${tag.tone}">${esc(tag.label)}</span>` : ''}</div>`;
  return `<div class="eyebrow">At a glance</div>
<ul class="ticks">${ins.glance.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
<div class="tiles">
  ${tile('Score', r.correct, `of ${r.total} · ${r.points} ${r.points === 1 ? 'point' : 'points'}`)}
  ${tile('Thinking depth', ins.depth.score, '/100', ins.depth)}
  ${tile('Decision-making', ins.decision.score, '/100', ins.decision)}
  ${tile('Knowing what you know', r.estimate, `guessed · got ${r.correct}`, ins.calibration)}
</div>`;
}

function depthSection(r, ins) {
  const qtag = (q) => `<span class="qtag ${q.call === 'PAS' ? 'skip' : q.correct ? 'ok' : 'no'}">Q${q.n} ${q.call === 'PAS' ? 'pass' : q.correct ? '✓' : '✗'}</span>`;
  const rows = [...ins.depth.ladder].reverse()
    .map((l) => `<div class="lvl ${l.inBand ? '' : 'out'}"><b>L${l.level}</b><span class="nm">${esc(l.name)}${l.inBand ? '' : '<small>other band</small>'}</span><span class="qs">${l.questions.map(qtag).join('')}</span></div>`)
    .join('');
  return `<div class="eyebrow">Thinking depth</div>
<h2 style="margin-top:6px">${ins.depth.score}<span class="small" style="font-family:var(--sans)">/100</span> <span class="tag ${ins.depth.tone}" style="vertical-align:middle">${esc(ins.depth.label)}</span></h2>
<p class="lead">How far up the ${esc(r.skill.name)} ladder your right answers reached. Higher levels count for more, and a hint takes a quarter off.</p>
<div class="lvls">${rows}</div>
<div class="explain">${ins.depth.text.map((t) => `<p>${esc(t)}</p>`).join('')}</div>`;
}

function decisionSection(r, ins) {
  const { mix } = ins.decision;
  const seg = (k, label) => (mix[k] ? `<span class="${k}" style="flex:${mix[k]}">${label} ${mix[k]}</span>` : '');
  const rows = ins.decision.decisions
    .map((d) => `<div class="drow"><b>Q${d.n}</b><span class="chip sm ${d.call}">${CALL_NAME[d.call]}</span><span class="k-${d.kind}">${d.call === 'PAS' ? 'Skipped' : d.correct ? '✓' : '✗'} · ${esc(d.label)}</span></div>`)
    .join('');
  return `<div class="eyebrow">Decision-making</div>
<h2 style="margin-top:6px">${ins.decision.score}<span class="small" style="font-family:var(--sans)">/100</span> <span class="tag ${ins.decision.tone}" style="vertical-align:middle">${esc(ins.decision.label)}</span></h2>
<p class="lead">Whether each call (Ready, Assist or Pass) fitted what you actually knew.</p>
<div class="mix" style="margin-top:12px">${seg('good', 'Good')}${seg('partial', 'Partial')}${seg('bad', 'Rethink')}</div>
<div class="legend"><span><i style="background:var(--rdy)"></i>Good</span><span><i style="background:var(--ast)"></i>Partial</span><span><i style="background:var(--bad)"></i>Needs a rethink</span></div>
<div style="margin-top:10px">${rows}</div>
${ins.decision.text.length ? `<div class="explain">${ins.decision.text.map((t) => `<p>${esc(t)}</p>`).join('')}</div>` : ''}`;
}

function nextStepsSection(ins) {
  const box = (title, acc, items) => `<div class="box" style="--acc:${acc}"><b>${esc(title)}</b><ul>${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
  return `<div class="eyebrow">Strengths, focus areas and next steps</div>
<div class="boxes">${box('Strengths', 'var(--ok)', ins.strengths)}${box('Focus areas', 'var(--ast)', ins.focus)}${box('Next steps', 'var(--gold)', ins.next)}</div>`;
}

function reportWhen(r) {
  return new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// "Get my complete report" button and the pop-up form (name, phone, email). On the shared booth device
// autocomplete is off, so the next visitor never sees the previous visitor's details.
function reportForm(action, { booth = false, open = false } = {}) {
  const ac = (v) => (booth ? 'off' : v);
  return `<button class="btn wide" type="button" id="getreport" data-open="${open ? '1' : ''}">Get my complete report →</button>
<dialog class="getreport" id="email" aria-labelledby="gr-title">
<form method="post" action="${esc(action)}">
<button class="dlgclose" type="button" aria-label="Close" data-close>×</button>
<div class="eyebrow">Complete report</div>
<h2 id="gr-title" style="margin-top:6px">Where should we send it<span class="dot">?</span></h2>
<p class="small" style="margin:6px 0 0">We’ll email your full report with every analytics section.</p>
<label class="field"><span class="eyebrow">Name</span><input type="text" name="name" required maxlength="80" autocomplete="${ac('name')}" placeholder="Your name"></label>
<label class="field"><span class="eyebrow">Phone number</span><input type="tel" name="phone" required maxlength="20" minlength="7" inputmode="tel" autocomplete="${ac('tel')}" placeholder="98765 43210"></label>
<label class="field"><span class="eyebrow">Email</span><input type="email" name="email" required maxlength="254" inputmode="email" autocomplete="${ac('email')}" placeholder="you@gmail.com"></label>
<button class="btn wide" type="submit" style="margin-top:16px">Send my report</button>
<p class="small" style="margin:8px 0 0">We save these details only to send you this report and follow up about Drona.</p>
</form></dialog>
<script>
(function () {
  var dlg = document.getElementById('email'), btn = document.getElementById('getreport');
  if (!dlg || !btn) return;
  function show() { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); var f = dlg.querySelector('input'); if (f) f.focus(); }
  btn.addEventListener('click', show);
  dlg.querySelector('[data-close]').addEventListener('click', function () { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); });
  if (btn.dataset.open) show();
  var form = dlg.querySelector('form'), submit = form.querySelector('button[type=submit]');
  form.addEventListener('submit', function (e) {
    if (submit.disabled) { e.preventDefault(); return; }
    setTimeout(function () { submit.disabled = true; submit.textContent = 'Sending…'; }, 0);
  });

})();
</script>`;
}

const MAIL_RESULT = {
  sent: ['info', 'Report sent. Check your inbox (and the spam folder).'],
  saved: ['info', 'Details saved. The Drona team will send your report shortly.'],
  failed: ['warn', 'Details saved, but sending failed just now. The Drona team will send your report.'],
  'invalid-name': ['warn', 'Please enter your name.'],
  'invalid-phone': ['warn', 'That phone number doesn’t look right. Please check it and try again.'],
  invalid: ['warn', 'That email address doesn’t look right. Please check it and try again.'],
  limit: ['warn', 'This report has already been emailed the maximum number of times.'],
};

// The emailed report: Forest Gold kiosk look, built from tables with inline styles (mail apps drop <style>,
// Outlook ignores most CSS). Dark backgrounds are set with bgcolor too, so clients keep them.
function reportEmail(r, url, { name } = {}) {
  const ins = buildInsights(r);
  const C = {
    bg: '#041710', card: '#0D251D', well: '#081B14', line: '#1F4636', ink: '#F7FAF8', soft: '#A9C1B6', muted: '#7F9A8E',
    gold: '#F4C46A', goldBase: '#E5A93C', goldInk: '#281900', goodTx: '#8FD3A8', goodBg: '#123724', midTx: '#F3C47A', midBg: '#3B2A0D', lowTx: '#F0A08C', lowBg: '#3E1F18',
  };
  const SERIF = "'Newsreader',Georgia,'Times New Roman',serif";
  const SANS = "'Geist','Segoe UI',Helvetica,Arial,sans-serif";
  const TONE = { good: [C.goodTx, C.goodBg], mid: [C.midTx, C.midBg], low: [C.lowTx, C.lowBg] };
  const KIND = { good: C.goodTx, partial: C.midTx, bad: C.lowTx };
  const CHIP = { RDY: ['#7FD3A2', C.goodBg, '#2E6E4A'], AST: [C.gold, C.midBg, '#7A5A1E'], PAS: ['#C3CEC9', '#1B2421', '#3A4743'] };
  const VERDICT = { matched: C.goodTx, over: C.midTx, under: '#9CC3EE' };
  const [verdictTitle, verdictLine] = CALIBRATION[r.calibration](r);

  const tag = (b) => `<span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;color:${TONE[b.tone][0]};background:${TONE[b.tone][1]}">${esc(b.label)}</span>`;
  const chip = (k, label) => `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 12px;border-radius:999px;border:1px solid ${CHIP[k][2]};background:${CHIP[k][1]};color:${CHIP[k][0]};font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">&#9679; ${esc(label)}</span>`;
  const eyebrow = (t, color = C.muted) => `<div style="font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${color};margin:0 0 10px">${esc(t)}</div>`;
  const card = (inner, border = C.line) => `<tr><td style="padding:0 0 14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.card}" style="background:${C.card};border:1px solid ${border};border-radius:16px"><tr><td style="padding:22px">${inner}</td></tr></table></td></tr>`;
  const paras = (ts) => ts.map((t) => `<p style="margin:8px 0 0;font-size:14px;line-height:1.55;color:${C.soft}">${esc(t)}</p>`).join('');
  const ticks = (ts) => ts.map((t) => `<tr><td width="22" valign="top" style="color:${C.gold};font-weight:700;font-size:14px;line-height:1.55">&#10003;</td><td style="font-size:14px;line-height:1.55;color:${C.ink};padding:0 0 6px">${esc(t)}</td></tr>`).join('');
  const big = (value, unit) => `<span style="font-family:${SERIF};font-size:30px;font-weight:600;color:${C.ink}">${esc(value)}</span><span style="font-size:13px;color:${C.muted}"> ${esc(unit)}</span>`;
  const tile = (label, value, unit, b) => `<td width="50%" valign="top" style="padding:5px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.well}" style="background:${C.well};border:1px solid ${C.line};border-radius:12px"><tr><td style="padding:12px 14px">
<div style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${C.muted}">${esc(label)}</div>
<div style="margin:4px 0 6px">${big(value, unit)}</div>${b ? tag(b) : ''}</td></tr></table></td>`;
  const cell = `padding:9px 6px;border-top:1px solid ${C.line};font-size:14px;color:${C.ink}`;
  const callCell = (k) => `<td style="${cell}"><span style="color:${CHIP[k][0]};font-weight:600">${CALL_NAME[k]}</span></td>`;
  const depthRows = r.questions.map((q) => `<tr><td style="${cell}"><b>Q${q.n}</b></td><td style="${cell};color:${C.soft}">L${q.level} · ${esc(q.levelName)}</td>${callCell(q.call)}
<td align="right" style="${cell};color:${q.call === 'PAS' ? C.muted : q.correct ? C.goodTx : C.lowTx};font-weight:600">${q.call === 'PAS' ? 'Passed' : q.correct ? '&#10003; Correct' : '&#10007; Not quite'}</td></tr>`).join('');
  const decRows = ins.decision.decisions.map((d) => `<tr><td style="${cell}"><b>Q${d.n}</b></td>${callCell(d.call)}<td align="right" style="${cell};color:${KIND[d.kind]};font-weight:600">${esc(d.label)}</td></tr>`).join('');
  const box = (title, color, items) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.well}" style="background:${C.well};border:1px solid ${C.line};border-left:3px solid ${color};border-radius:10px;margin-top:10px"><tr><td style="padding:12px 16px">
<b style="font-size:14px;color:${color}">${esc(title)}</b>
<ul style="margin:6px 0 0;padding-left:18px;font-size:14px;line-height:1.55;color:${C.ink}">${items.map((t) => `<li style="margin:3px 0">${esc(t)}</li>`).join('')}</ul></td></tr></table>`;
  const score = (n, b) => `<div><span style="font-family:${SERIF};font-size:30px;font-weight:600;color:${C.ink}">${n}</span><span style="font-size:13px;color:${C.muted}">/100</span>&nbsp; ${tag(b)}</div>`;
  const preheader = `${r.correct} of ${r.total} correct · Thinking depth ${ins.depth.score}/100 · Decision-making ${ins.decision.score}/100`;

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap" rel="stylesheet">
<title>Your Drona report</title></head>
<body bgcolor="${C.bg}" style="margin:0;padding:0;background:${C.bg};color:${C.ink};font-family:${SANS}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg}">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.bg}" style="background:${C.bg}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:0 2px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" style="font-family:${SERIF};font-size:30px;font-weight:500;color:#ffc665;line-height:1">Drona<span style="color:${C.gold}">.</span></td>
<td align="right" valign="middle"><span style="display:inline-block;padding:5px 12px;border-radius:999px;border:1px solid #3A3214;background:#1A1A0C;color:${C.gold};font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">&#9679; DIDAC Bengaluru 2026</span></td>
</tr></table>
<div style="height:1px;background:${C.line};margin:16px 0 0;line-height:1px;font-size:1px">&nbsp;</div></td></tr>
${card(`${eyebrow(`Quick Hand report · ${r.subject.name} · ${r.skill.name} · ${r.difficulty.name}`, C.gold)}
${name ? `<p style="margin:0 0 14px;font-size:16px;line-height:1.5;color:${C.ink}">Hi ${esc(name)}, here is your complete Drona report.</p>` : ''}
<div style="font-family:${SERIF};font-size:56px;font-weight:600;line-height:1;color:#ffc665">${r.correct}<span style="font-size:20px;font-weight:400;color:${C.soft}"> of ${r.total} correct</span></div>
<div style="font-family:${SERIF};font-size:24px;font-weight:600;margin:14px 0 0;color:${VERDICT[r.calibration]}">${esc(verdictTitle)}</div>
<p style="margin:6px 0 14px;font-size:15px;line-height:1.55;color:${C.soft}">${esc(verdictLine)}</p>
<div>${['RDY', 'AST', 'PAS'].map((k) => chip(k, `${CALL_NAME[k]} ×${r.calls[k]}`)).join('')}</div>
<div style="font-size:12px;color:${C.muted};margin-top:8px">${esc(reportWhen(r))} IST</div>`, '#5C4A1E')}
${card(`${eyebrow('At a glance')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${ticks(ins.glance)}</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px"><tr>${tile('Score', `${r.correct}`, `of ${r.total} · ${r.points} ${r.points === 1 ? 'point' : 'points'}`)}${tile('Thinking depth', `${ins.depth.score}`, '/100', ins.depth)}</tr>
<tr>${tile('Decision-making', `${ins.decision.score}`, '/100', ins.decision)}${tile('Knowing what you know', `${r.estimate}`, `guessed · got ${r.correct}`, ins.calibration)}</tr></table>`)}
${card(`${eyebrow('Thinking depth')}${score(ins.depth.score, ins.depth)}
<p style="margin:8px 0 0;font-size:14px;line-height:1.55;color:${C.soft}">How far up the ${esc(r.skill.name)} ladder your right answers reached. Higher levels count for more; a hint takes a quarter off.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">${depthRows}</table>${paras(ins.depth.text)}`)}
${card(`${eyebrow('Decision-making')}${score(ins.decision.score, ins.decision)}
<p style="margin:8px 0 0;font-size:14px;line-height:1.55;color:${C.soft}">Whether each call (Ready, Assist or Pass) fitted what you actually knew. Good ${ins.decision.mix.good} · Partial ${ins.decision.mix.partial} · Needs a rethink ${ins.decision.mix.bad}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px">${decRows}</table>${paras(ins.decision.text)}`)}
${card(`${eyebrow('Strengths, focus areas and next steps')}${box('Strengths', C.goodTx, ins.strengths)}${box('Focus areas', C.midTx, ins.focus)}${box('Next steps', C.gold, ins.next)}`)}
${url ? `<tr><td align="center" style="padding:6px 0 20px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="${C.gold}" style="border-radius:14px;background:${C.gold};background-image:linear-gradient(90deg,#fabc4d,#f4c46a,#e5a93c)">
<a href="${esc(url)}" style="display:inline-block;padding:16px 28px;font-family:${SANS};font-size:16px;font-weight:600;color:${C.goldInk};text-decoration:none;border-radius:14px">See every question and answer &rarr;</a></td></tr></table></td></tr>` : ''}
<tr><td style="padding:0 4px;font-size:12px;line-height:1.6;color:${C.muted}">Drona measures how students think, how they decide and how well they know their own ability. These analytics are worked out by fixed rules from three questions, so they are a quick snapshot, not a full assessment. You received this because this address was entered at the Drona booth.</td></tr>
</table></td></tr></table></body></html>`;

  return {
    subject: `Your Drona Quick Hand report: ${r.subject.name} · ${r.skill.name}`,
    text: (name ? `Hi ${name}, here is your complete Drona report.\n\n` : '') + insightsEmail(r, ins, url, `${reportWhen(r)} IST`),
    html,
  };
}

// Teaser under the preview: what the complete report adds.
function reportCta(action, opts) {
  return `<section class="panel cta"><div class="eyebrow">This is a preview</div>
<h2 style="margin-top:6px">Get your complete report<span class="dot">.</span></h2>
<ul><li>Thinking depth: how far up the skill ladder you reached</li><li>Decision-making: whether each Ready / Assist / Pass call fitted</li><li>Your strengths, focus areas and next steps</li><li>Every question with the correct answer explained</li></ul>
<div style="margin-top:14px">${reportForm(action, opts)}</div></section>`;
}

// ---------- Booth screens ----------

function phaseBody(s, { report, reportUrl, station }) {
  const form = { booth: true, open: Boolean(s.openForm) };
  switch (s.phase) {
    case 'IDLE':
      return welcomeHero();

    case 'DIFFICULTY':
      return `<section class="panel glow"><div class="eyebrow gold">${esc(CARDS.s[s.subject].name)} chosen</div>
<h1 style="margin-top:8px">Now tap a level card<span class="dot">.</span></h1>
<p class="lead">Place an Easy or Tough card on the reader.</p>
<div class="big two">${['EASY', 'TOUGH'].map((k) => `<div class="pick cardhint" style="--acc:${CARDS.d[k].accent}"><div class="ph"><span class="badge em">L${BANDS[k].min}–${BANDS[k].max}</span>${icon('nfc')}</div><b>${esc(CARDS.d[k].name)}</b><small>${esc(CARDS.d[k].prompt)}</small></div>`).join('')}</div>${s.skill ? `<p class="small" style="margin-top:14px">${esc(CARDS.p[s.skill].name)} is saved. Your hand starts as soon as you tap a level card.</p>` : ''}</section>`;

    case 'SKILL':
      return `<section class="panel glow"><div class="eyebrow gold">${esc(CARDS.s[s.subject].name)} · ${esc(BANDS[s.difficulty].name)}</div>
<h1 style="margin-top:8px">Now tap a skill card<span class="dot">.</span></h1>
<p class="lead">Pick the thinking lens for your three questions.</p>
<div class="big two">${['DEP', 'STR', 'UNT', 'PIV'].map((k) => `<div class="pick cardhint pillar" style="--acc:${CARDS.p[k].accent};--tint:${PILLAR_TINT[k]}"><div class="ph"><span class="pdot"></span>${icon('nfc')}</div><b>${esc(CARDS.p[k].name)}</b><small>${esc(CARDS.p[k].prompt)}</small></div>`).join('')}</div></section>`;

    case 'QUESTION':
      return `<section class="panel glow qcard">${questionCrumb(s)}
${context(s.question, s.subject)}<p class="stem">${esc(s.question.stem)}</p>
<div class="callzone"><div class="eyebrow gold">Declare your call · tap a chip on the reader or a tile below</div>
<p class="small" style="margin:4px 0 0">Choose how you will answer before you see the options.</p>
${callTokens(station)}</div>
</section>`;

    case 'ANSWERING': {
      const q = s.question;
      const opts = q.options
        .map((o, i) => `<button class="opt" name="choice" value="${i}" data-key="${i + 1}"><b>${LETTERS[i]}</b><span>${esc(o)}</span></button>`)
        .join('');
      return `<section class="panel glow qcard answer">${questionCrumb(s)}
${context(q, s.subject)}<p class="stem">${esc(q.stem)}</p>
${s.call === 'AST' ? `<div class="hint"><span class="ti">${icon('help')}</span><div><b>Hint.</b> ${esc(q.hint)}</div></div>` : ''}
<form method="post" action="/answer"><input type="hidden" name="qid" value="${esc(q.id)}"><div class="opts">${opts}</div></form>
</section>`;
    }

    case 'ESTIMATE': {
      const picks = Array.from({ length: HAND_SIZE + 1 }, (_, n) => `<button class="pick" name="n" value="${n}" data-key="${n}"><b>${n}</b></button>`).join('');
      return `<section class="panel glow"><div class="eyebrow gold">All ${HAND_SIZE} questions done</div>
<h1 style="margin-top:8px">How many do you think you got right<span class="dot">?</span></h1>
<p class="lead">Be honest. Knowing what you know is part of your result.</p>
<form method="post" action="/estimate" class="big four">${picks}</form></section>`;
    }

    case 'RESULT':
      if (!report) break;
      // Preview only; the complete report is emailed once the visitor gives their details.
      return `<section class="panel">${resultSummary(report)}</section>
<section class="panel">${glanceSection(report, buildInsights(report))}</section>
${reportCta('/email', form)}
<form method="post" action="/goto"><button class="btn ghost" name="to" value="CLASS" style="width:100%">Compare with the class →</button></form>`;

    case 'CLASS':
      if (!report) break;
      return `<section class="panel">${classComparison(report)}</section>
<div class="row" style="margin-top:0">
<form method="post" action="/goto" style="flex:1"><button class="btn ghost" name="to" value="RESULT" style="width:100%">← My result</button></form>
<form method="post" action="/goto" style="flex:2"><button class="btn" name="to" value="SHARE" style="width:100%">Share my report →</button></form></div>`;

    case 'SHARE': {
      if (!report) break;
      return `<section class="panel"><div class="eyebrow">Share report</div>
<h1>Take your report with you<span class="dot">.</span></h1>
<div style="margin-top:14px">${reportForm('/email', form)}</div>
<div class="share">
  <div class="qr" id="qr" data-url="${esc(reportUrl)}">Scan code loading…</div>
  <div class="actions">
    <p class="lead" style="margin:0">Or scan the code with your phone camera to open your report.</p>
    <button class="btn ghost" type="button" id="copy" data-url="${esc(reportUrl)}">Copy link</button>
  </div>
</div>
<p class="link">${esc(reportUrl)}</p></section>
<section class="panel"><div class="eyebrow">Play again</div>
<p class="lead">Tap another skill card for a new hand in ${esc(report.subject.name)}, or a subject card to switch subject.</p>
<div class="row"><form method="post" action="/goto"><button class="btn ghost" name="to" value="CLASS">← Class view</button></form>
<form method="post" action="/new"><button class="btn">New player</button></form></div></section>
${shareScript()}`;
    }
  }
  return `<section class="panel"><h1>Tap a subject card to begin<span class="dot">.</span></h1></section>`;
}

// QR code drawn in the browser; if the library can't load (offline booth), the link text still shows.
function shareScript() {
  return `<script src="${QR_LIB}"></script>
<script>
(function () {
  var el = document.getElementById('qr');
  if (el) {
    if (typeof qrcode === 'function') {
      var q = qrcode(0, 'M'); q.addData(el.dataset.url); q.make();
      el.innerHTML = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    } else {
      el.textContent = 'Scan code unavailable offline. Use the link below.';
    }
  }
  var copy = document.getElementById('copy');
  if (copy) copy.addEventListener('click', function () {
    var done = function () { copy.textContent = 'Link copied'; };
    if (navigator.clipboard) navigator.clipboard.writeText(copy.dataset.url).then(done, function () { copy.textContent = 'Copy failed'; });
  });
})();
</script>`;
}

function devBar(set) {
  const links = [
    ['s', 'SCI', 'Science'], ['s', 'CIV', 'Civics'], ['d', 'EASY', 'Easy'], ['d', 'TOUGH', 'Tough'], ['p', 'DEP', 'Depth'], ['p', 'STR', 'Stretch'], ['p', 'UNT', 'Untangle'], ['p', 'PIV', 'Pivot'],
    ['k', 'RDY', 'Ready'], ['k', 'AST', 'Assist'], ['k', 'PAS', 'Pass'], ['r', 'R', 'Rules'], ['s', 'ENG', 'English (off)'],
  ]
    .map(([k, c, n]) => `<a href="${tapPath(k, c, set)}">${esc(n)}</a>`)
    .join('');
  return `<nav class="devbar"><b>DEV TAP</b>${links}<a href="/dev">Tools</a></nav>`;
}

// The call button box is a USB/Bluetooth keyboard: R/A/P (or F13/F14/F15) send Ready/Assist/Pass
// through the same /k/ routes as the chips. Other keys press the on-screen button with a matching
// data-key: 1-4 for an answer, 0-3 for the estimate. Easy/Tough are NFC cards only.
function buttonScript(station) {
  return `<script>
(function () {
  var station = ${station ? Number(station) : 'null'};
  var calls = { r: 'RDY', a: 'AST', p: 'PAS', F13: 'RDY', F14: 'AST', F15: 'PAS' };
  var busy = false;
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Fill only the chosen call tile, dim the others, then go. Without tiles on screen, go at once.
  function pick(code, href) {
    var box = document.getElementById('calls');
    var tile = box && box.querySelector('[data-call="' + code + '"]');
    if (!tile) { location.href = href; return; }
    box.classList.add('locked');
    tile.classList.add('picked');
    setTimeout(function () { location.href = href; }, still ? 120 : 700);
  }
  var box = document.getElementById('calls');
  if (box) box.addEventListener('click', function (e) {
    var tile = e.target.closest('[data-call]');
    if (!tile) return;
    e.preventDefault();
    if (busy) return;
    busy = true;
    pick(tile.dataset.call, tile.getAttribute('href'));
  });
  document.addEventListener('keydown', function (e) {
    if (busy || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    // Typing an email address must not fire Ready/Assist/Pass or press an answer button.
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (calls[k]) {
      busy = true;
      e.preventDefault();
      pick(calls[k], '/k/' + calls[k] + (station ? '/' + station : '') + '?src=button');
      return;
    }
    var btn = document.querySelector('button[data-key="' + k + '"]');
    if (btn) { busy = true; e.preventDefault(); btn.click(); }
  });
})();
</script>`;
}

function playPage(s, { devTools, station, report = null, reportUrl = null }) {
  const n = s.notice ? `<div class="notice ${s.notice.tone}" role="status">${esc(s.notice.text)}</div>` : '';
  const done = ['RESULT', 'CLASS', 'SHARE'].includes(s.phase);
  const inHand = s.phase === 'QUESTION' || s.phase === 'ANSWERING';
  return layout(
    'Drona Deck',
    `${header(s, station)}<main class="screen booth">${n}${inHand ? questionMeta(s) : ''}${done ? '' : slots(s)}${inHand ? steps(s) : ''}${phaseBody(s, { report, reportUrl, station })}</main>${devTools ? devBar(station || 1) : ''}${buttonScript(station)}`,
  );
}

// ---------- Shareable report (opened on the visitor's own phone) ----------

function reportPage(r, { url, mail = null }) {
  const ins = buildInsights(r);
  const mailNotice = MAIL_RESULT[mail] ? `<div class="notice ${MAIL_RESULT[mail][0]}" role="status" style="margin-bottom:12px">${esc(MAIL_RESULT[mail][1])}</div>` : '';
  const reopen = ['invalid', 'invalid-name', 'invalid-phone'].includes(mail);
  return layout(
    `Drona report · ${r.subject.name}`,
    `<main class="screen" style="padding-bottom:32px">
<header class="top"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">Quick Hand report<br>${esc(reportWhen(r))} IST</span></header>
<section class="panel">${resultSummary(r)}</section>
<section class="panel">${glanceSection(r, ins)}</section>
<section class="panel">${depthSection(r, ins)}</section>
<section class="panel">${decisionSection(r, ins)}</section>
<section class="panel">${nextStepsSection(ins)}</section>
<section class="panel">${questionList(r)}</section>
<section class="panel">${classComparison(r)}</section>
<section class="panel"><div class="eyebrow">About Drona</div>
<p class="lead">Drona measures how students think, how they decide, and how well they know their own ability, not just whether an answer was right. Every question starts with a call: answer alone, ask for a hint, or pass.</p>
<p class="small">These analytics are worked out by fixed rules from this hand's three questions, so they are a quick snapshot, not a full assessment.</p></section>
<section class="panel">${mailNotice}<div class="eyebrow" style="margin-bottom:10px">Email this report</div>${reportForm(`/report/${r.id}/email`, { open: reopen })}</section>
</main>`,
  );
}

function reportMissingPage() {
  return layout(
    'Report not found',
    `<main class="screen"><header class="top"><span class="wordmark">Drona<span class="dot">.</span></span></header>
<section class="panel"><div class="eyebrow">Report not found</div><h1>We can’t find this report<span class="dot">.</span></h1>
<p class="lead">The link may be incomplete, or the report has expired. Please ask the Drona team at the booth.</p></section></main>`,
  );
}

function unknownCardPage(tap, { devTools }) {
  return layout(
    'Unknown card',
    `<main class="screen"><header class="top"><span class="wordmark">Drona<span class="dot">.</span></span></header>
<section class="panel"><div class="eyebrow">Unknown card</div><h1>We don’t recognise this card<span class="dot">.</span></h1>
<p class="lead">Code <code>${esc(tap.code)}</code> isn’t in the Drona Deck. Please hand it to the booth team.</p>
<p style="margin-top:16px"><a class="btn" href="/play">Back to the game</a></p></section></main>${devTools ? devBar(1) : ''}`,
  );
}

function notFoundPage() {
  return layout('Not found', `<main class="screen"><section class="panel"><h1>Not found<span class="dot">.</span></h1><p><a href="/play">Go to the game</a></p></section></main>`);
}

// ---------- Dev tools ----------

function devIndexPage(baseUrl) {
  return layout(
    'Drona Deck dev tools',
    `<main class="screen"><header class="top"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">Dev tools</span></header>
<section class="panel"><div class="eyebrow">Testing without cards</div>
<ul class="rules" style="list-style:disc;padding-left:18px;display:block">
<li style="display:list-item"><a href="/dev/deck">Simulator</a>: click cards and watch the phone screen, state and tap log update.</li>
<li style="display:list-item"><a href="/dev/codes">Code map + QR codes</a>: all 33 tag URLs. Scan a QR with a phone to "tap" a card.</li>
<li style="display:list-item"><a href="/dev/codes.csv">codes.csv</a>: the URLs to write onto the NFC tags.</li>
<li style="display:list-item"><a href="/dev/log">Tap log</a>: every tap with set number and outcome.</li>
<li style="display:list-item"><a href="/dev/emails">Saved contacts</a>: name, phone and email visitors entered, and whether the report was sent.</li>
<li style="display:list-item"><a href="/play">Player screen</a></li>
</ul>
<p class="lead">Tag base URL: <code>${esc(baseUrl)}</code></p></section></main>`,
  );
}

function devDeckPage() {
  const group = (kind, title) =>
    `<div class="eyebrow" style="margin-top:12px">${title}</div><div class="simgrid">` +
    Object.entries(CARDS[kind])
      .map(([code, c]) => `<button class="sim ${c.active ? '' : 'off'}" data-kind="${kind}" data-code="${code}" style="--acc:${c.accent || 'var(--gold)'}">${esc(c.name)}<small>${code}${c.active ? '' : ' · off'}</small></button>`)
      .join('') +
    '</div>';

  return layout(
    'Drona Deck simulator',
    `<style>
.simwrap{display:grid;grid-template-columns:minmax(220px,300px) 400px minmax(260px,1fr);gap:16px;padding:16px;align-items:start}
@media (max-width:1100px){.simwrap{grid-template-columns:1fr}}
.simgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:6px}
.sim{font:inherit;font-weight:600;color:var(--ivory);background:var(--panel);border:1px solid var(--line);border-top:3px solid var(--acc);border-radius:10px;padding:10px;cursor:pointer;text-align:left}
.sim small{display:block;font-weight:400;color:var(--muted);font-size:11px;margin-top:2px}
.sim.off{opacity:.55}
.sim:hover{border-color:var(--gold)}
.phone{width:100%;max-width:400px;height:780px;border:10px solid #000;border-radius:28px;background:var(--forest);overflow:hidden}
.phone iframe{width:100%;height:100%;border:0}
pre{white-space:pre-wrap;word-break:break-word;font-size:12px;background:#04140C;border:1px solid var(--line);border-radius:8px;padding:10px;max-height:340px;overflow:auto;margin:6px 0 0}
select{font:inherit;background:var(--panel);color:var(--ivory);border:1px solid var(--line);border-radius:8px;padding:6px}
</style>
<div class="simwrap">
<section class="panel">
  <div class="top" style="padding-bottom:10px"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">Simulator</span></div>
  <label class="eyebrow" style="display:block;margin-top:12px">Physical set
    <select id="set"><option value="1">Set 1 · Station 1</option><option value="2">Set 2 · Station 2</option><option value="3">Set 3 · Spare</option><option value="">No set number</option></select>
  </label>
  ${group('s', 'Subject cards')}
  ${group('d', 'Level cards')}
  ${group('p', 'Skill cards')}
  ${group('k', 'Call chips')}
  ${group('r', 'Rules card')}
  <p class="lead" style="font-size:13px;margin-top:14px">Each button loads the exact URL the NFC tag will hold, inside the phone frame. Last URL:<br><code id="last">—</code></p>
  <p style="margin-top:10px;font-size:13px"><a href="/dev/codes">Code map</a> · <a href="/dev/log">Full log</a> · <a href="/play" target="_blank">Open player in new tab</a></p>
</section>
<div class="phone"><iframe id="frame" src="/play" title="Player screen"></iframe></div>
<section class="panel">
  <div class="eyebrow">Session state (this browser)</div><pre id="state">loading…</pre>
  <div class="eyebrow" style="margin-top:14px">Recent taps</div><pre id="log">loading…</pre>
</section>
</div>
<script>
const frame = document.getElementById('frame');
const setSel = document.getElementById('set');
document.querySelectorAll('.sim').forEach(b => b.addEventListener('click', () => {
  const k = b.dataset.kind, c = b.dataset.code, s = setSel.value;
  const path = (k === 'r' ? '/r' : '/' + k + '/' + c) + (s ? '/' + s : '');
  document.getElementById('last').textContent = path;
  frame.src = path;
}));
async function refresh() {
  try {
    const st = await (await fetch('/dev/api/state', {cache:'no-store'})).json();
    document.getElementById('state').textContent = JSON.stringify(st, null, 2);
    const log = await (await fetch('/dev/api/log?limit=12', {cache:'no-store'})).json();
    document.getElementById('log').textContent = log.map(e =>
      e.ts.slice(11,19) + '  set=' + (e.set ?? e.setRaw ?? '-') + '  ' + e.path + '  → ' + e.outcome + (e.phase ? '  [' + e.phase + ' L' + e.level + ']' : '')
    ).join('\\n') || '(no taps yet)';
  } catch (e) { document.getElementById('state').textContent = 'Error: ' + e.message; }
}
frame.addEventListener('load', refresh);
refresh();
</script>`,
  );
}

function devCodesPage(rows, baseUrl, setFilter) {
  const shown = setFilter ? rows.filter((r) => r.set === setFilter) : rows;
  const body = shown
    .map(
      (r) => `<tr class="${r.active ? '' : 'dim'}"><td>S${r.set}</td><td>${esc(r.item)}</td><td>${esc(r.type)}</td><td><code>${esc(r.code)}</code></td>
<td><a href="${esc(r.url)}" target="_blank"><code>${esc(r.url)}</code></a></td><td>${r.active ? 'Live' : 'Off'}</td>
<td><div class="qr" data-url="${esc(r.url)}"></div></td></tr>`,
    )
    .join('');
  const tabs = ['', 1, 2, 3]
    .map((s) => `<a href="/dev/codes${s ? '?set=' + s : ''}" style="${(setFilter || '') === s ? 'color:var(--ivory)' : ''}">${s ? 'Set ' + s : 'All'}</a>`)
    .join(' · ');
  return layout(
    'Drona Deck code map',
    `<style>.qr svg{background:#fff;padding:4px;border-radius:4px;display:block}.wrap{padding:16px;max-width:1100px;margin:0 auto}.tablewrap{overflow-x:auto}</style>
<div class="wrap"><div class="top"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">Code map · ${tabs}</span></div>
<p class="lead">Base URL: <code>${esc(baseUrl)}</code>. Set <code>BASE_URL</code> to the real https domain before writing tags.
Scan any QR with a phone on the same Wi-Fi. Opening the URL is exactly what an NFC tap does. <a href="/dev/codes.csv">Download CSV</a></p>
<div class="tablewrap"><table><thead><tr><th>Set</th><th>Item</th><th>Type</th><th>Code</th><th>URL (tag + QR)</th><th>Booth</th><th>QR</th></tr></thead><tbody>${body}</tbody></table></div></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js"></script>
<script>
document.querySelectorAll('.qr').forEach(el => {
  if (typeof qrcode !== 'function') { el.textContent = 'QR lib offline'; return; }
  const q = qrcode(0, 'M'); q.addData(el.dataset.url); q.make();
  el.innerHTML = q.createSvgTag(3, 2);
});
</script>`,
  );
}

function devLogPage(entries) {
  const body = entries
    .map(
      (e) => `<tr><td><code>${esc(e.ts)}</code></td><td>${esc(e.set ?? e.setRaw ?? '—')}</td><td><code>${esc(e.path)}</code></td><td>${esc(e.outcome)}</td>
<td>${esc(e.phase || '')}${e.level ? ' L' + e.level : ''}</td><td><code>${esc((e.sid || '').slice(0, 8))}</code></td></tr>`,
    )
    .join('');
  return layout(
    'Drona Deck tap log',
    `<div style="padding:16px;max-width:1100px;margin:0 auto"><div class="top"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">Tap log · auto-refresh 3s · <a href="/dev">Tools</a></span></div>
<div style="overflow-x:auto"><table><thead><tr><th>Time (UTC)</th><th>Set</th><th>Path</th><th>Outcome</th><th>State after</th><th>Session</th></tr></thead><tbody>${body || '<tr><td colspan="6">No taps yet.</td></tr>'}</tbody></table></div></div>`,
    { refresh: 3 },
  );
}

// Saved visitor emails, so the team can resend any that failed or were saved without SMTP set up.
function devEmailsPage(records, { baseUrl, smtp }) {
  const body = records
    .map((e) => `<tr><td><code>${esc(e.ts)}</code></td><td>${esc(e.name || '')}</td><td>${esc(e.phone || '')}</td><td>${esc(e.email)}</td><td>${esc(e.source)}</td>
<td>${esc(e.status)}${e.error ? `<br><span class="small">${esc(e.error)}</span>` : ''}</td><td><a href="${esc(`${baseUrl}/report/${e.reportId}`)}" target="_blank"><code>${esc(e.reportId)}</code></a></td></tr>`)
    .join('');
  return layout(
    'Drona Deck contacts',
    `<div style="padding:16px;max-width:1100px;margin:0 auto"><div class="top"><span class="wordmark">Drona<span class="dot">.</span></span><span class="meta">Saved contacts · <a href="/dev/emails.csv">CSV</a> · <a href="/dev">Tools</a></span></div>
<p class="lead">Sending: <b>${smtp ? 'on (SMTP set up)' : 'off. Set SMTP_HOST to send. Details are still saved'}</b>. Personal data: delete <code>logs/emails.jsonl</code> after the event.</p>
<div style="overflow-x:auto"><table><thead><tr><th>Time (UTC)</th><th>Name</th><th>Phone</th><th>Email</th><th>From</th><th>Status</th><th>Report</th></tr></thead><tbody>${body || '<tr><td colspan="7">No contacts yet.</td></tr>'}</tbody></table></div></div>`,
  );
}

module.exports = { playPage, reportPage, reportEmail, reportMissingPage, unknownCardPage, notFoundPage, devIndexPage, devDeckPage, devCodesPage, devLogPage, devEmailsPage, MAIL_RESULT };
