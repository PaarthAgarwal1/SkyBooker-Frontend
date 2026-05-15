import React from 'react';
import { 
  Plane, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  Eye,
  Edit2,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { Flight } from '@shared/api/staff';
import { format } from 'date-fns';

interface FlightTableProps {
  flights: Flight[];
  loading?: boolean;
  onViewSeats?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
  actions?: boolean;
}

const StatusBadge = ({ status }: { status: string }) => {
  const configs: any = {
    ON_TIME: { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2, label: 'On Time' },
    DELAYED: { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock, label: 'Delayed' },
    CANCELLED: { color: 'text-rose-600 bg-rose-50 border-rose-100', icon: XCircle, label: 'Cancelled' },
  };

  const config = configs[status] || configs.ON_TIME;
  const Icon = config.icon;

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const FlightTable: React.FC<FlightTableProps> = ({ 
  flights, 
  loading, 
  onViewSeats, 
  onEdit, 
  onDelete, 
  onStatusChange,
  actions = true 
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-20 bg-white border border-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
        <Plane className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-400 font-bold">No flights scheduled</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Flight</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Departure</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              {actions && <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {flights.map((flight) => (
              <tr key={flight.flightId} className="hover:bg-blue-50/20 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                      <Plane className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{flight.flightNumber}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{flight.aircraftType || 'Airbus A320'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">{flight.originAirportCode}</span>
                    <ArrowRight className="w-3 h-3 text-blue-500" />
                    <span className="text-sm font-bold text-slate-900">{flight.destinationAirportCode}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {format(new Date(flight.departureTime), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                    <Clock className="w-3.5 h-3.5" />
                    {format(new Date(flight.departureTime), 'HH:mm')}
                  </div>
                </td>
                <td className="px-8 py-6">
                  {onStatusChange ? (
                    <select 
                      value={flight.status}
                      onChange={(e) => onStatusChange(flight.flightId, e.target.value)}
                      className={`
                        text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border outline-none cursor-pointer appearance-none transition-all
                        ${flight.status === 'ON_TIME' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                          flight.status === 'DELAYED' ? 'text-amber-600 bg-amber-50 border-amber-100' : 
                          'text-rose-600 bg-rose-50 border-rose-100'
                        }
                      `}
                    >
                      <option value="ON_TIME">On Time</option>
                      <option value="DELAYED">Delayed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="BOARDING">Boarding</option>
                    </select>
                  ) : (
                    <StatusBadge status={flight.status} />
                  )}
                </td>
                {actions && (
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onViewSeats && (
                        <button 
                          onClick={() => onViewSeats(flight.flightId)}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="View Seats"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(flight.flightId)}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(flight.flightId)}
                          className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightTable;
