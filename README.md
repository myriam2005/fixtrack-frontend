# 🔧 FixTrack

Application web de gestion de tickets de maintenance industrielle

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![Docker](https://img.shields.io/badge/Docker-ready-blue)
![Stack](https://img.shields.io/badge/Stack-MERN-orange)

---

## 📌 Description

FixTrack permet à :

- des **utilisateurs** de signaler des pannes
- des **managers** de suivre et d’assigner les tickets
- des **techniciens** de les traiter

➡️ Avec des **notifications automatiques par email via n8n**

👤 **Administrateur :**

- Gestion des utilisateurs et des rôles
- Accès à tous les tickets
- Statistiques
- Configuration du système

---

## 🛠 Stack technique

| Couche           | Technologie                | Rôle                         |
| ---------------- | -------------------------- | ---------------------------- |
| Frontend         | React + Vite + Material UI | Interface utilisateur (SPA)  |
| Backend          | Node.js + Express          | API REST + logique métier    |
| Base de données  | MongoDB Atlas              | Stockage NoSQL               |
| Authentification | JWT                        | Sessions sécurisées          |
| Automatisation   | n8n                        | Emails & notifications       |
| Déploiement      | Docker + Docker Compose    | Orchestration des conteneurs |

---

## 🏗 Architecture 3-tiers

```
┌─────────────────────────────────────┐
│   TIER 1 — Présentation             │
│   React + Vite + Material UI        │
│   http://localhost:5173             │
└────────────────┬────────────────────┘
                 │ REST API
┌────────────────▼────────────────────┐
│   TIER 2 — Logique métier           │
│   Node.js + Express                 │
│   http://localhost:5000             │
│   + n8n  http://localhost:5678      │
└────────────────┬────────────────────┘
                 │ Mongoose
┌────────────────▼────────────────────┐
│   TIER 3 — Données                  │
│   MongoDB Atlas  localhost:27017    │
└─────────────────────────────────────┘
```

---

## 📁 Structure du projet

```
fixtrack/
├── fixtrack-backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   └── Dockerfile
├── fixtrack-frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       └── services/api.js
│   └── Dockerfile
├── n8n/
│   └── fixtrack-workflow.json
└── docker-compose.yml
```

---

## 🚀 Démarrage rapide

```bash
git clone https://github.com/myriam2005/fixtrack.git
cd fixtrack
git checkout main
docker-compose up --build
```

---

## 🌐 Accès aux services

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| n8n         | http://localhost:5678 |
| MongoDB     | localhost:27017       |

---

## ⚙️ Configuration

Le fichier `.env` est déjà préconfiguré.

👉 Consulter le guide de déploiement pour plus de détails.

---

## 👥 Équipe

| Nom              | Email                                                         |
| ---------------- | ------------------------------------------------------------- |
| Myriam Kary      | [myriemkary3@gmail.com](mailto:myriemkary3@gmail.com)         |
| Mariem Chaker    | [maryemchaker@gmail.com](mailto:maryemchaker@gmail.com)       |
| Emen Hamemi      | [emenhm123@gmail.com](mailto:emenhm123@gmail.com)             |
| Ola Khammassi    | [olakhammassy@gmail.com](mailto:olakhammassy@gmail.com)       |
| Oumayma Jendoubi | [jendoubioumeyma@gmail.com](mailto:jendoubioumeyma@gmail.com) |

🎓 Encadré par : **Faouzi Moussa**
📍 Faculté des Sciences de Tunis
🎓 GLSI2 – LCS2 — 2025/2026

---

## 📄 Licence

MIT — voir le fichier `LICENSE`
