import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  QualityState, 
  EquipmentCleaningRecord, 
  QAParametersRecord, 
  InProcessCheckRecord, 
  AttendanceRecord
} from '@/types/quality';

const useQualityStore = create<QualityState & {
  addEquipmentCleaningRecord: (record: Omit<EquipmentCleaningRecord, 'id'>) => void;
  addQAParametersRecord: (record: Omit<QAParametersRecord, 'id'>) => void;
  addInProcessCheckRecord: (record: Omit<InProcessCheckRecord, 'id'>) => void;
  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
  updateAttendanceTimeOut: (id: string, timeOut: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  getRecordsByDate: (type: 'equipment' | 'qa' | 'inprocess' | 'attendance', date: string) => any[];
}>()(
  persist(
    (set, get) => ({
      equipmentCleaning: [],
      qaParameters: [],
      inProcessChecks: [],
      attendance: [],
      isLoading: false,
      error: null,

      addEquipmentCleaningRecord: (record: Omit<EquipmentCleaningRecord, 'id'>) => {
        const newRecord: EquipmentCleaningRecord = {
          id: Date.now().toString(),
          ...record,
        };

        set((state: QualityState) => ({
          equipmentCleaning: [newRecord, ...state.equipmentCleaning],
        }));
      },

      addQAParametersRecord: (record: Omit<QAParametersRecord, 'id'>) => {
        const newRecord: QAParametersRecord = {
          id: Date.now().toString(),
          ...record,
        };

        set((state: QualityState) => ({
          qaParameters: [newRecord, ...state.qaParameters],
        }));
      },

      addInProcessCheckRecord: (record: Omit<InProcessCheckRecord, 'id'>) => {
        const newRecord: InProcessCheckRecord = {
          id: Date.now().toString(),
          ...record,
        };

        set((state: QualityState) => ({
          inProcessChecks: [newRecord, ...state.inProcessChecks],
        }));
      },

      addAttendanceRecord: (record: Omit<AttendanceRecord, 'id'>) => {
        const newRecord: AttendanceRecord = {
          id: Date.now().toString(),
          ...record,
        };

        set((state: QualityState) => ({
          attendance: [newRecord, ...state.attendance],
        }));
      },

      updateAttendanceTimeOut: (id: string, timeOut: string) => {
        set((state: QualityState) => ({
          attendance: state.attendance.map(record =>
            record.id === id ? { ...record, timeOut } : record
          ),
        }));
      },

      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),

      getRecordsByDate: (type: 'equipment' | 'qa' | 'inprocess' | 'attendance', date: string) => {
        const state = get();
        const targetDate = new Date(date).toDateString();
        
        switch (type) {
          case 'equipment':
            return state.equipmentCleaning.filter(record => 
              new Date(record.date).toDateString() === targetDate
            );
          case 'qa':
            return state.qaParameters.filter(record => 
              new Date(record.date).toDateString() === targetDate
            );
          case 'inprocess':
            return state.inProcessChecks.filter(record => 
              new Date(record.date).toDateString() === targetDate
            );
          case 'attendance':
            return state.attendance.filter(record => 
              new Date(record.date).toDateString() === targetDate
            );
          default:
            return [];
        }
      },
    }),
    {
      name: 'aquelia-quality-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useQualityStore;