import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function setup() {
  console.log('🔧 Configuration de la base de données...');
  
  console.log('📦 Création de la base de données...');
  
  // Créer les tables avec Prisma migrate deploy ou db push
  try {
    // Utiliser db push pour créer les tables sans migration formelle
    const { execSync } = require('child_process');
    console.log('🔨 Création des tables...');
    execSync('npx prisma db push --skip-generate --accept-data-loss', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log('✅ Tables créées avec succès');
  } catch (error: any) {
    // Si db push échoue, essayer de créer les tables manuellement
    console.log('⚠️  db push a échoué, tentative de création manuelle...');
    try {
      await prisma.$connect();
      // Créer les tables avec des requêtes SQL directes
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Worker" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "employeeId" TEXT NOT NULL UNIQUE,
          "department" TEXT,
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "lastLatitude" REAL,
          "lastLongitude" REAL,
          "lastLocationUpdate" DATETIME,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Alert" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "workerId" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "priority" TEXT NOT NULL DEFAULT 'HIGH',
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "latitude" REAL NOT NULL,
          "longitude" REAL NOT NULL,
          "message" TEXT,
          "acknowledgedBy" TEXT,
          "acknowledgedAt" DATETIME,
          "resolvedAt" DATETIME,
          "externalServicesNotified" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL,
          FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "EmergencyContact" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "phone" TEXT NOT NULL,
          "email" TEXT,
          "isActive" INTEGER NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
        );
      `);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Alert_workerId_idx" ON "Alert"("workerId");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Alert_status_idx" ON "Alert"("status");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Alert_type_idx" ON "Alert"("type");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Alert_priority_idx" ON "Alert"("priority");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Alert_createdAt_idx" ON "Alert"("createdAt");`);
      console.log('✅ Tables créées manuellement');
    } catch (manualError) {
      console.error('❌ Erreur lors de la création manuelle:', manualError);
      throw manualError;
    }
  }
  console.log('🌱 Génération des données fictives...');

  // Créer des travailleurs
  const workers = await Promise.all([
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

  console.log(`✅ ${workers.length} travailleurs créés`);

  // Créer des alertes
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

  const alerts = await Promise.all([
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

  console.log(`✅ ${alerts.length} alertes créées`);

  // Créer des contacts d'urgence
  const existingContacts = await prisma.emergencyContact.findMany();
  if (existingContacts.length === 0) {
    const contacts = await Promise.all([
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
    console.log(`✅ ${contacts.length} contacts d'urgence créés`);
  }

  console.log('✨ Configuration terminée avec succès!');
}

setup()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

