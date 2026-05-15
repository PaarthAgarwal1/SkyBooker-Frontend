import React from 'react';
import { LucideIcon, TrendingUp, AlertCircle, Clock, Search } from 'lucide-react';
import { motion } from 'framer-motion';

/* ================= STATUS BADGE ================= */

export type StatusType = 'CONFIRMED' | 'PAYMENT_PENDING' | 'CANCELLED' | 'REFUNDED' | 'PAID' | 'PENDING' | 'FAILED';

interface StatusBadgeProps {
  status: StatusType | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    PAYMENT_PENDING: 'bg-amber-50 text-amber-700 border-amber-100',
    PENDING: 'bg-slate-100 text-slate-600 border-slate-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-100',
    FAILED: 'bg-rose-50 text-rose-700 border-rose-100',
    REFUNDED: 'bg-orange-50 text-orange-700 border-orange-100',
  };

  const currentStyle = styles[status] || styles.PENDING;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${currentStyle} transition-all duration-300`}>
      <span className={`w-1 h-1 rounded-full mr-1.5 ${currentStyle.split(' ')[1].replace('text-', 'bg-')}`}></span>
      {status.replace('_', ' ')}
    </span>
  );
};

/* ================= STAT CARD ================= */

interface StatCardProps {
  label: string;
  value: string | number | undefined;
  icon: LucideIcon;
  color: string;
  trend?: string;
  loading?: boolean;
  isFallback?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, icon: Icon, color, trend, loading, isFallback
}) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse h-full">
        <div className="flex justify-between">
          <div className="w-10 h-10 bg-slate-50 rounded-xl"></div>
          <div className="w-14 h-5 bg-slate-50 rounded-full"></div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 bg-slate-50 rounded w-1/3"></div>
          <div className="h-8 bg-slate-50 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden group h-full">
      <div className="flex justify-between items-start relative z-10">
        <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
          <Icon size={20} />
        </div>
        {trend && !isFallback && (
          <div className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <TrendingUp size={12} className="mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4 relative z-10">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
        <h3 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
          {isFallback ? '—' : value?.toLocaleString()}
        </h3>
      </div>
    </div>
  );
};

/* ================= DATA TABLE ================= */

interface DataTableProps {
  columns: { key: string; label: string; align?: 'left' | 'right' | 'center' }[];
  data: any[];
  loading: boolean;
  emptyTitle: string;
  isFallback?: boolean;
  renderRow: (item: any) => React.ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns, data, loading, emptyTitle, isFallback, renderRow
}) => {
  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse w-full"></div>
        ))}
      </div>
    );
  }

  if (isFallback || data.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Search className="text-slate-200" size={24} />
        </div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{emptyTitle}</h3>
        <p className="text-xs text-slate-400 mt-1">No recent activity detected.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key}
                className={`px-4 py-4 border-b border-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-wider ${col.align === 'right' ? 'text-right' : ''} ${idx === 0 ? 'pl-8' : ''} ${idx === columns.length - 1 ? 'pr-8' : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((item) => renderRow(item))}
        </tbody>
      </table>
    </div>
  );
};

/* ================= STATES ================= */

export const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="p-10 text-center bg-white rounded-3xl border border-rose-100 shadow-xl shadow-rose-500/5">
    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
      <AlertCircle className="text-rose-500" size={32} />
    </div>
    <h3 className="text-lg font-black text-slate-900 tracking-tight">System Notice</h3>
    <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">{message}</p>
    <button
      onClick={onRetry}
      className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95"
    >
      Retry Connection
    </button>
  </div>
);
