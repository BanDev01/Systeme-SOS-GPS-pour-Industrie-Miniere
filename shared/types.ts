export interface Worker {
  id: string;
  name: string;
  employeeId: string;
  department?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EMERGENCY';
  lastLatitude?: number;
  lastLongitude?: number;
  lastLocationUpdate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  workerId: string;
  type: 'SOS' | 'MEDICAL' | 'ACCIDENT' | 'OTHER';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'CANCELLED';
  latitude: number;
  longitude: number;
  message?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}



