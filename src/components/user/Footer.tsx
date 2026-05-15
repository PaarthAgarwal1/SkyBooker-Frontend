import React from 'react';
import { Plane, Github, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                <Plane className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">SkyBooker</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Experience the future of flight booking. Real-time alerts, smart seat selection, and a seamless journey from search to landing.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">Navigation</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link to="/my-bookings" className="hover:text-blue-400 transition-colors">My Bookings</Link></li>
              <li><Link to="/profile" className="hover:text-blue-400 transition-colors">Profile</Link></li>
              <li><Link to="/settings" className="hover:text-blue-400 transition-colors">Settings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">Legal</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link to="/legal/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal/cookies" className="hover:text-blue-400 transition-colors">Cookie Policy</Link></li>
              <li><Link to="/legal/refund" className="hover:text-blue-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-8">Support</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="text-sm">
                  <p className="text-white font-bold">Email us</p>
                  <p>support@skybooker.com</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="text-sm">
                  <p className="text-white font-bold">Call us</p>
                  <p>+1 (555) 000-SKYB</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="text-sm">
                  <p className="text-white font-bold">Office</p>
                  <p>Terminal 3, Sky City, SC 10001</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-widest">
          <p>© 2026 SkyBooker Technologies. All rights reserved.</p>
          <div className="flex gap-8">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
