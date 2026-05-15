import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Ticket,
  ArrowLeft,
  Search,
  Users,
  Plane,
  ChevronDown,
  DollarSign,
  IndianRupee
} from 'lucide-react';
import { staffApi, Flight, Booking } from '@shared/api/staff';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';

const FlightBookings: React.FC = () => {
  const { flightId: urlFlightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<string>(urlFlightId || '');
  const [bookings, setBookings] = useState<Booking[]>([]);

  // ✅ Fetch Flights
  useEffect(() => {
    const fetchFlights = async () => {
      if (!user?.airlineId) return;
      try {
        const res = await staffApi.getAllFlights(user.airlineId);
        if (res.data) setFlights(res.data);
      } catch {
        toast.error('Failed to load flights');
      }
    };
    fetchFlights();
  }, [user]);

  // ✅ Fetch Bookings
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        let res;
        if (selectedFlightId) {
          res = await staffApi.getBookingsByFlight(selectedFlightId);
        } else {
          res = await staffApi.getAllBookings();
        }

        if (res.data) {
          // ✅ Sanitize data (VERY IMPORTANT)
          const safeData = res.data.map((b: any) => ({
            ...b,
            bookingId: b.bookingId || b.id || '',
            pnr: b.pnr || '',
            passengers: b.passengers?.length ? b.passengers : (b.passenger || []),
            totalFare: b.totalFare || b.amount || 0,
            bookedAt: b.bookedAt || ''
          }));
          console.log(safeData);
          setBookings(safeData);
        }
      } catch {
        toast.error('Failed to load bookings');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();

    // ✅ Sync URL
    if (selectedFlightId && selectedFlightId !== urlFlightId) {
      navigate(`/staff/bookings/${selectedFlightId}`, { replace: true });
    } else if (!selectedFlightId && urlFlightId) {
      navigate(`/staff/bookings`, { replace: true });
    }

  }, [selectedFlightId]);

  const handleFlightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFlightId(e.target.value);
  };

  // ✅ Safe Filtering
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch =
        (b.pnr?.toLowerCase().includes(search.toLowerCase()) || false) ||
        (b.bookingId?.toLowerCase().includes(search.toLowerCase()) || false);

      const matchesDate =
        filterDate
          ? b.bookedAt?.startsWith(filterDate)
          : true;

      return matchesSearch && matchesDate;
    });
  }, [bookings, search, filterDate]);

  // ✅ Revenue Calculation
  const totalRevenue = useMemo(() => {
    return filteredBookings.reduce((sum, b) => sum + (b.totalFare || 0), 0);
  }, [filteredBookings]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header & Revenue Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/staff/dashboard')}
            className="p-3 bg-white hover:bg-slate-50 rounded-2xl text-slate-400 transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bookings Manager</h2>
            <p className="text-slate-500 font-medium mt-1">Track and filter passenger reservations.</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white flex items-center gap-5 shadow-lg shadow-blue-200 min-w-[240px]">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <IndianRupee className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Total Revenue</p>
            <p className="text-2xl font-black tracking-tight">₹{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row gap-6">
        {/* Flight Selection */}
        <div className="flex-1 relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Filter by Flight</label>
          <div className="relative">
            <Plane className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <select
              value={selectedFlightId}
              onChange={handleFlightChange}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-3.5 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">All Flights</option>
              {flights.map(f => (
                <option key={f.flightId} value={f.flightId}>
                  {f.flightNumber} ({f.originAirportCode} → {f.destinationAirportCode})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Search Bookings</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by PNR or Booking ID..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex-1 relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Filter by Date</label>
          <div className="relative">
            <input
              type="date"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking PNR</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Flight Number</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Passengers</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Booking Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-5">
                      <div className="h-6 bg-slate-100 rounded-xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <Ticket className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">No Bookings Found</h3>
                    <p className="text-slate-400 font-medium mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, idx) => (
                  <motion.tr
                    key={booking.bookingId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/staff/manifest/${booking.flightId}`)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{booking.pnr || 'N/A'}</p>
                          <p className="text-[10px] font-bold text-slate-400 font-mono">ID: {booking.bookingId?.split('-')[0] || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900">
                        {flights.find(f => f.flightId === booking.flightId)?.flightNumber || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">{booking.route}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-600 font-bold">
                        <Users className="w-4 h-4 text-slate-400" />
                        {booking.passengers?.length || 0}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-black text-emerald-600">₹{booking.totalFare?.toFixed(2) || '0.00'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' :
                        booking.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                        {booking.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-600">{booking.bookedAt ? format(new Date(booking.bookedAt), 'MMM dd, yyyy') : 'N/A'}</p>
                      <p className="text-xs text-slate-400 font-medium">{booking.bookedAt ? format(new Date(booking.bookedAt), 'h:mm a') : ''}</p>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FlightBookings;