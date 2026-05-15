import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: number;
  color: string;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, color, loading }) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm animate-pulse">
        <div className="flex justify-between mb-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
          <div className="w-12 h-4 bg-slate-100 rounded"></div>
        </div>
        <div className="w-16 h-4 bg-slate-100 rounded mb-2"></div>
        <div className="w-24 h-8 bg-slate-100 rounded"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.1em]">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</h3>
      </div>
    </motion.div>
  );
};

export default StatsCard;
