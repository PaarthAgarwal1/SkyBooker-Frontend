import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Plane,
  LogOut,
  Briefcase,
  Menu,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

const UserNavbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();

  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    {
      label: 'Search Flights',
      path: '/',
      icon: Plane
    },
    {
      label: 'My Bookings',
      path: '/my-bookings',
      icon: Briefcase
    }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="h-20 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-14">

            {/* LOGO */}
            <Link
              to="/"
              className="flex items-center gap-4 group"
            >
              <motion.div
                whileHover={{ rotate: 12, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="
                  relative
                  w-12
                  h-12
                  rounded-2xl
                  bg-gradient-to-br
                  from-blue-600
                  to-indigo-600
                  flex
                  items-center
                  justify-center
                  shadow-xl
                  shadow-blue-200/50
                "
              >
                <Plane className="w-6 h-6 text-white" />

                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>

              <div>
                <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  SkyBooker
                </h1>

                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">
                  Premium Air Travel
                </p>
              </div>
            </Link>

            {/* NAVIGATION */}
            <div className="hidden md:flex items-center gap-3">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="relative"
                  >
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className={`
                        relative
                        flex
                        items-center
                        gap-2
                        px-5
                        py-3
                        rounded-2xl
                        transition-all
                        duration-300
                        overflow-hidden
                        ${isActive
                          ? 'text-blue-700'
                          : 'text-slate-500 hover:text-slate-900'
                        }
                      `}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbar-pill"
                          className="
                            absolute
                            inset-0
                            bg-gradient-to-r
                            from-blue-50
                            to-indigo-50
                            border
                            border-blue-100
                          "
                          transition={{
                            type: 'spring',
                            bounce: 0.25,
                            duration: 0.6
                          }}
                        />
                      )}

                      <link.icon
                        className={`
                          relative z-10 w-4 h-4
                          ${isActive
                            ? 'text-blue-600'
                            : 'text-slate-400'
                          }
                        `}
                      />

                      <span className="relative z-10 text-sm font-bold">
                        {link.label}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            {isAuthenticated ? (
              <>
                {/* PROFILE CARD */}
                <Link
                  to="/profile"
                  className="
                    group
                    hidden
                    sm:flex
                    items-center
                    gap-4
                    pl-3
                    pr-5
                    py-2.5
                    rounded-2xl
                    border
                    border-slate-100
                    bg-white/70
                    hover:bg-white
                    shadow-sm
                    hover:shadow-xl
                    hover:shadow-blue-100/40
                    transition-all
                    duration-300
                  "
                >
                  {/* AVATAR */}
                  <div
                    className="
                      relative
                      w-11
                      h-11
                      rounded-2xl
                      overflow-hidden
                      bg-gradient-to-br
                      from-blue-100
                      to-indigo-100
                      flex
                      items-center
                      justify-center
                      ring-2
                      ring-white
                    "
                  >
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-black text-blue-700">
                        {user?.fullName
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    )}

                    <div className="
                      absolute
                      bottom-0
                      right-0
                      w-3.5
                      h-3.5
                      rounded-full
                      bg-emerald-500
                      border-2
                      border-white
                    " />
                  </div>

                  {/* USER INFO */}
                  <div className="leading-tight">
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                      {user?.fullName || 'Traveler'}
                    </h3>

                    <div className="flex items-center gap-1 mt-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />

                      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
                        Premium Member
                      </p>
                    </div>
                  </div>
                </Link>

                {/* LOGOUT */}
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    rotate: -4
                  }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    bg-slate-900
                    hover:bg-red-500
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    transition-all
                    duration-300
                  "
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-4">

                <Link
                  to="/login"
                  className="
                    text-sm
                    font-bold
                    text-slate-600
                    hover:text-slate-900
                    transition-colors
                  "
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="
                    px-7
                    py-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-600
                    text-white
                    text-sm
                    font-black
                    shadow-xl
                    shadow-blue-200/50
                    hover:scale-105
                    hover:shadow-2xl
                    transition-all
                    duration-300
                  "
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* MOBILE MENU */}
            <button
              className="
                md:hidden
                w-12
                h-12
                rounded-2xl
                bg-slate-100
                hover:bg-slate-200
                flex
                items-center
                justify-center
                transition-all
              "
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;