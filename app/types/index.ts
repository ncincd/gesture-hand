// Musical note types
export type MusicalNote = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

// Gesture detection types
export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface GestureData {
  landmarks: HandLandmark[][];
  timestamp: number;
  confidence: number;
}

// Piano state types
export interface PianoKey {
  note: MusicalNote;
  isActive: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PianoState {
  keys: PianoKey[];
  activeNotes: Set<MusicalNote>;
  volume: number;
  isPlaying: boolean;
}

// Gesture zone types
export interface GestureZone {
  note: MusicalNote;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isTriggered: boolean;
}

// Firebase logging types
export interface NoteEvent {
  note: MusicalNote;
  timestamp: number;
  duration?: number;
  handPosition: {
    x: number;
    y: number;
  };
} 