import { useCallback, useRef } from 'react';

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback((frequency: number = 800, duration: number = 0.1, type: OscillatorType = 'square') => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio not supported');
    }
  }, [getAudioContext]);

  const playTerminalBeep = useCallback(() => {
    playBeep(600, 0.05, 'square');
  }, [playBeep]);

  const playErrorBeep = useCallback(() => {
    playBeep(200, 0.15, 'sawtooth');
  }, [playBeep]);

  const playPaymentBeep = useCallback(() => {
    playBeep(440, 0.1, 'sine');
    setTimeout(() => playBeep(554, 0.1, 'sine'), 100);
  }, [playBeep]);

  const playSuccessChime = useCallback(() => {
    const ctx = getAudioContext();
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      setTimeout(() => {
        try {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.frequency.value = freq;
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.3);
        } catch (e) {
          console.warn('Audio not supported');
        }
      }, i * 100);
    });
  }, [getAudioContext]);

  return {
    playTerminalBeep,
    playErrorBeep,
    playPaymentBeep,
    playSuccessChime,
  };
}
