# Backend API - SOS GPS

API REST et WebSocket pour le système SOS GPS.

## Configuration

1. Créer un fichier `.env` à la racine du dossier `backend`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sos_gps_db?schema=public"

# Frontend URL (pour CORS)
FRONTEND_URL=http://localhost:3000

# JWT (si nécessaire pour l'authentification)
JWT_SECRET=your-secret-key-here
```

2. Installer les dépendances:
```bash
npm install
```

3. Configurer la base de données:
```bash
# Générer le client Prisma
npm run db:generate

# Exécuter les migrations
npm run db:migrate
```

4. Démarrer le serveur:
```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:5000`

## Endpoints API

- `GET /health` - Vérification de santé
- `POST /api/sos` - Créer une alerte SOS
- `GET /api/sos` - Obtenir toutes les alertes SOS
- `PATCH /api/sos/:id/status` - Mettre à jour le statut d'une alerte
- `GET /api/workers` - Obtenir tous les travailleurs
- `POST /api/workers` - Créer un travailleur
- `GET /api/workers/:id` - Obtenir un travailleur par ID
- `PATCH /api/workers/:id/location` - Mettre à jour la position GPS
- `PATCH /api/workers/:id/status` - Mettre à jour le statut
- `GET /api/alerts` - Obtenir toutes les alertes
- `GET /api/alerts/:id` - Obtenir une alerte par ID
- `PATCH /api/alerts/:id/acknowledge` - Accuser réception d'une alerte

## WebSocket Events

### Émis par le serveur:
- `sos-alert` - Nouvelle alerte SOS
- `worker-location-update` - Mise à jour de position
- `alert-updated` - Alerte mise à jour
- `alert-acknowledged` - Alerte accusée de réception
- `worker-status-update` - Statut du travailleur mis à jour

### Émis par le client:
- `join-monitoring` - Rejoindre le monitoring
- `join-worker` - Suivre un travailleur spécifique



