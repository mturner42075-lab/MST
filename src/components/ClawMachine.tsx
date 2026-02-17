import type { GameState } from '../types';

interface ClawMachineProps {
  gameState: GameState;
}

function PrizeShape({ prize }: { prize: { x: number; y: number; color: string; shape: string; grabbed: boolean } }) {
  if (prize.grabbed) return null;
  const size = 20;
  switch (prize.shape) {
    case 'circle':
      return <circle cx={prize.x} cy={prize.y} r={size / 2} fill={prize.color} stroke="#000" strokeWidth="1" />;
    case 'square':
      return <rect x={prize.x - size / 2} y={prize.y - size / 2} width={size} height={size} fill={prize.color} stroke="#000" strokeWidth="1" rx="2" />;
    case 'star':
      return (
        <polygon
          points={starPoints(prize.x, prize.y, size / 2)}
          fill={prize.color}
          stroke="#000"
          strokeWidth="1"
        />
      );
    default:
      return <circle cx={prize.x} cy={prize.y} r={size / 2} fill={prize.color} />;
  }
}

function starPoints(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 72 - 90) * (Math.PI / 180);
    const innerAngle = ((i * 72 + 36) - 90) * (Math.PI / 180);
    points.push(`${cx + r * Math.cos(outerAngle)},${cy + r * Math.sin(outerAngle)}`);
    points.push(`${cx + r * 0.4 * Math.cos(innerAngle)},${cy + r * 0.4 * Math.sin(innerAngle)}`);
  }
  return points.join(' ');
}

export function ClawMachine({ gameState }: ClawMachineProps) {
  const { clawPosition, clawState, clawOpen, prizes } = gameState;

  const isDescending = clawState === 'grabbing';
  const clawY = isDescending ? clawPosition.y + 80 : clawPosition.y;
  return (
    <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden border-4 border-gray-600 shadow-2xl">
      <svg viewBox="0 0 400 300" className="w-full h-full" style={{ minHeight: '300px' }}>
        {/* Background */}
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bgGrad)" />

        {/* Floor */}
        <rect x="0" y="260" width="400" height="40" fill="url(#floorGrad)" />
        <line x1="0" y1="260" x2="400" y2="260" stroke="#475569" strokeWidth="2" />

        {/* Rail */}
        <rect x="10" y="8" width="380" height="6" rx="3" fill="#64748b" />
        <rect x="10" y="10" width="380" height="2" rx="1" fill="#94a3b8" opacity="0.5" />

        {/* Prizes */}
        {prizes.map(prize => (
          <PrizeShape key={prize.id} prize={prize} />
        ))}

        {/* Rope */}
        <line
          x1={clawPosition.x}
          y1={12}
          x2={clawPosition.x}
          y2={clawY}
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray={isDescending ? "4 2" : "none"}
        />

        {/* Claw carriage */}
        <rect
          x={clawPosition.x - 15}
          y={6}
          width="30"
          height="12"
          rx="3"
          fill="#f59e0b"
          stroke="#d97706"
          strokeWidth="1"
        />

        {/* Claw */}
        <g
          transform={`translate(${clawPosition.x}, ${clawY})`}
          className={clawState === 'moving' ? 'animate-pulse' : ''}
        >
          {/* Claw body */}
          <rect x="-8" y="-4" width="16" height="10" rx="2" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />

          {/* Left prong */}
          <line
            x1={clawOpen ? -10 : -5}
            y1="6"
            x2={clawOpen ? -14 : -6}
            y2="20"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Right prong */}
          <line
            x1={clawOpen ? 10 : 5}
            y1="6"
            x2={clawOpen ? 14 : 6}
            y2="20"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Center prong */}
          <line
            x1="0"
            y1="6"
            x2="0"
            y2={clawOpen ? 18 : 20}
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* Drop zone indicator */}
        <rect x="170" y="270" width="60" height="25" rx="4" fill="#22c55e" opacity="0.2" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 2" />
        <text x="200" y="286" textAnchor="middle" fill="#22c55e" fontSize="8" opacity="0.6">DROP</text>

        {/* State indicator */}
        {clawState === 'grabbing' && (
          <text x="200" y="150" textAnchor="middle" fill="#fbbf24" fontSize="16" fontWeight="bold" className="animate-pulse">
            GRABBING...
          </text>
        )}
        {clawState === 'returning' && (
          <text x="200" y="150" textAnchor="middle" fill="#60a5fa" fontSize="16" fontWeight="bold">
            RETURNING...
          </text>
        )}
      </svg>

      {/* Scanline overlay for retro feel */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />
    </div>
  );
}
