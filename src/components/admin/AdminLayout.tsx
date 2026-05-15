import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuthStore } from '@store/authStore';
import { Bell, Search, Menu } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar stays fixed on the left */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shadow-sm shrink-0 z-20">
          <div className="flex items-center gap-4 flex-grow max-w-xl">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <div className="relative w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search resources, bookings, payments..."
                className="w-full bg-slate-50 border-none rounded-2xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-600/20 transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 lg:space-x-6">
            <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-slate-900 leading-none">{user?.fullName}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 font-black text-sm overflow-hidden shadow-sm">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user?.fullName?.charAt(0) || 'A'}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - This is the only part that scrolls */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-slate-50/50 scroll-smooth">
          <div className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
