import React from 'react';
import Home from './pages/Home';

export default function App() {
  return (
    <div className="min-h-screen bg-[#05070f] bg-gradient-premium text-slate-100 flex flex-col justify-between font-sans selection:bg-blue-500/30 selection:text-blue-200 relative overflow-hidden">
      {/* Background Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Floating Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

      {/* Header (Minimal & Premium) */}
      <header className="w-full py-6 px-6 z-10 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            HK
          </div>
          <span className="font-bold text-sm tracking-widest uppercase text-slate-200">
            HK
          </span>
        </div>
        <div className="text-[10px] tracking-widest text-slate-500 uppercase font-mono bg-slate-950/40 border border-slate-900 px-3 py-1 rounded-full backdrop-blur-md">
          Workshop Portal v2.0
        </div>
      </header>

      {/* Main Core Views */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col justify-center items-center z-10 relative px-4">
        <Home />
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-500 z-10 border-t border-slate-950">
        <p className="font-light tracking-wide">
          Made with <span className="text-blue-500 animate-pulse">💙</span> by{' '}
          <a
            href="https://www.linkedin.com/in/harikrishnahk0221/?utm_source=chatgpt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-blue-400 hover:underline transition-colors font-medium"
          >
            HK
          </a>
        </p>
      </footer>
    </div>
  );
}
