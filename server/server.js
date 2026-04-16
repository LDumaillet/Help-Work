const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: "http://localhost:3000" })); // ton React tourne sur 3000
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/dossiers", require("./routes/dossiers"));

// Route de test
app.get("/", (req, res) => res.send("API Help Work en ligne ✅"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`),
);
