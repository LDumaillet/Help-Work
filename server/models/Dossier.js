// models/Dossier.js
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
      enum: ["en_cours", "termine", "archive"],
      default: "en_cours",
    },
    dateOuverture: { type: Date, default: Date.now },
    dateEcheance: { type: Date },
    tempsTotal: { type: Number, default: 0 }, // en heures
    coutTotal: { type: Number, default: 0 }, // en €
    revenuFinal: { type: Number, default: 0 }, // en €
    rentabilite: { type: Number, default: 0 }, // % calculé automatiquement
  },
  { timestamps: true },
);

// Calcul auto de la rentabilité avant save
dossierSchema.pre("save", function (next) {
  if (this.coutTotal > 0) {
    this.rentabilite =
      ((this.revenuFinal - this.coutTotal) / this.coutTotal) * 100;
  }
});

module.exports = mongoose.model("Dossier", dossierSchema);
