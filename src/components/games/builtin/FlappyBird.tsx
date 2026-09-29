import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { Play, RotateCcw, Trophy } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  width: number;
  passed: boolean;
}

export const FlappyBird: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gamenest_flappy_high') || '0', 10);
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  // Physics state
  const birdRef = useRef<{
    y: number;
    vy: number;
    rotation: number;
    wingFrame: number;
  }>({
    y: 200,
    vy: 0,
    rotation: 0,
    wingFrame: 0,
  });

  const pipesRef = useRef<Pipe[]>([]);
  const pipeSpawnTimerRef = useRef(0);
  const scoreRef = useRef(0);
  const groundOffsetRef = useRef(0);

  const GRAVITY = 0.38;
  const JUMP_FORCE = -7.2;
  const PIPE_GAP = 120;
  const PIPE_SPEED = 2.4;

  const resetGame = useCallback(() => {
    sound.unlockMobileAudio();
    birdRef.current = {
      y: 200,
      vy: JUMP_FORCE * 0.7,
      rotation: 0,
      wingFrame: 0,
    };
    pipesRef.current = [];
    pipeSpawnTimerRef.current = 0;
    scoreRef.current = 0;
    groundOffsetRef.current = 0;
    setScore(0);
    setGameState('playing');
    sound.playFlap();
  }, [JUMP_FORCE]);

  const flap = useCallback(() => {
    sound.unlockMobileAudio();
    if (gameState === 'idle') {
      resetGame();
      return;
    }
    if (gameState === 'gameover') {
      resetGame();
      return;
    }
    birdRef.current.vy = JUMP_FORCE;
    birdRef.current.rotation = -0.45;
    sound.playFlap();
  }, [gameState, resetGame, JUMP_FORCE]);

  // Spacebar and touch inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', ' ', 'ArrowUp'].includes(e.key) || e.code === 'Space') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flap]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;

    const tick = () => {
      const bird = birdRef.current;

      // Gravity & Physics
      bird.vy += GRAVITY;
      bird.y += bird.vy;

      // Smooth rotation angle
      if (bird.vy < 0) {
        bird.rotation = Math.max(-0.5, bird.rotation - 0.05);
      } else {
        bird.rotation = Math.min(1.2, bird.rotation + 0.04);
      }

      bird.wingFrame += 0.2;

      // Move ground
      groundOffsetRef.current = (groundOffsetRef.current + PIPE_SPEED) % 20;

      // Spawn pipes
      pipeSpawnTimerRef.current += 1;
      if (pipeSpawnTimerRef.current > 85) {
        pipeSpawnTimerRef.current = 0;
        const minTop = 60;
        const maxTop = 240;
        const topH = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
        pipesRef.current.push({
          x: 480,
          topHeight: topH,
          bottomY: topH + PIPE_GAP,
          width: 56,
          passed: false,
        });
      }

      // Move pipes and check collision
      const birdX = 90;
      const birdRadius = 14;

      // Floor & ceiling collision
      if (bird.y + birdRadius >= 400 || bird.y - birdRadius <= 0) {
        sound.playGameOver();
        setGameState('gameover');
        if (scoreRef.current > highScore) {
          setHighScore(scoreRef.current);
          localStorage.setItem('gamenest_flappy_high', scoreRef.current.toString());
        }
        return;
      }

      for (let i = pipesRef.current.length - 1; i >= 0; i--) {
        const p = pipesRef.current[i];
        p.x -= PIPE_SPEED;

        // Score increment
        if (!p.passed && p.x + p.width < birdX) {
          p.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
          onScoreUpdate?.(scoreRef.current);
          sound.playCoin();

          if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem('gamenest_flappy_high', scoreRef.current.toString());
          }
        }

        // Pipe collision
        if (
          birdX + birdRadius > p.x &&
          birdX - birdRadius < p.x + p.width
        ) {
          if (bird.y - birdRadius < p.topHeight || bird.y + birdRadius > p.bottomY) {
            sound.playGameOver();
            setGameState('gameover');
            if (scoreRef.current > highScore) {
              setHighScore(scoreRef.current);
              localStorage.setItem('gamenest_flappy_high', scoreRef.current.toString());
            }
            return;
          }
        }

        // Remove offscreen pipes
        if (p.x + p.width < -10) {
          pipesRef.current.splice(i, 1);
        }
      }

      // Canvas Rendering
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Sky gradient
          const skyGrad = ctx.createLinearGradient(0, 0, 0, 400);
          skyGrad.addColorStop(0, '#38bdf8');
          skyGrad.addColorStop(0.7, '#7dd3fc');
          skyGrad.addColorStop(1, '#bae6fd');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, w, h);

          // Background city / trees silhouette
          ctx.fillStyle = '#6ee7b7';
          ctx.beginPath();
          for (let bx = 0; bx < w; bx += 60) {
            ctx.ellipse(bx + 30, 400, 35, 25, 0, Math.PI, 0);
          }
          ctx.fill();

          // Green Pipes
          pipesRef.current.forEach((p) => {
            // Upper pipe body
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(p.x, 0, p.width, p.topHeight);
            ctx.strokeStyle = '#15803d';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(p.x, 0, p.width, p.topHeight);

            // Upper pipe rim
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(p.x - 4, p.topHeight - 22, p.width + 8, 22);
            ctx.strokeRect(p.x - 4, p.topHeight - 22, p.width + 8, 22);

            // Lower pipe rim
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(p.x - 4, p.bottomY, p.width + 8, 22);
            ctx.strokeRect(p.x - 4, p.bottomY, p.width + 8, 22);

            // Lower pipe body
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(p.x, p.bottomY + 22, p.width, 400 - (p.bottomY + 22));
            ctx.strokeRect(p.x, p.bottomY + 22, p.width, 400 - (p.bottomY + 22));
          });

          // Scrolling Ground
          ctx.fillStyle = '#d97706';
          ctx.fillRect(0, 400, w, 50);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(0, 400, w, 12);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 400);
          ctx.lineTo(w, 400);
          ctx.stroke();

          // Bird Render
          ctx.save();
          ctx.translate(birdX, bird.y);
          ctx.rotate(bird.rotation);

          // Yellow bird body
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Wing (animated flap)
          const wingY = Math.sin(bird.wingFrame) * 4;
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.ellipse(-4, wingY, 9, 6, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Big cartoon eye
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(6, -4, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Orange beak
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(19, 3);
          ctx.lineTo(10, 6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameState, onScoreUpdate, highScore]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-2 sm:p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[480px] flex items-center justify-between mb-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 text-sm shadow">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Score</span>
          <span className="text-2xl font-black font-mono text-cyan-400">{score}</span>
        </div>

        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
          <Trophy className="w-4 h-4" />
          <span className="text-xs font-bold text-slate-400">Best:</span>
          <span className="font-mono text-base">{highScore}</span>
        </div>

        <button
          onClick={resetGame}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          title="Restart"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Viewport */}
      <div
        onClick={flap}
        className="relative w-full max-w-[480px] aspect-[4/3] max-h-[440px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-sky-300 flex items-center justify-center cursor-pointer touch-none"
      >
        <canvas ref={canvasRef} width={480} height={440} className="w-full h-full block" />

        {/* Start / Game Over Overlay */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            {gameState === 'idle' && (
              <>
                <div className="w-16 h-16 mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-wide mb-1">
                  Flappy Bird
                </h3>
                <p className="text-xs text-slate-300 max-w-xs mb-5">
                  Tap or press Space to flap wings and fly safely through the green pipes!
                </p>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-sm"
                >
                  TAP TO FLY
                </button>
              </>
            )}

            {gameState === 'gameover' && (
              <>
                <div className="w-14 h-14 mb-2 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-lg">
                  <RotateCcw className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-rose-400 mb-1">GAME OVER</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Final Score: <span className="font-bold text-white font-mono">{score}</span> | Best: <span className="font-bold text-amber-400 font-mono">{highScore}</span>
                </p>
                <button
                  onClick={resetGame}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Flap Again
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-400 mt-2 text-center">
        Click, tap screen, or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Space</kbd> to flap!
      </div>
    </div>
  );
};
