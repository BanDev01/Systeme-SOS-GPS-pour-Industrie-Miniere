import { prisma } from '../lib/prisma';
import { Alert } from '@prisma/client';

/**
 * Notifie les services externes appropriés selon le type d'alerte
 */
export const notifyExternalServices = async (alert: Alert & { worker?: any }): Promise<string[]> => {
  const notifiedServices: string[] = [];

  try {
    // Récupérer les contacts d'urgence actifs
    const contacts = await prisma.emergencyContact.findMany({
      where: { isActive: true }
    });

    // Déterminer quels services notifier selon le type d'alerte
    const servicesToNotify: string[] = [];

    switch (alert.type) {
      case 'ACCIDENT':
        // Pour un accident : sécurité interne + hôpital
        servicesToNotify.push('SECURITY', 'HOSPITAL');
        break;
      
      case 'MEDICAL':
        // Pour un malaise médical : hôpital + sécurité interne
        servicesToNotify.push('HOSPITAL', 'SECURITY');
        break;
      
      case 'SECURITY':
        // Pour un incident de sécurité : sécurité interne + police
        servicesToNotify.push('SECURITY', 'POLICE');
        break;
      
      case 'GENERAL':
        // Alerte générale : sécurité interne uniquement
        servicesToNotify.push('SECURITY');
        break;
    }

    // Filtrer les contacts selon les services à notifier
    const relevantContacts = contacts.filter(contact =>
      servicesToNotify.includes(contact.type)
    );

    // Simuler l'envoi de notifications
    // Dans un environnement de production, vous utiliseriez :
    // - SMS API (Twilio, etc.)
    // - Email API (SendGrid, etc.)
    // - Push notifications
    // - Appels téléphoniques automatisés

    for (const contact of relevantContacts) {
      console.log(`📞 Notification envoyée à ${contact.name} (${contact.type})`);
      console.log(`   Téléphone: ${contact.phone}`);
      if (contact.email) {
        console.log(`   Email: ${contact.email}`);
      }
      console.log(`   Alerte: ${alert.type} - ${alert.message}`);
      console.log(`   Position: ${alert.latitude}, ${alert.longitude}`);
      console.log(`   Travailleur: ${alert.worker?.name || 'N/A'}`);
      
      notifiedServices.push(contact.type);
    }

    // Log de la notification
    console.log(`✅ ${notifiedServices.length} service(s) externe(s) notifié(s) pour l'alerte ${alert.id}`);

  } catch (error) {
    console.error('Erreur lors de la notification des services externes:', error);
  }

  return notifiedServices;
};

/**
 * Envoyer une notification SMS (à implémenter avec un service SMS)
 */
export const sendSMS = async (phone: string, message: string): Promise<boolean> => {
  // TODO: Intégrer avec un service SMS (Twilio, etc.)
  console.log(`📱 SMS à ${phone}: ${message}`);
  return true;
};

/**
 * Envoyer une notification Email (à implémenter avec un service Email)
 */
export const sendEmail = async (email: string, subject: string, message: string): Promise<boolean> => {
  // TODO: Intégrer avec un service Email (SendGrid, Nodemailer, etc.)
  console.log(`📧 Email à ${email}: ${subject} - ${message}`);
  return true;
};



