// client/src/socket.js
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// One shared connection for the whole app.
export const socket = io(SERVER_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

// Checks both 'name' (from Person 1's Home.jsx) and 'codesync_name'
export const getName = () => localStorage.getItem('name') || localStorage.getItem('codesync_name') || 'Guest';

export function joinRoom(roomId) {
  if (!roomId) return;
  socket.emit('join-room', { roomId, name: getName() });
}

// After POST /api/execute returns, show the output locally AND call this
// so the other person sees it too.
export function sendRunResult(roomId, output) {
  socket.emit('run-result', { roomId, output });
}

// Listen for the other person's run output. Returns an unsubscribe function.
export function onRunResult(callback) {
  const handler = ({ output }) => callback(output);
  socket.on('run-result', handler);
  return () => socket.off('run-result', handler);
}

// Who is in the room. Callback receives an array of names.
export function onPresence(callback) {
  const handler = ({ users }) => callback(users);
  socket.on('room-state', handler);
  socket.on('user-joined', handler);
  socket.on('user-left', handler);
  return () => {
    socket.off('room-state', handler);
    socket.off('user-joined', handler);
    socket.off('user-left', handler);
  };
}
