import { Router } from 'express';
import {
  createEmergencyContact,
  getEmergencyContacts,
  updateEmergencyContact,
  deleteEmergencyContact
} from '../controllers/emergency-contact.controller';

const router = Router();

// Créer un contact d'urgence
router.post('/', createEmergencyContact);

// Obtenir tous les contacts d'urgence
router.get('/', getEmergencyContacts);

// Mettre à jour un contact d'urgence
router.patch('/:id', updateEmergencyContact);

// Supprimer un contact d'urgence
router.delete('/:id', deleteEmergencyContact);

export { router as emergencyContactsRoutes };



