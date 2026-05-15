import React from 'react';
import { FareSummary } from '../../shared/constants/pricing';
import { formatINR } from '../../shared/utils/currency';
import { motion } from 'framer-motion';
import { Info, Receipt } from 'lucide-react';

interface FareBreakdownProps {
  summary: FareSummary;
  className?: string;
  showTitle?: boolean;
}

const FareBreakdown: React.FC<FareBreakdownProps> = ({ summary, className = '', showTitle = true }) => {
  const lineItem = (label: string, value: number, isSubtle = false) => (
    <div className={`flex justify-between items-center py-2 ${isSubtle ? 'opacity-60 text-xs' : 'text-sm'}`}>
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-black text-slate-900">{formatINR(value)}</span>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden ${className}`}
    >
      {showTitle && (
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Fare Breakdown</h3>
          </div>
          <Info className="w-4 h-4 text-slate-300 cursor-help" />
        </div>
      )}

      <div className="p-6 space-y-1">
        {lineItem('Base Fare', summary.baseFare)}
        {summary.seatCharges > 0 && lineItem('Seat Selection', summary.seatCharges)}
        {summary.mealCharges > 0 && lineItem('Meal Selection', summary.mealCharges)}
        {summary.baggageCharges > 0 && lineItem('Extra Baggage', summary.baggageCharges)}
        
        <div className="h-px bg-slate-50 my-4"></div>
        
        <div className="space-y-0.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Taxes & Fees</p>
          {lineItem('GST (5%)', summary.gst, true)}
          {lineItem('Airport Fees', summary.airportFees, true)}
          {lineItem('Convenience Fee', summary.convenienceFee, true)}
        </div>

        <div className="mt-6 pt-6 border-t-2 border-dashed border-slate-100">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Total Amount</p>
              <h2 className="text-3xl font-black text-slate-900 leading-none">
                {formatINR(summary.totalAmount)}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Inc. all taxes</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 px-6 py-3">
        <p className="text-[9px] font-bold text-blue-700 uppercase tracking-tighter text-center">
          * Fares are subject to change until booking is confirmed.
        </p>
      </div>
    </motion.div>
  );
};

export default FareBreakdown;
