import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Worker {
  id: string;
  name: string;
  employeeId: string;
  department?: string;
  status: string;
  lastLatitude?: number;
  lastLongitude?: number;
  lastLocationUpdate?: string;
  alerts?: Alert[];
}

export interface Alert {
  id: string;
  workerId: string;
  type: 'ACCIDENT' | 'MEDICAL' | 'SECURITY' | 'GENERAL';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED';
  latitude: number;
  longitude: number;
  message?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  externalServicesNotified?: string | string[];
  createdAt: string;
  updatedAt: string;
  worker?: Worker;
}

export interface EmergencyContact {
  id: string;
  name: string;
  type: 'SECURITY' | 'HOSPITAL' | 'POLICE' | 'INTERNAL';
  phone: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Workers
export const getWorkers = async (): Promise<Worker[]> => {
  const response = await api.get('/workers');
  return response.data;
};

export const getWorkerById = async (id: string): Promise<Worker> => {
  const response = await api.get(`/workers/${id}`);
  return response.data;
};

export const createWorker = async (data: Partial<Worker>): Promise<Worker> => {
  const response = await api.post('/workers', data);
  return response.data;
};

export const updateWorkerLocation = async (
  id: string,
  latitude: number,
  longitude: number
): Promise<Worker> => {
  const response = await api.patch(`/workers/${id}/location`, {
    latitude,
    longitude,
  });
  return response.data;
};

// Alerts
export const getAlerts = async (params?: any): Promise<Alert[]> => {
  const response = await api.get('/alerts', { params });
  return response.data;
};

export const getAlertById = async (id: string): Promise<Alert> => {
  const response = await api.get(`/alerts/${id}`);
  return response.data;
};

export const acknowledgeAlert = async (
  id: string,
  acknowledgedBy: string
): Promise<Alert> => {
  const response = await api.patch(`/alerts/${id}/acknowledge`, {
    acknowledgedBy,
  });
  return response.data;
};

// Emergency Alerts
export const createEmergencyAlert = async (
  workerId: string,
  type: 'ACCIDENT' | 'MEDICAL' | 'SECURITY' | 'GENERAL',
  latitude: number,
  longitude: number,
  message?: string,
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
): Promise<Alert> => {
  const response = await api.post('/sos', {
    workerId,
    type,
    latitude,
    longitude,
    message,
    priority,
  });
  return response.data;
};

// Fonction de compatibilité
export const createSOSAlert = async (
  workerId: string,
  latitude: number,
  longitude: number,
  message?: string
): Promise<Alert> => {
  return createEmergencyAlert(workerId, 'GENERAL', latitude, longitude, message);
};

export const resolveAlert = async (id: string): Promise<Alert> => {
  const response = await api.patch(`/sos/${id}/status`, { status: 'RESOLVED' });
  return response.data;
};

// Emergency Contacts
export const getEmergencyContacts = async (): Promise<EmergencyContact[]> => {
  const response = await api.get('/emergency-contacts');
  return response.data;
};

export const createEmergencyContact = async (
  data: Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>
): Promise<EmergencyContact> => {
  const response = await api.post('/emergency-contacts', data);
  return response.data;
};

export const updateEmergencyContact = async (
  id: string,
  data: Partial<Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<EmergencyContact> => {
  const response = await api.patch(`/emergency-contacts/${id}`, data);
  return response.data;
};

export const deleteEmergencyContact = async (id: string): Promise<void> => {
  await api.delete(`/emergency-contacts/${id}`);
};

export default api;

