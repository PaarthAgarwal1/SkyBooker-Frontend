import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Plane,
  MapPin,
  Ticket,
  CreditCard,
  Bell,
  LogOut,
  User,
  UserCheck,
  X
} from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: UserCheck, label: 'Airline Staff', path: '/admin/airline-staff' },
    { icon: Plane, label: 'Airlines', path: '/admin/airlines' },
    { icon: MapPin, label: 'Airports', path: '/admin/airports' },
    { icon: Ticket, label: 'Bookings', path: '/admin/bookings' },
    { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
    { icon: User, label: 'Profile', path: '/admin/profile' },
  ];

  const sidebarContent = (
    <div className="w-72 bg-slate-900 text-slate-300 h-full flex flex-col shadow-2xl relative">
      <button 
        onClick={onClose}
        className="lg:hidden absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors"
      >
        <X size={20} />
      </button>

      <div className="p-8 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Sky<span className="text-blue-500">Admin</span>
        </h1>
      </div>

      <nav className="flex-grow p-4 space-y-1 overflow-y-auto scrollbar-hide mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group
              ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-bold'
                : 'hover:bg-slate-800 hover:text-white'
              }
            `}
          >
            <item.icon size={20} className="shrink-0" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3.5 w-full rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all duration-200 font-bold text-sm"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-shrink-0 w-72 h-screen sticky top-0 overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[70] lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
