import { Request, Response } from 'express';
import { z } from 'zod';
import { getIO } from '../socket/socket';
import { prisma } from '../lib/prisma';

const workerSchema = z.object({
  name: z.string(),
  employeeId: z.string(),
  department: z.string().optional(),
});

const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const createWorker = async (req: Request, res: Response) => {
  try {
    const data = workerSchema.parse(req.body);
    
    const worker = await prisma.worker.create({
      data
    });

    res.status(201).json(worker);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erreur lors de la création du travailleur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getWorkers = async (req: Request, res: Response) => {
  try {
    const workers = await prisma.worker.findMany({
      include: {
        alerts: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    res.json(workers);
  } catch (error) {
    console.error('Erreur lors de la récupération des travailleurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getWorkerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: {
        alerts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!worker) {
      return res.status(404).json({ error: 'Travailleur non trouvé' });
    }

    res.json(worker);
  } catch (error) {
    console.error('Erreur lors de la récupération du travailleur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateWorkerLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = locationSchema.parse(req.body);

    // Mettre à jour la position du travailleur
    const worker = await prisma.worker.update({
      where: { id },
      data: {
        lastLatitude: data.latitude,
        lastLongitude: data.longitude,
        lastLocationUpdate: new Date(),
      }
    });

    // Émettre la mise à jour de position via WebSocket
    const io = getIO();
    io.emit('worker-location-update', {
      workerId: id,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date()
    });

    res.json(worker);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erreur lors de la mise à jour de la localisation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateWorkerStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'INACTIVE', 'EMERGENCY'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const worker = await prisma.worker.update({
      where: { id },
      data: { status }
    });

    // Notifier via WebSocket
    const io = getIO();
    io.emit('worker-status-update', worker);

    res.json(worker);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};



