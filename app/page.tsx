'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { MusicalNote } from '@/types';
import { soundEngine } from '@/lib/sound-engine';
import PianoInterface from '@/components/piano/PianoInterface';
import ControlPanel from '@/components/ui/ControlPanel';

const GestureDetection = dynamic(
  () => import('@/components/gesture/GestureDetection'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Gesture Detector...</p>
        </div>
      </div>
    )
  }
);

type AudioState = 'uninitialized' | 'initializing' | 'ready' | 'error';

export default function AirPiano() {
  const [activeNotes, setActiveNotes] = useState<Set<MusicalNote>>(new Set());
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [audioState, setAudioState] = useState<AudioState>('uninitialized');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize sound engine on user interaction
  const handleInitialize = async () => {
    if (audioState !== 'uninitialized') return;

    setAudioState('initializing');
    try {
      await soundEngine.initialize();
      soundEngine.setVolume(volume);
      setAudioState('ready');
      setIsSoundEnabled(true);
      console.log('🎵 Air Piano ready!');
    } catch (err) {
      console.error('Failed to initialize audio:', err);
      setErrorMessage('Failed to initialize audio system. Please check your browser permissions and try again.');
      setAudioState('error');
    }
  };

  // Update volume when changed
  useEffect(() => {
    if (audioState === 'ready') {
      soundEngine.setVolume(volume);
    }
  }, [volume, audioState]);

  // Gesture detection handlers
  const handleGestureDetected = useCallback((note: MusicalNote, position: { x: number; y: number }) => {
    if (!isSoundEnabled || audioState !== 'ready') return;

    setActiveNotes(prev => new Set(prev).add(note));
    soundEngine.startNote(note);
    
    console.log(`🎵 Gesture detected: ${note} at (${position.x.toFixed(2)}, ${position.y.toFixed(2)})`);
  }, [isSoundEnabled, audioState]);

  const handleGestureEnded = useCallback((note: MusicalNote) => {
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
    soundEngine.stopNote(note);
    
    console.log(`🎵 Gesture ended: ${note}`);
  }, []);

  // Manual piano key handlers
  const handleKeyPress = useCallback((note: MusicalNote) => {
    if (!isSoundEnabled || audioState !== 'ready') return;

    setActiveNotes(prev => new Set(prev).add(note));
    soundEngine.startNote(note);
  }, [isSoundEnabled, audioState]);

  const handleKeyRelease = useCallback((note: MusicalNote) => {
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
    soundEngine.stopNote(note);
  }, []);

  // Control handlers
  const handleToggleGesture = () => {
    setIsGestureActive(prev => !prev);
  };

  const handleToggleSound = () => {
    setIsSoundEnabled(prev => !prev);
    // Stop all currently playing notes when disabling sound
    if (isSoundEnabled) {
      activeNotes.forEach(note => soundEngine.stopNote(note));
      setActiveNotes(new Set());
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  // UI for different audio states
  if (audioState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🎹 Air Piano Error</h1>
          <p className="text-red-500 mb-4">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (audioState !== 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">🎹 Welcome to the Air Piano</h1>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            This interactive experience requires audio permissions. Click the button below to start the sound engine and begin your musical journey.
          </p>
          <button
            onClick={handleInitialize}
            disabled={audioState === 'initializing'}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-wait flex items-center justify-center mx-auto"
          >
            {audioState === 'initializing' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Initializing...
              </>
            ) : (
              'Click to Start'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎹 IoT Air Piano
          </h1>
          <p className="text-lg text-gray-600">
            Play music with your gestures - an invisible piano in the air!
          </p>
        </div>

        {/* Control Panel */}
        <ControlPanel
          isGestureActive={isGestureActive}
          onToggleGesture={handleToggleGesture}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={handleToggleSound}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gesture Detection Area */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              📹 Gesture Detection
            </h2>
            <GestureDetection
              onGestureDetected={handleGestureDetected}
              onGestureEnded={handleGestureEnded}
              isActive={isGestureActive}
            />
          </div>

          {/* Piano Interface */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              🎹 Piano Interface
            </h2>
            <PianoInterface
              activeNotes={activeNotes}
              onKeyPress={handleKeyPress}
              onKeyRelease={handleKeyRelease}
              volume={volume}
              onVolumeChange={handleVolumeChange}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📖 How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600">1. Enable Camera</h3>
              <p className="text-gray-600">
                Click &quot;Enable Camera&quot; to start gesture detection. Your browser will ask for camera permission.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-600">2. Position Your Hands</h3>
              <p className="text-gray-600">
                Move your hands over the blue gesture zones shown on the camera feed. Each zone represents a musical note (C, D, E, F, G, A, B).
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-600">3. Make Music!</h3>
              <p className="text-gray-600">
                When your finger enters a zone, the corresponding note will play. You can also click the piano keys manually.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Built with ❤️ using Next.js, MediaPipe, and Tone.js</p>
        </div>
      </div>
    </div>
  );
}
