import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
import { PlusIcon, FlagIcon } from "../icons";

const level = (n) => (n >= 4 ? "high" : n >= 3 ? "mid" : "low");

export default function Sessions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/feedback`)
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : d.feedback || []))
      .catch(() => setError("Could not load sessions. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>Your Coding Sessions</h1>
          <p>Feedback and ratings from your completed interviews.</p>
        </div>
        <Link to="/#start" className="btn primary"><PlusIcon width={17} height={17} /> Create New Room</Link>
      </div>

      {loading && <div className="spinner" />}
      {error && <p className="error">{error}</p>}

      {!loading && !error && rows.length === 0 && (
        <div className="glass empty-state">
          <div className="card-icon"><FlagIcon width={26} height={26} /></div>
          <h2>No sessions yet</h2>
          <p>Finish an interview and save feedback, and it will show up here.</p>
          <Link to="/#start" className="btn primary">Create New Room</Link>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="session-grid">
          {rows.map((r) => (
            <article className="glass session-card" key={r._id}>
              <div className="session-top">
                <h3>{r.candidateName}</h3>
                <span className="mono">{r.roomId}</span>
              </div>
              <div className="scores">
                <div className={`score-box ${level(r.problemSolving)}`}><small>Solving</small><b>{r.problemSolving}/5</b></div>
                <div className={`score-box ${level(r.communication)}`}><small>Comms</small><b>{r.communication}/5</b></div>
                <div className={`score-box ${level(r.codeQuality)}`}><small>Quality</small><b>{r.codeQuality}/5</b></div>
              </div>
              {r.comments && <p className="comment">{r.comments}</p>}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}