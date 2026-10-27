const router = require("express").Router();
const crypto = require("crypto");
const Room = require("../models/Room");

router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    const roomId = crypto.randomUUID().slice(0, 8);
    await Room.create({ roomId, interviewerName: name });
    res.status(201).json({ roomId });
  } catch (err) {
    next(err);
  }
});

router.get("/:roomId", async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    next(err);
  }
});

module.exports = router;