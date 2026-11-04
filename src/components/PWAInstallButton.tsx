import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed PWA on device home screen, hide
  if (isInstalled) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#2E7D58]/15 text-[#2E7D58] border border-[#2E7D58]/30 ${className}`}>
        <CheckCircle className="w-3.5 h-3.5" />
        <span>GMC PWA Active</span>
      </span>
    );
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Desktop install flow
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="Install Gelephu Ecopulse for full offline field stewardship"
        className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:shadow-md hover:from-[#24533e] hover:to-[#387e60] active:scale-95 transition-all border border-[#52B788]/40 ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-[#E9A822] animate-bounce" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="Add Gelephu Ecopulse to iOS Home Screen"
          className={`inline-flex items-center gap-1.5 rounded-xl border border-[#2D6A4F]/30 bg-white/80 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-[#1B4332] hover:bg-[#2E7D58]/10 transition ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#2D6A4F]" />
          <span>Install PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#2D6A4F]/20 text-[#192723]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1B4332] p-0.5 border border-[#52B788]/40 flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/app-logo.png" alt="GMC Ecopulse" className="w-full h-full object-contain rounded" />
                  </div>
                  <h3 className="text-base font-bold text-[#1B4332]">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-gray-600">
                <p className="leading-relaxed">
                  To operate Gelephu Ecopulse in remote forest sectors with full offline telemetry and cached missions:
                </p>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F8F5ED] border border-[#2E7D58]/20">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold">1</span>
                  <p>Tap the <strong className="text-[#1B4332] inline-flex items-center gap-1"><Share className="w-3.5 h-3.5" /> Share</strong> button in your Safari navigation bar.</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F8F5ED] border border-[#2E7D58]/20">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold">2</span>
                  <p>Scroll down and select <strong className="text-[#1B4332]">"Add to Home Screen"</strong>.</p>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#F8F5ED] border border-[#2E7D58]/20">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold">3</span>
                  <p>Tap <strong className="text-[#1B4332]">Add</strong> in the top-right corner to launch with zero-network capabilities.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#1B4332] py-2.5 text-xs font-bold text-white hover:bg-[#2D6A4F] transition shadow-md"
              >
                Got It, Return to Field Platform
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback desktop / unsupported browser button that displays a helpful PWA information pill
  return (
    <button
      onClick={() => setShowIOSGuide(true)}
      title="PWA Offline Field Mode Supported"
      className={`inline-flex items-center gap-1.5 rounded-xl border border-[#2D6A4F]/25 bg-white/60 px-2.5 py-1 text-xs font-medium text-[#1B4332] hover:bg-white transition ${className}`}
    >
      <Smartphone className="w-3.5 h-3.5 text-[#2D6A4F]" />
      <span className="hidden sm:inline">PWA Offline Field Ready</span>
      <span className="sm:hidden">PWA</span>
    </button>
  );
};
