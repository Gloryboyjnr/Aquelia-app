export interface SubscriptionState {
  selectedPlan: 'basic' | 'pro' | null;
  isLoading: boolean;
  error: string | null;
}

export interface PaymentMethod {
  id: string;
  type: 'mobile_money' | 'card';
  name: string;
  icon: string;
  description: string;
}

export interface PaymentState {
  selectedMethod: PaymentMethod | null;
  phoneNumber: string;
  isProcessing: boolean;
  error: string | null;
}