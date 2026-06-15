import { Router } from 'express';
import { createEmergencyAlert, getEmergencyAlerts, updateAlertStatus } from '../controllers/emergency.controller';

const router = Router();

// Créer une alerte d'urgence (tous types)
router.post('/', createEmergencyAlert);

// Obtenir toutes les alertes d'urgence
router.get('/', getEmergencyAlerts);

// Mettre à jour le statut d'une alerte
router.patch('/:id/status', updateAlertStatus);

export { router as sosRoutes };

