'use client';

interface ControlPanelProps {
  isGestureActive: boolean;
  onToggleGesture: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  isRecording?: boolean;
  onToggleRecording?: () => void;
  recordedNotes?: number;
}

export default function ControlPanel({
  isGestureActive,
  onToggleGesture,
  isSoundEnabled,
  onToggleSound,
  isRecording = false,
  onToggleRecording,
  recordedNotes = 0,
}: ControlPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        🎹 Air Piano Controls
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gesture Detection Toggle */}
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Gesture Detection</h3>
          <button
            onClick={onToggleGesture}
            className={`
              w-16 h-8 rounded-full transition-all duration-300 ease-in-out relative
              ${isGestureActive 
                ? 'bg-green-500 shadow-lg shadow-green-200' 
                : 'bg-gray-300'
              }
            `}
          >
            <div
              className={`
                absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ease-in-out
                ${isGestureActive ? 'left-9' : 'left-1'}
              `}
            />
          </button>
          <span className={`text-xs mt-1 font-medium ${isGestureActive ? 'text-green-600' : 'text-gray-500'}`}>
            {isGestureActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Sound Toggle */}
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Sound Output</h3>
          <button
            onClick={onToggleSound}
            className={`
              w-16 h-8 rounded-full transition-all duration-300 ease-in-out relative
              ${isSoundEnabled 
                ? 'bg-blue-500 shadow-lg shadow-blue-200' 
                : 'bg-gray-300'
              }
            `}
          >
            <div
              className={`
                absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ease-in-out
                ${isSoundEnabled ? 'left-9' : 'left-1'}
              `}
            />
          </button>
          <span className={`text-xs mt-1 font-medium ${isSoundEnabled ? 'text-blue-600' : 'text-gray-500'}`}>
            {isSoundEnabled ? 'Enabled' : 'Muted'}
          </span>
        </div>

        {/* Recording Toggle (if enabled) */}
        {onToggleRecording && (
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recording</h3>
            <button
              onClick={onToggleRecording}
              className={`
                w-16 h-8 rounded-full transition-all duration-300 ease-in-out relative
                ${isRecording 
                  ? 'bg-red-500 shadow-lg shadow-red-200 animate-pulse' 
                  : 'bg-gray-300'
                }
              `}
            >
              <div
                className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ease-in-out
                  ${isRecording ? 'left-9' : 'left-1'}
                `}
              />
            </button>
            <span className={`text-xs mt-1 font-medium ${isRecording ? 'text-red-600' : 'text-gray-500'}`}>
              {isRecording ? `Recording (${recordedNotes})` : 'Stopped'}
            </span>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-700 font-medium">Status:</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isGestureActive && isSoundEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-blue-600">
              {isGestureActive && isSoundEnabled 
                ? 'Ready to play! Move your hands over the camera.' 
                : 'Enable gesture detection and sound to start playing.'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 