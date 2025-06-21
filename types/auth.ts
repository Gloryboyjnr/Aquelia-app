export interface User {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  role: string;
  profileImage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  productName?: string;
  companyId?: string;
  region?: string;
  city?: string;
  gpsAddress?: string;
  phoneNumbers?: string[];
  active: boolean;
  ownerId: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  logo?: string;
  industry?: string;
  subscriptionPlan: 'basic' | 'pro'; // Required field
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  role: string;
  department: 'production' | 'sales' | 'quality' | 'inventory' | 'management';
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  employees: Employee[];
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}