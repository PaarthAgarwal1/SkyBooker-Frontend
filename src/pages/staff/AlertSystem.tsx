import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  CloudRain,
  Zap,
  Sun,
  Cloud,
  Wind,
  Clock,
  RefreshCw,
  Plane,
  ChevronRight,
  ShieldAlert,
  Volume2,
  VolumeX
} from 'lucide-react';
import { staffApi, Flight, Alert } from '@shared/api/staff';
import { useAuthStore } from '@store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { weatherService } from '@shared/services/weatherService';

import { generateAlertsFromWeather } from '@shared/utils/alertUtils';

const AlertSystem: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const { user } = useAuthStore();
  const prevAlertsRef = useRef<Alert[]>([]);
  const hasErrorShown = useRef(false);

  const playCriticalSound = () => {
    if (!isSoundEnabled) return;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => { });
  };

  const handleAlertSync = useCallback(async (flightList: Flight[]) => {
    try {
      const newAlerts = await generateAlertsFromWeather(flightList);

      const hasNewCritical = newAlerts.some(
        a =>
          a.severity === 'CRITICAL' &&
          !prevAlertsRef.current.some(
            old => old.city === a.city && old.severity === 'CRITICAL'
          )
      );

      if (hasNewCritical) playCriticalSound();

      prevAlertsRef.current = newAlerts;
      setAlerts(newAlerts);
      setLastRefreshed(new Date());
      hasErrorShown.current = false; // Reset error on success
    } catch (err) {
      if (!hasErrorShown.current) {
        toast.error('Weather service synchronization failed.');
        hasErrorShown.current = true;
      }
    }
  }, [isSoundEnabled]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (!user?.airlineId) return;
      const res = await staffApi.getAllFlights(user.airlineId);
      if (res.data) {
        setFlights(res.data);
        await handleAlertSync(res.data);
      }
    } catch (error) {
      toast.error('Failed to sync operational data');
    } finally {
      setLoading(false);
    }
  }, [user?.airlineId, handleAlertSync]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter(a => filter === 'ALL' || a.severity === filter)
      .filter(a => !showOnlyCritical || a.severity === 'CRITICAL');
  }, [alerts, filter, showOnlyCritical]);

  const stats = useMemo(() => ({
    critical: alerts.filter(a => a.severity === 'CRITICAL').length,
    warning: alerts.filter(a => a.severity === 'WARNING').length,
    info: alerts.filter(a => a.severity === 'INFO').length
  }), [alerts]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md py-6 -mx-4 px-4 border-b border-slate-200 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              Operational Alerts
              <span className="bg-rose-100 text-rose-600 text-xs font-black px-3 py-1 rounded-full animate-pulse">LIVE</span>
            </h2>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last synced: {lastRefreshed.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className={`p-3 rounded-2xl border transition-all ${isSoundEnabled ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}
              title={isSoundEnabled ? "Disable Critical Sound" : "Enable Critical Sound"}
            >
              {isSoundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-100 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-8">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Severity Filter</h4>
              <div className="space-y-2">
                <FilterButton active={filter === 'ALL'} onClick={() => setFilter('ALL')} label="All Levels" count={alerts.length} color="slate" />
                <FilterButton active={filter === 'CRITICAL'} onClick={() => setFilter('CRITICAL')} label="Critical" count={stats.critical} color="rose" />
                <FilterButton active={filter === 'WARNING'} onClick={() => setFilter('WARNING')} label="Warnings" count={stats.warning} color="amber" />
                <FilterButton active={filter === 'INFO'} onClick={() => setFilter('INFO')} label="Information" count={stats.info} color="blue" />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <div className="flex items-center justify-between cursor-pointer group" onClick={() => setShowOnlyCritical(!showOnlyCritical)}>
                <div>
                  <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">Critical Only</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Filter by impact</p>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-all relative ${showOnlyCritical ? 'bg-rose-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showOnlyCritical ? 'left-7' : 'left-1'}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100">
            <ShieldAlert className="w-10 h-10 mb-6 opacity-80" />
            <h3 className="text-xl font-black leading-tight">Smart Ops Monitor</h3>
            <p className="text-sm text-blue-100 mt-4 font-medium leading-relaxed">
              Our AI analyzes real-time weather patterns at Destination airports to predict delays before they happen.
            </p>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="popLayout">
            {loading && alerts.length === 0 ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white border border-slate-100 rounded-3xl animate-pulse" />)
            ) : filteredAlerts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-slate-100 rounded-[3rem] p-24 text-center"
              >
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-50">
                  <Plane className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">All systems operational</h3>
                <p className="text-slate-500 font-medium mt-4 max-w-md mx-auto leading-relaxed">
                  No weather disruptions detected for your active routes. Everything is proceeding according to schedule.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const FilterButton = ({ active, onClick, label, count, color }: any) => {
  const colors: any = {
    rose: active ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600',
    amber: active ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'text-slate-500 hover:bg-amber-50 hover:text-amber-600',
    blue: active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600',
    slate: active ? 'bg-slate-900 text-white shadow-lg shadow-slate-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-sm transition-all ${colors[color]}`}
    >
      {label}
      <span className={`text-[10px] px-2 py-0.5 rounded-lg ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
        {count}
      </span>
    </button>
  );
};

const AlertCard = ({ alert }: { alert: Alert }) => {
  const weatherIcons: any = {
    RAIN: <CloudRain className="w-8 h-8" />,
    STORM: <Zap className="w-8 h-8" />,
    CLEAR: <Sun className="w-8 h-8" />,
    FOG: <Cloud className="w-8 h-8" />,
    WIND: <Wind className="w-8 h-8" />
  };

  const gradients: any = {
    CRITICAL: 'from-rose-600 to-rose-400 shadow-rose-100',
    WARNING: 'from-amber-500 to-amber-300 shadow-amber-100',
    INFO: 'from-blue-500 to-indigo-400 shadow-blue-100'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className={`relative p-8 rounded-[2.5rem] bg-gradient-to-r text-white shadow-2xl transition-all group overflow-hidden ${gradients[alert.severity]}`}
    >
      <div className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/4 opacity-10 group-hover:scale-110 transition-transform duration-700">
        {weatherIcons[alert.weatherCondition || 'CLEAR']}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10">
        <div className={`p-5 rounded-3xl bg-white/20 backdrop-blur-md shadow-inner ${alert.severity === 'CRITICAL' ? 'animate-pulse ring-4 ring-white/10' : ''}`}>
          {weatherIcons[alert.weatherCondition || 'CLEAR']}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="text-2xl font-black tracking-tight">{alert.title}</h4>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
              {alert.city}
            </span>
          </div>
          <p className="text-white/80 font-medium leading-relaxed max-w-2xl">{alert.message}</p>
        </div>

        <div className="flex flex-col items-end gap-4 min-w-[120px]">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
            {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {/* <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl group-hover:bg-white/20 transition-colors">
            <span className="text-xs font-black uppercase tracking-widest">Details</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div> */}
        </div>
      </div>
    </motion.div>
  );
};

export default AlertSystem;
