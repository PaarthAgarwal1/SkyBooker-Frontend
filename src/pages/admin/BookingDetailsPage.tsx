import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi, BookingDetails } from '@shared/api/admin';
import {
  ArrowLeft,
  Plane,
  User,
  CreditCard,
  Mail,
  Phone,
  Download,
  XCircle,
  CheckCircle,
  Clock,
  Briefcase,
  Utensils,
  MapPin,
  Calendar
} from 'lucide-react';

const BookingDetailsPage: React.FC = () => {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookingDetails = useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      const res = await adminApi.getBookingById(bookingId);
      console.log("Response:", res);
      if (res.error) {
        setError(res.error);
      } else {
        setBooking(res.data);
      }
    } catch (err) {
      setError('Failed to fetch booking details.');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchBookingDetails();
  }, [fetchBookingDetails]);

  const handleCancel = useCallback(async () => {
    if (!bookingId || !window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      setIsCancelling(true);
      await adminApi.cancelBooking(bookingId);
      fetchBookingDetails(); // Refresh
    } catch (err) {
      alert('Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  }, [bookingId, fetchBookingDetails]);

  const maskPassport = (passport: string) => {
    if (!passport) return 'N/A';
    if (passport.length <= 4) return passport;
    return 'XXXX' + passport.slice(-4);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'PENDING': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error || !booking) return <ErrorState error={error} onBack={() => navigate('/admin/bookings')} />;

  const [origin, destination] = booking.route.includes('→') ? booking.route.split('→').map(s => s.trim()) : [booking.route, ''];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/admin/bookings')}
              className="group p-3 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all"
            >
              <ArrowLeft size={20} className="text-slate-600 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">PNR: {booking.pnr}</h1>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(booking.status)} flex items-center gap-1.5 shadow-sm`}>
                  {booking.status === 'CONFIRMED' ? <CheckCircle size={12} /> : booking.status === 'CANCELLED' ? <XCircle size={12} /> : <Clock size={12} />}
                  {booking.status}
                </div>
              </div>
              <p className="text-slate-500 font-bold text-xs flex items-center gap-2">
                <Calendar size={12} />
                Booked on {new Date(booking.bookedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex-1 md:flex-none px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/20 text-slate-700 rounded-2xl font-bold shadow-sm hover:shadow-md hover:bg-white transition-all flex items-center justify-center gap-2 text-sm">
              <Download size={18} />
              <span>Download Ticket</span>
            </button>
            {booking.status === 'CONFIRMED' && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 md:flex-none px-6 py-3 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isCancelling ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <XCircle size={18} />}
                <span>Cancel Booking</span>
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* JOURNEY & PASSENGERS */}
          <div className="lg:col-span-2 space-y-8">

            {/* FLIGHT JOURNEY CARD */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                <div className="text-center md:text-left">
                  <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{origin}</h4>
                  <p className="text-slate-400 font-bold text-sm mt-1">{new Date(booking.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                <div className="flex-1 flex flex-col items-center max-w-[200px]">
                  <div className="w-full h-[1.5px] bg-slate-200 relative mb-2">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-slate-100 rounded-full flex items-center justify-center text-primary shadow-sm">
                      <Plane size={16} className="rotate-45" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{booking.airline}</p>
                </div>

                <div className="text-center md:text-right">
                  <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{destination}</h4>
                  <p className="text-slate-400 font-bold text-sm mt-1">{new Date(booking.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10 pt-8 border-t border-slate-100/50">
                <div className="bg-slate-50/50 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Utensils size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Meal Preference</p>
                    <p className="font-bold text-slate-700 text-sm">{booking.mealPreference}</p>
                  </div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Checked Luggage</p>
                    <p className="font-bold text-slate-700 text-sm">{booking.luggageKg} KG</p>
                  </div>
                </div>
              </div>
            </div>

            {/* PASSENGERS SECTION */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-slate-50">
                  <User size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Passenger Details</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Full Name</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Gender</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Seat</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-2">Passport</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {booking.passengers.map((p, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 pl-2 font-bold text-slate-900">{p.name}</td>
                        <td className="py-5 text-center text-sm font-bold text-slate-500 uppercase tracking-widest">{p.gender}</td>
                        <td className="py-5 text-center">
                          <span className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-xs font-black shadow-sm border border-primary/10">
                            {p.seatNumber}
                          </span>
                        </td>
                        <td className="py-5 text-right pr-2 font-mono text-xs text-slate-500 font-bold">
                          {maskPassport(p.passportNumber)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SIDEBAR: FARE & CONTACT */}
          <div className="space-y-8">

            {/* FARE SUMMARY CARD */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-50">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Fare Summary</h3>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between text-sm font-bold text-slate-400">
                  <span>Base Fare</span>
                  <span>${booking.baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-400">
                  <span>Taxes & Fees</span>
                  <span>${booking.taxes.toLocaleString()}</span>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-end">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">${booking.totalFare.toLocaleString()}</span>
                </div>

                <div className="mt-8 px-5 py-3 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  <CheckCircle size={14} />
                  Payment Completed
                </div>
              </div>
            </div>

            {/* CONTACT INFORMATION CARD */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                Contact Details
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl text-slate-400 shadow-sm border border-slate-50">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                    <p className="font-bold text-slate-900 text-sm truncate" title={booking.contactEmail}>{booking.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl text-slate-400 shadow-sm border border-slate-50">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                    <p className="font-bold text-slate-900 text-sm">{booking.contactPhone}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

/* ================= HELPERS ================= */

const LoadingSkeleton = () => (
  <div className="max-w-6xl mx-auto space-y-8 animate-pulse pt-4">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
        <div className="h-4 w-48 bg-slate-200 rounded-lg"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="h-64 bg-slate-200 rounded-[2.5rem]"></div>
        <div className="h-96 bg-slate-200 rounded-[2.5rem]"></div>
      </div>
      <div className="space-y-8">
        <div className="h-48 bg-slate-200 rounded-[2.5rem]"></div>
        <div className="h-48 bg-slate-200 rounded-[2.5rem]"></div>
      </div>
    </div>
  </div>
);

const ErrorState = ({ error, onBack }: { error: string | null, onBack: () => void }) => (
  <div className="max-w-xl mx-auto mt-20 p-12 bg-white/70 backdrop-blur-xl border border-white/20 rounded-[3rem] text-center shadow-xl">
    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
      <XCircle size={40} />
    </div>
    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Booking Not Found</h2>
    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
      {error || "We couldn't retrieve the details for this booking. It might have been deleted or the ID is incorrect."}
    </p>
    <button
      onClick={onBack}
      className="bg-primary text-white px-10 py-4 rounded-full font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all"
    >
      Back to Bookings
    </button>
  </div>
);

export default BookingDetailsPage;
