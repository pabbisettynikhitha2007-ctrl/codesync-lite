const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    interviewerName: { type: String, required: true, trim: true },
    language: { type: String, default: "javascript" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);