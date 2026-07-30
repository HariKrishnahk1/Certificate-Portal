import React from 'react';
import { ArrowLeft, Download, RefreshCcw } from 'lucide-react';
import { getCertificateDownloadUrl } from '../services/api';

export default function CertificateViewer({ participant, email, blobUrl, onClose }) {
  const { name, certificate, signature } = participant;

  // Format file download name (e.g. AYISHA SUHAINA S -> AYISHA_SUHAINA_S_Certificate.pdf)
  const getDownloadFilename = () => {
    const sanitized = name.toUpperCase().replace(/[^A-Z0-9\s]/g, '').trim();
    return `${sanitized.replace(/\s+/g, '_')}_Certificate.pdf`;
  };

  const downloadUrl = getCertificateDownloadUrl(email, certificate, signature);

  return (
    <div className="fixed inset-0 bg-[#05070f] z-50 flex flex-col animate-fade-in select-none">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-1.5 text-sm font-medium"
            aria-label="Back to Portal"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="h-4 w-[1px] bg-slate-850 hidden sm:block" />
          
          <div className="text-left">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none">
              Certificate Viewer
            </h1>
            <p className="text-[10px] text-slate-500 font-mono mt-1 hidden sm:block">
              For: {name}
            </p>
          </div>
        </div>

        {/* View / Download Actions */}
        <div className="flex items-center gap-2">
          <a
            href={downloadUrl}
            download={getDownloadFilename()}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all duration-300 flex items-center gap-1.5 border border-blue-400/20"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-950 relative overflow-hidden flex justify-center items-center p-2 sm:p-6 md:p-10">
        {/* Decorative backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Secure PDF Container */}
        {blobUrl ? (
          <div className="w-full h-full max-w-5xl bg-slate-900/40 border border-slate-850/80 rounded-2xl overflow-hidden shadow-2xl relative">
            <iframe
              src={`${blobUrl}#toolbar=0&navpanes=0`}
              title={`Certificate for ${name}`}
              className="w-full h-full border-none rounded-2xl"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        ) : (
          <div className="text-center text-slate-400 flex flex-col items-center gap-3">
            <RefreshCcw className="w-8 h-8 animate-spin text-blue-400" />
            <p className="text-sm font-light">Decrypting certificate document...</p>
          </div>
        )}
      </main>
    </div>
  );
}
