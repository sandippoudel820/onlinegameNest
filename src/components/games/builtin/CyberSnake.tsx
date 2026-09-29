import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { RotateCcw, Play, Pause, Trophy } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

export const CyberSnake: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gamenest_snake_highscore') || '0', 10);
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');

  const snakeRef = useRef<{ x: number; y: number }[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const dirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const nextDirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const foodRef = useRef<{ x: number; y: number; type: 'normal' | 'bonus' }>({ x: 15, y: 10, type: 'normal' });
  const scoreRef = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const speedRef = useRef(110);

  const GRID_SIZE = 22; // 22 x 22 grid

  const spawnFood = useCallback((snake: { x: number; y: number }[]) => {
    let newX = 0;
    let newY = 0;
    let collision = true;
    while (collision) {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
      // eslint-disable-next-line no-loop-func
      collision = snake.some((seg) => seg.x === newX && seg.y === newY);
    }
    const isBonus = Math.random() < 0.2;
    foodRef.current = { x: newX, y: newY, type: isBonus ? 'bonus' : 'normal' };
  }, [GRID_SIZE]);

  const resetGame = useCallback(() => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    scoreRef.current = 0;
    speedRef.current = 110;
    setScore(0);
    spawnFood(snakeRef.current);
    setGameState('playing');
    sound.playScore();
  }, [spawnFood]);

  const gameOver = useCallback(() => {
    setGameState('gameover');
    sound.playGameOver();
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('gamenest_snake_highscore', scoreRef.current.toString());
    }
  }, [highScore]);

  // Main game tick
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;

    const tick = (currentTime: number) => {
      if (currentTime - lastTimeRef.current >= speedRef.current) {
        lastTimeRef.current = currentTime;

        // Apply next direction
        dirRef.current = nextDirRef.current;
        const head = { ...snakeRef.current[0] };
        head.x += dirRef.current.x;
        head.y += dirRef.current.y;

        // Check boundary collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          gameOver();
          return;
        }

        // Check self collision
        if (snakeRef.current.some((seg) => seg.x === head.x && seg.y === head.y)) {
          gameOver();
          return;
        }

        const newSnake = [head, ...snakeRef.current];

        // Check food collision
        if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
          const points = foodRef.current.type === 'bonus' ? 25 : 10;
          scoreRef.current += points;
          setScore(scoreRef.current);
          onScoreUpdate?.(scoreRef.current);
          sound.playEat();

          if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem('gamenest_snake_highscore', scoreRef.current.toString());
          }

          // speed up slightly
          speedRef.current = Math.max(65, 110 - Math.floor(scoreRef.current / 30) * 4);
          spawnFood(newSnake);
        } else {
          newSnake.pop();
        }

        snakeRef.current = newSnake;
      }

      // Draw
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          const cellSize = width / GRID_SIZE;

          // Clear background
          ctx.fillStyle = '#0a0d17';
          ctx.fillRect(0, 0, width, height);

          // Subtle cyber grid lines
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
          ctx.lineWidth = 1;
          for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(width, i * cellSize);
            ctx.stroke();
          }

          // Draw Food
          const food = foodRef.current;
          const fx = food.x * cellSize + cellSize / 2;
          const fy = food.y * cellSize + cellSize / 2;
          const radius = (cellSize / 2) * 0.75;

          ctx.shadowBlur = food.type === 'bonus' ? 18 : 12;
          ctx.shadowColor = food.type === 'bonus' ? '#f59e0b' : '#ec4899';
          ctx.fillStyle = food.type === 'bonus' ? '#f59e0b' : '#ec4899';
          ctx.beginPath();
          ctx.arc(fx, fy, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Draw Snake
          snakeRef.current.forEach((seg, index) => {
            const isHead = index === 0;
            const sx = seg.x * cellSize;
            const sy = seg.y * cellSize;
            const pad = 1.5;

            ctx.shadowBlur = isHead ? 15 : 6;
            ctx.shadowColor = isHead ? '#06b6d4' : '#3b82f6';
            ctx.fillStyle = isHead ? '#22d3ee' : index % 2 === 0 ? '#38bdf8' : '#2563eb';

            // Rounded rectangle
            const r = isHead ? 6 : 4;
            ctx.beginPath();
            ctx.roundRect(sx + pad, sy + pad, cellSize - pad * 2, cellSize - pad * 2, r);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Head eyes
            if (isHead) {
              ctx.fillStyle = '#ffffff';
              const eyeRadius = cellSize * 0.12;
              const eyeOffset = cellSize * 0.28;
              const cx = sx + cellSize / 2;
              const cy = sy + cellSize / 2;

              let ex1 = cx - eyeOffset;
              let ey1 = cy - eyeOffset;
              let ex2 = cx + eyeOffset;
              let ey2 = cy - eyeOffset;

              if (dirRef.current.x === 1) {
                ex1 = cx + eyeOffset * 0.6;
                ey1 = cy - eyeOffset * 0.6;
                ex2 = cx + eyeOffset * 0.6;
                ey2 = cy + eyeOffset * 0.6;
              } else if (dirRef.current.x === -1) {
                ex1 = cx - eyeOffset * 0.6;
                ey1 = cy - eyeOffset * 0.6;
                ex2 = cx - eyeOffset * 0.6;
                ey2 = cy + eyeOffset * 0.6;
              } else if (dirRef.current.y === 1) {
                ex1 = cx - eyeOffset * 0.6;
                ey1 = cy + eyeOffset * 0.6;
                ex2 = cx + eyeOffset * 0.6;
                ey2 = cy + eyeOffset * 0.6;
              }

              ctx.beginPath();
              ctx.arc(ex1, ey1, eyeRadius, 0, Math.PI * 2);
              ctx.arc(ex2, ey2, eyeRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameState, gameOver, onScoreUpdate, highScore, spawnFood]);

  // Key controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.code === 'Space') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
        else if (gameState === 'idle' || gameState === 'gameover') resetGame();
        return;
      }

      if (e.key.toLowerCase() === 'r') {
        resetGame();
        return;
      }

      const { x, y } = dirRef.current;
      if ((e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') && y !== 1) {
        nextDirRef.current = { x: 0, y: -1 };
      } else if ((e.key === 'ArrowDown' || e.key.toLowerCase() === 's') && y !== -1) {
        nextDirRef.current = { x: 0, y: 1 };
      } else if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') && x !== 1) {
        nextDirRef.current = { x: -1, y: 0 };
      } else if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') && x !== -1) {
        nextDirRef.current = { x: 1, y: 0 };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, resetGame]);

  const handleDpad = (direction: 'up' | 'down' | 'left' | 'right') => {
    sound.unlockMobileAudio();
    if (gameState !== 'playing') {
      resetGame();
      return;
    }
    const { x, y } = dirRef.current;
    if (direction === 'up' && y !== 1) nextDirRef.current = { x: 0, y: -1 };
    if (direction === 'down' && y !== -1) nextDirRef.current = { x: 0, y: 1 };
    if (direction === 'left' && x !== 1) nextDirRef.current = { x: -1, y: 0 };
    if (direction === 'right' && x !== -1) nextDirRef.current = { x: 1, y: 0 };
  };

  // Direct swipe detection on canvas for iOS & Android
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    sound.unlockMobileAudio();
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!touchStartPos.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    touchStartPos.current = null;

    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
      if (Math.abs(dx) > Math.abs(dy)) {
        handleDpad(dx > 0 ? 'right' : 'left');
      } else {
        handleDpad(dy > 0 ? 'down' : 'up');
      }
    } else if (gameState !== 'playing') {
      resetGame();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#07090e] p-2 sm:p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[500px] flex items-center justify-between mb-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg border border-slate-800 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Score</span>
          <span className="text-xl font-bold font-mono text-cyan-400">{score}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <Trophy className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">High:</span>
          <span className="font-mono font-bold">{highScore}</span>
        </div>
        <div className="flex items-center gap-2">
          {gameState === 'playing' ? (
            <button
              onClick={() => setGameState('paused')}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => (gameState === 'paused' ? setGameState('playing') : resetGame())}
              className="p-1.5 rounded hover:bg-slate-800 text-cyan-400 hover:text-white transition"
              title="Play"
            >
              <Play className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={resetGame}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative w-full max-w-[420px] aspect-square rounded-xl overflow-hidden shadow-2xl border-2 border-cyan-500/20 bg-slate-950 flex items-center justify-center touch-none">
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          onTouchStart={handleCanvasTouchStart}
          onTouchEnd={handleCanvasTouchEnd}
          className="w-full h-full block cursor-pointer"
        />

        {/* Start / Game Over Overlay */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            {gameState === 'idle' && (
              <>
                <div className="w-14 h-14 mb-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
                  <Play className="w-7 h-7 fill-current ml-1" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-wide mb-1">CYBER SNAKE NEON</h3>
                <p className="text-xs text-slate-400 max-w-xs mb-5">
                  Swipe on screen, use Arrow/WASD keys, or tap the D-pad to guide your cyber snake!
                </p>
                <button
                  onClick={resetGame}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
                >
                  START GAME
                </button>
              </>
            )}

            {gameState === 'paused' && (
              <>
                <h3 className="text-2xl font-black text-amber-400 mb-2">GAME PAUSED</h3>
                <p className="text-xs text-slate-400 mb-4">Press Space or click Resume to continue</p>
                <button
                  onClick={() => setGameState('playing')}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow transition"
                >
                  RESUME
                </button>
              </>
            )}

            {gameState === 'gameover' && (
              <>
                <h3 className="text-2xl font-black text-rose-500 mb-1">SYSTEM TERMINATED</h3>
                <p className="text-sm text-slate-300 mb-1">
                  Final Score: <span className="font-mono font-bold text-cyan-400">{score}</span>
                </p>
                {score >= highScore && score > 0 && (
                  <p className="text-xs font-semibold text-amber-400 mb-4 animate-pulse">🎉 NEW HIGH SCORE!</p>
                )}
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={resetGame}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/25 transition transform active:scale-95 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> PLAY AGAIN
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Cross-Platform Mobile / Tablet Touch On-Screen D-Pad (iOS & Android friendly) */}
      <div className="mt-2.5 flex flex-col items-center gap-1 sm:hidden">
        <button
          onClick={() => handleDpad('up')}
          className="w-14 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl text-white font-black text-base flex items-center justify-center border border-slate-700 shadow-md active:scale-90 transition-transform touch-manipulation"
          aria-label="Up"
        >
          ▲
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => handleDpad('left')}
            className="w-14 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl text-white font-black text-base flex items-center justify-center border border-slate-700 shadow-md active:scale-90 transition-transform touch-manipulation"
            aria-label="Left"
          >
            ◀
          </button>
          <button
            onClick={() => handleDpad('down')}
            className="w-14 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl text-white font-black text-base flex items-center justify-center border border-slate-700 shadow-md active:scale-90 transition-transform touch-manipulation"
            aria-label="Down"
          >
            ▼
          </button>
          <button
            onClick={() => handleDpad('right')}
            className="w-14 h-11 bg-slate-800 active:bg-cyan-600 rounded-xl text-white font-black text-base flex items-center justify-center border border-slate-700 shadow-md active:scale-90 transition-transform touch-manipulation"
            aria-label="Right"
          >
            ▶
          </button>
        </div>
      </div>
      <p className="hidden sm:block mt-2 text-[11px] text-slate-500 text-center">
        Controls: Arrow Keys / WASD on PC & Mac &bull; Direct Touch Swipe or D-pad on iOS & Android
      </p>
    </div>
  );
};
