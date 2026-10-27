import { useEffect, useRef, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { socket } from '../socket'
import CodeEditor from '../components/CodeEditor'

const LANGUAGES = ['javascript', 'python', 'java', 'cpp']

export default function Room() {
  const { roomId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const username = state?.username || 'Anonymous'

  const [code, setCode] = useState('// Start coding here...')
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [users, setUsers] = useState([])
  const [running, setRunning] = useState(false)
  const suppressRef = useRef(false)   // avoid echo-back loops

  // ── Socket setup ─────────────────────────────────────────────────────────
  useEffect(() => {
    socket.connect()
    socket.emit('join-room', { roomId, username })

    socket.on('room-users', setUsers)
    socket.on('user-joined', ({ username: u }) => setOutput((o) => `${o}\n💬 ${u} joined`))
    socket.on('user-left', ({ username: u }) => setOutput((o) => `${o}\n💬 ${u} left`))

    socket.on('code-update', ({ code: incoming }) => {
      suppressRef.current = true
      setCode(incoming)
    })

    socket.on('language-update', ({ lang }) => setLanguage(lang))

    return () => {
      socket.emit('leave-room', { roomId, username })
      socket.disconnect()
      socket.off('room-users')
      socket.off('user-joined')
      socket.off('user-left')
      socket.off('code-update')
      socket.off('language-update')
    }
  }, [roomId, username])

  // ── Code change handler ───────────────────────────────────────────────────
  const handleCodeChange = (newCode) => {
    setCode(newCode)
    if (suppressRef.current) { suppressRef.current = false; return }
    socket.emit('code-change', { roomId, code: newCode })
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    socket.emit('language-change', { roomId, lang })
  }

  // ── Run code ──────────────────────────────────────────────────────────────
  const runCode = async () => {
    setRunning(true)
    setOutput('⏳ Running...')
    try {
      const res = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })
      const data = await res.json()
      setOutput(data.output || data.error || '(no output)')
    } catch {
      setOutput('❌ Failed to connect to server')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>⚡ CodeSync</h2>
        <p style={styles.roomLabel}>Room: <code style={styles.roomId}>{roomId}</code></p>
        <hr style={styles.divider} />
        <p style={styles.sectionLabel}>Participants ({users.length})</p>
        <ul style={styles.userList}>
          {users.map((u) => (
            <li key={u.id} style={styles.userItem}>
              <span style={styles.dot} /> {u.username} {u.id === socket.id ? '(you)' : ''}
            </li>
          ))}
        </ul>
        <div style={{ flex: 1 }} />
        <button style={styles.leaveBtn} onClick={() => navigate('/')}>← Leave</button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        {/* Toolbar */}
        <div style={styles.toolbar}>
          <select
            style={styles.select}
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <button style={styles.runBtn} onClick={runCode} disabled={running}>
            {running ? '⏳ Running…' : '▶ Run'}
          </button>
        </div>

        {/* Editor */}
        <CodeEditor code={code} language={language} onChange={handleCodeChange} />

        {/* Output */}
        <div style={styles.outputBox}>
          <p style={styles.outputLabel}>Output</p>
          <pre style={styles.output}>{output || '— run your code to see output —'}</pre>
        </div>
      </main>
    </div>
  )
}

const styles = {
  page: { display: 'flex', height: '100vh', background: '#0f1117', color: '#fff', fontFamily: 'sans-serif' },
  sidebar: { width: '220px', background: '#1e2130', display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '0.5rem', flexShrink: 0 },
  logo: { margin: 0, fontSize: '1.3rem' },
  roomLabel: { fontSize: '0.8rem', color: '#8b8fa8', margin: 0 },
  roomId: { color: '#5865f2' },
  divider: { border: 'none', borderTop: '1px solid #2e3247', margin: '0.5rem 0' },
  sectionLabel: { fontSize: '0.75rem', color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 },
  userList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  userItem: { fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#57f287', flexShrink: 0 },
  leaveBtn: { padding: '0.6rem', borderRadius: '8px', border: 'none', background: '#2e3247', color: '#fff', cursor: 'pointer', fontSize: '0.9rem' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  toolbar: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#1e2130', borderBottom: '1px solid #2e3247' },
  select: { padding: '0.4rem 0.75rem', borderRadius: '6px', background: '#12141f', border: '1px solid #2e3247', color: '#fff', fontSize: '0.9rem' },
  runBtn: { padding: '0.4rem 1rem', borderRadius: '6px', background: '#57f287', color: '#000', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
  outputBox: { background: '#12141f', borderTop: '1px solid #2e3247', padding: '0.75rem 1rem', maxHeight: '200px', overflowY: 'auto', flexShrink: 0 },
  outputLabel: { margin: '0 0 0.4rem', fontSize: '0.75rem', color: '#8b8fa8', textTransform: 'uppercase' },
  output: { margin: 0, fontSize: '0.9rem', color: '#a9b1d6', whiteSpace: 'pre-wrap' },
}
