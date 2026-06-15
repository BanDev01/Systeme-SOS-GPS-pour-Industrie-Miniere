import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const generateFakeData = async (req: Request, res: Response) => {
  try {
    // Vérifier si on est en mode développement
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Cette fonctionnalité n\'est pas disponible en production' });
    }

    console.log('🌱 Génération de données fictives...');

    // Récupérer ou créer des travailleurs
    let workers = await prisma.worker.findMany();
    
    if (workers.length === 0) {
      // Créer des travailleurs si aucun n'existe
      workers = await Promise.all([
        prisma.worker.create({
          data: {
            name: 'Jean Kabila',
            employeeId: 'EMP001',
            department: 'Exploitation',
            status: 'ACTIVE',
            lastLatitude: -10.7167,
            lastLongitude: 25.4667,
            lastLocationUpdate: new Date(),
          },
        }),
        prisma.worker.create({
          data: {
            name: 'Marie Tshisekedi',
            employeeId: 'EMP002',
            department: 'Sécurité',
            status: 'ACTIVE',
            lastLatitude: -11.6600,
            lastLongitude: 27.4794,
            lastLocationUpdate: new Date(),
          },
        }),
        prisma.worker.create({
          data: {
            name: 'Pierre Mutombo',
            employeeId: 'EMP003',
            department: 'Maintenance',
            status: 'ACTIVE',
            lastLatitude: -10.8000,
            lastLongitude: 25.5000,
            lastLocationUpdate: new Date(),
          },
        }),
        prisma.worker.create({
          data: {
            name: 'Sophie Mwanza',
            employeeId: 'EMP004',
            department: 'Exploitation',
            status: 'ACTIVE',
            lastLatitude: -11.7000,
            lastLongitude: 27.4000,
            lastLocationUpdate: new Date(),
          },
        }),
        prisma.worker.create({
          data: {
            name: 'David Kasaï',
            employeeId: 'EMP005',
            department: 'Transport',
            status: 'ACTIVE',
            lastLatitude: -10.7500,
            lastLongitude: 25.4500,
            lastLocationUpdate: new Date(),
          },
        }),
      ]);
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Créer des alertes fictives variées
    const alerts = await Promise.all([
      // Alerte active - Accident (CRITICAL)
      prisma.alert.create({
        data: {
          workerId: workers[0].id,
          type: 'ACCIDENT',
          priority: 'CRITICAL',
          status: 'ACTIVE',
          latitude: -10.7167,
          longitude: 25.4667,
          message: 'Chute d\'un échafaudage. Travailleur blessé à la jambe. Besoin d\'assistance médicale urgente.',
          externalServicesNotified: JSON.stringify(['SECURITY', 'HOSPITAL']),
          createdAt: oneHourAgo,
        },
      }),
      // Alerte active - Malaise médical (HIGH)
      prisma.alert.create({
        data: {
          workerId: workers[1].id,
          type: 'MEDICAL',
          priority: 'HIGH',
          status: 'ACTIVE',
          latitude: -11.6600,
          longitude: 27.4794,
          message: 'Malaise soudain. Douleurs thoraciques. Appel médical urgent requis.',
          externalServicesNotified: JSON.stringify(['HOSPITAL', 'SECURITY']),
          createdAt: thirtyMinutesAgo,
        },
      }),
      // Alerte active - Générale (MEDIUM)
      prisma.alert.create({
        data: {
          workerId: workers[4].id,
          type: 'GENERAL',
          priority: 'MEDIUM',
          status: 'ACTIVE',
          latitude: -10.7500,
          longitude: 25.4500,
          message: 'Équipement bloqué. Besoin d\'assistance technique.',
          externalServicesNotified: JSON.stringify(['SECURITY']),
          createdAt: fifteenMinutesAgo,
        },
      }),
      // Alerte résolue - Incident de sécurité
      prisma.alert.create({
        data: {
          workerId: workers[2].id,
          type: 'SECURITY',
          priority: 'CRITICAL',
          status: 'RESOLVED',
          latitude: -10.8000,
          longitude: 25.5000,
          message: 'Intrusion détectée sur le site. Sécurité et police alertées. Situation maîtrisée.',
          acknowledgedBy: 'Service de Sécurité',
          acknowledgedAt: twoHoursAgo,
          resolvedAt: oneHourAgo,
          externalServicesNotified: JSON.stringify(['SECURITY', 'POLICE']),
        },
      }),
      // Alerte reçue - Accident
      prisma.alert.create({
        data: {
          workerId: workers[3].id,
          type: 'ACCIDENT',
          priority: 'CRITICAL',
          status: 'ACKNOWLEDGED',
          latitude: -11.7000,
          longitude: 27.4000,
          message: 'Collision entre deux véhicules de chantier. Secours en route.',
          acknowledgedBy: 'Centre de Contrôle',
          acknowledgedAt: twoHoursAgo,
          externalServicesNotified: JSON.stringify(['SECURITY', 'HOSPITAL']),
        },
      }),
    ]);

    // Créer des contacts d'urgence s'ils n'existent pas
    const existingContacts = await prisma.emergencyContact.count();
    if (existingContacts === 0) {
      await Promise.all([
        prisma.emergencyContact.create({
          data: {
            name: 'Service de Sécurité Interne',
            type: 'SECURITY',
            phone: '+243900000001',
            email: 'securite@mine.com',
            isActive: true,
          },
        }),
        prisma.emergencyContact.create({
          data: {
            name: 'Hôpital Général de Kolwezi',
            type: 'HOSPITAL',
            phone: '+243900000002',
            email: 'urgence@hopital-kolwezi.com',
            isActive: true,
          },
        }),
        prisma.emergencyContact.create({
          data: {
            name: 'Commissariat de Police',
            type: 'POLICE',
            phone: '+243900000003',
            email: 'police@kolwezi.gov.cd',
            isActive: true,
          },
        }),
      ]);
    }

    res.json({
      message: 'Données fictives générées avec succès',
      workers: workers.length,
      alerts: alerts.length,
      summary: {
        activeAlerts: alerts.filter(a => a.status === 'ACTIVE').length,
        acknowledgedAlerts: alerts.filter(a => a.status === 'ACKNOWLEDGED').length,
        resolvedAlerts: alerts.filter(a => a.status === 'RESOLVED').length,
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération des données fictives:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

