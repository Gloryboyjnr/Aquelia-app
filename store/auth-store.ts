import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User, Company, Employee } from '@/types/auth';

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const result = await AsyncStorage.getItem(name);
      return result;
    } catch (error) {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      // Ignore storage errors
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      // Ignore storage errors
    }
  },
};

type AuthStore = AuthState & {
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  removeEmployee: (id: string) => void;
  getEmployeesByRole: (role: string) => Employee[];
  getEmployeesByDepartment: (department: Employee['department']) => Employee[];
  signOut: () => void;
  clearError: () => void;
  reset: () => void;
};

const initialState: AuthState = {
  user: null,
  company: null,
  employees: [
    {
      id: '1',
      fullName: 'John Mensah',
      phoneNumber: '+233241234567',
      email: 'john.mensah@company.com',
      role: 'manager',
      department: 'management',
      isActive: true,
      companyId: 'demo-company',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      fullName: 'Mary Asante',
      phoneNumber: '+233241234568',
      email: 'mary.asante@company.com',
      role: 'operator',
      department: 'production',
      isActive: true,
      companyId: 'demo-company',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      fullName: 'Kwame Osei',
      phoneNumber: '+233241234569',
      role: 'producer',
      department: 'production',
      isActive: true,
      companyId: 'demo-company',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      fullName: 'Akosua Boateng',
      phoneNumber: '+233241234570',
      role: 'Quality Control Officer',
      department: 'quality',
      isActive: true,
      companyId: 'demo-company',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '5',
      fullName: 'Samuel Adjei',
      phoneNumber: '+233241234571',
      email: 'samuel.adjei@company.com',
      role: 'supervisor',
      department: 'sales',
      isActive: true,
      companyId: 'demo-company',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null,
};

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) => {
        set({ user, error: null });
      },

      setCompany: (company) => {
        set({ company, error: null });
      },

      setIsAuthenticated: (isAuthenticated) => {
        set({ isAuthenticated, error: null });
      },

      setIsLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      addEmployee: (employeeData) => {
        const state = get();
        const newEmployee: Employee = {
          ...employeeData,
          id: `emp_${Date.now()}`,
          companyId: state.company?.id || 'demo-company',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          employees: [newEmployee, ...state.employees],
        }));
      },

      updateEmployee: (id, updates) => {
        set((state) => ({
          employees: state.employees.map(employee =>
            employee.id === id
              ? { ...employee, ...updates, updatedAt: new Date().toISOString() }
              : employee
          ),
        }));
      },

      removeEmployee: (id) => {
        set((state) => ({
          employees: state.employees.filter(employee => employee.id !== id),
        }));
      },

      getEmployeesByRole: (role) => {
        const state = get();
        return state.employees.filter(employee => employee.role === role && employee.isActive);
      },

      getEmployeesByDepartment: (department) => {
        const state = get();
        return state.employees.filter(employee => employee.department === department && employee.isActive);
      },

      signOut: () => {
        set({ 
          user: null, 
          company: null, 
          isAuthenticated: false, 
          error: null,
          isLoading: false,
          token: null
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'aquelia-auth-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        user: state.user,
        company: state.company,
        employees: state.employees,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
          state.error = null;
        }
      },
    }
  )
);

export default useAuthStore;