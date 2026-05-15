import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ShieldCheck } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  title: string;
  subtitle?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, title, subtitle }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md"
        >
          <div className="bg-white rounded-[2.5rem] p-12 max-w-sm w-full mx-6 text-center shadow-2xl">
            <div className="relative w-24 h-24 mx-auto mb-8">
              {/* Outer Pulse */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-blue-500 rounded-full"
              />
              {/* Spinner */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                {subtitle}
              </p>
            )}

            <div className="mt-10 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Secure Transaction in Progress
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
