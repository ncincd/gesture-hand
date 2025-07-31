'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useWebcam } from '@/hooks/useWebcam';
import { MusicalNote } from '@/types';
import { GESTURE_CONFIG, GESTURE_ZONES } from '@/utils/constants';

// Define the types for the dynamically imported MediaPipe Hands module
interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}
type LandmarkList = Landmark[];
interface Results {
  image: CanvasImageSource;
  multiHandLandmarks: LandmarkList[];
}
interface HandsOptions {
  [key: string]: unknown;
}
interface HandsInstance {
  close(): Promise<void>;
  onResults(callback: (results: Results) => void): void;
  initialize(): Promise<void>;
  send(options: { image: CanvasImageSource }): Promise<void>;
  setOptions(options: HandsOptions): void;
}

interface GestureDetectionProps {
  onGestureDetected: (note: MusicalNote, position: { x: number; y: number }) => void;
  onGestureEnded: (note: MusicalNote) => void;
  isActive: boolean;
}

export default function GestureDetection({ onGestureDetected, onGestureEnded, isActive }: GestureDetectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<HandsInstance | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const activeNotesRef = useRef<Set<MusicalNote>>(new Set());
  
  const { videoRef, isLoading, error, isStreamActive, startCamera } = useWebcam();
  const [detectionStats, setDetectionStats] = useState({ hands: 0, fps: 0 });
  const [modelStatus, setModelStatus] = useState('loading'); // 'loading', 'ready', 'error'
  const noHandsTimer = useRef<NodeJS.Timeout | null>(null);
  const [showDetectionTip, setShowDetectionTip] = useState(false);
  const lastTimeRef = useRef<number>(0);

  // Use refs to store the latest callbacks, preventing re-renders.
  const onGestureDetectedRef = useRef(onGestureDetected);
  const onGestureEndedRef = useRef(onGestureEnded);

  useEffect(() => {
    onGestureDetectedRef.current = onGestureDetected;
    onGestureEndedRef.current = onGestureEnded;
  }, [onGestureDetected, onGestureEnded]);

  const checkGestureZones = useCallback((landmarks: LandmarkList) => {
    if (!landmarks.length) return;
    const indexFingerTip = landmarks[8];
    if (!indexFingerTip) return;

    GESTURE_ZONES.forEach(zone => {
      const isInZone = (
        indexFingerTip.x >= zone.bounds.x &&
        indexFingerTip.x <= zone.bounds.x + zone.bounds.width &&
        indexFingerTip.y >= zone.bounds.y &&
        indexFingerTip.y <= zone.bounds.y + zone.bounds.height
      );
      const wasActive = activeNotesRef.current.has(zone.note);

      if (isInZone && !wasActive) {
        activeNotesRef.current.add(zone.note);
        onGestureDetectedRef.current(zone.note, { x: indexFingerTip.x, y: indexFingerTip.y });
      } else if (!isInZone && wasActive) {
        activeNotesRef.current.delete(zone.note);
        onGestureEndedRef.current(zone.note);
      }
    });
  }, []);

  const onResults = useCallback((results: Results) => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    GESTURE_ZONES.forEach(zone => {
      const x = zone.bounds.x * canvas.width;
      const y = zone.bounds.y * canvas.height;
      const width = zone.bounds.width * canvas.width;
      const height = zone.bounds.height * canvas.height;
      ctx.fillStyle = `rgba(59, 130, 246, 0.1)`;
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(zone.note, x + width / 2, y + height / 2);
    });

    if (results.multiHandLandmarks && isActive && results.multiHandLandmarks.length > 0) {
      results.multiHandLandmarks.forEach((landmarks) => {
        landmarks.forEach((landmark, index) => {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;
          ctx.fillStyle = '#00FF00';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
          if (index === 8) {
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
        checkGestureZones(landmarks);
      });
      
      const now = performance.now();
      const newFps = 1000 / (now - lastTimeRef.current || 1);
      lastTimeRef.current = now;

      setDetectionStats({ hands: results.multiHandLandmarks.length, fps: Math.round(newFps) });

      if (noHandsTimer.current) {
        clearTimeout(noHandsTimer.current);
        noHandsTimer.current = null;
      }
      setShowDetectionTip(false);
    } else if (isActive) {
      if (!noHandsTimer.current) {
        noHandsTimer.current = setTimeout(() => {
          setShowDetectionTip(true);
        }, 3000);
      }
    }
  }, [isActive, checkGestureZones, videoRef]);

  const processVideoFrame = useCallback(async () => {
    if (!videoRef.current || !handsRef.current || !isActive || !isStreamActive) {
      return;
    }
    const video = videoRef.current;
    if (video.readyState >= 2) {
      await handsRef.current.send({ image: video });
    }
    if (isActive) {
      animationFrameRef.current = requestAnimationFrame(processVideoFrame);
    }
  }, [isActive, isStreamActive, videoRef]);

  useEffect(() => {
    if (!isStreamActive) return;

    let hands: HandsInstance;
    const initializeHands = async () => {
      try {
        setModelStatus('loading');
        const mediapipeHands = await import('@mediapipe/hands');
        hands = new mediapipeHands.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });
        hands.setOptions(GESTURE_CONFIG);
        hands.onResults(onResults);
        await hands.initialize();
        handsRef.current = hands;
        setModelStatus('ready');
      } catch (err) {
        console.error("🔥 Failed to initialize MediaPipe Hands:", err);
        setModelStatus('error');
      }
    };
    initializeHands();
    return () => {
      if (hands) hands.close();
      handsRef.current = null;
    };
  }, [isStreamActive, onResults]);

  useEffect(() => {
    if (isActive && isStreamActive && modelStatus === 'ready') {
      processVideoFrame();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isActive, isStreamActive, modelStatus, processVideoFrame]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-lg font-semibold mb-2">Camera Error</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button onClick={startCamera} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Retry Camera Access
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <video ref={videoRef} className="w-full max-w-4xl h-auto rounded-lg" autoPlay playsInline muted />
      <canvas ref={canvasRef} width={1280} height={720} className="absolute top-0 left-0 w-full h-full" />
      
      {showDetectionTip && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <h3 className="text-lg font-bold mb-2">🖐️ Hand Not Detected</h3>
            <p className="text-gray-600">Try moving closer to the camera, ensuring good lighting, and showing your palm.</p>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded">
        <div className="flex gap-4 text-sm items-center">
          <span>Hands: {detectionStats.hands}</span>
          <span>FPS: {detectionStats.fps}</span>
          <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span>Model: <span className={`${modelStatus === 'ready' ? 'text-green-400' : 'text-yellow-400'}`}>{modelStatus}</span></span>
        </div>
      </div>
      {!isStreamActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Starting camera...</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4">Camera access required for gesture detection</p>
              <button onClick={startCamera} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Enable Camera
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 