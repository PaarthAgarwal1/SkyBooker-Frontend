import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Users, ArrowRightLeft,
  PlaneTakeoff, PlaneLanding, Zap, Armchair,
  CloudLightning, Bell, ChevronRight, History,
  AlertTriangle, Loader2, Star, TrendingUp,
  Map, ArrowUpRight, Compass, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi, Airport } from '../../shared/api/admin';
import { generateAlertsFromWeather } from '../../shared/utils/alertUtils';
import { staffApi, Alert } from '../../shared/api/staff';
import toast from 'react-hot-toast';

interface RecentSearch {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  isRoundTrip: boolean;
}

const Home: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [scrolled, setScrolled] = useState(false);

  // Search State
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1
  });

  // Dropdown States
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  const passengerRef = useRef<HTMLDivElement>(null);

  // Initialization
  useEffect(() => {
    const initData = async () => {
      try {
        const airportRes = await adminApi.getAllAirports();
        setAirports(airportRes.data);

        const flightsRes = await staffApi.getAllFlights('skybooker');
        if (flightsRes.data && flightsRes.data.length > 0) {
          const generatedAlerts = await generateAlertsFromWeather(flightsRes.data.slice(0, 5));
          setAlerts(generatedAlerts.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to initialize home page data:', err);
      } finally {
        setLoadingAlerts(false);
      }
    };

    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    initData();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click Outside logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) setShowOriginDropdown(false);
      if (destRef.current && !destRef.current.contains(event.target as Node)) setShowDestDropdown(false);
      if (passengerRef.current && !passengerRef.current.contains(event.target as Node)) setShowPassengerDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent, customParams?: RecentSearch) => {
    if (e) e.preventDefault();

    const params = customParams || searchParams;

    if (!params.origin || !params.destination || !params.departureDate) {
      toast.error('Please select origin, destination and departure date');
      return;
    }

    if (isRoundTrip && !params.returnDate) {
      toast.error('Please select a return date for your round trip');
      return;
    }

    if (params.origin === params.destination) {
      toast.error('Origin and Destination cannot be the same');
      return;
    }

    const newSearch: RecentSearch = {
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      passengers: params.passengers,
      isRoundTrip: customParams ? customParams.isRoundTrip : isRoundTrip
    };

    const updatedRecent = [newSearch, ...recentSearches.filter(s =>
      s.origin !== newSearch.origin || s.destination !== newSearch.destination
    )].slice(0, 4);

    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    navigate('/search-results', { state: { ...params, isRoundTrip } });
  };

  const swapRoute = () => {
    setSearchParams(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }));
    const temp = originSearch;
    setOriginSearch(destSearch);
    setDestSearch(temp);
  };

  const filteredOrigins = airports.filter(a =>
    a.city.toLowerCase().includes(originSearch.toLowerCase()) ||
    a.iataCode.toLowerCase().includes(originSearch.toLowerCase()) ||
    a.airportName.toLowerCase().includes(originSearch.toLowerCase())
  );

  const filteredDests = airports.filter(a =>
    a.city.toLowerCase().includes(destSearch.toLowerCase()) ||
    a.iataCode.toLowerCase().includes(destSearch.toLowerCase()) ||
    a.airportName.toLowerCase().includes(destSearch.toLowerCase())
  );

  const popularRoutes = [
    { from: 'DEL', to: 'BOM', cityFrom: 'Delhi', cityTo: 'Mumbai', price: 4999, img: 'https://gotripzi.com/_astro/mumbai-in-hero.CwySNf_i.webp', tag: 'Trending' },
    { from: 'DEL', to: 'BLR', cityFrom: 'Delhi', cityTo: 'Bangalore', price: 7499, img: 'https://live.staticflickr.com/641/32563777936_6b1a3639ee_h.jpg', tag: 'Best Seller' },
    { from: 'DEL', to: 'DXB', cityFrom: 'Delhi', cityTo: 'Dubai', price: 12999, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80', tag: 'Luxury' },
  ];

  const features = [
    { icon: Zap, title: 'Priority Access', desc: 'Secure the best cabin seats in under 60 seconds.', color: 'from-blue-600 to-indigo-600' },
    { icon: Armchair, title: 'Elite Cabin', desc: 'Interactive 3D seat maps with premium class views.', color: 'from-indigo-600 to-purple-600' },
    { icon: CloudLightning, title: 'Smart Flight', desc: 'Proactive alerts powered by global weather data.', color: 'from-purple-600 to-pink-600' },
    { icon: Bell, title: 'Live Concierge', desc: 'Instant PNR updates and luxury lounge notifications.', color: 'from-pink-600 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">

      {/* Cinematic Hero Section */}
      <section className="relative h-[950px] flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-slate-950/40 z-10" />
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573068057232-fa17a193d54d?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmxpZ2h0c3xlbnwwfHwwfHx8MA%3D%3D')] bg-cover bg-center"
          />
          {/* Animated Glow Elements */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full animate-pulse delay-1000" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-50" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                <Star size={12} className="text-amber-400" /> Premium Airline Experience
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight leading-[0.9] text-shadow-xl">
                Elevate Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 animate-gradient-x">Journey Above</span>
              </h1>
              <p className="text-lg md:text-xl text-blue-100/70 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                Experience luxury air travel with SkyBooker's intelligent booking ecosystem and real-time operational excellence.
              </p>
            </motion.div>
          </div>

          {/* Premium Search Engine - Glassmorphism */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-full max-w-6xl mx-auto bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] p-1.5 border border-white/50 relative group/search"
          >
            <div className="p-8 md:p-10 bg-white/40 rounded-[2.8rem]">
              {/* Trip Type Tabs */}
              <div className="flex gap-1 bg-slate-900/5 p-1 rounded-2xl w-fit mb-10 border border-slate-900/5">
                {[
                  { id: false, label: 'One Way', icon: PlaneTakeoff },
                  { id: true, label: 'Round Trip', icon: ArrowRightLeft }
                ].map(tab => (
                  <button
                    key={tab.label}
                    onClick={() => setIsRoundTrip(tab.id)}
                    className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-500 ${isRoundTrip === tab.id ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={(e) => handleSearch(e)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-end">

                {/* Route Group */}
                <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-0 bg-white rounded-3xl p-1 shadow-sm border border-slate-100 group/route transition-all focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500/20">

                  {/* FROM */}
                  <div className="relative px-6 py-3" ref={originRef}>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Origin</label>
                    <div
                      onClick={() => setShowOriginDropdown(true)}
                      className="flex items-center gap-3 cursor-pointer group/field"
                    >
                      <PlaneTakeoff size={18} className="text-blue-500 group-focus-within/field:scale-110 transition-transform" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black text-slate-900 truncate">
                          {airports.find(a => a.iataCode === searchParams.origin)?.city || 'Select Airport'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {searchParams.origin || 'Where from?'}
                        </span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showOriginDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 p-4 max-h-[300px] overflow-y-auto overflow-x-hidden"
                        >
                          <div className="sticky top-0 bg-white pb-3">
                            <input
                              autoFocus
                              placeholder="Search city or code..."
                              value={originSearch}
                              onChange={(e) => setOriginSearch(e.target.value)}
                              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-500/10"
                            />
                          </div>
                          <div className="space-y-1">
                            {filteredOrigins.map(ap => (
                              <button
                                key={ap.iataCode}
                                type="button"
                                onClick={() => {
                                  setSearchParams({ ...searchParams, origin: ap.iataCode });
                                  setShowOriginDropdown(false);
                                  setOriginSearch('');
                                }}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 group/item transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-white group-hover/item:text-blue-600 transition-colors">
                                    <MapPin size={14} />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xs font-black text-slate-900">{ap.city}</p>
                                    <p className="text-[9px] font-medium text-slate-400">{ap.airportName}</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{ap.iataCode}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* SWAP */}
                  <div className="flex justify-center -mx-4 z-10">
                    <motion.button
                      whileHover={{ rotate: 180, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={swapRoute}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/20 border-4 border-white active:scale-90"
                    >
                      <ArrowRightLeft size={18} />
                    </motion.button>
                  </div>

                  {/* TO */}
                  <div className="relative px-6 py-3" ref={destRef}>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Destination</label>
                    <div
                      onClick={() => setShowDestDropdown(true)}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <PlaneLanding size={18} className="text-blue-500" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-black text-slate-900 truncate">
                          {airports.find(a => a.iataCode === searchParams.destination)?.city || 'Select Airport'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {searchParams.destination || 'Where to?'}
                        </span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {showDestDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 p-4 max-h-[300px] overflow-y-auto"
                        >
                          <div className="sticky top-0 bg-white pb-3">
                            <input
                              autoFocus
                              placeholder="Search city or code..."
                              value={destSearch}
                              onChange={(e) => setDestSearch(e.target.value)}
                              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-blue-500/10"
                            />
                          </div>
                          <div className="space-y-1">
                            {filteredDests.map(ap => (
                              <button
                                key={ap.iataCode}
                                type="button"
                                onClick={() => {
                                  setSearchParams({ ...searchParams, destination: ap.iataCode });
                                  setShowDestDropdown(false);
                                  setDestSearch('');
                                }}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 group/item transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-white group-hover/item:text-blue-600 transition-colors">
                                    <MapPin size={14} />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xs font-black text-slate-900">{ap.city}</p>
                                    <p className="text-[9px] font-medium text-slate-400">{ap.airportName}</p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{ap.iataCode}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Dates Group */}
                <div className={`${isRoundTrip ? 'lg:col-span-4' : 'lg:col-span-3'}  grid ${isRoundTrip
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1'
                  } gap-0 bg-white rounded-3xl p-1 shadow-sm border border-slate-100 divide-x divide-slate-100 transition-all focus-within:ring-4 focus-within:ring-blue-500/5`}>
                  <div className="px-6 py-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Departure</label>
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-blue-500" />
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="bg-transparent border-none text-xs font-black text-slate-900 outline-none cursor-pointer p-0 w-full"
                        value={searchParams.departureDate}
                        onChange={(e) => setSearchParams({ ...searchParams, departureDate: e.target.value })}
                      />
                    </div>
                  </div>
                  {isRoundTrip && (
                    <div className="px-6 py-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Return</label>
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-blue-500" />
                        <input
                          type="date"
                          required
                          min={searchParams.departureDate || new Date().toISOString().split('T')[0]}
                          className="bg-transparent border-none text-xs font-black text-slate-900 outline-none cursor-pointer p-0 w-full"
                          value={searchParams.returnDate}
                          onChange={(e) => setSearchParams({ ...searchParams, returnDate: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Passengers Dropdown */}
                <div className={`${isRoundTrip ? 'lg:col-span-2' : 'lg:col-span-3'} relative`} ref={passengerRef}>
                  <div
                    onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                    className="flex flex-col px-6 py-3 bg-white rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:border-blue-200 transition-all focus-within:ring-4 focus-within:ring-blue-500/5 h-[70px] justify-center"
                  >
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Travelers</label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users size={18} className="text-blue-500" />
                        <span className="text-xs font-black text-slate-900">{searchParams.passengers} {searchParams.passengers === 1 ? 'Traveler' : 'Travelers'}</span>
                      </div>
                      <ChevronRight size={14} className={`text-slate-300 transition-transform ${showPassengerDropdown ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {showPassengerDropdown && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute top-full right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-50 p-6"
                      >
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Passengers</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                setSearchParams({ ...searchParams, passengers: num });
                                setShowPassengerDropdown(false);
                              }}
                              className={`h-12 rounded-xl text-sm font-black transition-all ${searchParams.passengers === num ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search Button */}
                <div className="lg:col-span-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-3xl font-black shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center h-[70px]"
                  >
                    <Search className="w-6 h-6" />
                  </motion.button>
                </div>
              </form>

              {/* Recent Searches Bar */}
              {recentSearches.length > 0 && (
                <div className="mt-10 pt-10 border-t border-slate-100/60 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mr-4">
                    <History size={14} className="text-blue-400" /> Recent Searches
                  </div>
                  {recentSearches.map((s, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ y: -2, scale: 1.02 }}
                      onClick={() => {
                        setIsRoundTrip(s.isRoundTrip);
                        handleSearch(undefined, s);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-white/50 border border-slate-200 text-[10px] font-black text-slate-700 hover:bg-white hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all flex items-center gap-3 group"
                    >
                      <div className="flex items-center gap-1">
                        <span>{s.origin}</span>
                        <ArrowRightLeft size={10} className="text-slate-300 group-hover:text-blue-400" />
                        <span>{s.destination}</span>
                      </div>
                      <span className="text-[8px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md group-hover:bg-blue-50 group-hover:text-blue-500">{s.isRoundTrip ? 'ROUND' : 'ONE-WAY'}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Luxury Routes */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Compass size={14} /> Curated Experiences
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Popular Destinations</h2>
            <p className="text-slate-500 font-medium mt-4 text-lg">Direct flights to the world's most luxurious cities.</p>
          </div>
          <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white border border-slate-100 text-sm font-black text-slate-900 hover:bg-slate-50 transition-all group">
            Explore All <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {popularRoutes.map((route, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => {
                setSearchParams(prev => ({ ...prev, origin: route.from, destination: route.to }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative h-[450px] rounded-[3.5rem] overflow-hidden text-left shadow-2xl hover:shadow-blue-500/20 transition-all duration-700"
            >
              <img
                src={route.img}
                alt={route.cityTo}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute top-8 left-8">
                <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-widest">
                  {route.tag}
                </span>
              </div>

              <div className="absolute bottom-10 left-10 right-10">
                <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3">{route.cityFrom} TO {route.cityTo}</p>
                <h4 className="text-3xl font-black text-white mb-6 tracking-tight">{route.cityTo}</h4>

                <div className="flex items-center justify-between border-t border-white/10 pt-6">
                  <div className="flex flex-col">
                    <span className="text-white/50 font-bold text-[10px] uppercase tracking-widest">Starts from</span>
                    <span className="text-white text-3xl font-black mt-1">₹{route.price.toLocaleString()}</span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-xl">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Feature Ecosystem Grid */}
      <section className="bg-slate-900 py-40 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/20 blur-[100px] rounded-full" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">Designed for the Elite Traveler</h2>
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">Proprietary technology meets luxury aviation standards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -12 }}
                className="bg-white/5 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group relative overflow-hidden"
              >
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feat.color} text-white flex items-center justify-center mb-10 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                  <feat.icon size={32} />
                </div>
                <h3 className="text-xl font-black text-white mb-4 tracking-tight">{feat.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed text-sm">{feat.desc}</p>

                {/* Decorative Accent */}
                <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Alerts & Intelligence Layer */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">

          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <TrendingUp size={14} /> Operational Intelligence
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Stay Informed With <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Smart Flight Data</span>
            </h2>
            <p className="text-slate-500 font-medium mt-8 text-lg leading-relaxed max-w-xl">
              Our proprietary alert system monitors global aviation traffic and weather anomalies to keep your itinerary seamless.
            </p>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <Globe className="text-blue-600 mb-6" size={40} />
                <h4 className="text-lg font-black text-slate-900 mb-2">Global Monitoring</h4>
                <p className="text-slate-400 text-sm font-medium">Real-time status tracking for 10,000+ airports worldwide.</p>
              </div>
              <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                <Map className="text-indigo-600 mb-6" size={40} />
                <h4 className="text-lg font-black text-slate-900 mb-2">Route Optimization</h4>
                <p className="text-slate-400 text-sm font-medium">Intelligent alternate route suggestions during delays.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-[4rem] border border-slate-100 p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.04)] relative">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Flight Alerts</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live from SkyBooker HQ</p>
              </div>
              <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse border-4 border-emerald-100" />
            </div>

            <div className="space-y-6">
              {loadingAlerts ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-32 bg-slate-50 rounded-[2.5rem] animate-pulse"></div>
                ))
              ) : alerts.length > 0 ? (
                alerts.map((alert, idx) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-8 rounded-[2.8rem] border border-slate-100 shadow-sm flex gap-6 hover:shadow-md transition-all group ${alert.severity === 'CRITICAL' ? 'bg-rose-50/50' :
                      alert.severity === 'WARNING' ? 'bg-amber-50/50' : 'bg-blue-50/50'
                      }`}
                  >
                    <div className={`w-14 h-14 rounded-[1.4rem] flex items-center justify-center shrink-0 shadow-lg ${alert.severity === 'CRITICAL' ? 'bg-rose-600 text-white' :
                      alert.severity === 'WARNING' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
                      }`}>
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h5 className="text-base font-black text-slate-900 mb-1 leading-tight">{alert.title}</h5>
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Loader2 size={12} className="animate-spin text-blue-500" />
                        Updated {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-slate-50 p-16 rounded-[3.5rem] text-center border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 text-blue-600 shadow-xl">
                    <CloudLightning size={32} />
                  </div>
                  <h4 className="text-lg font-black text-slate-900 mb-2">Skies are Clear</h4>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">All flight operations are <br /> currently optimal.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Immersive CTA Section */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-slate-900 rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden group shadow-3xl"
        >
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/30 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/30 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tight leading-[0.9]">
                Your Horizon <br />
                <span className="text-blue-500">Awaits Discovery</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-2xl mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
                Join the elite network of travelers who choose SkyBooker for precision, luxury, and unmatched reliability.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="bg-white text-slate-900 px-12 py-6 rounded-3xl font-black text-xl shadow-2xl hover:bg-blue-600 hover:text-white transition-all hover:scale-105 active:scale-95"
                >
                  Start Your Journey
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;
