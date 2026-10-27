import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import VideoCall from '../components/VideoCall';
import FeedbackForm from '../components/FeedbackForm';
import { API_URL } from '../config';
import { onRunResult, sendRunResult, onPresence } from '../socket';

const LANGUAGES = ['javascript', 'python', 'java', 'cpp'];

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [users, setUsers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync run results & users with remote room peers
  useEffect(() => {
    const unsubRun = onRunResult((out) => setOutput(out));
    const unsubPres = onPresence((userList) => setUsers(userList || []));

    return () => {
      unsubRun?.();
      unsubPres?.();
    };
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runCode = async () => {
    setRunning(true);
    setOutput('⏳ Running...');
    try {
      // Fetch latest code from Monaco if available via window or fallback
      const editorElement = document.querySelector('.monaco-editor');
      // Execute through backend
      const res = await fetch(`${API_URL}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: window.__CODESYNC_LATEST_CODE__ || '// No code found',
          language,
        }),
      });
      const data = await res.json();
      const out = data.output || data.error || '(no output)';
      setOutput(out);
      sendRunResult(roomId, out);
    } catch {
      const errOut = '❌ Failed to connect to execution server';
      setOutput(errOut);
      sendRunResult(roomId, errOut);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Top Bar */}
      <header style={styles.topbar}>
        <div style={styles.logoGroup}>
          <span style={styles.logo}>⚡ CodeSync Lite</span>
          <span style={styles.roomTag}>Room: <strong>{roomId}</strong></span>
          <button style={styles.copyBtn} onClick={handleCopyLink}>
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
        </div>

        <div style={styles.controlsGroup}>
          <select
            style={styles.select}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>

          <button style={styles.runBtn} onClick={runCode} disabled={running}>
            {running ? '⏳ Running...' : '▶ Run Code'}
          </button>

          <button
            style={styles.finishBtn}
            onClick={() => setShowFeedback((prev) => !prev)}
          >
            {showFeedback ? 'Hide Feedback' : 'Finish & Rate'}
          </button>

          <button style={styles.leaveBtn} onClick={() => navigate('/')}>
            Leave
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={styles.content}>
        {/* Left Column: Monaco Code Editor */}
        <div style={styles.editorPane}>
          <CodeEditor
            roomId={roomId}
            language={language}
            onLanguageChange={setLanguage}
          />
        </div>

        {/* Right Column: Video Call & Feedback */}
        <div style={styles.sidePane}>
          <div style={styles.videoBox}>
            <VideoCall roomId={roomId} />
          </div>

          {showFeedback ? (
            <div style={styles.feedbackContainer}>
              <FeedbackForm roomId={roomId} />
            </div>
          ) : (
            <div style={styles.participantsBox}>
              <h4 style={styles.sideHeader}>Connected Users ({users.length})</h4>
              <ul style={styles.userList}>
                {users.map((u, i) => (
                  <li key={i} style={styles.userItem}>
                    🟢 {typeof u === 'string' ? u : u.name || 'User'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Output Panel */}
      <footer style={styles.outputPane}>
        <div style={styles.outputHeader}>Output Console</div>
        <pre style={styles.outputContent}>{output || 'Click "▶ Run Code" to execute.'}</pre>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0f1117',
    color: '#fff',
    fontFamily: 'Inter, system-ui, sans-serif',
    overflow: 'hidden',
  },
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.6rem 1.2rem',
    background: '#1a1d29',
    borderBottom: '1px solid #2e3247',
    zIndex: 10,
  },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  logo: { fontSize: '1.1rem', fontWeight: 'bold', color: '#5865f2' },
  roomTag: { background: '#12141f', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' },
  copyBtn: {
    padding: '0.3rem 0.6rem',
    fontSize: '0.8rem',
    borderRadius: '4px',
    border: '1px solid #3e445b',
    background: '#232636',
    color: '#d1d5db',
    cursor: 'pointer',
  },
  controlsGroup: { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  select: {
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    background: '#12141f',
    border: '1px solid #2e3247',
    color: '#fff',
    fontSize: '0.85rem',
  },
  runBtn: {
    padding: '0.4rem 1rem',
    borderRadius: '6px',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  finishBtn: {
    padding: '0.4rem 0.9rem',
    borderRadius: '6px',
    background: '#8b5cf6',
    color: '#fff',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  leaveBtn: {
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  editorPane: {
    flex: 6,
    height: '100%',
    position: 'relative',
    borderRight: '1px solid #2e3247',
  },
  sidePane: {
    flex: 4,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#161922',
    overflowY: 'auto',
  },
  videoBox: {
    height: '280px',
    padding: '0.75rem',
  },
  feedbackContainer: {
    padding: '0.75rem',
  },
  participantsBox: {
    padding: '1rem',
  },
  sideHeader: {
    margin: '0 0 0.5rem 0',
    fontSize: '0.9rem',
    color: '#9ca3af',
  },
  userList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  userItem: {
    padding: '0.3rem 0',
    fontSize: '0.85rem',
    color: '#e5e7eb',
  },
  outputPane: {
    height: '160px',
    background: '#0a0c10',
    borderTop: '1px solid #2e3247',
    display: 'flex',
    flexDirection: 'column',
  },
  outputHeader: {
    padding: '0.3rem 0.8rem',
    fontSize: '0.75rem',
    background: '#161922',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  outputContent: {
    flex: 1,
    margin: 0,
    padding: '0.6rem 0.8rem',
    fontSize: '0.85rem',
    color: '#a3e635',
    fontFamily: 'Consolas, monospace',
    overflowY: 'auto',
  },
};
