export interface Vehicle {
  id: number;
  plate_number: string;
  vehicle_type: string;
  is_active: number; // 0 or 1
  created_at: string;
}

export interface AccessLog {
  id: number;
  plate_number: string;
  action: 'ENTRY' | 'EXIT';
  status: 'ALLOWED' | 'DENIED';
  image_path?: string | null;
  timestamp: string;
}

export interface Capacity {
  id: number;
  total_slots: number;
  occupied_slots: number;
}

export type SocketEventAction = 'added' | 'updated' | 'deleted' | 'activated' | 'blocked';

export interface AlertNotification {
  status: 'ALLOWED' | 'DENIED' | 'error' | 'success';
  message: string;
  plate: string;
  timestamp: string;
  action?: 'ENTRY' | 'EXIT';
}
