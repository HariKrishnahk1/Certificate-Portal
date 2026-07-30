import React from 'react';
import { motion } from 'framer-motion';

export default function WelcomeScreen({ onNext }) {
  // Stagger variants for letter reveal or text parts
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5,
      },
    },
  };

  const hiVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: 'easeOut' }
    },
  };

  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', damping: 12, stiffness: 200 }
    },
  };

  const emojiVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10,
        delay: 1.8,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 2.2, duration: 0.6 },
    },
  };

  const textToType = "Nanbas And Nanbis";

  return (
    <div className="relative min-h-[80vh] flex flex-col justify-center items-center px-4 overflow-hidden select-none">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />

      {/* Glassmorphic Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl text-center z-10 py-12 px-6 md:px-10 rounded-3xl bg-premium-card border border-premium-border backdrop-blur-xl shadow-2xl relative"
      >
        {/* Floating details */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
        
        {/* Step 1: "Hi" */}
        <motion.p
          variants={hiVariants}
          className="text-blue-400 text-lg md:text-xl font-medium tracking-widest uppercase mb-4"
        >
          Hi
        </motion.p>

        {/* Step 2: "Nanbas And Nanbis" */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          <motion.span variants={titleVariants} className="inline-block">
            {textToType.split("").map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.span>
          
          {/* Step 3: Bouncing emojis */}
          <motion.span
            variants={emojiVariants}
            className="inline-block ml-3 text-4xl md:text-5xl drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            💙😉
          </motion.span>
        </h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="text-slate-300 text-sm md:text-base font-light mb-8 max-w-sm mx-auto leading-relaxed"
        >
          Welcome to your workshop portal. We're glad you attended!
        </motion.p>

        {/* Step 4: Continue Button */}
        <motion.div variants={buttonVariants}>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            Let's Continue
            <span className="text-lg">→</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
