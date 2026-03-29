import Razorpay from 'razorpay';
import PlatformSettings from '../models/PlatformSettings';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Get Razorpay instance with dynamic configuration from database
 * Fallbacks to environment variables if database settings are not present
 */
export const getRazorpayInstance = async () => {
  try {
    const settings = await PlatformSettings.findOne();
    
    const keyId = settings?.paymentSettings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
    const keySecret = settings?.paymentSettings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.warn('[Razorpay] Configuration missing. Please set keys in Admin Settings or .env');
      return null;
    }

    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (error) {
    console.error('[Razorpay] Error initializing instance:', error);
    return null;
  }
};
