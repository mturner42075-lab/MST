import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Direction, Prize, ClawState } from '../types';

const MOVE_STEP = 8;
const GAME_AREA = { width: 400, height: 300 };
const CLAW_BOUNDS = { minX: 20, maxX: 380, minY: 20, maxY: 200 };
const GAME_DURATION = 30;
const GRAB_THRESHOLD = 30;

function generatePrizes(): Prize[] {
  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#ec4899', '#06b6d4'];
  const shapes: Prize['shape'][] = ['circle', 'square', 'star'];
  const prizes: Prize[] = [];
  for (let i = 0; i < 12; i++) {
    prizes.push({
      id: `prize-${i}`,
      x: 40 + Math.random() * (GAME_AREA.width - 80),
      y: 180 + Math.random() * 80,
      color: colors[i % colors.length],
      shape: shapes[i % shapes.length],
      grabbed: false,
    });
  }
  return prizes;
}

const initialState: GameState = {
  clawPosition: { x: 200, y: 40 },
  clawState: 'idle',
  clawOpen: true,
  prizes: generatePrizes(),
  score: 0,
  credits: 3,
  timeRemaining: GAME_DURATION,
  gameActive: false,
};

export function useClawGame() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const grabbedPrizeRef = useRef<string | null>(null);

  const startGame = useCallback(() => {
    setGameState(prev => {
      if (prev.credits <= 0) return prev;
      return {
        ...prev,
        clawPosition: { x: 200, y: 40 },
        clawState: 'idle',
        clawOpen: true,
        prizes: prev.prizes.map(p => ({ ...p })),
        credits: prev.credits - 1,
        timeRemaining: GAME_DURATION,
        gameActive: true,
      };
    });
    grabbedPrizeRef.current = null;
  }, []);

  const addCredit = useCallback(() => {
    setGameState(prev => ({ ...prev, credits: prev.credits + 1 }));
  }, []);

  const move = useCallback((direction: Direction) => {
    setGameState(prev => {
      if (!prev.gameActive || prev.clawState === 'grabbing' || prev.clawState === 'returning') return prev;
      const { x, y } = prev.clawPosition;
      let newX = x;
      let newY = y;
      switch (direction) {
        case 'up': newY = Math.max(CLAW_BOUNDS.minY, y - MOVE_STEP); break;
        case 'down': newY = Math.min(CLAW_BOUNDS.maxY, y + MOVE_STEP); break;
        case 'left': newX = Math.max(CLAW_BOUNDS.minX, x - MOVE_STEP); break;
        case 'right': newX = Math.min(CLAW_BOUNDS.maxX, x + MOVE_STEP); break;
      }
      return {
        ...prev,
        clawPosition: { x: newX, y: newY },
        clawState: 'moving' as ClawState,
      };
    });
  }, []);

  const grab = useCallback(() => {
    setGameState(prev => {
      if (!prev.gameActive || prev.clawState === 'grabbing' || prev.clawState === 'returning') return prev;
      return { ...prev, clawState: 'grabbing', clawOpen: false };
    });

    // Simulate grab sequence: descend -> grab -> return
    setTimeout(() => {
      setGameState(prev => {
        // Check if any prize is near the claw
        const clawX = prev.clawPosition.x;
        const nearbyPrize = prev.prizes.find(
          p => !p.grabbed && Math.abs(p.x - clawX) < GRAB_THRESHOLD && Math.abs(p.y - (prev.clawPosition.y + 120)) < GRAB_THRESHOLD
        );
        if (nearbyPrize) {
          grabbedPrizeRef.current = nearbyPrize.id;
        }
        return { ...prev, clawState: 'returning' };
      });
    }, 800);

    setTimeout(() => {
      setGameState(prev => {
        const grabbed = grabbedPrizeRef.current;
        let newScore = prev.score;
        let newPrizes = prev.prizes;
        if (grabbed) {
          newPrizes = prev.prizes.map(p => p.id === grabbed ? { ...p, grabbed: true } : p);
          newScore = prev.score + 100;
          grabbedPrizeRef.current = null;
        }
        return {
          ...prev,
          clawPosition: { x: 200, y: 40 },
          clawState: 'releasing',
          clawOpen: true,
          prizes: newPrizes,
          score: newScore,
        };
      });
    }, 1800);

    setTimeout(() => {
      setGameState(prev => ({ ...prev, clawState: 'idle' }));
    }, 2200);
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    grabbedPrizeRef.current = null;
    setGameState({
      ...initialState,
      prizes: generatePrizes(),
      credits: 3,
    });
  }, []);

  // Game timer
  useEffect(() => {
    if (gameState.gameActive && gameState.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeRemaining <= 1) {
            return { ...prev, timeRemaining: 0, gameActive: false };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.gameActive, gameState.timeRemaining]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.gameActive) return;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); move('up'); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); move('down'); break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); move('left'); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); move('right'); break;
        case ' ': case 'Enter': e.preventDefault(); grab(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameActive, move, grab]);

  return { gameState, move, grab, startGame, addCredit, resetGame };
}
