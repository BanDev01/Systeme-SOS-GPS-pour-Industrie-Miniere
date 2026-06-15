import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const contactSchema = z.object({
  name: z.string(),
  type: z.enum(['SECURITY', 'HOSPITAL', 'POLICE', 'INTERNAL']),
  phone: z.string(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

export const createEmergencyContact = async (req: Request, res: Response) => {
  try {
    const data = contactSchema.parse(req.body);
    
    const contact = await prisma.emergencyContact.create({
      data
    });

    res.status(201).json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erreur lors de la création du contact:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getEmergencyContacts = async (req: Request, res: Response) => {
  try {
    const { type, isActive } = req.query;
    
    const where: any = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const contacts = await prisma.emergencyContact.findMany({
      where,
      orderBy: {
        type: 'asc'
      }
    });

    res.json(contacts);
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateEmergencyContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = contactSchema.partial().parse(req.body);

    const contact = await prisma.emergencyContact.update({
      where: { id },
      data
    });

    res.json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Erreur lors de la mise à jour du contact:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteEmergencyContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.emergencyContact.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erreur lors de la suppression du contact:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};



