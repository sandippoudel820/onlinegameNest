import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { RotateCcw, Play, Pause, Trophy, Heart } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  points: number;
  alive: boolean;
}

export const BrickBreaker: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gamenest_breaker_highscore') || '0', 10);
  });
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover' | 'won'>('idle');

  const paddleRef = useRef({ x: 200, y: 440, w: 90, h: 14, speed: 8 });
  const ballRef = useRef({ x: 240, y: 420, r: 7, vx: 4, vy: -4, stuck: true });
  const bricksRef = useRef<Brick[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  const initBricks = useCallback(() => {
    const bricks: Brick[] = [];
    const rows = 5;
    const cols = 8;
    const brickW = 54;
    const brickH = 18;
    const pad = 6;
    const offsetX = (500 - (cols * (brickW + pad) - pad)) / 2;
    const offsetY = 50;

    const rowColors = [
      { color: '#f43f5e', points: 50 },
      { color: '#fb923c', points: 40 },
      { color: '#eab308', points: 30 },
      { color: '#10b981', points: 20 },
      { color: '#06b6d4', points: 10 },
    ];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: offsetX + c * (brickW + pad),
          y: offsetY + r * (brickH + pad),
          w: brickW,
          h: brickH,
          color: rowColors[r].color,
          points: rowColors[r].points,
          alive: true,
        });
      }
    }
    bricksRef.current = bricks;
  }, []);

  const resetGame = useCallback(() => {
    paddleRef.current = { x: 205, y: 440, w: 90, h: 14, speed: 8 };
    ballRef.current = { x: 250, y: 425, r: 7, vx: 4, vy: -4, stuck: false };
    initBricks();
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    setGameState('playing');
  }, [initBricks]);

  const gameOver = useCallback(() => {
    setGameState('gameover');
    sound.playGameOver();
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('gamenest_breaker_highscore', scoreRef.current.toString());
    }
  }, [highScore]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;

    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const paddle = paddleRef.current;
      const ball = ballRef.current;
      const keys = keysRef.current;

      // Move paddle
      if ((keys['ArrowLeft'] || keys['KeyA'] || keys['a']) && paddle.x > 0) {
        paddle.x -= paddle.speed;
      }
      if ((keys['ArrowRight'] || keys['KeyD'] || keys['d']) && paddle.x + paddle.w < cw) {
        paddle.x += paddle.speed;
      }

      // Ball physics
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce wall left/right
      if (ball.x - ball.r < 0) {
        ball.x = ball.r;
        ball.vx = -ball.vx;
        sound.playBounce();
      } else if (ball.x + ball.r > cw) {
        ball.x = cw - ball.r;
        ball.vx = -ball.vx;
        sound.playBounce();
      }

      // Bounce top
      if (ball.y - ball.r < 0) {
        ball.y = ball.r;
        ball.vy = -ball.vy;
        sound.playBounce();
      }

      // Paddle collision
      if (
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.h &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.w
      ) {
        sound.playBounce();
        ball.vy = -Math.abs(ball.vy);
        // Angle variation based on where it hit paddle
        const hitOffset = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        ball.vx = hitOffset * 6.5;
        ball.y = paddle.y - ball.r;
      }

      // Bottom death
      if (ball.y - ball.r > ch) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        sound.playGameOver();
        if (livesRef.current <= 0) {
          gameOver();
          return;
        } else {
          // Reset ball
          ball.x = paddle.x + paddle.w / 2;
          ball.y = paddle.y - 15;
          ball.vx = (Math.random() - 0.5) * 6;
          ball.vy = -4;
        }
      }

      // Brick collision
      let allCleared = true;
      bricksRef.current.forEach((b) => {
        if (!b.alive) return;
        allCleared = false;

        if (
          ball.x + ball.r > b.x &&
          ball.x - ball.r < b.x + b.w &&
          ball.y + ball.r > b.y &&
          ball.y - ball.r < b.y + b.h
        ) {
          b.alive = false;
          ball.vy = -ball.vy;
          scoreRef.current += b.points;
          setScore(scoreRef.current);
          onScoreUpdate?.(scoreRef.current);
          sound.playScore();

          if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem('gamenest_breaker_highscore', scoreRef.current.toString());
          }
        }
      });

      if (allCleared) {
        setGameState('won');
        sound.playScore();
        return;
      }

      // --- RENDER ---
      ctx.fillStyle = '#0a0d17';
      ctx.fillRect(0, 0, cw, ch);

      // Draw Bricks
      bricksRef.current.forEach((b) => {
        if (!b.alive) return;
        ctx.shadowBlur = 8;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 4);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Paddle
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#06b6d4';
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Ball
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, gameOver, onScoreUpdate, highScore]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      keysRef.current[e.code] = true;
      if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
      keysRef.current[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse & Touch move control over canvas (cross-platform for iOS, Android, macOS, Windows)
  const handlePointerMove = (clientX: number, rect: DOMRect) => {
    const mouseX = clientX - rect.left;
    const scale = 500 / rect.width;
    const scaledX = mouseX * scale;
    paddleRef.current.x = Math.max(0, Math.min(500 - paddleRef.current.w, scaledX - paddleRef.current.w / 2));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handlePointerMove(e.clientX, e.currentTarget.getBoundingClientRect());
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    sound.unlockMobileAudio();
    const touch = e.touches[0];
    handlePointerMove(touch.clientX, e.currentTarget.getBoundingClientRect());
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#07090e] p-2 sm:p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[500px] flex items-center justify-between mb-2 px-3 py-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Score</span>
          <span className="text-xl font-bold font-mono text-cyan-400">{score}</span>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Heart
              key={i}
              className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-amber-400">
          <Trophy className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Best:</span>
          <span className="font-mono font-bold">{highScore}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => (gameState === 'playing' ? setGameState('paused') : setGameState('playing'))}
            className="p-1 rounded hover:bg-slate-800 text-slate-300"
          >
            {gameState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={resetGame} className="p-1 rounded hover:bg-slate-800 text-slate-300">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full max-w-[500px] h-[440px] sm:h-[480px] rounded-xl overflow-hidden shadow-2xl border-2 border-cyan-500/20 bg-black flex items-center justify-center touch-none">
        <canvas
          ref={canvasRef}
          width={500}
          height={480}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchMove}
          onTouchMove={handleTouchMove}
          className="w-full h-full block cursor-ew-resize"
        />

        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            {gameState === 'idle' && (
              <>
                <h3 className="text-2xl font-black text-white tracking-wider mb-2">BRICK BREAKER EXTREME</h3>
                <p className="text-xs text-slate-300 max-w-xs mb-5">
                  Drag paddle on touchscreen or use mouse/arrows to deflect the ball and smash all blocks!
                </p>
                <button
                  onClick={resetGame}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-600 hover:from-cyan-400 hover:to-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
                >
                  START SMASHING
                </button>
              </>
            )}

            {gameState === 'paused' && (
              <>
                <h3 className="text-2xl font-black text-amber-400 mb-2">GAME PAUSED</h3>
                <button
                  onClick={() => setGameState('playing')}
                  className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-lg shadow"
                >
                  RESUME
                </button>
              </>
            )}

            {gameState === 'won' && (
              <>
                <h3 className="text-3xl font-black text-emerald-400 mb-1">STAGE CLEARED!</h3>
                <p className="text-sm text-slate-300 mb-3">All bricks destroyed!</p>
                <button
                  onClick={resetGame}
                  className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-lg shadow-lg"
                >
                  NEXT STAGE
                </button>
              </>
            )}

            {gameState === 'gameover' && (
              <>
                <h3 className="text-2xl font-black text-rose-500 mb-1">GAME OVER</h3>
                <p className="text-sm text-slate-300 mb-3">
                  Score: <span className="font-mono font-bold text-cyan-400">{score}</span>
                </p>
                <button
                  onClick={resetGame}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> PLAY AGAIN
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-3 sm:hidden w-full max-w-xs">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            sound.unlockMobileAudio();
            keysRef.current['ArrowLeft'] = true;
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            keysRef.current['ArrowLeft'] = false;
          }}
          className="flex-1 h-12 bg-slate-800 active:bg-cyan-600 rounded-xl text-white font-black text-lg border border-slate-700 active:scale-95 transition-transform touch-manipulation flex items-center justify-center"
          aria-label="Paddle Left"
        >
          ◀ LEFT
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            sound.unlockMobileAudio();
            keysRef.current['ArrowRight'] = true;
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            keysRef.current['ArrowRight'] = false;
          }}
          className="flex-1 h-12 bg-slate-800 active:bg-cyan-600 rounded-xl text-white font-black text-lg border border-slate-700 active:scale-95 transition-transform touch-manipulation flex items-center justify-center"
          aria-label="Paddle Right"
        >
          RIGHT ▶
        </button>
      </div>

      <p className="hidden sm:block mt-2 text-[11px] text-slate-500 text-center">
        Controls: Move Mouse or Left/Right Arrows on PC & Mac &bull; Direct Touch Drag or Tap Buttons on iOS & Android
      </p>
    </div>
  );
};

