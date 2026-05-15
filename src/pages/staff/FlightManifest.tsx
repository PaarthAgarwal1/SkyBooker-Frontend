import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Download,
  Search,
  User,
  Shield,
  Plane,
  ChevronDown,
  Printer,
  FileText
} from 'lucide-react';
import { staffApi, Flight, Seat, PassengerResponse } from '@shared/api/staff';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';

interface ManifestEntry {
  passengerId: string;
  bookingId: string;
  seatNumber: string;
  name: string;
  gender: string;
  passportNumber: string;
  nationality: string;
  passengerType: string;
  ticketNumber: string;
  status: 'CONFIRMED' | 'HELD' | 'AVAILABLE';
  seatClass: string;
}

const FlightManifest: React.FC = () => {
  const { flightId: urlFlightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const printRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<string>(urlFlightId || '');
  const [manifestEntries, setManifestEntries] = useState<ManifestEntry[]>([]);
  const [totalSeats, setTotalSeats] = useState(0);
  const [availableSeats, setAvailableSeats] = useState(0);

  // Fetch Flights for Dropdown
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

  // Fetch Manifest Data using Passenger Service
  useEffect(() => {
    const fetchManifestData = async () => {
      if (!selectedFlightId) {
        setManifestEntries([]);
        setTotalSeats(0);
        setAvailableSeats(0);
        return;
      }

      setLoading(true);
      try {
        const [passengersRes, seatsRes] = await Promise.all([
          staffApi.getPassengersByFlight(selectedFlightId),
          staffApi.getSeatMap(selectedFlightId)
        ]);

        const passengers: PassengerResponse[] = passengersRes.data || [];
        const seats: Seat[] = seatsRes.data || [];

        setTotalSeats(seats.length);
        setAvailableSeats(seats.filter(s => s.status === 'AVAILABLE').length);

        // Combine passenger data with seat data
        const entries: ManifestEntry[] = seats
          .filter(s => s.status === 'CONFIRMED' || s.status === 'HELD')
          .map(seat => {
            const pax = passengers.find(p => p.seatNumber === seat.seatNumber);
            return {
              passengerId: pax?.passengerId || '',
              bookingId: pax?.bookingId || '',
              seatNumber: seat.seatNumber,
              name: pax ? `${pax.title} ${pax.firstName} ${pax.lastName}` : 'Unknown',
              gender: pax?.gender || 'N/A',
              passportNumber: pax?.passportNumber || 'N/A',
              nationality: pax?.nationality || 'N/A',
              passengerType: pax?.passengerType || 'ADULT',
              ticketNumber: pax?.ticketNumber || 'N/A',
              status: seat.status as 'CONFIRMED' | 'HELD',
              seatClass: seat.seatClass
            };
          });

        setManifestEntries(entries);
      } catch (error) {
        toast.error('Failed to load manifest data');
        setManifestEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchManifestData();

    // Sync URL
    if (selectedFlightId && selectedFlightId !== urlFlightId) {
      navigate(`/staff/manifest/${selectedFlightId}`, { replace: true });
    } else if (!selectedFlightId && urlFlightId) {
      navigate(`/staff/manifest`, { replace: true });
    }
  }, [selectedFlightId]);

  const handleFlightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFlightId(e.target.value);
  };

  const filteredEntries = useMemo(() => {
    return manifestEntries.filter(entry =>
      entry.name.toLowerCase().includes(search.toLowerCase()) ||
      entry.passportNumber.toLowerCase().includes(search.toLowerCase()) ||
      entry.seatNumber.toLowerCase().includes(search.toLowerCase()) ||
      entry.ticketNumber.toLowerCase().includes(search.toLowerCase())
    );
  }, [manifestEntries, search]);

  const handlePrint = () => {
    window.print();
  };

  const groupedManifest = useMemo(() => {
    const groups: { [key: string]: ManifestEntry[] } = {
      'FIRST_CLASS': [],
      'BUSINESS': [],
      'ECONOMY': []
    };

    filteredEntries.forEach(entry => {
      if (groups[entry.seatClass]) {
        groups[entry.seatClass].push(entry);
      } else {
        groups['ECONOMY'].push(entry);
      }
    });

    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        const rowA = parseInt(a.seatNumber) || 0;
        const rowB = parseInt(b.seatNumber) || 0;
        if (rowA !== rowB) return rowA - rowB;
        return a.seatNumber.localeCompare(b.seatNumber);
      });
    });

    return groups;
  }, [filteredEntries]);

  const totalPassengers = manifestEntries.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 print:hidden">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/staff/dashboard')}
            className="p-3 bg-white hover:bg-slate-50 rounded-2xl text-slate-400 transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Passenger Manifest</h2>
            <p className="text-slate-500 font-medium mt-1">Flight operations and safety roster.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            disabled={!selectedFlightId || manifestEntries.length === 0}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-2xl transition-all shadow-sm border border-slate-200 font-bold disabled:opacity-50"
          >
            <Printer className="w-5 h-5" />
            Print Manifest
          </button>
          <button
            onClick={handlePrint}
            disabled={!selectedFlightId || manifestEntries.length === 0}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-blue-200 font-bold disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Flight Selection & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row gap-6">
          {/* Flight Selection */}
          <div className="flex-1 relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Flight</label>
            <div className="relative">
              <Plane className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={selectedFlightId}
                onChange={handleFlightChange}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">Choose a flight...</option>
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
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Search Passengers</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search name, ticket, passport..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-slate-900 font-bold placeholder:font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white shadow-xl flex flex-col justify-center">
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-700">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pax</p>
              <p className="text-2xl font-black">{selectedFlightId ? totalPassengers : '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seats</p>
              <p className="text-2xl font-black">{selectedFlightId ? totalSeats : '-'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Avail</p>
              <p className="text-2xl font-black text-emerald-400">{selectedFlightId ? availableSeats : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Manifest Content */}
      <div ref={printRef} className="print:block print:m-0 print:p-0">
        {/* Print Header */}
        <div className="hidden print:block mb-8 text-center">
          <h1 className="text-3xl font-black text-black">FLIGHT MANIFEST</h1>
          <p className="text-lg text-gray-600 mt-2">
            Flight ID: {selectedFlightId} | Total Pax: {totalPassengers}
          </p>
          <hr className="my-6 border-black" />
        </div>

        {!selectedFlightId ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-24 text-center print:hidden">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Flight Selected</h3>
            <p className="text-slate-500 mt-2">Please select a flight to view its passenger manifest.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-[2.5rem] border border-slate-100 print:hidden">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : manifestEntries.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-24 text-center print:hidden">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No Passengers Found</h3>
            <p className="text-slate-500 mt-2">No passengers match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedManifest).map(([className, passengers]) => {
              if (passengers.length === 0) return null;

              return (
                <div key={className} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm print:border-none print:shadow-none">
                  <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3 print:bg-gray-100 print:border-black print:border-b-2">
                    <Shield className={`w-5 h-5 ${className === 'FIRST_CLASS' ? 'text-amber-500' : className === 'BUSINESS' ? 'text-blue-500' : 'text-slate-500'}`} />
                    <h3 className="text-sm font-black text-slate-900 tracking-wider">
                      {className.replace('_', ' ')} CLASS
                    </h3>
                    <span className="ml-auto text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 print:hidden">
                      {passengers.length} Pax
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse print:text-sm">
                      <thead className="bg-white border-b border-slate-100 print:border-black">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black">Seat</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black">Passenger Name</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black">Type</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black">Passport</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black">Ticket / Ref</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest print:text-black">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 print:divide-gray-300">
                        {passengers.map((pax, idx) => (
                          <motion.tr
                            key={`${pax.seatNumber}-${idx}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="w-10 h-10 bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center font-black print:bg-transparent print:w-auto print:h-auto">
                                {pax.seatNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 print:hidden">
                                  <User className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900">{pax.name}</span>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest md:hidden">{pax.passengerType}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                                {pax.passengerType}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-bold text-sm uppercase">{pax.passportNumber}</span>
                              </div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{pax.nationality}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-black text-slate-900">{pax.ticketNumber}</p>
                              <p className="text-[9px] font-bold text-slate-400 font-mono">BKR: {pax.bookingId?.split('-')[0]}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest print:bg-transparent print:p-0 ${
                                pax.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 print:text-black' : 'bg-amber-50 text-amber-600 print:text-black'
                              }`}>
                                {pax.status}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightManifest;
