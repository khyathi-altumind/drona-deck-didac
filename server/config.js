const os = require('node:os');
const path = require('node:path');

// First non-internal IPv4 address, so phones on the same Wi-Fi can reach the dev server.
function lanIp() {
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs || []) {
      if (a.family === 'IPv4' && !a.internal) return a.address;
    }
  }
  return 'localhost';
}

const PORT = Number(process.env.PORT) || 4300;

module.exports = {
  PORT,
  HOST: process.env.HOST || '0.0.0.0',
  // The domain written onto the NFC tags and QR codes. Set this to the real https domain before writing tags.
  // On Render, RENDER_EXTERNAL_URL is the service's public https URL.
  BASE_URL: (process.env.BASE_URL || process.env.RENDER_EXTERNAL_URL || `http://${lanIp()}:${PORT}`).replace(/\/+$/, ''),
  // A shared booth device starts a fresh game after this much inactivity.
  IDLE_TIMEOUT_MS: Number(process.env.IDLE_TIMEOUT_MS) || 3 * 60 * 1000,
  // Repeat reads of the same tag inside this window are ignored.
  DEBOUNCE_MS: Number(process.env.DEBOUNCE_MS) || 2000,
  // Simulator, code map and tap-log pages. Turn off at the booth with DEV_TOOLS=false.
  DEV_TOOLS: process.env.DEV_TOOLS !== 'false',
  LOG_FILE: process.env.LOG_FILE || path.join(__dirname, '..', 'logs', 'taps.jsonl'),
};
