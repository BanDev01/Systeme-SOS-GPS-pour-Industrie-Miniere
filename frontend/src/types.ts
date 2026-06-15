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
  status: string;
  latitude: number;
  longitude: number;
  message?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  externalServicesNotified?: string[] | string; // Peut être un tableau ou une chaîne JSON
  createdAt: string;
  updatedAt: string;
  worker?: Worker;
}

