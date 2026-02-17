export type Direction = 'up' | 'down' | 'left' | 'right';

export type ClawState = 'idle' | 'moving' | 'grabbing' | 'releasing' | 'returning';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface ClawPosition {
  x: number;
  y: number;
}

export interface Prize {
  id: string;
  x: number;
  y: number;
  color: string;
  shape: 'circle' | 'square' | 'star';
  grabbed: boolean;
}

export interface GameState {
  clawPosition: ClawPosition;
  clawState: ClawState;
  clawOpen: boolean;
  prizes: Prize[];
  score: number;
  credits: number;
  timeRemaining: number;
  gameActive: boolean;
}
