const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Dossier = require("./models/Dossier");
const Operation = require("./models/Operation");
const Etape = require("./models/Etape");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connecté à MongoDB Atlas");

    await User.deleteMany({});
    await Dossier.deleteMany({});
    await Operation.deleteMany({});
    await Etape.deleteMany({});
    console.log("🗑️  Collections vidées");

    const hash = await bcrypt.hash("test1234", 10);
    const user = await User.create({
      nom: "Lucas",
      email: "lucas@helpwork.fr",
      motDePasse: hash,
      avatar: "",
    });
    console.log("👤 Utilisateur créé");

    const dossier1 = await Dossier.create({
      userId: user._id,
      titre: "Dossier Alpha",
      client: "Client A",
      statut: "en_cours",
      dateEcheance: new Date("2025-12-31"),
      tempsTotal: 12,
      coutTotal: 500,
      revenuFinal: 1500,
      rentabilite: 200,
    });

    const dossier2 = await Dossier.create({
      userId: user._id,
      titre: "Dossier Beta",
      client: "Client B",
      statut: "termine",
      dateEcheance: new Date("2025-06-30"),
      tempsTotal: 8,
      coutTotal: 300,
      revenuFinal: 900,
      rentabilite: 200,
    });
    console.log("📁 Dossiers créés");

    await Operation.insertMany([
      {
        dossierId: dossier1._id,
        userId: user._id,
        type: "entree",
        description: "Acompte client A",
        montant: 750,
        date: new Date(),
      },
      {
        dossierId: dossier1._id,
        userId: user._id,
        type: "sortie",
        description: "Achat matériel",
        montant: 200,
        date: new Date(),
      },
      {
        dossierId: dossier2._id,
        userId: user._id,
        type: "entree",
        description: "Solde client B",
        montant: 900,
        date: new Date(),
      },
      {
        dossierId: dossier2._id,
        userId: user._id,
        type: "sortie",
        description: "Frais divers",
        montant: 100,
        date: new Date(),
      },
    ]);
    console.log("💰 Opérations créées");

    await Etape.insertMany([
      {
        dossierId: dossier1._id,
        titre: "Analyse du besoin",
        faite: true,
        dateButoir: new Date("2025-03-01"),
        ordre: 1,
      },
      {
        dossierId: dossier1._id,
        titre: "Proposition commerciale",
        faite: false,
        dateButoir: new Date("2025-04-01"),
        ordre: 2,
      },
      {
        dossierId: dossier2._id,
        titre: "Livraison finale",
        faite: true,
        dateButoir: new Date("2025-06-30"),
        ordre: 1,
      },
    ]);
    console.log("📋 Etapes créées");

    console.log("");
    console.log("🎉 Base de données initialisée avec succès !");
    console.log("👤 Email : lucas@helpwork.fr");
    console.log("🔑 Mot de passe : test1234");

    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur :", err.message);
    process.exit(1);
  }
}

seed();
