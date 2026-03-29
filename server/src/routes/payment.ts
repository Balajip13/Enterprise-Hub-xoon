import express from 'express';
import crypto from 'crypto';
import { getRazorpayInstance } from '../config/razorpay';
import Payment from '../models/Payment';
import User from '../models/User';
import PlatformSettings from '../models/PlatformSettings';

const router = express.Router();

// 1. Create Order
router.post('/create-order', async (req: any, res) => {
  try {
    const { amount, currency = 'INR', feature = 'membership', userId } = req.body;

    const razorpay = await getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({ message: 'Razorpay is not configured' });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Initial record in database
    const newPayment = new Payment({
      orderId: order.id,
      userId,
      amount,
      currency,
      status: 'pending',
      feature
    });
    await newPayment.save();

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: (await PlatformSettings.findOne())?.paymentSettings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('[Payments] Create order error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

// 2. Verify Payment
router.post('/verify', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    const settings = await PlatformSettings.findOne();
    const secret = settings?.paymentSettings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return res.status(500).json({ message: 'Razorpay secret not found' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      // Update payment record
      const payment = await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { 
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          status: 'captured'
        },
        { new: true }
      );

      // If this was a membership payment, update the user's status
      if (payment && payment.feature === 'membership') {
        await User.findByIdAndUpdate(payment.userId, {
          paymentStatus: 'paid',
          paymentDate: new Date(),
          razorpayPaymentId: razorpay_payment_id,
          $addToSet: { purchasedCourses: 'DEMO_COURSE' }
        });
        
      }

      res.status(200).json({ message: 'Payment verified successfully', success: true });
    } else {
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'failed' }
      );
      res.status(400).json({ message: 'Invalid payment signature', success: false });
    }

  } catch (error) {
    console.error('[Payments] Verification error:', error);
    res.status(500).json({ message: 'Internal server error during verification' });
  }
});

// 3. Get Payment Logs (Admin)
router.get('/admin/logs', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email mobile')
      .sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    console.error('[Payments] Fetch logs error:', error);
    res.status(500).json({ message: 'Failed to fetch payment logs' });
  }
});

export default router;
