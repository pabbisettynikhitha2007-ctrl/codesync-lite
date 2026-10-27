require("dotenv").config();

// Fix: Node 18+ defaults to IPv6 DNS which breaks MongoDB Atlas SRV records on Windows
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const { initSocket } = require("./socket");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("CodeSync API running"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/execute", require("./routes/execute"));

app.use((req, res) => res.status(404).json({ error: "Route not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => console.error("Mongo error:", err.message));
