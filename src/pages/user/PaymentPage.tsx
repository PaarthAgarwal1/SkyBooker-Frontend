import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { 
  ArrowLeft, ShieldCheck, Lock, CreditCard, 
  AlertCircle, ChevronRight, Plane, User, Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import StripePaymentForm from '../../components/user/StripePaymentForm';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { usePaymentConfirmation } from '../../features/checkout/hooks/usePaymentConfirmation';
import BookingStepProgress from '../../components/user/BookingStepProgress';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const STRIPE_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    fontFamily: '"Inter", system-ui, sans-serif',
    borderRadius: '14px',
    colorPrimary: '#3b82f6',
  },
};

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    clientSecret, 
    paymentId, 
    bookingId, 
    amount,
    flight,
    passengers = []
  } = (location.state as any) || {};

  const [error, setError] = useState<string | null>(null);

  const {
    isProcessing,
    loadingText,
    loadingSub,
    confirmPaymentAndBooking,
    cleanup
  } = usePaymentConfirmation({
    onSuccess: (confirmedBooking) => {
      toast.success('Booking confirmed successfully!');
      navigate('/confirmation', { state: { booking: confirmedBooking }, replace: true });
    },
    onError: (msg) => {
      setError(msg);
      toast.error(msg);
    }
  });

  useEffect(() => {
    if (!clientSecret || !paymentId || !bookingId) {
      toast.error('Invalid payment session. Redirecting...');
      navigate('/', { replace: true });
    }
    return () => cleanup();
  }, [clientSecret, paymentId, bookingId, navigate, cleanup]);

  const handleStripeSuccess = async () => {
    try {
      await confirmPaymentAndBooking(bookingId, paymentId);
    } catch (e) {
      console.error('Final confirmation error:', e);
    }
  };

  const handleStripeError = (msg: string) => {
    setError(msg);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] border border-rose-100 p-12 max-w-lg w-full text-center shadow-2xl shadow-rose-900/5"
        >
          <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Payment Problem</h2>
          <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setError(null)}
              className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <LoadingOverlay 
        isVisible={isProcessing} 
        title={loadingText} 
        subtitle={loadingSub} 
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-black text-slate-900">Secure Checkout</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Step 4 of 5 · Finalize Payment
                </p>
              </div>
            </div>
            <BookingStepProgress currentStep={4} />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Payment Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <CreditCard className="w-32 h-32" />
              </div>
              
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Card Details</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End-to-end encrypted</p>
                </div>
              </div>

              <Elements 
                stripe={stripePromise} 
                options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
              >
                <StripePaymentForm 
                  clientSecret={clientSecret}
                  amount={amount}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              </Elements>

              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  PCI-DSS Compliant
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-5 bg-slate-100 rounded"></div>
                  <div className="w-8 h-5 bg-slate-100 rounded"></div>
                  <div className="w-8 h-5 bg-slate-100 rounded"></div>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-blue-200/50 flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest mb-1">Guaranteed Flight</p>
                <h4 className="text-lg font-black">Secure your seat now</h4>
              </div>
              <Plane className="w-8 h-8 text-white/20 rotate-45" />
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Order Summary</h3>
              
              {flight && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-900">{flight.originAirportCode}</span>
                    <Plane className="w-4 h-4 text-slate-300" />
                    <span className="text-2xl font-black text-slate-900">{flight.destinationAirportCode}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <User className="w-3 h-3" /> {passengers.length} Passenger(s)
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Mail className="w-3 h-3" /> {(location.state as any)?.contactEmail || 'Guest'}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                    <p className="text-3xl font-black text-blue-600">₹{amount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-[10px] font-bold text-slate-400 text-center px-4 leading-relaxed">
              By paying, you agree to our Terms of Service and Cancellation Policy.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
