import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryItem, InventoryState } from '@/types/inventory';

interface InventoryStore extends InventoryState {
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'dateAdded'>) => void;
  consumeRolls: (amount: number) => void;
  consumePackingBags: (amount: number) => void;
  getInventoryHistory: (days: number) => InventoryItem[];
  getTotalValue: () => number;
}

// Create a more robust storage implementation with error handling
const storage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  },
};

const calculateEstimatedBags = (totalRolls: number, micronType: number) => {
  const bagsPerKg = {
    38: 28, // average of 26-30
    40: 24, // average of 23-25
    45: 22, // average of 21-23
    50: 17, // average of 16-18
  }[micronType] || 24;

  return Math.floor(totalRolls * bagsPerKg);
};

const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: [
        // Demo data
        {
          id: '1',
          type: 'rolls',
          quantity: 150,
          micronType: 40,
          manufacturerName: 'Ghana Plastics Ltd',
          dateAdded: new Date().toISOString(),
          notes: 'High quality rolls for production',
        },
        {
          id: '2',
          type: 'packingBags',
          quantity: 50,
          manufacturerName: 'Accra Packaging Co',
          dateAdded: new Date().toISOString(),
        },
      ],
      rolls: {
        total: 150,
        micronType: 40,
        estimatedBags: calculateEstimatedBags(150, 40),
      },
      packingBags: {
        total: 50,
      },
      lastUpdated: new Date().toISOString(),

      addInventoryItem: (itemData) => {
        const newItem: InventoryItem = {
          ...itemData,
          id: Date.now().toString(),
          dateAdded: new Date().toISOString(),
        };

        set((state) => {
          const newItems = [newItem, ...state.items];
          
          // Recalculate totals
          const rollItems = newItems.filter(item => item.type === 'rolls');
          const packingBagItems = newItems.filter(item => item.type === 'packingBags');
          
          const totalRolls = rollItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPackingBags = packingBagItems.reduce((sum, item) => sum + item.quantity, 0);
          
          // Get the most recent micron type for rolls
          const latestRollMicronType = rollItems.length > 0 
            ? rollItems[0].micronType || 40 
            : 40;

          return {
            items: newItems,
            rolls: {
              total: totalRolls,
              micronType: latestRollMicronType,
              estimatedBags: calculateEstimatedBags(totalRolls, latestRollMicronType),
            },
            packingBags: {
              total: totalPackingBags,
            },
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      consumeRolls: (amount) => {
        set((state) => {
          const newTotal = Math.max(0, state.rolls.total - amount);
          return {
            rolls: {
              ...state.rolls,
              total: newTotal,
              estimatedBags: calculateEstimatedBags(newTotal, state.rolls.micronType),
            },
            lastUpdated: new Date().toISOString(),
          };
        });
      },

      consumePackingBags: (amount) => {
        set((state) => ({
          packingBags: {
            total: Math.max(0, state.packingBags.total - amount),
          },
          lastUpdated: new Date().toISOString(),
        }));
      },

      getInventoryHistory: (days) => {
        const state = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return state.items.filter(item => 
          new Date(item.dateAdded) >= cutoffDate
        );
      },

      getTotalValue: () => {
        const state = get();
        // This is a simplified calculation
        // In a real app, you'd have prices for different items
        return state.items.reduce((total, item) => {
          const basePrice = item.type === 'rolls' ? 10 : 5; // Demo prices
          return total + (item.quantity * basePrice);
        }, 0);
      },
    }),
    {
      name: 'aquelia-inventory-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        items: state.items || [],
        rolls: state.rolls,
        packingBags: state.packingBags,
        lastUpdated: state.lastUpdated,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          console.log('No state was rehydrated');
          return;
        }
        
        // Ensure items is always an array
        if (!state.items) {
          console.log('Rehydrated state missing items, initializing with empty array');
          state.items = [];
        }
      },
    }
  )
);

export default useInventoryStore;