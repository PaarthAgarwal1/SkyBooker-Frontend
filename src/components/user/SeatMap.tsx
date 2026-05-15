import React from 'react';
import { motion } from 'framer-motion';
import { Armchair, AlertCircle } from 'lucide-react';
import { Seat } from '../../shared/api/staff';
import { formatINR } from '../../shared/utils/currency';

interface SeatMapProps {
  seats: Seat[];
  selectedSeats: string[];
  onSeatToggle: (seatNumber: string) => void;
  basePrice: number;
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, selectedSeats, onSeatToggle, basePrice }) => {
  if (!seats || seats.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-200 p-20 text-center">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No seating data available</p>
      </div>
    );
  }

  // Debug: Log seats to verify status strings from backend
  React.useEffect(() => {
    if (seats && seats.length > 0) {
      console.log('SeatMap Sample Data:', seats.slice(0, 5));
    }
  }, [seats]);

  // Group seats by rowNumber and columnNumber dynamically
  const rows = Array.from(new Set(seats.map(s => s.rowNumber))).sort((a, b) => a - b);
  const columns = Array.from(new Set(seats.map(s => s.columnNumber))).sort((a, b) => a - b);
  
  // Mapping column number to letter for UI (1=A, 2=B, etc)
  const getColLetter = (num: number) => String.fromCharCode(64 + num);

  // Dynamic grid column template: 40px (label) + N columns of 40px
  const gridTemplateColumns = `40px repeat(${columns.length}, 40px)`;

  return (
    <div className="relative pt-24 pb-12 px-2">
      {/* Fuselage Container */}
      <div className="relative mx-auto bg-white rounded-t-[10rem] rounded-b-[4rem] border-x-8 border-t-8 border-b-4 border-slate-200 shadow-2xl overflow-hidden" style={{ maxWidth: 'fit-content' }}>
        
        {/* Cockpit / Nose */}
        <div className="h-40 bg-gradient-to-b from-slate-100 to-white flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-10 w-24 h-8 bg-slate-900/10 rounded-full blur-xl"></div>
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mt-10">Cockpit Section</div>
          
          {/* Windows on sides */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="absolute w-2 h-4 bg-slate-200 rounded-full" style={{ top: `${20 + i * 15}%`, left: '4px' }}></div>
             ))}
             {[...Array(6)].map((_, i) => (
               <div key={i} className="absolute w-2 h-4 bg-slate-200 rounded-full" style={{ top: `${20 + i * 15}%`, right: '4px' }}></div>
             ))}
          </div>
        </div>

        {/* Cabin Content */}
        <div className="px-6 pb-20 relative z-10">
          
          {/* Column Labels */}
          <div className="grid gap-2 mb-8" style={{ gridTemplateColumns }}>
            <div className="w-8"></div>
            {columns.map(col => (
              <div key={col} className={`w-10 text-center text-[10px] font-black text-slate-300 uppercase ${col === 3 ? 'mr-6' : ''}`}>
                {getColLetter(col)}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {rows.map((row) => {
              const rowSeats = seats.filter(s => s.rowNumber === row);
              const isBusiness = rowSeats.some(s => s.seatClass === 'BUSINESS');
              const isExitRow = row === 6;

              return (
                <div key={row} className="relative">
                  {isBusiness && row === rows[0] && (
                    <div className="text-center mb-6 py-2 border-b border-slate-100">
                      <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Business Class</span>
                    </div>
                  )}
                  {!isBusiness && row === 3 && (
                    <div className="text-center my-8 py-2 border-y border-slate-100 bg-slate-50/50">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Economy Cabin</span>
                    </div>
                  )}

                  <div className="grid gap-2 items-center" style={{ gridTemplateColumns }}>
                    {/* Row Number */}
                    <div className="w-8 text-center text-[10px] font-black text-slate-300">
                      {row}
                    </div>

                    {/* Seats */}
                    {columns.map((col) => {
                      const seat = rowSeats.find(s => s.columnNumber === col);
                      
                      if (!seat) return <div key={col} className={`w-10 h-10 ${col === 3 ? 'mr-6' : ''}`}></div>;

                      const isSelected = selectedSeats.includes(seat.seatNumber);
                      // Updated logic: match backend enum exactly
                      const isBooked = seat.status === 'CONFIRMED' || seat.status === 'HELD' || seat.status === 'BLOCKED' || (seat as any).status === 'BOOKED';

                      return (
                        <motion.button
                          key={col}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => !isBooked && onSeatToggle(seat.seatNumber)}
                          disabled={isBooked}
                          className={`
                            w-10 h-10 rounded-lg flex flex-col items-center justify-center transition-all relative group
                            ${col === 3 ? 'mr-6' : ''}
                            ${isBooked 
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed border-2 border-slate-200' 
                              : isSelected 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 border-2 border-blue-700' 
                                : seat.seatClass === 'BUSINESS'
                                  ? 'bg-white border-2 border-blue-100 text-blue-600 hover:border-blue-600 shadow-sm'
                                  : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-blue-300 shadow-sm'
                            }
                          `}
                        >
                          {seat.seatClass === 'BUSINESS' ? (
                            <Armchair className={`w-4 h-4 ${isSelected ? 'text-white' : isBooked ? 'text-slate-200' : 'text-blue-500'}`} />
                          ) : (
                            <span className="text-[9px] font-black uppercase">{getColLetter(col)}</span>
                          )}

                          {/* Visual Debugging Label */}
                          <span className="text-[6px] font-bold opacity-40 uppercase truncate px-0.5 mt-0.5">
                            {seat.status}
                          </span>
                          
                          {!isBooked && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-900 text-white text-[8px] rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 font-black uppercase tracking-widest">
                              {formatINR(Math.round(seat.priceMultiplier * basePrice))} • {seat.seatClass}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {isExitRow && (
                    <div className="flex items-center gap-4 my-6 opacity-40">
                      <div className="flex-1 h-[1px] bg-amber-500"></div>
                      <div className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase tracking-widest">
                        <AlertCircle className="w-3 h-3" /> Emergency Exit
                      </div>
                      <div className="flex-1 h-[1px] bg-amber-500"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tail Indicator */}
        <div className="h-10 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
          <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Aft Section</div>
        </div>
      </div>

      {/* Wings Decorations */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-20 w-32 h-64 bg-slate-200 rounded-l-full -z-10 skew-y-12"></div>
      <div className="absolute top-1/2 -translate-y-1/2 -right-20 w-32 h-64 bg-slate-200 rounded-r-full -z-10 -skew-y-12"></div>

      {/* Legend */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-8 px-6 py-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border-2 border-slate-100"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white border-2 border-blue-100 flex items-center justify-center">
            <Armchair className="w-2.5 h-2.5 text-blue-500" />
          </div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Premium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-600 shadow-sm shadow-blue-200"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-100"></div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
