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
    
    // Resume context if suspended (browser policy often requires user interaction)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(() => {});
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

  return { soundEnabled, toggleSound, playSound };
};