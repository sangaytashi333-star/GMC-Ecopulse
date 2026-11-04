import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  CheckCircle, 
  Share, 
  X, 
  ExternalLink, 
  WifiOff, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'navbar' | 'banner' | 'menu-item' | 'hero';
  showLabelOnMobile?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '', 
  variant = 'navbar',
  showLabelOnMobile = false
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [activePlatformTab, setActivePlatformTab] = useState<'auto' | 'ios' | 'android' | 'desktop'>(
    isIOS ? 'ios' : 'auto'
  );
  const [isPrompting, setIsPrompting] = useState(false);

  const handleInstallClick = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // If the browser provides a direct native prompt, trigger it!
    if (isInstallable) {
      setIsPrompting(true);
      try {
        const accepted = await install();
        if (accepted) {
          setShowInstallModal(false);
          return;
        }
      } catch (err) {
        console.warn('Native install prompt error:', err);
      } finally {
        setIsPrompting(false);
      }
    }

    // Always show the guided installation modal when clicked so user has clear step-by-step instructions
    setShowInstallModal(true);
  };

  // Determine current browser URL to offer standalone launch outside iframe
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '/';

  // 1. Hero / Dashboard Banner Variant
  if (variant === 'banner') {
    return (
      <>
        <div className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] text-white shadow-lg border border-[#52b788]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}>
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/10 p-1 border border-[#52b788]/40 flex items-center justify-center shrink-0 shadow-md">
              <img src="/app-logo.png" alt="GMC Ecopulse" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-extrabold text-white">Download Gelephu Ecopulse App</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#52b788] text-[#081c15]">PWA</span>
              </div>
              <p className="text-xs text-[#d8f3dc]/80 mt-0.5">
                Install on your phone or PC for 100% offline forest patrol and instant GIS tracking.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2 shrink-0 active:scale-95 min-h-[44px]"
          >
            <Download className="w-4 h-4 text-[#081c15] animate-bounce" />
            <span>Download & Install App</span>
          </button>
        </div>

        {/* Modal Guide */}
        {renderModal()}
      </>
    );
  }

  // 2. Mobile Menu Item Variant
  if (variant === 'menu-item') {
    return (
      <>
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full px-3.5 py-3 rounded-xl bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] text-white text-xs font-bold transition flex items-center justify-between border border-[#52b788]/40 shadow-sm active:scale-95 min-h-[48px] ${className}`}
        >
          <div className="flex items-center space-x-2.5">
            <Download className="w-4 h-4 text-[#52b788] animate-bounce" />
            <span>Download & Install Web App</span>
          </div>
          <span className="text-[10px] bg-[#52b788] text-[#081c15] px-2 py-0.5 rounded font-black uppercase">
            PWA
          </span>
        </button>

        {renderModal()}
      </>
    );
  }

  // 3. Primary Header Navbar Variant (Visible on ALL devices)
  return (
    <>
      <button
        type="button"
        id="btn-download-app"
        onClick={handleInstallClick}
        title="Download & Install Gelephu Ecopulse as an App on your phone or desktop"
        className={`inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-sm transition-all border active:scale-95 min-h-[40px] shrink-0 ${
          isInstalled
            ? 'bg-[#2d6a4f]/40 hover:bg-[#2d6a4f]/70 text-[#d8f3dc] border-[#52b788]/30'
            : 'bg-gradient-to-r from-[#52b788] to-[#74c69d] text-[#081c15] border-[#52b788] hover:shadow-md hover:brightness-105 ring-1 ring-white/20'
        } ${className}`}
      >
        <Download className="w-3.5 h-3.5 text-[#081c15] shrink-0 animate-bounce" />
        <span className={showLabelOnMobile ? 'inline' : 'hidden sm:inline'}>
          {isInstalled ? 'App Installed' : 'Download App'}
        </span>
        <span className={showLabelOnMobile ? 'hidden' : 'sm:hidden font-black text-[11px]'}>
          {isInstalled ? '✓' : 'Download'}
        </span>
      </button>

      {renderModal()}
    </>
  );

  // Reusable Step-by-Step Installation Modal Dialog
  function renderModal() {
    if (!showInstallModal) return null;

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#081c15]/75 backdrop-blur-md animate-in fade-in duration-200"
        onClick={() => setShowInstallModal(false)}
      >
        <div 
          className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-gray-200 text-[#192723] space-y-5 max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1b4332] p-1 border border-[#52b788]/40 shadow-md flex items-center justify-center shrink-0">
                <img src="/app-logo.png" alt="GMC Ecopulse" className="w-full h-full object-contain rounded-xl" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-[#1b4332] leading-tight">
                    Download Gelephu Ecopulse
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-[#d8f3dc] text-[#1b4332] uppercase">
                    PWA App
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Native home screen app with zero-latency offline forest stewardship.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Direct Install Action (if browser supports programmatic prompt) */}
          {isInstallable && (
            <div className="p-4 rounded-2xl bg-[#d8f3dc]/60 border border-[#52b788]/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1b4332] flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[#2d6a4f]" />
                  <span>One-Click Browser Install Ready</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#1b4332] text-white">
                  Fast Track
                </span>
              </div>
              <button
                type="button"
                onClick={handleInstallClick}
                disabled={isPrompting}
                className="w-full py-3 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2 active:scale-95 min-h-[44px]"
              >
                <Download className="w-4 h-4 text-[#52b788]" />
                <span>{isPrompting ? 'Launching Browser Prompt...' : 'Install Now Directly'}</span>
              </button>
            </div>
          )}

          {/* Platform Tab Switcher */}
          <div>
            <label className="block text-xs font-bold text-[#1b4332] mb-2">
              Select Your Device for Instructions:
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-[#f8f9f6] p-1 rounded-2xl border border-gray-200 text-xs">
              <button
                type="button"
                onClick={() => setActivePlatformTab('android')}
                className={`py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-center space-x-1 min-h-[38px] ${
                  activePlatformTab === 'android' || activePlatformTab === 'auto' && !isIOS
                    ? 'bg-[#1b4332] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android / Chrome</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePlatformTab('ios')}
                className={`py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-center space-x-1 min-h-[38px] ${
                  activePlatformTab === 'ios'
                    ? 'bg-[#1b4332] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePlatformTab('desktop')}
                className={`py-2 px-2.5 rounded-xl font-bold transition flex items-center justify-center space-x-1 min-h-[38px] ${
                  activePlatformTab === 'desktop'
                    ? 'bg-[#1b4332] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>PC / Mac / Edge</span>
              </button>
            </div>
          </div>

          {/* Instructions: iPhone / iOS Safari */}
          {activePlatformTab === 'ios' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-[#f8f9f6] border border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  In Safari, tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline mx-0.5 text-[#1b4332]" /> at the bottom or top of your screen.
                </p>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-[#f8f9f6] border border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong> (with the ⊞ icon).
                </p>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-[#f8f9f6] border border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Tap <strong>"Add"</strong> in the top-right corner. The official <strong>GMC EcoPulse</strong> icon will appear on your Home Screen!
                </p>
              </div>
            </div>
          )}

          {/* Instructions: Android / Chrome */}
          {(activePlatformTab === 'android' || (activePlatformTab === 'auto' && !isIOS)) && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-[#f8f9f6] border border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  In Google Chrome or Samsung Internet, tap the <strong>three dots menu (⋮)</strong> in the top right.
                </p>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-[#f8f9f6] border border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-[#f8f9f6] border border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Confirm <strong>"Install"</strong>. The app installs as a standalone native app without browser URL bars!
                </p>
              </div>
            </div>
          )}

          {/* Instructions: Desktop Chrome / Edge */}
          {activePlatformTab === 'desktop' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-[#f8f9f6] border border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  In Google Chrome or Microsoft Edge, look at the right side of the address bar at the top of your screen.
                </p>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-[#f8f9f6] border border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Click the <strong>Install icon</strong> <Download className="w-3.5 h-3.5 inline mx-0.5 text-[#1b4332]" /> (or click Menu <strong>⋮</strong> &gt; <strong>"Save and share"</strong> &gt; <strong>"Install Gelephu Ecopulse"</strong>).
                </p>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-[#f8f9f6] border border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Click <strong>Install</strong>. The app launches in its own dedicated, high-performance window with desktop shortcut.
                </p>
              </div>
            </div>
          )}

          {/* Offline Benefits Strip */}
          <div className="p-3.5 rounded-2xl bg-[#F8F5ED] border border-[#2d6a4f]/20 text-xs text-[#192723] space-y-1.5">
            <div className="flex items-center space-x-1.5 font-extrabold text-[#1b4332]">
              <WifiOff className="w-4 h-4 text-[#2d6a4f]" />
              <span>Full Offline Field Telemetry Included</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-snug">
              When installed, Gelephu Ecopulse caches high-resolution maps, active sector missions, audio dispatches, and queues field incident reports offline when operating in remote mountain valleys.
            </p>
          </div>

          {/* Footer Action: Open in Dedicated Tab */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100">
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition min-h-[44px]"
            >
              <span>Open in New Browser Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center min-h-[44px]"
            >
              Done / Return to Platform
            </button>
          </div>

        </div>
      </div>
    );
  }
};
