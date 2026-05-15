import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  ShieldAlert, 
  Camera, 
  Mail, 
  Phone, 
  Globe, 
  CreditCard,
  AlertTriangle
} from 'lucide-react';
import { authApi, UserProfile } from '@shared/api/auth';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'account'>('profile');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  // Form States
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    passportNumber: '',
    nationality: '',
    profileImageUrl: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authApi.getProfile();
      setUser(res.data);
      setProfileForm({
        fullName: res.data.fullName || '',
        phone: res.data.phone || '',
        passportNumber: res.data.passportNumber || '',
        nationality: res.data.nationality || '',
        profileImageUrl: res.data.profileImageUrl || ''
      });
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile(profileForm);
      toast.success("Profile updated successfully");
      fetchProfile();
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Password changed successfully");
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await authApi.deactivateAccount();
      toast.success("Account deactivated");
      localStorage.clear();
      window.location.href = '/login';
    } catch (err) {
      toast.error("Failed to deactivate account");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setSaving(true);
    try {
      await authApi.uploadProfileImage(formData);
      toast.success("Profile image updated");
      fetchProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload image");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 p-6 md:p-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h2>
          <p className="text-slate-500 font-medium mt-1">Manage your profile, security, and preferences.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-2">
          <nav className="flex flex-col gap-1 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm">
            <TabButton 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')}
              icon={<User className="w-5 h-5" />}
              label="Profile Info"
            />
            <TabButton 
              active={activeTab === 'password'} 
              onClick={() => setActiveTab('password')}
              icon={<Lock className="w-5 h-5" />}
              label="Security"
            />
            <TabButton 
              active={activeTab === 'account'} 
              onClick={() => setActiveTab('account')}
              icon={<ShieldAlert className="w-5 h-5" />}
              label="Account"
            />
          </nav>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden"
              >
                <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-blue-100 overflow-hidden">
                        {user?.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getInitials(user?.fullName || 'User')
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-md border border-slate-100 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer active:scale-95 transition-all">
                        <Camera className="w-4 h-4" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={saving}
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{user?.fullName}</h3>
                      <p className="text-slate-400 font-bold text-sm flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput 
                      label="Full Name"
                      value={profileForm.fullName}
                      onChange={(e: any) => setProfileForm({...profileForm, fullName: e.target.value})}
                      placeholder="Enter your full name"
                    />
                    <FormInput 
                      label="Email Address"
                      value={user?.email || ''}
                      disabled
                      placeholder="email@example.com"
                      hint="Email cannot be changed."
                    />
                    <FormInput 
                      label="Phone Number"
                      value={profileForm.phone}
                      onChange={(e: any) => setProfileForm({...profileForm, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      icon={<Phone className="w-4 h-4" />}
                    />
                    <FormInput 
                      label="Nationality"
                      value={profileForm.nationality}
                      onChange={(e: any) => setProfileForm({...profileForm, nationality: e.target.value})}
                      placeholder="e.g. Indian"
                      icon={<Globe className="w-4 h-4" />}
                    />
                    <FormInput 
                      label="Passport Number"
                      value={profileForm.passportNumber}
                      onChange={(e: any) => setProfileForm({...profileForm, passportNumber: e.target.value})}
                      placeholder="Enter passport ID"
                      icon={<CreditCard className="w-4 h-4" />}
                    />
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button 
                      disabled={saving}
                      type="submit"
                      className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      {saving ? 'Saving Changes...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'password' && (
              <motion.div 
                key="password"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-8"
              >
                <div className="mb-8">
                  <h3 className="text-xl font-black text-slate-900">Change Password</h3>
                  <p className="text-slate-400 font-medium mt-1">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <form onSubmit={handleChangePassword} className="max-w-md space-y-6">
                  <FormInput 
                    type="password"
                    label="Current Password"
                    value={passwordForm.oldPassword}
                    onChange={(e: any) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                    placeholder="••••••••"
                  />
                  <div className="h-px bg-slate-100 my-4" />
                  <FormInput 
                    type="password"
                    label="New Password"
                    value={passwordForm.newPassword}
                    onChange={(e: any) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    placeholder="••••••••"
                  />
                  <FormInput 
                    type="password"
                    label="Confirm New Password"
                    value={passwordForm.confirmPassword}
                    onChange={(e: any) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                  />
                  
                  <button 
                    disabled={saving}
                    type="submit"
                    className="w-full bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div 
                key="account"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm p-8"
              >
                <div className="mb-8">
                  <h3 className="text-xl font-black text-slate-900">Account Preferences</h3>
                  <p className="text-slate-400 font-medium mt-1">Manage your account status and data.</p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 border border-rose-100 bg-rose-50/30 rounded-3xl">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-900">Deactivate Account</h4>
                        <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                          Once you deactivate your account, you will no longer be able to log in or book flights. All your pending bookings will remain as-is.
                        </p>
                        <button 
                          onClick={() => setShowDeactivateModal(true)}
                          className="mt-6 bg-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-rose-700 transition-all"
                        >
                          Deactivate My Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showDeactivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeactivateModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-rose-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Are you absolutely sure?</h3>
                <p className="text-slate-500 font-medium mt-4">
                  This action is irreversible. You will lose access to all your flight history and saved preferences.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-10">
                <button 
                  onClick={() => setShowDeactivateModal(false)}
                  className="px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeactivate}
                  className="px-6 py-4 rounded-2xl bg-rose-600 text-white font-bold shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all"
                >
                  Deactivate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Internal Components
const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-5 py-4 rounded-2xl font-bold transition-all ${
      active 
        ? 'bg-slate-900 text-white shadow-lg' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`}
  >
    {icon}
    {label}
  </button>
);

const FormInput = ({ label, value, onChange, placeholder, disabled, hint, type = 'text', icon }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-black uppercase tracking-widest text-slate-400 block ml-1">{label}</label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
          {icon}
        </div>
      )}
      <input 
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border-none rounded-2xl py-4 transition-all focus:ring-2 focus:ring-blue-500/20 focus:bg-white placeholder:text-slate-300 font-bold text-slate-900 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${icon ? 'pl-11' : 'px-5'}`}
      />
    </div>
    {hint && <p className="text-[10px] font-bold text-slate-400 ml-1 italic">{hint}</p>}
  </div>
);

export default Settings;
