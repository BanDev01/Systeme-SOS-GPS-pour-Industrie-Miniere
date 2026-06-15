# Guide de Configuration Rapide

## Étape 1 : Arrêter le serveur backend

Si le serveur backend est en cours d'exécution, arrêtez-le temporairement (Ctrl+C dans le terminal où il tourne).

## Étape 2 : Créer la base de données et générer les données

```bash
cd backend
npm run db:setup
```

Cette commande va :
- ✅ Créer la base de données SQLite
- ✅ Créer toutes les tables
- ✅ Générer 5 travailleurs fictifs
- ✅ Générer 5 alertes fictives
- ✅ Créer 3 contacts d'urgence

## Étape 3 : Redémarrer le serveur backend

```bash
npm run dev
```

## Étape 4 : Vérifier dans le dashboard

Ouvrez http://localhost:3000 et vous devriez voir :
- 📊 5 travailleurs sur la carte
- 🚨 3 alertes actives dans le panneau
- 📈 Statistiques mises à jour

## Alternative : Utiliser l'API

Si le serveur backend est déjà démarré et la base de données existe :

```bash
curl -X POST http://localhost:5000/api/seed/generate
```

Ou avec PowerShell :
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/seed/generate -Method POST
```



