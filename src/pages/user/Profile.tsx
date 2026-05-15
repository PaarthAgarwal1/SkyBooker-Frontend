import React, { useEffect, useState, useRef } from 'react';
import {
  User, Mail, Phone, Shield, Bell, Camera,
  Save, Loader2, Globe, FileText, Calendar,
  CheckCircle, AlertCircle, Trash2
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi, UserProfile } from '../../shared/api/auth';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: '',
    phone: '',
    passportNumber: '',
    nationality: '',
  });

  // 1. Fetch Profile on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await authApi.getProfile();
        if (res.data) {
          const profile = res.data;
          setFormData({
            fullName: profile.fullName,
            phone: profile.phone,
            passportNumber: profile.passportNumber,
            nationality: profile.nationality,
          });
          setUser(profile);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load profile data');
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [setUser]);

  // 2. Handle Profile Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile(formData);
      if (res.data) {
        setUser(res.data);
        toast.success('Profile updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // 3. Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG and WEBP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const multipartData = new FormData();
    multipartData.append('file', file);

    setUploading(true);
    try {
      const res = await authApi.uploadProfileImage(multipartData);
      if (res.data) {
        setUser(res.data);
        toast.success('Profile picture updated!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 selection:bg-blue-100 selection:text-blue-900">
      {/* Dynamic Header */}
      <div className="h-72 bg-slate-900 relative overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544016768-982d1554f0b9?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
        ></motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/80 to-slate-50"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-40 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT COLUMN: Identity & Membership */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[3.5rem] border border-slate-100 p-10 shadow-2xl shadow-slate-200/40 text-center relative overflow-hidden"
            >
              {/* Decorative Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[5rem] -mr-16 -mt-16"></div>

              <div className="relative inline-block mb-8">
                <div className="w-40 h-40 rounded-[3rem] bg-slate-50 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center group relative">
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  )}

                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.fullName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="text-5xl font-black text-blue-600 uppercase tracking-tighter">
                      {getInitials(user?.fullName || 'ST')}
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 z-30"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                />
              </div>

              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user?.fullName}</h2>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user?.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                  {user?.role}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Member since {user?.createdAt ? format(new Date(user.createdAt), 'yyyy') : '2026'}
                </span>
              </div>

              <div className="mt-12 space-y-3">
                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl group hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nationality</p>
                      <p className="text-sm font-bold text-slate-900">{user?.nationality}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl group hover:bg-indigo-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passport Number</p>
                      <p className="text-sm font-bold text-slate-900">{user?.passportNumber || 'Not Linked'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Verification Status */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Security Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Identity Verified</span>
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Email Status</span>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Profile Editing */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[3.5rem] border border-slate-100 p-12 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Account Details</h3>
                  <p className="text-slate-400 font-medium mt-1">Manage your personal information and contact settings.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Level 2 Sync</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Full Name */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] ml-2">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-3xl pl-14 pr-6 py-5 text-sm font-bold text-slate-900 outline-none transition-all shadow-sm"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] ml-2">Email Identity</label>
                    <div className="relative group opacity-60">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="email"
                        disabled
                        className="w-full bg-slate-50 border-2 border-transparent rounded-3xl pl-14 pr-6 py-5 text-sm font-bold text-slate-900 outline-none cursor-not-allowed"
                        value={user?.email}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] ml-2">Mobile Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="tel"
                        required
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-3xl pl-14 pr-6 py-5 text-sm font-bold text-slate-900 outline-none transition-all shadow-sm"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Nationality */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] ml-2">Nationality</label>
                    <div className="relative group">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-3xl pl-14 pr-6 py-5 text-sm font-bold text-slate-900 outline-none transition-all shadow-sm"
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Passport */}
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] ml-2">Passport Document ID</label>
                    <div className="relative group">
                      <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white rounded-3xl pl-14 pr-6 py-5 text-sm font-bold text-slate-900 outline-none transition-all shadow-sm"
                        value={formData.passportNumber}
                        onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Last Updated</p>
                      <p className="text-xs font-bold text-slate-700">{format(new Date(), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 md:flex-none bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 min-w-[220px]"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-6 h-6" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
