'use client';

import { MusicalNote } from '@/types';
import { NOTE_FREQUENCIES } from '@/utils/constants';

interface ToneSynth {
  triggerAttackRelease(frequency: number, duration: string): void;
  triggerAttack(frequency: number): void;
  triggerRelease(frequency: number): void;
  volume: { value: number };
  dispose(): void;
}

class SoundEngine {
  private synth: ToneSynth | null = null;
  private isInitialized = false;

  constructor() {
    // The constructor is now safe to be called on the server, as it does nothing.
  }

  async initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    try {
      // Dynamically import Tone.js only on the client
      const Tone = await import('tone');
      
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'sine',
        },
        envelope: {
          attack: 0.02,
          decay: 0.1,
          sustain: 0.3,
          release: 1,
        },
      }).toDestination();
      
      this.synth.volume.value = -10;

      await Tone.start();
      this.isInitialized = true;
      console.log('🎵 Sound engine initialized');
    } catch (error) {
      console.error('Failed to initialize sound engine:', error);
      throw error;
    }
  }

  playNote(note: MusicalNote, duration = '8n') {
    if (!this.synth) {
      console.warn('Sound engine not initialized');
      return;
    }
    const frequency = NOTE_FREQUENCIES[note];
    this.synth.triggerAttackRelease(frequency, duration);
  }

  startNote(note: MusicalNote) {
    if (!this.synth) return;
    const frequency = NOTE_FREQUENCIES[note];
    this.synth.triggerAttack(frequency);
  }

  stopNote(note: MusicalNote) {
    if (!this.synth) return;
    const frequency = NOTE_FREQUENCIES[note];
    this.synth.triggerRelease(frequency);
  }

  setVolume(volume: number) {
    if (!this.synth) return;
    const dbVolume = volume === 0 ? -Infinity : Math.log10(volume) * 20;
    this.synth.volume.value = Math.max(-60, Math.min(0, dbVolume));
  }

  dispose() {
    if (this.synth) {
      this.synth.dispose();
    }
    this.synth = null;
    this.isInitialized = false;
  }
}

export const soundEngine = new SoundEngine(); 