import { Router } from 'express';
import { 
  createWorker, 
  getWorkers, 
  getWorkerById, 
  updateWorkerLocation,
  updateWorkerStatus 
} from '../controllers/worker.controller';

const router = Router();

// Créer un nouveau travailleur
router.post('/', createWorker);

// Obtenir tous les travailleurs
router.get('/', getWorkers);

// Obtenir un travailleur par ID
router.get('/:id', getWorkerById);

// Mettre à jour la localisation GPS d'un travailleur
router.patch('/:id/location', updateWorkerLocation);

// Mettre à jour le statut d'un travailleur
router.patch('/:id/status', updateWorkerStatus);

export { router as workerRoutes };



