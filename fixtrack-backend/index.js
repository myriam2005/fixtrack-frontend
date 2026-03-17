// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/database");

const app = express();

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet()); // Sécurise les headers HTTP

// ─── CORS — autorise le frontend React (localhost:5173) ──────────────────────
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  }),
);

// ─── Body Parser ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting global ─────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // max 200 requêtes par IP par 15 min
  message: { message: "Trop de requêtes, réessayez plus tard." },
});
app.use(globalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));
// ─── Route de test ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "🚀 FixTrack API is running!", status: "OK" });
});

// ─── Error Handler global ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Erreur serveur interne", error: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
