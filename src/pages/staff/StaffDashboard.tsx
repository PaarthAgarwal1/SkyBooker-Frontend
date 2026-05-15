import React, { useEffect, useState } from 'react';
import { Plane, Activity, AlertTriangle, Users, RefreshCw, Clock } from 'lucide-react';
import { staffApi, StaffStats, Flight, Alert } from '@shared/api/staff';
import { motion, AnimatePresence } from 'framer-motion';
import StatsCard from '@components/staff/StatsCard';
import FlightTable from '@components/staff/FlightTable';
import { useAuthStore } from '@store/authStore';
import { toast } from 'react-hot-toast';

import { generateAlertsFromWeather } from '@shared/utils/alertUtils';

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [recentFlights, setRecentFlights] = useState<Flight[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { user } = useAuthStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      const airlineId = user?.airlineId || '';
      if (!airlineId) return;

      const [statsRes, flightsRes] = await Promise.all([
        staffApi.getDashboardStats(airlineId),
        staffApi.getAllFlights(airlineId)
      ]);

      setStats(statsRes.data);
      setRecentFlights(flightsRes.data.slice(0, 5));

      // Real-time weather alerts integration
      const weatherAlerts = await generateAlertsFromWeather(flightsRes.data);
      setAlerts(weatherAlerts);

      setLastUpdated(new Date());
    } catch (error) {
      toast.error('Failed to sync dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const getTimeAgo = (dateStr: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-blue-600">{user?.fullName?.split(' ')[0]}</span>
          </h2>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all font-bold shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Fleet Flights"
          value={stats?.totalFlights || 0}
          icon={Plane}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Flights Scheduled Today"
          value={stats?.flightsToday || 0}
          icon={Activity}
          color="emerald"
          loading={loading}
        />
        <StatsCard
          title="Real-time Available Seats"
          value={stats?.availableSeats?.toLocaleString() || 0}
          icon={Users}
          color="amber"
          loading={loading}
        />
        <StatsCard
          title="Delayed Operations"
          value={stats?.delayedFlights || 0}
          icon={AlertTriangle}
          color="rose"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Flight Schedules</h3>
            <button
              className="text-sm font-bold text-blue-600 hover:underline px-4 py-2 bg-blue-50 rounded-xl"
              onClick={() => window.location.href = '/staff/flights'}
            >
              View Full List
            </button>
          </div>

          <FlightTable
            flights={recentFlights}
            loading={loading}
            actions={false}
          />
        </div>

        {/* Quick Alerts Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Operational Alerts</h3>
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-5 rounded-3xl border border-slate-50 flex items-start gap-4 hover:shadow-md transition-all group ${alert.severity === 'CRITICAL' ? 'bg-rose-50/50' : 'bg-slate-50/50'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${alert.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-600' :
                          alert.severity === 'WARNING' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        !
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-black text-slate-900">{alert.title}</p>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {getTimeAgo(alert.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alert.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <Plane className="w-8 h-8" />
                  </div>
                  <h4 className="font-black text-slate-900">All systems go!</h4>
                  <p className="text-sm text-slate-400 mt-2 font-medium">No critical operational alerts at this time.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
