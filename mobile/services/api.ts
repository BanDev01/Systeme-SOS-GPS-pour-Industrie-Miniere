import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // À configurer selon votre environnement

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface EmergencyAlertData {
  workerId: string;
  type: 'ACCIDENT' | 'MEDICAL' | 'SECURITY' | 'GENERAL';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude: number;
  longitude: number;
  message?: string;
}

export const createEmergencyAlert = async (
  workerId: string,
  type: 'ACCIDENT' | 'MEDICAL' | 'SECURITY' | 'GENERAL',
  latitude: number,
  longitude: number,
  message?: string
): Promise<any> => {
  try {
    const response = await api.post('/sos', {
      workerId,
      type,
      latitude,
      longitude,
      message,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'alerte:', error);
    throw error;
  }
};

// Fonction de compatibilité pour l'ancien code
export const createSOSAlert = async (
  workerId: string,
  latitude: number,
  longitude: number,
  message?: string
): Promise<any> => {
  return createEmergencyAlert(workerId, 'GENERAL', latitude, longitude, message);
};

export const updateWorkerLocation = async (
  workerId: string,
  latitude: number,
  longitude: number
): Promise<any> => {
  try {
    const response = await api.patch(`/workers/${workerId}/location`, {
      latitude,
      longitude,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la position:', error);
    throw error;
  }
};

export default api;

