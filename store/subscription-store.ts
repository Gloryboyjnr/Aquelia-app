import { create } from 'zustand';
import { SubscriptionState } from '@/types/subscription';

const useSubscriptionStore = create<SubscriptionState & {
  setSelectedPlan: (plan: 'basic' | 'pro' | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
  isPremium: boolean;
}>((set, get) => ({
  selectedPlan: null,
  isLoading: false,
  error: null,
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  resetState: () => set({ 
    selectedPlan: null, 
    isLoading: false, 
    error: null 
  }),
  get isPremium() {
    const { selectedPlan } = get();
    return selectedPlan === 'pro';
  }
}));

export default useSubscriptionStore;