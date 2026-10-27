// client/src/components/CodeEditor.jsx  (Person 2)
// Props (agreed contract): <CodeEditor roomId={roomId} language={language} onLanguageChange={fn} onCodeChange={fn} />

import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { socket, joinRoom } from '../socket';

export default function CodeEditor({ roomId, language, onLanguageChange, onCodeChange }) {
  const editorRef = useRef(null);
  const codeRef = useRef('');          // latest code known (covers Monaco still loading)
  const isRemote = useRef(false);      // true while we apply someone else's change
  const emitTimer = useRef(null);
  const langRef = useRef(language);    // last language known to match the room
  const onLangRef = useRef(onLanguageChange);
  onLangRef.current = onLanguageChange;
  const onCodeRef = useRef(onCodeChange);
  onCodeRef.current = onCodeChange;

  // Put remote code into the editor without triggering an emit (echo loop guard)
  const applyCode = (value) => {
    codeRef.current = value;
    window.__CODESYNC_LATEST_CODE__ = value;
    onCodeRef.current?.(value);
    const editor = editorRef.current;
    if (!editor || editor.getValue() === value) return;

    clearTimeout(emitTimer.current);
    const position = editor.getPosition();
    isRemote.current = true;
    editor.setValue(value); // onChange fires synchronously, flag is still set
    isRemote.current = false;
    if (position) editor.setPosition(position);
  };

  const applyLanguage = (lang) => {
    if (!lang || lang === langRef.current) return;
    langRef.current = lang; // set first so the effect below doesn't re-emit it
    onLangRef.current?.(lang);
  };

  // Connect, join the room, and listen for remote events
  useEffect(() => {
    const onRoomState = ({ code, language: lang }) => {
      applyCode(code);
      applyLanguage(lang);
    };
    const onCode = ({ code }) => applyCode(code);
    const onLang = ({ language: lang }) => applyLanguage(lang);
    const join = () => joinRoom(roomId); // runs on first connect and on every reconnect

    socket.on('room-state', onRoomState);
    socket.on('code-change', onCode);
    socket.on('language-change', onLang);
    socket.on('connect', join);

    if (socket.connected) join();
    else socket.connect();

    return () => {
      clearTimeout(emitTimer.current);
      socket.off('room-state', onRoomState);
      socket.off('code-change', onCode);
      socket.off('language-change', onLang);
      socket.off('connect', join);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // The local user picked a new language in the dropdown -> tell the room
  useEffect(() => {
    if (language === langRef.current) return;
    langRef.current = language;
    socket.emit('language-change', { roomId, language });
  }, [language, roomId]);

  const handleMount = (editor) => {
    editorRef.current = editor;
    if (codeRef.current) {
      applyCode(codeRef.current); // room-state arrived before Monaco loaded
    } else {
      const val = editor.getValue() || '';
      window.__CODESYNC_LATEST_CODE__ = val;
      onCodeRef.current?.(val);
    }
  };

  const handleChange = (value) => {
    window.__CODESYNC_LATEST_CODE__ = value ?? '';
    onCodeRef.current?.(value ?? '');
    if (isRemote.current) return; // change came from the network, don't echo it
    codeRef.current = value ?? '';
    clearTimeout(emitTimer.current);
    emitTimer.current = setTimeout(() => {
      socket.emit('code-change', { roomId, code: codeRef.current });
    }, 100);
  };

  return (
    <Editor
      height="100%"
      theme="vs-dark"
      language={language}
      onMount={handleMount}
      onChange={handleChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        tabSize: 2,
      }}
    />
  );
}
