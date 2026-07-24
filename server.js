const app = require('./src/app');
const config = require('./src/config');

const server = app.listen(config.port, () => {
  console.log(`[server] RPG Platform running on port ${config.port} (${config.env})`);
});

process.on('SIGTERM', () => {
  console.log('[server] SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('[server] SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});

module.exports = server;
