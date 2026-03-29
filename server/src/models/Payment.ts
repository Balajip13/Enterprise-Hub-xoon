import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  paymentId?: string; // Razorpay Payment ID
  orderId: string;    // Razorpay Order ID
  signature?: string; // Razorpay Signature
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'pending' | 'captured' | 'failed';
  feature: 'membership' | 'course' | 'referral_fee' | 'other';
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  paymentId: { type: String },
  orderId: { type: String, required: true, unique: true },
  signature: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { 
    type: String, 
    enum: ['pending', 'captured', 'failed'], 
    default: 'pending' 
  },
  feature: { 
    type: String, 
    enum: ['membership', 'course', 'referral_fee', 'other'],
    required: true
  },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PaymentSchema.pre('save', function(this: any) {
  this.updatedAt = new Date();
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);
