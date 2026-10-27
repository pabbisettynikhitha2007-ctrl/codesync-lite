import { useState } from 'react';
import { API_URL } from '../config';

/**
 * FeedbackForm — post interview feedback to POST /api/feedback.
 *
 * Agreed prop: <FeedbackForm roomId={roomId} />
 *
 * Fields (matching Feedback model):
 *   candidateName   string   required
 *   problemSolving  1–5      required
 *   communication   1–5      required
 *   codeQuality     1–5      required
 *   comments        string   optional
 */

const RATINGS = [1, 2, 3, 4, 5];

const LABEL_MAP = {
  problemSolving: 'Problem Solving',
  communication: 'Communication',
  codeQuality: 'Code Quality',
};

function StarRating({ name, value, onChange }) {
  return (
    <div style={styles.starRow}>
      <span style={styles.starLabel}>{LABEL_MAP[name]}</span>
      <div style={styles.stars}>
        {RATINGS.map((n) => (
          <button
            key={n}
            type="button"
            style={{ ...styles.star, color: n <= value ? '#fbbf24' : '#4b5563' }}
            onClick={() => onChange(name, n)}
            aria-label={`${n} star`}
          >
            ★
          </button>
        ))}
        <span style={styles.ratingVal}>{value}/5</span>
      </div>
    </div>
  );
}

export default function FeedbackForm({ roomId }) {
  const [form, setForm] = useState({
    candidateName: '',
    problemSolving: 3,
    communication: 3,
    codeQuality: 3,
    comments: '',
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const setRating = (name, val) => setForm((f) => ({ ...f, [name]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.candidateName.trim()) {
      setErrorMsg('Candidate name is required.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, ...form, candidateName: form.candidateName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={styles.box}>
        <p style={styles.successMsg}>✅ Feedback submitted successfully!</p>
      </div>
    );
  }

  return (
    <div style={styles.box}>
      <h3 style={styles.title}>📝 Interview Feedback</h3>
      <form onSubmit={handleSubmit} style={styles.form}>

        <div style={styles.field}>
          <label style={styles.label}>Candidate Name *</label>
          <input
            style={styles.input}
            placeholder="Enter candidate name"
            value={form.candidateName}
            onChange={(e) => setForm((f) => ({ ...f, candidateName: e.target.value }))}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Ratings</label>
          <StarRating name="problemSolving" value={form.problemSolving} onChange={setRating} />
          <StarRating name="communication"  value={form.communication}  onChange={setRating} />
          <StarRating name="codeQuality"    value={form.codeQuality}    onChange={setRating} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Comments (optional)</label>
          <textarea
            style={styles.textarea}
            placeholder="Any additional feedback..."
            value={form.comments}
            rows={3}
            onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
          />
        </div>

        {errorMsg && <p style={styles.error}>{errorMsg}</p>}

        <button style={styles.btn} type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? '⏳ Submitting…' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  box: { background: '#1e2130', borderRadius: '10px', padding: '1.5rem', color: '#fff' },
  title: { margin: '0 0 1.25rem', fontSize: '1.1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.8rem', color: '#8b8fa8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: { padding: '0.65rem 0.9rem', borderRadius: '6px', border: '1px solid #2e3247', background: '#12141f', color: '#fff', fontSize: '0.95rem', outline: 'none' },
  textarea: { padding: '0.65rem 0.9rem', borderRadius: '6px', border: '1px solid #2e3247', background: '#12141f', color: '#fff', fontSize: '0.95rem', outline: 'none', resize: 'vertical' },
  starRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0' },
  starLabel: { fontSize: '0.9rem', color: '#a9b1d6', width: '140px' },
  stars: { display: 'flex', alignItems: 'center', gap: '0.1rem' },
  star: { background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '0 2px', lineHeight: 1 },
  ratingVal: { fontSize: '0.8rem', color: '#8b8fa8', marginLeft: '0.5rem', width: '28px' },
  btn: { padding: '0.75rem', borderRadius: '8px', background: '#5865f2', color: '#fff', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' },
  error: { color: '#f87171', fontSize: '0.85rem', margin: 0 },
  successMsg: { textAlign: 'center', color: '#57f287', fontWeight: 600, margin: 0 },
};
