// Audio & Video Media Stream Management

export interface AudioLevelMonitor {
  stop: () => void;
}

export async function getLocalUserMedia(options: { video?: boolean; audio?: boolean }): Promise<MediaStream | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('getUserMedia not supported in this environment');
    return null;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: options.video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      audio: options.audio ?? true,
    });
    return stream;
  } catch (err) {
    console.warn('Could not acquire media devices:', err);
    return null;
  }
}

export async function getLocalDisplayMedia(): Promise<MediaStream | null> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    console.warn('getDisplayMedia not supported in this environment');
    return null;
  }

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
    return stream;
  } catch (err) {
    console.warn('Could not acquire display stream:', err);
    return null;
  }
}

export function monitorAudioVolume(
  stream: MediaStream,
  onVolumeChange: (volume: number, isSpeaking: boolean) => void
): AudioLevelMonitor {
  let animationFrameId: number;
  let audioContext: AudioContext | null = null;
  let isRunning = true;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioContext = new AudioContextClass();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.4;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudio = () => {
      if (!isRunning) return;
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const normalized = Math.min(100, Math.round((average / 128) * 100));
      const isSpeaking = normalized > 12; // Threshold for active speech
      onVolumeChange(normalized, isSpeaking);
      animationFrameId = requestAnimationFrame(checkAudio);
    };

    checkAudio();
  } catch (e) {
    console.warn('Audio analyser setup failed:', e);
  }

  return {
    stop: () => {
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    },
  };
}
