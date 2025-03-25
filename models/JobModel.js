const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fn: { type: String, required: true }, // Store function as a string
  interval: { type: Number, required: true },
  status: { type: String, enum: ["pending", "running", "completed", "failed"], default: "pending" },
  lastRun: { type: Date, default: null },
  nextRun: { type: Date, default: null },
  retries: { type: Number, default: 0 },
});

const Job = mongoose.model("Job", jobSchema);
module.exports = Job;
