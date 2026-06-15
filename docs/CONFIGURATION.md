# Configuration du Système SOS GPS

## Configuration des Contacts d'Urgence

Le système permet de configurer des contacts d'urgence qui seront automatiquement notifiés selon le type d'alerte.

### Types de Contacts

- **SECURITY** : Service de sécurité interne
- **HOSPITAL** : Hôpital ou service médical
- **POLICE** : Service de police
- **INTERNAL** : Autres services internes

### Ajouter un Contact d'Urgence

```bash
POST /api/emergency-contacts
```

Exemple de requête :
```json
{
  "name": "Service de Sécurité",
  "type": "SECURITY",
  "phone": "+243900000000",
  "email": "securite@mine.com",
  "isActive": true
}
```

### Règles de Notification Automatique

Le système notifie automatiquement les services appropriés selon le type d'alerte :

- **ACCIDENT** → Sécurité interne + Hôpital
- **MEDICAL** → Hôpital + Sécurité interne
- **SECURITY** → Sécurité interne + Police
- **GENERAL** → Sécurité interne uniquement

### Priorités des Alertes

Les priorités sont automatiquement définies selon le type :

- **ACCIDENT** → CRITICAL
- **SECURITY** → CRITICAL
- **MEDICAL** → HIGH
- **GENERAL** → MEDIUM

Vous pouvez également spécifier manuellement la priorité lors de la création d'une alerte.

## Intégration avec Services Externes

### SMS (À configurer)

Pour activer les notifications SMS, intégrez un service comme Twilio dans `backend/src/services/notification.service.ts`.

### Email (À configurer)

Pour activer les notifications Email, intégrez un service comme SendGrid ou Nodemailer dans `backend/src/services/notification.service.ts`.

### Appels Téléphoniques (À configurer)

Pour activer les appels automatisés, intégrez un service comme Twilio Voice API.

## Exemple de Configuration Complète

1. **Créer les contacts d'urgence** :

```bash
# Service de sécurité
curl -X POST http://localhost:5000/api/emergency-contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Service de Sécurité",
    "type": "SECURITY",
    "phone": "+243900000001",
    "email": "securite@mine.com"
  }'

# Hôpital
curl -X POST http://localhost:5000/api/emergency-contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hôpital Central",
    "type": "HOSPITAL",
    "phone": "+243900000002",
    "email": "urgence@hopital.com"
  }'

# Police
curl -X POST http://localhost:5000/api/emergency-contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Commissariat",
    "type": "POLICE",
    "phone": "+243900000003"
  }'
```

2. **Tester une alerte** :

Lorsqu'un travailleur déclenche une alerte depuis l'application mobile, les services appropriés sont automatiquement notifiés selon le type d'alerte.



