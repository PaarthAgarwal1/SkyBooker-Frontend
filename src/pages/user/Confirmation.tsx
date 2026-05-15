import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Download, Home, Plane, User, MapPin,
  Hash, Receipt, AlertCircle, Loader2, Armchair,
  CalendarCheck, ListOrdered
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useBookingStore } from '../../store/bookingStore';
import { formatINR } from '../../shared/utils/currency';
import BookingStepProgress from '../../components/user/BookingStepProgress';
import type { BookingResponse } from '../../shared/api/passenger';

// ─── Status badge helper ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  CONFIRMED:       { bg: 'bg-emerald-50 border-emerald-200',  text: 'text-emerald-700', label: 'Confirmed' },
  PAYMENT_PENDING: { bg: 'bg-amber-50 border-amber-200',      text: 'text-amber-700',   label: 'Payment Pending' },
  CANCELLED:       { bg: 'bg-rose-50 border-rose-200',        text: 'text-rose-700',    label: 'Cancelled' },
  FAILED:          { bg: 'bg-rose-50 border-rose-200',        text: 'text-rose-700',    label: 'Failed' },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    bg: 'bg-slate-50 border-slate-200',
    text: 'text-slate-600',
    label: status,
  };
  return (
    <span className={`inline-flex items-center px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
};

// ─── Info Row ─────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode; accent?: string }> = ({
  icon: Icon, label, value, accent = 'text-slate-400',
}) => (
  <div className="flex items-start gap-4">
    <div className={`w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 ${accent}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="text-sm font-bold text-slate-900 mt-0.5">{value}</div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────
const Confirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storeBooking = useBookingStore((s) => s.bookingResponse);
  const resetBooking = useBookingStore((s) => s.resetBooking);

  // Prefer booking from navigation state; fall back to global store
  const booking: BookingResponse | null =
    (location.state as any)?.booking ?? storeBooking;

  // ── No booking at all → redirect ────────────────────────────────────
  useEffect(() => {
    if (!booking) {
      toast.error('No booking data found. Redirecting…');
      navigate('/', { replace: true });
    }
  }, [booking]);

  // ── Handle Download Ticket (print) ──────────────────────────────────
  const handleDownload = () => {
    toast('Opening print dialog for your ticket…', { icon: '🖨️' });
    window.print();
  };

  // ── Handle Go to My Bookings ─────────────────────────────────────────
  const handleMyBookings = () => {
    navigate('/my-bookings');
  };

  // ── Loading fallback ─────────────────────────────────────────────────
  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading confirmation…</p>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.status === 'CONFIRMED';

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-0 print:bg-white" id="ticket-print">

      {/* ── Top Header ──────────────────────────────────────────────── */}
      <div className="bg-white/5 backdrop-blur border-b border-white/10 print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-black text-lg tracking-tight">SkyBooker</span>
            </div>
            <BookingStepProgress currentStep={5} />
          </div>
        </div>
      </div>

      {/* ── Confirmation Card ────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-12 print:py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* ── Success / Failed Hero ───────────────────────────────── */}
          <div className="text-center mb-8">
            {isConfirmed ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-20 h-20 bg-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-400/40"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                  Booking Confirmed!
                </h1>
                <p className="text-white/60 font-medium text-lg">
                  Your e-ticket has been sent to your registered email.
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-rose-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl font-black text-white mb-3">Booking Status</h1>
                <p className="text-white/60 font-medium">Review your booking details below.</p>
              </>
            )}
          </div>

          {/* ── Ticket Card ─────────────────────────────────────────── */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/30 print:shadow-none print:rounded-none">

            {/* Colored top stripe */}
            <div className={`h-2 w-full ${isConfirmed ? 'bg-emerald-500' : 'bg-amber-500'}`} />

            {/* ── PNR + Status Bar ─────────────────────────────────── */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Booking Reference (PNR)
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-black text-slate-900 tracking-[0.15em] font-mono">
                      {booking.pnr}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</p>
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            </div>

            {/* ── Route ───────────────────────────────────────────── */}
            <div className="px-8 py-6 border-b border-slate-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Origin</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">
                    {booking.route?.split('→')[0]?.trim() ?? '---'}
                  </p>
                </div>

                <div className="flex-1 flex items-center gap-4 px-8">
                  <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-slate-200" />
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Destination</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">
                    {booking.route?.split('→')[1]?.trim() ?? '---'}
                  </p>
                </div>
              </div>

              {/* Full route string */}
              <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">
                {booking.route}
              </p>
            </div>

            {/* ── Booking Details Grid ──────────────────────────────── */}
            <div className="px-8 py-8 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-slate-100">
              <InfoRow
                icon={Hash}
                label="Booking ID"
                value={<span className="font-mono text-xs tracking-wider text-slate-600">{booking.id}</span>}
                accent="text-blue-500"
              />
              <InfoRow
                icon={Receipt}
                label="Total Amount Paid"
                value={
                  <span className="text-2xl font-black text-blue-600">
                    {formatINR(booking.amount)}
                  </span>
                }
                accent="text-emerald-500"
              />
              <InfoRow
                icon={ListOrdered}
                label="Status"
                value={<StatusBadge status={booking.status} />}
                accent="text-amber-500"
              />
              <InfoRow
                icon={CalendarCheck}
                label="Ticket Type"
                value="One Way · Non-Refundable"
                accent="text-slate-400"
              />
            </div>

            {/* ── Passengers ────────────────────────────────────────── */}
            <div className="px-8 py-8 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-5">
                <User className="w-4 h-4 text-blue-500" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Passengers ({booking.passenger.length})
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {booking.passenger.map((name, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100"
                  >
                    <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-black text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{name}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passenger {i + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Action Buttons ────────────────────────────────────── */}
            <div className="px-8 py-8 bg-slate-50/50 print:hidden">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Download className="w-5 h-5" />
                  Download Ticket
                </button>
                <button
                  onClick={handleMyBookings}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Armchair className="w-5 h-5" />
                  My Bookings
                </button>
                <button
                  onClick={() => { resetBooking(); navigate('/'); }}
                  className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </button>
              </div>
            </div>
          </div>

          {/* ── Additional Info ──────────────────────────────────────── */}
          {isConfirmed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden"
            >
              {[
                { icon: '📧', title: 'E-Ticket Sent', desc: 'Check your inbox for the e-ticket PDF.' },
                { icon: '📱', title: 'SMS Notification', desc: 'A booking confirmation SMS has been sent.' },
                { icon: '🧳', title: 'Check-in Opens', desc: 'Web check-in opens 48 hours before departure.' },
              ].map((item) => (
                <div key={item.title} className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10 text-center">
                  <p className="text-2xl mb-2">{item.icon}</p>
                  <p className="text-sm font-black text-white">{item.title}</p>
                  <p className="text-xs text-white/50 font-medium mt-1">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Confirmation;
