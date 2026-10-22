const { createApp } = require('./app');

const { server, cfg } = createApp();

server.listen(cfg.PORT, cfg.HOST, () => {
  const local = `http://localhost:${cfg.PORT}`;
  console.log('Drona Deck · DIDAC booth');
  console.log(`  Player     ${local}/play`);
  if (cfg.DEV_TOOLS) {
    console.log(`  Simulator  ${local}/dev/deck`);
    console.log(`  Code map   ${local}/dev/codes   (QR codes for phone testing)`);
    console.log(`  Tap log    ${local}/dev/log`);
  } else {
    console.log('  Dev tools  off (DEV_TOOLS=false)');
  }
  console.log(`  Tag base   ${cfg.BASE_URL}`);
  console.log(`  Log file   ${cfg.LOG_FILE}`);
});
