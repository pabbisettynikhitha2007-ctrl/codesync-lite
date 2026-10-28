// server/socket.js
const { Server } = require('socket.io');

const LANGUAGES = ['javascript', 'python', 'java', 'cpp'];
const EMPTY_ROOM_TTL = 30 * 60 * 1000; // keep an empty room's code for 30 min

// roomId -> { code, language, output, running, users: Map<socketId, name>, cleanupTimer }
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code: '',
      language: 'javascript',
      output: '',
      running: false,
      users: new Map(),
      cleanupTimer: null,
    });
  }
  return rooms.get(roomId);
}

const userNames = (room) => [...room.users.values()];

function getRoomState(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  return {
    code: room.code,
    language: room.language,
    output: room.output,
    running: room.running,
    users: userNames(room),
  };
}

function initSocket(serverOrIo) {
  let io;
  if (serverOrIo && typeof serverOrIo.on === 'function') {
    io = serverOrIo;
  } else {
    io = new Server(serverOrIo, {
      cors: {
        origin: true, // Allow any origin (Vercel domains, preview URLs, localhost)
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
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
      socket.data.roomId = roomId;
      socket.data.username = displayName;
      room.users.set(socket.id, displayName);

      // Late joiners get the current code + language + output right away
      socket.emit('room-state', {
        code: room.code,
        language: room.language,
        output: room.output,
        running: room.running,
        users: userNames(room),
      });

      socket.to(roomId).emit('user-joined', {
        name: displayName,
        users: userNames(room),
      });
    });

    // code-change { roomId, code }
    socket.on('code-change', ({ code, roomId } = {}) => {
      const targetRoom = socket.data.roomId || roomId;
      if (!targetRoom || typeof code !== 'string') return;
      if (roomId && !socket.data.roomId) {
        socket.join(roomId);
        socket.data.roomId = roomId;
      }
      getRoom(targetRoom).code = code;
      socket.to(targetRoom).emit('code-change', { code });
    });

    // language-change { roomId, language }
    socket.on('language-change', ({ language, roomId } = {}) => {
      const targetRoom = socket.data.roomId || roomId;
      if (!targetRoom || !LANGUAGES.includes(language)) return;
      if (roomId && !socket.data.roomId) {
        socket.join(roomId);
        socket.data.roomId = roomId;
      }
      getRoom(targetRoom).language = language;
      socket.to(targetRoom).emit('language-change', { language });
    });

    // run-start { runId }
    socket.on('run-start', ({ runId, roomId } = {}) => {
      const targetRoom = socket.data.roomId || roomId;
      if (!targetRoom) return;
      const room = getRoom(targetRoom);
      room.running = true;
      room.output = `Running... (started by ${socket.data.username || 'Peer'})`;
      socket.to(targetRoom).emit('run-start', {
        runId,
        by: socket.data.username || 'Peer',
      });
    });

    // run-result { runId, output }
    socket.on('run-result', ({ output, runId, roomId } = {}) => {
      const targetRoom = socket.data.roomId || roomId;
      if (!targetRoom) return;
      const room = getRoom(targetRoom);
      room.running = false;
      room.output = output || '';
      socket.to(targetRoom).emit('run-result', { output: room.output, runId });
    });

    // run-stop
    socket.on('run-stop', ({ roomId } = {}) => {
      const targetRoom = socket.data.roomId || roomId;
      if (!targetRoom) return;
      const room = getRoom(targetRoom);
      room.running = false;
      room.output = 'Execution stopped.';
      socket.to(targetRoom).emit('run-stop', { message: 'Execution stopped.' });
    });

    // output-update { output }
    socket.on('output-update', ({ output, roomId } = {}) => {
      const targetRoom = socket.data.roomId || roomId;
      if (!targetRoom) return;
      getRoom(targetRoom).output = output || '';
      socket.to(targetRoom).emit('output-update', { output: output || '' });
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
