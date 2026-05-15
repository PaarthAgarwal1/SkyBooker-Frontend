import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { formatINR } from '../../shared/utils/currency';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      fontWeight: '600',
      color: '#0f172a',
      '::placeholder': { color: '#94a3b8', fontWeight: '400' },
      iconColor: '#3b82f6',
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
  hidePostalCode: false,
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
  disabled = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || disabled || processing) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not mounted. Please refresh.');
      return;
    }

    setProcessing(true);
    setCardError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        const msg =
          error.type === 'card_error' || error.type === 'validation_error'
            ? error.message ?? 'Card declined. Please check your details.'
            : 'An unexpected error occurred. Please try again.';
        setCardError(msg);
        onError(msg);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        const msg = `Payment incomplete (status: ${paymentIntent?.status}). Please contact support.`;
        setCardError(msg);
        onError(msg);
      }
    } catch (err: any) {
      const msg = err?.message ?? 'Network error. Please check your connection.';
      setCardError(msg);
      onError(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Card Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <CreditCard className="w-3.5 h-3.5" />
          Card Number · Expiry · CVC
        </label>
        <div className="bg-slate-50 border-2 border-slate-100 focus-within:border-blue-500 focus-within:bg-white rounded-2xl px-5 py-4 transition-all duration-200">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => {
              setCardComplete(e.complete);
              if (e.error) setCardError(e.error.message ?? null);
              else setCardError(null);
            }}
          />
        </div>
      </div>

      {/* Test Card Hint */}
      <div className="bg-amber-50 border border-amber-200/60 rounded-2xl px-5 py-3 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-700">Stripe Test Mode</p>
          <p className="text-[11px] text-amber-600 mt-0.5">
            Use card <span className="font-mono font-black tracking-wide">4242 4242 4242 4242</span> &nbsp;·&nbsp; Any future date &nbsp;·&nbsp; Any 3-digit CVC
          </p>
        </div>
      </div>

      {/* Inline error */}
      {cardError && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <p className="text-sm font-semibold text-rose-700">{cardError}</p>
        </div>
      )}

      {/* Pay Button */}
      <button
        type="submit"
        disabled={!stripe || !elements || processing || disabled || !cardComplete}
        className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-base shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Confirming Payment...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay {formatINR(amount)}
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        256-bit SSL · Powered by Stripe
      </div>
    </form>
  );
};

export default StripePaymentForm;
