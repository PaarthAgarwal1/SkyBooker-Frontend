import React, { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Download,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Plane
} from 'lucide-react';
import { staffApi, RevenueAnalyticsResponse } from '@shared/api/staff';
import { formatINR } from '@shared/utils/currency';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@store/authStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'weekly' | 'monthly'>('monthly');
  const [analytics, setAnalytics] = useState<RevenueAnalyticsResponse>({
    totalRevenue: 0,
    growthPercentage: 0,
    routeRevenue: [],
    cabinDistribution: { economy: 0, business: 0, firstClass: 0 },
    revenueTrends: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.airlineId) {
        if (user) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await staffApi.getRevenueAnalytics(user.airlineId, range);
        if (res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        toast.error("Failed to load revenue analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user, range]);

  const formatCurrency = (val: number) => {
    return formatINR(val);
  };

  const lineData = {
    labels: analytics.revenueTrends.map(t => t.date),
    datasets: [{
      label: 'Revenue',
      data: analytics.revenueTrends.map(t => t.revenue),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
    }]
  };

  const barData = {
    labels: analytics.routeRevenue.map(r => r.route),
    datasets: [{
      label: 'Revenue (₹)',
      data: analytics.routeRevenue.map(r => r.revenue),
      backgroundColor: '#3b82f6',
      borderRadius: 8,
      barThickness: 24
    }]
  };

  const pieData = {
    labels: ['Economy', 'Business', 'First Class'],
    datasets: [{
      data: [
        analytics.cabinDistribution.economy,
        analytics.cabinDistribution.business,
        analytics.cabinDistribution.firstClass
      ],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 12 },
      }
    },
    scales: {
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    }
  };

  const topRoutes = useMemo(() => {
    return [...analytics.routeRevenue]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [analytics.routeRevenue]);

  const isEmpty = !loading && analytics.totalRevenue === 0 && analytics.routeRevenue.length === 0;

  if (loading) {
    return <div className="flex items-center justify-center h-full min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div></div>;
  }

  if (isEmpty) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Revenue Analytics</h2>
            <p className="text-slate-500 font-medium mt-1">Real-time financial intelligence and performance tracking.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={() => setRange('weekly')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${range === 'weekly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Weekly</button>
            <button onClick={() => setRange('monthly')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${range === 'monthly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>Monthly</button>
          </div>
        </div>
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-24 text-center border-dashed">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
            <DollarSign className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Revenue Data Yet</h3>
          <p className="text-slate-500 font-medium mt-3 max-w-md mx-auto">
            There are no completed transactions for the selected period ({range}). Once bookings are processed, your financial intelligence will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ... existing dashboard content ... */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Revenue Analytics</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time financial intelligence and performance tracking.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setRange('weekly')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${range === 'weekly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setRange('monthly')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${range === 'monthly' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Monthly
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <button 
            onClick={() => window.print()}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          label="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          growth={analytics.growthPercentage}
          loading={loading}
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
        />
        <StatsCard 
          label="Avg. Seat Yield"
          value={formatINR(12500)}
          growth={2.4}
          loading={loading}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
        />
        <StatsCard 
          label="Load Factor"
          value="88.4%"
          growth={-1.2}
          loading={loading}
          icon={<UsersIcon className="w-5 h-5 text-amber-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <LineChartIcon className="w-6 h-6 text-blue-600" />
                Revenue Trends
              </h3>
              <p className="text-sm text-slate-400 font-medium mt-1">Growth trajectory over time</p>
            </div>
          </div>
          
          <div className="h-[400px]">
            {loading ? <SkeletonLoader /> : <Line data={lineData} options={commonOptions} />}
          </div>
        </div>

        {/* Top Routes List */}
        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <Plane className="w-6 h-6 text-indigo-600" />
            Top Routes
          </h3>
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse" />)
            ) : (
              topRoutes.map((route, idx) => (
                <div key={route.route} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{route.route}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Domestic</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">{formatCurrency(route.revenue)}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <ArrowUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-500">12%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Route Profitability Bar */}
        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Route Performance
          </h3>
          <div className="h-[300px]">
            {loading ? <SkeletonLoader /> : <Bar data={barData} options={commonOptions} />}
          </div>
        </div>

        {/* Cabin Distribution Pie */}
        <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <PieChartIcon className="w-6 h-6 text-emerald-600" />
            Revenue by Cabin
          </h3>
          <div className="flex items-center gap-8 h-[300px]">
            <div className="w-1/2 h-full">
              {loading ? <SkeletonLoader circle /> : <Pie data={pieData} options={{ plugins: { legend: { display: false } } }} />}
            </div>
            <div className="w-1/2 space-y-4">
              <DistributionItem label="Economy" value={analytics.cabinDistribution.economy} color="bg-blue-600" />
              <DistributionItem label="Business" value={analytics.cabinDistribution.business} color="bg-emerald-500" />
              <DistributionItem label="First Class" value={analytics.cabinDistribution.firstClass} color="bg-amber-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const StatsCard = ({ label, value, growth, icon, loading }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm group hover:border-slate-200 transition-all"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all">
        {icon}
      </div>
      {loading ? (
        <div className="h-4 w-12 bg-slate-100 animate-pulse rounded-full" />
      ) : (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {growth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(growth)}%
        </div>
      )}
    </div>
    {loading ? (
      <div className="space-y-3">
        <div className="h-8 w-32 bg-slate-100 animate-pulse rounded-lg" />
        <div className="h-3 w-20 bg-slate-50 animate-pulse rounded-lg" />
      </div>
    ) : (
      <>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">{label}</p>
      </>
    )}
  </motion.div>
);

const DistributionItem = ({ label, value, color }: any) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
      <span>{label}</span>
      <span className="text-slate-900">{value}%</span>
    </div>
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);

const SkeletonLoader = ({ circle }: { circle?: boolean }) => (
  <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-3xl animate-pulse">
    <div className={`${circle ? 'w-48 h-48 rounded-full' : 'w-full h-full'} bg-slate-100`} />
  </div>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default RevenueAnalytics;
