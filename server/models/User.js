// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    motDePasse: { type: String, required: true }, // bcrypt hash
    avatar: { type: String, default: "" }, // chemin ou URL image
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
