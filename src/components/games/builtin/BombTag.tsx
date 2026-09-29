import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { Play, RotateCcw, Trophy, Zap, Flame, ShieldAlert, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

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
  hasBomb: boolean;
  tagImmunityTimer: number; // Prevent immediate tag back
  dashCooldown: number; // in seconds
  isDashing: boolean;
  dashTimer: number;
  facingAngle: number;
  roundsWon: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

interface Bumper {
  x: number;
  y: number;
  radius: number;
  pulse: number;
}

interface SpeedPad {
  x: number;
  y: number;
  w: number;
  h: number;
  dirX: number;
  dirY: number;
}

export const BombTag: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'playing' | 'round_end' | 'match_end'>('menu');
  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [bombTimeLeft, setBombTimeLeft] = useState<number>(18);
  const [p1Wins, setP1Wins] = useState<number>(0);
  const [p2Wins, setP2Wins] = useState<number>(0);
  const [roundWinnerMsg, setRoundWinnerMsg] = useState<string>('');
  const [matchWinner, setMatchWinner] = useState<1 | 2 | null>(null);

  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 440;
  const ROUNDS_TO_WIN = 3;
  const BOMB_ROUND_DURATION = 18; // 18 seconds per round

  const bombTimeRef = useRef<number>(BOMB_ROUND_DURATION);
  const lastTickSecondRef = useRef<number>(BOMB_ROUND_DURATION);
  const screenShakeRef = useRef<number>(0);

  const p1Ref = useRef<Player>({
    id: 1,
    x: 120,
    y: 220,
    vx: 0,
    vy: 0,
    radius: 18,
    color: '#06b6d4',
    glowColor: '#22d3ee',
    hasBomb: false,
    tagImmunityTimer: 0,
    dashCooldown: 0,
    isDashing: false,
    dashTimer: 0,
    facingAngle: 0,
    roundsWon: 0,
  });

  const p2Ref = useRef<Player>({
    id: 2,
    x: 520,
    y: 220,
    vx: 0,
    vy: 0,
    radius: 18,
    color: '#f43f5e',
    glowColor: '#fb7185',
    hasBomb: true,
    tagImmunityTimer: 0,
    dashCooldown: 0,
    isDashing: false,
    dashTimer: 0,
    facingAngle: Math.PI,
    roundsWon: 0,
  });

  const bumpersRef = useRef<Bumper[]>([
    { x: 130, y: 110, radius: 22, pulse: 0 },
    { x: 510, y: 110, radius: 22, pulse: 0 },
    { x: 130, y: 330, radius: 22, pulse: 0 },
    { x: 510, y: 330, radius: 22, pulse: 0 },
    { x: 320, y: 220, radius: 28, pulse: 0 }, // Center bumper
  ]);

  const speedPadsRef = useRef<SpeedPad[]>([
    { x: 230, y: 70, w: 60, h: 28, dirX: 1, dirY: 0 },
    { x: 350, y: 340, w: 60, h: 28, dirX: -1, dirY: 0 },
  ]);

  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const nextTextIdRef = useRef<number>(1);

  // Key states
  const keysRef = useRef<{
    p1Up: boolean;
    p1Down: boolean;
    p1Left: boolean;
    p1Right: boolean;
    p1Dash: boolean;
    p2Up: boolean;
    p2Down: boolean;
    p2Left: boolean;
    p2Right: boolean;
    p2Dash: boolean;
  }>({
    p1Up: false,
    p1Down: false,
    p1Left: false,
    p1Right: false,
    p1Dash: false,
    p2Up: false,
    p2Down: false,
    p2Left: false,
    p2Right: false,
    p2Dash: false,
  });

  // Touch control helper
  const setTouchKey = (key: keyof typeof keysRef.current, state: boolean) => {
    keysRef.current[key] = state;
    if (state && (key === 'p1Dash' || key === 'p2Dash')) {
      triggerDash(key === 'p1Dash' ? 1 : 2);
    }
  };

  const triggerDash = (playerId: 1 | 2) => {
    const player = playerId === 1 ? p1Ref.current : p2Ref.current;
    if (player.dashCooldown <= 0 && !player.isDashing) {
      player.isDashing = true;
      player.dashTimer = 0.22; // 220ms burst
      player.dashCooldown = 2.8; // 2.8s cooldown
      sound.playDash();

      // Dash direction: towards current facing angle
      const dashSpeed = 11;
      player.vx = Math.cos(player.facingAngle) * dashSpeed;
      player.vy = Math.sin(player.facingAngle) * dashSpeed;

      // Add dash smoke/energy particles
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push({
          x: player.x,
          y: player.y,
          vx: -Math.cos(player.facingAngle) * (Math.random() * 4 + 2) + (Math.random() - 0.5) * 2,
          vy: -Math.sin(player.facingAngle) * (Math.random() * 4 + 2) + (Math.random() - 0.5) * 2,
          color: player.glowColor,
          size: Math.random() * 5 + 3,
          life: 0.35,
          maxLife: 0.35,
        });
      }

      addFloatingText(player.x, player.y - 25, 'DASH! ⚡', player.glowColor);
    }
  };

  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      id: nextTextIdRef.current++,
      x,
      y,
      text,
      color,
      life: 0.8,
    });
  };

  // Start new match
  const startMatch = () => {
    sound.unlockMobileAudio();
    sound.playEat();
    p1Ref.current.roundsWon = 0;
    p2Ref.current.roundsWon = 0;
    setP1Wins(0);
    setP2Wins(0);
    setMatchWinner(null);
    startRound(1);
  };

  // Start round
  const startRound = (roundNum: number) => {
    // Reset positions
    p1Ref.current.x = 120;
    p1Ref.current.y = 220;
    p1Ref.current.vx = 0;
    p1Ref.current.vy = 0;
    p1Ref.current.isDashing = false;
    p1Ref.current.dashCooldown = 0;
    p1Ref.current.tagImmunityTimer = 0;
    p1Ref.current.facingAngle = 0;

    p2Ref.current.x = 520;
    p2Ref.current.y = 220;
    p2Ref.current.vx = 0;
    p2Ref.current.vy = 0;
    p2Ref.current.isDashing = false;
    p2Ref.current.dashCooldown = 0;
    p2Ref.current.tagImmunityTimer = 0;
    p2Ref.current.facingAngle = Math.PI;

    // Randomize initial bomb holder or alternate
    const p1HoldsBomb = roundNum % 2 === 1 ? Math.random() > 0.5 : !p1Ref.current.hasBomb;
    p1Ref.current.hasBomb = p1HoldsBomb;
    p2Ref.current.hasBomb = !p1HoldsBomb;

    bombTimeRef.current = BOMB_ROUND_DURATION;
    lastTickSecondRef.current = BOMB_ROUND_DURATION;
    setBombTimeLeft(BOMB_ROUND_DURATION);
    particlesRef.current = [];
    floatingTextsRef.current = [];

    // Start 3-second countdown
    setGameState('countdown');
    setCountdownNum(3);
    sound.playCountdownBeep(false);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNum(count);
        sound.playCountdownBeep(false);
      } else if (count === 0) {
        setCountdownNum(0);
        sound.playCountdownBeep(true);
      } else {
        clearInterval(interval);
        setGameState('playing');
      }
    }, 850);
  };

  // Explode round
  const triggerExplosion = useCallback(() => {
    setGameState('round_end');
    sound.playExplosion();
    screenShakeRef.current = 18;

    const explodedPlayer = p1Ref.current.hasBomb ? p1Ref.current : p2Ref.current;
    const survivingPlayer = p1Ref.current.hasBomb ? p2Ref.current : p1Ref.current;

    // Award point to survivor
    survivingPlayer.roundsWon++;
    setP1Wins(p1Ref.current.roundsWon);
    setP2Wins(p2Ref.current.roundsWon);
    onScoreUpdate?.(survivingPlayer.roundsWon * 100);

    // Big blast particles
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      particlesRef.current.push({
        x: explodedPlayer.x,
        y: explodedPlayer.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: ['#ef4444', '#f97316', '#facc15', '#ffffff'][Math.floor(Math.random() * 4)],
        size: Math.random() * 7 + 4,
        life: 0.9,
        maxLife: 0.9,
      });
    }

    addFloatingText(explodedPlayer.x, explodedPlayer.y - 30, '💥 BOOM!', '#ef4444');

    const msg =
      survivingPlayer.id === 1
        ? 'P2 EXPLODED! Point to PLAYER 1 (Cyan)!'
        : 'P1 EXPLODED! Point to PLAYER 2 (Rose)!';
    setRoundWinnerMsg(msg);

    // Check if match won
    if (survivingPlayer.roundsWon >= ROUNDS_TO_WIN) {
      setTimeout(() => {
        setGameState('match_end');
        setMatchWinner(survivingPlayer.id);
        sound.playWin();
      }, 1800);
    } else {
      setTimeout(() => {
        startRound(p1Ref.current.roundsWon + p2Ref.current.roundsWon + 1);
      }, 2200);
    }
  }, [ROUNDS_TO_WIN, onScoreUpdate]);

  // Main Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // cap delta time to 50ms
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(loop);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(loop);
        return;
      }

      // Screen shake decay
      let shakeX = 0;
      let shakeY = 0;
      if (screenShakeRef.current > 0) {
        shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 25);
      }

      // Physics and game update if playing
      if (gameState === 'playing') {
        // Bomb countdown timer
        bombTimeRef.current -= dt;
        if (bombTimeRef.current <= 0) {
          bombTimeRef.current = 0;
          setBombTimeLeft(0);
          triggerExplosion();
        } else {
          setBombTimeLeft(Math.ceil(bombTimeRef.current));

          // Audio ticking
          const currentSec = Math.ceil(bombTimeRef.current);
          if (currentSec !== lastTickSecondRef.current) {
            lastTickSecondRef.current = currentSec;
            sound.playBombTick(currentSec <= 5);
          }
        }

        // Update players
        const p1 = p1Ref.current;
        const p2 = p2Ref.current;
        const keys = keysRef.current;

        // Player 1 input
        let p1InputX = 0;
        let p1InputY = 0;
        if (keys.p1Up) p1InputY -= 1;
        if (keys.p1Down) p1InputY += 1;
        if (keys.p1Left) p1InputX -= 1;
        if (keys.p1Right) p1InputX += 1;

        // Player 2 input
        let p2InputX = 0;
        let p2InputY = 0;
        if (keys.p2Up) p2InputY -= 1;
        if (keys.p2Down) p2InputY += 1;
        if (keys.p2Left) p2InputX -= 1;
        if (keys.p2Right) p2InputX += 1;

        // Move player helper
        const updatePlayer = (p: Player, ix: number, iy: number) => {
          // Cooldown updates
          if (p.dashCooldown > 0) p.dashCooldown = Math.max(0, p.dashCooldown - dt);
          if (p.tagImmunityTimer > 0) p.tagImmunityTimer = Math.max(0, p.tagImmunityTimer - dt);

          if (p.isDashing) {
            p.dashTimer -= dt;
            if (p.dashTimer <= 0) {
              p.isDashing = false;
            }
          } else {
            // Base speed: tagger gets slight speed advantage to keep chases tight and fun
            const baseSpeed = p.hasBomb ? 4.6 : 4.2;
            const len = Math.hypot(ix, iy);
            if (len > 0) {
              const nx = ix / len;
              const ny = iy / len;
              p.vx = nx * baseSpeed;
              p.vy = ny * baseSpeed;
              p.facingAngle = Math.atan2(ny, nx);
            } else {
              // Apply friction
              p.vx *= 0.85;
              p.vy *= 0.85;
            }
          }

          // Move
          p.x += p.vx;
          p.y += p.vy;

          // Arena boundary collision with bounce
          const pad = p.radius + 14;
          if (p.x < pad) {
            p.x = pad;
            p.vx = Math.abs(p.vx) * 0.5;
          }
          if (p.x > CANVAS_WIDTH - pad) {
            p.x = CANVAS_WIDTH - pad;
            p.vx = -Math.abs(p.vx) * 0.5;
          }
          if (p.y < pad + 30) {
            p.y = pad + 30;
            p.vy = Math.abs(p.vy) * 0.5;
          }
          if (p.y > CANVAS_HEIGHT - pad) {
            p.y = CANVAS_HEIGHT - pad;
            p.vy = -Math.abs(p.vy) * 0.5;
          }

          // Bumpers interaction
          bumpersRef.current.forEach((bumper) => {
            const dx = p.x - bumper.x;
            const dy = p.y - bumper.y;
            const dist = Math.hypot(dx, dy);
            const minDist = p.radius + bumper.radius;
            if (dist < minDist) {
              // Elastic rebound
              const angle = Math.atan2(dy, dx);
              const overlap = minDist - dist;
              p.x += Math.cos(angle) * overlap;
              p.y += Math.sin(angle) * overlap;
              p.vx = Math.cos(angle) * 8.5;
              p.vy = Math.sin(angle) * 8.5;
              bumper.pulse = 1;
              sound.playHit();
            }
          });

          // Speed pads interaction
          speedPadsRef.current.forEach((pad) => {
            if (
              p.x > pad.x &&
              p.x < pad.x + pad.w &&
              p.y > pad.y &&
              p.y < pad.y + pad.h
            ) {
              p.vx += pad.dirX * 3.5;
              p.vy += pad.dirY * 3.5;
              // Particles
              if (Math.random() < 0.4) {
                particlesRef.current.push({
                  x: p.x,
                  y: p.y,
                  vx: -pad.dirX * 2,
                  vy: -pad.dirY * 2,
                  color: '#facc15',
                  size: 3,
                  life: 0.25,
                  maxLife: 0.25,
                });
              }
            }
          });
        };

        updatePlayer(p1, p1InputX, p1InputY);
        updatePlayer(p2, p2InputX, p2InputY);

        // Tag collision check
        const pDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const tagDist = p1.radius + p2.radius + 6;

        if (pDist < tagDist) {
          // Only tag if tagger has no immunity
          const tagger = p1.hasBomb ? p1 : p2;
          const target = p1.hasBomb ? p2 : p1;

          if (tagger.tagImmunityTimer <= 0) {
            // TRANSFER THE BOMB!
            tagger.hasBomb = false;
            target.hasBomb = true;

            // Immunity to target so they can run away for 0.75s
            target.tagImmunityTimer = 0.75;
            sound.playTag();
            screenShakeRef.current = 8;

            // Bounce players slightly apart on tag
            const angle = Math.atan2(target.y - tagger.y, target.x - tagger.x);
            target.vx = Math.cos(angle) * 6;
            target.vy = Math.sin(angle) * 6;
            tagger.vx = -Math.cos(angle) * 3;
            tagger.vy = -Math.sin(angle) * 3;

            // Tag burst particles
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            for (let i = 0; i < 18; i++) {
              const a = Math.random() * Math.PI * 2;
              const spd = Math.random() * 5 + 2;
              particlesRef.current.push({
                x: midX,
                y: midY,
                vx: Math.cos(a) * spd,
                vy: Math.sin(a) * spd,
                color: '#f43f5e',
                size: 4,
                life: 0.4,
                maxLife: 0.4,
              });
            }

            addFloatingText(midX, midY - 20, 'TAGGED! 🔥', '#ef4444');
          }
        }
      }

      // Update bumper animations
      bumpersRef.current.forEach((b) => {
        if (b.pulse > 0) b.pulse = Math.max(0, b.pulse - dt * 3);
      });

      // Update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Update floating texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const t = floatingTextsRef.current[i];
        t.y -= dt * 28;
        t.life -= dt;
        if (t.life <= 0) {
          floatingTextsRef.current.splice(i, 1);
        }
      }

      // --- RENDERING ---
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Arena background
      const bgGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      bgGrad.addColorStop(0, '#09090b');
      bgGrad.addColorStop(0.5, '#121218');
      bgGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Cyber grid lines
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.35;
      const gridSize = 40;
      for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // Outer Arena Border with Glowing Border
      const isUrgent = bombTimeRef.current <= 5 && gameState === 'playing';
      ctx.strokeStyle = isUrgent
        ? Math.sin(currentTime * 0.02) > 0
          ? '#ef4444'
          : '#7f1d1d'
        : '#3b82f6';
      ctx.lineWidth = 4;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = isUrgent ? 14 : 6;
      ctx.strokeRect(14, 34, CANVAS_WIDTH - 28, CANVAS_HEIGHT - 48);
      ctx.shadowBlur = 0;

      // Draw Speed Boost Pads
      speedPadsRef.current.forEach((pad) => {
        ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(pad.x, pad.y, pad.w, pad.h, 6);
        ctx.fill();
        ctx.stroke();

        // Arrow indicators
        ctx.fillStyle = '#facc15';
        const arrowDir = pad.dirX;
        ctx.beginPath();
        const cx = pad.x + pad.w / 2;
        const cy = pad.y + pad.h / 2;
        ctx.moveTo(cx + arrowDir * 12, cy);
        ctx.lineTo(cx - arrowDir * 8, cy - 7);
        ctx.lineTo(cx - arrowDir * 8, cy + 7);
        ctx.closePath();
        ctx.fill();
      });

      // Draw Bumpers
      bumpersRef.current.forEach((bumper) => {
        ctx.save();
        ctx.beginPath();
        const r = bumper.radius + bumper.pulse * 6;
        ctx.arc(bumper.x, bumper.y, r, 0, Math.PI * 2);
        ctx.fillStyle = bumper.pulse > 0 ? '#38bdf8' : '#1e293b';
        ctx.fill();
        ctx.strokeStyle = bumper.pulse > 0 ? '#ffffff' : '#0284c7';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(bumper.x, bumper.y, r * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
        ctx.restore();
      });

      // Draw Players
      const renderPlayer = (p: Player) => {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Immunity flash if just tagged
        if (p.tagImmunityTimer > 0 && Math.sin(currentTime * 0.05) > 0) {
          ctx.beginPath();
          ctx.arc(0, 0, p.radius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Dash trail effect
        if (p.isDashing) {
          ctx.beginPath();
          ctx.arc(
            -Math.cos(p.facingAngle) * 12,
            -Math.sin(p.facingAngle) * 12,
            p.radius * 0.8,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = p.glowColor;
          ctx.globalAlpha = 0.4;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Tagger Danger Halo Aura
        if (p.hasBomb) {
          const auraPulse = Math.sin(currentTime * 0.015) * 6;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius + 10 + auraPulse, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Main Player Body
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Eyes (looking in facing direction)
        const eyeOffset = 6;
        const eyeAngle = p.facingAngle;
        const ex1 = Math.cos(eyeAngle + 0.5) * eyeOffset;
        const ey1 = Math.sin(eyeAngle + 0.5) * eyeOffset;
        const ex2 = Math.cos(eyeAngle - 0.5) * eyeOffset;
        const ey2 = Math.sin(eyeAngle - 0.5) * eyeOffset;

        // Big animated cartoon eyes
        const eyeRadius = p.hasBomb ? 4.5 : 3.5;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ex1, ey1, eyeRadius, 0, Math.PI * 2);
        ctx.arc(ex2, ey2, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = p.hasBomb ? '#ef4444' : '#000000';
        ctx.beginPath();
        ctx.arc(ex1 + Math.cos(eyeAngle) * 1.5, ey1 + Math.sin(eyeAngle) * 1.5, 1.8, 0, Math.PI * 2);
        ctx.arc(ex2 + Math.cos(eyeAngle) * 1.5, ey2 + Math.sin(eyeAngle) * 1.5, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Player Tag text (P1 / P2)
        ctx.fillStyle = p.color === '#06b6d4' ? '#22d3ee' : '#fb7185';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.id === 1 ? 'P1' : 'P2', 0, p.hasBomb ? 30 : -25);

        // BOMB ATTACHED ON HEAD (If player has bomb)
        if (p.hasBomb) {
          const bombBob = Math.sin(currentTime * 0.01) * 3;
          ctx.save();
          ctx.translate(0, -32 + bombBob);

          // Bomb body
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fillStyle = '#18181b';
          ctx.fill();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Cap & Fuse
          ctx.fillStyle = '#71717a';
          ctx.fillRect(-3, -18, 6, 4);

          // Burning curved fuse
          ctx.beginPath();
          ctx.moveTo(0, -18);
          ctx.quadraticCurveTo(8, -26, 4, -30);
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Fuse spark
          const sparkSize = Math.random() * 4 + 4;
          ctx.beginPath();
          ctx.arc(4, -30, sparkSize, 0, Math.PI * 2);
          ctx.fillStyle = '#fef08a';
          ctx.fill();

          // Active countdown digit on bomb
          ctx.fillStyle = '#ef4444';
          ctx.font = '900 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${Math.max(1, Math.ceil(bombTimeRef.current))}`, 0, 4);

          ctx.restore();
        }

        // Dash cooldown meter under player
        if (p.dashCooldown > 0) {
          const barW = 28;
          const barH = 4;
          const progress = 1 - p.dashCooldown / 2.8;
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(-barW / 2, 22, barW, barH);
          ctx.fillStyle = p.glowColor;
          ctx.fillRect(-barW / 2, 22, barW * progress, barH);
        }

        ctx.restore();
      };

      renderPlayer(p1Ref.current);
      renderPlayer(p2Ref.current);

      // Render Particles
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fill();
        ctx.restore();
      });

      // Render Floating Texts
      floatingTextsRef.current.forEach((t) => {
        ctx.save();
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = t.color;
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.min(1, t.life * 1.5);
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      });

      // --- TOP HUD BAR ---
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, 34);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 34);
      ctx.lineTo(CANVAS_WIDTH, 34);
      ctx.stroke();

      // P1 Score (Cyan)
      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`P1 (CYAN): ${p1Ref.current.roundsWon} / ${ROUNDS_TO_WIN} WINS`, 16, 22);

      // P2 Score (Rose)
      ctx.fillStyle = '#fb7185';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`P2 (ROSE): ${p2Ref.current.roundsWon} / ${ROUNDS_TO_WIN} WINS`, CANVAS_WIDTH - 16, 22);

      // Center Bomb Timer
      ctx.fillStyle = isUrgent ? '#ef4444' : '#facc15';
      ctx.font = '900 15px monospace';
      ctx.textAlign = 'center';
      const timeStr = gameState === 'playing' ? `${Math.ceil(bombTimeRef.current)}s` : '18s';
      ctx.fillText(`💣 BOMB: ${timeStr}`, CANVAS_WIDTH / 2, 22);

      // Countdown Overlay
      if (gameState === 'countdown') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 34, CANVAS_WIDTH, CANVAS_HEIGHT - 34);

        ctx.font = '900 64px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = countdownNum === 0 ? '#10b981' : '#f59e0b';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 20;
        ctx.fillText(
          countdownNum === 0 ? 'RUN!' : `${countdownNum}`,
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2 + 10
        );
        ctx.shadowBlur = 0;

        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#e2e8f0';
        const taggerName = p1Ref.current.hasBomb ? 'PLAYER 1 (Cyan)' : 'PLAYER 2 (Rose)';
        ctx.fillText(`${taggerName} has the Bomb!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 55);
      }

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, triggerExplosion]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      // P1 controls (WASD + Space/Shift for Dash)
      if (e.code === 'KeyW') keysRef.current.p1Up = true;
      if (e.code === 'KeyS') keysRef.current.p1Down = true;
      if (e.code === 'KeyA') keysRef.current.p1Left = true;
      if (e.code === 'KeyD') keysRef.current.p1Right = true;
      if (e.code === 'Space' || e.code === 'ShiftLeft') {
        triggerDash(1);
      }

      // P2 controls (Arrows + Enter/Slash for Dash)
      if (e.code === 'ArrowUp') keysRef.current.p2Up = true;
      if (e.code === 'ArrowDown') keysRef.current.p2Down = true;
      if (e.code === 'ArrowLeft') keysRef.current.p2Left = true;
      if (e.code === 'ArrowRight') keysRef.current.p2Right = true;
      if (e.code === 'Enter' || e.code === 'Slash' || e.code === 'ShiftRight') {
        triggerDash(2);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') keysRef.current.p1Up = false;
      if (e.code === 'KeyS') keysRef.current.p1Down = false;
      if (e.code === 'KeyA') keysRef.current.p1Left = false;
      if (e.code === 'KeyD') keysRef.current.p1Right = false;

      if (e.code === 'ArrowUp') keysRef.current.p2Up = false;
      if (e.code === 'ArrowDown') keysRef.current.p2Down = false;
      if (e.code === 'ArrowLeft') keysRef.current.p2Left = false;
      if (e.code === 'ArrowRight') keysRef.current.p2Right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 select-none overflow-hidden p-1 sm:p-3">
      {/* Game Canvas Container */}
      <div className="relative w-full max-w-[640px] aspect-[640/440] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain block"
        />

        {/* Start / Menu Modal */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3 shadow-lg shadow-rose-500/20">
              <Flame className="w-9 h-9 text-rose-400 animate-bounce" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wider mb-1">
              BOMB TAG
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-rose-400 uppercase tracking-widest mb-4">
              2-Player Hot Potato Arena
            </p>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 max-w-sm mb-5 text-left text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                Player 1 (Cyan): WASD to Move • Space / Shift to DASH
              </div>
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                Player 2 (Rose): Arrow Keys to Move • Enter / / to DASH
              </div>
              <p className="text-slate-400 text-[11px] pt-1">
                Pass the bomb by colliding with your opponent! Don&apos;t be holding it when the timer hits zero! First to win 3 rounds claims the crown.
              </p>
            </div>

            <button
              onClick={startMatch}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-rose-500/30 flex items-center gap-2 transform hover:scale-105 active:scale-95 transition"
            >
              <Play className="w-4 h-4 fill-white" /> Start Match
            </button>
          </div>
        )}

        {/* Round End Modal */}
        {gameState === 'round_end' && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30 animate-fade-in">
            <div className="text-4xl mb-2 animate-bounce">💥</div>
            <h2 className="text-2xl font-black text-white mb-2">{roundWinnerMsg}</h2>
            <div className="flex items-center gap-6 mt-3 bg-slate-900/90 px-6 py-2 rounded-xl border border-slate-800">
              <div className="text-cyan-400 font-mono font-bold">
                P1: {p1Wins} / {ROUNDS_TO_WIN}
              </div>
              <div className="text-slate-500 font-bold">VS</div>
              <div className="text-rose-400 font-mono font-bold">
                P2: {p2Wins} / {ROUNDS_TO_WIN}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 animate-pulse">Next round starting...</p>
          </div>
        )}

        {/* Match End Modal */}
        {gameState === 'match_end' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
            <Trophy className="w-16 h-16 text-yellow-400 mb-2 animate-bounce" />
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-wide mb-1">
              {matchWinner === 1 ? 'PLAYER 1 (CYAN) WINS!' : 'PLAYER 2 (ROSE) WINS!'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold mb-5">
              Champion of the Bomb Tag Arena! Final Score: {p1Wins} - {p2Wins}
            </p>

            <button
              onClick={startMatch}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transform hover:scale-105 active:scale-95 transition"
            >
              <RotateCcw className="w-4 h-4" /> Play Rematch
            </button>
          </div>
        )}
      </div>

      {/* Dual Virtual Touch Controls for Mobile */}
      <div className="w-full max-w-[640px] mt-2 grid grid-cols-2 gap-2 text-white">
        {/* Player 1 Mobile Controls (Left) */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-2 rounded-xl flex items-center justify-between">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
              P1 Cyan
            </span>
            <div className="grid grid-cols-3 gap-1 w-24 h-24">
              <div></div>
              <button
                onTouchStart={() => setTouchKey('p1Up', true)}
                onTouchEnd={() => setTouchKey('p1Up', false)}
                onMouseDown={() => setTouchKey('p1Up', true)}
                onMouseUp={() => setTouchKey('p1Up', false)}
                className="bg-slate-800 active:bg-cyan-600 rounded-lg flex items-center justify-center"
              >
                <ArrowUp className="w-4 h-4 text-cyan-400" />
              </button>
              <div></div>
              <button
                onTouchStart={() => setTouchKey('p1Left', true)}
                onTouchEnd={() => setTouchKey('p1Left', false)}
                onMouseDown={() => setTouchKey('p1Left', true)}
                onMouseUp={() => setTouchKey('p1Left', false)}
                className="bg-slate-800 active:bg-cyan-600 rounded-lg flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onTouchStart={() => setTouchKey('p1Down', true)}
                onTouchEnd={() => setTouchKey('p1Down', false)}
                onMouseDown={() => setTouchKey('p1Down', true)}
                onMouseUp={() => setTouchKey('p1Down', false)}
                className="bg-slate-800 active:bg-cyan-600 rounded-lg flex items-center justify-center"
              >
                <ArrowDown className="w-4 h-4 text-cyan-400" />
              </button>
              <button
                onTouchStart={() => setTouchKey('p1Right', true)}
                onTouchEnd={() => setTouchKey('p1Right', false)}
                onMouseDown={() => setTouchKey('p1Right', true)}
                onMouseUp={() => setTouchKey('p1Right', false)}
                className="bg-slate-800 active:bg-cyan-600 rounded-lg flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>

          <button
            onTouchStart={() => setTouchKey('p1Dash', true)}
            onTouchEnd={() => setTouchKey('p1Dash', false)}
            onMouseDown={() => setTouchKey('p1Dash', true)}
            onMouseUp={() => setTouchKey('p1Dash', false)}
            className="w-14 h-14 rounded-full bg-cyan-600 active:bg-cyan-400 text-white font-black text-[11px] shadow-lg shadow-cyan-500/30 flex flex-col items-center justify-center"
          >
            <Zap className="w-4 h-4 mb-0.5" />
            DASH
          </button>
        </div>

        {/* Player 2 Mobile Controls (Right) */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-2 rounded-xl flex items-center justify-between">
          <button
            onTouchStart={() => setTouchKey('p2Dash', true)}
            onTouchEnd={() => setTouchKey('p2Dash', false)}
            onMouseDown={() => setTouchKey('p2Dash', true)}
            onMouseUp={() => setTouchKey('p2Dash', false)}
            className="w-14 h-14 rounded-full bg-rose-600 active:bg-rose-400 text-white font-black text-[11px] shadow-lg shadow-rose-500/30 flex flex-col items-center justify-center"
          >
            <Zap className="w-4 h-4 mb-0.5" />
            DASH
          </button>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
              P2 Rose
            </span>
            <div className="grid grid-cols-3 gap-1 w-24 h-24">
              <div></div>
              <button
                onTouchStart={() => setTouchKey('p2Up', true)}
                onTouchEnd={() => setTouchKey('p2Up', false)}
                onMouseDown={() => setTouchKey('p2Up', true)}
                onMouseUp={() => setTouchKey('p2Up', false)}
                className="bg-slate-800 active:bg-rose-600 rounded-lg flex items-center justify-center"
              >
                <ArrowUp className="w-4 h-4 text-rose-400" />
              </button>
              <div></div>
              <button
                onTouchStart={() => setTouchKey('p2Left', true)}
                onTouchEnd={() => setTouchKey('p2Left', false)}
                onMouseDown={() => setTouchKey('p2Left', true)}
                onMouseUp={() => setTouchKey('p2Left', false)}
                className="bg-slate-800 active:bg-rose-600 rounded-lg flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 text-rose-400" />
              </button>
              <button
                onTouchStart={() => setTouchKey('p2Down', true)}
                onTouchEnd={() => setTouchKey('p2Down', false)}
                onMouseDown={() => setTouchKey('p2Down', true)}
                onMouseUp={() => setTouchKey('p2Down', false)}
                className="bg-slate-800 active:bg-rose-600 rounded-lg flex items-center justify-center"
              >
                <ArrowDown className="w-4 h-4 text-rose-400" />
              </button>
              <button
                onTouchStart={() => setTouchKey('p2Right', true)}
                onTouchEnd={() => setTouchKey('p2Right', false)}
                onMouseDown={() => setTouchKey('p2Right', true)}
                onMouseUp={() => setTouchKey('p2Right', false)}
                className="bg-slate-800 active:bg-rose-600 rounded-lg flex items-center justify-center"
              >
                <ArrowRight className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
