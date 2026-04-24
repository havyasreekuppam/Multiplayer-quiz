/**
 * Sound Effects Utility
 * Provides audio feedback for user actions
 * Can use browser's Web Audio API or HTML5 Audio
 */

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = localStorage.getItem('soundEnabled') !== 'false';
    this.initializeSounds();
  }

  initializeSounds() {
    // Using beep tones generated via Web Audio API
    // In production, link to actual audio files
    this.sounds = {
      correct: () => this.playTone(800, 200), // High pitched beep
      wrong: () => this.playTone(300, 400), // Low pitched beep
      click: () => this.playTone(600, 100), // Short beep
      success: () => this.playTone(700, 300), // Victory tone
      countdown: () => this.playTone(500, 50), // Quick beep
    };
  }

  /**
   * Play a tone using Web Audio API
   * frequency: Hz (200-20000)
   * duration: milliseconds
   */
  playTone(frequency = 600, duration = 200) {
    if (!this.enabled || !('AudioContext' in window)) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.log('Sound playback not available:', error);
    }
  }

  // Play specific sounds
  playCorrect() {
    this.sounds.correct?.();
  }

  playWrong() {
    this.sounds.wrong?.();
  }

  playClick() {
    this.sounds.click?.();
  }

  playSuccess() {
    this.sounds.success?.();
  }

  playCountdown() {
    this.sounds.countdown?.();
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled ? 'true' : 'false');
  }

  isEnabled() {
    return this.enabled;
  }
}

// Singleton instance
const soundManager = new SoundManager();

export default soundManager;

/*
 * Usage Examples:
 *
 * import soundManager from '../utils/soundManager';
 *
 * // Play sounds
 * soundManager.playCorrect();
 * soundManager.playWrong();
 * soundManager.playClick();
 * soundManager.playSuccess();
 *
 * // Toggle sounds
 * soundManager.toggle();
 *
 * // Check if enabled
 * if (soundManager.isEnabled()) {
 *   soundManager.playCorrect();
 * }
 */
