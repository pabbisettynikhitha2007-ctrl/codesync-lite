/**
 * Socket.IO event handlers for real-time collaboration.
 *
 * Events (client → server):
 *   join-room   { roomId, username }   – join a collaboration room
 *   code-change { roomId, code }       – broadcast code delta to room peers
 *   language-change { roomId, lang }   – broadcast language selection
 *   cursor-move { roomId, cursor }     – broadcast cursor position
 *   leave-room  { roomId, username }   – explicit leave (also fires on disconnect)
 *
 * Events (server → client):
 *   room-users  [{ id, username }]     – updated user list for the room
 *   user-joined { id, username }       – someone joined
 *   user-left   { id, username }       – someone left
 *   code-update { code }              – incoming code change
 *   language-update { lang }          – incoming language change
 *   cursor-update { cursor, id }      – incoming cursor position
 */

// roomId → Map<socketId, username>
const rooms = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌  Socket connected: ${socket.id}`);

    // ── Join room ────────────────────────────────────────────────────────────
    socket.on('join-room', ({ roomId, username }) => {
      if (!roomId || !username) return;

      socket.join(roomId);

      if (!rooms.has(roomId)) rooms.set(roomId, new Map());
      rooms.get(roomId).set(socket.id, username);

      const users = getUserList(roomId);

      // Tell everyone in the room who joined
      socket.to(roomId).emit('user-joined', { id: socket.id, username });

      // Send the joining user the current user list
      io.to(roomId).emit('room-users', users);

      console.log(`👥  ${username} joined room ${roomId} (${users.length} users)`);

      // Store on socket for cleanup on disconnect
      socket.data.roomId = roomId;
      socket.data.username = username;
    });

    // ── Code change ──────────────────────────────────────────────────────────
    socket.on('code-change', ({ roomId, code }) => {
      socket.to(roomId).emit('code-update', { code });
    });

    // ── Language change ──────────────────────────────────────────────────────
    socket.on('language-change', ({ roomId, lang }) => {
      socket.to(roomId).emit('language-update', { lang });
    });

    // ── Cursor move ──────────────────────────────────────────────────────────
    socket.on('cursor-move', ({ roomId, cursor }) => {
      socket.to(roomId).emit('cursor-update', { cursor, id: socket.id });
    });

    // ── Explicit leave ───────────────────────────────────────────────────────
    socket.on('leave-room', ({ roomId, username }) => {
      handleLeave(socket, roomId, username);
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const { roomId, username } = socket.data;
      if (roomId) handleLeave(socket, roomId, username);
      console.log(`❌  Socket disconnected: ${socket.id}`);
    });
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function getUserList(roomId) {
    const room = rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.entries()).map(([id, username]) => ({ id, username }));
  }

  function handleLeave(socket, roomId, username) {
    socket.leave(roomId);
    const room = rooms.get(roomId);
    if (room) {
      room.delete(socket.id);
      if (room.size === 0) rooms.delete(roomId);
    }

    const users = getUserList(roomId);
    io.to(roomId).emit('user-left', { id: socket.id, username });
    io.to(roomId).emit('room-users', users);

    console.log(`👋  ${username} left room ${roomId} (${users.length} users remaining)`);
  }
};

