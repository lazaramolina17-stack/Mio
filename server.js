const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const config = require('./src/config');
const { setupSocketEvents } = require('./src/services/SocketManager');

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
  },
});

setupSocketEvents(io);

httpServer.listen(config.port, function () {
  console.log('[server] RPG Platform running on port ' + config.port + ' (' + config.env + ')');
});

process.on('SIGTERM', function () {
  console.log('[server] SIGTERM received, shutting down...');
  httpServer.close(function () { process.exit(0); });
});

process.on('SIGINT', function () {
  console.log('[server] SIGINT received, shutting down...');
  httpServer.close(function () { process.exit(0); });
});

module.exports = httpServer;
