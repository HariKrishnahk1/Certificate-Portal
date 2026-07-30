import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

const LOG_MESSAGES = [
  "Initializing verification...",
  "Connecting to certificate database...",
  "Searching participant records...",
  "Matching email address...",
  "Checking certificate availability...",
  "Verification complete!"
];

export default function ProcessingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [activeLogIndex, setActiveLogIndex] = useState(0);
  const [logs, setLogs] = useState([]);

  // Increment progress bar over 3 seconds
  useEffect(() => {
    const duration = 3000; // 3 seconds
    const intervalTime = 30; // ms
    const increment = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Update active logs as progress increases
  useEffect(() => {
    const index = Math.min(
      Math.floor((progress / 100) * LOG_MESSAGES.length),
      LOG_MESSAGES.length - 1
    );
    
    if (index !== activeLogIndex) {
      setActiveLogIndex(index);
    }
  }, [progress, activeLogIndex]);

  // Append new logs to the visible terminal display
  useEffect(() => {
    const currentLogsList = LOG_MESSAGES.slice(0, activeLogIndex + 1);
    setLogs(currentLogsList);
  }, [activeLogIndex]);

  // Trigger completion once progress reaches 100%
  useEffect(() => {
    if (progress === 100) {
      const finishTimer = setTimeout(() => {
        onComplete();
      }, 500); // Small pause for the final "Complete" check
      return () => clearTimeout(finishTimer);
    }
  }, [progress, onComplete]);

  // Generate standard retro ASCI progress bar [█████░░░]
  const renderProgressBar = () => {
    const totalBlocks = 20;
    const filledBlocks = Math.floor((progress / 100) * totalBlocks);
    const emptyBlocks = totalBlocks - filledBlocks;
    const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
    return `[${bar}] ${Math.floor(progress)}%`;
  };

  return (
    <div className="relative min-h-[80vh] flex flex-col justify-center items-center px-4 select-none">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl text-center z-10 py-8 px-6 rounded-3xl bg-premium-card border border-premium-border backdrop-blur-xl shadow-2xl relative"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          Verifying your certificate...
        </h2>

        {/* Terminal Window */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-left font-mono text-sm text-green-400 shadow-inner relative overflow-hidden h-64 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900 border-b border-slate-850 px-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <div className="text-slate-500 text-xs flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              verification_console.sh
            </div>
          </div>

          {/* Terminal Logs */}
          <div className="flex-1 mt-6 space-y-2 overflow-y-auto pt-2 scrollbar-thin scrollbar-thumb-slate-850">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={i === LOG_MESSAGES.length - 1 ? "text-blue-400 font-bold" : "text-green-400/90"}
              >
                &gt; {log}
              </motion.div>
            ))}
            
            {progress < 100 && (
              <span className="inline-block w-2 h-4 bg-green-400 animate-pulse" />
            )}
          </div>

          {/* Terminal Progress Bar */}
          <div className="border-t border-slate-900 pt-4 mt-2 text-green-300 font-bold">
            {renderProgressBar()}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
