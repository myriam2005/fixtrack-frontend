// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format d'email invalide"],
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["user", "technician", "manager", "admin"],
      default: "user",
    },
    actif: { type: Boolean, default: true },
    avatar: { type: String, default: "" },
    telephone: { type: String, default: null },
    competences: { type: [String], default: [] },
    // ── Vérification d'email ───────────────────────────────────────────────
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationTokenExpires: { type: Date, default: null },
    emailVerificationSentAt: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpiry: { type: Date, default: null },
  },
  { timestamps: true },
);

// ── Hash password before saving ───────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Compare passwords ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// ── Generate email verification token ──────────────────────
userSchema.methods.generateEmailVerificationToken = function () {
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.emailVerificationTokenExpires = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  ); // 24h
  this.emailVerificationSentAt = new Date();
  return token;
};

// ── Verify email token ─────────────────────────────────────
userSchema.methods.verifyEmailToken = function (token) {
  const crypto = require("crypto");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return (
    this.emailVerificationToken === hashedToken &&
    (!this.emailVerificationTokenExpires ||
      this.emailVerificationTokenExpires > new Date())
  );
};
module.exports = mongoose.model("User", userSchema);
