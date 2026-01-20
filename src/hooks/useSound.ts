import { useState, useEffect, useCallback, useRef } from 'react';

const SOUND_ENABLED_KEY = 'snake-sound-enabled';

export const useSound = () => {
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem(SOUND_ENABLED_KEY) !== 'false'
  );
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    localStorage.setItem(SOUND_ENABLED_KEY, newSoundEnabled.toString());

    if (newSoundEnabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, [soundEnabled]);

  const playSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'square', volume: number = 0.1) => {
    if (!soundEnabled || !audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => { });
    }

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  }, [soundEnabled]);

  const playExplosionSound = useCallback(() => {
    if (!soundEnabled || !audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => { });
    }

    const t = audioContextRef.current.currentTime;

    // Sub-bass thump
    const osc1 = audioContextRef.current.createOscillator();
    const gain1 = audioContextRef.current.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(100, t);
    osc1.frequency.exponentialRampToValueAtTime(10, t + 0.5);
    gain1.gain.setValueAtTime(0.5, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc1.connect(gain1);
    gain1.connect(audioContextRef.current.destination);
    osc1.start(t);
    osc1.stop(t + 0.5);

    // Crackle/Noise
    const osc2 = audioContextRef.current.createOscillator();
    const gain2 = audioContextRef.current.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(40, t);
    osc2.frequency.linearRampToValueAtTime(80, t + 0.2);
    gain2.gain.setValueAtTime(0.2, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc2.connect(gain2);
    gain2.connect(audioContextRef.current.destination);
    osc2.start(t);
    osc2.stop(t + 0.2);
  }, [soundEnabled]);

  return { soundEnabled, toggleSound, playSound, playExplosionSound };
};