import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { staffApi } from '@shared/api/staff';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  Plane,
  Settings,
  Grid,
  Save,
  ArrowLeft,
  Info,
  Wand2
} from 'lucide-react';

interface GeneratedSeat {
  seatNumber: string;
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST_CLASS';
  rowNumber: number;
  columnNumber: number;
  isWindow: boolean;
  isAisle: boolean;
  hasExtraLegroom: boolean;
  priceMultiplier: number;
}

const AIRCRAFT_TYPES = [
  { id: 'A320', name: 'Airbus A320', defaultRows: 30, defaultSeatsPerRow: 6, defaultBusiness: 2 },
  { id: 'B737', name: 'Boeing 737', defaultRows: 32, defaultSeatsPerRow: 6, defaultBusiness: 3 },
  { id: 'A350', name: 'Airbus A350', defaultRows: 40, defaultSeatsPerRow: 9, defaultBusiness: 6 },
  { id: 'B777', name: 'Boeing 777', defaultRows: 45, defaultSeatsPerRow: 10, defaultBusiness: 8 },
];

const AddSeatsPage: React.FC = () => {
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatedSeats, setGeneratedSeats] = useState<GeneratedSeat[]>([]);

  // Configuration State
  const [aircraftType, setAircraftType] = useState(AIRCRAFT_TYPES[0].id);
  const [rows, setRows] = useState(AIRCRAFT_TYPES[0].defaultRows);
  const [seatsPerRow, setSeatsPerRow] = useState(AIRCRAFT_TYPES[0].defaultSeatsPerRow);
  const [businessRows, setBusinessRows] = useState(AIRCRAFT_TYPES[0].defaultBusiness);

  const handleAircraftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = AIRCRAFT_TYPES.find(a => a.id === e.target.value);
    if (selected) {
      setAircraftType(selected.id);
      setRows(selected.defaultRows);
      setSeatsPerRow(selected.defaultSeatsPerRow);
      setBusinessRows(selected.defaultBusiness);
      setGeneratedSeats([]); // Clear preview on change
    }
  };

  const generateSeats = () => {
    if (rows <= 0 || seatsPerRow <= 0) {
      toast.error('Rows and seats per row must be greater than 0');
      return;
    }
    if (businessRows > rows) {
      toast.error('Business rows cannot exceed total rows');
      return;
    }

    setLoading(true);

    // Slight delay for UX
    setTimeout(() => {
      const seats: GeneratedSeat[] = [];
      const colLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

      for (let r = 1; r <= rows; r++) {
        const isBusiness = r <= businessRows;
        // First row of any class gets extra legroom
        const hasExtraLegroom = r === 1 || r === businessRows + 1;

        for (let c = 1; c <= seatsPerRow; c++) {
          const isWindow = c === 1 || c === seatsPerRow;
          // Simple single-aisle logic (e.g. 3-3 configuration)
          // For a 6-seat row, aisles are 3 and 4.
          const leftAisle = Math.floor(seatsPerRow / 2);
          const rightAisle = leftAisle + 1;
          const isAisle = c === leftAisle || c === rightAisle;

          let priceMultiplier = 1.0;
          if (isBusiness) priceMultiplier = 2.0;
          if (hasExtraLegroom && !isBusiness) priceMultiplier += 0.5;

          seats.push({
            seatNumber: `${r}${colLetters[c - 1]}`,
            seatClass: isBusiness ? 'BUSINESS' : 'ECONOMY',
            rowNumber: r,
            columnNumber: c,
            isWindow,
            isAisle,
            hasExtraLegroom,
            priceMultiplier
          });
        }
      }

      console.log("seat data after maping " + seats);

      setGeneratedSeats(seats);
      setLoading(false);
      toast.success(`Generated ${seats.length} seats`);
    }, 500);
  };

  const handleSubmit = async () => {
    if (generatedSeats.length === 0) {
      toast.error('Please generate seats first');
      return;
    }

    setSubmitting(true);
    try {
      await staffApi.addSeats(flightId!, generatedSeats);
      toast.success('Seats added successfully to the flight!');
      navigate(`/staff/seats/${flightId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save seats');
    } finally {
      setSubmitting(false);
    }
  };

  // Group seats by row for the grid preview
  const rowMap = generatedSeats.reduce((acc, seat) => {
    if (!acc[seat.rowNumber]) acc[seat.rowNumber] = [];
    acc[seat.rowNumber].push(seat);
    return acc;
  }, {} as Record<number, GeneratedSeat[]>);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/staff/flights')}
            className="p-3 bg-white hover:bg-slate-50 rounded-2xl text-slate-400 transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configure Seat Layout</h2>
            <p className="text-slate-500 font-medium mt-1">Generate and save the seat map for this flight.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-amber-50 text-amber-600 px-4 py-3 rounded-2xl border border-amber-100 shadow-sm">
          <Info className="w-5 h-5" />
          <span className="text-sm font-bold">Flights must have seats to be bookable</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-8">
              <Settings className="w-4 h-4" /> Parameters
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Aircraft Type</label>
                <div className="relative">
                  <Plane className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select
                    value={aircraftType}
                    onChange={handleAircraftChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {AIRCRAFT_TYPES.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Total Rows</label>
                  <input
                    type="number"
                    min="1"
                    value={rows}
                    onChange={(e) => setRows(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-center text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Seats/Row</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={seatsPerRow}
                    onChange={(e) => setSeatsPerRow(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-center text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Business Class Rows</label>
                <input
                  type="number"
                  min="0"
                  max={rows}
                  value={businessRows}
                  onChange={(e) => setBusinessRows(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <button
                onClick={generateSeats}
                disabled={loading || submitting}
                className="w-full py-4 mt-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Auto Generate Grid
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {generatedSeats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Summary</h3>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl mb-4">
                <span className="text-slate-500 font-bold">Total Seats</span>
                <span className="text-2xl font-black text-slate-900">{generatedSeats.length}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Save & Publish Layout
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Live Preview Grid */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[600px]"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                <Grid className="w-6 h-6 text-blue-600" />
                Live Grid Preview
              </h3>

              {generatedSeats.length > 0 && (
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs font-bold text-slate-500">Business</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                    <span className="text-xs font-bold text-slate-500">Economy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <span className="text-xs font-bold text-slate-500">Extra Legroom</span>
                  </div>
                </div>
              )}
            </div>

            {generatedSeats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                <Grid className="w-16 h-16 text-slate-300 mb-6" />
                <h4 className="text-xl font-black text-slate-400 mb-2">No Layout Generated</h4>
                <p className="text-slate-400 font-medium">Configure parameters and click "Auto Generate Grid"</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 overflow-x-auto pb-8 items-center">
                {Object.keys(rowMap).map(rowStr => {
                  const r = parseInt(rowStr);
                  const seatsInRow = rowMap[r];

                  return (
                    <div key={r} className="flex items-center gap-4">
                      <div className="w-8 text-[10px] font-black text-slate-400 uppercase text-right">{r}</div>

                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        {seatsInRow.map((seat, idx) => {
                          const isAisleBreak = idx === Math.floor(seatsPerRow / 2);

                          let bgClass = "bg-slate-200 text-slate-500"; // Economy default
                          if (seat.seatClass === 'BUSINESS') bgClass = "bg-blue-500 text-white shadow-md shadow-blue-200";
                          else if (seat.hasExtraLegroom) bgClass = "bg-amber-400 text-amber-900 shadow-md shadow-amber-100";

                          return (
                            <React.Fragment key={seat.seatNumber}>
                              {isAisleBreak && <div className="w-6 h-10 flex items-center justify-center text-slate-300 font-bold">|</div>}

                              <div
                                className={`w-10 h-10 flex flex-col items-center justify-center rounded-xl font-black text-xs transition-all relative group cursor-pointer ${bgClass}`}
                              >
                                {seat.seatNumber.slice(-1)}

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-900 text-white p-2 rounded-xl text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl">
                                  <p className="font-bold text-sm mb-1">{seat.seatNumber}</p>
                                  <p className="text-slate-300">{seat.seatClass}</p>
                                  <p className="text-blue-300 mt-1">{seat.priceMultiplier}x Base Price</p>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AddSeatsPage;
