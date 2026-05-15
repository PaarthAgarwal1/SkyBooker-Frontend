import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plane, Clock, MapPin, Calendar, Info, 
  ArrowLeft, CreditCard, ShieldCheck, 
  AlertCircle, Loader2, Wind, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { passengerApi } from '../../shared/api/passenger';
import { Flight } from '../../shared/api/staff';
import { formatINR } from '../../shared/utils/currency';
import toast from 'react-hot-toast';

// ─── Status Badge Component ────────────────────────────────────────────────
const FlightStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const configs: Record<string, { bg: string, text: string }> = {
    ON_TIME: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700' },
    DELAYED: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700' },
    CANCELLED: { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-700' },
    BOARDING: { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700' },
  };

  const config = configs[status] || configs.ON_TIME;

  return (
    <div className={`${config.bg} ${config.text} border px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest`}>
      {status.replace('_', ' ')}
    </div>
  );
};

// ─── Info Card Component ───────────────────────────────────────────────────
const FlightInfoCard: React.FC<{ title: string, icon: any, value: string, sub?: string }> = ({ title, icon: Icon, value, sub }) => (
  <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
    <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
    {sub && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub}</p>}
  </div>
);

const FlightDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchFlight();
  }, [id]);

  const fetchFlight = async () => {
    setLoading(true);
    try {
      const res = await passengerApi.getFlightDetails(id!);
      setFlight(res.data);
    } catch (err: any) {
      toast.error('Failed to load flight details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Retrieving Flight Data...</p>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-12 max-w-lg w-full text-center shadow-xl">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Flight Not Found</h2>
          <p className="text-slate-500 font-medium mb-8">The flight you are looking for might have been moved or cancelled.</p>
          <button onClick={() => navigate(-1)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold w-full">Go Back</button>
        </div>
      </div>
    );
  }

  const depTime = new Date(flight.departureTime);
  const arrTime = new Date(flight.arrivalTime);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-32">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="mb-10 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm uppercase tracking-widest">Back to Search</span>
        </button>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden mb-10 shadow-2xl shadow-slate-900/20"
        >
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Plane className="w-full h-full rotate-45 scale-150" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <div className="px-5 py-2 bg-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest">
                {flight.airlineName}
              </div>
              <div className="px-5 py-2 bg-white/10 rounded-2xl text-xs font-black uppercase tracking-widest">
                Flight {flight.flightNumber}
              </div>
              <FlightStatusBadge status={flight.status} />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-12">
              <div className="text-center md:text-left">
                <p className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Departure</p>
                <h1 className="text-6xl font-black tracking-tighter mb-2">{flight.originAirportCode}</h1>
                <p className="text-white/60 font-medium">Terminal 3 · Gate 24B</p>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-center gap-4 px-10">
                  <div className="flex-1 h-px bg-white/20" />
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Plane className="w-8 h-8 text-blue-500" />
                  </motion.div>
                  <div className="flex-1 h-px bg-white/20" />
                </div>
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                  {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m Non-stop
                </p>
              </div>

              <div className="text-center md:text-right">
                <p className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Arrival</p>
                <h1 className="text-6xl font-black tracking-tighter mb-2">{flight.destinationAirportCode}</h1>
                <p className="text-white/60 font-medium">Terminal 1 · Gate 12</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Timing Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
              <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-50">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Flight Schedule</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-50 hidden md:block" />
                
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Departure Time</p>
                    <p className="text-4xl font-black text-slate-900">{depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">{depTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 w-fit px-4 py-2 rounded-xl border border-emerald-100">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Check-in Open</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Arrival Time</p>
                    <p className="text-4xl font-black text-slate-900">{arrTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-sm font-bold text-slate-400 mt-1">{arrTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3 text-blue-600 bg-blue-50 w-fit px-4 py-2 rounded-xl border border-blue-100">
                    <Wind className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Optimal Route</span>
                  </div>
                </div>
              </div>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FlightInfoCard title="Aircraft" icon={Plane} value={flight.aircraftType} sub="Modern Fleet" />
              <FlightInfoCard title="Airline" icon={Info} value={flight.airlineName} sub="Premium Service" />
              <FlightInfoCard title="Flight ID" icon={Calendar} value={flight.flightId.slice(0, 8)} sub="Reference Number" />
              <FlightInfoCard title="Available Seats" icon={Wind} value={`${flight.availableSeats} Seats`} sub="Subject to Change" />
            </div>
          </div>

          {/* Pricing Column */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/40 sticky top-32">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Fare Summary</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inclusive of taxes</p>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Price</p>
                    <p className="text-5xl font-black text-blue-600">{formatINR(flight.basePrice)}</p>
                  </div>
                  <div className="text-right pb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Passenger</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Hand baggage included
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Meal service available
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Entertainment on-board
                  </div>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/seat-selection/${flight.flightId}`)}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-base shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group"
              >
                Continue Booking
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6 border-t border-slate-50">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                PCI-DSS Secure Payment
              </div>
            </div>

            <div className="bg-blue-600 rounded-[2rem] p-8 text-white text-center shadow-xl shadow-blue-200/50">
              <h4 className="text-lg font-black mb-2">Member Benefit</h4>
              <p className="text-blue-100 text-xs font-medium leading-relaxed">Login to earn 500 SkyMiles on this flight booking today.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
