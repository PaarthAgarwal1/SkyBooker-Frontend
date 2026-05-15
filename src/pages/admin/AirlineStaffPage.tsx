import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { adminApi, AdminUser } from '@shared/api/admin';
import { Search, User as UserIcon, CheckCircle, XCircle, Plane, UserPlus, Filter, Clock } from 'lucide-react';
import AssignAirlineModal from '@components/admin/AssignAirlineModal';

// Simple inline toast component
const ToastMessage: React.FC<{ type: 'success' | 'error', message: string, onClose: () => void }> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl z-[100] transform transition-all translate-y-0 opacity-100 ${
      type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
    }`}>
      {type === 'success' ? <CheckCircle size={24} className="text-emerald-500" /> : <XCircle size={24} className="text-red-500" />}
      <p className="font-bold">{message}</p>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">✕</button>
    </div>
  );
};

const AirlineStaffPage: React.FC = () => {
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      if (response.error) {
        showToast('error', response.error);
      } else {
        const staffOnly = (response.data || []).filter(user => user.role === 'AIRLINE_STAFF');
        console.log("Filtered Airline Staff:", staffOnly);
        setStaff(staffOnly);
      }
    } catch (err: any) {
      showToast('error', 'Failed to fetch airline staff.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  };

  const openAssignModal = (user: AdminUser) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
  };

  const filteredStaff = useMemo(() => {
    console.log("Rendered Users:", staff);
    return staff.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (user.fullName?.toLowerCase().includes(searchLower) || false) ||
        (user.email?.toLowerCase().includes(searchLower) || false);

      const isAssigned = !!user.airlineId;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ASSIGNED' && isAssigned) ||
        (statusFilter === 'UNASSIGNED' && !isAssigned);

      return matchesSearch && matchesStatus;
    });
  }, [staff, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 relative pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Airline Staff</h2>
          <p className="text-slate-500 font-medium">Manage and assign airline-specific personnel.</p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <UserIcon size={24} />
            </div>
            <span className="text-3xl font-black text-slate-900">{staff.length}</span>
          </div>
          <p className="text-slate-500 font-bold mt-4">Total Staff</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
              <CheckCircle size={24} />
            </div>
            <span className="text-3xl font-black text-slate-900">{staff.filter(s => !!s.airlineId).length}</span>
          </div>
          <p className="text-slate-500 font-bold mt-4">Assigned</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
              <Clock size={24} />
            </div>
            <span className="text-3xl font-black text-slate-900">{staff.filter(s => !s.airlineId).length}</span>
          </div>
          <p className="text-slate-500 font-bold mt-4">Unassigned</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-0 focus:border-primary font-bold text-slate-900 transition-all"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Filter size={18} className="text-slate-400" />
          </div>
          <select
            className="block w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 rounded-2xl leading-5 bg-slate-50 focus:outline-none focus:bg-white focus:ring-0 focus:border-primary font-bold text-slate-700 transition-all appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="ALL">All Status</option>
            <option value="ASSIGNED">Assigned Only</option>
            <option value="UNASSIGNED">Unassigned Only</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Staff Member</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Airline Assignment</th>
                <th className="px-6 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Approval Status</th>
                <th className="px-6 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-100 rounded w-32"></div>
                          <div className="h-3 bg-slate-100 rounded w-24"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 w-32 bg-slate-100 rounded-full"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 w-24 bg-slate-100 rounded-full"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"><div className="h-10 w-24 bg-slate-100 rounded-xl inline-block"></div></td>
                  </tr>
                ))
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <UserIcon size={64} className="mx-auto text-slate-100 mb-4" />
                    <h3 className="text-xl font-black text-slate-900 mb-1">No staff members found</h3>
                    <p className="text-slate-500 font-medium">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((user) => (
                  <tr key={user.userId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-black border border-primary/10 shadow-inner">
                          {user.fullName?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">{user.fullName || 'Unknown Staff'}</div>
                          <div className="text-xs font-bold text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {user.airlineId ? (
                        <div className="flex items-center space-x-2 text-slate-900">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                            <Plane size={14} className="text-slate-400" />
                          </div>
                          <span className="text-sm font-black">{user.airlineName || 'Assigned Airline'}</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-slate-100 text-slate-400 border border-slate-200">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                        user.approvalStatus === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : user.approvalStatus === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          user.approvalStatus === 'APPROVED' ? 'bg-emerald-500' : 
                          user.approvalStatus === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'
                        }`}></span>
                        {user.approvalStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <button
                        onClick={() => openAssignModal(user)}
                        disabled={user.approvalStatus === 'APPROVED' || !!user.airlineId}
                        className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                          user.approvalStatus === 'APPROVED' || !!user.airlineId
                            ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-secondary shadow-lg shadow-primary/10'
                        }`}
                      >
                        <UserPlus size={14} />
                        <span>Assign Airline</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {isAssignModalOpen && selectedUser && (
        <AssignAirlineModal
          userId={selectedUser.userId}
          userName={selectedUser.fullName}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={() => {
            showToast('success', `Successfully assigned ${selectedUser.fullName} to airline.`);
            
            // Optimistic/Local State Update
            setStaff(prev => 
              prev.map(u => 
                u.userId === selectedUser.userId 
                  ? { ...u, approvalStatus: 'APPROVED', airlineId: 'assigned' } // airlineId set to non-null to update UI
                  : u
              )
            );

            // Refetch to get actual airline name and correct data from server
            fetchStaff();
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AirlineStaffPage;
