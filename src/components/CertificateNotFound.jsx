import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, RefreshCw } from 'lucide-react';
import ContactButtons from './ContactButtons';

export default function CertificateNotFound({ onRetry }) {
  const shakeVariants = {
    hidden: { x: 0 },
    visible: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.6, ease: 'easeInOut' }
    }
  };

  return (
    <div className="relative min-h-[80vh] flex flex-col justify-center items-center px-4 select-none">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        variants={shakeVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl text-center z-10 py-10 px-6 md:px-10 rounded-3xl bg-premium-card border border-premium-border backdrop-blur-xl shadow-2xl relative"
      >
        {/* Error icon with warning pulse */}
        <div className="w-16 h-16 bg-red-500/10 text-red-400 border border-red-500/25 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <HelpCircle className="w-8 h-8" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-4 leading-tight">
          Hmm... We couldn't find your certificate 😕
        </h2>

        {/* Informative text */}
        <div className="space-y-4 text-slate-350 text-sm md:text-base font-light text-slate-350 max-w-md mx-auto mb-8 leading-relaxed">
          <p>
            Please make sure you're using the same email ID you used while attending the webinar.
          </p>
          <p className="text-slate-400">
            If you believe you attended the workshop and should have received a certificate, feel free to contact me:
          </p>
        </div>

        {/* Social Connection Buttons */}
        <div className="mb-8">
          <ContactButtons />
        </div>

        {/* Try Again Button */}
        <motion.button
          whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          className="px-6 py-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/50 text-white font-medium transition-all duration-300 flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4 text-blue-400" />
          Try Another Email
        </motion.button>
      </motion.div>
    </div>
  );
}
