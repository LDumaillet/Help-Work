const mongoose = require("mongoose");

const dossierSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    titre: { type: String, required: true },
    client: { type: String, default: "" },
    statut: {
      type: String,
      enum: ["en_cours", "attente", "termine", "archive"],
      default: "en_cours",
    },
    dateOuverture: { type: Date, default: Date.now },
    dateEcheance: { type: Date },
    tempsTotal: { type: Number, default: 0 },
    coutTotal: { type: Number, default: 0 },
    revenuFinal: { type: Number, default: 0 },
    rentabilite: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Dossier", dossierSchema);
