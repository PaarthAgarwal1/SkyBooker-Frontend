import React, { useEffect, useState, useRef } from 'react';
import { 
  User, Mail, Phone, Shield, Camera, 
  Save, Loader2, Globe, FileText, Calendar, 
  CheckCircle, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authApi, UserProfile } from '../../shared/api/auth';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminProfile: React.FC = () => {
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
        toast.error(err.response?.data?.message || 'Failed to load admin profile');
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
        userId: user?.userId,
        fullName: formData.fullName,
        phone: formData.phone,
        passportNumber: formData.passportNumber,
        nationality: formData.nationality,
        profileImageUrl: user?.profileImageUrl
      };
      const res = await authApi.updateProfile(updatePayload);
      if (res.data) {
        updateUser(res.data);
        toast.success('Admin profile updated!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
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
        toast.success('Avatar updated!');
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
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Administrator Profile</h2>
          <p className="text-slate-500 font-medium mt-1">Manage your administrative identity and security settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[2rem] bg-primary/5 border-2 border-primary/10 flex items-center justify-center text-primary font-black text-4xl uppercase overflow-hidden group">
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{user?.fullName?.charAt(0) || 'A'}</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Camera className="text-white w-6 h-6" />
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary-dark transition-all"
              >
                <Camera size={14} />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageUpload} />
            </div>

            <h3 className="text-xl font-bold text-slate-900">{user?.fullName}</h3>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{user?.role}</p>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl text-left">
                <Globe className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region</p>
                  <p className="text-xs font-bold text-slate-900">{user?.nationality}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Admin Permissions
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Root Access</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Billing Admin</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
            <form onSubmit={handleUpdate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text"
                      required
                      className="w-full bg-slate-50 border-transparent border-2 focus:border-primary/20 focus:bg-white rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                  <div className="relative opacity-60">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="email"
                      disabled
                      className="w-full bg-slate-50 border-transparent border-2 rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-900 outline-none cursor-not-allowed"
                      value={user?.email}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="tel"
                      required
                      className="w-full bg-slate-50 border-transparent border-2 focus:border-primary/20 focus:bg-white rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text"
                      required
                      className="w-full bg-slate-50 border-transparent border-2 focus:border-primary/20 focus:bg-white rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all"
                      value={formData.passportNumber}
                      onChange={(e) => setFormData({...formData, passportNumber: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Modified: {format(new Date(), 'MMM dd, yyyy')}</span>
                </div>
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-white px-8 py-3.5 rounded-xl font-black text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Synchronize Data
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
