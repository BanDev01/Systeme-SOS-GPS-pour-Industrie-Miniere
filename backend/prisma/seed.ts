import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed de la base de données...');

  // Créer des travailleurs fictifs
  const workers = await Promise.all([
    prisma.worker.upsert({
      where: { employeeId: 'EMP001' },
      update: {},
      create: {
        name: 'Jean Kabila',
        employeeId: 'EMP001',
        department: 'Exploitation',
        status: 'ACTIVE',
        lastLatitude: -10.7167,
        lastLongitude: 25.4667, // Kolwezi
        lastLocationUpdate: new Date(),
      },
    }),
    prisma.worker.upsert({
      where: { employeeId: 'EMP002' },
      update: {},
      create: {
        name: 'Marie Tshisekedi',
        employeeId: 'EMP002',
        department: 'Sécurité',
        status: 'ACTIVE',
        lastLatitude: -11.6600,
        lastLongitude: 27.4794, // Lubumbashi
        lastLocationUpdate: new Date(),
      },
    }),
    prisma.worker.upsert({
      where: { employeeId: 'EMP003' },
      update: {},
      create: {
        name: 'Pierre Mutombo',
        employeeId: 'EMP003',
        department: 'Maintenance',
        status: 'ACTIVE',
        lastLatitude: -10.8000,
        lastLongitude: 25.5000,
        lastLocationUpdate: new Date(),
      },
    }),
    prisma.worker.upsert({
      where: { employeeId: 'EMP004' },
      update: {},
      create: {
        name: 'Sophie Mwanza',
        employeeId: 'EMP004',
        department: 'Exploitation',
        status: 'ACTIVE',
        lastLatitude: -11.7000,
        lastLongitude: 27.4000,
        lastLocationUpdate: new Date(),
      },
    }),
    prisma.worker.upsert({
      where: { employeeId: 'EMP005' },
      update: {},
      create: {
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

  // Créer des alertes fictives
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

  const alerts = await Promise.all([
    // Alerte active - Accident
    prisma.alert.create({
      data: {
        workerId: workers[0].id,
        type: 'ACCIDENT',
        priority: 'CRITICAL',
        status: 'ACTIVE',
        latitude: -10.7167,
        longitude: 25.4667,
        message: 'Chute d\'un échafaudage. Travailleur blessé à la jambe. Besoin d\'assistance médicale urgente.',
        createdAt: oneHourAgo,
      },
    }),
    // Alerte active - Malaise médical
    prisma.alert.create({
      data: {
        workerId: workers[1].id,
        type: 'MEDICAL',
        priority: 'HIGH',
        status: 'ACTIVE',
        latitude: -11.6600,
        longitude: 27.4794,
        message: 'Malaise soudain. Douleurs thoraciques. Appel médical urgent requis.',
        createdAt: new Date(now.getTime() - 30 * 60 * 1000), // Il y a 30 minutes
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
        acknowledgedAt: threeHoursAgo,
        externalServicesNotified: JSON.stringify(['SECURITY', 'HOSPITAL']),
      },
    }),
    // Alerte active - Générale
    prisma.alert.create({
      data: {
        workerId: workers[4].id,
        type: 'GENERAL',
        priority: 'MEDIUM',
        status: 'ACTIVE',
        latitude: -10.7500,
        longitude: 25.4500,
        message: 'Équipement bloqué. Besoin d\'assistance technique.',
        createdAt: new Date(now.getTime() - 15 * 60 * 1000), // Il y a 15 minutes
      },
    }),
    // Alerte résolue - Malaise médical
    prisma.alert.create({
      data: {
        workerId: workers[0].id,
        type: 'MEDICAL',
        priority: 'HIGH',
        status: 'RESOLVED',
        latitude: -10.7167,
        longitude: 25.4667,
        message: 'Vertiges et nausées. Évacuation médicale effectuée. Travailleur en observation.',
        acknowledgedBy: 'Service Médical',
        acknowledgedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        resolvedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        externalServicesNotified: JSON.stringify(['HOSPITAL', 'SECURITY']),
      },
    }),
  ]);

  console.log(`✅ ${alerts.length} alertes créées`);

  // Créer des contacts d'urgence (vérifier d'abord s'ils existent)
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
  } else {
    console.log(`ℹ️  ${existingContacts.length} contact(s) d'urgence déjà existant(s)`);
  }

  console.log(`✅ ${contacts.length} contacts d'urgence créés`);

  console.log('✨ Seed terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

