import React from 'react';
import { Bell, LogOut, Menu, User as UserIcon, Search } from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useAuthStore } from '@store/authStore';

const Topbar: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const { logout } = useAuth();
  const user = useAuthStore(state => state.user);

  return (
    <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden text-slate-600"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar Placeholder */}
        {/* <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Quick search flights, bookings..."
            className="bg-transparent border-none text-xs font-medium outline-none text-slate-600 placeholder:text-slate-400 w-full"
          />
        </div> */}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        {/* <button className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
        </button> */}

        <div className="w-px h-6 bg-slate-200 mx-2" />

        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-none">{user?.fullName || 'Staff Member'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
              Airline ID: <span className="text-blue-600">{user?.airlineId || '8080'}</span>
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
              Airline Name: <span className="text-blue-600">{user?.airlineName || '8080'}</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-black text-blue-600 uppercase">
                {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'ST'}
              </span>
            )}
          </div>

          <button
            onClick={() => logout()}
            className="p-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all duration-200 shadow-sm"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
