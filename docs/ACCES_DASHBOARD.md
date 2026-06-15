# Guide d'Accès au Dashboard

## Vue d'ensemble

Le Dashboard est l'interface web principale pour le centre de contrôle du système SOS GPS. Il permet de :
- Visualiser les positions GPS des travailleurs en temps réel
- Recevoir et gérer les alertes d'urgence
- Suivre l'historique des incidents
- Accuser réception et résoudre les alertes

## Accès rapide

### URL du Dashboard
```
http://localhost:3000
```

## Prérequis

Avant d'accéder au Dashboard, assurez-vous que :

1. ✅ **Backend API est démarré** (port 5000)
2. ✅ **Base de données PostgreSQL est configurée**
3. ✅ **Les migrations de base de données sont exécutées**
4. ✅ **Les dépendances npm sont installées**

## Installation et démarrage

### 1. Installation des dépendances

```bash
cd frontend
npm install
```

### 2. Démarrage du serveur de développement

```bash
cd frontend
npm run dev
```

Vous devriez voir un message similaire à :
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 3. Accès dans le navigateur

Ouvrez votre navigateur et allez à :
```
http://localhost:3000
```

## Structure du Dashboard

### Page d'accueil (Dashboard)
**URL** : `http://localhost:3000/`

**Fonctionnalités** :
- Carte interactive avec positions des travailleurs
- Alertes actives en temps réel
- Statistiques (nombre de travailleurs, alertes actives)
- Mises à jour automatiques via WebSocket

### Page Alertes
**URL** : `http://localhost:3000/alerts`

**Fonctionnalités** :
- Liste de toutes les alertes
- Filtres par statut (Active, Reçue, Résolue)
- Filtres par type (Accident, Médical, Sécurité, Général)
- Accuser réception des alertes
- Voir les détails de chaque alerte

### Page Travailleurs
**URL** : `http://localhost:3000/workers`

**Fonctionnalités** :
- Liste de tous les travailleurs
- Dernière position GPS enregistrée
- Statut de chaque travailleur
- Alertes actives par travailleur

## Configuration

### Variables d'environnement

Le frontend utilise un proxy pour communiquer avec le backend. La configuration se trouve dans `frontend/vite.config.ts` :

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
}
```

### Changer le port du Dashboard

Si le port 3000 est déjà utilisé, modifiez `frontend/vite.config.ts` :

```typescript
server: {
  port: 3001, // Changez le port ici
  // ...
}
```

Puis accédez au dashboard sur `http://localhost:3001`

## Dépannage

### Le dashboard ne se charge pas

1. **Vérifier que le backend est démarré** :
   ```bash
   curl http://localhost:5000/health
   ```
   Devrait retourner : `{"status":"ok","timestamp":"..."}`

2. **Vérifier les erreurs dans la console du navigateur** :
   - Ouvrez les outils de développement (F12)
   - Regardez l'onglet Console pour les erreurs
   - Regardez l'onglet Network pour les requêtes échouées

3. **Vérifier que le port 3000 est libre** :
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```

### Erreur "Cannot connect to backend"

1. Vérifiez que le backend est démarré sur le port 5000
2. Vérifiez que `FRONTEND_URL` dans le `.env` du backend correspond
3. Vérifiez les règles CORS dans le backend

### La carte ne s'affiche pas

1. Vérifiez votre connexion internet (Leaflet charge les tuiles depuis OpenStreetMap)
2. Vérifiez la console pour les erreurs de chargement des tuiles
3. Assurez-vous que les dépendances `leaflet` et `react-leaflet` sont installées

### Les alertes ne se mettent pas à jour en temps réel

1. Vérifiez que le WebSocket est connecté (regardez la console du navigateur)
2. Vérifiez que le backend émet bien les événements WebSocket
3. Vérifiez la connexion réseau

## Production

Pour déployer le dashboard en production :

```bash
cd frontend
npm run build
```

Les fichiers de production seront dans le dossier `frontend/dist/`

Servez ces fichiers avec un serveur web (nginx, Apache, etc.) ou un service de déploiement (Vercel, Netlify, etc.)

## Support

Pour plus d'informations, consultez :
- `docs/ARCHITECTURE.md` - Architecture du système
- `docs/CONFIGURATION.md` - Configuration avancée
- `docs/EXEMPLES.md` - Exemples d'utilisation



