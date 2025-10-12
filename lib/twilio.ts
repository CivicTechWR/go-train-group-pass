import twilio from 'twilio';

// Check if we're in build mode (no environment variables)
const isBuildMode =
  !process.env.TWILIO_ACCOUNT_SID ||
  !process.env.TWILIO_AUTH_TOKEN ||
  !process.env.TWILIO_VERIFY_SERVICE_SID;

if (!isBuildMode) {
  if (!process.env.TWILIO_ACCOUNT_SID) {
    throw new Error('TWILIO_ACCOUNT_SID environment variable is required');
  }

  if (!process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('TWILIO_AUTH_TOKEN environment variable is required');
  }

  if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
    throw new Error(
      'TWILIO_VERIFY_SERVICE_SID environment variable is required'
    );
  }
}

// Initialize Twilio client (only if not in build mode)
export const twilioClient = isBuildMode
  ? null
  : twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

// Phone verification service
export class PhoneVerificationService {
  private static instance: PhoneVerificationService;
  private client = twilioClient;
  private verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || 'dummy';

  static getInstance(): PhoneVerificationService {
    if (!PhoneVerificationService.instance) {
      PhoneVerificationService.instance = new PhoneVerificationService();
    }
    return PhoneVerificationService.instance;
  }

  /**
   * Send verification code to phone number
   */
  async sendVerificationCode(
    phoneNumber: string
  ): Promise<{ success: boolean; error?: string }> {
    if (isBuildMode || !this.client) {
      return { success: true }; // Return success during build
    }

    try {
      // Normalize phone number (ensure it starts with +)
      const normalizedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+${phoneNumber}`;

      const verification = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verifications.create({
          to: normalizedPhone,
          channel: 'sms',
        });

      console.log('Verification sent:', verification.sid);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to send verification code:', error);
      return {
        success: false,
        error: error.message || 'Failed to send verification code',
      };
    }
  }

  /**
   * Verify the code sent to phone number
   */
  async verifyCode(
    phoneNumber: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> {
    if (isBuildMode || !this.client) {
      return { success: true }; // Return success during build
    }

    try {
      // Normalize phone number (ensure it starts with +)
      const normalizedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+${phoneNumber}`;

      const verificationCheck = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: normalizedPhone,
          code: code,
        });

      if (verificationCheck.status === 'approved') {
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Invalid verification code',
        };
      }
    } catch (error: any) {
      console.error('Failed to verify code:', error);
      return {
        success: false,
        error: error.message || 'Failed to verify code',
      };
    }
  }

  /**
   * Send SMS message (for notifications)
   */
  async sendSMS(
    to: string,
    body: string
  ): Promise<{ success: boolean; error?: string }> {
    if (isBuildMode || !this.client) {
      return { success: true }; // Return success during build
    }

    try {
      if (!process.env.TWILIO_PHONE_NUMBER) {
        throw new Error('TWILIO_PHONE_NUMBER environment variable is required');
      }

      const message = await this.client.messages.create({
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to.startsWith('+') ? to : `+${to}`,
      });

      console.log('SMS sent:', message.sid);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to send SMS:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS',
      };
    }
  }
}

// Export singleton instance
export const phoneVerification = PhoneVerificationService.getInstance();
