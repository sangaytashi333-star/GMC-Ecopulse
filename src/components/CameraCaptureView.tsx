import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  SwitchCamera, 
  X, 
  Check, 
  RotateCcw, 
  AlertCircle, 
  Sparkles,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { playMindfulChime } from '../utils/audio';

interface CameraCaptureViewProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
  title?: string;
}

export const CameraCaptureView: React.FC<CameraCaptureViewProps> = ({
  onCapture,
  onClose,
  title = "Capture Observation Photo"
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  // Start camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    // Stop any existing tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError("Camera API is not supported on this browser or platform.");
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn("Video play exception:", e));
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      // Fallback try without facingMode constraints if environment failed
      if (mode === 'environment') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          streamRef.current = fallbackStream;
          setHasCamera(true);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.play().catch(e => console.warn("Fallback video play exception:", e));
          }
          return;
        } catch (fallbackErr: any) {
          console.warn("Fallback camera failed:", fallbackErr);
        }
      }

      setHasCamera(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError("Camera permission was denied. Please allow camera access in your browser settings.");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError("No camera hardware detected on this device.");
      } else {
        setCameraError("Unable to access camera: " + (err.message || "Unknown error"));
      }
    }
  };

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  // Flip camera between front and back
  const handleToggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Capture current frame from video to canvas
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger visual shutter flash and chime
    setIsFlashing(true);
    playMindfulChime('bell');
    setTimeout(() => setIsFlashing(false), 200);

    // If front camera, mirror image horizontally so it looks natural
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.warn("Retake play error:", e));
    } else {
      startCamera(facingMode);
    }
  };

  // Confirm and use captured photo
  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  // Direct file input fallback
  const handleNativeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#081c15] text-white rounded-3xl overflow-hidden shadow-2xl border border-[#2d6a4f]/50 flex flex-col max-h-[95dvh]">
        
        {/* Top Header */}
        <div className="px-4 py-3 bg-[#1b4332]/90 backdrop-blur-md flex items-center justify-between border-b border-[#2d6a4f]/40 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#52b788] text-[#081c15] flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide">{title}</h3>
              <p className="text-[10px] text-[#d8f3dc]/80">GMC Ecological Lens</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-black/40 text-gray-300 hover:text-white hover:bg-black/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Camera Screen */}
        <div className="relative flex-1 bg-black min-h-[300px] sm:min-h-[380px] flex items-center justify-center overflow-hidden">
          
          {/* Shutter flash animation overlay */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {capturedImage ? (
            /* Snapshot Review State */
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Captured observation"
                className="max-h-[380px] w-full object-contain"
              />
              <div className="absolute top-3 left-3 bg-[#1b4332]/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#d8f3dc] flex items-center space-x-1.5 border border-[#52b788]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#52b788]" />
                <span>Snapshot Ready for Gemini AI</span>
              </div>
            </div>
          ) : hasCamera === false || cameraError ? (
            /* Camera Permission / Fallback State */
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">Live Camera Unavailable</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {cameraError || "Please allow camera access or use the device camera file picker."}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <label className="w-full py-2.5 px-4 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs cursor-pointer flex items-center justify-center space-x-2 transition shadow-md">
                  <Camera className="w-4 h-4" />
                  <span>Click Picture via Device Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleNativeFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition flex items-center justify-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Camera Permission</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Viewfinder Rule-of-Thirds Grid & Target Crosshair */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/15">
                <div className="border-r border-b border-white/10" />
                <div className="border-r border-b border-white/10" />
                <div className="border-b border-white/10" />
                <div className="border-r border-b border-white/10" />
                {/* Center Target */}
                <div className="border-r border-b border-white/10 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-[#52b788]/60 animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#52b788]" />
                  </div>
                </div>
                <div className="border-b border-white/10" />
                <div className="border-r border-white/10" />
                <div className="border-r border-white/10" />
                <div />
              </div>

              {/* Top Controls Overlay: Switch Camera */}
              <div className="absolute top-3 right-3 flex items-center space-x-2 z-20">
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  title="Switch Front/Back Camera"
                  className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition border border-white/20 shadow-sm"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>

              {/* Guide Pill */}
              <div className="absolute bottom-3 inset-x-0 mx-auto w-fit px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white font-medium border border-white/10 flex items-center space-x-1.5 pointer-events-none">
                <Zap className="w-3 h-3 text-[#52b788]" />
                <span>Center wildlife or environmental item & tap Shutter</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 bg-[#1b4332] border-t border-[#2d6a4f]/40 flex items-center justify-between">
          {capturedImage ? (
            /* Actions when photo is taken */
            <div className="flex items-center justify-between w-full space-x-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Photo</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-lg transition"
              >
                <Check className="w-4 h-4 text-[#081c15]" />
                <span>Use This Photo</span>
              </button>
            </div>
          ) : (
            /* Actions when in live camera mode */
            <div className="flex items-center justify-between w-full">
              {/* Native file upload fallback */}
              <label className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition flex items-center justify-center" title="Upload from Gallery">
                <ImageIcon className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNativeFileUpload}
                  className="hidden"
                />
              </label>

              {/* Main Shutter Button */}
              <button
                type="button"
                onClick={handleSnapPhoto}
                disabled={!hasCamera}
                className="w-16 h-16 rounded-full bg-white border-4 border-[#52b788] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                <div className="w-12 h-12 rounded-full bg-[#1b4332] group-hover:bg-[#2d6a4f] flex items-center justify-center transition">
                  <div className="w-4 h-4 rounded-full bg-[#52b788]" />
                </div>
              </button>

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
