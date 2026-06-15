# Architecture du Système SOS GPS

## Vue d'ensemble

Le système SOS GPS est une application complète pour la gestion des alertes d'urgence et le suivi GPS des travailleurs dans l'industrie minière.

## Composants principaux

### 1. Backend API (Node.js + Express + TypeScript)

- **Port**: 5000
- **Base de données**: PostgreSQL avec Prisma ORM
- **WebSocket**: Socket.io pour les communications en temps réel

#### Endpoints principaux:

- `POST /api/sos` - Créer une alerte SOS
- `GET /api/sos` - Obtenir toutes les alertes SOS
- `PATCH /api/sos/:id/status` - Mettre à jour le statut d'une alerte
- `GET /api/workers` - Obtenir tous les travailleurs
- `PATCH /api/workers/:id/location` - Mettre à jour la position GPS
- `GET /api/alerts` - Obtenir toutes les alertes

### 2. Frontend Dashboard (React + TypeScript)

- **Port**: 3000
- **Framework**: React avec Vite
- **Cartes**: Leaflet/React-Leaflet
- **WebSocket**: Socket.io-client pour les mises à jour en temps réel

#### Pages:

- Dashboard: Vue d'ensemble avec carte et alertes actives
- Alertes: Liste et gestion des alertes
- Travailleurs: Liste des travailleurs et leurs positions

### 3. Application Mobile (React Native + Expo)

- **Framework**: React Native avec Expo
- **Géolocalisation**: expo-location
- **API**: Communication avec le backend via REST

#### Fonctionnalités:

- Suivi GPS en temps réel
- Bouton SOS d'urgence
- Mise à jour automatique de la position

## Flux de données

1. **Alerte SOS**:
   - L'utilisateur appuie sur le bouton SOS dans l'app mobile
   - L'app envoie une requête POST à `/api/sos` avec la position GPS
   - Le backend crée l'alerte en base de données
   - Le backend émet un événement WebSocket `sos-alert`
   - Le dashboard reçoit l'alerte en temps réel et l'affiche

2. **Suivi GPS**:
   - L'app mobile envoie périodiquement la position à `/api/workers/:id/location`
   - Le backend met à jour la position du travailleur
   - Le backend émet un événement WebSocket `worker-location-update`
   - Le dashboard met à jour la position sur la carte

## Base de données

### Modèle Worker
- Informations du travailleur
- Dernière position GPS enregistrée
- Statut (ACTIVE, INACTIVE, EMERGENCY)

### Modèle Alert
- Type d'alerte (SOS, MEDICAL, etc.)
- Position GPS de l'alerte
- Statut (ACTIVE, ACKNOWLEDGED, RESOLVED, CANCELLED)
- Relation avec le Worker

## Sécurité

- Authentification JWT (à implémenter)
- Validation des données avec Zod
- CORS configuré
- Variables d'environnement pour les secrets

## Déploiement

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Installation

```bash
# Installer toutes les dépendances
npm run install:all

# Configurer la base de données
cd backend
cp .env.example .env
# Éditer .env avec vos paramètres
npm run db:migrate

# Démarrer les services
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
npm run dev:mobile   # Terminal 3
```



