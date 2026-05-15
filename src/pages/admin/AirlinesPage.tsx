import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { adminApi, Airline } from '@shared/api/admin';
import { Plus, Plane, Globe, Power, Trash2, Edit2, Search, AlertCircle } from 'lucide-react';
import Modal from '@components/Modal';

const AirlinesPage: React.FC = () => {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected airline for edit / delete
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);

  // Form
  const [formData, setFormData] = useState({
    airlineName: '',
    iataCode: '',
    country: '',
    logoUrl: ''
  });

  const fetchAirlines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getAllAirlines();
      if (response.error) {
        setError(response.error);
      } else {
        setAirlines(response.data || []);
      }
      console.log(response);
    } catch (err: any) {
      setError('Failed to fetch airlines. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAirlines();
  }, [fetchAirlines]);

  const resetForm = () => {
    setFormData({ airlineName: '', iataCode: '', country: '', logoUrl: '' });
    setSelectedAirline(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (airline: Airline) => {
    setSelectedAirline(airline);
    setFormData({
      airlineName: airline.airlineName || '',
      iataCode: airline.iataCode || '',
      country: airline.country || '',
      logoUrl: airline.logoUrl || ''
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (airline: Airline) => {
    setSelectedAirline(airline);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedAirline?.airlineId) {
        await adminApi.updateAirline(selectedAirline.airlineId, formData);
      } else {
        await adminApi.createAirline(formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchAirlines();
    } catch (err) {
      alert(selectedAirline ? 'Failed to update airline' : 'Failed to create airline');
    }
  };

  const handleToggleActive = async (airline: Airline) => {
    console.log("handleToggleActive " + airline);
    try {
      if (airline.active) {
        await adminApi.deactivateAirline(airline.airlineId);
      } else {
        await adminApi.activateAirline(airline.airlineId);
      }
      fetchAirlines();
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    if (!selectedAirline?.airlineId) return;
    try {
      await adminApi.deleteAirline(selectedAirline.airlineId);
      setIsDeleteModalOpen(false);
      setSelectedAirline(null);
      fetchAirlines();
    } catch (err) {
      alert('Failed to delete airline');
    }
  };

  // Filtered airlines
  const filteredAirlines = useMemo(() => {
    return airlines.filter((airline) => {
      const matchesSearch =
        airline.airlineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airline.iataCode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterActive === 'all' ? true :
          filterActive === 'active' ? airline.active : !airline.active;

      return matchesSearch && matchesFilter;
    });
  }, [airlines, searchTerm, filterActive]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Airlines</h2>
          <p className="text-slate-500 font-medium">Manage airline partners and their details.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Airline</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
            placeholder="Search by name or IATA code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="block w-full sm:w-48 pl-3 pr-10 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all font-medium"
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value as any)}
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl"></div>
                <div className="flex-grow space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAirlines.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center shadow-sm">
          <Plane size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No airlines found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            {airlines.length === 0
              ? "You haven't added any airlines yet. Click 'Add Airline' to get started."
              : "No airlines match your current search and filter criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAirlines.map((airline) => (
            <div key={airline.airlineId} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-md transition-all relative overflow-hidden flex flex-col h-full">
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner group-hover:bg-white transition-colors overflow-hidden shrink-0">
                    {airline.logoUrl ? (
                      <img src={airline.logoUrl} alt={airline.airlineName} className="w-full h-full object-contain p-2" />
                    ) : (
                      <Plane size={32} className="text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-none line-clamp-1" title={airline.airlineName}>{airline.airlineName}</h3>
                    <p className="text-xs font-black text-primary mt-1 tracking-widest">{airline.iataCode}</p>
                    <div className="flex items-center text-[10px] text-slate-400 font-bold mt-1 uppercase">
                      <Globe size={10} className="mr-1" />
                      <span className="line-clamp-1">{airline.country}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(airline)}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit Airline"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(airline)}
                    className={`p-2 rounded-lg transition-all ${airline.active ? 'text-red-400 hover:bg-red-50 hover:text-red-500' : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-500'}`}
                    title={airline.active ? "Deactivate Airline" : "Activate Airline"}
                  >
                    <Power size={16} />
                  </button>
                  <button
                    onClick={() => openDeleteModal(airline)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Airline"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {!airline.active && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter shadow-sm z-20">
                  Deactivated
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal title={selectedAirline ? "Update Airline" : "Add New Airline"} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Airline Name</label>
                <input
                  type="text"
                  required
                  value={formData.airlineName}
                  onChange={(e) => setFormData({ ...formData, airlineName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-slate-900"
                  placeholder="e.g. Indigo"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">IATA Code</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formData.iataCode}
                  onChange={(e) => setFormData({ ...formData, iataCode: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-slate-900 uppercase"
                  placeholder="e.g. 6E"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Country</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-slate-900"
                placeholder="e.g. India"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Logo URL (Optional)</label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium text-slate-900"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold hover:bg-secondary transition-all shadow-md shadow-primary/20"
              >
                {selectedAirline ? "Update Airline" : "Create Airline"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Modal title="Confirm Delete" onClose={() => setIsDeleteModalOpen(false)}>
          <div className="p-2">
            <div className="flex items-center space-x-3 text-red-600 mb-4 bg-red-50 p-3 rounded-xl border border-red-100">
              <AlertCircle size={24} />
              <p className="font-bold">Warning: This action cannot be undone.</p>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <strong className="text-slate-900">{selectedAirline?.airlineName}</strong> ({selectedAirline?.iataCode})?
              This will permanently remove the airline from the system.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all shadow-md shadow-red-500/20"
              >
                Delete Airline
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AirlinesPage;
