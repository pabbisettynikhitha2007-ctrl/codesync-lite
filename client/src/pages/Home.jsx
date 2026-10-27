import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'

export default function Home() {
  const [roomId, setRoomId] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const join = async (e) => {
    e.preventDefault()
    const user = username.trim() || 'Anonymous'
    localStorage.setItem('codesync_name', user)

    let targetRoom = roomId.trim()
    if (!targetRoom) {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: user }),
        })
        const data = await res.json()
        targetRoom = data.roomId || crypto.randomUUID().slice(0, 8)
      } catch {
        targetRoom = crypto.randomUUID().slice(0, 8)
      } finally {
        setLoading(false)
      }
    }

    navigate(`/room/${targetRoom}`, { state: { username: user } })
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>⚡ CodeSync Lite</h1>
        <p style={styles.subtitle}>Real-time collaborative code editor</p>
        <form onSubmit={join} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Room ID (leave blank to create new)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating Room...' : 'Join / Create Room →'}
          </button>
        </form>
        <a href="/sessions" style={styles.link}>View saved sessions</a>
      </div>
    </div>
  )
}

const styles = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f1117' },
  card: { background: '#1e2130', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  title: { margin: 0, color: '#fff', fontSize: '2rem' },
  subtitle: { color: '#8b8fa8', marginTop: '0.4rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' },
  input: { padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #2e3247', background: '#12141f', color: '#fff', fontSize: '1rem', outline: 'none' },
  btn: { padding: '0.85rem', borderRadius: '8px', background: '#5865f2', color: '#fff', border: 'none', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 },
  link: { display: 'block', marginTop: '1.25rem', color: '#8b8fa8', textAlign: 'center', fontSize: '0.9rem' },
}
