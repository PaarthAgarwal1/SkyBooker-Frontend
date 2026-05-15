import React, { useEffect, useState } from 'react';
import { adminApi } from '@shared/api/admin';
import { DataTable, ErrorState } from '@components/admin/dashboard/DashboardComponents';
import {
  Search,
  CreditCard,
  Download,
  Filter,
  RotateCcw,
  X
} from 'lucide-react';
import { formatINR } from '@shared/utils/currency';

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isFallback, setIsFallback] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [confirmInput, setConfirmInput] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getAllPayments();
      setPayments(response.data || []);
      setIsFallback(response.isFallback);

      if (response.error && response.status !== 404) {
        setError(response.error);
      }
    } catch (err: any) {
      setError('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ✅ Search & Filter Logic
  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ✅ Handle Download (Secure with Auth Header)
  const handleDownloadReceipt = async (paymentId: string, transactionId: string) => {
    try {
      setIsDownloading(paymentId);
      const response = await adminApi.downloadReceipt(paymentId);
      
      // Check if response is actually a PDF (not error JSON wrapped in a Blob)
      const blob = response.data;
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Server returned an error');
      }

      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download failed:', err);
      alert(err.message || 'Failed to download receipt. The file may not exist yet.');
    } finally {
      setIsDownloading(null);
    }
  };

  // ✅ Open Modal
  const openRefundModal = (payment: any) => {
    setSelectedPayment(payment);
    setConfirmInput('');
    setShowModal(true);
  };

  // ❌ Close Modal
  const closeModal = () => {
    if (isRefunding) return;
    setShowModal(false);
    setSelectedPayment(null);
    setConfirmInput('');
  };

  // ✅ Confirm Refund
  const confirmRefund = async () => {
    if (!selectedPayment) return;

    if (confirmInput !== selectedPayment.transactionId) {
      alert('Transaction ID does not match!');
      return;
    }

    try {
      setIsRefunding(true);
      const res = await adminApi.refundPayment(selectedPayment.paymentId);

      if (res.error) {
        throw new Error(res.error);
      }

      alert('Refund processed successfully!');
      closeModal();
      fetchPayments();
    } catch (error: any) {
      console.error('Refund failed:', error);
      alert(error.response?.data?.message || error.message || 'Refund failed');
    } finally {
      setIsRefunding(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={fetchPayments} />;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Financial Transactions</h2>
          <p className="text-slate-500 font-medium">
            Monitor revenue and payment logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search Transaction or User..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 text-sm"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-8 focus:ring-2 focus:ring-primary/20 text-sm font-bold text-slate-600 appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <DataTable
          loading={loading}
          data={filteredPayments}
          isFallback={isFallback}
          emptyTitle="Transaction History"
          columns={[
            { key: 'transaction', label: 'Transaction' },
            { key: 'customer', label: 'Customer' },
            { key: 'status', label: 'Status' },
            { key: 'amount', label: 'Amount', align: 'right' },
            { key: 'actions', label: 'Actions', align: 'right' },
          ]}
          renderRow={(payment) => (
            <tr key={payment.paymentId} className="hover:bg-slate-50/50">

              {/* Transaction */}
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                    <CreditCard size={20} />
                  </div>
                  <span className="text-xs font-black text-slate-500 uppercase truncate max-w-[180px]" title={payment.transactionId}>
                    {payment.transactionId || 'N/A'}
                  </span>
                </div>
              </td>

              {/* Customer */}
              <td className="px-6 py-4 font-bold text-sm text-slate-900">
                {payment.username || 'Unknown'}
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${payment.status === 'PAID'
                  ? 'bg-emerald-100 text-emerald-600'
                  : payment.status === 'FAILED'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-orange-100 text-orange-600'
                  }`}>
                  {payment.status}
                </span>
              </td>

              {/* Amount */}
              <td className="px-6 py-4 text-right font-black text-slate-900">
                {formatINR(payment.amount)}
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end space-x-2">

                  {payment.status === 'PAID' && (
                    <button
                      onClick={() => openRefundModal(payment)}
                      className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Refund"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDownloadReceipt(payment.paymentId, payment.transactionId)}
                    disabled={isDownloading === payment.paymentId}
                    className={`p-2 rounded-lg transition-all ${isDownloading === payment.paymentId
                      ? 'bg-emerald-50 text-emerald-500 animate-pulse'
                      : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
                      }`}
                    title="Download Receipt"
                  >
                    {isDownloading === payment.paymentId ? (
                      <div className="w-4.5 h-4.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>

      {/* ✅ Refund Confirmation Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Confirm Refund</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Attention</p>
                <p className="text-sm text-orange-700 leading-relaxed font-medium">
                  This action will refund {formatINR(selectedPayment.amount)} to the customer. This cannot be undone.
                </p>
              </div>

              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
                  Type transaction ID to confirm:
                </p>
                <p className="text-sm font-mono font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 select-all">
                  {selectedPayment.transactionId}
                </p>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="Paste Transaction ID here"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                disabled={isRefunding}
                className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>

              <button
                onClick={confirmRefund}
                disabled={isRefunding || confirmInput !== selectedPayment.transactionId}
                className="flex-1 py-3.5 rounded-xl bg-orange-500 text-white font-black shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRefunding ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <RotateCcw size={18} />
                    <span>Confirm Refund</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentsPage;
