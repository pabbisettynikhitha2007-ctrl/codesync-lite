const router = require("express").Router();
const Feedback = require("../models/Feedback");

router.post("/", async (req, res, next) => {
  try {
    const { roomId, candidateName, problemSolving, communication, codeQuality } = req.body;
    if (!roomId || !candidateName || !problemSolving || !communication || !codeQuality) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const saved = await Feedback.create(req.body);
    res.status(201).json(saved);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    res.json(await Feedback.find().sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
});

module.exports = router;