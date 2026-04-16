// models/Operation.js
const mongoose = require("mongoose");

const operationSchema = new mongoose.Schema(
  {
    dossierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dossier",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, enum: ["entree", "sortie"], required: true },
    description: { type: String, default: "" },
    montant: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Operation", operationSchema);
