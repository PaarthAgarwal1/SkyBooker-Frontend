import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plane,
  MapPin,
  Clock,
  Save,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Tag
} from 'lucide-react';
import { staffApi, Flight, CreateFlightRequest } from '@shared/api/staff';
import apiClient from '@shared/api/apiClient';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuthStore } from '@store/authStore';

interface Airport {
  airportId: string;
  airportName: string;
  city: string;
  country: string;
  iataCode: string;
}

const FlightForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [loadingAirports, setLoadingAirports] = useState(true);
  const [airports, setAirports] = useState<Airport[]>([]);
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<CreateFlightRequest & { status: string }>({
    flightNumber: '',
    airlineId: user?.airlineId || '',
    originAirportCode: '',
    destinationAirportCode: '',
    departureTime: '',
    arrivalTime: '',
    aircraftType: 'Airbus A320',
    basePrice: 0,
    status: 'ON_TIME'
  });

  // console.log("FormData:", formData);

  useEffect(() => {
    const fetchAirports = async () => {
      try {
        const res = await apiClient.get<Airport[]>('/airport');
        setAirports(res.data);
      } catch (error) {
        toast.error('Failed to load airports');
      } finally {
        setLoadingAirports(false);
      }
    };
    fetchAirports();

    const fetchFlight = async () => {
      if (isEdit) {
        setLoading(true);
        try {
          const res = await staffApi.getFlightById(id!);
          if (res.data) {
            setFormData({
              ...res.data,
              departureTime: res.data.departureTime.slice(0, 16),
              arrivalTime: res.data.arrivalTime.slice(0, 16)
            } as any);
          }
        } catch (error) {
          toast.error('Flight not found');
          navigate('/staff/flights');
        }
        setLoading(false);
      }
    };
    fetchFlight();
  }, [id, isEdit, navigate]);

  const isInvalid = !!(formData.originAirportCode && formData.destinationAirportCode && formData.originAirportCode === formData.destinationAirportCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalid) {
      toast.error('Origin and Destination airports must be different');
      return;
    }

    setLoading(true);

    if (!isDepartureValid(formData.departureTime)) {
      toast.error('Departure must be at least 10 minutes in the future');
      return;
    }

    try {
      if (isEdit) {
        await staffApi.updateFlight(id!, formData);
        toast.success('Flight details updated');
        navigate('/staff/flights');
      } else {
        const res = await staffApi.createFlight(formData);
        toast.success('New flight scheduled. Please configure seats.');
        const newFlightId = res.data.flightId || res.data.id;
        navigate(`/staff/seats/${newFlightId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save flight');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = { ...prev, [name]: (name === 'basePrice') ? parseFloat(value) : value };

      if (name === 'originAirportCode' && updated.originAirportCode === updated.destinationAirportCode) {
        updated.destinationAirportCode = '';
        toast('Destination reset. It cannot match origin.', { icon: '🔄' });
      }

      return updated;
    });
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10); // 10 min buffer

    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);

    return local.toISOString().slice(0, 16);
  };

  const isDepartureValid = (departure: string) => {
    const selected = new Date(departure);
    const now = new Date();
    now.setMinutes(now.getMinutes() + 10);

    return selected > now;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate('/staff/flights')}
          className="p-3 bg-white hover:bg-slate-50 rounded-2xl text-slate-400 transition-all border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{isEdit ? 'Update Flight' : 'Schedule Flight'}</h2>
          <p className="text-slate-500 font-medium mt-1">Configure flight route, timing and pricing details.</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 space-y-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Section 1: Identification */}
          <div className="space-y-8">
            <h3 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-8 h-px bg-blue-100"></span>
              Identification
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Flight Number</label>
                <div className="relative">
                  <Plane className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    required
                    type="text"
                    name="flightNumber"
                    value={formData.flightNumber}
                    onChange={handleChange}
                    placeholder="e.g. SB-101"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Base Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      required
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Current Status</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-10 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="ON_TIME">On Time</option>
                      <option value="DELAYED">Delayed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="BOARDING">Boarding</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Route Details */}
          <div className="space-y-8">
            <h3 className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-8 h-px bg-emerald-100"></span>
              Route & Path
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Origin City</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 w-5 h-5" />
                  <select
                    required
                    name="originAirportCode"
                    value={formData.originAirportCode}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>{loadingAirports ? 'Loading airports...' : 'Select Origin Airport'}</option>
                    {airports.map(airport => (
                      <option key={airport.airportId} value={airport.iataCode}>
                        {airport.city} ({airport.iataCode}) - {airport.airportName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Destination City</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 w-5 h-5" />
                  <select
                    required
                    name="destinationAirportCode"
                    value={formData.destinationAirportCode}
                    onChange={handleChange}
                    disabled={!formData.originAirportCode}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="" disabled>{loadingAirports ? 'Loading airports...' : 'Select Destination Airport'}</option>
                    {airports.filter(a => a.iataCode !== formData.originAirportCode).map(airport => (
                      <option key={airport.airportId} value={airport.iataCode}>
                        {airport.city} ({airport.iataCode}) - {airport.airportName}
                      </option>
                    ))}
                  </select>
                </div>
                {isInvalid && (
                  <p className="text-red-500 text-xs mt-2 ml-1">Origin and Destination airports must be different</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Timeline */}
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-sm font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-8 h-px bg-amber-100"></span>
              Flight Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Departure Schedule</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    required
                    type="datetime-local"
                    name="departureTime"
                    value={formData.departureTime}
                    min={getMinDateTime()}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Arrival Schedule</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    required
                    type="datetime-local"
                    name="arrivalTime"
                    value={formData.arrivalTime}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
            <AlertCircle className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase tracking-wider">Ensure all data matches current GDS schedules.</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate('/staff/flights')}
              className="flex-1 md:flex-none px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold transition-all border border-slate-100"
            >
              Cancel
            </button>
            <button
              disabled={loading || isInvalid || loadingAirports}
              type="submit"
              className="flex-1 md:flex-none flex items-center justify-center gap-3 px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEdit ? 'Update Flight' : 'Schedule Flight'}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
};

export default FlightForm;
