import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Sessions from "./pages/Sessions";
import { CodeIcon } from "./icons";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <Link to="/" className="brand">
          <span className="brand-logo"><CodeIcon width={18} height={18} /></span>
          CodeSync Lite
        </Link>
        <div className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <a href="/#features" className="hide-sm">Features</a>
          <a href="/#how" className="hide-sm">How It Works</a>
          <NavLink to="/sessions">Sessions</NavLink>
        </div>
        <span className="live-badge"><span className="pulse" /> Live Collaboration</span>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/sessions" element={<Sessions />} />
      </Routes>
    </BrowserRouter>
  );
}