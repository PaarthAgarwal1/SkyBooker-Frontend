import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronDown,
  AlertCircle,
  Calendar as CalendarIcon,
  MapPin
} from 'lucide-react';
import { staffApi, Flight } from '@shared/api/staff';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import FlightTable from '@components/staff/FlightTable';
import { useAuthStore } from '@store/authStore';

const FlightList: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    date: '',
    origin: '',
    destination: ''
  });
  
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const airlineId = user?.airlineId || '';
      const res = await staffApi.getAllFlights(airlineId);
      if (res.data) setFlights(res.data);
    } catch (error) {
      toast.error('Failed to load flights');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handleDelete = async () => {
    if (!selectedFlight) return;
    try {
      await staffApi.deleteFlight(selectedFlight.flightId);
      toast.success('Flight deleted successfully');
      setFlights(prev => prev.filter(f => f.flightId !== selectedFlight.flightId));
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete flight');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await staffApi.updateFlightStatus(id, newStatus as any);
      setFlights(prev => prev.map(f => f.flightId === id ? { ...f, status: newStatus as any } : f));
      toast.success('Flight status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredFlights = flights.filter(f => {
    const matchesSearch = f.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
                         f.originAirportCode.toLowerCase().includes(search.toLowerCase()) ||
                         f.destinationAirportCode.toLowerCase().includes(search.toLowerCase());
    
    const matchesOrigin = !filters.origin || f.originAirportCode.toLowerCase().includes(filters.origin.toLowerCase());
    const matchesDest = !filters.destination || f.destinationAirportCode.toLowerCase().includes(filters.destination.toLowerCase());
    const matchesDate = !filters.date || f.departureTime.includes(filters.date);

    return matchesSearch && matchesOrigin && matchesDest && matchesDate;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Flight Operations</h2>
          <p className="text-slate-500 font-medium mt-1">Manage schedules, update statuses and monitor your fleet.</p>
        </div>
        <button 
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[2rem] font-black transition-all shadow-xl shadow-blue-100 self-start"
          onClick={() => (window.location.href = '/staff/flights/add')}
        >
          <Plus className="w-5 h-5" />
          Add New Flight
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by flight number, origin or destination..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Origin"
                className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none w-32 focus:ring-2 focus:ring-blue-500/20"
                value={filters.origin}
                onChange={(e) => setFilters({...filters, origin: e.target.value})}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Dest"
                className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none w-32 focus:ring-2 focus:ring-blue-500/20"
                value={filters.destination}
                onChange={(e) => setFilters({...filters, destination: e.target.value})}
              />
            </div>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="date" 
                className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                value={filters.date}
                onChange={(e) => setFilters({...filters, date: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <FlightTable 
        flights={filteredFlights} 
        loading={loading}
        onViewSeats={(id) => window.location.href = `/staff/seats/${id}`}
        onEdit={(id) => window.location.href = `/staff/flights/edit/${id}`}
        onDelete={(id) => {
          setSelectedFlight(flights.find(f => f.flightId === id) || null);
          setShowDeleteModal(true);
        }}
        onStatusChange={handleStatusChange}
      />

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100"
            >
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 text-center mb-4 tracking-tight">Remove Flight?</h3>
              <p className="text-slate-500 text-center mb-10 font-medium leading-relaxed">
                Are you sure you want to delete flight <span className="text-slate-900 font-black">{selectedFlight?.flightNumber}</span>? 
                This action is permanent and will cancel all active bookings.
              </p>
              <div className="flex gap-4">
                <button 
                  className="flex-1 px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold transition-all border border-slate-100"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-rose-200"
                  onClick={handleDelete}
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlightList;
