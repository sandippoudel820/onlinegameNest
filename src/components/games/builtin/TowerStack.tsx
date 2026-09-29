import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { RotateCcw, Play, Trophy } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

interface Block {
  x: number;
  y: number;
  width: number;
  color: string;
}

export const TowerStack: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gamenest_stack_highscore') || '0', 10);
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  const stackRef = useRef<Block[]>([]);
  const currentBlockRef = useRef<{ x: number; width: number; speed: number; direction: number }>({
    x: 0,
    width: 200,
    speed: 3.5,
    direction: 1,
  });
  const scoreRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const BLOCK_HEIGHT = 24;
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 500;

  const COLORS = [
    '#38bdf8', '#06b6d4', '#10b981', '#84cc16', '#eab308',
    '#f97316', '#ef4444', '#ec4899', '#d946ef', '#8b5cf6', '#6366f1'
  ];

  const getColor = (index: number) => {
    return COLORS[index % COLORS.length];
  };

  const startNewGame = useCallback(() => {
    const baseWidth = 200;
    stackRef.current = [
      {
        x: (CANVAS_WIDTH - baseWidth) / 2,
        y: CANVAS_HEIGHT - BLOCK_HEIGHT - 20,
        width: baseWidth,
        color: getColor(0),
      },
    ];
    currentBlockRef.current = {
      x: 0,
      width: baseWidth,
      speed: 3.5,
      direction: 1,
    };
    scoreRef.current = 0;
    setScore(0);
    setGameState('playing');
    sound.playScore();
  }, []);

  const placeBlock = useCallback(() => {
    if (gameState !== 'playing') return;

    const stack = stackRef.current;
    const current = currentBlockRef.current;
    const topBlock = stack[stack.length - 1];

    const overhang = current.x - topBlock.x;
    const absOverhang = Math.abs(overhang);

    // Perfect alignment tolerance
    if (absOverhang < 4) {
      current.x = topBlock.x; // Perfect snap!
      sound.playNote(440 + stack.length * 30);
    } else if (absOverhang >= current.width) {
      // Missed completely -> Game Over
      setGameState('gameover');
      sound.playGameOver();
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        localStorage.setItem('gamenest_stack_highscore', scoreRef.current.toString());
      }
      return;
    } else {
      // Trim block
      sound.playBounce();
      current.width -= absOverhang;
      if (overhang > 0) {
        current.x = topBlock.x + overhang;
      }
    }

    // Add trimmed block to stack
    const newY = topBlock.y - BLOCK_HEIGHT;
    stack.push({
      x: current.x,
      y: newY,
      width: current.width,
      color: getColor(stack.length),
    });

    scoreRef.current += 1;
    setScore(scoreRef.current);
    onScoreUpdate?.(scoreRef.current);

    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('gamenest_stack_highscore', scoreRef.current.toString());
    }

    // Setup next moving block
    currentBlockRef.current = {
      x: 0,
      width: current.width,
      speed: Math.min(8, 3.5 + stack.length * 0.15),
      direction: 1,
    };
  }, [gameState, highScore, onScoreUpdate]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const current = currentBlockRef.current;
      const stack = stackRef.current;
      const topBlock = stack[stack.length - 1];

      // Move current block
      current.x += current.speed * current.direction;
      if (current.x <= 0) {
        current.x = 0;
        current.direction = 1;
      } else if (current.x + current.width >= CANVAS_WIDTH) {
        current.x = CANVAS_WIDTH - current.width;
        current.direction = -1;
      }

      // Camera offset when tower grows tall
      const cameraY = Math.max(0, (stack.length - 7) * BLOCK_HEIGHT);

      // Render
      ctx.fillStyle = '#07090e';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      ctx.translate(0, cameraY);

      // Draw Stacked Blocks
      stack.forEach((b) => {
        ctx.fillStyle = b.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, BLOCK_HEIGHT - 2, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Current Moving Block
      ctx.fillStyle = getColor(stack.length);
      ctx.shadowBlur = 14;
      ctx.shadowColor = getColor(stack.length);
      ctx.beginPath();
      ctx.roundRect(
        current.x,
        topBlock.y - BLOCK_HEIGHT,
        current.width,
        BLOCK_HEIGHT - 2,
        4
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (gameState === 'playing') placeBlock();
        else startNewGame();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, placeBlock, startNewGame]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#07090e] p-3 select-none">
      {/* HUD */}
      <div className="w-full max-w-[400px] flex items-center justify-between mb-2 px-3 py-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Height</span>
          <span className="text-xl font-bold font-mono text-cyan-400">{score}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <Trophy className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Record:</span>
          <span className="font-mono font-bold">{highScore}</span>
        </div>
        <button
          onClick={startNewGame}
          className="p-1 rounded hover:bg-slate-800 text-slate-300"
          title="Restart"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas */}
      <div
        onClick={() => {
          sound.unlockMobileAudio();
          if (gameState === 'playing') placeBlock();
          else startNewGame();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          sound.unlockMobileAudio();
          if (gameState === 'playing') placeBlock();
          else startNewGame();
        }}
        className="relative w-full max-w-[400px] h-[440px] sm:h-[480px] rounded-xl overflow-hidden shadow-2xl border-2 border-indigo-500/20 bg-slate-950 flex items-center justify-center cursor-pointer touch-none active:brightness-110"
      >
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full block" />

        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            {gameState === 'idle' ? (
              <>
                <h3 className="text-2xl font-black text-white tracking-wider mb-2">TOWER STACK MASTER</h3>
                <p className="text-xs text-slate-300 max-w-xs mb-5">
                  Click, tap, or press Spacebar to drop the sliding block. Align precisely with the tower!
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startNewGame();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> START STACKING
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black text-rose-500 mb-1">TOWER COLLAPSED!</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Tower Height: <span className="font-mono font-bold text-cyan-400">{score} floors</span>
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startNewGame();
                  }}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> RETRY
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">Click or tap anywhere on the screen to stack block</p>
    </div>
  );
};
