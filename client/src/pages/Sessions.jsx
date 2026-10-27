import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

export default function Sessions() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/feedback`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch sessions feedback');
        return res.json();
      })
      .then((data) => {
        setFeedbackList(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>📋 Interview Sessions & Feedback</h1>
          <button style={styles.backBtn} onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>

        {loading && <p style={styles.status}>Loading past sessions...</p>}
        {error && <p style={{ ...styles.status, color: '#f87171' }}>{error}</p>}

        {!loading && !error && feedbackList.length === 0 && (
          <p style={styles.status}>No interview feedback recorded yet.</p>
        )}

        {!loading && feedbackList.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Room</th>
                  <th style={styles.th}>Candidate</th>
                  <th style={styles.th}>Problem Solving</th>
                  <th style={styles.th}>Communication</th>
                  <th style={styles.th}>Code Quality</th>
                  <th style={styles.th}>Comments</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((item) => (
                  <tr key={item._id} style={styles.tr}>
                    <td style={styles.td}>
                      <code style={styles.code}>{item.roomId}</code>
                    </td>
                    <td style={styles.td}>{item.candidateName}</td>
                    <td style={styles.td}>⭐ {item.problemSolving}/5</td>
                    <td style={styles.td}>⭐ {item.communication}/5</td>
                    <td style={styles.td}>⭐ {item.codeQuality}/5</td>
                    <td style={styles.td}>{item.comments || '—'}</td>
                    <td style={styles.td}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f1117',
    color: '#fff',
    padding: '2rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: { margin: 0, fontSize: '1.6rem' },
  backBtn: {
    padding: '0.6rem 1.2rem',
    background: '#2e3247',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  status: { color: '#9ca3af', textAlign: 'center', marginTop: '3rem' },
  tableWrapper: {
    overflowX: 'auto',
    background: '#1a1d29',
    borderRadius: '8px',
    border: '1px solid #2e3247',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  theadRow: {
    borderBottom: '1px solid #2e3247',
    background: '#12141f',
  },
  th: {
    padding: '0.8rem 1rem',
    fontSize: '0.85rem',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #2e3247',
  },
  td: {
    padding: '0.8rem 1rem',
    fontSize: '0.9rem',
    color: '#e5e7eb',
  },
  code: {
    background: '#12141f',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    color: '#5865f2',
  },
};
