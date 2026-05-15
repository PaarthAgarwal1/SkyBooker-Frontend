import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@shared/api/admin';
import { DataTable, ErrorState } from '@components/admin/dashboard/DashboardComponents';
import { Search, MapPin, User, Ticket, ExternalLink, XCircle } from 'lucide-react';
import { formatINR } from '@shared/utils/currency';

/* ================= TYPES ================= */

interface Booking {
  id: string;
  pnr: string;
  passenger: string[];
  route: string;
  amount: number;
  status: string;
}

/* ================= COMPONENT ================= */

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFallback, setIsFallback] = useState(false);

  /* ================= FETCH ================= */

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminApi.getAllBookings();

      setBookings(response.data || []);
      setIsFallback(response.isFallback);

      if (response.error && response.status !== 404) {
        setError(response.error);
      }

      console.log("Bookings:", response.data);

    } catch (err: any) {
      setError('Failed to load bookings database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  /* ================= CANCEL ================= */

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await adminApi.cancelBooking(bookingId);
      alert('Booking cancelled successfully!');
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Cancellation failed');
    }
  };

  /* ================= FILTER ================= */

  const filteredBookings = bookings.filter((b) => {
    const passengerNames = (b.passenger || []).join(" ").toLowerCase();

    return (
      b.pnr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      passengerNames.includes(searchTerm.toLowerCase())
    );
  });

  /* ================= ERROR ================= */

  if (error) {
    return <ErrorState message={error} onRetry={fetchBookings} />;
  }

  /* ================= EMPTY ================= */

  if (!loading && bookings.length === 0) {
    return <ErrorState message="No bookings found" onRetry={fetchBookings} />;
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">All Bookings</h2>
          <p className="text-slate-500 font-medium">
            Global database of all passenger reservations.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search PNR or Passenger..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">

        <DataTable
          loading={loading}
          data={filteredBookings}
          isFallback={isFallback}
          emptyTitle="Booking Database"
          columns={[
            { key: 'details', label: 'Booking Details' },
            { key: 'passenger', label: 'Passenger' },
            { key: 'status', label: 'Status' },
            { key: 'payment', label: 'Payment' },
            { key: 'actions', label: 'Actions', align: 'right' },
          ]}

          renderRow={(booking: Booking) => (
            <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">

              {/* BOOKING DETAILS */}
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Ticket size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase">
                      {booking.pnr}
                    </p>

                    <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                      <MapPin size={10} className="mr-1" />
                      {booking.route || 'Route N/A'}
                    </div>
                  </div>
                </div>
              </td>

              {/* PASSENGER */}
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <User size={14} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">
                    {booking.passenger?.length
                      ? booking.passenger.join(", ")
                      : "N/A"}
                  </span>
                </div>
              </td>

              {/* STATUS */}
              <td className="px-6 py-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-600'
                    : booking.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-orange-100 text-orange-600'
                    }`}
                >
                  {booking.status}
                </span>
              </td>

              {/* PAYMENT */}
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-900">
                    {formatINR(booking.amount || 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Via Stripe
                  </span>
                </div>
              </td>

              {/* ACTIONS */}
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end space-x-2">

                  {booking.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Cancel Booking"
                    >
                      <XCircle size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                    className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all"
                    title="View Details"
                  >
                    <ExternalLink size={18} />
                  </button>

                </div>
              </td>
            </tr>
          )}
        />

      </div>
    </div>
  );
};

export default BookingsPage;