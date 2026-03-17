// models/Log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    details: { type: String, default: "" },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    targetId: { type: String, default: null },
    targetType: { type: String, default: null },
    type: { type: String, enum: ["info", "warning", "error"], default: "info" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Log", logSchema);
