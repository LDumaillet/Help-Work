const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./db");

dotenv.config();

connectDB();

const app = express();

// ─────────────────────────────────────────────
// Middlewares globaux
// ─────────────────────────────────────────────

app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);

app.use(express.json());

app.use(helmet());

// ─────────────────────────────────────────────
// Rate limiting
// ─────────────────────────────────────────────

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Trop de requêtes, réessaie plus tard.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    message: "Trop de tentatives de connexion.",
  },
});

app.use("/api/", limiter);

app.use("/api/auth/login", authLimiter);

app.use("/api/auth/register", authLimiter);

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

app.use("/api/auth", require("./routes/auth"));

app.use("/api/dossiers", require("./routes/dossiers"));

// ─────────────────────────────────────────────
// Route test
// ─────────────────────────────────────────────

app.get("/", (req, res) => {
  res.send("API Help Work en ligne ✅");
});

// ─────────────────────────────────────────────
// Start serveur
// ─────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
