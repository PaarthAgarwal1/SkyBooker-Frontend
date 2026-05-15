import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Armchair, ShoppingBag,
  ArrowRight, ShieldCheck, MapPin, Plane,
  Info, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { passengerApi } from '../../shared/api/passenger';
import { Seat } from '../../shared/api/staff';
import SeatMap from '../../components/user/SeatMap';
import { formatINR } from '../../shared/utils/currency';
import toast from 'react-hot-toast';

const SeatSelection: React.FC = () => {
  const { flightId } = useParams<{ flightId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { flight, searchParams } = (location.state as any) || {};

  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeats = async () => {
      if (!flightId) return;
      setLoading(true);
      try {
        const res = await passengerApi.getSeatMap(flightId);
        setSeats(res.data || []);
      } catch (err) {
        toast.error('Failed to load seat map. Using mock data.');
        const mockSeats: Seat[] = [];
        for (let r = 1; r <= 15; r++) {
          for (let c = 1; c <= 6; c++) {
            const colLetter = String.fromCharCode(64 + c);
            mockSeats.push({
              seatId: `mock-${r}${colLetter}`,
              seatNumber: `${r}${colLetter}`,
              seatClass: r <= 2 ? 'BUSINESS' : 'ECONOMY',
              status: Math.random() > 0.85 ? 'CONFIRMED' : 'AVAILABLE',
              rowNumber: r,
              columnNumber: c,
              priceMultiplier: r <= 2 ? 1.5 : 1.1
            });
          }
        }
        setSeats(mockSeats);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
    console.log('Flight:', flight);
    console.log('Search Params:', searchParams);
    console.log('Seats:', seats);

  }, [flightId]);

  const handleSeatToggle = (seatNumber: string) => {
    const passengersCount = searchParams?.passengers || 1;

    setSelectedSeats(prev => {
      if (prev.includes(seatNumber)) {
        return prev.filter(s => s !== seatNumber);
      }
      if (prev.length >= passengersCount) {
        toast.error(`You can only select ${passengersCount} seat(s).`);
        return prev;
      }
      return [...prev, seatNumber];
    });
  };

  const calculateTotal = () => {
    const basePrice = flight?.basePrice || 0;
    const passengersCount = searchParams?.passengers || 1;

    const seatAddons = selectedSeats.reduce((sum, sNum) => {
      const seat = seats.find(s => s.seatNumber === sNum);
      if (!seat) return sum;
      return sum + (seat.priceMultiplier * basePrice);
    }, 0);

    return (basePrice * passengersCount) + seatAddons;
  };

  const handleContinue = () => {
    if (selectedSeats.length < (searchParams?.passengers || 1)) {
      toast.error('Please select seats for all passengers.');
      return;
    }
    const selectedSeatObjects = selectedSeats.map(sNum => seats.find(s => s.seatNumber === sNum)).filter(Boolean);

    navigate('/passenger-details', {
      state: {
        flight,
        selectedSeats: selectedSeatObjects,
        searchParams,
        totalAmount: calculateTotal()
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Preparing Cabin Layout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header & Progress */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-10 w-[1px] bg-slate-100"></div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Choose Seats</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Step 2 of 4</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`w-3 h-1 rounded-full ${s <= 2 ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 px-6 py-2 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Availability</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Holding for 14:59</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8">
            {/* Flight Banner Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm mb-12 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg">
                    {flight?.airlineName?.slice(0, 2).toUpperCase() || 'SB'}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{flight?.originAirportCode} to {flight?.destinationAirportCode}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{flight?.flightNumber} • {flight?.aircraftType}</p>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Departure</p>
                    <p className="text-lg font-black text-slate-900">
                      {new Date(flight?.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Plane className="w-5 h-5 text-blue-600" />
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Arrival</p>
                    <p className="text-lg font-black text-slate-900">
                      {new Date(flight?.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Realistic Seat Map Component */}
            <div className="flex justify-center">
              <SeatMap
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatToggle={handleSeatToggle}
                basePrice={flight?.basePrice || 0}
              />
            </div>
          </div>

          {/* Selection Details Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40 overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>

                <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3">
                  <Armchair className="w-6 h-6 text-blue-600" />
                  Selection Summary
                </h3>

                <div className="space-y-8">
                  {/* Selected Seats List */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Passenger(s) Selection</p>
                    <div className="space-y-3">
                      {[...Array(searchParams?.passengers || 1)].map((_, i) => {
                        const seatNumber = selectedSeats[i];
                        const seat = seats.find(s => s.seatNumber === seatNumber);
                        return (
                          <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${seatNumber ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100 border-dashed'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${seatNumber ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                {i + 1}
                              </div>
                              <span className={`text-sm font-bold ${seatNumber ? 'text-blue-900' : 'text-slate-400'}`}>
                                {seatNumber ? `Seat ${seatNumber}` : 'Not Selected'}
                              </span>
                            </div>
                            {seat && <span className="text-xs font-black text-blue-600">{formatINR(Math.round(seat.priceMultiplier * (flight?.basePrice || 0)))}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fare Breakdown */}
                  <div className="pt-6 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Base Fare ({searchParams?.passengers || 1}x)</span>
                      <span>{formatINR((flight?.basePrice || 0) * (searchParams?.passengers || 1))}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Seat Add-ons</span>
                      <span>{formatINR(Math.round(selectedSeats.reduce((sum, s) => sum + ((seats.find(st => st.seatNumber === s)?.priceMultiplier || 0) * (flight?.basePrice || 0)), 0)))}</span>
                    </div>
                    <div className="flex justify-between pt-4">
                      <span className="text-sm font-black text-slate-900">Total Price</span>
                      <span className="text-3xl font-black text-blue-600 tracking-tight">{formatINR(Math.round(calculateTotal()))}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleContinue}
                    disabled={selectedSeats.length < (searchParams?.passengers || 1)}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                  >
                    Confirm Selection
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>

              {/* Safety/Info Card */}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Flexible Rescheduling</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Change your flight date or time up to 24 hours before departure without any penalty.
                    </p>
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

export default SeatSelection;
