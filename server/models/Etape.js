// models/Etape.js
const mongoose = require("mongoose");

const etapeSchema = new mongoose.Schema(
  {
    dossierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dossier",
      required: true,
    },
    titre: { type: String, required: true },
    faite: { type: Boolean, default: false },
    dateButoir: { type: Date },
    ordre: { type: Number, default: 0 }, // pour trier les étapes
  },
  { timestamps: true },
);

module.exports = mongoose.model("Etape", etapeSchema);
