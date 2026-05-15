import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { adminApi, AdminUser } from '@shared/api/admin';
import { Search, Shield, User as UserIcon, AlertCircle, Power, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Modal from '@components/Modal';

// Simple inline toast component since we don't know the external toast library
const ToastMessage: React.FC<{ type: 'success' | 'error', message: string, onClose: () => void }> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl z-[100] transform transition-all translate-y-0 opacity-100 ${type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
      }`}>
      {type === 'success' ? <CheckCircle size={24} className="text-emerald-500" /> : <XCircle size={24} className="text-red-500" />}
      <p className="font-bold">{message}</p>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
        ✕
      </button>
    </div>
  );
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'PASSENGER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Actions loading state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      if (response.error) {
        showToast('error', response.error);
      } else {
        setUsers(response.data || []);
      }
    } catch (err: any) {
      showToast('error', 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  };

  const handleToggleStatus = async (user: AdminUser) => {
    if (actionLoading) return;
    setActionLoading(user.userId);

    // Optimistic Update
    const newStatus = !user.active;
    setUsers(prev => prev.map(u => u.userId === user.userId ? { ...u, active: newStatus } : u));

    try {
      if (user.active) {
        await adminApi.deactivateUser(user.userId);
        showToast('success', 'User deactivated successfully');
      } else {
        await adminApi.activateUser(user.userId);
        showToast('success', 'User activated successfully');
      }
    } catch (err: any) {
      // Revert Optimistic Update on failure
      setUsers(prev => prev.map(u => u.userId === user.userId ? { ...u, isActive: user.active } : u));

      const errorMessage = err.response?.status === 403 ? 'Permission denied: You must be an admin.' :
        err.response?.status === 404 ? 'User not found.' :
          'Failed to change user status';
      showToast('error', errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteModal = (user: AdminUser) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete || actionLoading) return;
    setActionLoading(userToDelete.userId);
    setIsDeleteModalOpen(false);

    // Optimistic Update
    setUsers(prev => prev.filter(u => u.userId !== userToDelete.userId));

    try {
      await adminApi.deleteUser(userToDelete.userId);
      showToast('success', 'User deleted successfully');
    } catch (err: any) {
      // Revert on failure (requires a refetch since we removed it from the list)
      fetchUsers();
      const errorMessage = err.response?.status === 403 ? 'Permission denied.' :
        err.response?.status === 404 ? 'User not found.' :
          'Failed to delete user';
      showToast('error', errorMessage);
    } finally {
      setActionLoading(null);
      setUserToDelete(null);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (user.fullName?.toLowerCase().includes(searchLower) || false) ||
        (user.email?.toLowerCase().includes(searchLower) || false);

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && user.active) ||
        (statusFilter === 'INACTIVE' && !user.active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  return (
    <div className="space-y-6 relative pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">User Management</h2>
          <p className="text-slate-500 font-medium">Manage platform users, roles, and access.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border-2 border-slate-100 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-0 focus:border-primary font-bold text-slate-900 transition-all"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="block w-full px-4 py-3 border-2 border-slate-100 rounded-2xl leading-5 bg-slate-50 focus:outline-none focus:bg-white focus:ring-0 focus:border-primary font-bold text-slate-700 transition-all"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
        >
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="PASSENGER">Passenger</option>
        </select>

        <select
          className="block w-full px-4 py-3 border-2 border-slate-100 rounded-2xl leading-5 bg-slate-50 focus:outline-none focus:bg-white focus:ring-0 focus:border-primary font-bold text-slate-700 transition-all"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                  User
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                  Role
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">
                  Actions
                </th>
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
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="h-6 w-20 bg-slate-100 rounded-full"></div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"><div className="h-8 w-8 bg-slate-100 rounded-lg inline-block"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <UserIcon size={48} className="mx-auto text-slate-200 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">No users found</h3>
                    <p className="text-slate-500 font-medium">No users match your current filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-black shadow-inner border border-primary/10">
                          {user.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">{user.fullName || 'Unknown User'}</div>
                          <div className="text-sm font-medium text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${user.role === 'ADMIN'
                        ? 'bg-purple-50 text-purple-700 border-purple-100'
                        : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                        {user.role === 'ADMIN' ? <Shield size={12} className="mr-1.5" /> : <UserIcon size={12} className="mr-1.5" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${user.active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${user.active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={actionLoading === user.userId}
                          className={`p-2 rounded-xl transition-all border ${user.active
                            ? 'text-red-600 bg-red-50 hover:bg-red-100 border-red-100'
                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100'
                            } ${actionLoading === user.userId ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={user.active ? "Deactivate User" : "Activate User"}
                        >
                          <Power size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          disabled={actionLoading === user.userId}
                          className={`p-2 rounded-xl transition-all border text-slate-500 bg-slate-50 hover:bg-red-50 hover:text-red-600 border-slate-100 hover:border-red-100 ${actionLoading === user.userId ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <Modal title="Delete User" onClose={() => !actionLoading && setIsDeleteModalOpen(false)}>
          <div className="p-2">
            <div className="flex items-center space-x-3 text-red-600 mb-4 bg-red-50 p-4 rounded-2xl border border-red-100">
              <AlertCircle size={28} className="shrink-0" />
              <div>
                <p className="font-black text-lg">Permanent Action</p>
                <p className="text-sm font-medium opacity-80">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6 font-medium leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900 font-black">{userToDelete.fullName}</strong> ({userToDelete.email})?
              This will permanently remove their access to the platform.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={actionLoading === userToDelete.userId}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading === userToDelete.userId}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex justify-center items-center"
              >
                {actionLoading === userToDelete.userId ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </Modal>
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

export default UsersPage;
