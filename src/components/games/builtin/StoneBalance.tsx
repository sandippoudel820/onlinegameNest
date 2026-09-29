import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { RotateCcw, RotateCw, Sparkles, Trophy } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

interface StoneData {
  id: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  name: string;
  shapePoints: { x: number; y: number }[];
  defaultGroundX: number;
  defaultGroundY: number;
}

interface ActiveStone {
  data: StoneData;
  x: number;
  y: number;
  vy: number;
  rotation: number;
  angularVy: number;
  isDragging: boolean;
  isStacked: boolean;
  isFalling: boolean;
  settlingFrames?: number;
}

export const StoneBalance: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stone count mode: 3, 5, 7, 10
  const [targetCount, setTargetCount] = useState<3 | 5 | 7 | 10>(5);
  const [stones, setStones] = useState<ActiveStone[]>([]);
  const [draggedStoneId, setDraggedStoneId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [balanceTimer, setBalanceTimer] = useState<number | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('Pick a flat stone from the ground to begin stacking');

  // Canvas geometry constants
  const CANVAS_WIDTH = 560;
  const CANVAS_HEIGHT = 440;
  const BASE_X = 280;
  const BASE_Y = 360;
  const BASE_WIDTH = 190;
  const BASE_HEIGHT = 56;
  const GROUND_Y = 405;

  // Generate flat natural river stones scattered along the ground banks
  const initStones = useCallback((count: number) => {
    const naturalPebbles = [
      { fill: '#64748b', border: '#475569', name: 'River Slate' },
      { fill: '#78716c', border: '#57534e', name: 'Flat Granite' },
      { fill: '#52525b', border: '#3f3f46', name: 'Basalt Slab' },
      { fill: '#a8a29e', border: '#78716c', name: 'Sandstone Pebble' },
      { fill: '#71717a', border: '#52525b', name: 'Grey Shale' },
      { fill: '#6b7280', border: '#4b5563', name: 'Creek Stone' },
      { fill: '#94a3b8', border: '#64748b', name: 'Smooth Quartz' },
    ];

    const newStones: ActiveStone[] = [];

    // Left ground scatter zone: x: 45 to 170
    // Right ground scatter zone: x: 390 to 515
    for (let i = 0; i < count; i++) {
      // Progressively sized flat river stones (wider than tall)
      const sizeFactor = 1 - (i / (count + 2)) * 0.48;
      const width = Math.round(96 * sizeFactor + (i % 2 === 0 ? 4 : -3));
      const height = Math.round(24 * sizeFactor + 4); // notably flat!
      const palette = naturalPebbles[i % naturalPebbles.length];

      // Generate organic flat river stone geometry with rounded edges
      const numPoints = 16;
      const shapePoints: { x: number; y: number }[] = [];
      for (let p = 0; p < numPoints; p++) {
        const angle = (p / numPoints) * Math.PI * 2;
        // Make top and bottom surfaces flattish
        const isTopOrBottom = Math.abs(Math.sin(angle)) > 0.45;
        const yFlat = isTopOrBottom ? 0.78 : 1.08;
        const radX = (width / 2) * (0.92 + Math.cos(angle * 2) * 0.06);
        const radY = (height / 2) * (0.86 + Math.sin(angle * 3) * 0.08) * yFlat;
        shapePoints.push({
          x: Math.cos(angle) * radX,
          y: Math.sin(angle) * radY,
        });
      }

      // Scatter cleanly onto ground on left or right bank
      const isLeft = i % 2 === 0;
      const sideIndex = Math.floor(i / 2);
      const groundX = isLeft
        ? 55 + sideIndex * 42 + (sideIndex % 2 === 0 ? 5 : -5)
        : 405 + sideIndex * 42 + (sideIndex % 2 === 0 ? -5 : 5);
      const groundY = GROUND_Y - height / 2 + (sideIndex % 2 === 0 ? 3 : -3);

      const stoneData: StoneData = {
        id: i + 1,
        width,
        height,
        color: palette.fill,
        borderColor: palette.border,
        name: palette.name,
        shapePoints,
        defaultGroundX: groundX,
        defaultGroundY: groundY,
      };

      newStones.push({
        data: stoneData,
        x: groundX,
        y: groundY,
        vy: 0,
        rotation: (Math.random() - 0.5) * 0.08,
        angularVy: 0,
        isDragging: false,
        isStacked: false,
        isFalling: false,
      });
    }

    return newStones;
  }, [GROUND_Y]);

  const resetGame = useCallback((cnt = targetCount) => {
    sound.unlockMobileAudio();
    const freshStones = initStones(cnt);
    setStones(freshStones);
    setDraggedStoneId(null);
    setIsWon(false);
    setBalanceTimer(null);
    setStatusMessage('Pick a flat stone from the ground to place it on top.');
    sound.playStoneClack();
  }, [targetCount, initStones]);

  useEffect(() => {
    resetGame(targetCount);
  }, [targetCount, resetGame]);

  // Rotate currently dragged stone to find the ideal flat resting angle
  const handleRotate = (angleDelta: number) => {
    sound.unlockMobileAudio();
    if (draggedStoneId !== null) {
      setStones((prev) =>
        prev.map((st) =>
          st.data.id === draggedStoneId
            ? { ...st, rotation: st.rotation + angleDelta }
            : st
        )
      );
      sound.playBounce();
    }
  };

  // Stacked stones sorted from bottom to top (highest Y on screen = lowest stone)
  const stackedStones = stones
    .filter((s) => s.isStacked && !s.isDragging && !s.isFalling)
    .sort((a, b) => b.y - a.y);

  // Stability evaluation for cairn equilibrium
  const evaluateStability = useCallback(() => {
    const stacked = stones
      .filter((s) => s.isStacked && !s.isDragging && !s.isFalling)
      .sort((a, b) => b.y - a.y);

    if (stacked.length === 0) return true;

    for (let i = 0; i < stacked.length; i++) {
      const current = stacked[i];
      const supportX = i === 0 ? BASE_X : stacked[i - 1].x;
      const supportWidth = i === 0 ? BASE_WIDTH * 0.72 : stacked[i - 1].data.width * 0.7;

      const offset = Math.abs(current.x - supportX);
      const maxAllowed = supportWidth / 2;

      // If stone leans past support base, it cannot hold equilibrium
      if (offset > maxAllowed + 2) {
        return false;
      }
    }
    return true;
  }, [stones, BASE_X, BASE_WIDTH]);

  // Main Real-Life Physics & Gravity Loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      setStones((prevStones) => {
        let hasChanges = false;
        const currentStacked = prevStones
          .filter((s) => s.isStacked && !s.isDragging && !s.isFalling)
          .sort((a, b) => b.y - a.y);

        const updated = prevStones.map((st) => {
          // If stone is currently falling under gravity
          if (st.isFalling && !st.isDragging) {
            hasChanges = true;
            const GRAVITY = 0.75;
            const nextVy = st.vy + GRAVITY;
            const nextY = st.y + nextVy;
            const nextRot = st.rotation + st.angularVy;

            // Check collision with the top of the cairn stack
            const highestStacked = currentStacked.length > 0
              ? currentStacked[currentStacked.length - 1]
              : null;

            const targetSupportX = highestStacked ? highestStacked.x : BASE_X;
            const targetSupportWidth = highestStacked
              ? highestStacked.data.width * 0.75
              : BASE_WIDTH * 0.75;
            const targetLandingY = highestStacked
              ? highestStacked.y - highestStacked.data.height / 2 - st.data.height / 2 + 1
              : BASE_Y - BASE_HEIGHT / 2 - st.data.height / 2 + 2;

            // Did the falling stone reach or cross the landing surface?
            if (st.y <= targetLandingY && nextY >= targetLandingY) {
              const offset = Math.abs(st.x - targetSupportX);

              // Check if center of mass lands within stable support area
              if (offset <= targetSupportWidth / 2 + 3) {
                // Lands stably on the stone!
                sound.playStoneClack();
                return {
                  ...st,
                  y: targetLandingY,
                  vy: 0,
                  angularVy: 0,
                  isFalling: false,
                  isStacked: true,
                  rotation: st.rotation * 0.6, // natural settling angle
                };
              } else if (offset <= targetSupportWidth / 2 + 24) {
                // Grazes edge -> topples and deflects off with rotational velocity!
                sound.playStoneClack();
                const deflectDir = st.x > targetSupportX ? 1 : -1;
                return {
                  ...st,
                  y: targetLandingY + 4,
                  vy: 2.2,
                  angularVy: deflectDir * 0.09,
                  x: st.x + deflectDir * 3,
                };
              }
            }

            // Check if stone hits the ground bank
            const groundLandingY = GROUND_Y - st.data.height / 2;
            if (nextY >= groundLandingY) {
              sound.playStoneClack();
              return {
                ...st,
                y: groundLandingY,
                vy: 0,
                angularVy: 0,
                isFalling: false,
                isStacked: false,
                rotation: 0,
              };
            }

            return {
              ...st,
              y: nextY,
              vy: nextVy,
              rotation: nextRot,
            };
          }

          // Check if any stacked stone lost support and must topple under gravity
          if (st.isStacked && !st.isDragging && !st.isFalling) {
            const index = currentStacked.findIndex((s) => s.data.id === st.data.id);
            if (index !== -1) {
              const supportX = index === 0 ? BASE_X : currentStacked[index - 1]?.x ?? BASE_X;
              const supportWidth =
                index === 0
                  ? BASE_WIDTH * 0.72
                  : (currentStacked[index - 1]?.data.width ?? BASE_WIDTH) * 0.7;

              const offset = st.x - supportX;
              if (Math.abs(offset) > supportWidth / 2 + 3) {
                // Center of gravity exceeded support -> topple with gravity!
                sound.playStoneClack();
                hasChanges = true;
                return {
                  ...st,
                  isStacked: false,
                  isFalling: true,
                  vy: 1.2,
                  angularVy: offset > 0 ? 0.07 : -0.07,
                };
              }
            }
          }

          return st;
        });

        return hasChanges ? updated : prevStones;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [BASE_X, BASE_WIDTH, BASE_HEIGHT, GROUND_Y]);

  // 3-second harmony equilibrium timer
  useEffect(() => {
    const stackedCount = stackedStones.length;
    const isStable = evaluateStability();

    if (stackedCount === targetCount && isStable && !isWon) {
      if (balanceTimer === null) {
        setBalanceTimer(3);
        setStatusMessage('Holding balance... 3 seconds to Zen Harmony!');
      }
    } else if (stackedCount < targetCount || !isStable) {
      if (balanceTimer !== null && !isWon) {
        setBalanceTimer(null);
        setStatusMessage(`Stacked ${stackedCount} of ${targetCount} stones.`);
      }
    }
  }, [stackedStones.length, targetCount, evaluateStability, isWon, balanceTimer]);

  useEffect(() => {
    if (balanceTimer === null || isWon) return;
    if (balanceTimer > 0) {
      const tid = setTimeout(() => {
        setBalanceTimer((prev) => (prev !== null ? prev - 1 : null));
        sound.playNote(440 + (3 - balanceTimer) * 110);
      }, 1000);
      return () => clearTimeout(tid);
    } else if (balanceTimer === 0) {
      setIsWon(true);
      sound.playZenChime();
      setStatusMessage('Zen Harmony Achieved! Beautiful balance.');
      onScoreUpdate?.(targetCount * 300);
    }
  }, [balanceTimer, isWon, targetCount, onScoreUpdate]);

  // Pointer event handlers for natural picking and placing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    sound.unlockMobileAudio();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const cy = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // Pick top visual stone (reverse order search)
    const stonesReversed = [...stones].reverse();
    for (const st of stonesReversed) {
      const dx = cx - st.x;
      const dy = cy - st.y;
      if (Math.abs(dx) <= st.data.width / 2 + 8 && Math.abs(dy) <= st.data.height / 2 + 10) {
        setDraggedStoneId(st.data.id);
        setDragOffset({ x: dx, y: dy });
        sound.playBounce();
        setStatusMessage(`Picked up ${st.data.name}. Place it on the cairn!`);

        // If the stone was already part of the stack, remove it and let upper stones topple if unsupported
        setStones((prev) =>
          prev.map((s) =>
            s.data.id === st.data.id
              ? { ...s, isDragging: true, isStacked: false, isFalling: false, vy: 0, angularVy: 0 }
              : s
          )
        );
        break;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggedStoneId === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * canvas.width - dragOffset.x;
    const cy = ((e.clientY - rect.top) / rect.height) * canvas.height - dragOffset.y;

    setStones((prev) =>
      prev.map((st) =>
        st.data.id === draggedStoneId ? { ...st, x: cx, y: cy } : st
      )
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggedStoneId === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dropX = ((e.clientX - rect.left) / rect.width) * canvas.width - dragOffset.x;
    const dropY = ((e.clientY - rect.top) / rect.height) * canvas.height - dragOffset.y;

    const currentStone = stones.find((s) => s.data.id === draggedStoneId);
    if (!currentStone) {
      setDraggedStoneId(null);
      return;
    }

    // Existing stacked stones
    const existingStacked = stones
      .filter((s) => s.isStacked && s.data.id !== draggedStoneId)
      .sort((a, b) => b.y - a.y);

    const highestStone = existingStacked.length > 0 ? existingStacked[existingStacked.length - 1] : null;
    const targetSupportX = highestStone ? highestStone.x : BASE_X;
    const targetSupportWidth = highestStone ? highestStone.data.width * 0.75 : BASE_WIDTH * 0.75;
    const targetLandingY = highestStone
      ? highestStone.y - highestStone.data.height / 2 - currentStone.data.height / 2 + 1
      : BASE_Y - BASE_HEIGHT / 2 - currentStone.data.height / 2 + 2;

    const isOverStackColumn = Math.abs(dropX - targetSupportX) <= targetSupportWidth / 2 + 35;

    // In real life, GRAVITY takes over upon release!
    if (isOverStackColumn && dropY <= targetLandingY + 15) {
      // Released above the cairn stack -> Fall under gravity onto top stone
      setStones((prev) =>
        prev.map((st) =>
          st.data.id === draggedStoneId
            ? {
                ...st,
                x: dropX,
                y: dropY,
                isDragging: false,
                isStacked: false,
                isFalling: true,
                vy: 1.5, // initial downward gravity pull
                angularVy: 0,
              }
            : st
        )
      );
    } else {
      // Released in the air or over ground -> Drops under gravity down to ground bank
      setStones((prev) =>
        prev.map((st) =>
          st.data.id === draggedStoneId
            ? {
                ...st,
                x: dropX,
                y: dropY,
                isDragging: false,
                isStacked: false,
                isFalling: true,
                vy: 1.5,
                angularVy: 0,
              }
            : st
        )
      );
    }

    setDraggedStoneId(null);
  };

  // Canvas Drawing Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // 1. Serene Zen River & Mist Mountains Background
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#090d16');
      bg.addColorStop(0.5, '#1e293b');
      bg.addColorStop(1, '#0f172a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Distant mountain mist silhouette
      ctx.fillStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, 310);
      ctx.lineTo(130, 200);
      ctx.lineTo(270, 270);
      ctx.lineTo(430, 180);
      ctx.lineTo(w, 290);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Soft Zen Moon
      ctx.fillStyle = 'rgba(248, 250, 252, 0.08)';
      ctx.beginPath();
      ctx.arc(280, 140, 75, 0, Math.PI * 2);
      ctx.fill();

      // River Water Surface
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 372, w, 68);

      // Ripples around base rock
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.lineWidth = 1.5;
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.ellipse(BASE_X, BASE_Y + 32, BASE_WIDTH * 0.72 + r * 26, 14 + r * 4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Left & Right Ground Banks for Scattered Stones
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(95, 412, 115, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(465, 412, 115, 34, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bank river pebbles texture
      ctx.fillStyle = '#475569';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.ellipse(40 + i * 26, 420 + (i % 2) * 5, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(410 + i * 26, 420 + (i % 2) * 5, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Foundational Natural Big Boulder in Center
      ctx.save();
      ctx.translate(BASE_X, BASE_Y);

      // Boulder Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(0, 24, BASE_WIDTH / 2 + 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Granite Boulder Body
      const baseGrad = ctx.createLinearGradient(0, -BASE_HEIGHT / 2, 0, BASE_HEIGHT / 2);
      baseGrad.addColorStop(0, '#475569');
      baseGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = baseGrad;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-BASE_WIDTH / 2, -BASE_HEIGHT / 2, BASE_WIDTH, BASE_HEIGHT, [30, 30, 12, 12]);
      ctx.fill();
      ctx.stroke();

      // Natural granite stone cracks and grain
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-BASE_WIDTH * 0.35, -2);
      ctx.lineTo(-BASE_WIDTH * 0.1, 4);
      ctx.lineTo(BASE_WIDTH * 0.2, 0);
      ctx.stroke();

      // Subtle guide line on flat boulder top
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(-BASE_WIDTH * 0.35, -BASE_HEIGHT / 2 + 2);
      ctx.lineTo(BASE_WIDTH * 0.35, -BASE_HEIGHT / 2 + 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

      // 3. Draw All Flat Stones (Scattered on Ground, Stacked, Falling, or Dragged)
      // Sort so dragged and falling stones render on top visually
      const sortedStones = [...stones].sort((a, b) => {
        if (a.isDragging) return 1;
        if (b.isDragging) return -1;
        if (a.isFalling) return 1;
        if (b.isFalling) return -1;
        return a.y - b.y;
      });

      sortedStones.forEach((st) => {
        ctx.save();
        ctx.translate(st.x, st.y);
        ctx.rotate(st.rotation);

        // Soft contact shadow under stone
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, st.data.height / 2 + 3, st.data.width / 2, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dragging / Active aura
        if (st.isDragging) {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 18;
        }

        // Realistic flat stone surface gradient
        const grad = ctx.createLinearGradient(0, -st.data.height / 2, 0, st.data.height / 2);
        grad.addColorStop(0, st.data.color);
        grad.addColorStop(1, st.data.borderColor);
        ctx.fillStyle = grad;
        ctx.strokeStyle = st.isDragging ? '#38bdf8' : st.data.borderColor;
        ctx.lineWidth = 2.4;

        // Draw flat smooth organic pebble shape
        ctx.beginPath();
        const pts = st.data.shapePoints;
        if (pts.length > 0) {
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            const xc = (pts[i].x + pts[(i + 1) % pts.length].x) / 2;
            const yc = (pts[i].y + pts[(i + 1) % pts.length].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
          }
          ctx.closePath();
        }
        ctx.fill();
        ctx.stroke();

        // Realistic flat stone strata / horizontal river sheen
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -st.data.height * 0.25, st.data.width * 0.35, Math.PI * 0.85, Math.PI * 0.15, true);
        ctx.stroke();

        // Number badge on stones resting on the ground
        if (!st.isStacked && !st.isDragging && !st.isFalling) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${st.data.id}`, 0, 0.5);
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [stones, BASE_X, BASE_Y, BASE_WIDTH, BASE_HEIGHT]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-2 sm:p-3 select-none">
      {/* Top HUD with Selectable Stone Count */}
      <div className="w-full max-w-[560px] flex flex-wrap items-center justify-between gap-2 mb-2 px-3 py-2 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 text-xs shadow">
        {/* Stone count selector */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px] hidden sm:inline">
            Stones to Balance:
          </span>
          {([3, 5, 7, 10] as const).map((cnt) => (
            <button
              key={cnt}
              onClick={() => {
                setTargetCount(cnt);
                resetGame(cnt);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                targetCount === cnt
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cnt} Stones
            </button>
          ))}
        </div>

        {/* Stack progress */}
        <div className="flex items-center gap-3">
          <div className="font-mono font-bold text-slate-200">
            Stacked: <span className="text-cyan-400">{stackedStones.length}</span> / {targetCount}
          </div>

          <button
            onClick={() => resetGame(targetCount)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Reset Stones to Ground"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative w-full max-w-[560px] aspect-[4/3] max-h-[440px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-slate-950 flex items-center justify-center touch-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
        />

        {/* Interactive Instruction Banner */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-[11px] text-slate-300 pointer-events-none shadow-lg">
          {statusMessage}
        </div>

        {/* 3-Second Harmony Countdown Timer */}
        {balanceTimer !== null && balanceTimer > 0 && (
          <div className="absolute top-12 right-4 bg-slate-900/95 border-2 border-cyan-400 px-4 py-2 rounded-xl text-center shadow-xl shadow-cyan-500/20 animate-pulse z-10">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Holding Harmony</span>
            <div className="text-2xl font-black font-mono text-cyan-400">{balanceTimer}s</div>
          </div>
        )}

        {/* Victory Zen Celebration */}
        {isWon && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            <div className="w-16 h-16 mb-3 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white mb-1 tracking-tight">
              Zen Equilibrium Achieved!
            </h3>
            <p className="text-xs text-slate-300 max-w-xs mb-5">
              All {targetCount} natural flat stones held in stable balance with natural gravity!
            </p>
            <button
              onClick={() => resetGame(targetCount)}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-xs"
            >
              Balance Another Cairn
            </button>
          </div>
        )}
      </div>

      {/* Angle Adjustment & Status Controls */}
      <div className="w-full max-w-[560px] flex items-center justify-between gap-3 mt-3 px-2">
        <div className="text-[11px] text-slate-400">
          {draggedStoneId !== null
            ? 'Dragging stone... release above cairn to drop with gravity!'
            : 'Click & drag flat stones from ground. Stack one atop another!'}
        </div>

        {/* Rotate buttons to adjust stone balance angle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Tilt:</span>
          <button
            onClick={() => handleRotate(-0.12)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 active:scale-95 text-slate-200 transition shadow"
            title="Tilt Left"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleRotate(0.12)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 active:scale-95 text-slate-200 transition shadow"
            title="Tilt Right"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
