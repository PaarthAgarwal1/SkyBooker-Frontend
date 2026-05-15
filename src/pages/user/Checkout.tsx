import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
  ArrowLeft, Loader2, Plane, User, Mail, CreditCard,
  Armchair, Utensils, Briefcase, AlertCircle, CheckCircle2,
  ShieldCheck, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { passengerApi } from '../../shared/api/passenger';
import type { BookingResponse, PaymentInitiateResponse } from '../../shared/api/passenger';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useBookingStore } from '../../store/bookingStore';
import BookingStepProgress from '../../components/user/BookingStepProgress';
import { formatINR } from '../../shared/utils/currency';
import { calculateFare } from '../../shared/utils/fareCalculation';
import { MEAL_PRICES } from '../../shared/constants/pricing';
import FareBreakdown from '../../components/user/FareBreakdown';

// ─── Stripe setup ──────────────────────────────────────────────────────────
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
);

const STRIPE_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    fontFamily: '"Inter", system-ui, sans-serif',
    borderRadius: '14px',
    colorPrimary: '#3b82f6',
  },
};

// ─── Phase state machine ──────────────────────────────────────────────────
type CheckoutPhase =
  | 'CREATING_BOOKING'
  | 'INITIATING_PAYMENT'
  | 'AWAITING_CARD'
  | 'CONFIRMING_BOOKING'
  | 'ERROR';

const generateIdempotencyKey = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;

// ─── Main Component ────────────────────────────────────────────────────────
const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setBookingResponse, setPaymentResponse } = useBookingStore();

  const {
    flight,
    selectedSeats = [],
    passengers = [],
    contactInfo = { email: '', phone: '' },
    totalAmount = 0,
    searchParams = {},
    mealPreference = 'VEG',
    luggageKg = 20,
  } = (location.state as any) || {};

  const [phase, setPhase] = useState<CheckoutPhase>('CREATING_BOOKING');
  const [errorMessage, setErrorMessage] = useState('');
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [payment, setPayment] = useState<PaymentInitiateResponse | null>(null);

  // Prevent double-firing in StrictMode
  const initStarted = useRef(false);

  // ── Guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!flight || !passengers.length || !contactInfo.email) {
      toast.error('Session data lost. Please restart the booking.');
      navigate('/', { replace: true });
    }
  }, []);

  // ── Sequential init: createBooking → initiatePayment ──────────────────
  const runInitSequence = useCallback(async () => {
    if (!flight || !user || initStarted.current) return;
    initStarted.current = true;

    /* ─── STEP 1: Create Booking ─────────────────────────────────────── */
    setPhase('CREATING_BOOKING');
    let createdBooking: BookingResponse;

    // Validation: Ensure user is authenticated and has a userId
    if (!user?.userId) {
      const msg = "User not authenticated or missing user ID.";
      console.error(msg, user);
      setErrorMessage(msg);
      setPhase('ERROR');
      toast.error(msg);
      initStarted.current = false;
      return;
    }

    try {
      const bookingData = {
        idempotencyKey: generateIdempotencyKey(),
        userId: user.userId,
        flightId: flight.flightId,
        tripType: searchParams?.isRoundTrip ? 'ROUND_TRIP' : 'ONE_WAY',
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone,
        seatIds: selectedSeats.map((s: any) => s.seatId),
        passengers,
        mealPreference,
        luggageKg,
      };

      console.log("Authenticated User:", user);
      console.log("Booking Payload:", bookingData);

      const res = await passengerApi.createBooking(bookingData);
      createdBooking = res.data;
      if (!createdBooking?.id) throw new Error('Server returned an empty booking response.');
      setBooking(createdBooking);
      setBookingResponse(createdBooking);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create booking.';
      setErrorMessage(msg);
      setPhase('ERROR');
      toast.error(msg);
      initStarted.current = false; // allow retry
      return;
    }

    /* ─── STEP 2: Initiate Payment ────────────────────────────────────── */
    setPhase('INITIATING_PAYMENT');
    try {
      const paymentPayload = {
        bookingId: createdBooking.id,
        userId: user.userId,
        username: user.fullName || 'Guest',
        contactEmail: contactInfo.email,
        amount: createdBooking.amount,   // use server-confirmed amount
        paymentMode: 'CARD',
        flightId: flight.flightId,
        route: `${flight.originAirportCode} → ${flight.destinationAirportCode}`,
        cabinClass: selectedSeats[0]?.seatClass || 'ECONOMY',
        airlineId: flight.airlineId,
      };

      console.log("Initiating Payment with payload:", paymentPayload);

      const res = await passengerApi.initiatePayment(paymentPayload);
      const paymentData = res.data;
      if (!paymentData?.clientSecret) throw new Error('Stripe client secret was not returned by the server.');
      
      setPayment(paymentData);
      setPaymentResponse(paymentData);

      // REDIRECT to the new PaymentPage for the actual card entry and confirmation
      navigate('/payment', {
        state: {
          clientSecret: paymentData.clientSecret,
          paymentId: paymentData.paymentId,
          bookingId: createdBooking.id,
          amount: createdBooking.amount,
          flight,
          passengers,
          contactEmail: contactInfo.email
        },
        replace: true
      });

    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to initialize payment.';
      setErrorMessage(msg);
      setPhase('ERROR');
      toast.error(msg);
      initStarted.current = false;
    }
  }, [flight, user, passengers, contactInfo, selectedSeats, mealPreference, luggageKg, searchParams, navigate, setBookingResponse, setPaymentResponse]);

  useEffect(() => {
    runInitSequence();
  }, [runInitSequence]);

  /* ─── Phase Loader ──────────────────────────────────────────────────── */
  const PhaseLoader: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-16 h-16">
        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-500 animate-ping" />
      </div>
      <p className="mt-6 text-lg font-black text-slate-900">{title}</p>
      {sub && <p className="mt-1.5 text-sm text-slate-400 font-medium">{sub}</p>}
    </div>
  );

  /* ─── Error Screen ──────────────────────────────────────────────────── */
  if (phase === 'ERROR') {
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
          <h2 className="text-2xl font-black text-slate-900 mb-3">Something Went Wrong</h2>
          <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">{errorMessage}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => { initStarted.current = false; runInitSequence(); }}
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

  /* ─── Main Render ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate(-1)}
                disabled={phase !== 'AWAITING_CARD'}
                className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-black text-slate-900">Secure Payment</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  Step 4 of 5 · Complete your booking
                </p>
              </div>
            </div>
            <BookingStepProgress currentStep={4} />
          </div>
        </div>
      </div>

      {/* ── Route Banner ──────────────────────────────────────────────── */}
      {flight && (
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 py-4">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-4 text-white">
            <span className="text-2xl font-black">{flight.originAirportCode}</span>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-px bg-white/20" />
              <Plane className="w-4 h-4 opacity-50" />
              <div className="flex-1 h-px bg-white/20" />
            </div>
            <span className="text-2xl font-black">{flight.destinationAirportCode}</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ── Left: Payment Panel ─────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            <AnimatePresence mode="wait">

              {/* Loading phases */}
              {(phase === 'CREATING_BOOKING' || phase === 'INITIATING_PAYMENT' || phase === 'CONFIRMING_BOOKING') && (
                <motion.div key="loader"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-sm"
                >
                  <PhaseLoader
                    title={
                      phase === 'CREATING_BOOKING' ? 'Creating your booking...' :
                        phase === 'INITIATING_PAYMENT' ? 'Setting up secure payment...' :
                          'Confirming your booking...'
                    }
                    sub={
                      phase === 'CREATING_BOOKING' ? 'Securing your seats — just a moment' :
                        phase === 'INITIATING_PAYMENT' ? 'Connecting to Stripe — almost ready' :
                          'Sending your e-ticket — almost done!'
                    }
                  />
                </motion.div>
              )}

              {/* Transition to payment page happens automatically after success */}

            </AnimatePresence>
          </div>

          {/* ── Right: Order Summary ─────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40 sticky top-24 space-y-5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight border-b border-slate-50 pb-5">
                Order Summary
              </h3>

              {/* Flight Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
                    {(flight?.flightNumber ?? 'FL').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {flight?.originAirportCode} → {flight?.destinationAirportCode}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {flight?.flightNumber} · {flight?.aircraftType}
                    </p>
                  </div>
                </div>
                {flight?.departureTime && (
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-2 border-t border-slate-100">
                    <span>{new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <Plane className="w-3 h-3 text-slate-300" />
                    <span>{new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>

              {/* Passengers */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <User className="w-3 h-3" />Passengers ({passengers.length})
                </p>
                <div className="space-y-2">
                  {passengers.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        {p.title} {p.firstName} {p.lastName}
                      </span>
                      <span className="text-xs font-black text-blue-600 flex items-center gap-1">
                        <Armchair className="w-3 h-3" /> {p.seatNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 py-3 border-t border-slate-50">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{contactInfo.email}</span>
              </div>

              {/* Preferences */}
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pb-4 border-b border-slate-50">
                <span className="flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-500" /> {mealPreference}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                  {luggageKg > 0 ? `${luggageKg} kg` : 'No baggage'}
                </span>
              </div>

              {/* Fare Breakdown Component */}
              <FareBreakdown 
                summary={calculateFare(
                  flight?.basePrice || 0,
                  passengers.length,
                  selectedSeats,
                  passengers.map((p: any) => p.mealPreference || mealPreference),
                  passengers.map(() => luggageKg) // Simplification for now
                )}
                showTitle={false}
                className="!shadow-none border-none p-0"
              />

              {/* Trust */}
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 border-t border-slate-50">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                PCI-DSS Compliant
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
