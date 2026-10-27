// server/socket.js  (Person 2)
const { Server } = require('socket.io');

const LANGUAGES = ['javascript', 'python', 'java', 'cpp'];
const EMPTY_ROOM_TTL = 30 * 60 * 1000; // keep an empty room's code for 30 min

// roomId -> { code, language, users: Map<socketId, name>, cleanupTimer }
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code: '',
      language: 'javascript',
      users: new Map(),
      cleanupTimer: null,
    });
  }
  return rooms.get(roomId);
}

const userNames = (room) => [...room.users.values()];

// Person 3 can call this from the "finish room" route to save finalCode.
function getRoomState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  return { code: room.code, language: room.language, users: userNames(room) };
}

function initSocket(serverOrIo) {
  let io;
  if (serverOrIo && typeof serverOrIo.on === 'function') {
    // Already a Socket.IO Server instance
    io = serverOrIo;
  } else {
    // HTTP server passed
    io = new Server(serverOrIo, {
      cors: {
        origin: [
          process.env.CLIENT_URL || 'http://localhost:5173',
          'http://localhost:5174',
          '*',
        ],
        methods: ['GET', 'POST'],
      },
    });
  }

  io.on('connection', (socket) => {
    // join-room { roomId, name }
    socket.on('join-room', ({ roomId, name } = {}) => {
      if (typeof roomId !== 'string' || !roomId) return;
      const displayName = (name || 'Guest').toString().slice(0, 40);

      const room = getRoom(roomId);
      clearTimeout(room.cleanupTimer);

      socket.join(roomId);
      socket.data.roomId = roomId; // trust this, not payloads, from now on
      room.users.set(socket.id, displayName);

      // Late joiners get the current code + language right away
      socket.emit('room-state', {
        code: room.code,
        language: room.language,
        users: userNames(room),
      });

      socket.to(roomId).emit('user-joined', {
        name: displayName,
        users: userNames(room),
      });
    });

    // code-change { code }
    socket.on('code-change', ({ code } = {}) => {
      const roomId = socket.data.roomId;
      if (!roomId || typeof code !== 'string') return;
      getRoom(roomId).code = code;
      socket.to(roomId).emit('code-change', { code });
    });

    // language-change { language }
    socket.on('language-change', ({ language } = {}) => {
      const roomId = socket.data.roomId;
      if (!roomId || !LANGUAGES.includes(language)) return;
      getRoom(roomId).language = language;
      socket.to(roomId).emit('language-change', { language });
    });

    // run-result { output }
    // The client calls POST /api/execute first, then emits this so the
    // other person sees the same output.
    socket.on('run-result', ({ output } = {}) => {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      socket.to(roomId).emit('run-result', { output });
    });

    socket.on('disconnect', () => {
      const roomId = socket.data.roomId;
      const room = roomId && rooms.get(roomId);
      if (!room) return;

      const name = room.users.get(socket.id);
      room.users.delete(socket.id);
      socket.to(roomId).emit('user-left', { name, users: userNames(room) });

      if (room.users.size === 0) {
        room.cleanupTimer = setTimeout(() => rooms.delete(roomId), EMPTY_ROOM_TTL);
      }
    });
  });

  return io;
}

module.exports = initSocket;
module.exports.initSocket = initSocket;
module.exports.getRoomState = getRoomState;
