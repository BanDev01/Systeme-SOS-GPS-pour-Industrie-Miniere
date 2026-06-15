import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { getIO } from '../socket/socket';

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const { status, type } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        worker: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(alerts);
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAlertById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        worker: true
      }
    });

    if (!alert) {
      return res.status(404).json({ error: 'Alerte non trouvée' });
    }

    res.json(alert);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'alerte:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const acknowledgeAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { acknowledgedBy } = req.body;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedBy,
        acknowledgedAt: new Date()
      },
      include: {
        worker: true
      }
    });

    // Notifier via WebSocket
    const io = getIO();
    io.emit('alert-acknowledged', alert);

    res.json(alert);
  } catch (error) {
    console.error('Erreur lors de l\'accusé de réception:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};



