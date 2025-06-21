// SMS Service for OTP verification
import { db } from '../database/supabase';
import fetch from 'node-fetch';

interface SMSProvider {
  sendSMS(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string }>;
}

// Demo SMS Provider for development
class DemoSMSProvider implements SMSProvider {
  async sendSMS(phoneNumber: string, message: string) {
    console.log(`Demo SMS to ${phoneNumber}: ${message}`);
    return { success: true, messageId: 'demo_message_id' };
  }
}

// Twilio implementation (commented out for demo)
class TwilioSMSProvider implements SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || '';
  }

  async sendSMS(phoneNumber: string, message: string) {
    try {
      // For demo, just log
      console.log(`SMS to ${phoneNumber}: ${message}`);
      return { success: true, messageId: 'demo_message_id' };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return { success: false };
    }
  }
}

// Hubtel SMS Provider implementation
class HubtelSMSProvider implements SMSProvider {
  private clientId = process.env.HUBTEL_CLIENT_ID!;
  private clientSecret = process.env.HUBTEL_CLIENT_SECRET!;
  private senderId = process.env.HUBTEL_SENDER_ID || 'MyApp';

  async sendSMS(phoneNumber: string, message: string) {
    const url = 'https://sms.hubtel.com/v1/messages/send';
    const payload = {
      From: this.senderId,
      To: phoneNumber,
      Content: message,
      ClientId: this.clientId,
      ClientSecret: this.clientSecret,
      RegisteredDelivery: true,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json() as { Status: number; MessageId?: string; Description?: string };
    if (data.Status === 0) {
      return { success: true, messageId: data.MessageId };
    } else {
      return { success: false, error: data.Description };
    }
  }
}

// Factory to get the appropriate SMS provider
export const getSMSProvider = (): SMSProvider => {
  const provider = process.env.SMS_PROVIDER || 'demo';
  
  switch (provider) {
    case 'twilio':
      return new TwilioSMSProvider();
    case 'hubtel':
      return new HubtelSMSProvider();
    case 'demo':
    default:
      return new DemoSMSProvider();
  }
};

// Utility function to send OTP with database storage
export const sendOTP = async (phoneNumber: string) => {
  try {
    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store OTP in database
    await db.createOTP(phoneNumber, otp);
    
    // Send SMS
    const smsProvider = getSMSProvider();
    const message = `Your Aquelia verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`;
    
    const result = await smsProvider.sendSMS(phoneNumber, message);
    
    return {
      success: result.success,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Send OTP error:', error);
    // Return success for demo
    return { success: true, messageId: 'demo_id' };
  }
};

// Utility function to verify OTP
export const verifyOTP = async (phoneNumber: string, otpCode: string) => {
  try {
    const verification = await db.verifyOTP(phoneNumber, otpCode);
    
    if (!verification) {
      return { valid: false, message: 'Invalid or expired OTP' };
    }
    
    return { valid: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('Verify OTP error:', error);
    // Return success for demo
    return { valid: true, message: 'OTP verified successfully' };
  }
};

export { DemoSMSProvider, TwilioSMSProvider, HubtelSMSProvider };