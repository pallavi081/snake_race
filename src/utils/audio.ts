import storage from './storage';

/**
 * Enhanced Audio and Haptics Service for Snake Race
 * Uses Web Audio API for synthesized sounds to keep the build small.
 */

class AudioService {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;

    private init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.error('Web Audio API not supported');
        }
    }

    private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
        if (!storage.getSettings().soundEnabled) return;
        this.init();
        if (!this.ctx || !this.masterGain) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.1, this.ctx.currentTime + duration);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // --- Haptic Feedback ---
    public vibrate(pattern: number | number[] = 10) {
        if (storage.getSettings().vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // --- Sound Effects ---

    public playEat() {
        this.playTone(600, 0.1, 'sine', 0.15);
        this.vibrate(5);
    }

    public playCrash() {
        this.playTone(150, 0.3, 'sawtooth', 0.2);
        this.vibrate([20, 10, 20]);
    }

    public playLevelUp() {
        this.playTone(400, 0.4, 'sine', 0.15);
        setTimeout(() => this.playTone(600, 0.4, 'sine', 0.15), 100);
        setTimeout(() => this.playTone(800, 0.4, 'sine', 0.15), 200);
        this.vibrate([10, 5, 10, 5, 20]);
    }

    public playPowerUp() {
        this.playTone(800, 0.2, 'triangle', 0.1);
        this.playTone(1000, 0.2, 'triangle', 0.1);
        this.vibrate(15);
    }

    public playClick() {
        this.playTone(1000, 0.05, 'sine', 0.05);
        this.vibrate(2);
    }

    public playExplosion() {
        this.playTone(100, 0.8, 'square', 0.2);
        this.vibrate([50, 20, 50]);
    }
}

export const audio = new AudioService();
export default audio;
