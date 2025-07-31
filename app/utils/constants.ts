import { MusicalNote } from '@/types';

// Musical note frequencies (4th octave)
export const NOTE_FREQUENCIES: Record<MusicalNote, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.00,
  A: 440.00,
  B: 493.88,
};

// Available musical notes in order
export const MUSICAL_NOTES: MusicalNote[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Gesture detection settings
export const GESTURE_CONFIG = {
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5, // Lowered from 0.7 for better detection
  minTrackingConfidence: 0.5,
};

// Piano UI settings
export const PIANO_CONFIG = {
  keyWidth: 80,
  keyHeight: 200,
  spacing: 10,
  activeColor: '#3b82f6',
  inactiveColor: '#e5e7eb',
};

// Gesture zones - Divide the screen into vertical columns for each note
export const GESTURE_ZONES = MUSICAL_NOTES.map((note, index) => ({
  note,
  bounds: {
    x: index * (1 / MUSICAL_NOTES.length),
    y: 0.1, // Start higher up
    width: 1 / MUSICAL_NOTES.length,
    height: 0.8, // Make zones taller
  },
})); 