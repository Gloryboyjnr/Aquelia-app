import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ProductionState, 
  ProductionRecord, 
  BagStockRecord, 
  BagStockSummary, 
  ManualBagEntry
} from '@/types/inventory';

interface ProductionSummary {
  bags: number;
  bundles: number;
  rawMaterialUsed: number;
}

const useProductionStore = create<ProductionState & {
  addProductionRecord: (record: Omit<ProductionRecord, 'id' | 'date'>) => void;
  addBagsToStock: (quantity: number, source: string, notes?: string) => void;
  addManualBags: (quantity: number, source: string, notes?: string, enteredBy?: string) => void;
  removeBagsFromStock: (quantity: number, reason: string) => void;
  getTodayProduction: () => ProductionSummary;
  getBagsInStock: () => BagStockSummary;
  getTodayManualEntries: () => ManualBagEntry[];
  getManualBagsHistory: (days: number) => ManualBagEntry[];
  getTodayRollsUsed: () => number;
  resetTodayProduction: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}>()(
  persist(
    (set, get) => ({
      productionRecords: [],
      bagStockRecords: [],
      manualBagEntries: [],
      isLoading: false,
      error: null,

      addProductionRecord: (record: Omit<ProductionRecord, 'id' | 'date'>) => {
        const newRecord: ProductionRecord = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          ...record,
        };

        set((state: ProductionState) => ({
          productionRecords: [newRecord, ...state.productionRecords],
        }));

        // Add the produced bags to stock
        get().addBagsToStock(record.bagsProduced, 'production');
      },

      addBagsToStock: (quantity: number, source: string, notes?: string) => {
        if (quantity <= 0) {
          throw new Error('Quantity must be greater than 0');
        }

        const newRecord: BagStockRecord = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          quantity,
          type: 'addition',
          source,
          balance: 0, // Will be calculated below
        };

        set((state: ProductionState) => {
          const currentBalance = state.bagStockRecords.length > 0
            ? state.bagStockRecords[0].balance
            : 0;

          newRecord.balance = currentBalance + quantity;

          return {
            bagStockRecords: [newRecord, ...state.bagStockRecords],
          };
        });
      },

      addManualBags: (quantity: number, source: string, notes?: string, enteredBy?: string) => {
        if (quantity <= 0) {
          throw new Error('Quantity must be greater than 0');
        }

        // Add to bag stock
        get().addBagsToStock(quantity, source, notes);

        // Create manual entry record
        const manualEntry: ManualBagEntry = {
          id: Date.now().toString(),
          quantity,
          source,
          notes,
          enteredBy,
          date: new Date().toISOString(),
        };

        set((state: ProductionState) => ({
          manualBagEntries: [manualEntry, ...state.manualBagEntries],
        }));
      },

      removeBagsFromStock: (quantity: number, reason: string) => {
        if (quantity <= 0) {
          throw new Error('Quantity must be greater than 0');
        }

        const state = get();
        const currentBalance = state.bagStockRecords.length > 0
          ? state.bagStockRecords[0].balance
          : 0;

        if (quantity > currentBalance) {
          throw new Error(`Not enough bags in stock. Only ${currentBalance} bags available.`);
        }

        const newRecord: BagStockRecord = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          quantity,
          type: 'removal',
          reason,
          balance: currentBalance - quantity,
        };

        set((state: ProductionState) => ({
          bagStockRecords: [newRecord, ...state.bagStockRecords],
        }));
      },

      getTodayProduction: () => {
        const state = get();
        const today = new Date().toDateString();
        
        const todayRecords = state.productionRecords.filter(
          (record: ProductionRecord) => new Date(record.date).toDateString() === today
        );

        return {
          bags: todayRecords.reduce((sum: number, record: ProductionRecord) => sum + record.bagsProduced, 0),
          bundles: todayRecords.reduce((sum: number, record: ProductionRecord) => sum + record.bundlesProduced, 0),
          rawMaterialUsed: todayRecords.reduce((sum: number, record: ProductionRecord) => sum + record.rawMaterialUsed, 0),
        };
      },

      getBagsInStock: () => {
        const state = get();
        
        if (state.bagStockRecords.length === 0) {
          return {
            total: 0,
            production: 0,
            remaining: 0,
            manual: 0,
          };
        }

        const currentBalance = state.bagStockRecords[0].balance || 0;
        
        // Calculate bags from different sources by looking at all addition records
        // and subtracting any removals that happened after them
        const today = new Date().toDateString();
        
        // Get all records for today to calculate accurate balances
        const todayRecords = state.bagStockRecords.filter(
          record => new Date(record.date).toDateString() === today
        );

        // Calculate net quantities by source for today only
        const sourceQuantities = todayRecords.reduce((acc, record) => {
          const source = record.source || 'unknown';
          if (record.type === 'addition') {
            acc[source] = (acc[source] || 0) + record.quantity;
          }
          return acc;
        }, {} as Record<string, number>);

        const fromProduction = sourceQuantities['production'] || 0;
        const fromRemaining = sourceQuantities['supplier_remaining'] || 0;
        const fromManual = Object.entries(sourceQuantities)
          .filter(([source]) => source !== 'production' && source !== 'supplier_remaining')
          .reduce((sum, [, quantity]) => sum + quantity, 0);

        return {
          total: Math.max(0, currentBalance),
          production: Math.max(0, fromProduction),
          remaining: Math.max(0, fromRemaining),
          manual: Math.max(0, fromManual),
        };
      },

      getTodayManualEntries: () => {
        const state = get();
        const today = new Date().toDateString();
        
        return state.manualBagEntries.filter(
          (entry: ManualBagEntry) => new Date(entry.date).toDateString() === today
        );
      },

      getManualBagsHistory: (days: number) => {
        const state = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return state.manualBagEntries.filter(
          (entry: ManualBagEntry) => new Date(entry.date) >= cutoffDate
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getTodayRollsUsed: () => {
        const state = get();
        const today = new Date().toDateString();
        
        const todayRecords = state.productionRecords.filter(
          (record: ProductionRecord) => new Date(record.date).toDateString() === today
        );

        return todayRecords.reduce((sum: number, record: ProductionRecord) => sum + record.rawMaterialUsed, 0);
      },

      resetTodayProduction: () => {
        // This function doesn't actually reset anything, it's just a placeholder
        // for when we need to reset production counters for a new day
        // The actual reset happens in the component based on date comparison
      },

      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'aquelia-production-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useProductionStore;