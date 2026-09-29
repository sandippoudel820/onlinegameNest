import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { Play, RotateCcw, Trophy, Users, Shield, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

type TileState = 'solid' | 'warning' | 'gone';

interface Tile {
  r: number;
  c: number;
  x: number;
  y: number;
  size: number;
  state: TileState;
  warningTimer: number; // in frames
  goneTimer: number;
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
  name: string;
  isAlive: boolean;
  fallProgress: number; // 0 to 1
  animFrame: number;
  score: number;
}

export const LastPlatform: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'playing' | 'round_over'>('menu');
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [countdownText, setCountdownText] = useState('3');
  const [dangerLevel, setDangerLevel] = useState(1);

  // Logical Canvas size
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 420;

  // Grid constants
  const ROWS = 6;
  const COLS = 6;
  const TILE_SIZE = 50;
  const TILE_GAP = 6;
  const GRID_START_X = (CANVAS_WIDTH - (COLS * TILE_SIZE + (COLS - 1) * TILE_GAP)) / 2;
  const GRID_START_Y = (CANVAS_HEIGHT - (ROWS * TILE_SIZE + (ROWS - 1) * TILE_GAP)) / 2 + 10;

  const tilesRef = useRef<Tile[]>([]);
  const dropTimerRef = useRef(120);
  const gameTimeRef = useRef(0);

  // Players Ref
  const p1Ref = useRef<Player>({
    id: 1,
    x: GRID_START_X + TILE_SIZE / 2,
    y: GRID_START_Y + TILE_SIZE / 2,
    vx: 0,
    vy: 0,
    radius: 14,
    color: '#06b6d4',
    glowColor: '#22d3ee',
    name: 'Player 1',
    isAlive: true,
    fallProgress: 0,
    animFrame: 0,
    score: 0,
  });

  const p2Ref = useRef<Player>({
    id: 2,
    x: GRID_START_X + (COLS - 1) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2,
    y: GRID_START_Y + (ROWS - 1) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2,
    vx: 0,
    vy: 0,
    radius: 14,
    color: '#f43f5e',
    glowColor: '#fb7185',
    name: 'Player 2',
    isAlive: true,
    fallProgress: 0,
    animFrame: 0,
    score: 0,
  });

  // Inputs Ref (P1: WASD, P2: Arrows)
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

  // Particles
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);

  // Init grid of tiles
  const initGrid = useCallback(() => {
    const list: Tile[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        list.push({
          r,
          c,
          x: GRID_START_X + c * (TILE_SIZE + TILE_GAP),
          y: GRID_START_Y + r * (TILE_SIZE + TILE_GAP),
          size: TILE_SIZE,
          state: 'solid',
          warningTimer: 0,
          goneTimer: 0,
        });
      }
    }
    tilesRef.current = list;
    dropTimerRef.current = 100;
    gameTimeRef.current = 0;
  }, [GRID_START_X, GRID_START_Y]);

  // Start new round
  const startRound = useCallback(() => {
    sound.unlockMobileAudio();
    initGrid();
    setDangerLevel(1);

    // Reset player positions
    p1Ref.current.x = GRID_START_X + TILE_SIZE / 2 + 10;
    p1Ref.current.y = GRID_START_Y + TILE_SIZE / 2 + 10;
    p1Ref.current.vx = 0;
    p1Ref.current.vy = 0;
    p1Ref.current.isAlive = true;
    p1Ref.current.fallProgress = 0;

    p2Ref.current.x = GRID_START_X + (COLS - 1) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2 - 10;
    p2Ref.current.y = GRID_START_Y + (ROWS - 1) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2 - 10;
    p2Ref.current.vx = 0;
    p2Ref.current.vy = 0;
    p2Ref.current.isAlive = true;
    p2Ref.current.fallProgress = 0;

    particlesRef.current = [];
    setGameState('countdown');
    setCountdownText('3');
    sound.playCountdownBeep(false);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownText(count.toString());
        sound.playCountdownBeep(false);
      } else if (count === 0) {
        setCountdownText('GO!');
        sound.playCountdownBeep(true);
      } else {
        clearInterval(interval);
        setGameState('playing');
      }
    }, 800);
  }, [initGrid, GRID_START_X, GRID_START_Y]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const k = keysRef.current;
      // Player 1 (WASD)
      if (e.key.toLowerCase() === 'w') k.p1Up = true;
      if (e.key.toLowerCase() === 's') k.p1Down = true;
      if (e.key.toLowerCase() === 'a') k.p1Left = true;
      if (e.key.toLowerCase() === 'd') k.p1Right = true;

      // Player 2 (Arrow keys)
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
      gameTimeRef.current += 1;
      const time = gameTimeRef.current;
      const k = keysRef.current;
      const p1 = p1Ref.current;
      const p2 = p2Ref.current;

      // 1. Move Player 1
      if (p1.isAlive) {
        const speed = 3.6;
        let dx = 0;
        let dy = 0;
        if (k.p1Up) dy -= speed;
        if (k.p1Down) dy += speed;
        if (k.p1Left) dx -= speed;
        if (k.p1Right) dx += speed;

        if (dx !== 0 && dy !== 0) {
          dx *= 0.707;
          dy *= 0.707;
        }
        p1.vx = dx;
        p1.vy = dy;
        p1.x += p1.vx;
        p1.y += p1.vy;
        p1.animFrame += 0.2;
      } else if (p1.fallProgress < 1) {
        p1.fallProgress += 0.04;
      }

      // 2. Move Player 2
      if (p2.isAlive) {
        const speed = 3.6;
        let dx = 0;
        let dy = 0;
        if (k.p2Up) dy -= speed;
        if (k.p2Down) dy += speed;
        if (k.p2Left) dx -= speed;
        if (k.p2Right) dx += speed;

        if (dx !== 0 && dy !== 0) {
          dx *= 0.707;
          dy *= 0.707;
        }
        p2.vx = dx;
        p2.vy = dy;
        p2.x += p2.vx;
        p2.y += p2.vy;
        p2.animFrame += 0.2;
      } else if (p2.fallProgress < 1) {
        p2.fallProgress += 0.04;
      }

      // Player to player gentle bump
      if (p1.isAlive && p2.isAlive) {
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const minDist = p1.radius + p2.radius;
        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const nx = (p1.x - p2.x) / dist;
          const ny = (p1.y - p2.y) / dist;
          p1.x += nx * overlap;
          p1.y += ny * overlap;
          p2.x -= nx * overlap;
          p2.y -= ny * overlap;
          sound.playBounce();
        }
      }

      // 3. Update Platform Tiles
      // Danger level scales up over time
      const currentDanger = Math.min(5, 1 + Math.floor(time / 450));
      setDangerLevel(currentDanger);

      dropTimerRef.current -= 1;
      if (dropTimerRef.current <= 0) {
        // Trigger 1 to 3 solid tiles to start warning
        const solidTiles = tilesRef.current.filter((t) => t.state === 'solid');
        if (solidTiles.length > 2) {
          const countToDrop = Math.min(solidTiles.length - 1, Math.floor(Math.random() * currentDanger) + 1);
          for (let i = 0; i < countToDrop; i++) {
            const idx = Math.floor(Math.random() * solidTiles.length);
            const chosen = solidTiles[idx];
            chosen.state = 'warning';
            chosen.warningTimer = Math.max(35, 75 - currentDanger * 8); // faster warning on high danger
            solidTiles.splice(idx, 1);
          }
        }
        dropTimerRef.current = Math.max(45, 95 - currentDanger * 10);
      }

      // Update tile states
      tilesRef.current.forEach((tile) => {
        if (tile.state === 'warning') {
          tile.warningTimer -= 1;
          if (tile.warningTimer <= 0) {
            tile.state = 'gone';
            tile.goneTimer = 160 + Math.random() * 60; // will reappear after some time
            sound.playHit();
            // Tile break particles
            for (let i = 0; i < 6; i++) {
              particlesRef.current.push({
                x: tile.x + TILE_SIZE / 2,
                y: tile.y + TILE_SIZE / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: '#f43f5e',
                life: 18,
              });
            }
          }
        } else if (tile.state === 'gone') {
          tile.goneTimer -= 1;
          if (tile.goneTimer <= 0) {
            tile.state = 'solid';
          }
        }
      });

      // 4. Check if Players are supported by any solid/warning tile
      const checkPlayerOnPlatform = (p: Player) => {
        return tilesRef.current.some((t) => {
          if (t.state === 'gone') return false;
          return (
            p.x >= t.x - 2 &&
            p.x <= t.x + t.size + 2 &&
            p.y >= t.y - 2 &&
            p.y <= t.y + t.size + 2
          );
        });
      };

      if (p1.isAlive && !checkPlayerOnPlatform(p1)) {
        p1.isAlive = false;
        sound.playFall();
      }

      if (p2.isAlive && !checkPlayerOnPlatform(p2)) {
        p2.isAlive = false;
        sound.playFall();
      }

      // 5. Check Round Over Condition
      if (!p1.isAlive || !p2.isAlive) {
        if (!p1.isAlive && !p2.isAlive) {
          // Both fell -> Tie!
          setRoundWinner('TIE! Both fell into the abyss!');
          setGameState('round_over');
          sound.playGameOver();
        } else if (!p1.isAlive) {
          // P2 wins
          setP2Score((s) => {
            const next = s + 1;
            onScoreUpdate?.(next * 100);
            return next;
          });
          setRoundWinner('Player 2 Wins the Round! 🏆');
          setGameState('round_over');
          sound.playWin();
        } else if (!p2.isAlive) {
          // P1 wins
          setP1Score((s) => {
            const next = s + 1;
            onScoreUpdate?.(next * 100);
            return next;
          });
          setRoundWinner('Player 1 Wins the Round! 🏆');
          setGameState('round_over');
          sound.playWin();
        }
        return;
      }

      // 6. Update Particles
      for (let pi = particlesRef.current.length - 1; pi >= 0; pi--) {
        const pt = particlesRef.current[pi];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 1;
        if (pt.life <= 0) particlesRef.current.splice(pi, 1);
      }

      // 7. Render Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Deep void background
          const bg = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w / 2);
          bg.addColorStop(0, '#0f172a');
          bg.addColorStop(1, '#020617');
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, w, h);

          // Grid glowing outline
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(GRID_START_X - 12, GRID_START_Y - 12, COLS * (TILE_SIZE + TILE_GAP) + 18, ROWS * (TILE_SIZE + TILE_GAP) + 18);

          // Draw Tiles
          tilesRef.current.forEach((tile) => {
            if (tile.state === 'gone') return;

            ctx.save();
            if (tile.state === 'warning') {
              // Vibrating wobble & urgent flashing warning
              const shake = (Math.random() - 0.5) * 3;
              ctx.translate(tile.x + shake, tile.y + shake);
              ctx.fillStyle = '#ef4444';
              ctx.strokeStyle = '#fca5a5';
              ctx.lineWidth = 2.5;
              ctx.shadowColor = '#ef4444';
              ctx.shadowBlur = 14;
            } else {
              ctx.translate(tile.x, tile.y);
              ctx.fillStyle = '#1e293b';
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 2;
              ctx.shadowColor = '#0284c7';
              ctx.shadowBlur = 8;
            }

            ctx.beginPath();
            ctx.roundRect(0, 0, tile.size, tile.size, 8);
            ctx.fill();
            ctx.stroke();

            // Inner sci-fi tile grid accent
            ctx.fillStyle = tile.state === 'warning' ? '#b91c1c' : '#334155';
            ctx.beginPath();
            ctx.roundRect(6, 6, tile.size - 12, tile.size - 12, 5);
            ctx.fill();

            if (tile.state === 'warning') {
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 16px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('⚠️', tile.size / 2, tile.size / 2);
            }

            ctx.restore();
          });

          // Draw Particles
          particlesRef.current.forEach((pt) => {
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw Players
          [p1, p2].forEach((p) => {
            ctx.save();
            const scale = p.isAlive ? 1 : Math.max(0.01, 1 - p.fallProgress);
            const alpha = p.isAlive ? 1 : Math.max(0, 1 - p.fallProgress);
            ctx.globalAlpha = alpha;
            ctx.translate(p.x, p.y);
            ctx.scale(scale, scale);

            // Player Glow
            ctx.shadowColor = p.glowColor;
            ctx.shadowBlur = 18;

            // Character body circle
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();

            // Headband / visor
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(-p.radius * 0.7, -4, p.radius * 1.4, 8, 3);
            ctx.fill();

            // Cute eyes looking in movement direction
            const eyeDirX = p.vx !== 0 ? Math.sign(p.vx) * 3 : 0;
            const eyeDirY = p.vy !== 0 ? Math.sign(p.vy) * 2 : 0;
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-4 + eyeDirX, eyeDirY, 2.5, 0, Math.PI * 2);
            ctx.arc(4 + eyeDirX, eyeDirY, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Player Label
            ctx.shadowBlur = 0;
            ctx.fillStyle = p.color;
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(p.name, 0, -p.radius - 6);

            ctx.restore();
          });
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameState, onScoreUpdate]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-2 sm:p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[600px] flex items-center justify-between mb-2 px-4 py-2 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 text-sm shadow">
        {/* P1 Score */}
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
          <span className="font-bold text-cyan-400">P1:</span>
          <span className="font-mono text-xl font-black text-white">{p1Score}</span>
        </div>

        {/* Danger Level */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
          <span className="text-slate-400 font-medium">Danger:</span>
          <span className="font-mono font-bold text-rose-400">{'★'.repeat(dangerLevel)}</span>
        </div>

        {/* P2 Score */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-black text-white">{p2Score}</span>
          <span className="font-bold text-rose-400">:P2</span>
          <div className="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-md shadow-rose-400/50" />
        </div>
      </div>

      {/* Main Game Canvas Viewport */}
      <div className="relative w-full max-w-[600px] aspect-[4/3] max-h-[420px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-950 flex items-center justify-center touch-none">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full block" />

        {/* Countdown Overlay */}
        {gameState === 'countdown' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <span className="text-7xl font-black text-cyan-400 tracking-wider animate-ping">
              {countdownText}
            </span>
          </div>
        )}

        {/* Menu / Start Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <div className="w-16 h-16 mb-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-wide mb-1">
              LAST PLATFORM
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mb-5">
              Two players stand on a grid of tiles. Tiles flash red and vanish into the abyss! Don't fall. Last surviving player wins!
            </p>
            <div className="flex items-center gap-6 text-xs text-slate-400 mb-6">
              <div className="flex flex-col items-center">
                <span className="text-cyan-400 font-bold mb-1">Player 1</span>
                <span className="font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700">W, A, S, D</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-rose-400 font-bold mb-1">Player 2</span>
                <span className="font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700">Arrow Keys</span>
              </div>
            </div>
            <button
              onClick={startRound}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-sm"
            >
              START BATTLE
            </button>
          </div>
        )}

        {/* Round Over Overlay */}
        {gameState === 'round_over' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <div className="w-14 h-14 mb-2 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-lg">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">{roundWinner}</h3>
            <p className="text-xs text-slate-400 mb-5">
              Score: <span className="text-cyan-400 font-bold">P1 ({p1Score})</span> vs <span className="text-rose-400 font-bold">P2 ({p2Score})</span>
            </p>
            <button
              onClick={() => {
                setRoundNumber((r) => r + 1);
                startRound();
              }}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-xs"
            >
              NEXT ROUND
            </button>
          </div>
        )}
      </div>

      {/* Mobile Split On-Screen Controls */}
      <div className="w-full max-w-[600px] flex items-center justify-between mt-3 px-2">
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

        {/* Central Round / Reset info */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium">Round {roundNumber}</span>
          <button
            onClick={() => {
              setP1Score(0);
              setP2Score(0);
              setRoundNumber(1);
              startRound();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition shadow"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
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
