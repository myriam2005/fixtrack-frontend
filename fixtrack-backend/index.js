require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/database");

const app = express();

connectDB();

app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:4173", // ← ajout Docker frontend
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Trop de requêtes, réessayez plus tard." },
});
app.use(globalLimiter);

const accountRequestRoutes = require("./routes/accountRequest");
app.use("/api/account-request", accountRequestRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/export", require("./routes/exportRoutes"));
app.use("/api/logs", require("./routes/logsRoutes"));

const configRoutes = require("./routes/configRoutes");
app.use("/api/config", configRoutes); // ← supprimé le doublon

app.get("/", (req, res) =>
  res.json({ message: "🚀 FixTrack API is running!", status: "OK" }),
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Erreur serveur interne", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
