import type { Direction } from '../types';

interface ControlPadProps {
  onMove: (direction: Direction) => void;
  onGrab: () => void;
  disabled: boolean;
  clawState: string;
}

export function ControlPad({ onMove, onGrab, disabled, clawState }: ControlPadProps) {
  const isGrabbing = clawState === 'grabbing' || clawState === 'returning' || clawState === 'releasing';
  const btnBase = 'w-16 h-16 rounded-xl font-bold text-xl transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed select-none';
  const dirBtn = `${btnBase} bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-600 shadow-lg active:shadow-sm`;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* D-Pad */}
      <div className="relative">
        <div className="grid grid-cols-3 gap-2 w-56">
          {/* Row 1 */}
          <div />
          <button
            className={dirBtn}
            onMouseDown={() => onMove('up')}
            disabled={disabled || isGrabbing}
            aria-label="Move up"
          >
            <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <div />

          {/* Row 2 */}
          <button
            className={dirBtn}
            onMouseDown={() => onMove('left')}
            disabled={disabled || isGrabbing}
            aria-label="Move left"
          >
            <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-16 h-16 rounded-xl bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-gray-600" />
          </div>
          <button
            className={dirBtn}
            onMouseDown={() => onMove('right')}
            disabled={disabled || isGrabbing}
            aria-label="Move right"
          >
            <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Row 3 */}
          <div />
          <button
            className={dirBtn}
            onMouseDown={() => onMove('down')}
            disabled={disabled || isGrabbing}
            aria-label="Move down"
          >
            <svg className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div />
        </div>
      </div>

      {/* Grab Button */}
      <button
        onClick={onGrab}
        disabled={disabled || isGrabbing}
        className={`w-28 h-28 rounded-full font-bold text-lg transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed select-none
          ${isGrabbing
            ? 'bg-yellow-600 text-yellow-100 border-4 border-yellow-500 animate-pulse'
            : 'bg-red-600 hover:bg-red-500 text-white border-4 border-red-500 shadow-lg shadow-red-500/30 active:shadow-sm'
          }`}
      >
        {isGrabbing ? 'WAIT' : 'GRAB!'}
      </button>

      {/* Keyboard hint */}
      <p className="text-gray-500 text-xs text-center mt-2">
        Arrow keys / WASD to move &middot; Space to grab
      </p>
    </div>
  );
}
