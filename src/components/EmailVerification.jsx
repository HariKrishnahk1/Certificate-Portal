import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, AlertCircle } from 'lucide-react';
import { validateEmail } from '../utils/emailValidator';

export default function EmailVerification({ onVerify, onBack }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your registered email.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Call verify handler passed from parent
    onVerify(email);
  };

  return (
    <div className="relative min-h-[80vh] flex flex-col justify-center items-center px-4 select-none">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-xl text-center z-10 py-10 px-6 md:px-10 rounded-3xl bg-premium-card border border-premium-border backdrop-blur-xl shadow-2xl relative"
      >
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
          Enter your registered email
        </h2>
        <p className="text-slate-350 text-sm md:text-base font-light text-slate-350 mb-8 max-w-md mx-auto leading-relaxed">
          Use the email ID you used while attending the webinar/workshop.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left max-w-md mx-auto">
          {/* Email input field */}
          <div className="relative">
            <label htmlFor="email" className="sr-only">Registered Email</label>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your registered email ID"
              className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-800 focus:border-blue-500 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 font-light text-base"
            />
          </div>

          {/* Validation errors */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/15 py-3 px-4 rounded-xl text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Verify My Certificate
              <span className="text-lg">→</span>
            </motion.button>

            <button
              type="button"
              onClick={onBack}
              className="w-full text-center text-slate-400 hover:text-white text-sm font-medium transition-colors py-2"
            >
              ← Go Back
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
