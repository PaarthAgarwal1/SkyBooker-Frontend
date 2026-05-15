import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Plane,
  Ticket,
  TrendingUp,
  Bell,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  ClipboardList,
  Users,
  Settings,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@store/authStore';

interface MenuItem {
  label: string;
  icon: any;
  path?: string;
  children?: { label: string; path: string }[];
}

const Sidebar: React.FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => {
  const location = useLocation();
  const user = useAuthStore(state => state.user);
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({
    Flights: true,
    'Seat Management': false,
    Bookings: false,
  });

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
    {
      label: 'Flights',
      icon: Plane,
      children: [
        { label: 'View Flights', path: '/staff/flights' },
        { label: 'Add Flight', path: '/staff/flights/add' },
      ]
    },
    {
      label: 'Seat Management',
      icon: LayoutGrid,
      children: [
        { label: 'Seat Map', path: '/staff/seats' }, // Needs flightId normally, but base route works for selection
        { label: 'Add Seats', path: '/staff/seats/add' },
      ]
    },
    {
      label: 'Bookings',
      icon: Ticket,
      children: [
        { label: 'Flight Bookings', path: '/staff/bookings' },
        { label: 'Passenger Manifest', path: '/staff/manifest' },
      ]
    },
    { label: 'Revenue', icon: TrendingUp, path: '/staff/revenue' },
    { label: 'Alerts', icon: Bell, path: '/staff/alerts' },
    { label: 'My Profile', icon: User, path: '/staff/profile' },
  ];

  console.log("Sidebar user state:", user);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggle}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -300,
          width: isOpen ? 280 : 0
        }}
        className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200 z-50 overflow-hidden lg:relative lg:translate-x-0 lg:w-72 transition-all duration-300 shadow-sm`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
              <Plane className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900 tracking-tight leading-none">SkyBooker</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Staff Panel</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
            {menuItems.map((item) => (
              <div key={item.label} className="space-y-1">
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleGroup(item.label)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                        ${location.pathname.includes(item.label.toLowerCase().replace(' ', '-'))
                          ? 'text-blue-600 bg-blue-50/50'
                          : 'text-slate-600 hover:bg-slate-50'
                        }
                      `}
                    >
                      <item.icon className={`w-5 h-5 ${location.pathname.includes(item.label.toLowerCase().replace(' ', '-')) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="font-bold text-sm flex-1 text-left">{item.label}</span>
                      {openGroups[item.label] ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <AnimatePresence>
                      {openGroups[item.label] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-12 space-y-1"
                        >
                          {item.children.map((child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              className={({ isActive }) => `
                                block py-2 text-sm font-medium transition-colors
                                ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}
                              `}
                            >
                              {child.label}
                            </NavLink>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <NavLink
                    to={item.path!}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className="font-bold text-sm">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* User Profile Footer */}
          {/* <div className="p-4 border-t border-slate-100">
            {!user ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-2.5 bg-slate-200 rounded w-16" />
                  <div className="h-2 bg-slate-200 rounded w-12" />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                    {user.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{user.role?.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            )}
          </div> */}

        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
