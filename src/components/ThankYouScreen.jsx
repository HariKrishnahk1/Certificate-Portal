import React from 'react';
import { motion } from 'framer-motion';
import { Award, Heart } from 'lucide-react';

export default function ThankYouScreen({ onNext, onBack }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -45 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 200, damping: 12 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const heartVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1.3, 1],
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10,
        delay: 1.2,
      },
    },
  };

  return (
    <div className="relative min-h-[80vh] flex flex-col justify-center items-center px-4 select-none">
      {/* Background glow */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl text-center z-10 py-10 px-6 md:px-10 rounded-3xl bg-premium-card border border-premium-border backdrop-blur-xl shadow-2xl relative"
      >
        {/* Step 1: Workshop Icon */}
        <motion.div 
          variants={iconVariants}
          className="w-16 h-16 bg-blue-500/15 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
        >
          <Award className="w-8 h-8" />
        </motion.div>

        {/* Step 2: "Thank You" & "for attending my Workshop" */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
          <motion.span variants={itemVariants} className="block text-blue-400">
            Thank You
          </motion.span>
          <motion.span variants={itemVariants} className="block text-2xl md:text-3xl font-semibold text-slate-100 mt-1">
            for attending my Workshop
          </motion.span>
        </h2>

        {/* Step 3: Bouncing heart icon 💙 */}
        <motion.div 
          variants={heartVariants}
          className="inline-flex items-center justify-center text-blue-500 mb-6 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
        >
          <Heart className="w-8 h-8 fill-blue-500 text-blue-500 animate-pulse" />
        </motion.div>

        {/* Step 4: Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-slate-300 text-sm md:text-base font-light mb-8 max-w-sm mx-auto leading-relaxed"
        >
          Your participation made the session special.
        </motion.p>

        {/* Step 5: Buttons */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Let's Find Your Certificate
            <span className="text-lg">→</span>
          </motion.button>

          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white text-sm font-medium transition-colors py-2 px-4 hover:bg-white/5 rounded-full"
          >
            ← Back
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
