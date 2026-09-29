import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { Play, RotateCcw, Trophy, Crosshair, Zap } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
}

interface EnemyPlane {
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  isAlive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  size: number;
}

interface Obstacle {
  x: number;
  topHeight: number;
  bottomY: number;
  width: number;
  passed: boolean;
}

export const TapPlane: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [enemiesDestroyed, setEnemiesDestroyed] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gamenest_tapplane_high') || '0', 10);
  });
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  // Player Fighter Jet Physics
  const jetRef = useRef<{
    y: number;
    vy: number;
    rotation: number;
  }>({
    y: 200,
    vy: 0,
    rotation: 0,
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<EnemyPlane[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scoreRef = useRef(0);
  const enemySpawnTimerRef = useRef(0);
  const obstacleSpawnTimerRef = useRef(0);
  const shootCooldownRef = useRef(0);

  const GRAVITY = 0.32;
  const LIFT_FORCE = -6.4;
  const SPEED = 2.6;

  const resetGame = useCallback(() => {
    sound.unlockMobileAudio();
    jetRef.current = {
      y: 200,
      vy: LIFT_FORCE * 0.7,
      rotation: 0,
    };
    bulletsRef.current = [];
    enemiesRef.current = [];
    obstaclesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    enemySpawnTimerRef.current = 0;
    obstacleSpawnTimerRef.current = 0;
    setScore(0);
    setEnemiesDestroyed(0);
    setGameState('playing');
    sound.playScore();
  }, [LIFT_FORCE]);

  // Ascend / Lift plane
  const liftJet = useCallback(() => {
    sound.unlockMobileAudio();
    if (gameState !== 'playing') {
      resetGame();
      return;
    }
    jetRef.current.vy = LIFT_FORCE;
    jetRef.current.rotation = -0.35;
    sound.playFlap();

    // Afterburner thruster burst particles
    for (let i = 0; i < 4; i++) {
      particlesRef.current.push({
        x: 80,
        y: jetRef.current.y,
        vx: -3 - Math.random() * 3,
        vy: (Math.random() - 0.5) * 2,
        color: '#f97316',
        life: 14,
        size: 4,
      });
    }
  }, [gameState, resetGame, LIFT_FORCE]);

  // Fire Missiles / Lasers
  const shootMissile = useCallback(() => {
    sound.unlockMobileAudio();
    if (gameState !== 'playing') return;
    if (shootCooldownRef.current > 0) return;

    shootCooldownRef.current = 8; // debounce
    bulletsRef.current.push({
      x: 130,
      y: jetRef.current.y,
      vx: 8.5,
    });
    sound.playLaser();
  }, [gameState]);

  // Key controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', ' ', 'ArrowUp'].includes(e.key) || e.code === 'Space') {
        e.preventDefault();
        liftJet();
        shootMissile();
      }
      if (e.key === 'f' || e.key === 'F' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        shootMissile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [liftJet, shootMissile]);

  // Main combat and flight tick loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;

    const tick = () => {
      const jet = jetRef.current;

      // 1. Gravity and Jet Aerodynamics
      jet.vy += GRAVITY;
      jet.y += jet.vy;

      if (jet.vy < 0) {
        jet.rotation = Math.max(-0.4, jet.rotation - 0.04);
      } else {
        jet.rotation = Math.min(0.65, jet.rotation + 0.03);
      }

      if (shootCooldownRef.current > 0) {
        shootCooldownRef.current -= 1;
      }

      // Continuous afterburner particles
      if (Math.random() < 0.6) {
        particlesRef.current.push({
          x: 75,
          y: jet.y + (Math.random() - 0.5) * 4,
          vx: -2.5 - Math.random() * 2,
          vy: (Math.random() - 0.5) * 1.5,
          color: Math.random() < 0.5 ? '#f59e0b' : '#38bdf8',
          life: 12,
          size: 3,
        });
      }

      // Check ceiling and ground boundary crash
      if (jet.y >= 410 || jet.y <= 10) {
        sound.playGameOver();
        setGameState('gameover');
        if (scoreRef.current > highScore) {
          setHighScore(scoreRef.current);
          localStorage.setItem('gamenest_tapplane_high', scoreRef.current.toString());
        }
        return;
      }

      // 2. Update Bullets
      for (let bi = bulletsRef.current.length - 1; bi >= 0; bi--) {
        const b = bulletsRef.current[bi];
        b.x += b.vx;
        if (b.x > 500) {
          bulletsRef.current.splice(bi, 1);
        }
      }

      // 3. Spawn Enemy Planes periodically
      enemySpawnTimerRef.current += 1;
      if (enemySpawnTimerRef.current > 75) {
        enemySpawnTimerRef.current = 0;
        const enemyY = Math.floor(Math.random() * 280) + 40;
        enemiesRef.current.push({
          x: 520,
          y: enemyY,
          vy: (Math.random() - 0.5) * 1.2,
          width: 44,
          height: 24,
          hp: 1,
          isAlive: true,
        });
      }

      // 4. Update Enemy Planes & Bullet Collisions
      for (let ei = enemiesRef.current.length - 1; ei >= 0; ei--) {
        const enemy = enemiesRef.current[ei];
        enemy.x -= 3.2; // Fly towards player
        enemy.y += enemy.vy;

        // Keep inside bounds
        if (enemy.y < 30 || enemy.y > 380) {
          enemy.vy = -enemy.vy;
        }

        // Bullet hits enemy
        for (let bi = bulletsRef.current.length - 1; bi >= 0; bi--) {
          const b = bulletsRef.current[bi];
          if (
            b.x >= enemy.x - 10 &&
            b.x <= enemy.x + enemy.width &&
            b.y >= enemy.y - 12 &&
            b.y <= enemy.y + enemy.height + 12
          ) {
            // ENEMY DESTROYED!
            bulletsRef.current.splice(bi, 1);
            enemiesRef.current.splice(ei, 1);
            sound.playExplosion();

            // Fireball explosion particles
            for (let i = 0; i < 18; i++) {
              particlesRef.current.push({
                x: enemy.x + 15,
                y: enemy.y + 10,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: i % 2 === 0 ? '#ef4444' : '#f59e0b',
                life: 20,
                size: 4.5,
              });
            }

            // Extra score reward!
            scoreRef.current += 100;
            setScore(scoreRef.current);
            setEnemiesDestroyed((ed) => ed + 1);
            onScoreUpdate?.(scoreRef.current);

            if (scoreRef.current > highScore) {
              setHighScore(scoreRef.current);
              localStorage.setItem('gamenest_tapplane_high', scoreRef.current.toString());
            }
            break;
          }
        }

        // Player Jet vs Enemy Jet collision
        if (
          enemy.isAlive &&
          enemy.x < 125 &&
          enemy.x + enemy.width > 75 &&
          jet.y + 14 > enemy.y &&
          jet.y - 14 < enemy.y + enemy.height
        ) {
          sound.playGameOver();
          setGameState('gameover');
          if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem('gamenest_tapplane_high', scoreRef.current.toString());
          }
          return;
        }

        // Remove offscreen
        if (enemy.x < -60) {
          enemiesRef.current.splice(ei, 1);
        }
      }

      // 5. Spawn & Move Sky Pylons / Canyon Obstacles
      obstacleSpawnTimerRef.current += 1;
      if (obstacleSpawnTimerRef.current > 110) {
        obstacleSpawnTimerRef.current = 0;
        const topH = Math.floor(Math.random() * 150) + 40;
        obstaclesRef.current.push({
          x: 520,
          topHeight: topH,
          bottomY: topH + 150, // generous flight gap
          width: 50,
          passed: false,
        });
      }

      for (let oi = obstaclesRef.current.length - 1; oi >= 0; oi--) {
        const obs = obstaclesRef.current[oi];
        obs.x -= SPEED;

        // Flight navigation score
        if (!obs.passed && obs.x + obs.width < 90) {
          obs.passed = true;
          scoreRef.current += 20;
          setScore(scoreRef.current);
          onScoreUpdate?.(scoreRef.current);

          if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem('gamenest_tapplane_high', scoreRef.current.toString());
          }
        }

        // Jet vs Obstacle crash
        if (obs.x < 120 && obs.x + obs.width > 80) {
          if (jet.y - 12 < obs.topHeight || jet.y + 12 > obs.bottomY) {
            sound.playGameOver();
            setGameState('gameover');
            if (scoreRef.current > highScore) {
              setHighScore(scoreRef.current);
              localStorage.setItem('gamenest_tapplane_high', scoreRef.current.toString());
            }
            return;
          }
        }

        if (obs.x < -60) {
          obstaclesRef.current.splice(oi, 1);
        }
      }

      // 6. Update particles
      particlesRef.current.forEach((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 1;
      });
      particlesRef.current = particlesRef.current.filter((pt) => pt.life > 0);

      // 7. Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // High altitude sky atmosphere
          const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
          skyGrad.addColorStop(0, '#0c4a6e');
          skyGrad.addColorStop(0.5, '#0284c7');
          skyGrad.addColorStop(1, '#38bdf8');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, w, h);

          // Fast-scrolling cloud layers
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          const cloudY = [60, 180, 310];
          cloudY.forEach((cy, idx) => {
            const cx = ((performance.now() * 0.08 * (idx + 1)) % (w + 100)) - 50;
            ctx.beginPath();
            ctx.ellipse(w - cx, cy, 50, 18, 0, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw Canyon / Pylon Obstacles
          obstaclesRef.current.forEach((obs) => {
            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 3;

            // Top pillar
            ctx.fillRect(obs.x, 0, obs.width, obs.topHeight);
            ctx.strokeRect(obs.x, 0, obs.width, obs.topHeight);

            // Bottom pillar
            ctx.fillRect(obs.x, obs.bottomY, obs.width, h - obs.bottomY);
            ctx.strokeRect(obs.x, obs.bottomY, obs.width, h - obs.bottomY);

            // Hazard warning stripes
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(obs.x + 4, obs.topHeight - 12, obs.width - 8, 8);
            ctx.fillRect(obs.x + 4, obs.bottomY + 4, obs.width - 8, 8);
          });

          // Draw Plasma Bullets
          bulletsRef.current.forEach((b) => {
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(b.x, b.y - 3, 16, 6, 3);
            ctx.fill();
            ctx.shadowBlur = 0;
          });

          // Draw Enemy Fighter Planes
          enemiesRef.current.forEach((ep) => {
            ctx.save();
            ctx.translate(ep.x, ep.y);

            // Enemy jet silhouette (Red/crimson stealth design)
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.moveTo(ep.width, ep.height / 2);
            ctx.lineTo(0, 0);
            ctx.lineTo(10, ep.height / 2);
            ctx.lineTo(0, ep.height);
            ctx.closePath();
            ctx.fill();

            // Wing markings
            ctx.fillStyle = '#991b1b';
            ctx.fillRect(10, -6, 12, 4);
            ctx.fillRect(10, ep.height + 2, 12, 4);

            // Cockpit
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc(ep.width - 12, ep.height / 2, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          });

          // Draw Player Fighter Jet
          ctx.save();
          ctx.translate(100, jet.y);
          ctx.rotate(jet.rotation);

          // Jet Body (Sleek aerodynamic delta wing)
          ctx.fillStyle = '#0284c7';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(35, 0); // nose tip
          ctx.lineTo(-24, -14); // left wingtip
          ctx.lineTo(-12, 0); // engine intake
          ctx.lineTo(-24, 14); // right wingtip
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Jet Canopy / Cockpit glass
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.ellipse(8, 0, 10, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Afterburner engine nozzle
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-22, -4, 6, 8);

          ctx.restore();

          // Draw Particles
          particlesRef.current.forEach((pt) => {
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore, onScoreUpdate]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-2 sm:p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[480px] flex items-center justify-between mb-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 text-sm shadow">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase">Score:</span>
            <span className="text-xl font-black font-mono text-cyan-400">{score}</span>
          </div>

          <div className="flex items-center gap-1 text-rose-400 font-bold text-xs">
            <Crosshair className="w-3.5 h-3.5" />
            <span className="font-mono">{enemiesDestroyed} Hits</span>
          </div>
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

      {/* Main Flight Viewport */}
      <div
        onClick={() => {
          liftJet();
          shootMissile();
        }}
        className="relative w-full max-w-[480px] aspect-[4/3] max-h-[440px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-sky-900 flex items-center justify-center cursor-pointer touch-none"
      >
        <canvas ref={canvasRef} width={480} height={440} className="w-full h-full block" />

        {/* Start / Game Over Overlay */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            {gameState === 'idle' && (
              <>
                <div className="w-16 h-16 mb-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-wide mb-1">
                  Tap Plane Game
                </h3>
                <p className="text-xs text-slate-300 max-w-xs mb-5">
                  Fly your supersonic fighter jet! Tap to climb and shoot missiles to destroy incoming enemy fighter planes!
                </p>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-sm"
                >
                  START MISSION
                </button>
              </>
            )}

            {gameState === 'gameover' && (
              <>
                <div className="w-14 h-14 mb-2 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-lg">
                  <RotateCcw className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-rose-400 mb-1">JET CRASHED!</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Final Score: <span className="font-bold text-white font-mono">{score}</span> | Enemies Shot: <span className="font-bold text-rose-400 font-mono">{enemiesDestroyed}</span>
                </p>
                <button
                  onClick={resetGame}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Fly Again
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Flight & Combat Controls */}
      <div className="w-full max-w-[480px] flex items-center justify-between gap-3 mt-3 px-2">
        <button
          onClick={liftJet}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 active:bg-cyan-600 active:scale-95 text-white font-bold flex items-center justify-center gap-2 shadow text-xs transition"
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>TAP TO FLY</span>
        </button>

        <button
          onClick={shootMissile}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 active:from-rose-700 active:to-amber-700 active:scale-95 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 text-xs transition"
        >
          <Crosshair className="w-4 h-4" />
          <span>FIRE MISSILE (+100)</span>
        </button>
      </div>
    </div>
  );
};
