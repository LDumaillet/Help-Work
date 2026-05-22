const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
// GET profil utilisateur connecté
// ─────────────────────────────────────────────
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-motDePasse");

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// Modifier profil
// ─────────────────────────────────────────────
router.put("/me", auth, async (req, res) => {
  try {
    const { nom, email, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    if (email && email !== user.email) {
      const existant = await User.findOne({
        email: email.trim().toLowerCase(),
      });

      if (existant) {
        return res.status(400).json({
          message: "Cet email est déjà utilisé",
        });
      }
    }

    if (nom) user.nom = nom.trim();

    if (email) {
      user.email = email.trim().toLowerCase();
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();

    res.json({
      id: user._id,
      nom: user.nom,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// Modifier mot de passe
// ─────────────────────────────────────────────
router.put("/me/password", auth, async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    if (!nouveauMotDePasse || nouveauMotDePasse.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    const valide = await bcrypt.compare(ancienMotDePasse, user.motDePasse);

    if (!valide) {
      return res.status(400).json({
        message: "Ancien mot de passe incorrect",
      });
    }

    user.motDePasse = await bcrypt.hash(nouveauMotDePasse, 10);

    await user.save();

    res.json({
      message: "Mot de passe modifié avec succès",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// Inscription
// ─────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { nom, email, motDePasse, avatar } = req.body;

    if (!nom || !email || !motDePasse) {
      return res.status(400).json({
        message: "Tous les champs obligatoires doivent être remplis",
      });
    }

    const emailClean = email.trim().toLowerCase();

    const existant = await User.findOne({
      email: emailClean,
    });

    if (existant) {
      return res.status(400).json({
        message: "Email déjà utilisé",
      });
    }

    const hash = await bcrypt.hash(motDePasse, 10);

    const user = new User({
      nom: nom.trim(),
      email: emailClean,
      motDePasse: hash,
      avatar,
    });

    await user.save();

    res.status(201).json({
      message: "Compte créé avec succès",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// Connexion
// ─────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        message: "Identifiants incorrects",
      });
    }

    const valide = await bcrypt.compare(motDePasse, user.motDePasse);

    if (!valide) {
      return res.status(400).json({
        message: "Identifiants incorrects",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        nom: user.nom,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7h",
      },
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
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
