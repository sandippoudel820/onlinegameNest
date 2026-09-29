import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { RotateCcw, Play, Pause, Trophy, Heart } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

interface Bullet {
  x: number;
  y: number;
  speed: number;
}

interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  hp: number;
  color: string;
}

export const SpaceBlaster: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gamenest_space_highscore') || '0', 10);
  });
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');

  const playerRef = useRef({ x: 220, y: 440, width: 36, height: 36, speed: 7 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{ x: number; y: number; size: number; speed: number }[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const lastShootRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  // Initialize background starfield
  useEffect(() => {
    const stars: { x: number; y: number; size: number; speed: number }[] = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * 480,
        y: Math.random() * 520,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
      });
    }
    starsRef.current = stars;
  }, []);

  const createExplosion = (x: number, y: number, color: string) => {
    sound.playExplosion();
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        size: Math.random() * 3 + 2,
      });
    }
  };

  const resetGame = useCallback(() => {
    playerRef.current = { x: 220, y: 440, width: 36, height: 36, speed: 7 };
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    setGameState('playing');
  }, []);

  const gameOver = useCallback(() => {
    setGameState('gameover');
    sound.playGameOver();
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem('gamenest_space_highscore', scoreRef.current.toString());
    }
  }, [highScore]);

  // Main animation frame
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

      // Update background stars
      starsRef.current.forEach((st) => {
        st.y += st.speed;
        if (st.y > ch) {
          st.y = 0;
          st.x = Math.random() * cw;
        }
      });

      // Handle Player Input
      const keys = keysRef.current;
      const p = playerRef.current;
      if ((keys['ArrowLeft'] || keys['KeyA'] || keys['a']) && p.x > 10) {
        p.x -= p.speed;
      }
      if ((keys['ArrowRight'] || keys['KeyD'] || keys['d']) && p.x < cw - p.width - 10) {
        p.x += p.speed;
      }
      if ((keys['ArrowUp'] || keys['KeyW'] || keys['w']) && p.y > 60) {
        p.y -= p.speed;
      }
      if ((keys['ArrowDown'] || keys['KeyS'] || keys['s']) && p.y < ch - p.height - 10) {
        p.y += p.speed;
      }

      // Shooting
      const now = Date.now();
      if ((keys[' '] || keys['Space']) && now - lastShootRef.current > 180) {
        lastShootRef.current = now;
        sound.playLaser();
        bulletsRef.current.push({
          x: p.x + p.width / 2 - 3,
          y: p.y - 4,
          speed: 10,
        });
      }

      // Update Bullets
      bulletsRef.current.forEach((b) => {
        b.y -= b.speed;
      });
      bulletsRef.current = bulletsRef.current.filter((b) => b.y > -20);

      // Spawn Enemies
      spawnTimerRef.current++;
      if (spawnTimerRef.current > 45) {
        spawnTimerRef.current = 0;
        const colors = ['#f43f5e', '#ec4899', '#a855f7', '#fb923c'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        enemiesRef.current.push({
          x: Math.random() * (cw - 40) + 10,
          y: -40,
          width: 32,
          height: 32,
          speed: Math.random() * 2 + 2 + Math.min(scoreRef.current / 800, 3),
          hp: 1,
          color,
        });
      }

      // Update Enemies
      enemiesRef.current.forEach((en) => {
        en.y += en.speed;

        // Player Collision
        if (
          en.x < p.x + p.width &&
          en.x + en.width > p.x &&
          en.y < p.y + p.height &&
          en.y + en.height > p.y
        ) {
          createExplosion(en.x + en.width / 2, en.y + en.height / 2, en.color);
          en.hp = 0;
          livesRef.current -= 1;
          setLives(livesRef.current);
          if (livesRef.current <= 0) {
            gameOver();
            return;
          }
        }

        // Bullet Collision
        bulletsRef.current.forEach((b) => {
          if (
            b.x < en.x + en.width &&
            b.x + 6 > en.x &&
            b.y < en.y + en.height &&
            b.y + 14 > en.y
          ) {
            en.hp -= 1;
            b.y = -100; // destroy bullet
            createExplosion(en.x + en.width / 2, en.y + en.height / 2, en.color);
            scoreRef.current += 100;
            setScore(scoreRef.current);
            onScoreUpdate?.(scoreRef.current);
            if (scoreRef.current > highScore) {
              setHighScore(scoreRef.current);
              localStorage.setItem('gamenest_space_highscore', scoreRef.current.toString());
            }
          }
        });
      });

      // Filter dead/off-screen enemies
      enemiesRef.current = enemiesRef.current.filter((en) => {
        if (en.y > ch + 20) {
          return false;
        }
        return en.hp > 0;
      });

      // Update Particles
      particlesRef.current.forEach((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.03;
      });
      particlesRef.current = particlesRef.current.filter((pt) => pt.alpha > 0);

      // --- RENDERING ---
      ctx.fillStyle = '#060810';
      ctx.fillRect(0, 0, cw, ch);

      // Draw Stars
      ctx.fillStyle = '#ffffff';
      starsRef.current.forEach((st) => {
        ctx.globalAlpha = Math.min(1, st.speed / 1.5);
        ctx.fillRect(st.x, st.y, st.size, st.size);
      });
      ctx.globalAlpha = 1;

      // Draw Bullets
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#38bdf8';
      ctx.fillStyle = '#38bdf8';
      bulletsRef.current.forEach((b) => {
        ctx.fillRect(b.x, b.y, 6, 14);
      });
      ctx.shadowBlur = 0;

      // Draw Enemies
      enemiesRef.current.forEach((en) => {
        ctx.shadowBlur = 10;
        ctx.shadowColor = en.color;
        ctx.fillStyle = en.color;
        // Triangle alien craft pointing down
        ctx.beginPath();
        ctx.moveTo(en.x + en.width / 2, en.y + en.height);
        ctx.lineTo(en.x, en.y);
        ctx.lineTo(en.x + en.width / 2, en.y + en.height * 0.3);
        ctx.lineTo(en.x + en.width, en.y);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Particles
      particlesRef.current.forEach((pt) => {
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Draw Player Ship (Glowing delta wing)
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#06b6d4';
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(p.x + p.width / 2, p.y);
      ctx.lineTo(p.x, p.y + p.height);
      ctx.lineTo(p.x + p.width / 2, p.y + p.height * 0.7);
      ctx.lineTo(p.x + p.width, p.y + p.height);
      ctx.closePath();
      ctx.fill();

      // Thruster flame
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(p.x + p.width * 0.35, p.y + p.height * 0.7);
      ctx.lineTo(p.x + p.width / 2, p.y + p.height + Math.random() * 8 + 4);
      ctx.lineTo(p.x + p.width * 0.65, p.y + p.height * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, gameOver, onScoreUpdate, highScore]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      keysRef.current[e.code] = true;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
      }
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
  }, [gameState]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#07090e] p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[480px] flex items-center justify-between mb-2 px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg border border-slate-800 text-sm">
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
            onClick={() => (gameState === 'paused' ? setGameState('playing') : setGameState('paused'))}
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
      <div className="relative w-full max-w-[480px] h-[440px] sm:h-[480px] rounded-xl overflow-hidden shadow-2xl border-2 border-indigo-500/20 bg-black flex items-center justify-center touch-none">
        <canvas
          ref={canvasRef}
          width={480}
          height={480}
          onTouchStart={(e) => {
            sound.unlockMobileAudio();
            const rect = e.currentTarget.getBoundingClientRect();
            const touch = e.touches[0];
            const scaleX = 480 / rect.width;
            const tx = (touch.clientX - rect.left) * scaleX;
            playerRef.current.x = Math.max(10, Math.min(480 - playerRef.current.width - 10, tx - playerRef.current.width / 2));
            keysRef.current[' '] = true; // Auto-fire on touch hold
          }}
          onTouchMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const touch = e.touches[0];
            const scaleX = 480 / rect.width;
            const tx = (touch.clientX - rect.left) * scaleX;
            playerRef.current.x = Math.max(10, Math.min(480 - playerRef.current.width - 10, tx - playerRef.current.width / 2));
          }}
          onTouchEnd={() => {
            keysRef.current[' '] = false;
          }}
          className="w-full h-full block"
        />

        {/* Overlay */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            {gameState === 'idle' && (
              <>
                <h3 className="text-2xl font-black text-white tracking-wider mb-2">SPACE BLASTER 2088</h3>
                <p className="text-xs text-slate-300 max-w-xs mb-5">
                  Blast through enemy waves! Arrow keys/WASD to steer, Spacebar to shoot.
                </p>
                <button
                  onClick={resetGame}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
                >
                  LAUNCH MISSION
                </button>
              </>
            )}

            {gameState === 'paused' && (
              <>
                <h3 className="text-2xl font-black text-amber-400 mb-2">MISSION PAUSED</h3>
                <button
                  onClick={() => setGameState('playing')}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow"
                >
                  RESUME
                </button>
              </>
            )}

            {gameState === 'gameover' && (
              <>
                <h3 className="text-2xl font-black text-rose-500 mb-1">STARFIGHTER DESTROYED</h3>
                <p className="text-sm text-slate-300 mb-3">
                  Final Score: <span className="font-mono font-bold text-cyan-400">{score}</span>
                </p>
                <button
                  onClick={resetGame}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> RETRY
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile Touch Controls Container */}
      <div className="mt-2.5 flex items-center justify-center gap-3 sm:hidden w-full max-w-sm">
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
          onMouseDown={() => (keysRef.current['ArrowLeft'] = true)}
          onMouseUp={() => (keysRef.current['ArrowLeft'] = false)}
          className="w-16 h-12 bg-slate-800 active:bg-cyan-600 rounded-xl text-white font-black text-xl flex items-center justify-center border border-slate-700 shadow-md touch-manipulation active:scale-95 transition-transform"
          aria-label="Move Left"
        >
          ◀
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            sound.unlockMobileAudio();
            keysRef.current[' '] = true;
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            keysRef.current[' '] = false;
          }}
          onMouseDown={() => (keysRef.current[' '] = true)}
          onMouseUp={() => (keysRef.current[' '] = false)}
          className="flex-1 h-12 bg-gradient-to-r from-rose-600 to-red-500 active:from-rose-500 active:to-red-400 rounded-xl text-white font-black text-sm flex items-center justify-center shadow-lg shadow-rose-600/30 touch-manipulation active:scale-95 transition-transform"
        >
          FIRE
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
          onMouseDown={() => (keysRef.current['ArrowRight'] = true)}
          onMouseUp={() => (keysRef.current['ArrowRight'] = false)}
          className="w-16 h-12 bg-slate-800 active:bg-cyan-600 rounded-xl text-white font-black text-xl flex items-center justify-center border border-slate-700 shadow-md touch-manipulation active:scale-95 transition-transform"
          aria-label="Move Right"
        >
          ▶
        </button>
      </div>

      <p className="hidden sm:block mt-2 text-[11px] text-slate-500 text-center">
        Controls: Arrows / WASD to steer, Spacebar to shoot on PC & Mac &bull; Direct Touch & Fire on Android & iOS
      </p>
    </div>
  );
};
