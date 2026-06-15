import { Router } from 'express';
import { generateFakeData } from '../controllers/seed.controller';

const router = Router();

// Générer des données fictives (pour le développement uniquement)
router.post('/generate', generateFakeData);

export { router as seedRoutes };



