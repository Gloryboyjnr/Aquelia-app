export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  color: string;
  available: boolean;
  incoming: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: '299',
    period: 'month',
    features: [
      'Production tracking',
      'Basic inventory management',
      'Sales recording',
      'Quality control logs',
      'Limited employees',
      'Basic reports',
      'Offline functionality',
      'Data backup',
      'Email support'
    ],
    color: '#3B82F6',
    available: true,
    incoming: false,
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '599',
    period: 'month',
    features: [
      'Everything in Basic',
      'Advanced analytics & insights',
      'Unlimited employees',
      'Custom reports & dashboards',
      'API access',
      'Priority support',
      'Multi-location support',
      'Advanced inventory forecasting',
      'Automated quality alerts',
      'Real-time sync across devices',
      'Export to Excel/PDF',
      'Custom branding'
    ],
    isPopular: true,
    color: '#8B5CF6',
    available: false,
    incoming: true,
  },
];