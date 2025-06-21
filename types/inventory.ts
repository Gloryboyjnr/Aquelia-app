export interface InventoryItem {
  id: string;
  type: 'rolls' | 'packingBags';
  quantity: number;
  micronType?: 38 | 40 | 45 | 50; // Only for rolls
  manufacturerName: string;
  dateAdded: string;
  receiptUrl?: string;
  notes?: string;
}

export interface InventoryState {
  items: InventoryItem[];
  rolls: {
    total: number;
    micronType: 38 | 40 | 45 | 50;
    estimatedBags: number;
  };
  packingBags: {
    total: number;
  };
  lastUpdated?: string;
}

export interface ProductionRecord {
  id: string;
  producerName: string;
  bundlesProduced: number;
  bagsProduced: number;
  machineNumber: number;
  rawMaterialUsed: number;
  date: string;
  notes?: string;
}

export interface BagStockRecord {
  id: string;
  date: string;
  quantity: number;
  type: 'addition' | 'removal';
  source?: string;
  reason?: string;
  balance: number;
}

export interface BagStockSummary {
  total: number;
  production: number;
  remaining: number;
  manual: number;
}

export interface ManualBagEntry {
  id: string;
  quantity: number;
  source: string;
  notes?: string;
  date: string;
  enteredBy?: string;
}

export interface ProductionState {
  productionRecords: ProductionRecord[];
  bagStockRecords: BagStockRecord[];
  manualBagEntries: ManualBagEntry[];
  isLoading: boolean;
  error: string | null;
}

export interface ProductionEntry {
  id: string;
  producerName: string;
  bundles: number;
  bags: number;
  machineNumber: number;
  date: string;
  rollsUsed: number;
}

export interface SaleEntry {
  id: string;
  type: 'supply' | 'factory';
  supplierName?: string;
  tripNumber?: number;
  customerName?: string;
  bagsTaken: number;
  bagsReturned: number;
  leakages: number;
  accumulatedLeakages: number;
  pricePerBag: number;
  revenue: number;
  date: string;
  notes?: string;
  paymentMethod?: 'cash' | 'mobile_money' | 'bank_transfer' | 'credit';
  paymentStatus?: 'paid' | 'pending' | 'partial';
}

export interface SalesState {
  todaySales: {
    bags: number;
    revenue: number;
    leakages: number;
    returns: number;
  };
  history: SaleEntry[];
  isLoading: boolean;
  error: string | null;
}

export interface DiscrepancyAnalysis {
  totalBagsSold: number;
  totalBagsInStock: number;
  totalBagsAvailable: number;
  expectedStock: number;
  actualStock: number;
  difference: number;
  hasDiscrepancy: boolean;
  analysisDate: string;
}