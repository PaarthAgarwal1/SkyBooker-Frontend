import React from 'react';
import { formatINR } from '../../shared/utils/currency';
import { Plane, Clock, ArrowRight, Wind, ShieldCheck, MapPin } from 'lucide-react';
import { Flight } from '../../shared/api/staff';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface FlightCardProps {
  flight: Flight;
  onSelect: (flight: Flight) => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onSelect }) => {
  const navigate = useNavigate();
  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 hover:shadow-xl hover:shadow-blue-900/5 transition-all group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        {/* Airline & Flight Info */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Plane className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{flight.airlineName}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{flight.flightNumber} • {flight.aircraftType}</p>
          </div>
        </div>

        {/* Route & Timing */}
        <div className="flex-1 flex items-center justify-between px-4">
          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900">{formatTime(flight.departureTime)}</h3>
            <div className="flex items-center justify-center gap-1 mt-1 text-slate-400 font-bold text-xs uppercase">
              <MapPin className="w-3 h-3" /> {flight.originAirportCode}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center px-8 relative">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
            </div>
            <div className="w-full h-0.5 bg-slate-100 relative">
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-slate-200 bg-white"></div>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-slate-200 bg-white"></div>
              <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-600 bg-white px-0.5" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
              <ShieldCheck className="w-3 h-3" /> Non-stop
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900">{formatTime(flight.arrivalTime)}</h3>
            <div className="flex items-center justify-center gap-1 mt-1 text-slate-400 font-bold text-xs uppercase">
              <MapPin className="w-3 h-3" /> {flight.destinationAirportCode}
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 pl-8 border-l border-slate-100">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Per Person</p>
            <h2 className="text-3xl font-black text-slate-900">{formatINR(flight.basePrice)}</h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(flight)}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 group/btn"
          >
            Select
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
            <Wind className="w-3 h-3" /> High Performance
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
            <Clock className="w-3 h-3" /> {flight.availableSeats} Seats left
          </div>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05, x: 5 }}
          onClick={() => navigate(`/flight/${flight.flightId}`)}
          className="text-[10px] font-bold text-blue-600 uppercase tracking-widest cursor-pointer hover:underline flex items-center gap-1"
        >
          View Flight Details
          <ArrowRight className="w-3 h-3" />
        </motion.div>
      </div>
    </div>
  );
};

export default FlightCard;
