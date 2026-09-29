import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { Play, RotateCcw, Trophy, Zap, Crosshair, Shield, PlusCircle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

type WeaponType = 'pistol' | 'shotgun' | 'machine';

interface Player {
  id: 1 | 2;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  radius: number;
  color: string;
  glowColor: string;
  health: number;
  maxHealth: number;
  kills: number;
  weapon: WeaponType;
  shootCooldown: number;
  dashCooldown: number;
  isDashing: boolean;
  dashTimer: number;
  hasShield: boolean;
  isAlive: boolean;
  respawnTimer: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ownerId: 1 | 2;
  damage: number;
  radius: number;
  color: string;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'health' | 'shotgun' | 'machine' | 'shield';
  radius: number;
}

export const MiniArena: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [p1Kills, setP1Kills] = useState<number>(0);
  const [p2Kills, setP2Kills] = useState<number>(0);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);

  const CANVAS_WIDTH = 620;
  const CANVAS_HEIGHT = 420;
  const TARGET_KILLS = 5;

  const screenShakeRef = useRef<number>(0);
  const nextIdRef = useRef<number>(1);
  const powerupTimerRef = useRef<number>(200);

  // Arena Pillars / Obstacles
  const obstacles: Obstacle[] = [
    { x: 130, y: 90, width: 60, height: 60 },
    { x: 430, y: 90, width: 60, height: 60 },
    { x: 130, y: 270, width: 60, height: 60 },
    { x: 430, y: 270, width: 60, height: 60 },
    { x: 275, y: 175, width: 70, height: 70 }, // Center pillar
  ];

  const p1Ref = useRef<Player>({
    id: 1,
    x: 80,
    y: 210,
    vx: 0,
    vy: 0,
    angle: 0,
    radius: 14,
    color: '#06b6d4',
    glowColor: '#22d3ee',
    health: 100,
    maxHealth: 100,
    kills: 0,
    weapon: 'pistol',
    shootCooldown: 0,
    dashCooldown: 0,
    isDashing: false,
    dashTimer: 0,
    hasShield: false,
    isAlive: true,
    respawnTimer: 0,
  });

  const p2Ref = useRef<Player>({
    id: 2,
    x: 540,
    y: 210,
    vx: 0,
    vy: 0,
    angle: Math.PI,
    radius: 14,
    color: '#f43f5e',
    glowColor: '#fb7185',
    health: 100,
    maxHealth: 100,
    kills: 0,
    weapon: 'pistol',
    shootCooldown: 0,
    dashCooldown: 0,
    isDashing: false,
    dashTimer: 0,
    hasShield: false,
    isAlive: true,
    respawnTimer: 0,
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const powerupsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);

  // Key states
  const keysRef = useRef<{
    p1Up: boolean;
    p1Down: boolean;
    p1Left: boolean;
    p1Right: boolean;
    p1Shoot: boolean;
    p1Dash: boolean;
    p2Up: boolean;
    p2Down: boolean;
    p2Left: boolean;
    p2Right: boolean;
    p2Shoot: boolean;
    p2Dash: boolean;
  }>({
    p1Up: false,
    p1Down: false,
    p1Left: false,
    p1Right: false,
    p1Shoot: false,
    p1Dash: false,
    p2Up: false,
    p2Down: false,
    p2Left: false,
    p2Right: false,
    p2Shoot: false,
    p2Dash: false,
  });

  // Shoot Bullet
  const shoot = useCallback((playerNum: 1 | 2) => {
    sound.unlockMobileAudio();
    const p = playerNum === 1 ? p1Ref.current : p2Ref.current;
    if (!p.isAlive || p.shootCooldown > 0) return;

    const barrelLen = p.radius + 6;
    const spawnX = p.x + Math.cos(p.angle) * barrelLen;
    const spawnY = p.y + Math.sin(p.angle) * barrelLen;

    if (p.weapon === 'shotgun') {
      sound.playSpreadGun();
      p.shootCooldown = 28;
      const spreadAngles = [-0.25, 0, 0.25];
      spreadAngles.forEach((offset) => {
        const ang = p.angle + offset;
        bulletsRef.current.push({
          id: nextIdRef.current++,
          x: spawnX,
          y: spawnY,
          vx: Math.cos(ang) * 9.5,
          vy: Math.sin(ang) * 9.5,
          ownerId: p.id,
          damage: 22,
          radius: 4,
          color: '#fbbf24',
        });
      });
    } else if (p.weapon === 'machine') {
      sound.playMachineGun();
      p.shootCooldown = 7;
      bulletsRef.current.push({
        id: nextIdRef.current++,
        x: spawnX,
        y: spawnY,
        vx: Math.cos(p.angle) * 11,
        vy: Math.sin(p.angle) * 11,
        ownerId: p.id,
        damage: 16,
        radius: 3.5,
        color: '#f97316',
      });
    } else {
      // Pistol
      sound.playLaser();
      p.shootCooldown = 15;
      bulletsRef.current.push({
        id: nextIdRef.current++,
        x: spawnX,
        y: spawnY,
        vx: Math.cos(p.angle) * 8.8,
        vy: Math.sin(p.angle) * 8.8,
        ownerId: p.id,
        damage: 25,
        radius: 4,
        color: p.id === 1 ? '#22d3ee' : '#fb7185',
      });
    }
  }, []);

  // Dash Action
  const dash = useCallback((playerNum: 1 | 2) => {
    sound.unlockMobileAudio();
    const p = playerNum === 1 ? p1Ref.current : p2Ref.current;
    if (!p.isAlive || p.dashCooldown > 0) return;

    p.isDashing = true;
    p.dashTimer = 10; // fast dash frames
    p.dashCooldown = 60; // 1 second cooldown
    sound.playDash();

    // Dash trail particles
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x: p.x,
        y: p.y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        color: p.glowColor,
        life: 14,
      });
    }
  }, []);

  // Start new match
  const startMatch = useCallback(() => {
    sound.unlockMobileAudio();
    setP1Kills(0);
    setP2Kills(0);
    setWinnerMessage(null);

    p1Ref.current = {
      id: 1,
      x: 80,
      y: 210,
      vx: 0,
      vy: 0,
      angle: 0,
      radius: 14,
      color: '#06b6d4',
      glowColor: '#22d3ee',
      health: 100,
      maxHealth: 100,
      kills: 0,
      weapon: 'pistol',
      shootCooldown: 0,
      dashCooldown: 0,
      isDashing: false,
      dashTimer: 0,
      hasShield: false,
      isAlive: true,
      respawnTimer: 0,
    };

    p2Ref.current = {
      id: 2,
      x: 540,
      y: 210,
      vx: 0,
      vy: 0,
      angle: Math.PI,
      radius: 14,
      color: '#f43f5e',
      glowColor: '#fb7185',
      health: 100,
      maxHealth: 100,
      kills: 0,
      weapon: 'pistol',
      shootCooldown: 0,
      dashCooldown: 0,
      isDashing: false,
      dashTimer: 0,
      hasShield: false,
      isAlive: true,
      respawnTimer: 0,
    };

    bulletsRef.current = [];
    powerupsRef.current = [];
    particlesRef.current = [];
    powerupTimerRef.current = 150;
    setGameState('playing');
    sound.playScore();
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const k = keysRef.current;
      // P1: WASD, Space/F to shoot, Shift/C to dash
      if (e.key.toLowerCase() === 'w') k.p1Up = true;
      if (e.key.toLowerCase() === 's') k.p1Down = true;
      if (e.key.toLowerCase() === 'a') k.p1Left = true;
      if (e.key.toLowerCase() === 'd') k.p1Right = true;
      if (e.key === ' ' || e.key.toLowerCase() === 'f') {
        k.p1Shoot = true;
        shoot(1);
      }
      if (e.key === 'Shift' || e.key.toLowerCase() === 'c') {
        dash(1);
      }

      // P2: Arrows, Enter/L to shoot, Right Shift/. to dash
      if (e.key === 'ArrowUp') k.p2Up = true;
      if (e.key === 'ArrowDown') k.p2Down = true;
      if (e.key === 'ArrowLeft') k.p2Left = true;
      if (e.key === 'ArrowRight') k.p2Right = true;
      if (e.key === 'Enter' || e.key.toLowerCase() === 'l') {
        k.p2Shoot = true;
        shoot(2);
      }
      if (e.key === '.' || e.key === '/') {
        dash(2);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = keysRef.current;
      if (e.key.toLowerCase() === 'w') k.p1Up = false;
      if (e.key.toLowerCase() === 's') k.p1Down = false;
      if (e.key.toLowerCase() === 'a') k.p1Left = false;
      if (e.key.toLowerCase() === 'd') k.p1Right = false;
      if (e.key === ' ' || e.key.toLowerCase() === 'f') k.p1Shoot = false;

      if (e.key === 'ArrowUp') k.p2Up = false;
      if (e.key === 'ArrowDown') k.p2Down = false;
      if (e.key === 'ArrowLeft') k.p2Left = false;
      if (e.key === 'ArrowRight') k.p2Right = false;
      if (e.key === 'Enter' || e.key.toLowerCase() === 'l') k.p2Shoot = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shoot, dash]);

  // Main simulation tick
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;

    const tick = () => {
      const k = keysRef.current;
      const p1 = p1Ref.current;
      const p2 = p2Ref.current;

      // Update Screen Shake
      if (screenShakeRef.current > 0) screenShakeRef.current -= 0.5;

      // 1. Update Player 1
      if (p1.isAlive) {
        if (p1.shootCooldown > 0) p1.shootCooldown -= 1;
        if (p1.dashCooldown > 0) p1.dashCooldown -= 1;

        let mx = 0;
        let my = 0;
        if (k.p1Up) my -= 1;
        if (k.p1Down) my += 1;
        if (k.p1Left) mx -= 1;
        if (k.p1Right) mx += 1;

        if (mx !== 0 || my !== 0) {
          p1.angle = Math.atan2(my, mx);
        }

        const moveSpeed = p1.isDashing ? 8.5 : 3.4;
        const len = Math.hypot(mx, my);
        if (len > 0) {
          p1.vx = (mx / len) * moveSpeed;
          p1.vy = (my / len) * moveSpeed;
        } else if (p1.isDashing) {
          p1.vx = Math.cos(p1.angle) * moveSpeed;
          p1.vy = Math.sin(p1.angle) * moveSpeed;
        } else {
          p1.vx = 0;
          p1.vy = 0;
        }

        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.isDashing) {
          p1.dashTimer -= 1;
          if (p1.dashTimer <= 0) p1.isDashing = false;
        }
      } else {
        p1.respawnTimer -= 1;
        if (p1.respawnTimer <= 0) {
          p1.x = 80;
          p1.y = 210;
          p1.health = 100;
          p1.weapon = 'pistol';
          p1.isAlive = true;
          sound.playCoin();
        }
      }

      // 2. Update Player 2
      if (p2.isAlive) {
        if (p2.shootCooldown > 0) p2.shootCooldown -= 1;
        if (p2.dashCooldown > 0) p2.dashCooldown -= 1;

        let mx = 0;
        let my = 0;
        if (k.p2Up) my -= 1;
        if (k.p2Down) my += 1;
        if (k.p2Left) mx -= 1;
        if (k.p2Right) mx += 1;

        if (mx !== 0 || my !== 0) {
          p2.angle = Math.atan2(my, mx);
        }

        const moveSpeed = p2.isDashing ? 8.5 : 3.4;
        const len = Math.hypot(mx, my);
        if (len > 0) {
          p2.vx = (mx / len) * moveSpeed;
          p2.vy = (my / len) * moveSpeed;
        } else if (p2.isDashing) {
          p2.vx = Math.cos(p2.angle) * moveSpeed;
          p2.vy = Math.sin(p2.angle) * moveSpeed;
        } else {
          p2.vx = 0;
          p2.vy = 0;
        }

        p2.x += p2.vx;
        p2.y += p2.vy;

        if (p2.isDashing) {
          p2.dashTimer -= 1;
          if (p2.dashTimer <= 0) p2.isDashing = false;
        }
      } else {
        p2.respawnTimer -= 1;
        if (p2.respawnTimer <= 0) {
          p2.x = 540;
          p2.y = 210;
          p2.health = 100;
          p2.weapon = 'pistol';
          p2.isAlive = true;
          sound.playCoin();
        }
      }

      // Obstacle collision for players & boundaries
      [p1, p2].forEach((p) => {
        if (!p.isAlive) return;
        // Arena outer walls
        p.x = Math.max(p.radius + 14, Math.min(CANVAS_WIDTH - p.radius - 14, p.x));
        p.y = Math.max(p.radius + 14, Math.min(CANVAS_HEIGHT - p.radius - 14, p.y));

        // Pillars
        obstacles.forEach((obs) => {
          const nearestX = Math.max(obs.x, Math.min(p.x, obs.x + obs.width));
          const nearestY = Math.max(obs.y, Math.min(p.y, obs.y + obs.height));
          const dist = Math.hypot(p.x - nearestX, p.y - nearestY);
          if (dist < p.radius && dist > 0) {
            const overlap = p.radius - dist;
            p.x += ((p.x - nearestX) / dist) * overlap;
            p.y += ((p.y - nearestY) / dist) * overlap;
          }
        });
      });

      // Spawn Power-ups
      powerupTimerRef.current -= 1;
      if (powerupTimerRef.current <= 0) {
        powerupTimerRef.current = 320;
        if (powerupsRef.current.length < 3) {
          const types: ('health' | 'shotgun' | 'machine' | 'shield')[] = ['health', 'shotgun', 'machine', 'shield'];
          const chosen = types[Math.floor(Math.random() * types.length)];
          // Spawn in clear area
          const sx = 100 + Math.random() * 420;
          const sy = 80 + Math.random() * 260;
          powerupsRef.current.push({
            id: nextIdRef.current++,
            x: sx,
            y: sy,
            type: chosen,
            radius: 12,
          });
        }
      }

      // Collect Power-ups
      for (let pi = powerupsRef.current.length - 1; pi >= 0; pi--) {
        const pw = powerupsRef.current[pi];
        [p1, p2].forEach((p) => {
          if (!p.isAlive) return;
          const dist = Math.hypot(p.x - pw.x, p.y - pw.y);
          if (dist < p.radius + pw.radius) {
            sound.playPowerup();
            if (pw.type === 'health') {
              p.health = Math.min(100, p.health + 40);
            } else if (pw.type === 'shield') {
              p.hasShield = true;
            } else {
              p.weapon = pw.type;
            }
            powerupsRef.current.splice(pi, 1);
          }
        });
      }

      // Update Bullets
      for (let bi = bulletsRef.current.length - 1; bi >= 0; bi--) {
        const b = bulletsRef.current[bi];
        b.x += b.vx;
        b.y += b.vy;

        // Obstacle collision
        let hitObs = false;
        obstacles.forEach((obs) => {
          if (b.x >= obs.x && b.x <= obs.x + obs.width && b.y >= obs.y && b.y <= obs.y + obs.height) {
            hitObs = true;
          }
        });

        // Outer wall collision
        if (hitObs || b.x < 14 || b.x > CANVAS_WIDTH - 14 || b.y < 14 || b.y > CANVAS_HEIGHT - 14) {
          sound.playBounce();
          bulletsRef.current.splice(bi, 1);
          continue;
        }

        // Bullet vs Players
        const target = b.ownerId === 1 ? p2 : p1;
        if (target.isAlive && !target.isDashing) {
          const dist = Math.hypot(target.x - b.x, target.y - b.y);
          if (dist < target.radius + b.radius) {
            bulletsRef.current.splice(bi, 1);
            screenShakeRef.current = 6;

            if (target.hasShield) {
              target.hasShield = false;
              sound.playBounce();
            } else {
              target.health -= b.damage;
              sound.playHit();

              // Hit blood/sparks
              for (let i = 0; i < 8; i++) {
                particlesRef.current.push({
                  x: target.x,
                  y: target.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  color: target.glowColor,
                  life: 14,
                });
              }

              // Death check
              if (target.health <= 0) {
                target.isAlive = false;
                target.respawnTimer = 75; // 1.25s respawn
                sound.playExplosion();

                const killer = b.ownerId === 1 ? p1 : p2;
                killer.kills += 1;
                if (b.ownerId === 1) setP1Kills((k) => k + 1);
                else setP2Kills((k) => k + 1);

                // Match won condition!
                if (killer.kills >= TARGET_KILLS) {
                  setWinnerMessage(`Player ${killer.id} Wins the Arena Match! 🏆`);
                  sound.playWin();
                  setGameState('gameover');
                  onScoreUpdate?.(killer.kills * 200);
                  return;
                }
              }
            }
          }
        }
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

          ctx.save();
          // Apply Screen Shake
          if (screenShakeRef.current > 0) {
            const rx = (Math.random() - 0.5) * screenShakeRef.current * 2;
            const ry = (Math.random() - 0.5) * screenShakeRef.current * 2;
            ctx.translate(rx, ry);
          }

          // Arena Floor Grid
          ctx.fillStyle = '#080d1a';
          ctx.fillRect(0, 0, w, h);

          // Grid lines
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
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

          // Outer Laser Border
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 10;
          ctx.strokeRect(14, 14, w - 28, h - 28);
          ctx.shadowBlur = 0;

          // Draw Obstacles (Pillars)
          obstacles.forEach((obs) => {
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
            ctx.fill();
            ctx.stroke();

            // Inner core
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.roundRect(obs.x + 8, obs.y + 8, obs.width - 16, obs.height - 16, 4);
            ctx.fill();
          });

          // Draw Power-ups
          powerupsRef.current.forEach((pw) => {
            ctx.save();
            ctx.translate(pw.x, pw.y);
            ctx.shadowBlur = 12;
            if (pw.type === 'health') {
              ctx.shadowColor = '#22c55e';
              ctx.fillStyle = '#22c55e';
              ctx.beginPath();
              ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 12px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('+', 0, 0);
            } else if (pw.type === 'shield') {
              ctx.shadowColor = '#38bdf8';
              ctx.fillStyle = '#38bdf8';
              ctx.beginPath();
              ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 9px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('🛡️', 0, 1);
            } else {
              ctx.shadowColor = '#f59e0b';
              ctx.fillStyle = '#f59e0b';
              ctx.beginPath();
              ctx.arc(0, 0, pw.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 10px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(pw.type === 'shotgun' ? 'S' : 'M', 0, 0);
            }
            ctx.restore();
          });

          // Draw Bullets
          bulletsRef.current.forEach((b) => {
            ctx.save();
            ctx.fillStyle = b.color;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });

          // Draw Players
          [p1, p2].forEach((p) => {
            if (!p.isAlive) return;

            ctx.save();
            ctx.translate(p.x, p.y);

            // Shield Bubble
            if (p.hasShield) {
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 2.5;
              ctx.shadowColor = '#38bdf8';
              ctx.shadowBlur = 12;
              ctx.beginPath();
              ctx.arc(0, 0, p.radius + 6, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Gun Barrel
            ctx.save();
            ctx.rotate(p.angle);
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(0, -3.5, p.radius + 8, 7);
            ctx.restore();

            // Player Body Circle
            ctx.shadowColor = p.glowColor;
            ctx.shadowBlur = p.isDashing ? 22 : 12;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Health Bar Above Player
            const barW = 32;
            const barH = 4;
            const hpRatio = Math.max(0, p.health / p.maxHealth);
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#334155';
            ctx.fillRect(-barW / 2, -p.radius - 12, barW, barH);
            ctx.fillStyle = hpRatio > 0.4 ? p.glowColor : '#ef4444';
            ctx.fillRect(-barW / 2, -p.radius - 12, barW * hpRatio, barH);

            ctx.restore();
          });

          // Draw Particles
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
  }, [gameState, onScoreUpdate]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-2 sm:p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[620px] flex items-center justify-between mb-2 px-4 py-2 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 text-sm shadow">
        {/* P1 Kills */}
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
          <span className="font-bold text-cyan-400">P1:</span>
          <span className="font-mono text-xl font-black text-white">{p1Kills} / {TARGET_KILLS}</span>
        </div>

        {/* Target condition */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
          <span className="text-slate-400 font-medium">First to {TARGET_KILLS} Kills</span>
        </div>

        {/* P2 Kills */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-black text-white">{p2Kills} / {TARGET_KILLS}</span>
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
            <div className="w-16 h-16 mb-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20">
              <Crosshair className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-wide mb-1">
              MINI ARENA
            </h2>
            <p className="text-xs text-slate-300 max-w-sm mb-5">
              Two players duel in a closed arena with obstacles! Move, aim, shoot, and dash to dodge bullets. Grab weapon powerups. First to 5 kills wins!
            </p>
            <div className="flex items-center gap-8 text-xs text-slate-400 mb-6">
              <div className="flex flex-col items-center">
                <span className="text-cyan-400 font-bold mb-1">Player 1</span>
                <span className="font-mono bg-slate-800 px-2.5 py-1 rounded border border-slate-700">WASD + Space (Shoot) + Shift (Dash)</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-rose-400 font-bold mb-1">Player 2</span>
                <span className="font-mono bg-slate-800 px-2.5 py-1 rounded border border-slate-700">Arrows + Enter (Shoot) + / (Dash)</span>
              </div>
            </div>
            <button
              onClick={startMatch}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-sm"
            >
              ENTER ARENA
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-fade-in">
            <Trophy className="w-14 h-14 text-amber-400 mb-2" />
            <h3 className="text-2xl font-black text-white mb-2">{winnerMessage}</h3>
            <p className="text-xs text-slate-300 mb-5 font-mono">
              Score: <span className="text-cyan-400 font-bold">{p1Kills}</span> -{' '}
              <span className="text-rose-400 font-bold">{p2Kills}</span>
            </p>
            <button
              onClick={startMatch}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-xs"
            >
              PLAY REMATCH
            </button>
          </div>
        )}
      </div>

      {/* Dual Mobile Action Controls */}
      <div className="w-full max-w-[620px] flex items-center justify-between gap-4 mt-3 px-2">
        {/* P1 Controls */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => shoot(1)}
            className="w-16 h-14 rounded-2xl bg-cyan-600 active:bg-cyan-700 active:scale-95 text-white font-black flex flex-col items-center justify-center shadow-lg shadow-cyan-500/20 text-xs"
          >
            <Crosshair className="w-4 h-4" />
            <span>P1 FIRE</span>
          </button>
          <button
            onPointerDown={() => dash(1)}
            className="w-16 h-14 rounded-2xl bg-cyan-800 active:bg-cyan-900 active:scale-95 text-cyan-200 font-black flex flex-col items-center justify-center shadow text-xs"
          >
            <Zap className="w-4 h-4" />
            <span>P1 DASH</span>
          </button>
        </div>

        {/* Rematch Icon */}
        <button
          onClick={startMatch}
          className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition shadow"
          title="Reset Match"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* P2 Controls */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => dash(2)}
            className="w-16 h-14 rounded-2xl bg-rose-800 active:bg-rose-900 active:scale-95 text-rose-200 font-black flex flex-col items-center justify-center shadow text-xs"
          >
            <Zap className="w-4 h-4" />
            <span>P2 DASH</span>
          </button>
          <button
            onPointerDown={() => shoot(2)}
            className="w-16 h-14 rounded-2xl bg-rose-600 active:bg-rose-700 active:scale-95 text-white font-black flex flex-col items-center justify-center shadow-lg shadow-rose-500/20 text-xs"
          >
            <Crosshair className="w-4 h-4" />
            <span>P2 FIRE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
