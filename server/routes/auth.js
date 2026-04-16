const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Inscription
router.post("/register", async (req, res) => {
  try {
    const { nom, email, motDePasse, avatar } = req.body;

    const existant = await User.findOne({ email });
    if (existant)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const hash = await bcrypt.hash(motDePasse, 10);
    const user = new User({ nom, email, motDePasse: hash, avatar });
    await user.save();

    res.status(201).json({ message: "Compte créé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Connexion
router.post("/login", async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Identifiants incorrects" });

    const valide = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!valide)
      return res.status(400).json({ message: "Identifiants incorrects" });

    const token = jwt.sign(
      { id: user._id, nom: user.nom, avatar: user.avatar },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        nom: user.nom,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
