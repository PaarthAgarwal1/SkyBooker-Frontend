import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowLeft, Loader2, Plane, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { passengerApi, Airline } from '../../shared/api/passenger';
import { Flight } from '../../shared/api/staff';
import FlightCard from '../../components/user/FlightCard';
import { formatINR } from '../../shared/utils/currency';
import toast from 'react-hot-toast';

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state || {};

  const [flights, setFlights] = useState<Flight[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort State
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('Cheapest First');

  // Filtering Logic
  const filteredFlights = useMemo(() => {
    let result = [...flights];

    // Price Filter
    result = result.filter(f => f.basePrice <= maxPrice);

    // Airline Filter
    if (selectedAirlines.length > 0) {
      result = result.filter(f => selectedAirlines.includes(f.airlineId));
    }

    // Sort Logic
    if (sortBy === 'Cheapest First') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sortBy === 'Fastest First') {
      result.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (sortBy === 'Early Departure') {
      result.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    }

    return result;
  }, [flights, maxPrice, selectedAirlines, sortBy]);

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const res = await passengerApi.getAirlines();


        const activeAirlines = res.data
          .filter(a => a.active)
          .sort((a, b) => a.airlineName.localeCompare(b.airlineName));

        setAirlines(activeAirlines);

      } catch (err) {
        console.error('Failed to fetch airlines:', err);
      }
    };

    fetchAirlines();
  }, []);


  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (searchParams.isRoundTrip) {
          // Round-trip logic
          res = await passengerApi.searchRoundTrip({
            origin: searchParams.origin,
            destination: searchParams.destination,
            departureDate: searchParams.departureDate,
            returnDate: searchParams.returnDate,
            passengers: searchParams.passengers
          });
        } else {
          // One-way logic (expects 'date' param)
          res = await passengerApi.searchFlights({
            origin: searchParams.origin,
            destination: searchParams.destination,
            date: searchParams.departureDate,
            passengers: searchParams.passengers
          });
        }
        setFlights(res.data);
      } catch (err: any) {
        console.error('Search failed:', err);
        setError('We couldn\'t find any flights for this route. Please try again later.');
        toast.error('Search failed. Using fallback data for demo.');

        // Fallback for demo
        setFlights([
          {
            flightId: 'f1-uuid',
            flightNumber: 'SB-101',
            airlineId: 'airline-uuid-1',
            airlineName: 'SkyBooker Air',
            originAirportCode: searchParams.origin || 'NYC',
            destinationAirportCode: searchParams.destination || 'LON',
            departureTime: new Date(Date.now() + 86400000).toISOString(),
            arrivalTime: new Date(Date.now() + 115200000).toISOString(),
            durationMinutes: 480,
            status: 'ON_TIME',
            aircraftType: 'Boeing 787',
            availableSeats: 42,
            basePrice: 599
          },
          {
            flightId: 'f2-uuid',
            flightNumber: 'SB-205',
            airlineId: 'airline-uuid-1',
            airlineName: 'SkyBooker Air',
            originAirportCode: searchParams.origin || 'NYC',
            destinationAirportCode: searchParams.destination || 'LON',
            departureTime: new Date(Date.now() + 172800000).toISOString(),
            arrivalTime: new Date(Date.now() + 201600000).toISOString(),
            durationMinutes: 480,
            status: 'ON_TIME',
            aircraftType: 'Airbus A350',
            availableSeats: 12,
            basePrice: 450
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.origin) {
      fetchFlights();
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handleSelectFlight = (flight: Flight) => {
    navigate(`/flight-details/${flight.flightId}`, { state: { flight, searchParams } });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Search Summary Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">{searchParams.origin}</h2>
                <Plane className="w-4 h-4 text-blue-600 rotate-90" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight">{searchParams.destination}</h2>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {searchParams.departureDate ? new Date(searchParams.departureDate).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'Flexible Dates'} • {searchParams.passengers || 1} Passengers
              </p>
            </div>
          </div>

          <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
            <Filter className="w-4 h-4" />
            Modify Search
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Filters</h3>
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-10">
                {/* Price Range */}
                <div>
                  <div className="flex justify-between mb-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Price Range</label>
                    <span className="text-xs font-black text-blue-600">{formatINR(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                    min="1000"
                    max="100000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] font-bold text-slate-400">{formatINR(1000)}</span>
                    <span className="text-[10px] font-bold text-slate-400">{formatINR(100000)}</span>
                  </div>
                </div>

                {/* Airlines */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Airlines</label>
                  <div className="space-y-4">
                    {airlines.length > 0 ? (
                      airlines.map(airline => {
                        const hasFlights = flights.some(f => f.airlineId === airline.airlineId);
                        return (
                          <label key={airline.airlineId} className={`flex items-center gap-3 cursor-pointer group ${!hasFlights ? 'opacity-50' : ''}`}>
                            <input
                              type="checkbox"
                              className="w-5 h-5 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                              checked={selectedAirlines.includes(airline.airlineId)}
                              disabled={!hasFlights}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedAirlines([...selectedAirlines, airline.airlineId]);
                                else setSelectedAirlines(selectedAirlines.filter(id => id !== airline.airlineId));
                              }}
                            />
                            <div className="flex items-center gap-2">
                              {airline.logoUrl && (
                                <img src={airline.logoUrl} alt={airline.airlineName} className="w-5 h-5 rounded-full object-cover" />
                              )}
                              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{airline.airlineName}</span>
                            </div>
                          </label>
                        );
                      })
                    ) : (
                      <p className="text-xs italic text-slate-400">Loading airlines...</p>
                    )}
                  </div>
                </div>

                {/* Stops (Static for now as API doesn't provide stop count yet) */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Stops</label>
                  <div className="space-y-3">
                    {['Non-stop', '1 Stop', '2+ Stops'].map(stop => (
                      <label key={stop} className="flex items-center gap-3 cursor-not-allowed opacity-50">
                        <input type="checkbox" disabled className="w-5 h-5 rounded-lg border-2 border-slate-200 text-slate-300" />
                        <span className="text-sm font-bold text-slate-400">{stop}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setMaxPrice(2000);
                    setSelectedAirlines([]);
                    setSortBy('Cheapest First');
                  }}
                  className="w-full py-3 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-slate-100">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Finding best prices...</p>
              </div>
            ) : filteredFlights.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-4 mb-2">
                  <p className="text-sm font-bold text-slate-500">{filteredFlights.length} flights found</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort by:</span>
                    <select
                      className="bg-transparent border-none text-xs font-black text-slate-900 outline-none cursor-pointer"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option>Cheapest First</option>
                      <option>Fastest First</option>
                      <option>Early Departure</option>
                    </select>
                  </div>
                </div>

                {filteredFlights.map((flight, idx) => (
                  <motion.div
                    key={flight.flightId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <FlightCard
                      flight={flight}
                      onSelect={handleSelectFlight}
                    />
                  </motion.div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-slate-100 text-center px-12">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No Flights Found</h3>
                <p className="text-slate-500 font-medium max-w-md mx-auto">
                  {error || "We couldn't find any flights for this route on the selected date. Try searching for a different date or city."}
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
                >
                  Go Back Home
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
