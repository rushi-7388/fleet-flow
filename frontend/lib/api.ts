import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
};

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'DISPATCHER' | 'VIEWER';
}

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
  type: string;
  region: string;
  maxCapacity: number;
  odometer: number;
  status: string;
  acquisitionCost?: number | null;
}

export interface Driver {
  id: string;
  name: string;
  licenseType: string;
  licenseExpiry: string;
  safetyScore: number;
  status: string;
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number;
  origin: string;
  destination: string;
  startOdometer?: number | null;
  endOdometer?: number | null;
  revenue?: number | null;
  status: string;
  vehicle?: { id: string; name: string; licensePlate: string };
  driver?: { id: string; name: string };
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceType?: string;
  description: string;
  cost: number;
  date: string;
  nextServiceDue?: string | null;
  status?: string;
  vehicle?: { name: string; licensePlate: string };
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
  vehicle?: { name: string; licensePlate: string };
}

export interface Expense {
  id: string;
  vehicleId: string;
  tripId?: string | null;
  expenseType: string;
  amount: number;
  date: string;
  description?: string | null;
  vehicle?: { id: string; name: string; licensePlate: string };
  trip?: { id: string; origin: string; destination: string } | null;
}

// Analytics
export interface DashboardKpis {
  activeFleet: number;
  maintenanceAlerts: number;
  utilizationRate: number;
  pendingCargo: number;
}

export interface MonthlySummary {
  month: string;
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  tripsCount: number;
  totalCargo: number;
}

export interface DashboardFleetRow {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  type: string;
  region: string;
  status: string;
  driverName: string | null;
  location: string | null;
  load: number | null;
}
