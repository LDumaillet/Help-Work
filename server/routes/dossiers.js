const express = require("express");
const router = express.Router();
const Dossier = require("../models/Dossier");
const Operation = require("../models/Operation");
const Etape = require("../models/Etape");
const auth = require("../middleware/authMiddleware");

// ─── GET tous les dossiers ────────────────────────────────
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

// ─── STATISTIQUES ─────────────────────────────────────────
router.get("/stats/global", auth, async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const stats = await Operation.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: "$type", total: { $sum: "$montant" } } },
    ]);

    let entrees = 0,
      sorties = 0;
    stats.forEach((s) => {
      if (s._id === "entree") entrees = s.total;
      if (s._id === "sortie") sorties = s.total;
    });

    const totalOperations = await Operation.countDocuments({
      userId: req.user.id,
    });
    const totalDossiers = await Dossier.countDocuments({ userId: req.user.id });

    res.json({
      entrees,
      sorties,
      capital: entrees - sorties,
      totalOperations,
      totalDossiers,
    });
  } catch (err) {
    console.error("Erreur stats/global:", err.message);
    res.json({
      entrees: 0,
      sorties: 0,
      capital: 0,
      totalOperations: 0,
      totalDossiers: 0,
    });
  }
});

// ─── OPÉRATIONS : routes avant /:id ──────────────────────

router.get("/:id/operations", auth, async (req, res) => {
  try {
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!dossier)
      return res.status(404).json({ message: "Dossier introuvable" });

    const operations = await Operation.find({ dossierId: req.params.id }).sort({
      date: -1,
    });
    res.json(operations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/operations", auth, async (req, res) => {
  try {
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!dossier)
      return res.status(404).json({ message: "Dossier introuvable" });

    const { type, montant, description, date } = req.body;
    const operation = new Operation({
      dossierId: req.params.id,
      userId: req.user.id,
      type,
      montant: Number(montant),
      description,
      date: date || new Date(),
    });
    await operation.save();

    const operations = await Operation.find({ dossierId: req.params.id });
    const entrees = operations
      .filter((o) => o.type === "entree")
      .reduce((sum, o) => sum + o.montant, 0);
    const sorties = operations
      .filter((o) => o.type === "sortie")
      .reduce((sum, o) => sum + o.montant, 0);

    dossier.revenuFinal = entrees;
    dossier.coutTotal = sorties;
    dossier.rentabilite =
      sorties > 0 ? ((entrees - sorties) / sorties) * 100 : 0;
    await dossier.save();

    res.status(201).json({ operation, dossier });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/operations/:opId", auth, async (req, res) => {
  try {
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!dossier)
      return res.status(404).json({ message: "Dossier introuvable" });

    await Operation.findByIdAndDelete(req.params.opId);

    const operations = await Operation.find({ dossierId: req.params.id });
    const entrees = operations
      .filter((o) => o.type === "entree")
      .reduce((sum, o) => sum + o.montant, 0);
    const sorties = operations
      .filter((o) => o.type === "sortie")
      .reduce((sum, o) => sum + o.montant, 0);

    dossier.revenuFinal = entrees;
    dossier.coutTotal = sorties;
    dossier.rentabilite =
      sorties > 0 ? ((entrees - sorties) / sorties) * 100 : 0;
    await dossier.save();

    res.json({ message: "Opération supprimée", dossier });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ÉTAPES : routes avant /:id ──────────────────────────

router.get("/:id/etapes", auth, async (req, res) => {
  try {
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!dossier)
      return res.status(404).json({ message: "Dossier introuvable" });

    const etapes = await Etape.find({ dossierId: req.params.id }).sort({
      ordre: 1,
    });
    res.json(etapes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/etapes", auth, async (req, res) => {
  try {
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!dossier)
      return res.status(404).json({ message: "Dossier introuvable" });

    const count = await Etape.countDocuments({ dossierId: req.params.id });
    const etape = new Etape({
      dossierId: req.params.id,
      titre: req.body.titre,
      dateButoir: req.body.dateButoir || null,
      ordre: count + 1,
    });
    await etape.save();
    res.status(201).json(etape);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/etapes/:etapeId", auth, async (req, res) => {
  try {
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!dossier)
      return res.status(404).json({ message: "Dossier introuvable" });

    const etape = await Etape.findByIdAndUpdate(req.params.etapeId, req.body, {
      new: true,
    });
    res.json(etape);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/etapes/:etapeId", auth, async (req, res) => {
  try {
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!dossier)
      return res.status(404).json({ message: "Dossier introuvable" });

    await Etape.findByIdAndDelete(req.params.etapeId);
    res.json({ message: "Étape supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DOSSIER par id : EN DERNIER ─────────────────────────

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

router.post("/", auth, async (req, res) => {
  try {
    const { titre, client, dateEcheance, tempsTotal, coutTotal, revenuFinal } =
      req.body;

    const coutTotalNum = Number(coutTotal) || 0;
    const revenuFinalNum = Number(revenuFinal) || 0;
    const rentabilite =
      coutTotalNum > 0
        ? ((revenuFinalNum - coutTotalNum) / coutTotalNum) * 100
        : 0;

    const dossier = new Dossier({
      userId: req.user.id,
      titre,
      client,
      dateEcheance,
      tempsTotal: Number(tempsTotal) || 0,
      coutTotal: coutTotalNum,
      revenuFinal: revenuFinalNum,
      rentabilite,
    });

    await dossier.save();
    res.status(201).json(dossier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const dossier = await Dossier.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!dossier)
      return res.status(404).json({ message: "Dossier introuvable" });

    const coutTotal = Number(req.body.coutTotal ?? dossier.coutTotal);
    const revenuFinal = Number(req.body.revenuFinal ?? dossier.revenuFinal);
    const rentabilite =
      coutTotal > 0 ? ((revenuFinal - coutTotal) / coutTotal) * 100 : 0;

    Object.assign(dossier, {
      ...req.body,
      coutTotal,
      revenuFinal,
      rentabilite,
    });
    await dossier.save();
    res.json(dossier);
  } catch (err) {
    console.error("Erreur PUT dossier:", err.message);
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const dossier = await Dossier.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!dossier)
      return res.status(404).json({ message: "Dossier introuvable" });

    await Operation.deleteMany({ dossierId: req.params.id });
    await Etape.deleteMany({ dossierId: req.params.id });
    res.json({ message: "Dossier supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
