const jwt = require('jsonwebtoken');
const config = require('../config');

let io = null;

function setupSocketEvents(socketIo) {
  io = socketIo;

  io.use(function (socket, next) {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.id;
      socket.username = decoded.username;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', function (socket) {
    console.log('[socket] Connected:', socket.username, '(' + socket.id + ')');

    socket.join('user:' + socket.userId);

    socket.on('join_world', function (data) {
      if (data && data.worldId) {
        socket.join('world:' + data.worldId);
      }
    });

    socket.on('leave_world', function (data) {
      if (data && data.worldId) {
        socket.leave('world:' + data.worldId);
      }
    });

    socket.on('chat:send', function (data) {
      if (!data || !data.worldId || !data.message) return;
      const payload = {
        userId: socket.userId,
        username: socket.username,
        message: data.message.substring(0, 1000),
        type: data.type || 'general',
        timestamp: new Date().toISOString(),
      };
      io.to('world:' + data.worldId).emit('chat:message', payload);
    });

    socket.on('player:action', function (data) {
      if (!data || !data.worldId) return;
      io.to('world:' + data.worldId).emit('player:action', {
        userId: socket.userId,
        username: socket.username,
        type: data.type,
        data: data.data,
      });
    });

    socket.on('npc:interact', function (data) {
      if (!data || !data.worldId) return;
      io.to('world:' + data.worldId).emit('npc:interact', {
        userId: socket.userId,
        npcId: data.npcId,
        interaction: data.interaction,
      });
    });

    socket.on('disconnect', function () {
      console.log('[socket] Disconnected:', socket.username);
    });
  });
}

function emitToWorld(worldId, event, data) {
  if (io) {
    io.to('world:' + worldId).emit(event, data);
  }
}

function emitToUser(userId, event, data) {
  if (io) {
    io.to('user:' + userId).emit(event, data);
  }
}

module.exports = { setupSocketEvents, emitToWorld, emitToUser };
