import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { Play, RotateCcw, Trophy, Zap, Shield, Magnet, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Coins } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

interface Player {
  id: 1 | 2;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  score: number;
  speedMultiplier: number;
  speedTimer: number;
  hasShield: boolean;
  magnetTimer: number;
  stunTimer: number;
  coinsCollected: number;
}

interface Item {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'supercoin' | 'bomb' | 'speed' | 'shield' | 'magnet';
  radius: number;
  pulse: number;
}

export const CoinRush: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);

  const CANVAS_WIDTH = 620;
  const CANVAS_HEIGHT = 420;

  const nextIdRef = useRef<number>(1);
  const spawnTimerRef = useRef<number>(30);
  const timeLeftRef = useRef<number>(60);

  const p1Ref = useRef<Player>({
    id: 1,
    x: 100,
    y: 210,
    vx: 0,
    vy: 0,
    radius: 15,
    color: '#06b6d4',
    glowColor: '#22d3ee',
    score: 0,
    speedMultiplier: 1,
    speedTimer: 0,
    hasShield: false,
    magnetTimer: 0,
    stunTimer: 0,
    coinsCollected: 0,
  });

  const p2Ref = useRef<Player>({
    id: 2,
    x: 520,
    y: 210,
    vx: 0,
    vy: 0,
    radius: 15,
    color: '#f43f5e',
    glowColor: '#fb7185',
    score: 0,
    speedMultiplier: 1,
    speedTimer: 0,
    hasShield: false,
    magnetTimer: 0,
    stunTimer: 0,
    coinsCollected: 0,
  });

  const itemsRef = useRef<Item[]>([]);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);

  // Key states
  const keysRef = useRef<{
    p1Up: boolean;
    p1Down: boolean;
    p1Left: boolean;
    p1Right: boolean;
    p2Up: boolean;
    p2Down: boolean;
    p2Left: boolean;
    p2Right: boolean;
  }>({
    p1Up: false,
    p1Down: false,
    p1Left: false,
    p1Right: false,
    p2Up: false,
    p2Down: false,
    p2Left: false,
    p2Right: false,
  });

  // Start new match
  const startMatch = useCallback(() => {
    sound.unlockMobileAudio();
    setP1Score(0);
    setP2Score(0);
    setTimeLeft(60);
    timeLeftRef.current = 60;
    setWinnerMessage(null);

    p1Ref.current = {
      id: 1,
      x: 100,
      y: 210,
      vx: 0,
      vy: 0,
      radius: 15,
      color: '#06b6d4',
      glowColor: '#22d3ee',
      score: 0,
      speedMultiplier: 1,
      speedTimer: 0,
      hasShield: false,
      magnetTimer: 0,
      stunTimer: 0,
      coinsCollected: 0,
    };

    p2Ref.current = {
      id: 2,
      x: 520,
      y: 210,
      vx: 0,
      vy: 0,
      radius: 15,
      color: '#f43f5e',
      glowColor: '#fb7185',
      score: 0,
      speedMultiplier: 1,
      speedTimer: 0,
      hasShield: false,
      magnetTimer: 0,
      stunTimer: 0,
      coinsCollected: 0,
    };

    itemsRef.current = [];
    particlesRef.current = [];
    spawnTimerRef.current = 15;

    // Initial scatter of coins
    for (let i = 0; i < 8; i++) {
      itemsRef.current.push({
        id: nextIdRef.current++,
        x: 80 + Math.random() * 460,
        y: 60 + Math.random() * 300,
        type: 'coin',
        radius: 8,
        pulse: Math.random() * Math.PI,
      });
    }

    setGameState('playing');
    sound.playScore();
  }, []);

  // 60-second timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      timeLeftRef.current -= 1;
      setTimeLeft(timeLeftRef.current);

      if (timeLeftRef.current <= 5 && timeLeftRef.current > 0) {
        sound.playCountdownBeep(false);
      }

      if (timeLeftRef.current <= 0) {
        clearInterval(interval);
        sound.playWin();
        const s1 = p1Ref.current.score;
        const s2 = p2Ref.current.score;
        if (s1 > s2) {
          setWinnerMessage(`Player 1 Wins with ${s1} Points! 🏆`);
          onScoreUpdate?.(s1);
        } else if (s2 > s1) {
          setWinnerMessage(`Player 2 Wins with ${s2} Points! 🏆`);
          onScoreUpdate?.(s2);
        } else {
          setWinnerMessage(`It's a TIE at ${s1} Points!`);
          onScoreUpdate?.(s1);
        }
        setGameState('gameover');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, onScoreUpdate]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const k = keysRef.current;
      // P1: WASD
      if (e.key.toLowerCase() === 'w') k.p1Up = true;
      if (e.key.toLowerCase() === 's') k.p1Down = true;
      if (e.key.toLowerCase() === 'a') k.p1Left = true;
      if (e.key.toLowerCase() === 'd') k.p1Right = true;

      // P2: Arrows
      if (e.key === 'ArrowUp') k.p2Up = true;
      if (e.key === 'ArrowDown') k.p2Down = true;
      if (e.key === 'ArrowLeft') k.p2Left = true;
      if (e.key === 'ArrowRight') k.p2Right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = keysRef.current;
      if (e.key.toLowerCase() === 'w') k.p1Up = false;
      if (e.key.toLowerCase() === 's') k.p1Down = false;
      if (e.key.toLowerCase() === 'a') k.p1Left = false;
      if (e.key.toLowerCase() === 'd') k.p1Right = false;

      if (e.key === 'ArrowUp') k.p2Up = false;
      if (e.key === 'ArrowDown') k.p2Down = false;
      if (e.key === 'ArrowLeft') k.p2Left = false;
      if (e.key === 'ArrowRight') k.p2Right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main simulation tick
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;

    const tick = () => {
      const k = keysRef.current;
      const p1 = p1Ref.current;
      const p2 = p2Ref.current;

      // 1. Update Player 1
      if (p1.stunTimer > 0) {
        p1.stunTimer -= 1;
        p1.vx = 0;
        p1.vy = 0;
      } else {
        if (p1.speedTimer > 0) {
          p1.speedTimer -= 1;
          p1.speedMultiplier = 1.7;
        } else {
          p1.speedMultiplier = 1.0;
        }
        if (p1.magnetTimer > 0) p1.magnetTimer -= 1;

        const baseSpeed = 3.8 * p1.speedMultiplier;
        let mx = 0;
        let my = 0;
        if (k.p1Up) my -= 1;
        if (k.p1Down) my += 1;
        if (k.p1Left) mx -= 1;
        if (k.p1Right) mx += 1;

        const len = Math.hypot(mx, my);
        if (len > 0) {
          p1.vx = (mx / len) * baseSpeed;
          p1.vy = (my / len) * baseSpeed;
        } else {
          p1.vx = 0;
          p1.vy = 0;
        }
        p1.x += p1.vx;
        p1.y += p1.vy;
      }

      // 2. Update Player 2
      if (p2.stunTimer > 0) {
        p2.stunTimer -= 1;
        p2.vx = 0;
        p2.vy = 0;
      } else {
        if (p2.speedTimer > 0) {
          p2.speedTimer -= 1;
          p2.speedMultiplier = 1.7;
        } else {
          p2.speedMultiplier = 1.0;
        }
        if (p2.magnetTimer > 0) p2.magnetTimer -= 1;

        const baseSpeed = 3.8 * p2.speedMultiplier;
        let mx = 0;
        let my = 0;
        if (k.p2Up) my -= 1;
        if (k.p2Down) my += 1;
        if (k.p2Left) mx -= 1;
        if (k.p2Right) mx += 1;

        const len = Math.hypot(mx, my);
        if (len > 0) {
          p2.vx = (mx / len) * baseSpeed;
          p2.vy = (my / len) * baseSpeed;
        } else {
          p2.vx = 0;
          p2.vy = 0;
        }
        p2.x += p2.vx;
        p2.y += p2.vy;
      }

      // Boundaries
      [p1, p2].forEach((p) => {
        p.x = Math.max(p.radius + 14, Math.min(CANVAS_WIDTH - p.radius - 14, p.x));
        p.y = Math.max(p.radius + 14, Math.min(CANVAS_HEIGHT - p.radius - 14, p.y));
      });

      // Player vs Player collision bounce
      const pDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      if (pDist < p1.radius + p2.radius && pDist > 0) {
        const overlap = (p1.radius + p2.radius - pDist) / 2;
        const nx = (p1.x - p2.x) / pDist;
        const ny = (p1.y - p2.y) / pDist;
        p1.x += nx * overlap;
        p1.y += ny * overlap;
        p2.x -= nx * overlap;
        p2.y -= ny * overlap;
        sound.playBounce();
      }

      // 3. Accelerating Item Spawns
      spawnTimerRef.current -= 1;
      const rate = Math.max(16, Math.floor(timeLeftRef.current * 0.5));
      if (spawnTimerRef.current <= 0) {
        spawnTimerRef.current = rate;
        if (itemsRef.current.length < 24) {
          const roll = Math.random();
          let type: Item['type'] = 'coin';
          let rad = 8;

          if (roll < 0.6) {
            type = 'coin';
            rad = 8;
          } else if (roll < 0.72) {
            type = 'supercoin';
            rad = 12;
          } else if (roll < 0.84) {
            type = 'bomb';
            rad = 10;
          } else if (roll < 0.90) {
            type = 'speed';
            rad = 11;
          } else if (roll < 0.95) {
            type = 'shield';
            rad = 11;
          } else {
            type = 'magnet';
            rad = 11;
          }

          itemsRef.current.push({
            id: nextIdRef.current++,
            x: 40 + Math.random() * (CANVAS_WIDTH - 80),
            y: 40 + Math.random() * (CANVAS_HEIGHT - 80),
            type,
            radius: rad,
            pulse: 0,
          });
        }
      }

      // 4. Update & Magnetize Items
      for (let ii = itemsRef.current.length - 1; ii >= 0; ii--) {
        const item = itemsRef.current[ii];
        item.pulse += 0.05;

        // Check magnet draw on coins
        if (item.type === 'coin' || item.type === 'supercoin') {
          [p1, p2].forEach((p) => {
            if (p.magnetTimer > 0) {
              const mDist = Math.hypot(p.x - item.x, p.y - item.y);
              if (mDist < 160 && mDist > 0) {
                item.x += ((p.x - item.x) / mDist) * 5.5;
                item.y += ((p.y - item.y) / mDist) * 5.5;
              }
            }
          });
        }

        // Check Collection by Players
        [p1, p2].forEach((p) => {
          const dist = Math.hypot(p.x - item.x, p.y - item.y);
          if (dist < p.radius + item.radius) {
            if (item.type === 'coin') {
              p.score += 100;
              p.coinsCollected += 1;
              sound.playCoin();
            } else if (item.type === 'supercoin') {
              p.score += 300;
              p.coinsCollected += 3;
              sound.playScore();
            } else if (item.type === 'bomb') {
              if (p.hasShield) {
                p.hasShield = false;
                sound.playBounce();
              } else {
                p.score = Math.max(0, p.score - 200);
                p.stunTimer = 45; // brief stun
                sound.playExplosion();
              }
            } else if (item.type === 'speed') {
              p.speedTimer = 300; // 5 seconds speed!
              sound.playPowerup();
            } else if (item.type === 'shield') {
              p.hasShield = true;
              sound.playZenChime();
            } else if (item.type === 'magnet') {
              p.magnetTimer = 320; // 5.3 seconds magnet!
              sound.playPowerup();
            }

            // Coin collect sparkles
            for (let i = 0; i < 6; i++) {
              particlesRef.current.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: item.type === 'bomb' ? '#ef4444' : '#facc15',
                life: 14,
              });
            }

            if (p.id === 1) setP1Score(p.score);
            else setP2Score(p.score);

            itemsRef.current.splice(ii, 1);
          }
        });
      }

      // Update Particles
      for (let pi = particlesRef.current.length - 1; pi >= 0; pi--) {
        const pt = particlesRef.current[pi];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 1;
        if (pt.life <= 0) particlesRef.current.splice(pi, 1);
      }

      // Render Scene
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Arena background
          ctx.fillStyle = '#0a0e1a';
          ctx.fillRect(0, 0, w, h);

          // Subtle grid lines
          ctx.strokeStyle = 'rgba(234, 179, 8, 0.06)';
          ctx.lineWidth = 1;
          for (let x = 20; x < w; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }
          for (let y = 20; y < h; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }

          // Glowing Arena Border
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ca8a04';
          ctx.shadowBlur = 10;
          ctx.strokeRect(14, 14, w - 28, h - 28);
          ctx.shadowBlur = 0;

          // Draw Items
          itemsRef.current.forEach((it) => {
            ctx.save();
            ctx.translate(it.x, it.y);

            if (it.type === 'coin') {
              ctx.fillStyle = '#facc15';
              ctx.shadowColor = '#eab308';
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(0, 0, it.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#ca8a04';
              ctx.lineWidth = 1.5;
              ctx.stroke();
              ctx.fillStyle = '#713f12';
              ctx.font = 'bold 9px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('$', 0, 0);
            } else if (it.type === 'supercoin') {
              ctx.fillStyle = '#f59e0b';
              ctx.shadowColor = '#f59e0b';
              ctx.shadowBlur = 16;
              ctx.beginPath();
              ctx.arc(0, 0, it.radius + Math.sin(it.pulse) * 1.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 11px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('★', 0, 0);
            } else if (it.type === 'bomb') {
              ctx.fillStyle = '#1c1917';
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 2;
              ctx.shadowColor = '#ef4444';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(0, 0, it.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.fillStyle = '#ef4444';
              ctx.font = 'bold 11px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('💣', 0, 0);
            } else if (it.type === 'speed') {
              ctx.fillStyle = '#3b82f6';
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(0, 0, it.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 10px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('⚡', 0, 0);
            } else if (it.type === 'shield') {
              ctx.fillStyle = '#06b6d4';
              ctx.shadowColor = '#22d3ee';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(0, 0, it.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 10px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('🛡️', 0, 0);
            } else if (it.type === 'magnet') {
              ctx.fillStyle = '#ec4899';
              ctx.shadowColor = '#f43f5e';
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(0, 0, it.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 10px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('🧲', 0, 0);
            }

            ctx.restore();
          });

          // Draw Players
          [p1, p2].forEach((p) => {
            ctx.save();
            ctx.translate(p.x, p.y);

            // Stun effect
            if (p.stunTimer > 0) {
              ctx.fillStyle = '#facc15';
              ctx.font = '12px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('💫', 0, -p.radius - 12);
            }

            // Shield bubble
            if (p.hasShield) {
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 2.5;
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 12;
              ctx.beginPath();
              ctx.arc(0, 0, p.radius + 6, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Magnet pulse aura
            if (p.magnetTimer > 0) {
              ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(0, 0, p.radius + 12 + (p.magnetTimer % 10), 0, Math.PI * 2);
              ctx.stroke();
            }

            // Player body
            ctx.shadowColor = p.glowColor;
            ctx.shadowBlur = p.speedTimer > 0 ? 22 : 12;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Headband
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(-p.radius * 0.7, -4, p.radius * 1.4, 8, 3);
            ctx.fill();

            // Eyes
            const eyeDirX = p.vx !== 0 ? Math.sign(p.vx) * 3 : 0;
            const eyeDirY = p.vy !== 0 ? Math.sign(p.vy) * 2 : 0;
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-4 + eyeDirX, eyeDirY, 2.5, 0, Math.PI * 2);
            ctx.arc(4 + eyeDirX, eyeDirY, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Score tag above
            ctx.shadowBlur = 0;
            ctx.fillStyle = p.color;
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${p.score}`, 0, -p.radius - 6);

            ctx.restore();
          });

          // Draw Particles
          particlesRef.current.forEach((pt) => {
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-2 sm:p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[620px] flex items-center justify-between mb-2 px-4 py-2 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 text-sm shadow">
        {/* P1 Score */}
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
          <span className="font-bold text-cyan-400">P1:</span>
          <span className="font-mono text-xl font-black text-white">{p1Score}</span>
        </div>

        {/* 60s Match Clock */}
        <div
          className={`flex items-center gap-1.5 px-4 py-1 rounded-full font-mono text-base font-bold shadow ${
            timeLeft <= 10
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500 animate-pulse'
              : 'bg-slate-800 text-amber-400 border border-slate-700'
          }`}
        >
          <span>⏱️ {timeLeft}s</span>
        </div>

        {/* P2 Score */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-black text-white">{p2Score}</span>
          <span className="font-bold text-rose-400">:P2</span>
          <div className="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-md shadow-rose-400/50" />
        </div>
      </div>

      {/* Main Arena Viewport */}
      <div className="relative w-full max-w-[620px] aspect-[16/11] max-h-[420px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-950 flex items-center justify-center touch-none">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full block" />

        {/* Menu Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <div className="w-16 h-16 mb-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
              <Coins className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-wide mb-1">
              COIN RUSH
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mb-5">
              Two players rush across the arena to collect as many coins as possible in 60 seconds! Avoid bombs, grab magnets and shields. Highest score wins!
            </p>
            <div className="flex items-center gap-8 text-xs text-slate-400 mb-6">
              <div className="flex flex-col items-center">
                <span className="text-cyan-400 font-bold mb-1">Player 1</span>
                <span className="font-mono bg-slate-800 px-2.5 py-1 rounded border border-slate-700">W, A, S, D</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-rose-400 font-bold mb-1">Player 2</span>
                <span className="font-mono bg-slate-800 px-2.5 py-1 rounded border border-slate-700">Arrow Keys</span>
              </div>
            </div>
            <button
              onClick={startMatch}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-sm"
            >
              START RUSH
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <Trophy className="w-14 h-14 text-amber-400 mb-2" />
            <h3 className="text-2xl font-black text-white mb-2">{winnerMessage}</h3>
            <p className="text-xs text-slate-300 mb-5 font-mono">
              Score: <span className="text-cyan-400 font-bold">{p1Score}</span> vs{' '}
              <span className="text-rose-400 font-bold">{p2Score}</span>
            </p>
            <button
              onClick={startMatch}
              className="px-8 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-xs"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Mobile Split On-Screen Controls */}
      <div className="w-full max-w-[620px] flex items-center justify-between mt-3 px-2">
        {/* P1 D-Pad (Left side) */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">P1 D-Pad</span>
          <div className="grid grid-cols-3 gap-1 w-28 h-28 p-1 bg-slate-900/80 rounded-2xl border border-cyan-500/30">
            <div />
            <button
              onPointerDown={() => (keysRef.current.p1Up = true)}
              onPointerUp={() => (keysRef.current.p1Up = false)}
              onPointerLeave={() => (keysRef.current.p1Up = false)}
              className="bg-slate-800 active:bg-cyan-600 rounded-lg flex items-center justify-center text-cyan-300 shadow active:scale-95"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div />
            <button
              onPointerDown={() => (keysRef.current.p1Left = true)}
              onPointerUp={() => (keysRef.current.p1Left = false)}
              onPointerLeave={() => (keysRef.current.p1Left = false)}
              className="bg-slate-800 active:bg-cyan-600 rounded-lg flex items-center justify-center text-cyan-300 shadow active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="rounded-lg bg-slate-950/40" />
            <button
              onPointerDown={() => (keysRef.current.p1Right = true)}
              onPointerUp={() => (keysRef.current.p1Right = false)}
              onPointerLeave={() => (keysRef.current.p1Right = false)}
              className="bg-slate-800 active:bg-cyan-600 rounded-lg flex items-center justify-center text-cyan-300 shadow active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div />
            <button
              onPointerDown={() => (keysRef.current.p1Down = true)}
              onPointerUp={() => (keysRef.current.p1Down = false)}
              onPointerLeave={() => (keysRef.current.p1Down = false)}
              className="bg-slate-800 active:bg-cyan-600 rounded-lg flex items-center justify-center text-cyan-300 shadow active:scale-95"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <div />
          </div>
        </div>

        {/* Central Rematch */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={startMatch}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition shadow"
            title="Reset Game"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* P2 D-Pad (Right side) */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">P2 D-Pad</span>
          <div className="grid grid-cols-3 gap-1 w-28 h-28 p-1 bg-slate-900/80 rounded-2xl border border-rose-500/30">
            <div />
            <button
              onPointerDown={() => (keysRef.current.p2Up = true)}
              onPointerUp={() => (keysRef.current.p2Up = false)}
              onPointerLeave={() => (keysRef.current.p2Up = false)}
              className="bg-slate-800 active:bg-rose-600 rounded-lg flex items-center justify-center text-rose-300 shadow active:scale-95"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div />
            <button
              onPointerDown={() => (keysRef.current.p2Left = true)}
              onPointerUp={() => (keysRef.current.p2Left = false)}
              onPointerLeave={() => (keysRef.current.p2Left = false)}
              className="bg-slate-800 active:bg-rose-600 rounded-lg flex items-center justify-center text-rose-300 shadow active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="rounded-lg bg-slate-950/40" />
            <button
              onPointerDown={() => (keysRef.current.p2Right = true)}
              onPointerUp={() => (keysRef.current.p2Right = false)}
              onPointerLeave={() => (keysRef.current.p2Right = false)}
              className="bg-slate-800 active:bg-rose-600 rounded-lg flex items-center justify-center text-rose-300 shadow active:scale-95"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div />
            <button
              onPointerDown={() => (keysRef.current.p2Down = true)}
              onPointerUp={() => (keysRef.current.p2Down = false)}
              onPointerLeave={() => (keysRef.current.p2Down = false)}
              className="bg-slate-800 active:bg-rose-600 rounded-lg flex items-center justify-center text-rose-300 shadow active:scale-95"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <div />
          </div>
        </div>
      </div>
    </div>
  );
};
