import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Plane,
  Ticket,
  RefreshCcw,
  Database,
  ChevronRight,
  ArrowUpRight,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminApi, AdminStats } from '@shared/api/admin';
import {
  StatCard,
  DataTable,
  ErrorState,
  StatusBadge,
} from '@components/admin/dashboard/DashboardComponents';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [financials, setFinancials] = useState({
    totalRevenue: 0,
    totalRefunded: 0,
    failedPayments: 0,
    successRate: 0
  });

  const [fallbacks, setFallbacks] = useState({
    stats: false,
    bookings: false,
    payments: false
  });

  const [useMockData, setUseMockData] = useState(false);

  // Normalize booking
  const normalizeBooking = (b: any) => ({
    id: b.id,
    pnr: b.pnr,
    amount: b.amount,
    status: b.status,
    createdAt: b.createdAt
  });

  // Normalize payment
  const normalizePayment = (p: any) => ({
    id: p.paymentId,
    transactionId: p.transactionId,
    username: p.username,
    amount: p.amount,
    status: p.status,
    createdAt: p.createdAt
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (useMockData) {
        await new Promise(r => setTimeout(r, 800));

        setStats({
          totalUsers: 1450,
          totalBookings: 890,
          totalRevenue: 113400,
          totalAirports: 120,
          totalAirlines: 45,
          totalFlights: 320
        });

        setBookings([
          { id: '1', pnr: 'BK-9021', amount: 4500, status: 'CONFIRMED' },
          { id: '2', pnr: 'BK-8832', amount: 8200, status: 'PENDING' },
          { id: '3', pnr: 'BK-1234', amount: 6500, status: 'CANCELLED' },
        ]);

        setPayments([
          { id: '1', transactionId: 'TX-9901123456789', username: 'Paarth', amount: 4500, status: 'PAID' },
          { id: '2', transactionId: 'TX-9901123456790', username: 'John', amount: 8200, status: 'FAILED' },
        ]);

        setFinancials({
          totalRevenue: 125000,
          totalRefunded: 12000,
          failedPayments: 5,
          successRate: 92
        });

        return;
      }

      const [usersRes, bookingsRes, paymentsRes] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAllBookings(),
        adminApi.getAllPayments()
      ]);

      const allPayments = paymentsRes.data || [];

      // ✅ Revenue Logic
      const paidPayments = allPayments.filter((p: any) => p.status === 'PAID');
      const refundedPayments = allPayments.filter((p: any) => p.status === 'REFUNDED');
      const failedPayments = allPayments.filter((p: any) => p.status === 'FAILED');

      const totalRevenue = paidPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const totalRefunded = refundedPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const netRevenue = totalRevenue - totalRefunded;

      const successRate = allPayments.length
        ? Number(((paidPayments.length / allPayments.length) * 100).toFixed(1))
        : 0;

      setFinancials({
        totalRevenue,
        totalRefunded,
        failedPayments: failedPayments.length,
        successRate
      });

      // Stats
      setStats({
        totalUsers: usersRes.data.length,
        totalBookings: bookingsRes.data.length,
        totalRevenue: netRevenue,
        totalFlights: 0,
        totalAirports: 0,
        totalAirlines: 0
      });

      // Sort latest first
      const sortedPayments = [...allPayments].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      const recentPayments = sortedPayments.slice(0, 5).map(normalizePayment);

      const recentBookings = bookingsRes.data
        .slice(0, 5)
        .map(normalizeBooking);

      setBookings(recentBookings);
      setPayments(recentPayments);

      setFallbacks({
        stats: usersRes.isFallback || bookingsRes.isFallback || paymentsRes.isFallback,
        bookings: bookingsRes.isFallback,
        payments: paymentsRes.isFallback
      });

    } catch (err) {
      setError('Unexpected error while loading dashboard.');
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Net Revenue', value: stats?.totalRevenue ? `₹${stats.totalRevenue.toLocaleString()}` : undefined, icon: IndianRupee, color: 'bg-emerald-500' },
    { label: 'Total Bookings', value: stats?.totalBookings, icon: Ticket, color: 'bg-orange-500' },
    { label: 'Success Rate', value: `${financials.successRate}%`, icon: ShieldCheck, color: 'bg-indigo-500' },
  ];

  if (error) return <div className="p-8"><ErrorState message={error} onRetry={fetchDashboardData} /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time metrics and operational performance for SkyBooker.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setUseMockData(!useMockData)}
            className={`p-3 rounded-2xl border transition-all ${useMockData ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-600 hover:text-blue-600'}`}
            title="Toggle Mock Data"
          >
            <Database size={20} />
          </button>

          <button
            onClick={fetchDashboardData}
            className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 rounded-2xl transition-all shadow-sm group"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin text-blue-600' : 'group-active:rotate-180 transition-transform duration-500'} />
          </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="h-full">
            <StatCard {...stat} loading={loading} isFallback={fallbacks.stats} />
          </div>
        ))}
      </div>

      {/* Financial Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 text-emerald-500/10 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Revenue</p>
          <h4 className="text-3xl font-black text-slate-900 tracking-tight">₹{financials.totalRevenue.toLocaleString()}</h4>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest bg-emerald-50 w-fit px-3 py-1 rounded-full">
            <TrendingUp size={12} /> Live Processing
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 text-rose-500/10 group-hover:scale-110 transition-transform">
            <IndianRupee size={80} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Refunded</p>
          <h4 className="text-3xl font-black text-slate-900 tracking-tight">₹{financials.totalRefunded.toLocaleString()}</h4>
          <div className="mt-4 flex items-center gap-2 text-rose-600 font-bold text-[10px] uppercase tracking-widest bg-rose-50 w-fit px-3 py-1 rounded-full">
            <TrendingUp size={12} className="rotate-180" /> Operational Loss
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 text-amber-500/10 group-hover:scale-110 transition-transform">
            <AlertCircle size={80} />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Failed Payments</p>
          <h4 className="text-3xl font-black text-slate-900 tracking-tight">{financials.failedPayments}</h4>
          <div className="mt-4 flex items-center gap-2 text-amber-600 font-bold text-[10px] uppercase tracking-widest bg-amber-50 w-fit px-3 py-1 rounded-full">
            <AlertCircle size={12} /> Needs Review
          </div>
        </motion.div>
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* RECENT BOOKINGS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-w-0">
          <div className="p-8 flex items-center justify-between border-b border-slate-50">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Bookings</h3>
              <p className="text-xs font-medium text-slate-400">Latest travel reservations</p>
            </div>
            <button
              onClick={() => navigate('/admin/bookings')}
              className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="w-full">
            <DataTable
              loading={loading}
              data={bookings}
              isFallback={fallbacks.bookings}
              emptyTitle="No recent bookings found"
              columns={[
                { key: 'pnr', label: 'PNR' },
                { key: 'status', label: 'Status' },
                { key: 'amount', label: 'Revenue', align: 'right' }
              ]}
              renderRow={(b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-none">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{b.pnr}</span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter mt-0.5">ID: {b.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-900 text-sm">₹{b.amount.toLocaleString()}</td>
                </tr>
              )}
            />
          </div>
        </div>

        {/* RECENT PAYMENTS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-w-0">
          <div className="p-8 flex items-center justify-between border-b border-slate-50">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Financial Stream</h3>
              <p className="text-xs font-medium text-slate-400">Latest payment transactions</p>
            </div>
            <button
              onClick={() => navigate('/admin/payments')}
              className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center transition-all"
            >
              <ArrowUpRight size={20} />
            </button>
          </div>

          <div className="w-full">
            <DataTable
              loading={loading}
              data={payments}
              isFallback={fallbacks.payments}
              emptyTitle="No recent payments found"
              columns={[
                { key: 'transactionId', label: 'Transaction' },
                { key: 'status', label: 'Status' },
                { key: 'amount', label: 'Amount', align: 'right' }
              ]}
              renderRow={(p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-none">
                  <td className="px-6 py-5">
                    <div className="flex flex-col max-w-[180px]">
                      <span className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors" title={p.transactionId}>
                        {p.transactionId}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter mt-0.5">{p.username || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-5 text-right font-black text-slate-900 text-sm">₹{p.amount.toLocaleString()}</td>
                </tr>
              )}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;