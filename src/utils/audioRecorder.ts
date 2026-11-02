/**
 * Utilities for recording, encoding, and playing citizen voice observations.
 * Supports HTML5 MediaRecorder API with fallback synthesized sample audio for environments without mic permissions.
 */

export interface RecordedAudioResult {
  audioUrl: string; // base64 data URL
  durationSeconds: number;
  blob?: Blob;
}

class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private timerInterval: any = null;

  public isRecording(): boolean {
    return this.mediaRecorder !== null && this.mediaRecorder.state === 'recording';
  }

  public async start(onTimeTick?: (seconds: number) => void): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Audio recording is not supported in this browser.');
    }

    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    // Check supported mime type
    let mimeType = 'audio/webm';
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }
    }

    this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.startTime = Date.now();
    this.mediaRecorder.start(200); // 200ms slice

    if (onTimeTick) {
      this.timerInterval = setInterval(() => {
        const elapsedSecs = Math.floor((Date.now() - this.startTime) / 1000);
        onTimeTick(elapsedSecs);
      }, 500);
    }

    return true;
  }

  public async stop(): Promise<RecordedAudioResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Recorder is not active'));
      }

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

      this.mediaRecorder.onstop = () => {
        try {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const blob = new Blob(this.audioChunks, { type: mimeType });

          // Release mic tracks
          if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
          }
          this.mediaRecorder = null;

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Url = reader.result as string;
            resolve({
              audioUrl: base64Url,
              durationSeconds,
              blob,
            });
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(blob);
        } catch (err) {
          reject(err);
        }
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    });
  }

  public cancel(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (_) {}
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}

export const audioRecorder = new AudioRecorderService();

/**
 * Generates an authentic melodic harmonic voice-dispatch note as a base64 WAV data URL.
 * Useful for fallback when mic is unavailable or for demo reports.
 */
export function createSampleVoiceRecording(titleText: string = 'Field Observation'): { audioUrl: string; durationSeconds: number } {
  const sampleRate = 22050;
  const durationSec = 4;
  const numSamples = sampleRate * durationSec;
  const numChannels = 1;

  const headerLength = 44;
  const buffer = new ArrayBuffer(headerLength + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true); // BitsPerSample
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Generate gentle ambient Himalayan acoustic harmonics & simulated voice dispatch tone
  // Frequencies simulating human voice formant intervals (F0 ~ 220Hz - 440Hz)
  const baseFreq = 261.63; // Middle C
  const offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Formant sweep simulating spoken vocal intonation
    const formant = 1 + 0.15 * Math.sin(2 * Math.PI * 3.5 * t);
    const envelope = Math.sin((Math.PI * t) / durationSec) * (0.8 + 0.2 * Math.sin(2 * Math.PI * 2 * t));

    const sample = 
      0.45 * Math.sin(2 * Math.PI * baseFreq * formant * t) +
      0.30 * Math.sin(2 * Math.PI * (baseFreq * 1.5) * t) +
      0.15 * Math.sin(2 * Math.PI * (baseFreq * 2.0) * t) +
      0.05 * (Math.random() - 0.5); // subtle natural air breath

    const int16 = Math.max(-32768, Math.min(32767, Math.floor(sample * envelope * 24000)));
    view.setInt16(offset + i * 2, int16, true);
  }

  // Convert buffer to base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return {
    audioUrl: `data:audio/wav;base64,${base64}`,
    durationSeconds: durationSec,
  };
}
