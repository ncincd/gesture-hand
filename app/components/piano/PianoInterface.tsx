'use client';

import { MusicalNote } from '@/types';
import { MUSICAL_NOTES } from '@/utils/constants';

interface PianoInterfaceProps {
  activeNotes: Set<MusicalNote>;
  onKeyPress?: (note: MusicalNote) => void;
  onKeyRelease?: (note: MusicalNote) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export default function PianoInterface({ 
  activeNotes, 
  onKeyPress, 
  onKeyRelease,
  volume,
  onVolumeChange
}: PianoInterfaceProps) {
  const handleKeyMouseDown = (note: MusicalNote) => {
    onKeyPress?.(note);
  };

  const handleKeyMouseUp = (note: MusicalNote) => {
    onKeyRelease?.(note);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gray-50 rounded-lg">
      {/* Volume Control */}
      <div className="flex items-center gap-4 w-full max-w-md">
        <label className="text-sm font-medium text-gray-700 min-w-fit">Volume:</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-gray-600 min-w-fit">{Math.round(volume * 100)}%</span>
      </div>

      {/* Piano Keys */}
      <div className="flex gap-2 items-end">
                 {MUSICAL_NOTES.map((note) => {
           const isActive = activeNotes.has(note);
           const isSharp = false; // No sharp notes in our 7-note scale
          
          return (
            <button
              key={note}
              className={`
                relative transition-all duration-150 ease-in-out border-2 rounded-b-lg
                ${isSharp 
                  ? 'bg-gray-800 border-gray-900 h-32 w-8 -mx-1 z-10' 
                  : 'bg-white border-gray-300 h-48 w-12'
                }
                ${isActive 
                  ? isSharp 
                    ? 'bg-blue-600 border-blue-700 shadow-lg transform scale-95' 
                    : 'bg-blue-200 border-blue-400 shadow-lg transform scale-95'
                  : 'hover:bg-gray-100'
                }
                active:transform active:scale-95
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
              onMouseDown={() => handleKeyMouseDown(note)}
              onMouseUp={() => handleKeyMouseUp(note)}
              onMouseLeave={() => handleKeyMouseUp(note)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleKeyMouseDown(note);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleKeyMouseUp(note);
              }}
            >
              <span 
                className={`
                  absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium
                  ${isSharp ? 'text-white' : 'text-gray-700'}
                  ${isActive ? 'font-bold' : ''}
                `}
              >
                {note}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div 
                  className={`
                    absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full
                    ${isSharp ? 'bg-blue-300' : 'bg-blue-500'}
                    animate-pulse
                  `}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Notes Display */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-gray-600">Currently Playing:</p>
        <div className="flex gap-2 min-h-[2rem] items-center">
          {activeNotes.size > 0 ? (
            Array.from(activeNotes).map(note => (
              <span 
                key={note} 
                className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium animate-pulse"
              >
                {note}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm italic">No notes playing</span>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600 max-w-md">
        <p>🎹 <strong>Gesture Control:</strong> Move your hand over the gesture zones above to play notes</p>
        <p>🖱️ <strong>Manual Control:</strong> Click and hold the piano keys to play notes manually</p>
      </div>
    </div>
  );
} 