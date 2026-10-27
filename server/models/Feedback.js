const mongoose = require("mongoose");

const rating = { type: Number, min: 1, max: 5, required: true };

const feedbackSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true },
    candidateName: { type: String, required: true, trim: true },
    problemSolving: rating,
    communication: rating,
    codeQuality: rating,
    comments: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);