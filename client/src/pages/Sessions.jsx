import { useNavigate } from 'react-router-dom'

// Sessions page — placeholder until a real DB-backed API exists.
// Once MONGO_URI is set, wire this to GET /api/sessions.
export default function Sessions() {
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>📋 Sessions</h1>
        <p style={styles.sub}>
          Session history will appear here once MongoDB is connected and a
          sessions API is implemented.
        </p>
        <button style={styles.btn} onClick={() => navigate('/')}>← Back to Home</button>
      </div>
    </div>
  )
}

const styles = {
  page: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0f1117' },
  card: { background: '#1e2130', padding: '2.5rem', borderRadius: '12px', maxWidth: '480px', width: '100%', textAlign: 'center', color: '#fff' },
  title: { marginTop: 0 },
  sub: { color: '#8b8fa8', lineHeight: 1.6 },
  btn: { marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: '8px', background: '#5865f2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
}
