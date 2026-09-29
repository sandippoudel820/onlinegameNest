import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { Play, RotateCcw, Heart, Trophy, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  isAlive: boolean;
  type?: string;
  dir?: number;
}

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'brick' | 'question' | 'empty' | 'pipe' | 'flag';
  hasCoin?: boolean;
  bumpOffset?: number;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
  animFrame: number;
}

export const SuperPlatformer: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'won'>('idle');

  // Input state
  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false,
  });

  // Game world state
  const cameraXRef = useRef(0);
  const playerRef = useRef<Entity>({
    x: 50,
    y: 300,
    width: 28,
    height: 36,
    vx: 0,
    vy: 0,
    isAlive: true,
  });
  const isGroundedRef = useRef(false);
  const enemiesRef = useRef<Entity[]>([]);
  const blocksRef = useRef<Block[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);
  const levelWidthRef = useRef(2600);

  // Initialize level
  const initLevel = useCallback(() => {
    playerRef.current = {
      x: 50,
      y: 300,
      width: 28,
      height: 36,
      vx: 0,
      vy: 0,
      isAlive: true,
    };
    cameraXRef.current = 0;
    isGroundedRef.current = false;

    // Create blocks & platforms
    const blocks: Block[] = [];
    const coinsList: Coin[] = [];
    const enemiesList: Entity[] = [];

    // Ground platforms with occasional gaps
    for (let x = 0; x < 2600; x += 40) {
      if ((x > 500 && x < 580) || (x > 1200 && x < 1300) || (x > 1800 && x < 1900)) {
        continue; // pitfall gaps!
      }
      blocks.push({ x, y: 390, width: 40, height: 70, type: 'ground' });
    }

    // Elevated floating brick and question blocks
    const blockPlacements: { x: number; y: number; type: 'brick' | 'question' }[] = [
      { x: 200, y: 270, type: 'question' },
      { x: 240, y: 270, type: 'brick' },
      { x: 280, y: 270, type: 'question' },
      { x: 320, y: 270, type: 'brick' },
      { x: 360, y: 270, type: 'question' },

      // High challenge platform
      { x: 640, y: 240, type: 'question' },
      { x: 680, y: 240, type: 'brick' },
      { x: 720, y: 240, type: 'brick' },
      { x: 760, y: 240, type: 'question' },

      // Step pyramid
      { x: 920, y: 350, type: 'brick' },
      { x: 960, y: 350, type: 'brick' },
      { x: 960, y: 310, type: 'brick' },
      { x: 1000, y: 350, type: 'brick' },
      { x: 1000, y: 310, type: 'brick' },
      { x: 1000, y: 270, type: 'question' },

      // Upper coin bridge
      { x: 1400, y: 260, type: 'question' },
      { x: 1440, y: 260, type: 'brick' },
      { x: 1480, y: 260, type: 'question' },
      { x: 1520, y: 260, type: 'brick' },

      // End castle approach
      { x: 2050, y: 350, type: 'brick' },
      { x: 2090, y: 310, type: 'brick' },
      { x: 2130, y: 270, type: 'brick' },
      { x: 2170, y: 230, type: 'question' },
    ];

    blockPlacements.forEach((b) => {
      blocks.push({
        x: b.x,
        y: b.y,
        width: 40,
        height: 40,
        type: b.type,
        hasCoin: b.type === 'question',
        bumpOffset: 0,
      });
    });

    // Green Pipes
    blocks.push({ x: 420, y: 330, width: 50, height: 60, type: 'pipe' });
    blocks.push({ x: 840, y: 300, width: 50, height: 90, type: 'pipe' });
    blocks.push({ x: 1650, y: 320, width: 50, height: 70, type: 'pipe' });

    // End Goal Flag
    blocks.push({ x: 2400, y: 150, width: 15, height: 240, type: 'flag' });

    // Floating Coins in arcs
    const coinPoints = [
      { x: 200, y: 220 },
      { x: 280, y: 220 },
      { x: 360, y: 220 },
      { x: 430, y: 270 },
      { x: 640, y: 190 },
      { x: 680, y: 190 },
      { x: 720, y: 190 },
      { x: 760, y: 190 },
      { x: 1080, y: 330 },
      { x: 1120, y: 310 },
      { x: 1160, y: 330 },
      { x: 1440, y: 210 },
      { x: 1480, y: 210 },
      { x: 1720, y: 340 },
      { x: 1760, y: 340 },
      { x: 2170, y: 180 },
    ];

    coinPoints.forEach((cp) => {
      coinsList.push({ x: cp.x, y: cp.y, collected: false, animFrame: Math.random() * 10 });
    });

    // Walking Goomba Monsters
    const enemySpawns = [320, 680, 890, 1100, 1420, 1580, 1960];
    enemySpawns.forEach((ex) => {
      enemiesList.push({
        x: ex,
        y: 355,
        width: 32,
        height: 32,
        vx: -1.2,
        vy: 0,
        isAlive: true,
        dir: -1,
      });
    });

    blocksRef.current = blocks;
    coinsRef.current = coinsList;
    enemiesRef.current = enemiesList;
    particlesRef.current = [];
  }, []);

  const startGame = useCallback(() => {
    initLevel();
    setScore(0);
    setCoins(0);
    setLives(3);
    setGameState('playing');
    sound.playScore();
  }, [initLevel]);

  const restartCurrentLife = useCallback(() => {
    playerRef.current.x = Math.max(50, cameraXRef.current);
    playerRef.current.y = 200;
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;
    playerRef.current.isAlive = true;
    isGroundedRef.current = false;
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', ' ', 'KeyA', 'KeyD', 'KeyW'].includes(e.code) || ['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = true;
      if (e.key === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = true;
      if (e.key === 'ArrowUp' || e.key === ' ' || e.code === 'KeyW' || e.code === 'Space') {
        if (!keysRef.current.jump && isGroundedRef.current) {
          playerRef.current.vy = -12.5;
          sound.playJump();
        }
        keysRef.current.jump = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
      if (e.key === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
      if (e.key === 'ArrowUp' || e.key === ' ' || e.code === 'KeyW' || e.code === 'Space') {
        keysRef.current.jump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main game physics loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId: number;

    const loop = () => {
      const p = playerRef.current;
      if (!p.isAlive) {
        animId = requestAnimationFrame(loop);
        return;
      }

      // Horizontal Acceleration
      const accel = 0.8;
      const maxSpeed = 4.8;
      const friction = 0.85;

      if (keysRef.current.left) {
        p.vx = Math.max(-maxSpeed, p.vx - accel);
      } else if (keysRef.current.right) {
        p.vx = Math.min(maxSpeed, p.vx + accel);
      } else {
        p.vx *= friction;
      }

      // Gravity
      p.vy += 0.55;
      if (p.vy > 12) p.vy = 12;

      // Move X & Resolve Collisions
      p.x += p.vx;
      if (p.x < 10) {
        p.x = 10;
        p.vx = 0;
      }

      blocksRef.current.forEach((block) => {
        if (block.type === 'flag') return; // goal detection handled separately
        if (
          p.x + p.width > block.x &&
          p.x < block.x + block.width &&
          p.y + p.height > block.y &&
          p.y < block.y + block.height
        ) {
          if (p.vx > 0) {
            p.x = block.x - p.width;
            p.vx = 0;
          } else if (p.vx < 0) {
            p.x = block.x + block.width;
            p.vx = 0;
          }
        }
      });

      // Move Y & Resolve Collisions
      p.y += p.vy;
      isGroundedRef.current = false;

      blocksRef.current.forEach((block) => {
        if (block.type === 'flag') {
          // Check level win
          if (
            p.x + p.width >= block.x &&
            p.x <= block.x + block.width &&
            p.y + p.height >= block.y &&
            p.y <= block.y + block.height
          ) {
            sound.playScore();
            setScore((prev) => prev + 1000);
            setGameState('won');
          }
          return;
        }

        if (
          p.x + p.width > block.x + 3 &&
          p.x < block.x + block.width - 3 &&
          p.y + p.height > block.y &&
          p.y < block.y + block.height
        ) {
          if (p.vy > 0) {
            // Landing on top
            p.y = block.y - p.height;
            p.vy = 0;
            isGroundedRef.current = true;
          } else if (p.vy < 0) {
            // Hitting from below
            p.y = block.y + block.height;
            p.vy = 1;

            // Hit Question Block!
            if (block.type === 'question' && block.hasCoin) {
              block.hasCoin = false;
              block.type = 'empty';
              block.bumpOffset = -8;
              sound.playCoin();
              setCoins((c) => c + 1);
              setScore((s) => {
                const nextS = s + 100;
                onScoreUpdate?.(nextS);
                return nextS;
              });

              // Coin spawn particles
              particlesRef.current.push({
                x: block.x + 20,
                y: block.y - 10,
                vx: 0,
                vy: -4,
                color: '#fbbf24',
                life: 25,
              });
            } else if (block.type === 'brick') {
              block.bumpOffset = -4;
              sound.playBounce();
            }
          }
        }
      });

      // Reset bump offset back to 0
      blocksRef.current.forEach((b) => {
        if (b.bumpOffset && b.bumpOffset < 0) {
          b.bumpOffset += 1;
        }
      });

      // Fall off bottom pitfall
      if (p.y > 480) {
        sound.playGameOver();
        setLives((l) => {
          const nextL = l - 1;
          if (nextL <= 0) {
            setGameState('gameover');
          } else {
            restartCurrentLife();
          }
          return nextL;
        });
      }

      // Update camera tracking
      const targetCamX = p.x - 220;
      cameraXRef.current = Math.max(0, Math.min(levelWidthRef.current - 600, targetCamX));

      // Coin Pickups
      coinsRef.current.forEach((coin) => {
        if (!coin.collected) {
          coin.animFrame += 0.1;
          if (
            p.x + p.width > coin.x - 12 &&
            p.x < coin.x + 12 &&
            p.y + p.height > coin.y - 12 &&
            p.y < coin.y + 12
          ) {
            coin.collected = true;
            sound.playCoin();
            setCoins((c) => c + 1);
            setScore((s) => s + 50);
          }
        }
      });

      // Enemies AI & Collision
      enemiesRef.current.forEach((enemy) => {
        if (!enemy.isAlive) return;

        enemy.x += enemy.vx;

        // Turn around on block walls or edge
        blocksRef.current.forEach((block) => {
          if (block.type === 'ground' || block.type === 'pipe') {
            if (
              enemy.x + enemy.width > block.x &&
              enemy.x < block.x + block.width &&
              enemy.y + enemy.height > block.y &&
              enemy.y < block.y + block.height
            ) {
              enemy.vx = -enemy.vx;
            }
          }
        });

        // Player vs Enemy Collision
        if (
          p.x + p.width > enemy.x + 4 &&
          p.x < enemy.x + enemy.width - 4 &&
          p.y + p.height > enemy.y &&
          p.y < enemy.y + enemy.height
        ) {
          // Stomp on top
          if (p.vy > 0 && p.y + p.height < enemy.y + 16) {
            enemy.isAlive = false;
            p.vy = -8.5; // bounce up!
            sound.playStomp();
            setScore((s) => s + 200);

            // Stomp puff
            for (let i = 0; i < 6; i++) {
              particlesRef.current.push({
                x: enemy.x + 16,
                y: enemy.y + 16,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: '#e2e8f0',
                life: 15,
              });
            }
          } else {
            // Player Hurt
            sound.playGameOver();
            setLives((l) => {
              const nextL = l - 1;
              if (nextL <= 0) {
                setGameState('gameover');
              } else {
                restartCurrentLife();
              }
              return nextL;
            });
          }
        }
      });

      // Update particles
      particlesRef.current.forEach((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 1;
      });
      particlesRef.current = particlesRef.current.filter((pt) => pt.life > 0);

      // Render Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          const camX = cameraXRef.current;

          // 1. Sky Gradient Background (like Mario)
          const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
          skyGrad.addColorStop(0, '#5c94fc');
          skyGrad.addColorStop(0.7, '#89b4ff');
          skyGrad.addColorStop(1, '#c2d8ff');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, width, height);

          // 2. Parallax Background Clouds & Hills
          ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
          const clouds = [100, 350, 700, 1100, 1500, 1900, 2300];
          clouds.forEach((cx) => {
            const screenCx = cx - camX * 0.3;
            if (screenCx > -100 && screenCx < width + 100) {
              ctx.beginPath();
              ctx.arc(screenCx, 80, 25, 0, Math.PI * 2);
              ctx.arc(screenCx + 25, 75, 32, 0, Math.PI * 2);
              ctx.arc(screenCx + 55, 80, 24, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // Green hills in background
          ctx.fillStyle = '#4ade80';
          const hills = [150, 600, 1050, 1600, 2100];
          hills.forEach((hx) => {
            const screenHx = hx - camX * 0.5;
            if (screenHx > -150 && screenHx < width + 150) {
              ctx.beginPath();
              ctx.ellipse(screenHx, 390, 80, 70, 0, Math.PI, 0);
              ctx.fill();
            }
          });

          ctx.save();
          ctx.translate(-camX, 0);

          // 3. Draw Blocks
          blocksRef.current.forEach((b) => {
            const by = b.y + (b.bumpOffset || 0);

            if (b.type === 'ground') {
              // Grassy top
              ctx.fillStyle = '#22c55e';
              ctx.fillRect(b.x, by, b.width, 10);
              // Earth base
              ctx.fillStyle = '#92400e';
              ctx.fillRect(b.x, by + 10, b.width, b.height - 10);
              // Brick texture line
              ctx.strokeStyle = '#78350f';
              ctx.lineWidth = 1;
              ctx.strokeRect(b.x, by, b.width, b.height);
            } else if (b.type === 'brick') {
              ctx.fillStyle = '#b45309';
              ctx.fillRect(b.x, by, b.width, b.height);
              ctx.strokeStyle = '#78350f';
              ctx.lineWidth = 2;
              ctx.strokeRect(b.x, by, b.width, b.height);
              // Brick mortar marks
              ctx.beginPath();
              ctx.moveTo(b.x, by + 20);
              ctx.lineTo(b.x + 40, by + 20);
              ctx.moveTo(b.x + 20, by);
              ctx.lineTo(b.x + 20, by + 20);
              ctx.stroke();
            } else if (b.type === 'question') {
              // Glowing gold Question Block!
              ctx.fillStyle = '#f59e0b';
              ctx.fillRect(b.x, by, b.width, b.height);
              ctx.strokeStyle = '#d97706';
              ctx.lineWidth = 2;
              ctx.strokeRect(b.x, by, b.width, b.height);

              // Question Mark
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 22px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('?', b.x + 20, by + 20);
            } else if (b.type === 'empty') {
              // Used block
              ctx.fillStyle = '#78716c';
              ctx.fillRect(b.x, by, b.width, b.height);
              ctx.strokeStyle = '#44403c';
              ctx.strokeRect(b.x, by, b.width, b.height);
            } else if (b.type === 'pipe') {
              // Classic green pipe
              ctx.fillStyle = '#16a34a';
              ctx.fillRect(b.x, by, b.width, b.height);
              // Top lip
              ctx.fillStyle = '#22c55e';
              ctx.fillRect(b.x - 4, by, b.width + 8, 14);
              ctx.strokeStyle = '#14532d';
              ctx.strokeRect(b.x - 4, by, b.width + 8, 14);
              ctx.strokeRect(b.x, by + 14, b.width, b.height - 14);
            } else if (b.type === 'flag') {
              // Flag pole
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(b.x, b.y, b.width, b.height);
              // Golden sphere on top
              ctx.fillStyle = '#fbbf24';
              ctx.beginPath();
              ctx.arc(b.x + 7, b.y, 10, 0, Math.PI * 2);
              ctx.fill();
              // Red Goal Pennant
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.moveTo(b.x + 15, b.y + 15);
              ctx.lineTo(b.x + 65, b.y + 35);
              ctx.lineTo(b.x + 15, b.y + 55);
              ctx.fill();
            }
          });

          // 4. Draw Floating Coins
          coinsRef.current.forEach((coin) => {
            if (!coin.collected) {
              const scaleX = Math.abs(Math.cos(coin.animFrame));
              ctx.save();
              ctx.translate(coin.x, coin.y);
              ctx.scale(Math.max(0.2, scaleX), 1);
              ctx.fillStyle = '#fbbf24';
              ctx.beginPath();
              ctx.arc(0, 0, 9, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#d97706';
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.restore();
            }
          });

          // 5. Draw Enemies
          enemiesRef.current.forEach((enemy) => {
            if (enemy.isAlive) {
              // Mushroom / Goomba monster
              ctx.fillStyle = '#b91c1c';
              ctx.beginPath();
              ctx.arc(enemy.x + 16, enemy.y + 14, 15, Math.PI, 0);
              ctx.lineTo(enemy.x + 28, enemy.y + 24);
              ctx.lineTo(enemy.x + 4, enemy.y + 24);
              ctx.fill();

              // Monster face & eyes
              ctx.fillStyle = '#fde047';
              ctx.fillRect(enemy.x + 8, enemy.y + 18, 16, 12);
              ctx.fillStyle = '#000000';
              ctx.fillRect(enemy.x + 10, enemy.y + 20, 3, 5);
              ctx.fillRect(enemy.x + 19, enemy.y + 20, 3, 5);

              // Feet
              ctx.fillStyle = '#78350f';
              ctx.fillRect(enemy.x + 2, enemy.y + 28, 10, 5);
              ctx.fillRect(enemy.x + 20, enemy.y + 28, 10, 5);
            }
          });

          // 6. Draw Hero Character (Mario-inspired adventurer)
          ctx.save();
          const facingRight = p.vx >= 0;
          ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
          if (!facingRight) ctx.scale(-1, 1);

          // Red Cap & Head
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-10, -18, 22, 10);
          ctx.fillRect(-6, -18, 18, 6);

          // Face
          ctx.fillStyle = '#fcd34d';
          ctx.fillRect(-8, -8, 16, 12);

          // Mustache & Eye
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(2, -5, 3, 3); // eye
          ctx.fillRect(-2, 0, 10, 4); // mustache

          // Blue Overalls / Body
          ctx.fillStyle = '#2563eb';
          ctx.fillRect(-10, 4, 20, 12);

          // Red shirt arms
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-12, 4, 4, 8);
          ctx.fillRect(8, 4, 4, 8);

          // Brown boots
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-10, 16, 8, 4);
          ctx.fillRect(2, 16, 8, 4);

          ctx.restore();

          // 7. Draw Particles
          particlesRef.current.forEach((pt) => {
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
            ctx.fill();
          });

          ctx.restore(); // restore camera transform
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, restartCurrentLife, onScoreUpdate]);

  // Touch controls for mobile
  const handleTouchButton = (btn: 'left' | 'right' | 'jump', isDown: boolean) => {
    sound.unlockMobileAudio();
    if (btn === 'left') keysRef.current.left = isDown;
    if (btn === 'right') keysRef.current.right = isDown;
    if (btn === 'jump') {
      if (isDown && isGroundedRef.current) {
        playerRef.current.vy = -12.5;
        sound.playJump();
      }
      keysRef.current.jump = isDown;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-2 sm:p-3 select-none">
      {/* Top HUD */}
      <div className="w-full max-w-[620px] flex items-center justify-between mb-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur rounded-xl border border-slate-800 text-sm shadow">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Score</span>
            <span className="text-lg font-bold font-mono text-cyan-400">{score}</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <span className="text-base">🪙</span>
            <span className="font-mono">{coins}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-rose-500 font-bold">
            <Heart className="w-4 h-4 fill-current" />
            <span className="font-mono text-sm">x{lives}</span>
          </div>

          <button
            onClick={startGame}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative w-full max-w-[620px] aspect-[4/3] max-h-[440px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-sky-300 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={450}
          className="w-full h-full block cursor-pointer"
        />

        {/* Start / Game Over / Victory Overlay */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in z-20">
            {gameState === 'idle' && (
              <>
                <div className="w-16 h-16 mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-wide mb-1">
                  Super Jump World
                </h3>
                <p className="text-xs text-slate-300 max-w-xs mb-5">
                  Run, jump over enemies, hit question blocks for gold coins, and reach the flag pole!
                </p>
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-extrabold rounded-xl shadow-lg transition-transform transform active:scale-95 text-sm"
                >
                  START GAME
                </button>
              </>
            )}

            {gameState === 'gameover' && (
              <>
                <div className="w-14 h-14 mb-2 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-lg">
                  <RotateCcw className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-rose-400 mb-1">GAME OVER</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Final Score: <span className="font-bold text-white font-mono">{score}</span> | Coins: <span className="font-bold text-amber-400 font-mono">{coins}</span>
                </p>
                <button
                  onClick={startGame}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Play Again
                </button>
              </>
            )}

            {gameState === 'won' && (
              <>
                <div className="w-16 h-16 mb-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg animate-bounce">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-emerald-400 mb-1">COURSE CLEARED!</h3>
                <p className="text-xs text-slate-300 mb-4">
                  You reached the flag! Total Score: <span className="font-bold text-white font-mono">{score}</span>
                </p>
                <button
                  onClick={startGame}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  Play Again
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile On-Screen Controls */}
      <div className="w-full max-w-[620px] flex items-center justify-between mt-3 px-2">
        {/* Left / Right directional buttons */}
        <div className="flex items-center gap-3">
          <button
            onPointerDown={() => handleTouchButton('left', true)}
            onPointerUp={() => handleTouchButton('left', false)}
            onPointerLeave={() => handleTouchButton('left', false)}
            className="w-13 h-13 rounded-2xl bg-slate-900 border border-slate-700 active:bg-cyan-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onPointerDown={() => handleTouchButton('right', true)}
            onPointerUp={() => handleTouchButton('right', false)}
            onPointerLeave={() => handleTouchButton('right', false)}
            className="w-13 h-13 rounded-2xl bg-slate-900 border border-slate-700 active:bg-cyan-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            aria-label="Move Right"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Big Jump Button */}
        <div>
          <button
            onPointerDown={() => handleTouchButton('jump', true)}
            onPointerUp={() => handleTouchButton('jump', false)}
            onPointerLeave={() => handleTouchButton('jump', false)}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 active:from-amber-600 active:to-rose-600 text-white font-black flex flex-col items-center justify-center shadow-xl shadow-amber-500/20 active:scale-95 transition-transform"
            aria-label="Jump"
          >
            <ArrowUp className="w-6 h-6 stroke-[3]" />
            <span className="text-[10px] uppercase font-extrabold -mt-0.5">JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
