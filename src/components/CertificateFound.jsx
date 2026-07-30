import React from 'react';
import { motion } from 'framer-motion';
import { Check, Eye, Download, GraduationCap } from 'lucide-react';
import { getCertificateDownloadUrl } from '../services/api';

export default function CertificateFound({ participant, email, onView, onBack }) {
  const { name, certificate, signature } = participant;

  // Format file download name (e.g. AYISHA SUHAINA S -> AYISHA_SUHAINA_S_Certificate.pdf)
  const getDownloadFilename = () => {
    const sanitized = name.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim();
    return `${sanitized.replace(/\s+/g, '_')}_Certificate.pdf`;
  };

  const downloadUrl = getCertificateDownloadUrl(email, certificate, signature);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const checkCircleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1.2, 1],
      opacity: 1,
      transition: { type: 'spring', stiffness: 200, damping: 10 },
    },
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="relative min-h-[80vh] flex flex-col justify-center items-center px-4 select-none">
      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl text-center z-10 py-8 px-6 md:px-10 rounded-3xl bg-premium-card border border-premium-border backdrop-blur-xl shadow-2xl relative"
      >
        {/* Success checkmark animation */}
        <motion.div 
          variants={checkCircleVariants}
          className="w-20 h-20 bg-green-500/15 text-green-400 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <Check className="w-10 h-10" />
          </motion.div>
        </motion.div>

        {/* Header Message */}
        <motion.h2 
          variants={cardVariants}
          className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2"
        >
          Welcome, {name}!
        </motion.h2>
        <motion.p 
          variants={cardVariants}
          className="text-green-400 font-medium text-sm md:text-base mb-8"
        >
          ✓ Your certificate is ready!
        </motion.p>

        {/* Certificate Card Mockup */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)' }}
          className="w-full bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-2xl p-6 md:p-8 text-left mb-8 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors duration-500" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-500" />
          
          <div className="border border-slate-800/80 rounded-xl p-5 relative">
            {/* Cap Icon */}
            <div className="flex justify-between items-start mb-6">
              <GraduationCap className="w-10 h-10 text-blue-400/90" />
              <div className="text-[10px] tracking-widest text-slate-500 uppercase font-mono">
                SECURE PDF CERTIFICATE
              </div>
            </div>

            {/* Certificate Details */}
            <p className="text-[11px] tracking-wider text-blue-400 font-semibold uppercase mb-1">
              Certificate of Participation
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight mb-4 truncate">
              {name}
            </h3>
            
            <div className="border-t border-slate-850 pt-4 flex justify-between items-center text-xs text-slate-400">
              <div>
                <p className="font-light">Workshop Participant</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {certificate.replace(/\.[^/.]+$/, "")}</p>
              </div>
              <div className="w-6 h-6 rounded-full border border-blue-500/20 bg-blue-500/5 flex items-center justify-center text-blue-400 font-bold text-[9px]">
                OK
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          variants={cardVariants}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={onView}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-medium hover:bg-slate-850 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            View Certificate
          </button>

          <a
            href={downloadUrl}
            download={getDownloadFilename()}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-[0_0_15px_rgba(59,130,246,0.15)] border border-blue-450/20 hover:border-blue-450/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Certificate
          </a>
        </motion.div>

        {/* Back Link */}
        <motion.button
          variants={cardVariants}
          onClick={onBack}
          className="mt-6 text-slate-400 hover:text-white text-xs transition-colors"
        >
          Verify another email address
        </motion.button>
      </motion.div>
    </div>
  );
}
