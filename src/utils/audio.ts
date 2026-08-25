/**
 * Web Audio API gentle mindfulness chime & singing bowl synthesizer
 */

let audioCtx: AudioContext | null = null;
let soundMuted = false;

export function isSoundMuted(): boolean {
  return soundMuted;
}

export function toggleSoundMute(): boolean {
  soundMuted = !soundMuted;
  return !soundMuted; // returns true if sound is enabled
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || soundMuted) return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a soothing Himalayan Singing Bowl harmonic chime
 * Frequencies correspond to Tibetan F# / C# heart & crown chakra harmonics (432Hz tuning)
 */
export function playMindfulChime(type: 'karma' | 'badge' | 'bell' | 'redeem' = 'bell') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    if (type === 'karma') {
      // Ascending gentle pentatonic triad (E4, G#4, B4, E5)
      const freqs = [329.63, 415.30, 493.88, 659.25];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        noteGain.gain.setValueAtTime(0, now + i * 0.08);
        noteGain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.03);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.2);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 1.3);
      });
    } else if (type === 'badge') {
      // Resonant deep bell with shimmering overtones
      const fundamentals = [216, 432, 648, 864];
      fundamentals.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const volume = 0.15 / (idx + 1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 3.0);
      });
    } else if (type === 'redeem') {
      // Warm gong of abundance
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, now); // C4
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.3); // C5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 2.0);
    } else {
      // Classic singing bowl pure tone (432 Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(432, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(432 * 1.5, now); // Perfect fifth overtone

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.5);
      osc2.stop(now + 2.5);
    }
  } catch (err) {
    // Audio contexts might be blocked until user gesture, safely ignore
  }
}
