import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_URL, LANGUAGES } from "../config";
import { socket } from "../socket";
import CodeEditor from "../components/CodeEditor";
import VideoCall from "../components/VideoCall";
import FeedbackForm from "../components/FeedbackForm";
import { PlayIcon, LinkIcon, CheckIcon, FlagIcon, TerminalIcon } from "../icons";

export default function Room() {
  const { roomId } = useParams();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [roomError, setRoomError] = useState("");
  const [checking, setChecking] = useState(true);
  const name = localStorage.getItem("name") || "Guest";
  const role = localStorage.getItem("role") || "candidate";

  useEffect(() => {
    setChecking(true);
    fetch(`${API_URL}/api/rooms/${roomId}`)
      .then((r) => { if (!r.ok) throw new Error(); })
      .catch(() => setRoomError("Room not found"))
      .finally(() => setChecking(false));
    socket.on("run-result", ({ output }) => setOutput(output));
    return () => socket.off("run-result");
  }, [roomId]);

  const runCode = async () => {
    setRunning(true); setOutput("Running...");
    try {
      const res = await fetch(`${API_URL}/api/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      const out = data.output ?? data.error ?? "No output";
      setOutput(out);
      socket.emit("run-result", { roomId, output: out });
    } catch {
      setOutput("Error: could not run code");
    }
    setRunning(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (checking)
    return <main className="center"><div className="spinner" /></main>;

  if (roomError)
    return (
      <main className="center">
        <div className="glass state-card">
          <div className="card-icon"><FlagIcon width={22} height={22} /></div>
          <h2>{roomError}</h2>
          <p className="muted">Check the room ID, or ask the interviewer for a new link.</p>
          <Link className="btn primary" to="/">Back to home</Link>
        </div>
      </main>
    );

  return (
    <div className="room">
      <header className="glass topbar">
        <div className="topbar-left">
          <span className="pill"><span className="pulse" /> Room <b>{roomId}</b></span>
          <span className="pill">{name} · {role}</span>
        </div>
        <div className="topbar-right">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <button className="btn success" onClick={runCode} disabled={running}>
            <PlayIcon width={14} height={14} /> {running ? "Running..." : "Run Code"}
          </button>
          <button className="btn" onClick={copyLink}>
            {copied ? <CheckIcon width={15} height={15} /> : <LinkIcon width={15} height={15} />}
            {copied ? "Copied" : "Copy link"}
          </button>
          <button className="btn danger" onClick={() => setShowFeedback(true)}>Finish</button>
        </div>
      </header>

      <section className="main">
        <div className="editor">
          <CodeEditor roomId={roomId} language={language}
            onLanguageChange={setLanguage} onCodeChange={setCode} />
        </div>
        <aside className="video"><VideoCall roomId={roomId} /></aside>
      </section>

      <section className="output">
        <div className="output-head">
          <span><TerminalIcon width={14} height={14} /> Output</span>
          {output && <button className="btn sm" onClick={() => setOutput("")}>Clear</button>}
        </div>
        <pre className={output ? "" : "empty"}>{output || "Run your code to see output here."}</pre>
      </section>

      {showFeedback && (
        <div className="modal" onClick={() => setShowFeedback(false)}>
          <div className="glass" onClick={(e) => e.stopPropagation()}>
            <FeedbackForm roomId={roomId} />
            <button className="btn" onClick={() => setShowFeedback(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}