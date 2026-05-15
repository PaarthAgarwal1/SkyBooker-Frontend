import React, { useEffect, useState, useCallback } from 'react';
import { adminApi, Airport } from '@shared/api/admin';
import { Search, MapPin, Plane, Edit2, Trash2, CheckCircle, XCircle, AlertCircle, Plus, Clock } from 'lucide-react';
import Modal from '@components/Modal';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Simple Toast
const ToastMessage: React.FC<{ type: 'success' | 'error', message: string, onClose: () => void }> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl z-[100] transform transition-all ${type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
      }`}>
      {type === 'success' ? <CheckCircle size={24} className="text-emerald-500" /> : <XCircle size={24} className="text-red-500" />}
      <p className="font-bold">{message}</p>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">✕</button>
    </div>
  );
};

const COMMON_TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Dubai',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
  'UTC'
];

// Mock geocoding for bonus feature
const CITY_COORDINATES: Record<string, { lat: number, lng: number }> = {
  'London': { lat: 51.5074, lng: -0.1278 },
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Dubai': { lat: 25.2048, lng: 55.2708 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
};

const AirportsPage: React.FC = () => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // City Filter
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Airport>>({
    airportName: '', city: '', country: '', iataCode: '', icaoCode: '', timezone: '', latitude: 0, longitude: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => setToast({ type, message });

  const fetchAirports = useCallback(async (query: string, city: string) => {
    try {
      setLoading(true);
      let response;
      if (city !== 'ALL') {
        response = await adminApi.getAirportsByCity(city);
        console.log(response.data);
      } else if (query.trim() !== '') {
        response = await adminApi.searchAirports(query);
      } else {
        response = await adminApi.getAllAirports();
      }

      if (response.error) {
        showToast('error', response.error);
        setAirports([]);
      } else {
        setAirports(response.data || []);
        // Extract unique cities for the dropdown filter if we did a full fetch
        if (query === '' && city === 'ALL' && response.data) {
          const cities = Array.from(new Set(response.data.map(a => a.city))).filter(Boolean).sort();
          setAvailableCities(cities as string[]);
        }
      }
    } catch (error) {
      showToast('error', 'Failed to fetch airports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAirports(debouncedSearchTerm, selectedCity);
  }, [debouncedSearchTerm, selectedCity, fetchAirports]);

  const validateForm = (): boolean => {
    if (!formData.airportName || !formData.city || !formData.country || !formData.iataCode) {
      setValidationError('Please fill in all required fields.');
      return false;
    }
    if (!/^[A-Z]{3}$/.test(formData.iataCode)) {
      setValidationError('IATA code must be exactly 3 uppercase letters.');
      return false;
    }
    if (formData.icaoCode && !/^[A-Z]{4}$/.test(formData.icaoCode)) {
      setValidationError('ICAO code must be exactly 4 uppercase letters if provided.');
      return false;
    }
    if (formData.latitude !== undefined && (formData.latitude < -90 || formData.latitude > 90)) {
      setValidationError('Latitude must be between -90 and 90.');
      return false;
    }
    if (formData.longitude !== undefined && (formData.longitude < -180 || formData.longitude > 180)) {
      setValidationError('Longitude must be between -180 and 180.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ airportName: '', city: '', country: '', iataCode: '', icaoCode: '', timezone: '', latitude: 0, longitude: 0 });
    setValidationError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (airport: Airport) => {
    setEditingId(airport.airportId);
    setFormData({ ...airport });
    setValidationError(null);
    setIsModalOpen(true);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCity = e.target.value;
    setFormData({ ...formData, city: newCity });

    // Bonus: Auto-fill coordinates
    if (CITY_COORDINATES[newCity]) {
      setFormData(prev => ({
        ...prev,
        city: newCity,
        latitude: CITY_COORDINATES[newCity].lat,
        longitude: CITY_COORDINATES[newCity].lng
      }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        // Optimistic UI Update
        setAirports(prev => prev.map(a => a.airportId === editingId ? { ...a, ...formData } as Airport : a));
        await adminApi.updateAirport(editingId, formData);
        showToast('success', 'Airport updated successfully!');
      } else {
        const res = await adminApi.createAirport(formData);
        // Optimistic UI Update - if API returns the created item, use it, else append formData
        const newAirport = res?.data || { id: Math.random().toString(), ...formData } as Airport;
        setAirports(prev => [newAirport, ...prev]);
        showToast('success', 'Airport created successfully!');
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast('error', 'Failed to save airport. Please check your data.');
      // Revert optimistic update could be implemented here via refetching
      fetchAirports(debouncedSearchTerm, selectedCity);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    setSubmitting(true);
    // Optimistic UI Update
    setAirports(prev => prev.filter(a => a.airportId !== deletingId));
    setIsDeleteModalOpen(false);

    try {
      await adminApi.deleteAirport(deletingId);
      showToast('success', 'Airport deleted successfully.');
    } catch (err) {
      showToast('error', 'Failed to delete airport.');
      fetchAirports(debouncedSearchTerm, selectedCity);
    } finally {
      setSubmitting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Airports</h2>
          <p className="text-slate-500 font-medium">Manage global airports and locations.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center space-x-2 shrink-0"
        >
          <Plus size={20} />
          <span>Add Airport</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-primary font-bold text-slate-900 transition-all"
            placeholder="Search airports via backend..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="block w-full md:w-64 px-4 py-3 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:outline-none focus:border-primary font-bold text-slate-700 transition-all"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="ALL">All Cities</option>
          {availableCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 animate-pulse h-48"></div>
          ))}
        </div>
      ) : airports.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center shadow-sm">
          <MapPin size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-2">No airports found</h3>
          <p className="text-slate-500 font-medium">Try adjusting your search or add a new airport.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {airports.map(airport => (
            <div key={airport.airportId} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-md transition-all relative overflow-hidden flex flex-col h-full">
              <div className="flex items-start justify-between relative z-10 mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-100 shrink-0">
                    <Plane size={24} className="-rotate-45" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight line-clamp-1" title={airport.airportName}>
                      {airport.airportName}
                    </h3>
                    <div className="flex items-center text-xs text-slate-500 font-bold mt-1">
                      <MapPin size={12} className="mr-1" />
                      <span className="line-clamp-1">{airport.city}, {airport.country}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black tracking-widest border border-slate-200">
                    IATA: {airport.iataCode}
                  </span>
                  {airport.icaoCode && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black tracking-widest border border-slate-200">
                      ICAO: {airport.icaoCode}
                    </span>
                  )}
                </div>
                {airport.timezone && (
                  <div className="flex items-center text-xs font-bold text-slate-400">
                    <Clock size={12} className="mr-1.5" />
                    {airport.timezone}
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4 flex space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(airport)}
                  className="p-2 bg-white text-blue-500 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 rounded-xl transition-all shadow-sm"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => confirmDelete(airport.airportId)}
                  className="p-2 bg-white text-red-500 hover:bg-red-50 border border-slate-100 hover:border-red-200 rounded-xl transition-all shadow-sm"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <Modal title={editingId ? "Edit Airport" : "Add New Airport"} onClose={() => !submitting && setIsModalOpen(false)}>
          <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {validationError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 flex items-start gap-2 text-sm font-bold">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{validationError}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Airport Name *</label>
              <input
                type="text" required
                value={formData.airportName} onChange={e => setFormData({ ...formData, airportName: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City *</label>
                <input
                  type="text" required
                  value={formData.city} onChange={handleCityChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country *</label>
                <input
                  type="text" required
                  value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">IATA Code *</label>
                <input
                  type="text" required maxLength={3}
                  value={formData.iataCode} onChange={e => setFormData({ ...formData, iataCode: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900 uppercase"
                  placeholder="3 letters"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ICAO Code</label>
                <input
                  type="text" maxLength={4}
                  value={formData.icaoCode || ''} onChange={e => setFormData({ ...formData, icaoCode: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900 uppercase"
                  placeholder="4 letters"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                <span>Timezone</span>
                <span className="text-[10px] text-primary/70">Bonus Feature</span>
              </label>
              <select
                value={formData.timezone || ''} onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900"
              >
                <option value="">Select Timezone</option>
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                  <span>Latitude</span>
                  <span className="text-[10px] text-primary/70">Auto-fills</span>
                </label>
                <input
                  type="number" step="any"
                  value={formData.latitude === undefined ? '' : formData.latitude}
                  onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Longitude</label>
                <input
                  type="number" step="any"
                  value={formData.longitude === undefined ? '' : formData.longitude}
                  onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                type="button" onClick={() => setIsModalOpen(false)} disabled={submitting}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-black hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={submitting}
                className="flex-1 bg-primary text-white py-3 rounded-xl font-black hover:bg-secondary transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center"
              >
                {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (editingId ? "Update Airport" : "Add Airport")}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Modal title="Confirm Deletion" onClose={() => !submitting && setIsDeleteModalOpen(false)}>
          <div className="p-2">
            <div className="flex items-center space-x-3 text-red-600 mb-4 bg-red-50 p-4 rounded-2xl border border-red-100">
              <AlertCircle size={28} className="shrink-0" />
              <div>
                <p className="font-black text-lg">Are you absolutely sure?</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6 font-medium leading-relaxed">
              This action cannot be undone. This will permanently delete the airport from the system.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)} disabled={submitting}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete} disabled={submitting}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center"
              >
                {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Delete Airport'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notification */}
      {toast && <ToastMessage type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AirportsPage;
