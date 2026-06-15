import { Router } from 'express';
import { getAlerts, getAlertById, acknowledgeAlert } from '../controllers/alert.controller';

const router = Router();

// Obtenir toutes les alertes
router.get('/', getAlerts);

// Obtenir une alerte par ID
router.get('/:id', getAlertById);

// Accuser réception d'une alerte
router.patch('/:id/acknowledge', acknowledgeAlert);

export { router as alertRoutes };



