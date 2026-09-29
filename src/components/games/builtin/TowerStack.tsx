import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { RotateCcw, Play, Trophy, Building2, Sparkles } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

interface BuildingFloor {
  x: number;
  y: number;
  width: number;
  height: number;
  isPerfect: boolean;
  colorScheme: { wall: string; window: string; trim: string };
  floorNumber: number;
}

export const TowerStack: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0); // number of floors
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('gamenest_building_high') || '0', 10);
  });
  const [perfectCombo, setPerfectCombo] = useState(0);
  const [showPerfectBanner, setShowPerfectBanner] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');

  // Building geometry constants
  const FLOOR_WIDTH = 140;
  const FLOOR_HEIGHT = 44;
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 500;

  // Tower stack
  const floorsRef = useRef<BuildingFloor[]>([]);
  // Current falling floor
  const droppingFloorRef = useRef<{
    x: number;
    y: number;
    vy: number;
    width: number;
    height: number;
    isDropping: boolean;
    colorScheme: { wall: string; window: string; trim: string };
  }>({
    x: 170,
    y: 70,
    vy: 0,
    width: FLOOR_WIDTH,
    height: FLOOR_HEIGHT,
    isDropping: false,
    colorScheme: { wall: '#3b82f6', window: '#fef08a', trim: '#1d4ed8' },
  });

  // Crane sliding state
  const craneXRef = useRef(170);
  const craneSpeedRef = useRef(3.2);
  const craneDirRef = useRef(1);
  const cameraYRef = useRef(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);

  // Building floor color themes
  const FLOOR_THEMES = [
    { wall: '#38bdf8', window: '#fef08a', trim: '#0284c7' },
    { wall: '#3b82f6', window: '#ffffff', trim: '#1d4ed8' },
    { wall: '#6366f1', window: '#fef08a', trim: '#4338ca' },
    { wall: '#8b5cf6', window: '#fde047', trim: '#6d28d9' },
    { wall: '#06b6d4', window: '#ffffff', trim: '#0891b2' },
    { wall: '#10b981', window: '#fef08a', trim: '#059669' },
    { wall: '#f59e0b', window: '#ffffff', trim: '#d97706' },
  ];

  const getTheme = (index: number) => {
    return FLOOR_THEMES[index % FLOOR_THEMES.length];
  };

  const startNewGame = useCallback(() => {
    sound.unlockMobileAudio();
    const groundFloor: BuildingFloor = {
      x: (CANVAS_WIDTH - FLOOR_WIDTH) / 2,
      y: CANVAS_HEIGHT - FLOOR_HEIGHT - 20,
      width: FLOOR_WIDTH,
      height: FLOOR_HEIGHT,
      isPerfect: true,
      colorScheme: { wall: '#334155', window: '#fde047', trim: '#1e293b' },
      floorNumber: 1,
    };

    floorsRef.current = [groundFloor];
    craneXRef.current = 170;
    craneSpeedRef.current = 3.2;
    craneDirRef.current = 1;
    cameraYRef.current = 0;
    particlesRef.current = [];

    droppingFloorRef.current = {
      x: 170,
      y: 70,
      vy: 0,
      width: FLOOR_WIDTH,
      height: FLOOR_HEIGHT,
      isDropping: false,
      colorScheme: getTheme(1),
    };

    setScore(1);
    setPerfectCombo(0);
    setShowPerfectBanner(null);
    setGameState('playing');
    sound.playScore();
  }, []);

  // Drop floor from height
  const dropFloor = useCallback(() => {
    sound.unlockMobileAudio();
    if (gameState !== 'playing') {
      startNewGame();
      return;
    }
    const current = droppingFloorRef.current;
    if (current.isDropping) return;

    current.x = craneXRef.current;
    current.y = 70 + cameraYRef.current;
    current.vy = 2; // initial drop velocity
    current.isDropping = true;
    sound.playBounce();
  }, [gameState, startNewGame]);

  // Main game tick
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;

    const tick = () => {
      // 1. Crane horizontal sway movement
      if (!droppingFloorRef.current.isDropping) {
        craneXRef.current += craneSpeedRef.current * craneDirRef.current;
        const minX = 40;
        const maxX = CANVAS_WIDTH - FLOOR_WIDTH - 40;
        if (craneXRef.current <= minX) {
          craneXRef.current = minX;
          craneDirRef.current = 1;
        } else if (craneXRef.current >= maxX) {
          craneXRef.current = maxX;
          craneDirRef.current = -1;
        }
      }

      // 2. Falling floor physics
      const falling = droppingFloorRef.current;
      if (falling.isDropping) {
        falling.vy += 0.85; // Gravity
        falling.y += falling.vy;

        // Check landing on the top-most stacked floor
        const topFloor = floorsRef.current[floorsRef.current.length - 1];
        const targetLandingY = topFloor.y - FLOOR_HEIGHT;

        if (falling.y >= targetLandingY) {
          const offset = falling.x - topFloor.x;
          const absOffset = Math.abs(offset);

          // Check if completely missed
          if (absOffset >= FLOOR_WIDTH * 0.9) {
            // Tumbles off into the void -> Game Over!
            sound.playGameOver();
            setGameState('gameover');
            if (floorsRef.current.length > highScore) {
              setHighScore(floorsRef.current.length);
              localStorage.setItem('gamenest_building_high', floorsRef.current.length.toString());
            }
            return;
          }

          // Landed on the floor!
          // Check PERFECT alignment (within 5 pixels)
          let isPerfect = false;
          let settledX = falling.x;

          if (absOffset <= 5) {
            isPerfect = true;
            settledX = topFloor.x; // Perfect snap!
            sound.playZenChime();
            setPerfectCombo((prev) => {
              const nextCombo = prev + 1;
              setShowPerfectBanner(nextCombo > 1 ? `PERFECT x${nextCombo}! ⭐` : 'PERFECT! ⭐');
              setTimeout(() => setShowPerfectBanner(null), 1200);
              return nextCombo;
            });

            // Golden star particles
            for (let i = 0; i < 16; i++) {
              particlesRef.current.push({
                x: settledX + FLOOR_WIDTH / 2,
                y: targetLandingY + FLOOR_HEIGHT / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: '#fbbf24',
                life: 25,
              });
            }
          } else {
            isPerfect = false;
            setPerfectCombo(0);
            sound.playStoneClack();
          }

          // Add to floors
          const newFloorNumber = floorsRef.current.length + 1;
          const newFloor: BuildingFloor = {
            x: settledX,
            y: targetLandingY,
            width: FLOOR_WIDTH,
            height: FLOOR_HEIGHT,
            isPerfect,
            colorScheme: falling.colorScheme,
            floorNumber: newFloorNumber,
          };

          floorsRef.current.push(newFloor);
          setScore(newFloorNumber);
          onScoreUpdate?.(newFloorNumber * 50 + (isPerfect ? 100 : 0));

          if (newFloorNumber > highScore) {
            setHighScore(newFloorNumber);
            localStorage.setItem('gamenest_building_high', newFloorNumber.toString());
          }

          // Increase crane challenge speed slightly
          craneSpeedRef.current = Math.min(6.5, 3.2 + Math.floor(newFloorNumber / 4) * 0.35);

          // Reset falling floor ready for next drop
          droppingFloorRef.current = {
            x: craneXRef.current,
            y: 70 + cameraYRef.current,
            vy: 0,
            width: FLOOR_WIDTH,
            height: FLOOR_HEIGHT,
            isDropping: false,
            colorScheme: getTheme(newFloorNumber),
          };
        }
      }

      // 3. Smooth Camera tracking upwards
      const topFloorY = floorsRef.current[floorsRef.current.length - 1].y;
      const targetCamY = Math.min(0, CANVAS_HEIGHT - 220 - topFloorY);
      cameraYRef.current += (targetCamY - cameraYRef.current) * 0.08;

      // 4. Update particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
      });
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

      // 5. Canvas Render
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const camY = cameraYRef.current;

          // Sky gradient transitioning to deep space as building climbs
          const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
          const altitude = Math.abs(camY);
          if (altitude < 300) {
            bgGrad.addColorStop(0, '#38bdf8');
            bgGrad.addColorStop(0.7, '#93c5fd');
            bgGrad.addColorStop(1, '#e0f2fe');
          } else if (altitude < 800) {
            bgGrad.addColorStop(0, '#1e3a8a');
            bgGrad.addColorStop(0.6, '#3b82f6');
            bgGrad.addColorStop(1, '#93c5fd');
          } else {
            bgGrad.addColorStop(0, '#030712');
            bgGrad.addColorStop(0.7, '#0f172a');
            bgGrad.addColorStop(1, '#1e293b');
          }
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, w, h);

          // Distant background clouds
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          const cloudsY = [120, 260, 420, 600, 900];
          cloudsY.forEach((cy, idx) => {
            const screenCy = cy + camY * 0.4;
            if (screenCy > -60 && screenCy < h + 60) {
              const cx = ((idx * 160) % (w - 80)) + 40;
              ctx.beginPath();
              ctx.arc(cx, screenCy, 32, 0, Math.PI * 2);
              ctx.arc(cx + 30, screenCy - 8, 40, 0, Math.PI * 2);
              ctx.arc(cx + 65, screenCy, 30, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          ctx.save();
          ctx.translate(0, camY);

          // Ground city street at bottom
          ctx.fillStyle = '#334155';
          ctx.fillRect(0, CANVAS_HEIGHT - 20, w, 20);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(0, CANVAS_HEIGHT - 24, w, 6);

          // Render Stacked Building Floors
          floorsRef.current.forEach((fl) => {
            // Building floor body
            ctx.fillStyle = fl.colorScheme.wall;
            ctx.fillRect(fl.x, fl.y, fl.width, fl.height);

            // Floor trim border
            ctx.strokeStyle = fl.colorScheme.trim;
            ctx.lineWidth = 2.5;
            ctx.strokeRect(fl.x, fl.y, fl.width, fl.height);

            // Windows with warm illumination
            const windowW = 16;
            const windowH = 20;
            const numWindows = 4;
            const gap = (fl.width - numWindows * windowW) / (numWindows + 1);

            for (let wi = 0; wi < numWindows; wi++) {
              const wx = fl.x + gap + wi * (windowW + gap);
              const wy = fl.y + 11;
              ctx.fillStyle = fl.colorScheme.window;
              ctx.fillRect(wx, wy, windowW, windowH);
              ctx.strokeStyle = fl.colorScheme.trim;
              ctx.lineWidth = 1.5;
              ctx.strokeRect(wx, wy, windowW, windowH);
              // Window pane cross
              ctx.beginPath();
              ctx.moveTo(wx + windowW / 2, wy);
              ctx.lineTo(wx + windowW / 2, wy + windowH);
              ctx.moveTo(wx, wy + windowH / 2);
              ctx.lineTo(wx + windowW, wy + windowH / 2);
              ctx.stroke();
            }

            // Floor numbers
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText(`${fl.floorNumber}F`, fl.x + 4, fl.y + 9);
          });

          // Render Dropping / Suspended Floor
          const df = droppingFloorRef.current;
          const dropX = df.isDropping ? df.x : craneXRef.current;
          const dropY = df.isDropping ? df.y : 70 + camY;

          // Construction Crane Cable
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(dropX + FLOOR_WIDTH / 2, -200);
          ctx.lineTo(dropX + FLOOR_WIDTH / 2, dropY);
          ctx.stroke();

          // Cable Hook / Crane Gripper
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(dropX + FLOOR_WIDTH / 2 - 12, dropY - 8, 24, 8);

          // Suspended Building Floor
          ctx.fillStyle = df.colorScheme.wall;
          ctx.fillRect(dropX, dropY, df.width, df.height);
          ctx.strokeStyle = df.colorScheme.trim;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(dropX, dropY, df.width, df.height);

          // Windows on suspended floor
          for (let wi = 0; wi < 4; wi++) {
            const wx = dropX + 10 + wi * 32;
            const wy = dropY + 11;
            ctx.fillStyle = df.colorScheme.window;
            ctx.fillRect(wx, wy, 16, 20);
            ctx.strokeStyle = df.colorScheme.trim;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(wx, wy, 16, 20);
          }

          // Particles
          particlesRef.current.forEach((pt) => {
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
            ctx.fill();
          });

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameState, highScore, onScoreUpdate]);

  // Key controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', ' ', 'ArrowDown'].includes(e.key) || e.code === 'Space') {
        e.preventDefault();
        dropFloor();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dropFloor]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-2 sm:p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[480px] flex items-center justify-between mb-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 text-sm shadow">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Floors:</span>
          <span className="text-xl font-black font-mono text-cyan-400">{score}</span>
        </div>

        {perfectCombo > 1 && (
          <div className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-extrabold text-xs animate-bounce shadow">
            Combo: {perfectCombo}x!
          </div>
        )}

        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
          <Trophy className="w-4 h-4" />
          <span className="text-xs font-bold text-slate-400">Best:</span>
          <span className="font-mono text-base">{highScore}</span>
        </div>

        <button
          onClick={startNewGame}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          title="Restart"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Viewport */}
      <div
        onClick={dropFloor}
        className="relative w-full max-w-[480px] aspect-[4/3] max-h-[440px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-sky-200 flex items-center justify-center cursor-pointer touch-none"
      >
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full block" />

        {/* Perfect Alignment Pop-up Banner */}
        {showPerfectBanner && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 px-6 py-2 rounded-2xl font-black text-lg tracking-wider shadow-2xl animate-bounce border-2 border-white pointer-events-none z-10 flex items-center gap-2">
            <Sparkles className="w-5 h-5 fill-current" />
            <span>{showPerfectBanner}</span>
          </div>
        )}

        {/* Start / Game Over Overlay */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            {gameState === 'idle' && (
              <>
                <div className="w-16 h-16 mb-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-wide mb-1">
                  Tower Stack Skyscraper
                </h3>
                <p className="text-xs text-slate-300 max-w-xs mb-5">
                  Drop building floors from the crane! Align them with precision to trigger <b>PERFECT</b> combos and build the tallest skyscraper!
                </p>
                <button
                  onClick={startNewGame}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-sm"
                >
                  START BUILDING
                </button>
              </>
            )}

            {gameState === 'gameover' && (
              <>
                <div className="w-14 h-14 mb-2 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-lg">
                  <RotateCcw className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-rose-400 mb-1">TOWER COLLAPSED!</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Floors Constructed: <span className="font-bold text-white font-mono">{score}</span> | Best: <span className="font-bold text-amber-400 font-mono">{highScore}</span>
                </p>
                <button
                  onClick={startNewGame}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Build Again
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="text-[11px] text-slate-400 mt-2 text-center">
        Tap screen, click, or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Space</kbd> to drop the floor!
      </div>
    </div>
  );
};
