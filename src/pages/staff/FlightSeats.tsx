import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Info,
  Plane as PlaneIcon,
  LayoutGrid,
  ChevronDown
} from 'lucide-react';
import { staffApi, Seat, Flight } from '@shared/api/staff';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';

const FlightSeats: React.FC = () => {
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [flights, setFlights] = useState<Flight[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [availableCount, setAvailableCount] = useState(0);

  // Active seat for context menu
  const [activeSeat, setActiveSeat] = useState<Seat | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchFlights = async () => {
      if (!user?.airlineId) return;
      try {
        const res = await staffApi.getAllFlights(user.airlineId);
        if (res.data) setFlights(res.data);
      } catch (error) {
        toast.error('Failed to load flights');
      } finally {
        setLoadingFlights(false);
      }
    };
    fetchFlights();
  }, [user]);

  const fetchSeatData = async (id: string) => {
    setLoading(true);
    setActiveSeat(null);
    try {
      const [seatMapRes, countRes] = await Promise.all([
        staffApi.getSeatMap(id),
        staffApi.getSeatCount(id)
      ]);
      if (seatMapRes.data) setSeats(seatMapRes.data);
      if (countRes.data !== undefined) setAvailableCount(countRes.data);
    } catch (error) {
      toast.error('Failed to load seat data');
      setSeats([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (flightId) {
      fetchSeatData(flightId);
    } else {
      setSeats([]);
    }
  }, [flightId]);

  const handleFlightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId) {
      navigate(`/staff/seats/${selectedId}`);
    } else {
      navigate(`/staff/seats`);
    }
  };

  const handleAction = async (action: 'hold' | 'confirm' | 'release', seatId: string) => {
    setActionLoading(true);
    try {
      if (action === 'hold') await staffApi.holdSeat(seatId);
      if (action === 'confirm') await staffApi.confirmSeat(seatId);
      if (action === 'release') await staffApi.releaseSeat(seatId);

      toast.success(`Seat ${action} successful`);
      if (flightId) fetchSeatData(flightId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${action} seat`);
    } finally {
      setActionLoading(false);
      setActiveSeat(null);
    }
  };

  const rows: { [key: string]: Seat[] } = {};
  seats.forEach(seat => {
    const rowNum = seat.seatNumber.replace(/[A-Z]/, '');
    if (!rows[rowNum]) rows[rowNum] = [];
    rows[rowNum].push(seat);
  });
  const sortedRowKeys = Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header & Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/staff/dashboard')}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Seat Management</h2>
            <p className="text-slate-500 font-medium mt-1">Select a flight to view and manage seating</p>
          </div>
        </div>

        <div className="flex-1 max-w-md relative">
          <PlaneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <select
            value={flightId || ''}
            onChange={handleFlightChange}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="">{loadingFlights ? 'Loading flights...' : 'Select a flight...'}</option>
            {flights.map(f => (
              <option key={f.flightId} value={f.flightId}>
                {f.flightNumber} ({f.originAirportCode} → {f.destinationAirportCode})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
        </div>
      </div>

      {!flightId ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-24 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <LayoutGrid className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Flight Selected</h3>
          <p className="text-slate-500 mt-2">Please select a flight from the dropdown above to view its seat map.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-[2.5rem] border border-slate-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : seats.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-24 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
            <Info className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Seats Configured</h3>
          <p className="text-slate-500 mt-2">This flight doesn't have a seat map yet.</p>
          <button
            onClick={() => navigate(`/staff/flights/${flightId}/add-seats`)}
            className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all"
          >
            Setup Grid Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-md shadow-emerald-100"></div>
                <span className="text-sm font-bold text-slate-600">Available ({availableCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500 shadow-md shadow-amber-100"></div>
                <span className="text-sm font-bold text-slate-600">Held</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-rose-500 shadow-md shadow-rose-100"></div>
                <span className="text-sm font-bold text-slate-600">Booked</span>
              </div>
            </div>

            <div className="text-slate-400 font-bold text-sm">
              Total Seats: {seats.length}
            </div>
          </div>

          <div className="flex flex-col gap-4 items-center">
            {sortedRowKeys.map(rowKey => (
              <div key={rowKey} className="flex items-center gap-6">
                <div className="w-8 text-[10px] font-black text-slate-400 uppercase text-right">{rowKey}</div>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                  {rows[rowKey].sort((a, b) => a.seatNumber.localeCompare(b.seatNumber)).map((seat, idx) => {
                    const isAisle = idx === Math.floor(rows[rowKey].length / 2);
                    const colorClass = seat.status === 'AVAILABLE' ? 'bg-emerald-500 shadow-md shadow-emerald-100' :
                      seat.status == 'CONFIRMED' ? 'bg-rose-500 shadow-md shadow-rose-100 opacity-70' :
                        'bg-amber-500 shadow-md shadow-amber-100';

                    return (
                      <React.Fragment key={seat.seatId}>
                        {isAisle && <div className="w-6 h-10 flex items-center justify-center text-slate-300 font-bold">|</div>}
                        <div className="relative group">
                          <button
                            onClick={() => setActiveSeat(activeSeat?.seatId === seat.seatId ? null : seat)}
                            className={`
                              w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white text-xs font-black transition-transform hover:scale-105 cursor-pointer relative
                              ${colorClass}
                              ${activeSeat?.seatId === seat.seatId ? 'ring-4 ring-blue-500/30 scale-105 z-10' : ''}
                            `}
                          >
                            {seat.seatNumber.slice(-1)}
                          </button>

                          {/* Hover Tooltip (hidden if active) */}
                          {activeSeat?.seatId !== seat.seatId && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-36 bg-slate-900 text-white p-3 rounded-2xl text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 shadow-xl text-center">
                              <p className="font-black text-sm mb-1">{seat.seatNumber}</p>
                              <p className="text-slate-300 font-medium mb-1">{seat.seatClass}</p>
                              <div className="flex justify-between items-center border-t border-slate-700 pt-2 mt-2">
                                <span className="text-slate-400">Multiplier</span>
                                <span className="text-blue-400 font-bold">{seat.priceMultiplier}x</span>
                              </div>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-slate-400">Total</span>
                                <span className="text-emerald-400 font-bold">
                                  ${Math.round(seat.priceMultiplier * (flights.find(f => f.flightId === flightId)?.basePrice || 0))}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Action Menu (shown if active) */}
                          <AnimatePresence>
                            {activeSeat?.seatId === seat.seatId && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 bg-white border border-slate-200 p-2 rounded-2xl z-50 shadow-2xl flex flex-col gap-1"
                              >
                                <div className="text-center pb-2 mb-1 border-b border-slate-100">
                                  <span className="text-xs font-black text-slate-900">{seat.seatNumber}</span>
                                  <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${seat.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600' : seat.status === 'HELD' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {seat.status}
                                  </span>
                                </div>

                                {seat.status === 'AVAILABLE' && (
                                  <>
                                    <button onClick={() => handleAction('hold', seat.seatId)} disabled={actionLoading} className="text-xs font-bold py-2 px-3 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 text-left transition-colors">Hold Seat</button>
                                    <button onClick={() => handleAction('confirm', seat.seatId)} disabled={actionLoading} className="text-xs font-bold py-2 px-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-left transition-colors">Book Seat</button>
                                  </>
                                )}
                                {seat.status === 'HELD' && (
                                  <>
                                    <button onClick={() => handleAction('confirm', seat.seatId)} disabled={actionLoading} className="text-xs font-bold py-2 px-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-left transition-colors">Confirm Booking</button>
                                    <button onClick={() => handleAction('release', seat.seatId)} disabled={actionLoading} className="text-xs font-bold py-2 px-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 text-left transition-colors">Release Seat</button>
                                  </>
                                )}
                                {seat.status === 'CONFIRMED' && (
                                  <button onClick={() => handleAction('release', seat.seatId)} disabled={actionLoading} className="text-xs font-bold py-2 px-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 text-left transition-colors">Cancel Booking</button>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightSeats;
