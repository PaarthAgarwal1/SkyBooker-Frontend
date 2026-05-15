import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Plane, ChevronRight, Loader2, 
  Search, Calendar, MapPin, Tag, Users,
  ArrowRight, ShieldCheck, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { passengerApi, MyBookingSummary } from '../../shared/api/passenger';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { formatINR } from '../../shared/utils/currency';
import toast from 'react-hot-toast';

const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<MyBookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');

  useEffect(() => {
    if (user?.userId) {
      fetchBookings();
    }
  }, [user?.userId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await passengerApi.getMyBookings(user!.userId);
      setBookings(res.data);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      toast.error('Could not load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const isCancelled = b.status === 'CANCELLED';
    const departureDate = b.departureTime ? new Date(b.departureTime) : new Date();
    const isPast = departureDate < new Date();

    if (filter === 'CANCELLED') return isCancelled;
    if (isCancelled) return false;
    
    if (filter === 'UPCOMING') return !isPast;
    if (filter === 'COMPLETED') return isPast;
    
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-32">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Briefcase className="w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Journeys</h1>
            </motion.div>
            <p className="text-slate-500 font-medium max-w-lg">
              Manage your upcoming trips, view past flight history, and access your boarding passes all in one place.
            </p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
            {(['UPCOMING', 'COMPLETED', 'CANCELLED'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === t 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm animate-pulse">
                <div className="flex justify-between mb-8">
                  <div className="w-24 h-4 bg-slate-100 rounded-full" />
                  <div className="w-16 h-4 bg-slate-100 rounded-full" />
                </div>
                <div className="w-full h-8 bg-slate-50 rounded-xl mb-6" />
                <div className="space-y-3 mb-8">
                  <div className="w-3/4 h-3 bg-slate-100 rounded-full" />
                  <div className="w-1/2 h-3 bg-slate-100 rounded-full" />
                </div>
                <div className="pt-6 border-t border-slate-50 flex justify-between">
                  <div className="w-20 h-6 bg-slate-100 rounded-full" />
                  <div className="w-10 h-10 bg-slate-50 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  variants={itemVariants}
                  layout
                  onClick={() => navigate(`/booking/${booking.id}`)}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all cursor-pointer group relative overflow-hidden flex flex-col"
                >
                  {/* Glassmorphism accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-100/50 transition-colors" />

                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        booking.status === 'CONFIRMED' ? 'bg-emerald-500 animate-pulse' :
                        booking.status === 'CANCELLED' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {booking.status}
                      </span>
                    </div>
                    <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-900 tracking-widest font-mono">
                        {booking.pnr}
                      </span>
                    </div>
                  </div>

                  {/* Route */}
                  <div className="mb-8 flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Plane className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Route</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                          {booking.route}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-6">
                      <div>
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                          <Users className="w-3 h-3" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Passengers</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {booking.passenger.slice(0, 2).map((p, i) => (
                            <span key={i} className="text-[9px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                              {p.split(' ')[0]}
                            </span>
                          ))}
                          {booking.passenger.length > 2 && (
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                              +{booking.passenger.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fare Paid</p>
                      <p className="text-2xl font-black text-slate-900">{formatINR(booking.amount)}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-blue-200 group-hover:-translate-x-1">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm text-center px-12"
          >
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-200">
              <Search className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No {filter.toLowerCase()} journeys</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10">
              It looks like you don't have any {filter.toLowerCase()} bookings at the moment. Time to plan your next escape?
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-3 hover:-translate-y-1"
            >
              <Search className="w-5 h-5" />
              Explore Flights
            </button>
          </motion.div>
        )}
      </div>

      {/* Trust Badge */}
      <div className="max-w-7xl mx-auto px-6 mt-16 flex justify-center">
        <div className="bg-white px-8 py-4 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-3 text-slate-400">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">Safe & Secure Booking Management</span>
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
