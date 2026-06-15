# Système SOS GPS - Industrie Minière

Système de sécurité et d'alerte d'urgence avec géolocalisation GPS pour les travailleurs miniers.

## Architecture

- **Backend API**: Node.js + Express + TypeScript (port 5000)
- **Base de données**: SQLite via Prisma ORM en développement (`backend/prisma/dev.db`) — PostgreSQL prévu en production
- **Dashboard Web**: React 18 + Vite + TypeScript (port 3000)
- **Application Mobile**: Expo + React Native 0.72
- **Communication temps réel**: WebSocket (Socket.io)

## Fonctionnalités principales

### Types d'alertes d'urgence
- ⚠️ **Accidents du travail** - Alerte critique avec notification automatique vers sécurité et hôpital
- 🏥 **Malaises médicaux** - Alerte haute priorité avec notification vers hôpital et sécurité
- 🔒 **Incidents de sécurité** - Alerte critique pour agressions, intrusions, menaces (sécurité + police)
- 🚨 **Alertes générales** - Pour toute autre situation d'urgence

### Fonctionnalités techniques
- 📍 Géolocalisation GPS en temps réel des travailleurs
- 📊 Dashboard de monitoring pour le centre de contrôle avec carte interactive
- 🔔 Notifications d'alerte en temps réel via WebSocket
- 📱 Application mobile intuitive avec boutons d'alerte spécialisés
- 🗺️ Visualisation des positions et alertes sur carte
- 📝 Historique complet des alertes et incidents
- 🎯 Système de priorités automatiques (CRITICAL, HIGH, MEDIUM, LOW)
- 📞 Notification automatique vers services externes (sécurité, hôpital, police)
- 👥 Gestion des contacts d'urgence configurables

## Structure du projet

```
PROJET SOS GPS/
├── backend/          # API REST + WebSocket
├── frontend/         # Dashboard React
├── mobile/           # Application React Native
├── shared/           # Types et utilitaires partagés
└── docs/             # Documentation
```

## Installation

Voir les README dans chaque dossier pour les instructions spécifiques.

## Accès au Dashboard

### Prérequis

1. **Backend démarré** : Le serveur API doit être en cours d'exécution sur le port 5000
2. **Base de données configurée** : SQLite (automatique via `dev.db`) — lancer `npm run db:seed` pour les données de test
3. **Dépendances installées** : Toutes les dépendances npm doivent être installées

### Étapes pour accéder au Dashboard

1. **Installer les dépendances du frontend** (si pas déjà fait) :
   ```bash
   cd frontend
   npm install
   ```

2. **Démarrer le serveur de développement** :
   ```bash
   cd frontend
   npm run dev
   ```
   
   Ou depuis la racine du projet :
   ```bash
   npm run dev:frontend
   ```

3. **Accéder au Dashboard** :
   - Ouvrez votre navigateur web
   - Allez à l'adresse : **http://127.0.0.1:3000** (utiliser `127.0.0.1` et non `localhost` sur Windows pour éviter les problèmes IPv6)
   - Le dashboard devrait s'afficher avec les pages suivantes :
     - **Dashboard** : Vue d'ensemble avec carte Leaflet et alertes actives
     - **Alertes** : Liste et gestion de toutes les alertes en temps réel
     - **Travailleurs** : Liste et ajout de travailleurs
     - **Contacts d'urgence** : Gestion des contacts par type

### Pages du Dashboard

- **`/`** - Dashboard principal (carte Leaflet + alertes récentes + compteurs)
- **`/alerts`** - Gestion des alertes (temps réel Socket.io, accusé de réception, résolution)
- **`/workers`** - Gestion des travailleurs (ajout, filtres par statut)
- **`/contacts`** - Contacts d'urgence (CRUD par type : Sécurité / Hôpital / Police / Interne)

### Dépannage

Si le dashboard ne se charge pas :

1. **Vérifier que le backend est démarré** :
   ```bash
   # Dans un autre terminal
   cd backend
   npm run dev
   ```
   Le backend doit être accessible sur http://localhost:5000

2. **Vérifier la console du navigateur** pour les erreurs

3. **Vérifier que le port 3000 n'est pas déjà utilisé** :
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```

4. **Vérifier les variables d'environnement** :
   - Le frontend utilise un proxy vers `http://localhost:5000` pour les appels API
   - Vérifiez que `FRONTEND_URL` dans le `.env` du backend correspond

## Technologies

- Node.js 18+
- SQLite (dev) / PostgreSQL (prod)
- React 18+ avec Vite
- React Native 0.72+ (Expo)
- TypeScript 5+
- Socket.io, Prisma ORM, Zod, Leaflet, Recharts

