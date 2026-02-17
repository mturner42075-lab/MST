import type { ConnectionStatus } from '../types';

interface StatusPanelProps {
  connectionStatus: ConnectionStatus;
  score: number;
  credits: number;
  timeRemaining: number;
  gameActive: boolean;
  onStart: () => void;
  onAddCredit: () => void;
  onReset: () => void;
}

export function StatusPanel({
  connectionStatus,
  score,
  credits,
  timeRemaining,
  gameActive,
  onStart,
  onAddCredit,
  onReset,
}: StatusPanelProps) {
  const statusColors: Record<ConnectionStatus, string> = {
    disconnected: 'bg-red-500',
    connecting: 'bg-yellow-500 animate-pulse',
    connected: 'bg-green-500',
  };

  const statusLabels: Record<ConnectionStatus, string> = {
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
    connected: 'Connected',
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 space-y-5">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm font-medium">STATUS</span>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${statusColors[connectionStatus]}`} />
          <span className="text-white text-sm">{statusLabels[connectionStatus]}</span>
        </div>
      </div>

      <div className="h-px bg-gray-700" />

      {/* Score */}
      <div className="text-center">
        <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Score</div>
        <div className="text-4xl font-bold text-amber-400 font-mono">{score}</div>
      </div>

      <div className="h-px bg-gray-700" />

      {/* Timer */}
      <div className="text-center">
        <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Time</div>
        <div className={`text-3xl font-bold font-mono ${timeRemaining <= 5 && gameActive ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {gameActive ? formatTime(timeRemaining) : '--:--'}
        </div>
      </div>

      <div className="h-px bg-gray-700" />

      {/* Credits */}
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm font-medium">CREDITS</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-green-400 font-mono">{credits}</span>
          <button
            onClick={onAddCredit}
            className="bg-green-600 hover:bg-green-500 text-white text-xs px-2 py-1 rounded font-medium transition-colors"
          >
            +1
          </button>
        </div>
      </div>

      <div className="h-px bg-gray-700" />

      {/* Actions */}
      <div className="space-y-2">
        {!gameActive ? (
          <button
            onClick={onStart}
            disabled={credits <= 0}
            className="w-full py-3 rounded-lg font-bold text-lg transition-all bg-amber-500 hover:bg-amber-400 text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {credits <= 0 ? 'No Credits' : 'START GAME'}
          </button>
        ) : (
          <div className="w-full py-3 rounded-lg font-bold text-lg text-center bg-green-600/20 text-green-400 border border-green-600/30">
            GAME IN PROGRESS
          </div>
        )}
        <button
          onClick={onReset}
          className="w-full py-2 rounded-lg text-sm font-medium transition-colors bg-gray-700 hover:bg-gray-600 text-gray-300"
        >
          Reset Machine
        </button>
      </div>
    </div>
  );
}
