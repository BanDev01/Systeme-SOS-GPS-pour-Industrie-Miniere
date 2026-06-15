# Exemples d'Utilisation

## Prochaines étapes

Voici les fonctionnalités à implémenter pour compléter le système :

### 1. Intégrer un service SMS (ex. Twilio)

**Objectif** : Activer les notifications SMS automatiques vers les services d'urgence.

**Fichier à modifier** : `backend/src/services/notification.service.ts`

**Étapes** :
1. Installer le SDK Twilio : `npm install twilio`
2. Ajouter les variables d'environnement dans `.env` :
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
3. Implémenter la fonction `sendSMS()` avec l'API Twilio
4. Appeler `sendSMS()` dans `notifyExternalServices()` pour chaque contact

**Exemple d'implémentation** :
```typescript
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendSMS = async (phone: string, message: string): Promise<boolean> => {
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    return true;
  } catch (error) {
    console.error('Erreur SMS:', error);
    return false;
  }
};
```

### 2. Intégrer un service Email (ex. SendGrid)

**Objectif** : Activer les notifications Email automatiques vers les services d'urgence.

**Fichier à modifier** : `backend/src/services/notification.service.ts`

**Étapes** :
1. Installer le SDK SendGrid : `npm install @sendgrid/mail`
2. Ajouter les variables d'environnement dans `.env` :
   ```env
   SENDGRID_API_KEY=your_api_key
   SENDGRID_FROM_EMAIL=noreply@mine.com
   ```
3. Implémenter la fonction `sendEmail()` avec l'API SendGrid
4. Appeler `sendEmail()` dans `notifyExternalServices()` pour chaque contact avec email

**Exemple d'implémentation** :
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendEmail = async (email: string, subject: string, message: string): Promise<boolean> => {
  try {
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: subject,
      text: message,
      html: `<p>${message}</p>`
    });
    return true;
  } catch (error) {
    console.error('Erreur Email:', error);
    return false;
  }
};
```

### 3. Ajouter l'authentification pour sécuriser l'accès

**Objectif** : Protéger les endpoints API et le dashboard avec un système d'authentification.

**Fichiers à créer/modifier** :
- `backend/src/middleware/auth.middleware.ts` - Middleware d'authentification
- `backend/src/routes/auth.routes.ts` - Routes d'authentification (login, register)
- `backend/src/controllers/auth.controller.ts` - Contrôleurs d'authentification
- `frontend/src/contexts/AuthContext.tsx` - Contexte d'authentification React
- `frontend/src/components/ProtectedRoute.tsx` - Composant pour protéger les routes

**Étapes** :
1. Créer un modèle `User` dans Prisma pour les utilisateurs du système
2. Implémenter JWT pour les tokens d'authentification
3. Créer les endpoints de login/register
4. Protéger les routes API avec le middleware d'authentification
5. Ajouter un système de login dans le frontend
6. Protéger les routes du dashboard

**Fonctionnalités à inclure** :
- Login/Logout
- Gestion des rôles (Admin, Opérateur, etc.)
- Tokens JWT avec expiration
- Refresh tokens pour la sécurité

### 4. Configurer les contacts d'urgence via l'API ou une interface d'administration

**Objectif** : Permettre la gestion des contacts d'urgence depuis une interface web plutôt que seulement via l'API.

**Fichiers à créer/modifier** :
- `frontend/src/pages/Admin/EmergencyContacts.tsx` - Page de gestion des contacts
- `frontend/src/components/EmergencyContactForm.tsx` - Formulaire d'ajout/édition
- Ajouter une route `/admin/contacts` dans le frontend

**Fonctionnalités à implémenter** :
- Liste des contacts d'urgence avec filtres
- Formulaire d'ajout de contact
- Formulaire d'édition de contact
- Activation/désactivation de contacts
- Suppression de contacts
- Validation des numéros de téléphone et emails
- Test d'envoi de notification (SMS/Email)

**Interface suggérée** :
- Tableau avec colonnes : Nom, Type, Téléphone, Email, Statut, Actions
- Boutons : Ajouter, Modifier, Activer/Désactiver, Supprimer, Tester
- Modal pour le formulaire d'ajout/édition

---

## Scénarios d'Urgence

### 1. Accident du Travail

**Situation** : Un travailleur se blesse sur un chantier minier.

**Action** :
1. Le travailleur ouvre l'application mobile
2. Appuie sur le bouton "Accident"
3. L'alerte est envoyée avec sa position GPS exacte

**Réaction automatique du système** :
- ✅ Alerte créée avec priorité CRITICAL
- ✅ Service de sécurité interne notifié
- ✅ Hôpital notifié automatiquement
- ✅ Alerte affichée en temps réel sur le dashboard
- ✅ Position GPS visible sur la carte

### 2. Malaise Médical

**Situation** : Un travailleur ressent un malaise.

**Action** :
1. Le travailleur appuie sur "Malaise" dans l'app
2. L'alerte médicale est déclenchée

**Réaction automatique** :
- ✅ Alerte créée avec priorité HIGH
- ✅ Hôpital notifié en priorité
- ✅ Sécurité interne informée
- ✅ Position GPS transmise pour intervention rapide

### 3. Incident de Sécurité

**Situation** : Agression, intrusion ou menace détectée.

**Action** :
1. Le travailleur appuie sur "Sécurité"
2. L'alerte de sécurité est déclenchée

**Réaction automatique** :
- ✅ Alerte créée avec priorité CRITICAL
- ✅ Service de sécurité interne alerté immédiatement
- ✅ Police notifiée automatiquement
- ✅ Position GPS transmise pour intervention

### 4. Alerte Générale

**Situation** : Toute autre situation nécessitant une intervention.

**Action** :
1. Le travailleur appuie sur "Urgence"
2. L'alerte générale est déclenchée

**Réaction automatique** :
- ✅ Alerte créée avec priorité MEDIUM
- ✅ Sécurité interne notifiée
- ✅ Position GPS transmise

## Gestion depuis le Dashboard

### Accuser réception d'une alerte

1. Se connecter au dashboard
2. Aller dans la page "Alertes"
3. Cliquer sur "Accuser réception" pour une alerte active
4. L'alerte passe en statut "ACKNOWLEDGED"

### Résoudre une alerte

1. Dans la page "Alertes"
2. Mettre à jour le statut à "RESOLVED"
3. Le système met automatiquement le statut du travailleur à "ACTIVE" si aucune autre alerte n'est active

### Suivre un travailleur en temps réel

1. Aller dans "Travailleurs"
2. Voir la dernière position GPS enregistrée
3. Sur le dashboard, la position est mise à jour automatiquement toutes les 30 secondes

## Configuration des Contacts d'Urgence

### Ajouter un contact via API

```bash
curl -X POST http://localhost:5000/api/emergency-contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Service de Sécurité",
    "type": "SECURITY",
    "phone": "+243900000000",
    "email": "securite@mine.com"
  }'
```

### Lister les contacts

```bash
curl http://localhost:5000/api/emergency-contacts
```

### Désactiver un contact

```bash
curl -X PATCH http://localhost:5000/api/emergency-contacts/{id} \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

