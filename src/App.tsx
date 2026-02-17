import { useState, useEffect } from 'react';
import type { ConnectionStatus } from './types';
import { useClawGame } from './hooks/useClawGame';
import { ClawMachine } from './components/ClawMachine';
import { ControlPad } from './components/ControlPad';
import { StatusPanel } from './components/StatusPanel';

function App() {
  const { gameState, move, grab, startGame, addCredit, resetGame } = useClawGame();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // Simulate connection on mount
  useEffect(() => {
    setConnectionStatus('connecting');
    const timer = setTimeout(() => setConnectionStatus('connected'), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.5l-1.5 14h-12l-1.5-14M8 5.5V4a2 2 0 012-2h4a2 2 0 012 2v1.5M12 9v8M8.5 11l.5 6M15.5 11l-.5 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  OpenClaw <span className="text-amber-400">Remote</span>
                </h1>
                <p className="text-xs text-gray-500">Remote Claw Machine Controller</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-400">
                {connectionStatus === 'connected' ? 'Live' : connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Claw Machine View - Takes up 3 columns */}
          <div className="lg:col-span-3 space-y-4">
            {/* Camera Feed Label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm text-gray-400 font-medium">LIVE FEED</span>
              </div>
              <span className="text-xs text-gray-600 font-mono">CAM-01 | 30fps</span>
            </div>

            {/* Machine View */}
            <ClawMachine gameState={gameState} />

            {/* Controls */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex flex-col items-center">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Controls</h2>
                <ControlPad
                  onMove={move}
                  onGrab={grab}
                  disabled={!gameState.gameActive || connectionStatus !== 'connected'}
                  clawState={gameState.clawState}
                />
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1">
            <StatusPanel
              connectionStatus={connectionStatus}
              score={gameState.score}
              credits={gameState.credits}
              timeRemaining={gameState.timeRemaining}
              gameActive={gameState.gameActive}
              onStart={startGame}
              onAddCredit={addCredit}
              onReset={resetGame}
            />

            {/* Prize Count */}
            <div className="mt-4 bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Prizes Remaining</div>
              <div className="text-2xl font-bold text-purple-400 font-mono">
                {gameState.prizes.filter(p => !p.grabbed).length}
                <span className="text-sm text-gray-500 font-normal"> / {gameState.prizes.length}</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">How to Play</div>
              <ol className="text-sm text-gray-400 space-y-2">
                <li className="flex gap-2">
                  <span className="text-amber-400 font-bold">1.</span>
                  Press START to begin
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400 font-bold">2.</span>
                  Move the claw with D-pad
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400 font-bold">3.</span>
                  Position over a prize
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-400 font-bold">4.</span>
                  Hit GRAB to try your luck!
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
