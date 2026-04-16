const express = require("express");
const router = express.Router();
const Dossier = require("../models/Dossier");
const Operation = require("../models/Operation");
const auth = require("../middleware/authMiddleware");

// ─── DOSSIERS ─────────────────────────────────────────────

// GET tous les dossiers de l'utilisateur connecté
router.get("/", auth, async (req, res) => {
  try {
    const dossiers = await Dossier.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(dossiers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET un dossier par son id
router.get("/:id", auth, async (req, res) => {
  try {
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!dossier)
      return res.status(404).json({ message: "Dossier introuvable" });
    res.json(dossier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST créer un nouveau dossier
router.post("/", auth, async (req, res) => {
  try {
    const { titre, client, dateEcheance } = req.body;
    const dossier = new Dossier({
      userId: req.user.id,
      titre,
      client,
      dateEcheance,
    });
    await dossier.save();
    res.status(201).json(dossier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT modifier un dossier
router.put("/:id", auth, async (req, res) => {
  try {
    const dossier = await Dossier.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!dossier)
      return res.status(404).json({ message: "Dossier introuvable" });
    res.json(dossier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE supprimer un dossier
router.delete("/:id", auth, async (req, res) => {
  try {
    const dossier = await Dossier.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!dossier)
      return res.status(404).json({ message: "Dossier introuvable" });
    // Supprime aussi les opérations et étapes liées
    await Operation.deleteMany({ dossierId: req.params.id });
    res.json({ message: "Dossier supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── STATISTIQUES pour le Dashboard ──────────────────────

// GET stats globales de l'utilisateur (capital, entrées, sorties)
router.get("/stats/global", auth, async (req, res) => {
  try {
    const stats = await Operation.aggregate([
      { $match: { userId: req.user.id } }, // uniquement les opérations de cet user
      {
        $group: {
          _id: "$type", // grouper par type : entree / sortie
          total: { $sum: "$montant" },
        },
      },
    ]);

    // Reformater le résultat
    let entrees = 0,
      sorties = 0;
    stats.forEach((s) => {
      if (s._id === "entree") entrees = s.total;
      if (s._id === "sortie") sorties = s.total;
    });

    res.json({
      entrees,
      sorties,
      capital: entrees - sorties,
      totalOperations: await Operation.countDocuments({ userId: req.user.id }),
      totalDossiers: await Dossier.countDocuments({ userId: req.user.id }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
