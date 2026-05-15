import React, { useEffect, useState } from 'react';
import { adminApi } from '@shared/api/admin';
import {
  Send,
  Users,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Mail,
  List
} from 'lucide-react';
import { DataTable } from '@components/admin/dashboard/DashboardComponents';

const NotificationsPage: React.FC = () => {

  const [activeTab, setActiveTab] = useState<'SEND' | 'HISTORY'>('SEND');

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    target: 'ALL'
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [status, setStatus] = useState<{
    type: 'success' | 'error',
    msg: string
  } | null>(null);

  // ✅ FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    setTableLoading(true);
    try {
      const res = await adminApi.getAllNotifications();
      setNotifications(res.data || []);
    } catch {
      console.error("Failed to fetch notifications");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      fetchNotifications();
    }
  }, [activeTab]);

  // ✅ SEND NOTIFICATION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await adminApi.sendNotification({
        subject: formData.subject,
        message: formData.message,
        emails: formData.target === 'ALL' ? [] : []
      });

      setStatus({ type: 'success', msg: 'Notification sent successfully!' });
      setFormData({ subject: '', message: '', target: 'ALL' });

    } catch (error: any) {
      setStatus({ type: 'error', msg: error.message || 'Failed to send notification' });
    } finally {
      setLoading(false);
    }
  };

  // ✅ RETRY FAILED
  const handleRetry = async (id: string) => {
    try {
      await adminApi.retryNotification(id);
      fetchNotifications();
    } catch {
      alert("Retry failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-black text-slate-900">
          Notifications Center
        </h2>
        <p className="text-slate-500 font-medium mt-1">
          Send and monitor platform notifications.
        </p>
      </div>

      {/* ✅ TOGGLE BUTTON */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('SEND')}
          className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center space-x-2 transition-all ${activeTab === 'SEND'
              ? 'bg-white shadow text-primary'
              : 'text-slate-500'
            }`}
        >
          <Mail size={16} />
          <span>Send</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center space-x-2 transition-all ${activeTab === 'HISTORY'
              ? 'bg-white shadow text-primary'
              : 'text-slate-500'
            }`}
        >
          <List size={16} />
          <span>History</span>
        </button>
      </div>

      {/* STATUS */}
      {status && activeTab === 'SEND' && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 ${status.type === 'success'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-red-50 text-red-700'
          }`}>
          {status.type === 'success'
            ? <CheckCircle2 size={20} />
            : <AlertCircle size={20} />
          }
          <span className="font-bold">{status.msg}</span>
        </div>
      )}

      {/* ================= SEND TAB ================= */}
      {activeTab === 'SEND' && (
        <div className="bg-white rounded-2xl shadow-sm border">

          <div className="bg-primary p-6 text-white">
            <h3 className="text-lg font-bold">Send Notification</h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* TARGET */}
            <div className="grid grid-cols-3 gap-4">
              {['ALL', 'ADMINS', 'PASSENGERS'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData({ ...formData, target: role })}
                  className={`p-3 rounded-xl font-bold border ${formData.target === role
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                >
                  <Users size={16} className="inline mr-1" />
                  {role}
                </button>
              ))}
            </div>

            {/* SUBJECT */}
            <input
              type="text"
              placeholder="Subject"
              required
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full border rounded-xl p-3"
            />

            {/* MESSAGE */}
            <textarea
              placeholder="Message..."
              required
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full border rounded-xl p-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold"
            >
              {loading ? 'Sending...' : 'Send Notification'}
            </button>

          </form>
        </div>
      )}

      {/* ================= HISTORY TAB ================= */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          <div className="p-6 border-b">
            <h3 className="text-xl font-bold">Notification History</h3>
          </div>

          <DataTable
            loading={tableLoading}
            data={notifications}
            emptyTitle="No Notifications"
            columns={[
              { key: 'message', label: 'Message' },
              { key: 'email', label: 'Recipient' },
              { key: 'type', label: 'Type' },
              { key: 'status', label: 'Status' },
              { key: 'time', label: 'Sent At' },
              { key: 'actions', label: 'Actions' },
            ]}
            renderRow={(n) => (
              <tr key={n.notificationId}>

                <td className="px-6 py-4 text-sm">{n.message}</td>

                <td className="px-6 py-4 text-sm">
                  {n.email || 'ALL USERS'}
                </td>

                <td className="px-6 py-4 text-xs font-bold">
                  {n.type}
                </td>

                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${n.status === 'SENT'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-red-100 text-red-600'
                    }`}>
                    {n.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-xs text-slate-500">
                  {n.sentAt
                    ? new Date(n.sentAt).toLocaleString()
                    : 'N/A'}
                </td>

                <td className="px-6 py-4">
                  {n.status === 'FAILED' && (
                    <button
                      onClick={() => handleRetry(n.notificationId)}
                      className="text-orange-500 hover:underline text-xs font-bold flex items-center"
                    >
                      <RotateCcw size={14} className="mr-1" />
                      Retry
                    </button>
                  )}
                </td>

              </tr>
            )}
          />
        </div>
      )}

    </div>
  );
};

export default NotificationsPage;