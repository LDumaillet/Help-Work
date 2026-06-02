# 🗂️ Help Work

> Application web MERN de gestion de dossiers, suivi financier et analyse de rentabilité en temps réel.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev)

---

## ✨ Fonctionnalités

### 👤 Authentification & Sécurité

- Inscription avec photo de profil
- Connexion sécurisée par **JWT**
- **Double authentification** par code OTP envoyé par email
- **Mot de passe oublié** avec lien de réinitialisation sécurisé
- Détection automatique de session expirée
- Rate limiting et protection des headers (Helmet)

### 📁 Gestion des dossiers

- Création, modification et clôture de dossiers
- Statuts : En cours, En attente de pièce, Terminé, Archivé
- Indicateurs visuels : échéance dépassée, rentabilité faible ou négative
- Barre de progression par étapes/jalons
- Vue complète, liste ou minimale
- Pagination des dossiers
- **Export PDF** professionnel avec logo

### ⏱️ Chronomètre intégré

- Suivi du temps passé par dossier
- Start / Pause / Reset
- Sauvegarde automatique du temps accumulé

### 💰 Opérations financières

- Ajout d'entrées et de sorties par dossier
- Calcul automatique du solde et de la rentabilité
- Historique complet des opérations

### 🚩 Étapes & Jalons

- Ajout d'étapes avec date butoir
- Barre de progression visuelle
- Cochage des étapes complétées

### 📊 Statistiques avancées

- KPI globaux : capital, entrées, sorties, rentabilité
- Graphiques interactifs (barres et camembert)
- Filtres par période : total, par année, par mois
- **Export PDF** du rapport de statistiques

### 🔔 Notifications intelligentes

- Alertes automatiques sur les échéances et la rentabilité
- Validation ou snooze d'une notification
- Rappel personnalisé (1, 2, 3, 7 ou 14 jours)

### 👤 Profil utilisateur

- Modification du nom, email, avatar et mot de passe
- Upload de photo de profil

### 🎨 Interface & UX

- Thème **clair / sombre**
- Design **responsive** (mobile, tablette, desktop)
- Barre de recherche globale (dossiers & clients)
- Skeletons de chargement
- Modales de confirmation
- Gestion des erreurs réseau
- Scrollbar personnalisée
- Menu latéral rétractable

---

## 🛠️ Technologies utilisées

### Frontend

| Technologie       | Usage                 |
| ----------------- | --------------------- |
| React 19          | Interface utilisateur |
| Vite 7            | Bundler               |
| React Router DOM  | Navigation            |
| Recharts          | Graphiques            |
| React Hook Form   | Formulaires           |
| Sass              | Styles                |
| Font Awesome      | Icônes                |
| jsPDF + AutoTable | Export PDF            |

### Backend

| Technologie        | Usage                            |
| ------------------ | -------------------------------- |
| Node.js 22         | Runtime                          |
| Express 5          | Serveur API                      |
| MongoDB Atlas      | Base de données cloud            |
| Mongoose           | ODM                              |
| JWT                | Authentification                 |
| bcryptjs           | Hashage des mots de passe        |
| Nodemailer         | Envoi d'emails (OTP, reset)      |
| Helmet             | Sécurité des headers HTTP        |
| express-rate-limit | Protection contre le brute force |

---

## 📦 Installation

### Prérequis

- Node.js 18+
- Compte MongoDB Atlas
- Compte Gmail avec mot de passe d'application

### 1. Cloner le projet

```bash
git clone https://github.com/LDumaillet/Help-Work.git
cd Help-Work
```

### 2. Installer les dépendances

```bash
# Dépendances racine (frontend)
npm install

# Dépendances backend
cd server
npm install
```

### 3. Configurer les variables d'environnement

Crée un fichier `.env` dans le dossier `server/` :

```env
# Base de données
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/helpwork

# JWT
JWT_SECRET=ton_secret_jwt_long_et_complexe
JWT_EXPIRES_IN=7d

# Serveur
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Email (Gmail)
GMAIL_USER=toncompte@gmail.com
GMAIL_PASS=ton_app_password_16_caracteres
```

### 4. Lancer le projet en développement

```bash
# Depuis la racine — lance frontend et backend simultanément
npm run start
```

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:5000 |

---

## 📁 Structure du projet

Help-Work/
├── client/
│ └── src/
│ ├── assets/
│ ├── components/ # Header, Footer, MenuLeft, PrivateRoute...
│ ├── context/ # Auth, Notifications
│ ├── hooks/ # useFetch
│ ├── pages/ # Home, Dashboard, Cases, Stats, Profile...
│ └── styles/ # SCSS modulaire
├── server/
│ ├── middleware/ # authMiddleware
│ ├── models/ # User, Dossier, Operation, Etape, Token, OtpCode
│ ├── routes/ # auth, dossiers
│ ├── db.js
│ └── server.js
├── package.json
└── vite.config.js

---

## 🔐 Sécurité

- Mots de passe hashés avec **bcryptjs**
- **Double authentification** par OTP email à chaque connexion
- Authentification par **JWT** (7 jours)
- Routes protégées côté frontend et backend
- Données strictement isolées par utilisateur
- Rate limiting sur les routes d'authentification
- Headers HTTP sécurisés avec **Helmet**
- Variables sensibles dans `.env` (jamais commitées)
- Tokens de réinitialisation à usage unique avec expiration

---

## 🚀 Déploiement

| Service       | Usage                 |
| ------------- | --------------------- |
| Vercel        | Frontend React/Vite   |
| Render        | Backend Express       |
| MongoDB Atlas | Base de données cloud |

---

## 👨‍💻 Auteur

**Lucas Dumaillet**
[GitHub](https://github.com/LDumaillet)

---

## 📄 Licence

Ce projet est sous licence ISC.
