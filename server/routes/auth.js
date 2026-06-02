const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const User = require("../models/User");
const Token = require("../models/Token");
const OtpCode = require("../models/OtpCode");
const auth = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
// Configuration Nodemailer
// ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// ─────────────────────────────────────────────
// Templates email
// ─────────────────────────────────────────────
const emailHeader = `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
    <div style="background: #585b4c; padding: 24px; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 22px;">Help Work</h1>
    </div>
    <div style="background: #f5f2ee; padding: 32px; border-radius: 0 0 12px 12px;">
`;

const emailFooter = `
    </div>
  </div>
`;

const emailSignature = `
  <p style="color: #aa9d9f; font-size: 13px; line-height: 1.6; margin-top: 24px;">
    Cet email a été envoyé automatiquement, merci de ne pas y répondre.
  </p>
`;

// ─────────────────────────────────────────────
// Générateur OTP
// ─────────────────────────────────────────────
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────────
// GET profil utilisateur connecté
// ─────────────────────────────────────────────
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-motDePasse");
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT modifier profil
// ─────────────────────────────────────────────
router.put("/me", auth, async (req, res) => {
  try {
    const { nom, email, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    if (email && email !== user.email) {
      const existant = await User.findOne({
        email: email.trim().toLowerCase(),
      });
      if (existant)
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    if (nom) user.nom = nom.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.json({
      id: user._id,
      nom: user.nom,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT modifier mot de passe
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
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable" });

    const valide = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
    if (!valide)
      return res.status(400).json({ message: "Ancien mot de passe incorrect" });

    user.motDePasse = await bcrypt.hash(nouveauMotDePasse, 10);
    await user.save();

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST inscription
// ─────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { nom, email, motDePasse, avatar } = req.body;

    if (!nom || !email || !motDePasse) {
      return res
        .status(400)
        .json({ message: "Tous les champs obligatoires doivent être remplis" });
    }

    const emailClean = email.trim().toLowerCase();
    const existant = await User.findOne({ email: emailClean });
    if (existant)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const hash = await bcrypt.hash(motDePasse, 10);
    const user = new User({
      nom: nom.trim(),
      email: emailClean,
      motDePasse: hash,
      avatar,
    });
    await user.save();

    // Email de bienvenue
    await transporter.sendMail({
      from: `"Help Work" <${process.env.GMAIL_USER}>`,
      to: emailClean,
      subject: "Bienvenue sur Help Work ! 🎉",
      html: `
        ${emailHeader}
        <h2 style="color: #2a2c24; margin-top: 0;">Bienvenue ${nom.trim()} !</h2>
        <p style="color: #585b4c; line-height: 1.6;">
          Votre compte Help Work a été créé avec succès.
          Vous pouvez maintenant vous connecter et commencer à gérer vos dossiers.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          
            href="${process.env.CLIENT_URL}/connect"
            style="background: #585b4c; color: white; padding: 14px 32px;
            border-radius: 30px; text-decoration: none; font-weight: bold;
            font-size: 15px; display: inline-block;"
          >
            Se connecter
          </a>
        </div>
        ${emailSignature}
        ${emailFooter}
      `,
    });

    res.status(201).json({ message: "Compte créé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST connexion — envoie OTP
// ─────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user)
      return res.status(400).json({ message: "Identifiants incorrects" });

    const valide = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!valide)
      return res.status(400).json({ message: "Identifiants incorrects" });

    // Supprime les anciens codes OTP
    await OtpCode.deleteMany({ userId: user._id });

    // Génère et sauvegarde le code OTP — expire dans 10 minutes
    const code = generateOtp();
    await OtpCode.create({
      userId: user._id,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Envoie le code par email
    await transporter.sendMail({
      from: `"Help Work" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Votre code de connexion — Help Work",
      html: `
        ${emailHeader}
        <h2 style="color: #2a2c24; margin-top: 0;">Code de connexion</h2>
        <p style="color: #585b4c; line-height: 1.6;">
          Voici votre code de vérification pour vous connecter à Help Work.
          Il est valable pendant <strong>10 minutes</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <div style="background: #2a2c24; color: white; font-size: 36px;
            font-weight: bold; letter-spacing: 12px; padding: 20px 32px;
            border-radius: 16px; display: inline-block; font-family: monospace;">
            ${code}
          </div>
        </div>
        <p style="color: #585b4c; line-height: 1.6;">
          Bonjour <strong>${user.nom}</strong>, si vous n'avez pas tenté de vous
          connecter, ignorez cet email et changez votre mot de passe immédiatement.
        </p>
        ${emailSignature}
        ${emailFooter}
      `,
    });

    res.json({
      requireOtp: true,
      userId: user._id,
      message: "Code envoyé par email.",
    });
  } catch (err) {
    console.error("Erreur login:", err.message);
    res.status(500).json({ message: "Erreur lors de l'envoi du code." });
  }
});

// ─────────────────────────────────────────────
// POST vérification OTP
// ─────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  try {
    const { userId, code } = req.body;

    const otpDoc = await OtpCode.findOne({ userId });
    if (!otpDoc)
      return res.status(400).json({ message: "Code invalide ou expiré." });

    if (otpDoc.expiresAt < new Date()) {
      await OtpCode.deleteOne({ _id: otpDoc._id });
      return res
        .status(400)
        .json({ message: "Code expiré. Reconnectez-vous." });
    }

    if (otpDoc.code !== code) {
      return res.status(400).json({ message: "Code incorrect." });
    }

    await OtpCode.deleteOne({ _id: otpDoc._id });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Utilisateur introuvable." });

    const token = jwt.sign(
      { id: user._id, nom: user.nom },
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

// ─────────────────────────────────────────────
// POST mot de passe oublié
// ─────────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Toujours répondre OK pour ne pas révéler si l'email existe
    if (!user) {
      return res.json({
        message: "Si cet email existe, un lien a été envoyé.",
      });
    }

    // Supprime les anciens tokens
    await Token.deleteMany({ userId: user._id });

    // Génère un token sécurisé
    const resetToken = crypto.randomBytes(32).toString("hex");

    await Token.create({
      userId: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 heure
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Help Work" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Réinitialisation de votre mot de passe — Help Work",
      html: `
        ${emailHeader}
        <h2 style="color: #2a2c24; margin-top: 0;">Réinitialisation du mot de passe</h2>
        <p style="color: #585b4c; line-height: 1.6;">
          Bonjour <strong>${user.nom}</strong>,
        </p>
        <p style="color: #585b4c; line-height: 1.6;">
          Vous avez demandé la réinitialisation de votre mot de passe.
          Cliquez sur le bouton ci-dessous pour en créer un nouveau.
        </p>
        <p style="color: #585b4c; line-height: 1.6;">
          Ce lien est valable pendant <strong>1 heure</strong>.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a
            href="${resetUrl}"
            style="background: #585b4c; color: white; padding: 14px 32px;
            border-radius: 30px; text-decoration: none; font-weight: bold;
            font-size: 15px; display: inline-block;"
          >
            Réinitialiser mon mot de passe
          </a>
        </div>
        <p style="color: #aa9d9f; font-size: 13px; line-height: 1.6;">
          Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          Votre mot de passe restera inchangé.
        </p>
        ${emailSignature}
        ${emailFooter}
      `,
    });

    res.json({ message: "Si cet email existe, un lien a été envoyé." });
  } catch (err) {
    console.error("Erreur forgot-password:", err.message);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email." });
  }
});

// ─────────────────────────────────────────────
// POST réinitialisation mot de passe
// ─────────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { token, nouveauMotDePasse } = req.body;

    const tokenDoc = await Token.findOne({ token });
    if (!tokenDoc)
      return res.status(400).json({ message: "Lien invalide ou expiré." });

    if (tokenDoc.expiresAt < new Date()) {
      await Token.deleteOne({ _id: tokenDoc._id });
      return res
        .status(400)
        .json({ message: "Lien expiré. Faites une nouvelle demande." });
    }

    const hash = await bcrypt.hash(nouveauMotDePasse, 10);
    await User.findByIdAndUpdate(tokenDoc.userId, { motDePasse: hash });
    await Token.deleteOne({ _id: tokenDoc._id });

    // Email de confirmation
    const user = await User.findById(tokenDoc.userId);
    if (user) {
      await transporter.sendMail({
        from: `"Help Work" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: "Mot de passe modifié — Help Work",
        html: `
          ${emailHeader}
          <h2 style="color: #2a2c24; margin-top: 0;">Mot de passe modifié</h2>
          <p style="color: #585b4c; line-height: 1.6;">
            Bonjour <strong>${user.nom}</strong>,
          </p>
          <p style="color: #585b4c; line-height: 1.6;">
            Votre mot de passe a été modifié avec succès.
            Si vous n'êtes pas à l'origine de cette modification,
            contactez-nous immédiatement.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a
              href="${process.env.CLIENT_URL}/connect"
              style="background: #585b4c; color: white; padding: 14px 32px;
              border-radius: 30px; text-decoration: none; font-weight: bold;
              font-size: 15px; display: inline-block;"
            >
              Se connecter
            </a>
          </div>
          ${emailSignature}
          ${emailFooter}
        `,
      });
    }

    res.json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
