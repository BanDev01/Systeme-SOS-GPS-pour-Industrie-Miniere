# Génération de Données Fictives

Ce guide explique comment générer des données fictives (travailleurs et alertes) pour tester le système SOS GPS.

## Méthode 1 : Via l'API (Recommandé)

### Générer des données fictives via API

```bash
curl -X POST http://localhost:5000/api/seed/generate
```

Cette commande va :
- Créer 5 travailleurs fictifs si aucun n'existe
- Créer 5 alertes fictives de différents types et statuts
- Créer 3 contacts d'urgence si aucun n'existe

**Réponse attendue :**
```json
{
  "message": "Données fictives générées avec succès",
  "workers": 5,
  "alerts": 5,
  "summary": {
    "activeAlerts": 3,
    "acknowledgedAlerts": 1,
    "resolvedAlerts": 1
  }
}
```

## Méthode 2 : Via le script Prisma Seed

### Exécuter le script de seed

```bash
cd backend
npm run db:seed
```

Ce script va créer :
- 5 travailleurs avec positions GPS dans la région Kolwezi/Lubumbashi
- 6 alertes fictives (actives, reçues, résolues)
- 3 contacts d'urgence

## Données générées

### Travailleurs

1. **Jean Kabila** (EMP001) - Exploitation
   - Position : Kolwezi (-10.7167, 25.4667)

2. **Marie Tshisekedi** (EMP002) - Sécurité
   - Position : Lubumbashi (-11.6600, 27.4794)

3. **Pierre Mutombo** (EMP003) - Maintenance
   - Position : Près de Kolwezi (-10.8000, 25.5000)

4. **Sophie Mwanza** (EMP004) - Exploitation
   - Position : Près de Lubumbashi (-11.7000, 27.4000)

5. **David Kasaï** (EMP005) - Transport
   - Position : Près de Kolwezi (-10.7500, 25.4500)

### Alertes fictives

#### Alertes actives

1. **Accident** (CRITICAL) - Jean Kabila
   - Message : "Chute d'un échafaudage. Travailleur blessé à la jambe."
   - Services notifiés : Sécurité, Hôpital
   - Créée il y a 1 heure

2. **Malaise médical** (HIGH) - Marie Tshisekedi
   - Message : "Malaise soudain. Douleurs thoraciques."
   - Services notifiés : Hôpital, Sécurité
   - Créée il y a 30 minutes

3. **Alerte générale** (MEDIUM) - David Kasaï
   - Message : "Équipement bloqué. Besoin d'assistance technique."
   - Services notifiés : Sécurité
   - Créée il y a 15 minutes

#### Alertes reçues

4. **Accident** (CRITICAL) - Sophie Mwanza
   - Message : "Collision entre deux véhicules de chantier."
   - Statut : ACKNOWLEDGED
   - Reçue il y a 2 heures

#### Alertes résolues

5. **Incident de sécurité** (CRITICAL) - Pierre Mutombo
   - Message : "Intrusion détectée sur le site. Situation maîtrisée."
   - Statut : RESOLVED
   - Résolue il y a 1 heure

### Contacts d'urgence

1. **Service de Sécurité Interne**
   - Type : SECURITY
   - Téléphone : +243900000001
   - Email : securite@mine.com

2. **Hôpital Général de Kolwezi**
   - Type : HOSPITAL
   - Téléphone : +243900000002
   - Email : urgence@hopital-kolwezi.com

3. **Commissariat de Police**
   - Type : POLICE
   - Téléphone : +243900000003
   - Email : police@kolwezi.gov.cd

## Vérification

Après avoir généré les données, vous pouvez :

1. **Voir les travailleurs** :
   ```bash
   curl http://localhost:5000/api/workers
   ```

2. **Voir les alertes** :
   ```bash
   curl http://localhost:5000/api/alerts
   ```

3. **Voir les alertes actives uniquement** :
   ```bash
   curl "http://localhost:5000/api/alerts?status=ACTIVE"
   ```

4. **Accéder au dashboard** :
   - Ouvrez http://localhost:3000
   - Vous devriez voir les travailleurs et alertes sur la carte

## Notes importantes

- ⚠️ Le endpoint `/api/seed/generate` est **désactivé en production** pour des raisons de sécurité
- Les données sont générées avec des positions GPS dans la région Kolwezi/Lubumbashi
- Les alertes ont des timestamps variés pour simuler un historique réaliste
- Vous pouvez exécuter le script plusieurs fois sans créer de doublons (grâce aux upsert)



