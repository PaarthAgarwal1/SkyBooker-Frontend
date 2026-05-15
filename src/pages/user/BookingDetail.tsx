import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plane, User, Calendar, MapPin, 
  Hash, Receipt, AlertCircle, Loader2, 
  Armchair, Utensils, Briefcase, Mail, Phone,
  Clock, ShieldCheck, Download, Trash2, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { passengerApi, BookingDetailResponse } from '../../shared/api/passenger';
import { formatINR } from '../../shared/utils/currency';

// ─── Status Badge Component ────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const configs: Record<string, { bg: string, text: string, icon: any }> = {
    CONFIRMED: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', icon: ShieldCheck },
    PAYMENT_PENDING: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', icon: Clock },
    CANCELLED: { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-700', icon: XCircle },
  };

  const config = configs[status] || { bg: 'bg-slate-50 border-slate-100', text: 'text-slate-600', icon: AlertCircle };
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.text} border px-4 py-2 rounded-xl flex items-center gap-2 w-fit`}>
      <Icon className="w-4 h-4" />
      <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
    </div>
  );
};

// ─── Section Card Component ────────────────────────────────────────────────
const DetailCard: React.FC<{ title: string; icon: any; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-50">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await passengerApi.getBookingDetails(id!);
      setBooking(res.data);
    } catch (err: any) {
      toast.error('Failed to load booking details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;
    
    setCancelling(true);
    try {
      await passengerApi.cancelBooking(id!);
      toast.success('Booking cancelled successfully.');
      fetchDetails();
    } catch (err) {
      toast.error('Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving Ticket Details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-xl">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Booking Not Found</h2>
          <p className="text-slate-500 mb-8 font-medium">We couldn't find the booking you're looking for. It might have been removed or the ID is incorrect.</p>
          <button onClick={() => navigate('/my-bookings')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Back to My Bookings</button>
        </div>
      </div>
    );
  }

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const dep = formatDateTime(booking.departureTime);
  const arr = formatDateTime(booking.arrivalTime);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-32">
      {/* Header Sticky */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/my-bookings')}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <StatusBadge status={booking.status} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Booking ID: {booking.bookingId.slice(0, 8)}</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">PNR: {booking.pnr}</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex-1 md:flex-none px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-sm text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> E-Ticket
            </button>
            {booking.status !== 'CANCELLED' && (
              <button 
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 md:flex-none px-8 py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black text-sm hover:bg-rose-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Flight Info */}
            <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="bg-slate-900 px-10 py-12 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <Plane className="w-48 h-48 rotate-45" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="px-4 py-1.5 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {booking.airline}
                    </div>
                    <div className="px-4 py-1.5 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      Flight {booking.flightId.slice(0, 6)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="text-center md:text-left">
                      <p className="text-5xl font-black mb-2 tracking-tight">{booking.route.split('→')[0].trim()}</p>
                      <p className="text-blue-400 font-black uppercase tracking-widest text-xs">{dep.date}</p>
                      <p className="text-2xl font-black mt-1">{dep.time}</p>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full flex items-center gap-4 px-4">
                        <div className="flex-1 h-px bg-white/20" />
                        <Plane className="w-6 h-6 text-blue-400" />
                        <div className="flex-1 h-px bg-white/20" />
                      </div>
                      <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/40">Direct Flight</p>
                    </div>

                    <div className="text-center md:text-right">
                      <p className="text-5xl font-black mb-2 tracking-tight">{booking.route.split('→')[1].trim()}</p>
                      <p className="text-blue-400 font-black uppercase tracking-widest text-xs">{arr.date}</p>
                      <p className="text-2xl font-black mt-1">{arr.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <DetailCard title="Passenger Details" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {booking.passengers.map((p, i) => (
                  <div key={i} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center text-xl font-black">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{p.name}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                          <Armchair className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seat {p.seatNumber}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.gender}</span>
                        </div>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Passport: {p.passportNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DetailCard>

            {/* Add-ons & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <DetailCard title="In-flight Add-ons" icon={Utensils}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3 text-emerald-700">
                      <Utensils className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">Meal Preference</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{booking.mealPreference}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3 text-blue-700">
                      <Briefcase className="w-5 h-5" />
                      <span className="text-xs font-black uppercase tracking-widest">Checked Luggage</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{booking.luggageKg} KG</span>
                  </div>
                </div>
              </DetailCard>

              <DetailCard title="Contact Information" icon={Mail}>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-slate-900">{booking.contactEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                      <p className="text-sm font-bold text-slate-900">{booking.contactPhone}</p>
                    </div>
                  </div>
                </div>
              </DetailCard>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-10">
            
            {/* Fare Summary */}
            <DetailCard title="Fare Breakdown" icon={Receipt}>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Base Fare</span>
                  <span className="font-bold text-slate-900">{formatINR(booking.baseFare)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Taxes & Fees</span>
                  <span className="font-bold text-slate-900">{formatINR(booking.taxes)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-50">
                  <span className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Total Fare Paid</span>
                  <span className="text-3xl font-black text-blue-600">{formatINR(booking.totalFare)}</span>
                </div>
              </div>
            </DetailCard>

            {/* Booking Timeline */}
            <DetailCard title="Booking Timeline" icon={Clock}>
              <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
                <div className="relative">
                  <div className="absolute -left-8 top-1.5 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reservation Created</p>
                  <p className="text-sm font-bold text-slate-900">{formatDateTime(booking.bookedAt).date} at {formatDateTime(booking.bookedAt).time}</p>
                </div>
                {booking.status === 'CONFIRMED' && (
                  <div className="relative">
                    <div className="absolute -left-8 top-1.5 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-lg" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket Confirmed</p>
                    <p className="text-sm font-bold text-emerald-600">Successfully Processed</p>
                  </div>
                )}
                {booking.status === 'CANCELLED' && (
                  <div className="relative">
                    <div className="absolute -left-8 top-1.5 w-6 h-6 bg-rose-500 rounded-full border-4 border-white shadow-lg" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reservation Cancelled</p>
                    <p className="text-sm font-bold text-rose-600">Refund in Progress</p>
                  </div>
                )}
              </div>
            </DetailCard>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600 opacity-20" />
              <div className="relative z-10 text-center">
                <ShieldCheck className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h4 className="text-lg font-black mb-2">Safe Travels</h4>
                <p className="text-white/50 text-xs font-medium leading-relaxed">Your journey is protected by SkyBooker's travel insurance partners.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
