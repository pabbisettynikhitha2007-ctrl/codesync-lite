// client/src/socket.js  (Person 2)
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// One shared connection for the whole app. CodeEditor connects it on mount.
export const socket = io(SERVER_URL, { autoConnect: false });

// Agreement with Person 1: Home.jsx saves the entered name with
//   localStorage.setItem('codesync_name', name)
export const getName = () => localStorage.getItem('codesync_name') || 'Guest';

export function joinRoom(roomId) {
  socket.emit('join-room', { roomId, name: getName() });
}

// ---- Helpers for Person 1 (Room.jsx) ----

// After POST /api/execute returns, show the output locally AND call this
// so the other person sees it too.
export function sendRunResult(roomId, output) {
  socket.emit('run-result', { roomId, output });
}

// Listen for the other person's run output. Returns an unsubscribe function.
//   useEffect(() => onRunResult(setOutput), []);
export function onRunResult(callback) {
  const handler = ({ output }) => callback(output);
  socket.on('run-result', handler);
  return () => socket.off('run-result', handler);
}

// Who is in the room. Callback receives an array of names.
//   useEffect(() => onPresence(setUsers), []);
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