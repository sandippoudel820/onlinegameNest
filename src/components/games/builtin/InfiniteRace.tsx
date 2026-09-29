import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { Play, RotateCcw, Trophy, Zap, ArrowUp, ArrowDown, Shield } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

interface Runner {
  id: 1 | 2;
  y: number;
  baseY: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  isSliding: boolean;
  slideTimer: number;
  hasShield: boolean;
  isAlive: boolean;
  score: number;
  coins: number;
  animFrame: number;
}

interface Obstacle {
  id: number;
  lane: 1 | 2; // 1 = Top track (P1), 2 = Bottom track (P2)
  x: number;
  type: 'hurdle' | 'overhead' | 'barrier'; // hurdle: jump over, overhead: slide under
  width: number;
  height: number;
  y: number;
  passed: boolean;
}

interface Coin {
  id: number;
  lane: 1 | 2;
  x: number;
  y: number;
  isShield?: boolean;
}

export const InfiniteRace: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);

  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 400;

  // Track lanes
  const LANE1_Y = 170; // P1 ground surface
  const LANE2_Y = 355; // P2 ground surface

  const speedRef = useRef(4.0);
  const distanceRef = useRef(0);
  const spawnTimerRef = useRef(60);

  const p1Ref = useRef<Runner>({
    id: 1,
    y: LANE1_Y - 36,
    baseY: LANE1_Y,
    vy: 0,
    width: 24,
    height: 36,
    isGrounded: true,
    isSliding: false,
    slideTimer: 0,
    hasShield: false,
    isAlive: true,
    score: 0,
    coins: 0,
    animFrame: 0,
  });

  const p2Ref = useRef<Runner>({
    id: 2,
    y: LANE2_Y - 36,
    baseY: LANE2_Y,
    vy: 0,
    width: 24,
    height: 36,
    isGrounded: true,
    isSliding: false,
    slideTimer: 0,
    hasShield: false,
    isAlive: true,
    score: 0,
    coins: 0,
    animFrame: 0,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);
  const nextIdRef = useRef(1);

  // Jump action
  const jump = useCallback((playerNum: 1 | 2) => {
    sound.unlockMobileAudio();
    const p = playerNum === 1 ? p1Ref.current : p2Ref.current;
    if (!p.isAlive || !p.isGrounded) return;

    p.vy = -8.8;
    p.isGrounded = false;
    p.isSliding = false;
    p.slideTimer = 0;
    p.height = 36;
    sound.playJump();
  }, []);

  // Slide action
  const slide = useCallback((playerNum: 1 | 2) => {
    sound.unlockMobileAudio();
    const p = playerNum === 1 ? p1Ref.current : p2Ref.current;
    if (!p.isAlive) return;

    if (p.isGrounded) {
      p.isSliding = true;
      p.slideTimer = 35; // ~0.6 sec slide
      p.height = 18; // ducks down low
      p.y = p.baseY - 18;
      sound.playSlide();
    } else {
      // Fast drop down if in air
      p.vy = 9.5;
    }
  }, []);

  // Reset and start race
  const startRace = useCallback(() => {
    sound.unlockMobileAudio();
    speedRef.current = 4.0;
    distanceRef.current = 0;
    spawnTimerRef.current = 60;

    p1Ref.current = {
      id: 1,
      y: LANE1_Y - 36,
      baseY: LANE1_Y,
      vy: 0,
      width: 24,
      height: 36,
      isGrounded: true,
      isSliding: false,
      slideTimer: 0,
      hasShield: false,
      isAlive: true,
      score: 0,
      coins: 0,
      animFrame: 0,
    };

    p2Ref.current = {
      id: 2,
      y: LANE2_Y - 36,
      baseY: LANE2_Y,
      vy: 0,
      width: 24,
      height: 36,
      isGrounded: true,
      isSliding: false,
      slideTimer: 0,
      hasShield: false,
      isAlive: true,
      score: 0,
      coins: 0,
      animFrame: 0,
    };

    obstaclesRef.current = [];
    coinsRef.current = [];
    particlesRef.current = [];
    setDistance(0);
    setP1Score(0);
    setP2Score(0);
    setWinnerMessage(null);
    setGameState('playing');
    sound.playScore();
  }, [LANE1_Y, LANE2_Y]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // P1: W to jump, S to slide
      if (e.key.toLowerCase() === 'w' || e.key.toLowerCase() === ' ') jump(1);
      if (e.key.toLowerCase() === 's') slide(1);

      // P2: Up Arrow to jump, Down Arrow to slide
      if (e.key === 'ArrowUp') jump(2);
      if (e.key === 'ArrowDown') slide(2);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump, slide]);

  // Main simulation tick
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;

    const tick = () => {
      // Speed acceleration over distance
      distanceRef.current += 1;
      setDistance(Math.floor(distanceRef.current / 6));
      speedRef.current = Math.min(10.5, 4.0 + (distanceRef.current / 1200) * 1.5);
      const currentSpeed = speedRef.current;

      const p1 = p1Ref.current;
      const p2 = p2Ref.current;

      // Update Player 1
      if (p1.isAlive) {
        p1.animFrame += 0.25;
        if (!p1.isGrounded) {
          p1.vy += 0.44; // gravity
          p1.y += p1.vy;
          if (p1.y >= p1.baseY - p1.height) {
            p1.y = p1.baseY - p1.height;
            p1.vy = 0;
            p1.isGrounded = true;
          }
        }
        if (p1.isSliding) {
          p1.slideTimer -= 1;
          if (p1.slideTimer <= 0) {
            p1.isSliding = false;
            p1.height = 36;
            p1.y = p1.baseY - 36;
          }
        }
      }

      // Update Player 2
      if (p2.isAlive) {
        p2.animFrame += 0.25;
        if (!p2.isGrounded) {
          p2.vy += 0.44;
          p2.y += p2.vy;
          if (p2.y >= p2.baseY - p2.height) {
            p2.y = p2.baseY - p2.height;
            p2.vy = 0;
            p2.isGrounded = true;
          }
        }
        if (p2.isSliding) {
          p2.slideTimer -= 1;
          if (p2.slideTimer <= 0) {
            p2.isSliding = false;
            p2.height = 36;
            p2.y = p2.baseY - 36;
          }
        }
      }

      // Spawn Obstacles & Collectibles
      spawnTimerRef.current -= 1;
      if (spawnTimerRef.current <= 0) {
        spawnTimerRef.current = Math.max(32, 65 - Math.floor(distanceRef.current / 400) * 4);

        // Types: hurdle (jump over) or overhead (slide under)
        const type = Math.random() < 0.5 ? 'hurdle' : 'overhead';

        // Spawn symmetrically for both lanes for fairness!
        [1, 2].forEach((lane) => {
          const laneY = lane === 1 ? LANE1_Y : LANE2_Y;
          let obsW = 22;
          let obsH = 28;
          let obsY = laneY - obsH;

          if (type === 'overhead') {
            obsW = 32;
            obsH = 20;
            obsY = laneY - 44; // floating overhead beam
          }

          obstaclesRef.current.push({
            id: nextIdRef.current++,
            lane: lane as 1 | 2,
            x: CANVAS_WIDTH + 30,
            type,
            width: obsW,
            height: obsH,
            y: obsY,
            passed: false,
          });

          // Chance of coin or shield pickup
          if (Math.random() < 0.4) {
            const isShield = Math.random() < 0.15;
            coinsRef.current.push({
              id: nextIdRef.current++,
              lane: lane as 1 | 2,
              x: CANVAS_WIDTH + 90,
              y: type === 'hurdle' ? laneY - 46 : laneY - 14,
              isShield,
            });
          }
        });
      }

      // Move & Collide Obstacles
      for (let oi = obstaclesRef.current.length - 1; oi >= 0; oi--) {
        const obs = obstaclesRef.current[oi];
        obs.x -= currentSpeed;

        const runner = obs.lane === 1 ? p1 : p2;

        if (runner.isAlive) {
          const runnerX = 70; // fixed runner X position on screen
          const hit =
            runnerX + runner.width > obs.x &&
            runnerX < obs.x + obs.width &&
            runner.y + runner.height > obs.y &&
            runner.y < obs.y + obs.height;

          if (hit) {
            if (runner.hasShield) {
              runner.hasShield = false;
              sound.playBounce();
              obstaclesRef.current.splice(oi, 1);
              continue;
            } else {
              // Runner crashes!
              runner.isAlive = false;
              sound.playExplosion();

              // Crash particles
              for (let i = 0; i < 16; i++) {
                particlesRef.current.push({
                  x: runnerX + 12,
                  y: runner.y + 16,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: runner.id === 1 ? '#06b6d4' : '#f43f5e',
                  life: 25,
                });
              }
            }
          }
        }

        // Remove offscreen
        if (obs.x < -60) {
          obstaclesRef.current.splice(oi, 1);
        }
      }

      // Move & Collect Coins
      for (let ci = coinsRef.current.length - 1; ci >= 0; ci--) {
        const c = coinsRef.current[ci];
        c.x -= currentSpeed;

        const runner = c.lane === 1 ? p1 : p2;
        if (runner.isAlive) {
          const runnerX = 70;
          if (
            runnerX + runner.width > c.x - 8 &&
            runnerX < c.x + 18 &&
            runner.y + runner.height > c.y - 8 &&
            runner.y < c.y + 18
          ) {
            if (c.isShield) {
              runner.hasShield = true;
              sound.playZenChime();
            } else {
              runner.coins += 1;
              runner.score += 50;
              sound.playCoin();
            }
            if (runner.id === 1) setP1Score((s) => s + 50);
            else setP2Score((s) => s + 50);

            coinsRef.current.splice(ci, 1);
            continue;
          }
        }

        if (c.x < -40) {
          coinsRef.current.splice(ci, 1);
        }
      }

      // Check Game Over Condition
      if (!p1.isAlive || !p2.isAlive) {
        if (!p1.isAlive && !p2.isAlive) {
          setWinnerMessage('Both crashed at the exact same distance! TIE!');
        } else if (!p1.isAlive) {
          setWinnerMessage('Player 2 Outran Player 1! Victory! 🏆');
          sound.playWin();
          onScoreUpdate?.(distanceRef.current + p2.score);
        } else {
          setWinnerMessage('Player 1 Outran Player 2! Victory! 🏆');
          sound.playWin();
          onScoreUpdate?.(distanceRef.current + p1.score);
        }
        setGameState('gameover');
        return;
      }

      // Update Particles
      for (let pi = particlesRef.current.length - 1; pi >= 0; pi--) {
        const pt = particlesRef.current[pi];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 1;
        if (pt.life <= 0) particlesRef.current.splice(pi, 1);
      }

      // Render Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Parallax Cyber Track Background
          ctx.fillStyle = '#0b0f19';
          ctx.fillRect(0, 0, w, h);

          // Track divider line
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, h / 2);
          ctx.lineTo(w, h / 2);
          ctx.stroke();

          // Lane 1 & Lane 2 Ground Tracks
          [LANE1_Y, LANE2_Y].forEach((ly, idx) => {
            // Neon track floor
            ctx.fillStyle = idx === 0 ? '#083344' : '#4c0519';
            ctx.fillRect(0, ly, w, 24);

            ctx.strokeStyle = idx === 0 ? '#06b6d4' : '#f43f5e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, ly);
            ctx.lineTo(w, ly);
            ctx.stroke();

            // Track speed grid dashes
            ctx.strokeStyle = idx === 0 ? '#22d3ee' : '#fb7185';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([16, 16]);
            ctx.lineDashOffset = -(distanceRef.current * currentSpeed * 0.4) % 32;
            ctx.beginPath();
            ctx.moveTo(0, ly + 10);
            ctx.lineTo(w, ly + 10);
            ctx.stroke();
            ctx.setLineDash([]);
          });

          // Draw Coins
          coinsRef.current.forEach((c) => {
            ctx.save();
            ctx.translate(c.x, c.y);
            if (c.isShield) {
              ctx.fillStyle = '#38bdf8';
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(0, 0, 8, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 9px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('🛡️', 0, 1);
            } else {
              ctx.fillStyle = '#facc15';
              ctx.shadowColor = '#eab308';
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(0, 0, 7, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#ca8a04';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
            ctx.restore();
          });

          // Draw Obstacles
          obstaclesRef.current.forEach((obs) => {
            ctx.save();
            ctx.translate(obs.x, obs.y);
            if (obs.type === 'hurdle') {
              // Spiky neon hurdle
              ctx.fillStyle = '#dc2626';
              ctx.strokeStyle = '#f87171';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.roundRect(0, 0, obs.width, obs.height, 4);
              ctx.fill();
              ctx.stroke();
              // Warning stripes
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(4, 4, obs.width - 8, 4);
            } else {
              // Overhead laser barrier (must slide under!)
              ctx.fillStyle = '#9333ea';
              ctx.strokeStyle = '#c084fc';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.roundRect(0, 0, obs.width, obs.height, 4);
              ctx.fill();
              ctx.stroke();
              // Laser beam underneath
              ctx.strokeStyle = '#f43f5e';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(obs.width / 2, obs.height);
              ctx.lineTo(obs.width / 2, obs.height + 8);
              ctx.stroke();
            }
            ctx.restore();
          });

          // Draw Runners
          [p1, p2].forEach((p) => {
            if (!p.isAlive) return;
            ctx.save();
            const runnerX = 70;
            ctx.translate(runnerX, p.y);

            // Shield bubble
            if (p.hasShield) {
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 2;
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 12;
              ctx.beginPath();
              ctx.arc(p.width / 2, p.height / 2, p.height * 0.75, 0, Math.PI * 2);
              ctx.stroke();
            }

            const pColor = p.id === 1 ? '#06b6d4' : '#f43f5e';
            ctx.fillStyle = pColor;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;

            if (p.isSliding) {
              // Sliding flat capsule
              ctx.beginPath();
              ctx.roundRect(0, 0, p.width + 12, p.height, 8);
              ctx.fill();
              ctx.stroke();
              // Dust spark
              ctx.fillStyle = '#facc15';
              ctx.fillRect(-6, p.height - 3, 5, 3);
            } else {
              // Running / jumping upright commando runner
              ctx.beginPath();
              ctx.roundRect(0, 0, p.width, p.height, 6);
              ctx.fill();
              ctx.stroke();

              // Running legs
              const legSwing = Math.sin(p.animFrame) * 6;
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(3 + legSwing, p.height - 4, 6, 8);
              ctx.fillRect(15 - legSwing, p.height - 4, 6, 8);

              // Head visor
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(p.width - 8, 6, 6, 5);
            }

            ctx.restore();
          });

          // Draw Particles
          particlesRef.current.forEach((pt) => {
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameState, onScoreUpdate, LANE1_Y, LANE2_Y]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-2 sm:p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[640px] flex items-center justify-between mb-2 px-4 py-2 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 text-sm shadow">
        {/* P1 Stats */}
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
          <span className="font-bold text-cyan-400">P1 (Top):</span>
          <span className="font-mono text-base font-black text-white">{p1Score} pts</span>
        </div>

        {/* Distance Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
          <span className="text-slate-400 font-medium">Distance:</span>
          <span className="font-mono font-bold text-amber-400">{distance}m</span>
        </div>

        {/* P2 Stats */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-black text-white">{p2Score} pts</span>
          <span className="font-bold text-rose-400">:(Btm) P2</span>
          <div className="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-md shadow-rose-400/50" />
        </div>
      </div>

      {/* Main Track Viewport */}
      <div className="relative w-full max-w-[640px] aspect-[16/10] max-h-[400px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-950 flex items-center justify-center touch-none">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full block" />

        {/* Menu Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <div className="w-16 h-16 mb-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20">
              <Zap className="w-8 h-8 fill-current" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-wide mb-1">
              INFINITE RACE
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mb-5">
              Two runners dash along parallel neon tracks. Jump over red hurdles, slide under purple beams, collect coins, and outlast your rival!
            </p>
            <div className="flex items-center gap-8 text-xs text-slate-400 mb-6">
              <div className="flex flex-col items-center">
                <span className="text-cyan-400 font-bold mb-1">P1 (Top Track)</span>
                <span className="font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700">W (Jump) / S (Slide)</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-rose-400 font-bold mb-1">P2 (Bottom Track)</span>
                <span className="font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700">Up (Jump) / Down (Slide)</span>
              </div>
            </div>
            <button
              onClick={startRace}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-sm"
            >
              START RACE
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <Trophy className="w-14 h-14 text-amber-400 mb-2" />
            <h3 className="text-2xl font-black text-white mb-1">{winnerMessage}</h3>
            <p className="text-xs text-slate-300 mb-5 font-mono">
              Surviving Distance: <span className="text-amber-400 font-bold">{distance}m</span>
            </p>
            <button
              onClick={startRace}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-xs"
            >
              RACE AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Mobile Split Touch Buttons */}
      <div className="w-full max-w-[640px] flex items-center justify-between gap-4 mt-3 px-2">
        {/* P1 Controls */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => jump(1)}
            className="w-16 h-14 rounded-2xl bg-cyan-600 active:bg-cyan-700 active:scale-95 text-white font-black flex flex-col items-center justify-center shadow-lg shadow-cyan-500/20 text-xs"
          >
            <ArrowUp className="w-4 h-4" />
            <span>P1 JUMP</span>
          </button>
          <button
            onPointerDown={() => slide(1)}
            className="w-16 h-14 rounded-2xl bg-cyan-800 active:bg-cyan-900 active:scale-95 text-cyan-200 font-black flex flex-col items-center justify-center shadow text-xs"
          >
            <ArrowDown className="w-4 h-4" />
            <span>P1 SLIDE</span>
          </button>
        </div>

        {/* Rematch Icon Button */}
        <button
          onClick={startRace}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition shadow"
          title="Restart Race"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* P2 Controls */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => slide(2)}
            className="w-16 h-14 rounded-2xl bg-rose-800 active:bg-rose-900 active:scale-95 text-rose-200 font-black flex flex-col items-center justify-center shadow text-xs"
          >
            <ArrowDown className="w-4 h-4" />
            <span>P2 SLIDE</span>
          </button>
          <button
            onPointerDown={() => jump(2)}
            className="w-16 h-14 rounded-2xl bg-rose-600 active:bg-rose-700 active:scale-95 text-white font-black flex flex-col items-center justify-center shadow-lg shadow-rose-500/20 text-xs"
          >
            <ArrowUp className="w-4 h-4" />
            <span>P2 JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
