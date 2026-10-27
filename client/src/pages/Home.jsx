import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { CodeIcon, UsersIcon, BriefcaseIcon, LinkIcon, PlusIcon, ArrowIcon } from "../icons";

export default function Home() {
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [joinId, setJoinId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const createRoom = async () => {
    if (!name.trim()) return setError("Please enter your name");
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      const { roomId } = await res.json();
      localStorage.setItem("name", name);
      localStorage.setItem("role", "interviewer");
      navigate(`/room/${roomId}`);
    } catch {
      setError("Could not create room. Is the server running?");
    }
    setLoading(false);
  };

  const joinRoom = () => {
    if (!name.trim() || !joinId.trim()) return setError("Enter your name and room ID");
    localStorage.setItem("name", name);
    localStorage.setItem("role", "candidate");
    navigate(`/room/${joinId.trim()}`);
  };

  return (
    <>
      <main className="container hero">
        <div className="hero-grid">
          <div className="fade-in">
            <span className="eyebrow"><span className="pulse" /> Built for interviews &amp; pair programming</span>
            <h1>Code Together.<br /><span className="gradient-text">Solve Together.</span></h1>
            <p className="lead">
              The collaborative coding workspace built for interviews, pair programming, and real-time problem solving.
            </p>
            <div className="cta-row">
              <a href="#start" className="btn primary lg">Start Coding <ArrowIcon width={18} height={18} /></a>
              <a href="#features" className="btn outline lg">Explore Features</a>
            </div>
            <p className="trust">Real-time collaboration • Shared coding workspace • Interview-ready</p>

            {/* Decorative preview only: sample data, not real users */}
            <div className="glass preview" aria-hidden="true">
              <div className="preview-bar">
                <div className="dots"><i /><i /><i /></div>
                <span className="grow">solution.js</span>
                <span className="mini-badge live">● Live session</span>
              </div>
              <pre>
<span className="c">// sample preview</span>{"\n"}
<span className="k">function</span> <span className="f">twoSum</span>(nums, target) {"{"}{"\n"}
{"  "}<span className="k">const</span> seen = <span className="k">new</span> <span className="f">Map</span>();<span className="cursor a" />{"\n"}
{"  "}<span className="k">for</span> (<span className="k">let</span> i = <span className="n">0</span>; i &lt; nums.length; i++) {"{"}{"\n"}
{"    "}<span className="k">const</span> need = target - nums[i];<span className="cursor b" />{"\n"}
{"    "}<span className="k">if</span> (seen.<span className="f">has</span>(need)) <span className="k">return</span> [seen.<span className="f">get</span>(need), i];{"\n"}
{"    "}seen.<span className="f">set</span>(nums[i], i);{"\n"}
{"  }"}{"\n"}
{"}"}
              </pre>
              <div className="avatars">
                <span className="av a">A</span><span className="av b">B</span><span className="av c">C</span>
                <span className="txt">3 developers online</span>
                <span className="mini-badge" style={{ marginLeft: "auto" }}>Demo preview</span>
              </div>
            </div>
          </div>

          <div className="fade-in d2" id="start">
            <div className="glass room-card">
              <div className="card-icon"><CodeIcon width={22} height={22} /></div>
              <h2>Your next coding session starts here.</h2>
              <p className="muted">Create a private workspace or join your team instantly.</p>

              <label className="field-label" htmlFor="name">Your Name</label>
              <input id="name" placeholder="Enter your display name" value={name}
                onChange={(e) => setName(e.target.value)} />
              <button className="btn primary block" onClick={createRoom} disabled={loading}>
                <PlusIcon width={17} height={17} /> {loading ? "Creating..." : "Create New Room"}
              </button>

              <div className="divider">or join an existing room</div>

              <label className="field-label" htmlFor="rid">Room ID</label>
              <input id="rid" placeholder="Paste your room ID" value={joinId}
                onChange={(e) => setJoinId(e.target.value)} />
              <button className="btn block" onClick={joinRoom}>Join Workspace</button>
              {error && <p className="error">{error}</p>}
            </div>
          </div>
        </div>
      </main>

      <section className="section container" id="features">
        <div className="section-head">
          <h2>Everything you need to <span className="gradient-text">code together</span></h2>
          <p>A focused workspace without the clutter.</p>
        </div>
        <div className="grid-3">
          <div className="glass feature">
            <div className="ico"><UsersIcon /></div>
            <h3>Real-Time Collaboration</h3>
            <p>Write and edit code together in a shared workspace.</p>
          </div>
          <div className="glass feature">
            <div className="ico"><BriefcaseIcon /></div>
            <h3>Interview Workspace</h3>
            <p>Practice technical interviews and solve coding challenges with your teammates.</p>
          </div>
          <div className="glass feature">
            <div className="ico"><LinkIcon /></div>
            <h3>Instant Room Sharing</h3>
            <p>Create a room and invite others using a simple room ID.</p>
          </div>
        </div>
      </section>

      <section className="section container" id="how">
        <div className="section-head">
          <h2>How it works</h2>
          <p>From zero to coding in three steps.</p>
        </div>
        <div className="grid-3">
          <div className="glass feature"><span className="step-num">01</span><h3>Create a room</h3><p>Enter your name and start a new workspace.</p></div>
          <div className="glass feature"><span className="step-num">02</span><h3>Share the link</h3><p>Send the link or room ID to your teammate or candidate.</p></div>
          <div className="glass feature"><span className="step-num">03</span><h3>Code and review</h3><p>Edit together, run code, then save feedback when you finish.</p></div>
        </div>
      </section>

      <footer className="footer">CodeSync Lite · Real-time collaborative coding</footer>
    </>
  );
}