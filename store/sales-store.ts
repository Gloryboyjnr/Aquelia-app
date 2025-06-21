import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SalesState, SaleEntry } from '@/types/inventory';

interface SupplierRecord {
  name: string;
  trips: SaleEntry[];
  totalBags: number;
  totalRevenue: number;
  totalLeakages: number;
  isClosed: boolean;
}

interface SupplierSummary {
  bags: number;
  revenue: number;
  trips: number;
}

interface FactorySummary {
  bags: number;
  revenue: number;
  transactions: number;
}

interface FactorySalesCloseResult {
  factorySales: FactorySummary;
}

const useSalesStore = create<SalesState & {
  suppliers: string[];
  addSale: (entry: Omit<SaleEntry, 'id' | 'date' | 'revenue' | 'accumulatedLeakages' | 'bagsReturned'>) => void;
  addSupplier: (supplierName: string) => void;
  removeSupplier: (supplierName: string) => void;
  getNextTripNumber: (supplierName: string) => number;
  getTodaySupplierSales: () => SupplierSummary;
  getTodayFactorySales: () => FactorySummary;
  getTodaySupplierRecords: () => SupplierRecord[];
  getTodayFactoryRecords: () => SaleEntry[];
  closeSalesForSupplier: (supplierName: string, remainingBags?: number, finalTripLeakages?: number) => void;
  closeFactorySales: () => FactorySalesCloseResult;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  isFactorySalesClosed: boolean;
}>()(
  persist(
    (set, get) => ({
      suppliers: ['Kwame Transport', 'Ama Logistics', 'Kofi Delivery', 'Akosua Express'],
      todaySales: {
        bags: 0,
        revenue: 0,
        leakages: 0,
        returns: 0,
      },
      history: [],
      isLoading: false,
      error: null,
      isFactorySalesClosed: false,

      addSupplier: (supplierName: string) => {
        const trimmedName = supplierName.trim();
        if (!trimmedName) return;
        
        set((state) => {
          if (state.suppliers.includes(trimmedName)) {
            return state; // Supplier already exists
          }
          return {
            suppliers: [...state.suppliers, trimmedName],
          };
        });
      },

      removeSupplier: (supplierName: string) => {
        set((state) => ({
          suppliers: state.suppliers.filter(supplier => supplier !== supplierName),
        }));
      },

      addSale: (entry) => {
        const state = get();
        
        // Check if factory sales are closed for today
        if (entry.type === 'factory' && state.isFactorySalesClosed) {
          set({ error: 'Factory sales are closed for today. Please wait until tomorrow to record new factory sales.' });
          throw new Error('Factory sales are closed for today');
        }
        
        try {
          // Import production store to handle bag deductions
          const productionStore = require('./production-store').default;
          const productionState = productionStore.getState();
          
          if (typeof productionState.removeBagsFromStock !== 'function') {
            throw new Error('removeBagsFromStock function not available');
          }
          
          // Check if we have enough bags in stock before proceeding
          const bagsInStock = productionState.getBagsInStock();
          const availableBags = bagsInStock?.total || 0;
          
          if (entry.bagsTaken > availableBags) {
            const errorMessage = `Not enough bags in stock. Only ${availableBags} bags available.`;
            set({ error: errorMessage });
            throw new Error(errorMessage);
          }
          
          // Calculate revenue based on bags taken and price per bag
          const revenue = entry.bagsTaken * entry.pricePerBag;
          
          // For supply sales, calculate accumulated leakages
          let accumulatedLeakages = 0;
          if (entry.type === 'supply' && entry.supplierName) {
            const today = new Date().toDateString();
            const supplierTrips = state.history.filter(
              sale => 
                sale.type === 'supply' && 
                sale.supplierName === entry.supplierName &&
                new Date(sale.date).toDateString() === today
            );
            accumulatedLeakages = supplierTrips.reduce((sum: number, trip: SaleEntry) => sum + trip.leakages, 0) + entry.leakages;
          }

          const newEntry: SaleEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            revenue,
            accumulatedLeakages,
            bagsReturned: 0, // Always 0 for new entries
            ...entry,
          };

          // Deduct bags from stock first, then update sales records
          productionState.removeBagsFromStock(entry.bagsTaken, entry.type === 'supply' ? 'supplier_sale' : 'factory_sale');
          console.log(`Sale recorded: ${entry.bagsTaken} bags taken for ${entry.type} sale`);
          
          // Get updated stock after removal
          const updatedStock = productionState.getBagsInStock();
          console.log(`Remaining bags in stock: ${updatedStock?.total || 0}`);

          set((state) => {
            // Check if we need to reset today's sales (new day)
            const today = new Date().toDateString();
            const lastEntryDate = state.history[0]
              ? new Date(state.history[0].date).toDateString()
              : null;

            const isNewDay = today !== lastEntryDate;

            // Calculate effective bags for today's summary
            const effectiveBags = newEntry.bagsTaken;

            const todaySales = isNewDay
              ? {
                  bags: effectiveBags,
                  revenue: newEntry.revenue,
                  leakages: newEntry.leakages,
                  returns: 0,
                }
              : {
                  bags: state.todaySales.bags + effectiveBags,
                  revenue: state.todaySales.revenue + newEntry.revenue,
                  leakages: state.todaySales.leakages + newEntry.leakages,
                  returns: state.todaySales.returns,
                };

            return {
              todaySales,
              history: [newEntry, ...state.history],
              error: null, // Clear any previous errors
            };
          });
        } catch (error) {
          console.error('Sale recording error:', error);
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
          set({ error: errorMessage });
          throw error;
        }
      },

      getNextTripNumber: (supplierName: string) => {
        const state = get();
        const today = new Date().toDateString();
        
        const todayTrips = state.history.filter(
          sale => 
            sale.type === 'supply' && 
            sale.supplierName === supplierName &&
            new Date(sale.date).toDateString() === today
        );

        return todayTrips.length + 1;
      },

      getTodaySupplierSales: () => {
        const state = get();
        const today = new Date().toDateString();
        
        const todaySupplierSales = state.history.filter(
          sale => 
            sale.type === 'supply' && 
            new Date(sale.date).toDateString() === today
        );

        return {
          bags: todaySupplierSales.reduce((sum, sale) => sum + sale.bagsTaken, 0),
          revenue: todaySupplierSales.reduce((sum, sale) => sum + sale.revenue, 0),
          trips: todaySupplierSales.length,
        };
      },

      getTodayFactorySales: () => {
        const state = get();
        const today = new Date().toDateString();
        
        const todayFactorySales = state.history.filter(
          sale => 
            sale.type === 'factory' && 
            new Date(sale.date).toDateString() === today
        );

        return {
          bags: todayFactorySales.reduce((sum, sale) => sum + sale.bagsTaken, 0),
          revenue: todayFactorySales.reduce((sum, sale) => sum + sale.revenue, 0),
          transactions: todayFactorySales.length,
        };
      },

      getTodaySupplierRecords: () => {
        const state = get();
        const today = new Date().toDateString();
        
        const todaySupplierSales = state.history.filter(
          sale => 
            sale.type === 'supply' && 
            new Date(sale.date).toDateString() === today
        );

        const supplierGroups = todaySupplierSales.reduce((groups, sale) => {
          const supplier = sale.supplierName!;
          if (!groups[supplier]) {
            groups[supplier] = [];
          }
          groups[supplier].push(sale);
          return groups;
        }, {} as Record<string, SaleEntry[]>);

        return Object.entries(supplierGroups).map(([name, trips]) => {
          // Sort trips in ascending order by trip number (earliest first)
          const sortedTrips = trips.sort((a, b) => (a.tripNumber || 0) - (b.tripNumber || 0));
          
          // Check if any trip has bagsReturned > 0, which indicates the supplier is closed
          const isClosed = sortedTrips.some(trip => trip.bagsReturned > 0);

          return {
            name,
            trips: sortedTrips,
            totalBags: trips.reduce((sum, trip) => sum + trip.bagsTaken, 0),
            totalRevenue: trips.reduce((sum, trip) => sum + trip.revenue, 0),
            totalLeakages: trips.reduce((sum, trip) => sum + trip.leakages, 0),
            isClosed,
          };
        });
      },

      getTodayFactoryRecords: () => {
        const state = get();
        const today = new Date().toDateString();
        
        return state.history
          .filter(sale => 
            sale.type === 'factory' && 
            new Date(sale.date).toDateString() === today
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      closeSalesForSupplier: (supplierName: string, remainingBags = 0, finalTripLeakages = 0) => {
        const state = get();
        // Import production store dynamically to avoid circular dependency
        const productionStore = require('./production-store').default;
        const productionState = productionStore.getState();
        const today = new Date().toDateString();

        // Find all trips for this supplier today
        const supplierTrips = state.history
          .filter(sale => 
            sale.type === 'supply' && 
            sale.supplierName === supplierName &&
            new Date(sale.date).toDateString() === today
          )
          .sort((a, b) => (a.tripNumber || 0) - (b.tripNumber || 0)); // Sort by trip number ascending

        if (supplierTrips.length === 0) {
          throw new Error(`No sales found for ${supplierName} today`);
        }

        // Get the final trip (highest trip number)
        const finalTrip = supplierTrips[supplierTrips.length - 1];

        // Calculate deductions from final trip only
        const totalDeductions = (remainingBags + finalTripLeakages) * finalTrip.pricePerBag;

        // Add remaining bags to stock
        if (remainingBags > 0 && typeof productionState.addBagsToStock === 'function') {
          // Use supplier_remaining as the source to track these separately
          productionState.addBagsToStock(remainingBags, 'supplier_remaining');
        }

        // Update the final trip to apply deductions and add additional leakages
        set((state) => {
          const updatedHistory = state.history.map(sale => {
            if (sale.id === finalTrip.id) {
              return {
                ...sale,
                bagsReturned: remainingBags,
                leakages: sale.leakages + finalTripLeakages, // Add additional leakages to the trip's leakages
                revenue: Math.max(0, sale.revenue - totalDeductions),
                notes: `Sales closed. Final trip deductions: ${remainingBags} remaining bags + ${finalTripLeakages} additional leakages = GHS ${totalDeductions.toFixed(2)} deducted from this trip revenue.`,
              };
            }
            return sale;
          });

          // Update today's sales to include the additional leakages and returns
          const updatedTodaySales = {
            ...state.todaySales,
            leakages: state.todaySales.leakages + finalTripLeakages,
            returns: state.todaySales.returns + remainingBags,
          };

          return {
            history: updatedHistory,
            todaySales: updatedTodaySales,
          };
        });

        console.log(`Sales closed for ${supplierName}. Final trip deductions: GHS ${totalDeductions.toFixed(2)}`);
        console.log(`Remaining bags added back to stock: ${remainingBags}`);
      },

      closeFactorySales: () => {
        // Mark factory sales as closed for today
        set({ isFactorySalesClosed: true });
        
        // Get today's factory sales summary
        const factorySales = get().getTodayFactorySales();
        
        console.log('Factory sales closed for today.');
        console.log(`Summary: ${factorySales.bags} bags sold, GHS ${factorySales.revenue.toFixed(2)} revenue, ${factorySales.transactions} transactions`);
        
        // Return the result object with factorySales
        return {
          factorySales
        };
      },

      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'aquelia-sales-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useSalesStore;