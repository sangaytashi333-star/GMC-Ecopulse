import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Radio } from 'lucide-react';

interface VoicePlayerProps {
  audioUrl?: string;
  durationSeconds?: number;
  label?: string;
  compact?: boolean;
  className?: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  audioUrl,
  durationSeconds = 0,
  label = 'Citizen Voice Dispatch',
  compact = false,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(durationSeconds || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [audioUrl]);

  if (!audioUrl) return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Audio playback error:', err);
        setHasError(true);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const seekTime = Number(e.target.value);
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleReset = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 bg-[#1b4332]/90 text-white px-3 py-1.5 rounded-xl border border-[#52b788]/40 shadow-xs ${className}`}>
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        <button
          type="button"
          onClick={togglePlay}
          className="w-7 h-7 rounded-lg bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] flex items-center justify-center shrink-0 transition active:scale-95 shadow-xs"
          title={isPlaying ? 'Pause' : 'Play Voice Dispatch'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />}
        </button>

        <div className="flex-1 min-w-[70px]">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#d8f3dc]">
            <span className="font-bold flex items-center gap-1">
              <Radio className={`w-3 h-3 text-[#52b788] ${isPlaying ? 'animate-pulse' : ''}`} />
              Voice
            </span>
            <span>{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full mt-1 overflow-hidden">
            <div
              className="bg-[#52b788] h-full transition-all duration-100 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#081c15] via-[#1b4332] to-[#081c15] text-white border border-[#52b788]/40 shadow-md ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-[#52b788]/20 text-[#74c69d]">
            <Radio className={`w-4 h-4 ${isPlaying ? 'animate-pulse text-[#52b788]' : ''}`} />
          </span>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">{label}</h4>
            <p className="text-[10px] text-[#d8f3dc]/70">Citizen field recording (original language)</p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] font-mono font-bold text-[#74c69d] bg-black/40 px-2.5 py-1 rounded-lg border border-[#52b788]/20">
          <span>{formatTime(currentTime)}</span>
          <span className="text-gray-500">/</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Visual Audio Waveform Simulation */}
      <div className="py-2.5 flex items-center justify-center space-x-1 sm:space-x-1.5 h-9">
        {[40, 65, 85, 30, 95, 50, 70, 90, 45, 60, 100, 75, 40, 80, 55, 35, 90, 65, 50, 30].map((h, i) => {
          const isBarPast = (i / 20) <= (progressPercent / 100);
          return (
            <div
              key={i}
              className={`w-1 sm:w-1.5 rounded-full transition-all duration-150 ${
                isBarPast ? 'bg-[#52b788]' : 'bg-white/20'
              } ${isPlaying ? 'animate-pulse' : ''}`}
              style={{
                height: isPlaying ? `${Math.max(20, (h * (0.6 + Math.sin((i + currentTime * 5)) * 0.4)))}%` : `${h * 0.5}%`,
              }}
            />
          );
        })}
      </div>

      {/* Controls & Progress */}
      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={totalDuration || 1}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-[#52b788]"
        />

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={togglePlay}
              className="px-3 py-1.5 rounded-xl bg-[#52b788] hover:bg-[#74c69d] text-[#081c15] font-extrabold text-xs shadow-md transition flex items-center space-x-1.5 active:scale-95"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
              <span>{isPlaying ? 'Pause Audio' : 'Play Voice Observation'}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#d8f3dc] transition"
              title="Restart from beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#d8f3dc] transition"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {hasError && (
        <p className="text-[10px] text-rose-400 mt-2 bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
          Audio playback could not be initialized on this device.
        </p>
      )}
    </div>
  );
};
