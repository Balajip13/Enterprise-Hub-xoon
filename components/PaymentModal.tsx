
import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  ArrowRight,
  Tag,
  RefreshCcw,
  Zap
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseAmount: number;
  discount: number;
  onSuccess: (isAutoRenew: boolean) => void;
}

type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, baseAmount, discount, onSuccess }) => {
  const [step, setStep] = useState<'SELECT' | 'PROCESSING' | 'SUCCESS'>('SELECT');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('');
  const [isAutoRenew, setIsAutoRenew] = useState(true);

  const finalAmount = Math.max(0, baseAmount - discount);

  const handlePayment = () => {
    setStep('PROCESSING');
    // Simulate payment gateway delay
    setTimeout(() => {
      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess(isAutoRenew);
        setStep('SELECT');
      }, 2500);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 relative">
        {/* Universal Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-[10] p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all shadow-sm border border-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
        
        {step === 'SELECT' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold">Secure Checkout</h2>
                <p className="text-xs text-slate-400">Complete your PRO membership</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-500">PRO Membership (Monthly)</span>
                <span className="font-semibold">₹{baseAmount}</span>
              </div>
              <div className="flex justify-between text-sm mb-3 text-emerald-600 font-bold">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Referral Discounts
                </span>
                <span>- ₹{discount}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-slate-900">Final Amount</span>
                <span className="text-xl font-black text-blue-600">₹{finalAmount}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 mb-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Choose Payment Method</label>
              
              <button 
                onClick={() => setSelectedMethod('UPI')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  selectedMethod === 'UPI' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedMethod === 'UPI' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">UPI (GPay, PhonePe, BHIM)</p>
                    <p className="text-[10px] text-slate-400">Instant & secure transfer</p>
                  </div>
                </div>
                {selectedMethod === 'UPI' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </button>

              <button 
                onClick={() => setSelectedMethod('CARD')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  selectedMethod === 'CARD' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedMethod === 'CARD' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">Cards (Visa, Master, RuPay)</p>
                    <p className="text-[10px] text-slate-400">Credit or Debit cards</p>
                  </div>
                </div>
                {selectedMethod === 'CARD' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </button>

              <button 
                onClick={() => setSelectedMethod('NETBANKING')}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  selectedMethod === 'NETBANKING' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-100 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedMethod === 'NETBANKING' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-800">Net Banking</p>
                    <p className="text-[10px] text-slate-400">All major Indian banks</p>
                  </div>
                </div>
                {selectedMethod === 'NETBANKING' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </button>
            </div>

            {selectedMethod === 'UPI' && (
              <div className="mb-6 animate-in slide-in-from-top-2">
                <input 
                  type="text"
                  placeholder="Enter UPI ID (e.g. name@okaxis)"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>
            )}

            {/* Auto Renewal Toggle */}
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between mb-8 group transition-colors hover:bg-indigo-50">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mt-1">
                  <RefreshCcw className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Auto-Renewal</p>
                  <p className="text-[10px] text-slate-500 leading-tight">Future bills will be automated. Cancel anytime in Profile.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAutoRenew(!isAutoRenew)}
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${isAutoRenew ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isAutoRenew ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>

            <button 
              onClick={handlePayment}
              disabled={selectedMethod === 'UPI' && !upiId.includes('@')}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Pay ₹{finalAmount} Now
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">PCI-DSS Compliant Secure Gateway</span>
            </div>
          </div>
        )}

        {step === 'PROCESSING' && (
          <div className="p-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Verifying Transaction</h2>
            <p className="text-sm text-slate-500">Please do not press back or close the app while we communicate with your bank.</p>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="p-12 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Payment Successful!</h2>
            <p className="text-sm text-slate-500 mb-8">Your XOON PRO membership has been renewed. {isAutoRenew ? 'Auto-renewal is now active.' : ''}</p>
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
              <div className="text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</p>
                <p className="text-xs font-mono font-bold text-slate-700">TXN9028347102</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isAutoRenew ? 'Next Auto-Pay' : 'Valid Till'}</p>
                <p className="text-xs font-bold text-slate-700">14 July 2025</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
