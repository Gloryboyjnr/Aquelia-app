// Payment Service for handling different payment gateways

export interface PaymentProvider {
  initializePayment(data: PaymentData): Promise<PaymentResponse>;
  verifyPayment(reference: string): Promise<VerificationResponse>;
}

export interface PaymentData {
  amount: number;
  email: string;
  phoneNumber: string;
  reference: string;
  metadata?: any;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl: string;
  reference: string;
  accessCode?: string;
  message: string;
}

export interface VerificationResponse {
  success: boolean;
  status: string;
  amount: number;
  reference: string;
  paidAt?: string;
}

// Demo Payment Provider for development
class DemoPaymentProvider implements PaymentProvider {
  async initializePayment(data: PaymentData): Promise<PaymentResponse> {
    console.log('Demo payment initialization:', data);
    
    return {
      success: true,
      paymentUrl: 'https://checkout.paystack.com/demo',
      reference: data.reference,
      accessCode: 'demo_access_code',
      message: 'Payment initialized successfully (demo mode)'
    };
  }

  async verifyPayment(reference: string): Promise<VerificationResponse> {
    console.log('Demo payment verification:', reference);
    
    return {
      success: true,
      status: 'success',
      amount: 299, // Demo amount
      reference,
      paidAt: new Date().toISOString()
    };
  }
}

// Paystack implementation (commented out for demo)
class PaystackProvider implements PaymentProvider {
  private secretKey: string;
  private baseUrl = 'https://api.paystack.co';

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
  }

  async initializePayment(data: PaymentData): Promise<PaymentResponse> {
    try {
      // For demo, return mock response
      console.log('Paystack payment initialization:', data);
      
      return {
        success: true,
        paymentUrl: 'https://checkout.paystack.com/demo',
        reference: data.reference,
        accessCode: 'demo_access_code',
        message: 'Payment initialized successfully (demo mode)'
      };
    } catch (error) {
      console.error('Paystack initialization failed:', error);
      throw new Error('Payment initialization failed');
    }
  }

  async verifyPayment(reference: string): Promise<VerificationResponse> {
    try {
      // For demo, return mock response
      console.log('Paystack payment verification:', reference);
      
      return {
        success: true,
        status: 'success',
        amount: 299, // Demo amount
        reference,
        paidAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Paystack verification failed:', error);
      throw new Error('Payment verification failed');
    }
  }
}

// Factory to get payment provider
export const getPaymentProvider = (): PaymentProvider => {
  const provider = process.env.PAYMENT_PROVIDER || 'demo';
  
  switch (provider) {
    case 'paystack':
      return new PaystackProvider();
    case 'demo':
    default:
      return new DemoPaymentProvider();
  }
};