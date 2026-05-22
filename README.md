# 🗂️ Help Work

> Application web MERN de gestion de dossiers, suivi financier et analyse de rentabilité en temps réel.

---

## ✨ Fonctionnalités

### 👤 Authentification & Profil

- Inscription avec photo de profil
- Connexion sécurisée avec JWT
- Page profil — modification du nom, email, avatar et mot de passe

### 📁 Gestion des dossiers

- Création, modification et clôture de dossiers
- Statuts : En cours, En attente, Terminé, Archivé
- Indicateurs visuels par couleur (échéance dépassée, rentabilité faible)
- Vue complète ou minimale
- Export PDF par dossier

### 💰 Opérations financières

- Ajout d'entrées et de sorties par dossier
- Calcul automatique du solde et de la rentabilité
- Historique des opérations

### 🚩 Étapes & Jalons

- Ajout d'étapes avec date butoir
- Barre de progression visuelle
- Cochage des étapes complétées

### 📊 Statistiques

- KPI globaux : capital, entrées, sorties, rentabilité
- Graphiques Recharts (barres et camembert)
- Filtres par période : total, par année, par mois

### 🔔 Notifications intelligentes

- Alertes automatiques sur les échéances et la rentabilité
- Possibilité de valider ou de snoozer une notification
- Rappel personnalisé (1, 2, 3, 7 ou 14 jours)

### 🎨 Interface

- Thème clair / sombre
- Design responsive (mobile, tablette, desktop)
- Scrollbar personnalisée
- Menu latéral rétractable

---

## 🛠️ Technologies utilisées

### Frontend

| Technologie       | Usage                 |
| ----------------- | --------------------- |
| React 19          | Interface utilisateur |
| Vite              | Bundler               |
| React Router DOM  | Navigation            |
| Recharts          | Graphiques            |
| React Hook Form   | Formulaires           |
| Sass              | Styles                |
| Font Awesome      | Icônes                |
| jsPDF + AutoTable | Export PDF            |

### Backend

| Technologie   | Usage                     |
| ------------- | ------------------------- |
| Node.js       | Runtime                   |
| Express       | Serveur API               |
| MongoDB Atlas | Base de données           |
| Mongoose      | ODM                       |
| JWT           | Authentification          |
| bcryptjs      | Hashage des mots de passe |

---

## 📦 Installation

### Prérequis

- Node.js 18+
- Compte MongoDB Atlas

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
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/helpwork
JWT_SECRET=ton_secret_jwt
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_EXPIRES_IN=7d
```

### 4. Lancer le projet en développement

```bash
# Depuis la racine — lance le frontend et le backend simultanément
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
│ ├── pages/ # Home, Dashboard, Cases, Stats, Profile...
│ └── styles/ # SCSS modulaire
├── server/
│ ├── middleware/ # authMiddleware
│ ├── models/ # User, Dossier, Operation, Etape
│ ├── routes/ # auth, dossiers
│ ├── db.js
│ └── server.js
├── package.json
└── vite.config.js

## 🔐 Sécurité

- Mots de passe hashés avec **bcryptjs**
- Authentification par **JWT** (token 7 jours)
- Routes protégées côté frontend et backend
- Données isolées par utilisateur
- Variables sensibles dans `.env` (jamais commitées)

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
