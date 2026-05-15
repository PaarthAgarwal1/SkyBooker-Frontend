import React, { useEffect, useState, useRef } from 'react';
import {
  User, Mail, Phone, Shield, Camera,
  Save, Loader2, Globe, FileText, Calendar,
  Plane, BadgeCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi, UserProfile } from '../../shared/api/auth';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const StaffProfile: React.FC = () => {
  const { user, setUser, updateUser } = useAuthStore();
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await authApi.getProfile();
        if (res.data) {
          const profile = res.data;
          setFormData({
            fullName: profile.fullName || '',
            phone: profile.phone || '',
            passportNumber: profile.passportNumber || '',
            nationality: profile.nationality || '',
          });
          setUser(profile);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load staff profile');
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [setUser]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatePayload = {
        fullName: formData.fullName || "",
        phone: formData.phone || "",
        passportNumber: formData.passportNumber || "",
        nationality: formData.nationality || "",
      };

      const res = await authApi.updateProfile(updatePayload);

      if (res.data) {
        updateUser(res.data);
        toast.success('Staff profile updated!');
      }

    } catch (err: any) {
      console.error(err);

      toast.error(
        err.response?.data?.message || 'Update failed'
      );

    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid format');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max 5MB allowed');
      return;
    }

    const multipartData = new FormData();
    multipartData.append('file', file);

    setUploading(true);
    try {
      const res = await authApi.uploadProfileImage(multipartData);
      if (res.data) {
        setUser(res.data);
        toast.success('Staff photo updated!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Staff Member Profile</h2>
          <p className="text-slate-500 font-medium mt-1">Manage your operational identity and employment details.</p>
        </div>
        <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-blue-200">
          <Plane className="w-5 h-5" />
          <span className="font-black text-xs uppercase tracking-widest">{user?.airlineName || 'SkyBooker Air'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm text-center">
            <div className="relative inline-block mb-6">
              <div className="w-36 h-36 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center text-blue-600 font-black text-5xl uppercase overflow-hidden group">
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <span>{user?.fullName?.charAt(0) || 'S'}</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="text-white w-8 h-8" />
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
              >
                <Camera size={16} />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{user?.fullName}</h3>
            <div className="flex items-center justify-center gap-2 mt-2">
              <BadgeCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Crew Member</span>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50 space-y-4">
              <div className="flex items-center justify-between text-left px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Airline ID</span>
                <span className="text-sm font-bold text-slate-900">{user?.airlineId || '8080'}</span>
              </div>
              <div className="flex items-center justify-between text-left px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Employment</span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm">
            <form onSubmit={handleUpdate} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] ml-2">Work Email</label>
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

                <div className="space-y-3 md:col-span-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] ml-2">Staff ID / Passport</label>
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

              <div className="pt-10 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-400">
                  <Shield size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Security Active</span>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 min-w-[240px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      <span>Update Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;
