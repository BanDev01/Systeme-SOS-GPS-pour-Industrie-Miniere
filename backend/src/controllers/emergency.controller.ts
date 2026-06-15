import { Request, Response } from 'express';
import { z } from 'zod';
import { getIO } from '../socket/socket';
import { prisma } from '../lib/prisma';
import { notifyExternalServices } from '../services/notification.service';

const emergencyAlertSchema = z.object({
  workerId: z.string(),
  type: z.enum(['ACCIDENT', 'MEDICAL', 'SECURITY', 'GENERAL']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  latitude: z.number(),
  longitude: z.number(),
  message: z.string().optional(),
});

// Déterminer la priorité selon le type d'alerte
const getDefaultPriority = (type: string): string => {
  switch (type) {
    case 'ACCIDENT':
    case 'SECURITY':
      return 'CRITICAL';
    case 'MEDICAL':
      return 'HIGH';
    default:
      return 'MEDIUM';
  }
};

export const createEmergencyAlert = async (req: Request, res: Response) => {
  try {
    const data = emergencyAlertSchema.parse(req.body);
    
    // Vérifier que le travailleur existe
    const worker = await prisma.worker.findUnique({
      where: { id: data.workerId }
    });

    if (!worker) {
      return res.status(404).json({ error: 'Travailleur non trouvé' });
    }

    // Déterminer la priorité si non fournie
    const priority = data.priority || getDefaultPriority(data.type);

    // Messages par défaut selon le type
    const defaultMessages: Record<string, string> = {
      ACCIDENT: 'Accident du travail signalé',
      MEDICAL: 'Malaise médical signalé',
      SECURITY: 'Incident de sécurité signalé',
      GENERAL: 'Alerte d\'urgence déclenchée',
    };

    // Créer l'alerte
    const alert = await prisma.alert.create({
      data: {
        workerId: data.workerId,
        type: data.type,
        priority,
        latitude: data.latitude,
        longitude: data.longitude,
        message: data.message || defaultMessages[data.type],
        status: 'ACTIVE',
        externalServicesNotified: JSON.stringify([]),
      },
      include: {
        worker: true
      }
    });

    // Notifier les services externes selon le type d'alerte
    const notifiedServices = await notifyExternalServices(alert);
    
    // Mettre à jour l'alerte avec les services notifiés (convertir en JSON)
    const updatedAlert = await prisma.alert.update({
      where: { id: alert.id },
      data: {
        externalServicesNotified: JSON.stringify(notifiedServices),
      },
      include: {
        worker: true
      }
    });

    // Émettre l'alerte via WebSocket
    const io = getIO();
    io.emit('emergency-alert', updatedAlert);
    io.emit('alert-created', updatedAlert);

    // Mettre à jour le statut du travailleur en EMERGENCY si critique
    if (priority === 'CRITICAL') {
      await prisma.worker.update({
        where: { id: data.workerId },
        data: { status: 'EMERGENCY' }
      });
    }

    res.status(201).json(updatedAlert);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erreur lors de la création de l\'alerte d\'urgence:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getEmergencyAlerts = async (req: Request, res: Response) => {
  try {
    const { type, priority, status } = req.query;
    
    const where: any = {};
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (status) where.status = status;

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        worker: true
      },
      orderBy: [
        { priority: 'desc' }, // CRITICAL en premier
        { createdAt: 'desc' }
      ]
    });

    res.json(alerts);
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateAlertStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolvedBy } = req.body;

    const validStatuses = ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const updateData: any = { status };
    
    if (status === 'ACKNOWLEDGED' && !req.body.acknowledgedBy) {
      updateData.acknowledgedBy = resolvedBy || 'Système';
      updateData.acknowledgedAt = new Date();
    }
    
    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: updateData,
      include: {
        worker: true
      }
    });

    // Si l'alerte est résolue, remettre le statut du travailleur à ACTIVE si pas d'autres alertes actives
    if (status === 'RESOLVED') {
      const activeAlerts = await prisma.alert.count({
        where: {
          workerId: alert.workerId,
          status: 'ACTIVE'
        }
      });

      if (activeAlerts === 0) {
        await prisma.worker.update({
          where: { id: alert.workerId },
          data: { status: 'ACTIVE' }
        });
      }
    }

    // Notifier via WebSocket
    const io = getIO();
    io.emit('alert-updated', alert);

    res.json(alert);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

