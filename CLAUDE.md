# CLAUDE.md — Projet SOS GPS (Industrie Minière)

Système d'alerte d'urgence avec géolocalisation GPS pour travailleurs miniers.
Monorepo npm workspaces : `backend`, `frontend`, `mobile`, `shared`.

---

## Stack technique

| Couche    | Techno                                      | Port  |
|-----------|---------------------------------------------|-------|
| Backend   | Node.js + Express + TypeScript (`tsx watch`) | 5000  |
| Base de données | SQLite via Prisma ORM (`dev.db`)      | —     |
| Frontend  | React 18 + Vite + TypeScript                | 3000  |
| Mobile    | Expo + React Native 0.72                    | —     |
| Temps réel | Socket.io (WebSocket)                      | 5000  |

> La BDD est **SQLite** en dev (`backend/prisma/dev.db`) — PostgreSQL prévu pour la production. Le README dit PostgreSQL uniquement, c'est inexact pour le dev.

> Contexte géographique : région **Kolwezi/Lubumbashi** (RDC) — la carte Leaflet doit être centrée sur ces coordonnées.

---

## Lancer le projet

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev

# App mobile (optionnel)
cd mobile && npm start
```

Scripts racine disponibles : `npm run dev:backend`, `npm run dev:frontend`, `npm run dev:mobile`.

> **Windows** : Vite lie par défaut sur IPv6 (`[::1]`). Accéder via **http://127.0.0.1:3000** (pas `localhost`). La config `vite.config.ts` inclut déjà `host: '0.0.0.0'` pour forcer l'écoute IPv4.

---

## Structure du projet

```
PROJET SOS GPS/
├── backend/
│   ├── src/
│   │   ├── index.ts                  # Point d'entrée Express + Socket.io
│   │   ├── controllers/
│   │   │   ├── emergency.controller.ts   # Création/MAJ alertes SOS
│   │   │   ├── alert.controller.ts
│   │   │   ├── worker.controller.ts
│   │   │   ├── emergency-contact.controller.ts
│   │   │   └── seed.controller.ts
│   │   ├── routes/
│   │   │   ├── sos.routes.ts         # POST /api/sos, GET /api/sos, PATCH /api/sos/:id/status
│   │   │   ├── alert.routes.ts       # /api/alerts
│   │   │   ├── worker.routes.ts      # /api/workers
│   │   │   ├── emergency-contacts.routes.ts
│   │   │   └── seed.routes.ts
│   │   ├── services/
│   │   │   └── notification.service.ts   # Notifications externes (simulées — TODO SMS/Email réel)
│   │   ├── socket/
│   │   │   └── socket.ts             # Setup Socket.io + rooms monitoring/worker
│   │   └── lib/
│   │       └── prisma.ts             # Instance Prisma singleton
│   ├── prisma/
│   │   ├── schema.prisma             # Modèles : Worker, Alert, EmergencyContact
│   │   ├── seed.ts                   # Données de test
│   │   └── dev.db                    # Fichier SQLite (gitignore recommandé)
│   └── scripts/
│       └── setup-db.ts
├── frontend/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── types.ts
│       ├── pages/
│       │   ├── Dashboard.tsx         # Vue d'ensemble + carte Leaflet
│       │   ├── Alerts.tsx            # Liste/gestion alertes + Socket.io + bouton Résoudre
│       │   ├── Workers.tsx           # Liste travailleurs + formulaire ajout + filtres statut
│       │   ├── EmergencyContacts.tsx # CRUD contacts d'urgence par type
│       │   └── *.css                 # CSS co-localisé par page
│       ├── components/
│       │   ├── Layout.tsx            # Nav : Dashboard / Alertes / Travailleurs / Contacts d'urgence
│       │   └── Footer.tsx
│       └── services/
│           └── api.ts                # Axios client + types + toutes les fonctions API
├── mobile/
│   ├── App.tsx                       # Tracking GPS 30s + boutons SOS par type
│   └── services/
├── shared/                           # Types partagés
└── docs/                             # Documentation supplémentaire
```

---

## Modèles de données (Prisma)

### Worker
```
id, name, employeeId (unique), department, status (ACTIVE|INACTIVE|EMERGENCY)
lastLatitude, lastLongitude, lastLocationUpdate
```

### Alert
```
id, workerId, type (ACCIDENT|MEDICAL|SECURITY|GENERAL)
priority (LOW|MEDIUM|HIGH|CRITICAL), status (ACTIVE|ACKNOWLEDGED|RESOLVED|CANCELLED)
latitude, longitude, message
acknowledgedBy, acknowledgedAt, resolvedAt
externalServicesNotified (JSON string)
```

### EmergencyContact
```
id, name, type (SECURITY|HOSPITAL|POLICE|INTERNAL), phone, email, isActive
```

---

## API REST — Routes principales

| Méthode | Route                          | Description                              |
|---------|--------------------------------|------------------------------------------|
| GET     | /health                        | Santé du serveur                         |
| POST    | /api/sos                       | Créer une alerte d'urgence               |
| GET     | /api/sos                       | Lister les alertes (filtres : type/priority/status) |
| PATCH   | /api/sos/:id/status            | Changer le statut d'une alerte           |
| GET     | /api/workers                   | Lister les travailleurs                  |
| PATCH   | /api/workers/:id/location      | Mettre à jour la position GPS            |
| GET     | /api/alerts                    | Lister toutes les alertes                |
| PATCH   | /api/alerts/:id/acknowledge    | Acquitter une alerte                     |
| GET     | /api/workers/:id               | Détails d'un travailleur                 |
| POST    | /api/workers                   | Créer un travailleur                     |
| PATCH   | /api/workers/:id/status        | Changer le statut d'un travailleur       |
| GET     | /api/alerts/:id                | Détails d'une alerte                     |
| GET     | /api/emergency-contacts        | Lister les contacts d'urgence            |
| POST    | /api/emergency-contacts        | Créer un contact d'urgence               |
| PATCH   | /api/emergency-contacts/:id    | Modifier un contact d'urgence            |
| DELETE  | /api/emergency-contacts/:id    | Supprimer un contact d'urgence           |
| POST    | /api/seed/generate             | Générer des données fictives (dev)       |

---

## Socket.io — Événements

| Événement (émis par serveur) | Déclencheur                              |
|------------------------------|------------------------------------------|
| `emergency-alert`            | Nouvelle alerte SOS créée                |
| `alert-created`              | Idem (doublon pour compatibilité)        |
| `alert-updated`              | Changement de statut d'une alerte        |
| `alert-acknowledged`         | Alerte acquittée                         |
| `worker-location-update`     | Mise à jour GPS d'un travailleur         |
| `worker-status-update`       | Changement de statut travailleur         |
| `sos-alert`                  | Legacy — à garder pour compatibilité mobile |

| Événement (émis par client)  | Effet                                    |
|------------------------------|------------------------------------------|
| `join-monitoring`            | Rejoint la room `monitoring`             |
| `join-worker`                | Rejoint la room `worker-{workerId}`      |

---

## Logique métier clé

### Priorités automatiques des alertes
- `ACCIDENT` → CRITICAL
- `SECURITY` → CRITICAL
- `MEDICAL` → HIGH
- `GENERAL` → MEDIUM

### Notifications externes (actuellement simulées en console)
- `ACCIDENT` → SECURITY + HOSPITAL
- `MEDICAL` → HOSPITAL + SECURITY
- `SECURITY` → SECURITY + POLICE
- `GENERAL` → SECURITY uniquement

### Statut travailleur
- Alerte CRITICAL créée → Worker passe en `EMERGENCY`
- Alerte RESOLVED + plus d'alertes actives → Worker repasse en `ACTIVE`

---

## Variables d'environnement

### Backend (`backend/.env`)
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Commandes Prisma utiles

```bash
cd backend
npm run db:migrate    # Créer/appliquer les migrations
npm run db:generate   # Regénérer le client Prisma
npm run db:seed       # Insérer les données de test
npm run db:studio     # Ouvrir Prisma Studio (UI BDD)
npm run db:setup      # Setup initial complet
```

---

## Ce qui reste à faire

### Fonctionnel (prioritaire)
- **Authentification** : JWT avec login/register + gestion des rôles (Admin, Opérateur) — `bcryptjs` + `jsonwebtoken` déjà installés
- **Notifications réelles** : intégrer Twilio (SMS) et SendGrid/Nodemailer (email) dans `notification.service.ts`
- **Statistiques avancées** : graphiques Recharts (déjà installé dans frontend)

### Moyen terme
- **Mode hors ligne mobile** : mise en cache des positions, synchronisation différée
- **Notifications push** mobile
- **Tests** : unitaires (Vitest), intégration, E2E (Playwright)

### Long terme
- **Déploiement** : Dockerfile + docker-compose, CI/CD, PostgreSQL prod
- **Logging** : Winston/Pino + monitoring Sentry
- **Swagger/OpenAPI** : documentation interactive
- **IA** : prédiction d'incidents
- **i18n** : swahili phase 2 (anglais/français traités en Étape 8 de la refonte)

---

## Refonte design UX/UI — Étapes ordonnées

Objectif : design industriel minier, dark mode, haute lisibilité sous stress, convivialité opérateur.

### ~~Étape 1 — Fondations : thème global dark + palette industrielle~~ ✅
- ~~Remplacer `#f5f5f5` / blanc par fond sombre `#0d1117` / cartes `#161b22`~~
- ~~Nouvelle palette : orange `#f39c12` (primaire), rouge `#ff4444` (critique), vert `#27ae60` (safe)~~
- ~~Variables CSS globales dans `index.css` pour piloter tout le thème~~
- ~~Fichiers : `frontend/src/index.css`, `frontend/src/components/Layout.css`~~
- Fond final retenu : `#12171f` (acier industriel) — tous les CSS de pages réécrits, fix z-index Leaflet inclus

### Étape 2 — Sidebar verticale + barre de statut critique
- Remplacer la navbar horizontale par une sidebar gauche sombre fixe avec icônes + labels
- Badge rouge animé sur "Alertes" quand alertes actives > 0
- Barre de statut permanente en haut : compteur d'alertes actives, travailleurs en ligne, horloge live
- Fichiers : `Layout.tsx`, `Layout.css`

### Étape 3 — Dashboard repensé
- Barre de statut critique (flash rouge si alerte CRITICAL active)
- 4 KPI cards : Alertes actives / Travailleurs en ligne / Urgences / Résolues aujourd'hui
- Map Leaflet redimensionnée (60% largeur) + pins colorés par statut (rouge/vert/gris)
- Flux alertes temps réel en timeline verticale (remplace la liste actuelle)
- Fichiers : `Dashboard.tsx`, `Dashboard.css`

### Étape 4 — Page Alertes : cards à la place du tableau
- Remplacer le tableau HTML par des cards empilées
- Bande colorée gauche (8px) par sévérité/type
- Animation pulse sur alertes CRITICAL actives
- Toast notification (coin bas-droit) à chaque nouvel événement Socket.io
- Fichiers : `Alerts.tsx`, `Alerts.css`

### Étape 5 — Page Travailleurs : vue grille badges
- Remplacer la liste par une grille de cartes style "badge employé"
- Statut coloré bien visible, timestamp dernière position, bouton "Voir sur carte"
- Filtre par département + statut en chips visuels
- Fichiers : `Workers.tsx`, `Workers.css`

### Étape 6 — Mobile : bouton panique + UX gants
- Gros bouton SOS central (appui long 2s pour confirmer — évite les faux déclenchements)
- Indicateurs GPS et batterie permanents en haut
- Boutons spécialisés (Accident / Médical / Sécurité) plus grands, tap zones > 60px
- Retour haptique à la confirmation d'envoi
- Fichiers : `mobile/App.tsx`

### Étape 7 — Micro-interactions et polish final
- Skeleton loaders sur tous les chargements (pas de page blanche)
- Animations de transition entre pages (fade)
- Confirmation visuelle animée sur Résoudre/Accuser réception
- Popup map au clic sur un pin travailleur
- Responsive : vérification tablette (usage terrain)

### Étape 8 — Internationalisation (i18n) : anglais + français
- Interface bilingue **anglais / français** (l'anglais est la langue technique dominante dans les mines en RDC)
- Sélecteur de langue accessible depuis la sidebar (icône globe)
- Toutes les étiquettes UI, messages d'alerte, statuts et libellés traduits
- Librairie : `i18next` + `react-i18next` (frontend), intégration possible côté mobile avec `expo-localization`
- Fichiers de traduction JSON : `frontend/src/i18n/en.json`, `frontend/src/i18n/fr.json`
- Langue par défaut : anglais — changeable à la volée sans rechargement de page
- Les types d'alertes (`ACCIDENT`, `MEDICAL`, `SECURITY`, `GENERAL`) affichés dans la langue choisie
- Swahili prévu en phase ultérieure (usage terrain local Kolwezi/Lubumbashi)
- Fichiers : `frontend/src/i18n/`, `Layout.tsx`, tous les composants de pages

---

## Design / Palette de couleurs

### Palette actuelle (avant refonte)
| Rôle       | Couleur   |
|------------|-----------|
| Primaire   | `#667eea` (violet-bleu) |
| Secondaire | `#764ba2` (violet foncé) |
| Fond       | `#f5f5f5` |
| Texte      | `#333` |

### Palette cible (refonte industrielle dark)
| Rôle            | Couleur   |
|-----------------|-----------|
| Fond principal  | `#0d1117` (noir profond) |
| Fond cartes     | `#161b22` (anthracite) |
| Bordures        | `#30363d` |
| Texte principal | `#e6edf3` |
| Texte secondaire| `#8b949e` |
| Accent primaire | `#f39c12` (orange industriel) |
| Danger/Critique | `#ff4444` |
| Succès/Safe     | `#27ae60` |
| Warning         | `#e67e22` |
| Info            | `#3498db` |

Style : dark industriel, ombres colorées (glow rouge sur critique), bordures fines, typographie claire et hiérarchisée.

---

## Conventions de code

- TypeScript strict dans tous les packages
- Validation des entrées API avec **Zod** (`emergencyAlertSchema` dans `emergency.controller.ts`)
- Prisma comme seul ORM — pas de requêtes SQL brutes
- Événements Socket.io émis depuis les controllers via `getIO()`
- Axios dans le frontend — base URL depuis `VITE_API_URL`
- Mobile : GPS mis à jour toutes les **30 secondes** (`expo-location`)

---

## Notes de configuration

- `backend/tsconfig.json` : `moduleResolution: "node16"` (ancien `"node"` déprécié en TS 5+)
- `mobile/tsconfig.json` : `ignoreDeprecations: "6.0"` pour silencer l'avertissement hérité d'`expo/tsconfig.base`
- `frontend/vite.config.ts` : `host: '0.0.0.0'` — nécessaire sur Windows pour écouter en IPv4 (sinon Vite bind sur `[::1]` uniquement et Chrome refuse la connexion)
