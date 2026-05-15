import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Scale, ShieldCheck, Cookie, Receipt } from 'lucide-react';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ children, title, lastUpdated }) => {
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const links = [
    { name: 'Terms of Service', path: '/legal/terms', icon: Scale },
    { name: 'Privacy Policy', path: '/legal/privacy', icon: ShieldCheck },
    { name: 'Cookie Policy', path: '/legal/cookies', icon: Cookie },
    { name: 'Refund Policy', path: '/legal/refund', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-blue-600 origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <ChevronLeft size={18} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
              <Scale className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">SkyBooker <span className="text-blue-600">Legal</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Sticky Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-32 space-y-8">
              <div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">Legal Center</h3>
                <nav className="space-y-2">
                  {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                            : 'text-slate-500 hover:bg-white hover:text-slate-900 shadow-sm border border-transparent hover:border-slate-100'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-lg font-black mb-2 tracking-tight">Need Help?</h4>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                    If you have questions about our legal policies, please contact our compliance team.
                  </p>
                  <a 
                    href="mailto:legal@skybooker.com" 
                    className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Contact Support →
                  </a>
                </div>
                <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Scale size={120} />
                </div>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-[3rem] border border-slate-100 p-10 lg:p-16 shadow-sm shadow-slate-200/50"
            >
              <div className="mb-12 border-b border-slate-50 pb-12">
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4">
                  {title}
                </h1>
                <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Last Updated: {lastUpdated}</span>
                </div>
              </div>

              <article className="prose prose-slate max-w-none prose-h2:text-2xl prose-h2:font-black prose-h2:text-slate-900 prose-h2:tracking-tight prose-h2:mb-6 prose-p:text-slate-500 prose-p:leading-relaxed prose-p:mb-8 prose-li:text-slate-500 prose-strong:text-slate-900 prose-strong:font-black">
                {children}
              </article>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LegalLayout;
