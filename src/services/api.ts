import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials).then((res) => res.data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const vehicleService = {
  getVehicles: () => api.get('/vehicles').then((res) => res.data),
  registerVehicle: (plate_number: string, vehicle_type: string) => 
    api.post('/vehicles', { plate_number, vehicle_type }).then((res) => res.data),
  deleteVehicle: (id: number) => api.delete(`/vehicles/${id}`).then((res) => res.data),
  toggleVehicle: (id: number) => api.post(`/vehicles/${id}/toggle`).then((res) => res.data),
};

export const logService = {
  getLogs: () => api.get('/logs').then((res) => res.data),
  getStats: () => api.get('/logs/stats').then((res) => res.data),
};

export const capacityService = {
  getCapacity: () => api.get('/capacity').then((res) => res.data),
  updateCapacity: (total_slots: number, occupied_slots: number) => 
    api.put('/capacity', { total_slots, occupied_slots }).then((res) => res.data),
};

export const gateService = {
  openGate: () => api.post('/gate/open').then((res) => res.data),
  closeGate: () => api.post('/gate/close').then((res) => res.data),
};

export const hardwareService = {
  testComponent: (component: string) => api.post('/hardware/test', { component }).then((res) => res.data),
  getStatus: () => api.get('/hardware/status').then((res) => res.data),
};
