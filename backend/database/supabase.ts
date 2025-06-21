// Mock database implementation for development
// Replace with actual Supabase implementation when ready

export const supabase = {
  from: (table: string) => ({
    insert: (data: any) => ({
      select: () => ({
        single: async () => ({ data, error: null })
      })
    }),
    select: (columns: string = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: { code: 'PGRST116' } }),
        limit: (count: number) => ({
          order: (column: string, options?: any) => ({
            async: async () => ({ data: [], error: null })
          })
        })
      }),
      gt: (column: string, value: any) => ({
        single: async () => ({ data: null, error: null })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        async: async () => ({ error: null })
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        async: async () => ({ error: null })
      })
    })
  })
};

// Database helper functions
export const db = {
  // Companies
  async createCompany(data: {
    name: string;
    phone_number: string;
    email?: string;
    address?: string;
  }) {
    console.log('Creating company:', data);
    return {
      id: Date.now().toString(),
      ...data,
      created_at: new Date().toISOString()
    };
  },

  async getCompanyByPhone(phoneNumber: string) {
    console.log('Getting company by phone:', phoneNumber);
    return null; // No company found
  },

  async updateCompanySubscription(companyId: string, plan: string, expiresAt: string) {
    console.log('Updating company subscription:', { companyId, plan, expiresAt });
    return true;
  },

  // OTP Verification
  async createOTP(phoneNumber: string, otpCode: string) {
    console.log('Creating OTP:', { phoneNumber, otpCode });
    return {
      id: Date.now().toString(),
      phone_number: phoneNumber,
      otp_code: otpCode,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      is_used: false
    };
  },

  async verifyOTP(phoneNumber: string, otpCode: string) {
    console.log('Verifying OTP:', { phoneNumber, otpCode });
    // For demo, accept any 4-digit code
    if (otpCode.length === 4) {
      return {
        id: Date.now().toString(),
        phone_number: phoneNumber,
        otp_code: otpCode,
        is_used: false
      };
    }
    return null;
  },

  // Payment Transactions
  async createPaymentTransaction(data: {
    company_id: string;
    reference: string;
    amount: number;
    payment_method: string;
    status?: string;
  }) {
    console.log('Creating payment transaction:', data);
    return {
      id: Date.now().toString(),
      ...data,
      status: data.status || 'pending',
      created_at: new Date().toISOString()
    };
  },

  async updatePaymentTransaction(reference: string, updates: {
    status: string;
    gateway_response?: any;
  }) {
    console.log('Updating payment transaction:', { reference, updates });
    return true;
  },

  // Production Records
  async createProductionRecord(data: {
    company_id: string;
    operator_name: string;
    bags_produced: number;
    bundles_produced: number;
    raw_material_used: number;
    shift?: string;
    notes?: string;
  }) {
    console.log('Creating production record:', data);
    return {
      id: Date.now().toString(),
      ...data,
      date: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
  },

  async getProductionRecords(companyId: string, limit = 50) {
    console.log('Getting production records:', { companyId, limit });
    return []; // Return empty array for demo
  }
};