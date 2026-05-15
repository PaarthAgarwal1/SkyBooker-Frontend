import React, { useEffect, useState } from 'react';
import { adminApi, Airline } from '@shared/api/admin';
import Modal from '@components/Modal';
import { Plane, Check, AlertCircle, Loader2 } from 'lucide-react';

interface AssignAirlineModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignAirlineModal: React.FC<AssignAirlineModalProps> = ({ userId, userName, onClose, onSuccess }) => {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [selectedAirlineId, setSelectedAirlineId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getAllAirlines();
        if (response.error) {
          setError(response.error);
        } else {
          // Filter only active airlines
          setAirlines(response.data?.filter(a => a.active) || []);
        }
      } catch (err: any) {
        setError('Failed to load airlines');
      } finally {
        setLoading(false);
      }
    };

    fetchAirlines();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAirlineId) return;

    try {
      setSubmitting(true);
      setError(null);
      const response = await adminApi.assignAirline(userId, selectedAirlineId);
      
      if (response.error) {
        setError(response.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError('Failed to assign airline. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Assign Airline" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Target User</p>
          <p className="text-lg font-black text-slate-900">{userName}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-black text-slate-700 block ml-1">Select Airline</label>
          <div className="relative">
            {loading ? (
              <div className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4">
                <Loader2 size={18} className="animate-spin text-primary mr-2" />
                <span className="text-slate-400 font-medium">Fetching airlines...</span>
              </div>
            ) : (
              <select
                required
                value={selectedAirlineId}
                onChange={(e) => setSelectedAirlineId(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 focus:border-primary focus:ring-0 outline-none transition-all font-bold text-slate-900 appearance-none"
              >
                <option value="" disabled>Choose an airline</option>
                {airlines.map((airline) => (
                  <option key={airline.airlineId} value={airline.airlineId}>
                    {airline.airlineName} ({airline.iataCode})
                  </option>
                ))}
              </select>
            )}
            {!loading && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                <Plane size={18} />
              </div>
            )}
          </div>
          {airlines.length === 0 && !loading && !error && (
            <p className="text-xs text-amber-600 font-bold mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
              No active airlines available for assignment.
            </p>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedAirlineId || airlines.length === 0}
            className="flex-1 bg-primary text-white py-4 rounded-2xl font-black hover:bg-secondary transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {submitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Check size={20} />
                <span>Confirm Assignment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignAirlineModal;
