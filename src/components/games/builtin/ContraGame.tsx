import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../../utils/audio';
import { Play, RotateCcw, Pause, Volume2, VolumeX, Bomb, Crosshair, ArrowUp, Zap, Shield, Trophy } from 'lucide-react';

interface Props {
  onScoreUpdate?: (score: number) => void;
}

type WeaponType = 'rifle' | 'machine' | 'spread' | 'laser';

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 1 | -1;
  aimUp: boolean;
  aimDown: boolean;
  isCrouching: boolean;
  isJumping: boolean;
  jumpAngle: number;
  runFrame: number;
  health: number;
  maxHealth: number;
  lives: number;
  weapon: WeaponType;
  grenades: number;
  invincibleTimer: number;
  shootCooldown: number;
  isAlive: boolean;
  respawnTimer: number;
  shieldTimer: number;
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isPlayer: boolean;
  damage: number;
  piercing?: boolean;
}

interface Grenade {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fuseTimer: number;
  bounces: number;
}

interface Explosion {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  damageApplied?: boolean;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  isThin?: boolean; // Can drop down through with Down + Jump
  type?: 'ground' | 'bridge' | 'steel' | 'rock';
}

interface Enemy {
  id: number;
  type: 'infantry' | 'runner' | 'sniper' | 'turret' | 'drone' | 'armored' | 'boss';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  isAlive: boolean;
  facing: 1 | -1;
  shootCooldown: number;
  shootInterval: number;
  flashTimer: number;
  patrolMinX: number;
  patrolMaxX: number;
  turretAngle?: number;
  bossPhase?: number;
}

interface PodItem {
  id: number;
  x: number;
  y: number;
  vx: number;
  type: WeaponType | 'grenade' | 'barrier';
  collected: boolean;
}

interface FloatingPod {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  itemType: WeaponType | 'grenade' | 'barrier';
  health: number;
  isAlive: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

export const ContraGame: React.FC<Props> = ({ onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level Game States
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'level_complete' | 'gameover' | 'victory'>('menu');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('gamenest_contra_highscore') || '0', 10);
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sound.enabled);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  // HUD Reactive States
  const [playerHealth, setPlayerHealth] = useState<number>(100);
  const [playerLives, setPlayerLives] = useState<number>(3);
  const [playerWeapon, setPlayerWeapon] = useState<WeaponType>('rifle');
  const [playerGrenades, setPlayerGrenades] = useState<number>(4);
  const [bossHealthPercent, setBossHealthPercent] = useState<number | null>(null);

  // Canvas logical dimensions (16:9 arcade ratio)
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 360;

  // Level World Size
  const LEVEL_LENGTHS = [3200, 3600, 4000];

  // Game World Refs
  const cameraXRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const animationFrameIdRef = useRef<number | null>(null);

  // Player State Ref
  const playerRef = useRef<Player>({
    x: 80,
    y: 220,
    vx: 0,
    vy: 0,
    width: 26,
    height: 38,
    isGrounded: false,
    facing: 1,
    aimUp: false,
    aimDown: false,
    isCrouching: false,
    isJumping: false,
    jumpAngle: 0,
    runFrame: 0,
    health: 100,
    maxHealth: 100,
    lives: 3,
    weapon: 'rifle',
    grenades: 4,
    invincibleTimer: 0,
    shootCooldown: 0,
    isAlive: true,
    respawnTimer: 0,
    shieldTimer: 0,
  });

  // Entities Refs
  const platformsRef = useRef<Platform[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const grenadesRef = useRef<Grenade[]>([]);
  const explosionsRef = useRef<Explosion[]>([]);
  const podsRef = useRef<FloatingPod[]>([]);
  const itemsRef = useRef<PodItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const nextEntityIdRef = useRef<number>(1);
  const podSpawnTimerRef = useRef<number>(300);

  // Input Controls Ref
  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    shoot: boolean;
    grenade: boolean;
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    shoot: false,
    grenade: false,
  });

  // Virtual Joystick State for Mobile
  const joystickTouchIdRef = useRef<number | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [joystickThumb, setJoystickThumb] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState<boolean>(false);

  // Screen orientation check
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
      }
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Level Initialization
  const setupLevel = useCallback((levelNum: number, keepStats = false) => {
    const levelLength = LEVEL_LENGTHS[levelNum - 1] || 3200;
    cameraXRef.current = 0;

    // Reset player position
    playerRef.current = {
      ...playerRef.current,
      x: 80,
      y: 200,
      vx: 0,
      vy: 0,
      isGrounded: false,
      isCrouching: false,
      isJumping: false,
      health: 100,
      lives: keepStats ? playerRef.current.lives : 3,
      weapon: keepStats ? playerRef.current.weapon : 'rifle',
      grenades: keepStats ? Math.max(playerRef.current.grenades, 3) : 4,
      invincibleTimer: 120, // 2 seconds safety on spawn
      isAlive: true,
      respawnTimer: 0,
      shieldTimer: 0,
    };

    setPlayerHealth(100);
    setPlayerLives(playerRef.current.lives);
    setPlayerWeapon(playerRef.current.weapon);
    setPlayerGrenades(playerRef.current.grenades);
    setBossHealthPercent(null);

    bulletsRef.current = [];
    grenadesRef.current = [];
    explosionsRef.current = [];
    podsRef.current = [];
    itemsRef.current = [];
    particlesRef.current = [];
    podSpawnTimerRef.current = 240;

    // Generate Platforms for current level
    const newPlatforms: Platform[] = [];
    const newEnemies: Enemy[] = [];

    if (levelNum === 1) {
      // LEVEL 1: JUNGLE OUTPOST
      // Ground with river water gaps
      for (let x = 0; x < levelLength - 500; x += 120) {
        // Pit gaps at 800-920, 1600-1740, 2200-2340
        if ((x >= 800 && x < 940) || (x >= 1600 && x < 1760) || (x >= 2200 && x < 2360)) {
          continue;
        }
        newPlatforms.push({ x, y: 300, width: 130, height: 60, type: 'ground' });
      }

      // Wooden Bridges across gaps
      newPlatforms.push({ x: 820, y: 240, width: 100, height: 14, isThin: true, type: 'bridge' });
      newPlatforms.push({ x: 1620, y: 230, width: 120, height: 14, isThin: true, type: 'bridge' });
      newPlatforms.push({ x: 2220, y: 240, width: 120, height: 14, isThin: true, type: 'bridge' });

      // High jungle tree canopy & rock ledges
      const jungleLedges = [
        { x: 200, y: 220, width: 140, isThin: true },
        { x: 380, y: 160, width: 160, isThin: true },
        { x: 600, y: 210, width: 140, isThin: true },
        { x: 1020, y: 220, width: 180, isThin: true },
        { x: 1250, y: 170, width: 160, isThin: true },
        { x: 1450, y: 220, width: 130, isThin: true },
        { x: 1840, y: 210, width: 160, isThin: true },
        { x: 2040, y: 160, width: 150, isThin: true },
        { x: 2420, y: 220, width: 180, isThin: true },
      ];
      jungleLedges.forEach((l) => newPlatforms.push({ ...l, height: 14, type: 'rock' }));

      // Boss Arena Ground Platform
      newPlatforms.push({ x: levelLength - 550, y: 300, width: 550, height: 60, type: 'ground' });
      newPlatforms.push({ x: levelLength - 450, y: 210, width: 160, height: 14, isThin: true, type: 'bridge' });

      // Spawn Jungle Enemies
      const enemySpawns = [
        { x: 300, y: 260, type: 'infantry' as const },
        { x: 420, y: 120, type: 'sniper' as const },
        { x: 520, y: 260, type: 'runner' as const },
        { x: 650, y: 170, type: 'turret' as const },
        { x: 740, y: 260, type: 'runner' as const },
        { x: 1080, y: 180, type: 'turret' as const },
        { x: 1140, y: 260, type: 'infantry' as const },
        { x: 1300, y: 130, type: 'drone' as const },
        { x: 1480, y: 260, type: 'armored' as const },
        { x: 1700, y: 120, type: 'drone' as const },
        { x: 1900, y: 260, type: 'runner' as const },
        { x: 2100, y: 120, type: 'sniper' as const },
        { x: 2500, y: 260, type: 'armored' as const },
      ];

      enemySpawns.forEach((s) => {
        newEnemies.push({
          id: nextEntityIdRef.current++,
          type: s.type,
          x: s.x,
          y: s.y,
          vx: s.type === 'runner' ? -2.2 : -0.8,
          vy: 0,
          width: s.type === 'turret' ? 32 : s.type === 'drone' ? 30 : 24,
          height: s.type === 'turret' ? 24 : s.type === 'drone' ? 20 : 36,
          health: s.type === 'armored' ? 45 : s.type === 'turret' ? 30 : 15,
          maxHealth: s.type === 'armored' ? 45 : s.type === 'turret' ? 30 : 15,
          isAlive: true,
          facing: -1,
          shootCooldown: Math.floor(Math.random() * 60),
          shootInterval: s.type === 'sniper' ? 90 : s.type === 'turret' ? 80 : 110,
          flashTimer: 0,
          patrolMinX: s.x - 80,
          patrolMaxX: s.x + 80,
          turretAngle: 0,
        });
      });

      // STAGE 1 BOSS: Jungle Fortress Defense Cannon
      newEnemies.push({
        id: nextEntityIdRef.current++,
        type: 'boss',
        x: levelLength - 160,
        y: 180,
        vx: 0,
        vy: 0,
        width: 110,
        height: 120,
        health: 220,
        maxHealth: 220,
        isAlive: true,
        facing: -1,
        shootCooldown: 60,
        shootInterval: 50,
        flashTimer: 0,
        patrolMinX: levelLength - 160,
        patrolMaxX: levelLength - 160,
        bossPhase: 1,
      });
    } else if (levelNum === 2) {
      // LEVEL 2: MILITARY BASE
      for (let x = 0; x < levelLength - 500; x += 140) {
        if ((x >= 900 && x < 1080) || (x >= 1800 && x < 1980) || (x >= 2600 && x < 2780)) continue;
        newPlatforms.push({ x, y: 300, width: 150, height: 60, type: 'steel' });
      }

      // Steel Girders & High Platforms
      const steelGirders = [
        { x: 180, y: 220, width: 160, isThin: true },
        { x: 420, y: 160, width: 180, isThin: true },
        { x: 680, y: 210, width: 140, isThin: true },
        { x: 920, y: 230, width: 140, isThin: true },
        { x: 1200, y: 220, width: 170, isThin: true },
        { x: 1450, y: 160, width: 180, isThin: true },
        { x: 1820, y: 220, width: 140, isThin: true },
        { x: 2100, y: 200, width: 160, isThin: true },
        { x: 2350, y: 150, width: 180, isThin: true },
      ];
      steelGirders.forEach((g) => newPlatforms.push({ ...g, height: 14, type: 'steel' }));

      newPlatforms.push({ x: levelLength - 550, y: 300, width: 550, height: 60, type: 'steel' });
      newPlatforms.push({ x: levelLength - 440, y: 200, width: 160, height: 14, isThin: true, type: 'steel' });

      // Spawn Military Enemies
      const baseEnemies = [
        { x: 300, y: 260, type: 'runner' as const },
        { x: 480, y: 120, type: 'turret' as const },
        { x: 620, y: 260, type: 'armored' as const },
        { x: 800, y: 100, type: 'drone' as const },
        { x: 1000, y: 190, type: 'sniper' as const },
        { x: 1300, y: 260, type: 'armored' as const },
        { x: 1500, y: 120, type: 'turret' as const },
        { x: 1700, y: 100, type: 'drone' as const },
        { x: 2000, y: 260, type: 'runner' as const },
        { x: 2200, y: 160, type: 'armored' as const },
      ];

      baseEnemies.forEach((s) => {
        newEnemies.push({
          id: nextEntityIdRef.current++,
          type: s.type,
          x: s.x,
          y: s.y,
          vx: s.type === 'runner' ? -2.4 : -0.9,
          vy: 0,
          width: s.type === 'turret' ? 32 : s.type === 'drone' ? 30 : 24,
          height: s.type === 'turret' ? 24 : s.type === 'drone' ? 20 : 36,
          health: s.type === 'armored' ? 55 : s.type === 'turret' ? 35 : 20,
          maxHealth: s.type === 'armored' ? 55 : s.type === 'turret' ? 35 : 20,
          isAlive: true,
          facing: -1,
          shootCooldown: Math.floor(Math.random() * 50),
          shootInterval: 75,
          flashTimer: 0,
          patrolMinX: s.x - 70,
          patrolMaxX: s.x + 70,
        });
      });

      // STAGE 2 BOSS: Heavy Battle Mech Tank
      newEnemies.push({
        id: nextEntityIdRef.current++,
        type: 'boss',
        x: levelLength - 200,
        y: 190,
        vx: 0,
        vy: 0,
        width: 140,
        height: 110,
        health: 320,
        maxHealth: 320,
        isAlive: true,
        facing: -1,
        shootCooldown: 50,
        shootInterval: 40,
        flashTimer: 0,
        patrolMinX: levelLength - 220,
        patrolMaxX: levelLength - 160,
        bossPhase: 1,
      });
    } else {
      // LEVEL 3: DESERT FORTRESS
      for (let x = 0; x < levelLength - 500; x += 130) {
        if ((x >= 850 && x < 1020) || (x >= 1700 && x < 1880) || (x >= 2500 && x < 2680)) continue;
        newPlatforms.push({ x, y: 300, width: 140, height: 60, type: 'ground' });
      }

      // Desert ruins stone platforms
      const desertRuins = [
        { x: 220, y: 220, width: 150, isThin: true },
        { x: 450, y: 160, width: 160, isThin: true },
        { x: 700, y: 210, width: 140, isThin: true },
        { x: 880, y: 230, width: 120, isThin: true },
        { x: 1200, y: 200, width: 180, isThin: true },
        { x: 1450, y: 150, width: 160, isThin: true },
        { x: 1920, y: 210, width: 150, isThin: true },
        { x: 2150, y: 170, width: 170, isThin: true },
        { x: 2750, y: 220, width: 150, isThin: true },
      ];
      desertRuins.forEach((r) => newPlatforms.push({ ...r, height: 14, type: 'rock' }));

      newPlatforms.push({ x: levelLength - 550, y: 300, width: 550, height: 60, type: 'ground' });
      newPlatforms.push({ x: levelLength - 460, y: 200, width: 180, height: 14, isThin: true, type: 'rock' });

      // Spawn Desert Enemies
      const desertEnemies = [
        { x: 300, y: 260, type: 'armored' as const },
        { x: 480, y: 120, type: 'turret' as const },
        { x: 650, y: 100, type: 'drone' as const },
        { x: 920, y: 190, type: 'runner' as const },
        { x: 1250, y: 160, type: 'turret' as const },
        { x: 1500, y: 260, type: 'armored' as const },
        { x: 1750, y: 100, type: 'drone' as const },
        { x: 2000, y: 260, type: 'runner' as const },
        { x: 2200, y: 130, type: 'sniper' as const },
        { x: 2800, y: 260, type: 'armored' as const },
      ];

      desertEnemies.forEach((s) => {
        newEnemies.push({
          id: nextEntityIdRef.current++,
          type: s.type,
          x: s.x,
          y: s.y,
          vx: s.type === 'runner' ? -2.6 : -1.0,
          vy: 0,
          width: s.type === 'turret' ? 32 : s.type === 'drone' ? 30 : 24,
          height: s.type === 'turret' ? 24 : s.type === 'drone' ? 20 : 36,
          health: s.type === 'armored' ? 65 : s.type === 'turret' ? 40 : 25,
          maxHealth: s.type === 'armored' ? 65 : s.type === 'turret' ? 40 : 25,
          isAlive: true,
          facing: -1,
          shootCooldown: Math.floor(Math.random() * 45),
          shootInterval: 70,
          flashTimer: 0,
          patrolMinX: s.x - 70,
          patrolMaxX: s.x + 70,
        });
      });

      // STAGE 3 FINAL BOSS: Desert Dreadnought Fortress Core
      newEnemies.push({
        id: nextEntityIdRef.current++,
        type: 'boss',
        x: levelLength - 190,
        y: 160,
        vx: 0,
        vy: 0,
        width: 150,
        height: 140,
        health: 420,
        maxHealth: 420,
        isAlive: true,
        facing: -1,
        shootCooldown: 40,
        shootInterval: 35,
        flashTimer: 0,
        patrolMinX: levelLength - 190,
        patrolMaxX: levelLength - 190,
        bossPhase: 1,
      });
    }

    platformsRef.current = newPlatforms;
    enemiesRef.current = newEnemies;
  }, [LEVEL_LENGTHS]);

  // Start / Restart
  const handleStartGame = useCallback((level = 1) => {
    sound.unlockMobileAudio();
    setCurrentLevel(level);
    setupLevel(level, false);
    setScore(0);
    setGameState('playing');
    sound.playScore();
  }, [setupLevel]);

  // Player Fire Action
  const shootBullet = useCallback(() => {
    const p = playerRef.current;
    if (!p.isAlive || p.shootCooldown > 0) return;

    sound.unlockMobileAudio();

    // Determine shot trajectory based on aim direction
    let dirX: number = p.facing;
    let dirY: number = 0;

    if (p.aimUp) {
      if (keysRef.current.left || keysRef.current.right) {
        dirX = p.facing * 0.707;
        dirY = -0.707;
      } else {
        dirX = 0;
        dirY = -1;
      }
    } else if (p.aimDown && !p.isGrounded) {
      dirX = p.facing * 0.707;
      dirY = 0.707;
    }

    const muzzleX = p.x + (dirX >= 0 ? p.width + 4 : -4);
    const muzzleY = p.isCrouching && p.isGrounded ? p.y + 12 : p.aimUp ? p.y - 4 : p.y + 10;
    const speed = 10.5;

    if (p.weapon === 'rifle') {
      sound.playMachineGun();
      p.shootCooldown = 9; // ~6.6 shots/sec
      bulletsRef.current.push({
        id: nextEntityIdRef.current++,
        x: muzzleX,
        y: muzzleY,
        vx: dirX * speed,
        vy: dirY * speed,
        radius: 3.5,
        color: '#facc15',
        isPlayer: true,
        damage: 12,
      });
    } else if (p.weapon === 'machine') {
      sound.playMachineGun();
      p.shootCooldown = 5; // Rapid fire!
      bulletsRef.current.push({
        id: nextEntityIdRef.current++,
        x: muzzleX,
        y: muzzleY,
        vx: dirX * (speed + 2),
        vy: dirY * (speed + 2),
        radius: 4.5,
        color: '#f97316',
        isPlayer: true,
        damage: 16,
      });
    } else if (p.weapon === 'spread') {
      sound.playSpreadGun();
      p.shootCooldown = 15; // 5-Way Fan Spread Shot!
      const baseAngle = Math.atan2(dirY, dirX);
      const angles = [-0.35, -0.17, 0, 0.17, 0.35];

      angles.forEach((angOffset) => {
        const finalAng = baseAngle + angOffset;
        bulletsRef.current.push({
          id: nextEntityIdRef.current++,
          x: muzzleX,
          y: muzzleY,
          vx: Math.cos(finalAng) * speed,
          vy: Math.sin(finalAng) * speed,
          radius: 5,
          color: '#fbbf24',
          isPlayer: true,
          damage: 18,
        });
      });
    } else if (p.weapon === 'laser') {
      sound.playLaserGun();
      p.shootCooldown = 16;
      bulletsRef.current.push({
        id: nextEntityIdRef.current++,
        x: muzzleX,
        y: muzzleY,
        vx: dirX * (speed + 4),
        vy: dirY * (speed + 4),
        radius: 6,
        color: '#38bdf8',
        isPlayer: true,
        damage: 42,
        piercing: true,
      });
    }

    // Add gun muzzle flash particle
    particlesRef.current.push({
      x: muzzleX,
      y: muzzleY,
      vx: dirX * 2,
      vy: dirY * 2,
      color: '#fef08a',
      life: 5,
      maxLife: 5,
      size: 6,
    });
  }, []);

  // Throw Grenade Action
  const throwGrenade = useCallback(() => {
    const p = playerRef.current;
    if (!p.isAlive || p.grenades <= 0) return;

    sound.unlockMobileAudio();
    p.grenades -= 1;
    setPlayerGrenades(p.grenades);
    sound.playGrenadeThrow();

    const throwVx = p.facing * 5.5 + p.vx * 0.4;
    const throwVy = p.aimUp ? -9.5 : -5.5;

    grenadesRef.current.push({
      id: nextEntityIdRef.current++,
      x: p.x + (p.facing === 1 ? p.width : 0),
      y: p.y + 4,
      vx: throwVx,
      vy: throwVy,
      fuseTimer: 70, // ~1.2 seconds fuse
      bounces: 0,
    });
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
        return;
      }

      const k = keysRef.current;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') k.left = true;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') k.right = true;
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') k.up = true;
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') k.down = true;

      if (e.key === ' ' || e.code === 'Space') {
        k.jump = true;
      }

      if (e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'z') {
        k.shoot = true;
        shootBullet();
      }

      if (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'x') {
        k.grenade = true;
        throwGrenade();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = keysRef.current;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') k.left = false;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') k.right = false;
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') k.up = false;
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') k.down = false;
      if (e.key === ' ' || e.code === 'Space') k.jump = false;
      if (e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'z') k.shoot = false;
      if (e.key.toLowerCase() === 'k' || e.key.toLowerCase() === 'x') k.grenade = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shootBullet, throwGrenade]);

  // Virtual Joystick Pointer Handlers for Touch Devices
  const handleJoystickStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    sound.unlockMobileAudio();
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    joystickCenterRef.current = { x: centerX, y: centerY };
    joystickTouchIdRef.current = e.pointerId;
    setIsJoystickActive(true);

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    updateJoystickPosition(deltaX, deltaY);
  };

  const handleJoystickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isJoystickActive || joystickTouchIdRef.current !== e.pointerId) return;
    e.preventDefault();
    const deltaX = e.clientX - joystickCenterRef.current.x;
    const deltaY = e.clientY - joystickCenterRef.current.y;
    updateJoystickPosition(deltaX, deltaY);
  };

  const handleJoystickEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickTouchIdRef.current === e.pointerId) {
      joystickTouchIdRef.current = null;
      setIsJoystickActive(false);
      setJoystickThumb({ x: 0, y: 0 });
      keysRef.current.left = false;
      keysRef.current.right = false;
      keysRef.current.up = false;
      keysRef.current.down = false;
    }
  };

  const updateJoystickPosition = (dx: number, dy: number) => {
    const maxRadius = 38;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);
    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;
    setJoystickThumb({ x: thumbX, y: thumbY });

    // Map to 8-directional digital inputs
    const deadzone = 12;
    const k = keysRef.current;
    if (dist < deadzone) {
      k.left = false;
      k.right = false;
      k.up = false;
      k.down = false;
      return;
    }

    k.left = dx < -14;
    k.right = dx > 14;
    k.up = dy < -16;
    k.down = dy > 18;
  };

  // Main Simulation & Render Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let isMounted = true;

    const tick = (currentTime: number) => {
      if (!isMounted) return;

      const dt = Math.min(32, currentTime - lastTimeRef.current) / 16.67; // Normalized 60fps delta
      lastTimeRef.current = currentTime;

      const p = playerRef.current;
      const k = keysRef.current;
      const levelLength = LEVEL_LENGTHS[currentLevel - 1] || 3200;

      // 1. UPDATE PLAYER
      if (p.isAlive) {
        // Continuous shooting when button held
        if (k.shoot) {
          shootBullet();
        }

        if (p.shootCooldown > 0) p.shootCooldown -= dt;
        if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
        if (p.shieldTimer > 0) p.shieldTimer -= dt;

        // Aiming states
        p.aimUp = k.up;
        p.aimDown = k.down;
        p.isCrouching = k.down && p.isGrounded && !k.left && !k.right;

        // Horizontal Movement
        const speed = p.isCrouching ? 0 : 3.6;
        if (k.left && !k.right) {
          p.vx = -speed;
          p.facing = -1;
          p.runFrame += 0.25 * dt;
        } else if (k.right && !k.left) {
          p.vx = speed;
          p.facing = 1;
          p.runFrame += 0.25 * dt;
        } else {
          p.vx = 0;
          p.runFrame = 0;
        }

        // Jump physics & Drop-through platforms (Down + Jump)
        if (k.jump && p.isGrounded) {
          if (k.down) {
            // Drop down through thin bridge/platform!
            p.y += 4;
            p.vy = 2;
            p.isGrounded = false;
            k.jump = false;
          } else {
            p.vy = -7.8;
            p.isGrounded = false;
            p.isJumping = true;
            sound.playJump();
            k.jump = false;
          }
        }

        // Apply Gravity
        p.vy += 0.42 * dt;
        if (p.vy > 9.5) p.vy = 9.5;

        // Apply velocities
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Jump somersault tuck spin
        if (!p.isGrounded) {
          p.jumpAngle += p.facing * 0.2 * dt;
        } else {
          p.jumpAngle = 0;
          p.isJumping = false;
        }

        // Level horizontal boundaries
        if (p.x < 10) p.x = 10;
        if (p.x > levelLength - 40) p.x = levelLength - 40;

        // Platform Collisions
        p.isGrounded = false;
        const playerBottom = p.y + p.height;
        const playerPrevBottom = playerBottom - p.vy * dt;

        platformsRef.current.forEach((plat) => {
          const isWithinX = p.x + p.width > plat.x + 4 && p.x < plat.x + plat.width - 4;
          if (isWithinX) {
            // Landing on top of platform
            if (playerPrevBottom <= plat.y + 6 && playerBottom >= plat.y && p.vy >= 0) {
              p.y = plat.y - p.height;
              p.vy = 0;
              p.isGrounded = true;
              p.isJumping = false;
            }
          }
        });

        // Pit death check
        if (p.y > 380) {
          p.health = 0;
        }

        // Check Player Death
        if (p.health <= 0) {
          p.isAlive = false;
          p.respawnTimer = 80;
          sound.playExplosion();

          // Blood / commando defeat particles
          for (let i = 0; i < 24; i++) {
            particlesRef.current.push({
              x: p.x + p.width / 2,
              y: p.y + p.height / 2,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6 - 2,
              color: i % 2 === 0 ? '#ef4444' : '#f97316',
              life: 25,
              maxLife: 25,
              size: 4.5,
            });
          }
        }
      } else {
        // Player Respawning
        p.respawnTimer -= dt;
        if (p.respawnTimer <= 0) {
          p.lives -= 1;
          setPlayerLives(p.lives);
          if (p.lives < 0) {
            setGameState('gameover');
            sound.playGameOver();
            return;
          } else {
            // Respawn from sky parachute/drop
            p.x = Math.max(cameraXRef.current + 60, p.x - 60);
            p.y = 80;
            p.vx = 0;
            p.vy = 0;
            p.health = 100;
            p.weapon = 'rifle';
            p.invincibleTimer = 160;
            p.isAlive = true;
            setPlayerHealth(100);
            setPlayerWeapon('rifle');
            sound.playCoin();
          }
        }
      }

      setPlayerHealth(Math.max(0, p.health));

      // 2. CAMERA TRACKING
      // Camera smoothly follows player forward, prevents moving backward too far
      const targetCamX = p.x - CANVAS_WIDTH * 0.35;
      if (targetCamX > cameraXRef.current) {
        cameraXRef.current += (targetCamX - cameraXRef.current) * 0.1 * dt;
      }
      cameraXRef.current = Math.max(0, Math.min(cameraXRef.current, levelLength - CANVAS_WIDTH));

      // 3. SPAWN FLOATING WEAPON PODS
      podSpawnTimerRef.current -= dt;
      if (podSpawnTimerRef.current <= 0) {
        podSpawnTimerRef.current = 320 + Math.random() * 120;
        const types: (WeaponType | 'grenade' | 'barrier')[] = ['spread', 'machine', 'laser', 'grenade', 'barrier'];
        const chosen = types[Math.floor(Math.random() * types.length)];
        podsRef.current.push({
          id: nextEntityIdRef.current++,
          x: cameraXRef.current + CANVAS_WIDTH + 20,
          y: 70 + Math.random() * 60,
          vx: -2.2,
          vy: Math.sin(currentTime * 0.003) * 0.8,
          itemType: chosen,
          health: 1,
          isAlive: true,
        });
      }

      // Update Flying Pods
      for (let pi = podsRef.current.length - 1; pi >= 0; pi--) {
        const pod = podsRef.current[pi];
        pod.x += pod.vx * dt;
        pod.y += Math.sin((currentTime + pod.id * 100) * 0.005) * 0.8;

        if (pod.x < cameraXRef.current - 60) {
          podsRef.current.splice(pi, 1);
        }
      }

      // Update Dropped Weapon Items
      for (let ii = itemsRef.current.length - 1; ii >= 0; ii--) {
        const item = itemsRef.current[ii];
        item.y += 1.8 * dt;

        // Check landing on platform
        platformsRef.current.forEach((plat) => {
          if (item.x >= plat.x && item.x <= plat.x + plat.width && item.y >= plat.y - 12 && item.y <= plat.y + 4) {
            item.y = plat.y - 12;
          }
        });

        // Player pickup
        if (
          p.isAlive &&
          Math.abs(p.x + p.width / 2 - item.x) < 24 &&
          Math.abs(p.y + p.height / 2 - item.y) < 28
        ) {
          sound.playPowerup();
          if (item.type === 'grenade') {
            p.grenades = Math.min(8, p.grenades + 3);
            setPlayerGrenades(p.grenades);
          } else if (item.type === 'barrier') {
            p.shieldTimer = 300; // 5 seconds barrier!
            sound.playZenChime();
          } else {
            p.weapon = item.type;
            setPlayerWeapon(item.type);
          }
          setScore((s) => s + 500);
          itemsRef.current.splice(ii, 1);
        }
      }

      // 4. UPDATE GRENADES
      for (let gi = grenadesRef.current.length - 1; gi >= 0; gi--) {
        const g = grenadesRef.current[gi];
        g.vy += 0.38 * dt;
        g.x += g.vx * dt;
        g.y += g.vy * dt;
        g.fuseTimer -= dt;

        // Platform bounce
        platformsRef.current.forEach((plat) => {
          if (g.x >= plat.x && g.x <= plat.x + plat.width && g.y >= plat.y - 6 && g.y <= plat.y + 10 && g.vy > 0) {
            g.y = plat.y - 6;
            g.vy = -g.vy * 0.45;
            g.vx *= 0.7;
            g.bounces += 1;
            sound.playBounce();
          }
        });

        // Detonate
        if (g.fuseTimer <= 0 || g.bounces >= 3) {
          sound.playExplosion();
          explosionsRef.current.push({
            x: g.x,
            y: g.y,
            radius: 8,
            maxRadius: 55,
            life: 18,
            maxLife: 18,
          });
          grenadesRef.current.splice(gi, 1);
        }
      }

      // 5. UPDATE EXPLOSIONS & DAMAGE AREA
      for (let xi = explosionsRef.current.length - 1; xi >= 0; xi--) {
        const exp = explosionsRef.current[xi];
        exp.life -= dt;
        exp.radius += (exp.maxRadius - exp.radius) * 0.25 * dt;

        if (!exp.damageApplied) {
          exp.damageApplied = true;
          // Damage all enemies in blast radius
          enemiesRef.current.forEach((en) => {
            const dist = Math.hypot(en.x + en.width / 2 - exp.x, en.y + en.height / 2 - exp.y);
            if (dist <= exp.maxRadius) {
              en.health -= 75; // Heavy grenade blast damage
              en.flashTimer = 8;
            }
          });
        }

        if (exp.life <= 0) {
          explosionsRef.current.splice(xi, 1);
        }
      }

      // 6. UPDATE BULLETS
      for (let bi = bulletsRef.current.length - 1; bi >= 0; bi--) {
        const b = bulletsRef.current[bi];
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Remove offscreen
        if (
          b.x < cameraXRef.current - 40 ||
          b.x > cameraXRef.current + CANVAS_WIDTH + 40 ||
          b.y < -30 ||
          b.y > CANVAS_HEIGHT + 30
        ) {
          bulletsRef.current.splice(bi, 1);
          continue;
        }

        if (b.isPlayer) {
          // Player bullet vs Pods
          for (let pi = podsRef.current.length - 1; pi >= 0; pi--) {
            const pod = podsRef.current[pi];
            if (Math.abs(b.x - pod.x) < 20 && Math.abs(b.y - pod.y) < 20) {
              sound.playExplosion();
              itemsRef.current.push({
                id: nextEntityIdRef.current++,
                x: pod.x,
                y: pod.y,
                vx: 0,
                type: pod.itemType,
                collected: false,
              });
              podsRef.current.splice(pi, 1);
              if (!b.piercing) bulletsRef.current.splice(bi, 1);
              break;
            }
          }

          // Player bullet vs Enemies
          for (let ei = enemiesRef.current.length - 1; ei >= 0; ei--) {
            const en = enemiesRef.current[ei];
            if (!en.isAlive) continue;

            const isHit =
              b.x >= en.x &&
              b.x <= en.x + en.width &&
              b.y >= en.y &&
              b.y <= en.y + en.height;

            if (isHit) {
              en.health -= b.damage;
              en.flashTimer = 6;
              sound.playHit();

              // Hit spark
              particlesRef.current.push({
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: '#facc15',
                life: 6,
                maxLife: 6,
                size: 3,
              });

              if (!b.piercing) {
                bulletsRef.current.splice(bi, 1);
              }
              break;
            }
          }
        } else {
          // Enemy bullet vs Player
          if (p.isAlive && p.invincibleTimer <= 0) {
            const playerHit =
              b.x >= p.x &&
              b.x <= p.x + p.width &&
              b.y >= p.y &&
              b.y <= p.y + p.height;

            if (playerHit) {
              bulletsRef.current.splice(bi, 1);
              if (p.shieldTimer > 0) {
                sound.playBounce();
              } else {
                p.health -= b.damage;
                p.invincibleTimer = 45; // brief invincibility frames
                sound.playHurt();
              }
            }
          }
        }
      }

      // 7. UPDATE ENEMIES
      for (let ei = enemiesRef.current.length - 1; ei >= 0; ei--) {
        const en = enemiesRef.current[ei];

        // Enemy defeat check
        if (en.health <= 0 && en.isAlive) {
          en.isAlive = false;
          sound.playExplosion();

          // Award score
          const reward = en.type === 'boss' ? 5000 : en.type === 'armored' ? 400 : 150;
          setScore((s) => s + reward);
          onScoreUpdate?.(score + reward);

          // Explosion particles
          const pCount = en.type === 'boss' ? 40 : 16;
          for (let i = 0; i < pCount; i++) {
            particlesRef.current.push({
              x: en.x + en.width / 2,
              y: en.y + en.height / 2,
              vx: (Math.random() - 0.5) * (en.type === 'boss' ? 10 : 6),
              vy: (Math.random() - 0.5) * (en.type === 'boss' ? 10 : 6),
              color: i % 2 === 0 ? '#ef4444' : '#f59e0b',
              life: 30,
              maxLife: 30,
              size: 5,
            });
          }

          if (en.type === 'boss') {
            // STAGE BOSS DEFEATED!
            sound.playScore();
            if (currentLevel < 3) {
              setGameState('level_complete');
            } else {
              setGameState('victory');
            }
            return;
          } else {
            enemiesRef.current.splice(ei, 1);
            continue;
          }
        }

        if (en.flashTimer > 0) en.flashTimer -= dt;

        // Active only if near camera viewport
        const isNearScreen = en.x > cameraXRef.current - 100 && en.x < cameraXRef.current + CANVAS_WIDTH + 150;
        if (!isNearScreen) continue;

        // Enemy AI & Movement
        if (en.type === 'runner') {
          en.x += en.vx * dt;
          if (en.x <= en.patrolMinX || en.x >= en.patrolMaxX) en.vx = -en.vx;
          en.facing = en.vx > 0 ? 1 : -1;
        } else if (en.type === 'infantry') {
          en.x += en.vx * dt;
          if (en.x <= en.patrolMinX || en.x >= en.patrolMaxX) en.vx = -en.vx;
          en.facing = p.x < en.x ? -1 : 1;
        } else if (en.type === 'drone') {
          en.x += Math.sin(currentTime * 0.003 + en.id) * 1.5;
          en.facing = p.x < en.x ? -1 : 1;
        } else if (en.type === 'boss') {
          setBossHealthPercent((en.health / en.maxHealth) * 100);
        }

        // Enemy Shooting
        en.shootCooldown -= dt;
        if (en.shootCooldown <= 0) {
          en.shootCooldown = en.shootInterval + Math.random() * 20;

          if (en.type === 'infantry' || en.type === 'sniper' || en.type === 'armored') {
            sound.playLaser();
            const angle = Math.atan2(p.y + 10 - en.y, p.x - en.x);
            bulletsRef.current.push({
              id: nextEntityIdRef.current++,
              x: en.x + (en.facing === 1 ? en.width : 0),
              y: en.y + 12,
              vx: Math.cos(angle) * 5.2,
              vy: Math.sin(angle) * 5.2,
              radius: 4,
              color: '#ef4444',
              isPlayer: false,
              damage: 20,
            });
          } else if (en.type === 'turret') {
            sound.playLaser();
            const angle = Math.atan2(p.y - en.y, p.x - en.x);
            bulletsRef.current.push({
              id: nextEntityIdRef.current++,
              x: en.x + 16,
              y: en.y + 10,
              vx: Math.cos(angle) * 5.8,
              vy: Math.sin(angle) * 5.8,
              radius: 5,
              color: '#f43f5e',
              isPlayer: false,
              damage: 25,
            });
          } else if (en.type === 'drone') {
            // Drops bomb straight down
            bulletsRef.current.push({
              id: nextEntityIdRef.current++,
              x: en.x + 14,
              y: en.y + 18,
              vx: 0,
              vy: 4.2,
              radius: 5,
              color: '#ea580c',
              isPlayer: false,
              damage: 30,
            });
          } else if (en.type === 'boss') {
            sound.playBossRoar();
            // Boss Multi-Shot Barrage
            const angleToPlayer = Math.atan2(p.y - en.y, p.x - en.x);
            [-0.3, 0, 0.3].forEach((offset) => {
              bulletsRef.current.push({
                id: nextEntityIdRef.current++,
                x: en.x + 20,
                y: en.y + 40,
                vx: Math.cos(angleToPlayer + offset) * 6,
                vy: Math.sin(angleToPlayer + offset) * 6,
                radius: 6,
                color: '#dc2626',
                isPlayer: false,
                damage: 30,
              });
            });
          }
        }

        // Enemy collision with player
        if (
          p.isAlive &&
          p.invincibleTimer <= 0 &&
          Math.abs(p.x + p.width / 2 - (en.x + en.width / 2)) < (p.width + en.width) / 2 &&
          Math.abs(p.y + p.height / 2 - (en.y + en.height / 2)) < (p.height + en.height) / 2
        ) {
          if (p.shieldTimer > 0) {
            en.health -= 25;
            sound.playBounce();
          } else {
            p.health -= 25;
            p.invincibleTimer = 45;
            sound.playHurt();
          }
        }
      }

      // 8. UPDATE PARTICLES
      for (let pi = particlesRef.current.length - 1; pi >= 0; pi--) {
        const pt = particlesRef.current[pi];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        if (pt.life <= 0) particlesRef.current.splice(pi, 1);
      }

      // 9. RENDER CANVAS SCENE
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const camX = cameraXRef.current;

          ctx.clearRect(0, 0, w, h);

          // Background Layers (Parallax)
          if (currentLevel === 1) {
            // Jungle Sky Gradient
            const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
            bgGrad.addColorStop(0, '#022c22');
            bgGrad.addColorStop(0.5, '#064e3b');
            bgGrad.addColorStop(1, '#047857');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // Parallax Jungle Mountains
            ctx.fillStyle = '#065f46';
            ctx.beginPath();
            ctx.moveTo(0, 240);
            for (let i = 0; i <= 8; i++) {
              const mx = i * 120 - (camX * 0.2) % 120;
              ctx.lineTo(mx, 160 + (i % 2 === 0 ? 30 : -20));
            }
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.fill();

            // Jungle Waterfalls
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            const waterfallX = 1400 - camX;
            if (waterfallX > -60 && waterfallX < w + 60) {
              ctx.fillRect(waterfallX, 140, 36, 160);
            }
          } else if (currentLevel === 2) {
            // Military Base Dark Steel
            const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
            bgGrad.addColorStop(0, '#0f172a');
            bgGrad.addColorStop(0.6, '#1e293b');
            bgGrad.addColorStop(1, '#334155');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // Metal Hangar Architecture
            ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 10; i++) {
              const hx = i * 100 - (camX * 0.3) % 100;
              ctx.strokeRect(hx, 40, 80, 260);
              ctx.beginPath();
              ctx.moveTo(hx, 40);
              ctx.lineTo(hx + 80, 300);
              ctx.stroke();
            }
          } else {
            // Desert Fortress Sunset
            const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
            bgGrad.addColorStop(0, '#7c2d12');
            bgGrad.addColorStop(0.5, '#ea580c');
            bgGrad.addColorStop(1, '#fbbf24');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // Sand Dunes Parallax
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.moveTo(0, 260);
            for (let i = 0; i <= 8; i++) {
              const dx = i * 140 - (camX * 0.25) % 140;
              ctx.quadraticCurveTo(dx + 70, 190, dx + 140, 260);
            }
            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.fill();
          }

          ctx.save();
          ctx.translate(-camX, 0);

          // Draw Platforms
          platformsRef.current.forEach((plat) => {
            if (plat.x + plat.width < camX - 50 || plat.x > camX + w + 50) return;

            if (plat.type === 'ground') {
              ctx.fillStyle = currentLevel === 3 ? '#92400e' : '#14532d';
              ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
              // Top grass/dirt trim
              ctx.fillStyle = currentLevel === 3 ? '#d97706' : '#22c55e';
              ctx.fillRect(plat.x, plat.y, plat.width, 6);
            } else if (plat.type === 'bridge') {
              ctx.fillStyle = '#78350f';
              ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
              ctx.strokeStyle = '#451a03';
              ctx.lineWidth = 1.5;
              for (let bx = plat.x; bx < plat.x + plat.width; bx += 14) {
                ctx.strokeRect(bx, plat.y, 14, plat.height);
              }
            } else if (plat.type === 'steel') {
              ctx.fillStyle = '#475569';
              ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
            } else {
              // Rock ledge
              ctx.fillStyle = '#57534e';
              ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
              ctx.fillStyle = '#78716c';
              ctx.fillRect(plat.x, plat.y, plat.width, 4);
            }
          });

          // Draw Water Pits Hazard (Bottom)
          if (currentLevel === 1) {
            ctx.fillStyle = 'rgba(14, 116, 144, 0.85)';
            ctx.fillRect(camX, 330, w, 30);
          }

          // Draw Dropped Weapon Items
          itemsRef.current.forEach((it) => {
            ctx.save();
            ctx.translate(it.x, it.y);
            // Glowing border
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(-10, -10, 20, 20, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const letter = it.type === 'machine' ? 'M' : it.type === 'spread' ? 'S' : it.type === 'laser' ? 'L' : it.type === 'barrier' ? 'B' : '💣';
            ctx.fillText(letter, 0, 1);
            ctx.restore();
          });

          // Draw Flying Pods
          podsRef.current.forEach((pod) => {
            ctx.save();
            ctx.translate(pod.x, pod.y);
            // Winged Capsule
            ctx.fillStyle = '#f8fafc';
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.lineTo(-8, -6);
            ctx.lineTo(-8, 6);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(18, 0);
            ctx.lineTo(8, -6);
            ctx.lineTo(8, 6);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#dc2626';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          });

          // Draw Enemies
          enemiesRef.current.forEach((en) => {
            if (!en.isAlive) return;
            ctx.save();
            ctx.translate(en.x, en.y);

            if (en.flashTimer > 0) {
              ctx.fillStyle = '#ffffff';
            } else if (en.type === 'armored') {
              ctx.fillStyle = '#475569';
            } else if (en.type === 'runner') {
              ctx.fillStyle = '#dc2626';
            } else if (en.type === 'turret') {
              ctx.fillStyle = '#334155';
            } else if (en.type === 'drone') {
              ctx.fillStyle = '#0284c7';
            } else if (en.type === 'boss') {
              ctx.fillStyle = '#991b1b';
            } else {
              ctx.fillStyle = '#1e3a8a';
            }

            if (en.type === 'boss') {
              // Boss Dreadnought Rendering
              ctx.fillStyle = '#1e293b';
              ctx.strokeStyle = '#dc2626';
              ctx.lineWidth = 4;
              ctx.fillRect(0, 0, en.width, en.height);
              ctx.strokeRect(0, 0, en.width, en.height);

              // Glowing Core
              ctx.fillStyle = '#f59e0b';
              ctx.shadowColor = '#ef4444';
              ctx.shadowBlur = 20;
              ctx.beginPath();
              ctx.arc(en.width / 2, en.height / 2, 24, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;

              // Cannons
              ctx.fillStyle = '#475569';
              ctx.fillRect(-24, 25, 30, 14);
              ctx.fillRect(-24, 75, 30, 14);
            } else if (en.type === 'turret') {
              // Bunkered Rotating Turret
              ctx.beginPath();
              ctx.arc(en.width / 2, en.height, 16, Math.PI, 0);
              ctx.fill();
              ctx.strokeStyle = '#0f172a';
              ctx.lineWidth = 2;
              ctx.stroke();

              // Cannon barrel
              const barrelAngle = Math.atan2(p.y - en.y, p.x - en.x);
              ctx.save();
              ctx.translate(en.width / 2, en.height - 4);
              ctx.rotate(barrelAngle);
              ctx.fillStyle = '#64748b';
              ctx.fillRect(0, -4, 18, 8);
              ctx.restore();
            } else if (en.type === 'drone') {
              // Flying Gunship Drone
              ctx.beginPath();
              ctx.ellipse(en.width / 2, en.height / 2, en.width / 2, en.height / 2, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#38bdf8';
              ctx.stroke();
              // Rotor
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(en.width / 2 - 14, 2);
              ctx.lineTo(en.width / 2 + 14, 2);
              ctx.stroke();
            } else {
              // Enemy Soldier
              ctx.fillRect(4, 8, en.width - 8, en.height - 8);
              // Helmet
              ctx.fillStyle = en.type === 'armored' ? '#64748b' : '#1e3a8a';
              ctx.fillRect(6, 2, en.width - 12, 10);
              // Visor / Red Eyes
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(en.facing === 1 ? en.width - 10 : 6, 6, 4, 3);
              // Weapon
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(en.facing === 1 ? en.width - 6 : -8, 14, 14, 5);
            }

            ctx.restore();
          });

          // Draw Grenades
          grenadesRef.current.forEach((g) => {
            ctx.save();
            ctx.translate(g.x, g.y);
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-2, -8, 4, 3);
            ctx.restore();
          });

          // Draw Explosions
          explosionsRef.current.forEach((exp) => {
            const expGrad = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.radius);
            expGrad.addColorStop(0, '#fef08a');
            expGrad.addColorStop(0.4, '#f97316');
            expGrad.addColorStop(0.8, '#ef4444');
            expGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = expGrad;
            ctx.beginPath();
            ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw Bullets
          bulletsRef.current.forEach((b) => {
            ctx.save();
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });

          // Draw Particles
          particlesRef.current.forEach((pt) => {
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw Player Commando Soldier
          if (p.isAlive) {
            // Flash if invincible
            if (p.invincibleTimer <= 0 || Math.floor(currentTime * 0.05) % 2 === 0) {
              ctx.save();
              ctx.translate(p.x + p.width / 2, p.y + p.height / 2);

              // Shield Barrier Aura
              if (p.shieldTimer > 0) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(0, 0, 26, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
              }

              // Flip horizontal based on facing
              ctx.scale(p.facing, 1);

              if (p.isJumping) {
                // Somersault Tuck Spin!
                ctx.rotate(p.jumpAngle);
                ctx.fillStyle = '#1d4ed8'; // Blue trousers
                ctx.beginPath();
                ctx.arc(0, 0, 14, 0, Math.PI * 2);
                ctx.fill();
                // Red bandana band
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(-12, -4, 24, 6);
              } else if (p.isCrouching) {
                // Crouching Commando Pose
                // Head & Red Bandana
                ctx.fillStyle = '#fed7aa';
                ctx.beginPath();
                ctx.arc(0, 2, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(-7, -1, 14, 4);

                // Body
                ctx.fillStyle = '#15803d'; // Green camo vest
                ctx.fillRect(-8, 8, 16, 10);
                // Legs tucked
                ctx.fillStyle = '#1d4ed8';
                ctx.fillRect(-10, 14, 18, 6);
                // Gun pointed forward
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(4, 8, 20, 5);
              } else {
                // Standing / Running Commando
                const legOffset = Math.sin(p.runFrame) * 6;

                // Red Bandana trailing ribbon
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(-12, -18, 6, 3);
                ctx.fillRect(-15, -16, 5, 3);

                // Head
                ctx.fillStyle = '#fed7aa';
                ctx.beginPath();
                ctx.arc(0, -12, 7, 0, Math.PI * 2);
                ctx.fill();

                // Bandana forehead
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(-7, -15, 14, 4);

                // Muscular Torso & Camo Vest
                ctx.fillStyle = '#15803d';
                ctx.fillRect(-8, -5, 16, 15);
                ctx.fillStyle = '#fed7aa';
                ctx.fillRect(-4, -4, 8, 8);

                // Legs & Boots
                ctx.fillStyle = '#1d4ed8';
                ctx.fillRect(-7, 10, 6, 10 + legOffset);
                ctx.fillRect(1, 10, 6, 10 - legOffset);
                ctx.fillStyle = '#1c1917';
                ctx.fillRect(-8, 18 + legOffset, 7, 4);
                ctx.fillRect(1, 18 - legOffset, 7, 4);

                // Gun Aiming
                ctx.fillStyle = '#0f172a';
                if (p.aimUp) {
                  if (k.left || k.right) {
                    // Diagonal Up
                    ctx.save();
                    ctx.rotate(-Math.PI / 4);
                    ctx.fillRect(0, -6, 22, 6);
                    ctx.restore();
                  } else {
                    // Straight Up
                    ctx.fillRect(-3, -28, 6, 22);
                  }
                } else {
                  // Forward Gun
                  ctx.fillRect(2, -2, 22, 6);
                }
              }

              ctx.restore();
            }
          }

          ctx.restore(); // Restore camera translation
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    animationFrameIdRef.current = requestAnimationFrame(tick);
    return () => {
      isMounted = false;
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [gameState, currentLevel, shootBullet, onScoreUpdate, score, LEVEL_LENGTHS]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-1 sm:p-3 select-none overflow-hidden touch-none">
      {/* Top Arcade HUD */}
      <div className="w-full max-w-[640px] flex items-center justify-between mb-1.5 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-800 text-xs shadow-lg z-20">
        <div className="flex items-center gap-3">
          {/* Health Bar */}
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-[11px] text-slate-400 uppercase">HP</span>
            <div className="w-24 sm:w-28 h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  playerHealth > 50 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : playerHealth > 25 ? 'bg-amber-400' : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${playerHealth}%` }}
              />
            </div>
          </div>

          {/* Lives Count */}
          <div className="flex items-center gap-1 text-cyan-400 font-bold font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>x{playerLives}</span>
          </div>

          {/* Weapon Badge */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase hidden sm:inline">GUN:</span>
            <span
              className={`px-2 py-0.5 rounded font-black font-mono text-xs ${
                playerWeapon === 'spread'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : playerWeapon === 'laser'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : playerWeapon === 'machine'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              {playerWeapon === 'spread' ? 'SPREAD [S]' : playerWeapon === 'laser' ? 'LASER [L]' : playerWeapon === 'machine' ? 'MACHINE [M]' : 'RIFLE [R]'}
            </span>
          </div>
        </div>

        {/* Right HUD: Grenades, Score, Pause */}
        <div className="flex items-center gap-3">
          {/* Grenades */}
          <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
            <Bomb className="w-3.5 h-3.5" />
            <span>x{playerGrenades}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase hidden sm:inline">SCORE:</span>
            <span className="font-mono font-black text-amber-400 text-sm">{score}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.enabled = !sound.enabled;
              setSoundEnabled(sound.enabled);
            }}
            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
            title="Toggle Audio"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => setGameState((g) => (g === 'playing' ? 'paused' : g === 'paused' ? 'playing' : g))}
            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
            title="Pause Game"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Boss Health Bar (when active) */}
      {bossHealthPercent !== null && (
        <div className="w-full max-w-[640px] px-3 py-1 bg-red-950/80 border border-red-500/40 rounded-lg mb-1 flex items-center justify-between text-xs z-20 animate-fade-in">
          <span className="font-extrabold text-red-400 uppercase tracking-widest text-[10px]">STAGE BOSS CORE</span>
          <div className="w-2/3 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-red-500/40">
            <div className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-100" style={{ width: `${bossHealthPercent}%` }} />
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="relative w-full max-w-[640px] aspect-[16/9] max-h-[360px] rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-800 bg-black flex items-center justify-center">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full block" />

        {/* Level Indicator Badge */}
        {gameState === 'playing' && (
          <div className="absolute top-2 left-3 bg-slate-900/80 px-2.5 py-0.5 rounded text-[10px] font-bold text-slate-300 tracking-wider uppercase border border-slate-700/60 pointer-events-none">
            {currentLevel === 1 ? 'STAGE 1: JUNGLE' : currentLevel === 2 ? 'STAGE 2: MILITARY BASE' : 'STAGE 3: DESERT FORTRESS'}
          </div>
        )}

        {/* MENU OVERLAYS */}
        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-30 animate-fade-in">
            {/* Title Screen Menu */}
            {gameState === 'menu' && (
              <>
                <div className="px-5 py-2 mb-2 bg-slate-900/90 border-2 border-red-600 rounded-xl shadow-xl shadow-red-500/20">
                  <h1 className="text-3xl sm:text-4xl font-black text-amber-400 tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
                    CONTRA
                  </h1>
                  <div className="text-[10px] font-extrabold tracking-[0.3em] text-white uppercase">Jungle Commando</div>
                </div>

                <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
                  Classic 2D side-scrolling run-and-gun shooter! Run, jump, throw grenades, collect Spread and Laser guns, and defeat the fortress bosses across 3 stages!
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-2 mb-4 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-200">PC:</span> WASD / Arrows to Aim & Move | Space: Jump | J/Z: Shoot | K/X: Grenade
                </div>

                <button
                  onClick={() => handleStartGame(1)}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm tracking-wider uppercase rounded-xl shadow-xl shadow-red-500/30 transition-transform active:scale-95 flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  START MISSION
                </button>
              </>
            )}

            {/* Pause Menu */}
            {gameState === 'paused' && (
              <>
                <h2 className="text-2xl font-black text-white mb-2 tracking-wide uppercase">MISSION PAUSED</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGameState('playing')}
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-xl shadow"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => handleStartGame(currentLevel)}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl shadow"
                  >
                    Restart Stage
                  </button>
                </div>
              </>
            )}

            {/* Stage Complete Overlay */}
            {gameState === 'level_complete' && (
              <>
                <div className="w-14 h-14 mb-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
                  <Trophy className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-black text-amber-400 mb-1 tracking-wide uppercase">STAGE {currentLevel} CLEAR!</h2>
                <p className="text-xs text-slate-300 mb-4">Boss Core Destroyed! Get ready for the next combat sector.</p>
                <button
                  onClick={() => {
                    const next = currentLevel + 1;
                    setCurrentLevel(next);
                    setupLevel(next, true);
                    setGameState('playing');
                  }}
                  className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95"
                >
                  PROCEED TO STAGE {currentLevel + 1}
                </button>
              </>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && (
              <>
                <h2 className="text-3xl font-black text-rose-500 mb-1 tracking-wider uppercase">MISSION FAILED</h2>
                <p className="text-xs text-slate-400 mb-4">Final Score: <span className="font-mono text-white font-bold">{score}</span></p>
                <button
                  onClick={() => handleStartGame(currentLevel)}
                  className="px-8 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95"
                >
                  RETRY STAGE {currentLevel}
                </button>
              </>
            )}

            {/* Victory Final Screen */}
            {gameState === 'victory' && (
              <>
                <div className="w-16 h-16 mb-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl">
                  <Trophy className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-emerald-400 mb-1 tracking-wider uppercase">VICTORY!</h2>
                <p className="text-xs text-slate-300 max-w-xs mb-3">All 3 Fortress Sectors Liberated! Outstanding Commando Service.</p>
                <div className="text-sm font-mono text-amber-400 font-bold mb-4">FINAL SCORE: {score}</div>
                <button
                  onClick={() => handleStartGame(1)}
                  className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95"
                >
                  PLAY AGAIN
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Friendly Mobile Rotation Prompt (if device is in portrait mode) */}
      {isPortrait && (
        <div className="w-full max-w-[640px] mt-1 p-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 text-[10px] text-center font-bold">
          Tip: Rotate your phone to Landscape mode for the best arcade experience!
        </div>
      )}

      {/* Complete Mobile On-Screen Touch Controls (Virtual Joystick & Action Buttons) */}
      <div className="w-full max-w-[640px] flex items-center justify-between mt-2 px-3 pb-1 select-none">
        {/* Virtual Joystick (Left) */}
        <div
          onPointerDown={handleJoystickStart}
          onPointerMove={handleJoystickMove}
          onPointerUp={handleJoystickEnd}
          onPointerCancel={handleJoystickEnd}
          className="relative w-28 h-28 rounded-full bg-slate-900/80 border-2 border-slate-700/80 flex items-center justify-center touch-none shadow-xl cursor-pointer"
        >
          {/* Base Cross Indicators */}
          <div className="absolute w-full h-[1px] bg-slate-700/40" />
          <div className="absolute h-full w-[1px] bg-slate-700/40" />

          {/* Dynamic Joystick Thumb Knob */}
          <div
            className={`w-12 h-12 rounded-full border-2 transition-transform duration-75 flex items-center justify-center ${
              isJoystickActive
                ? 'bg-cyan-500/90 border-white shadow-lg shadow-cyan-500/50 scale-105'
                : 'bg-slate-700/80 border-slate-500'
            }`}
            style={{
              transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`,
            }}
          >
            <Crosshair className="w-5 h-5 text-white opacity-80" />
          </div>
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex items-center gap-2.5">
          {/* Aim Up Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              keysRef.current.up = true;
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              keysRef.current.up = false;
            }}
            className="w-12 h-12 rounded-2xl bg-slate-800/90 active:bg-cyan-600 border border-slate-700 text-white font-bold flex flex-col items-center justify-center shadow text-[10px] active:scale-95 transition"
            title="Aim Up"
          >
            <ArrowUp className="w-4 h-4 text-cyan-400" />
            <span>AIM</span>
          </button>

          {/* Grenade Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              throwGrenade();
            }}
            className="w-12 h-12 rounded-2xl bg-slate-800/90 active:bg-emerald-600 border border-slate-700 text-white font-bold flex flex-col items-center justify-center shadow text-[10px] active:scale-95 transition"
            title="Throw Grenade"
          >
            <Bomb className="w-4 h-4 text-emerald-400" />
            <span>BOMB</span>
          </button>

          {/* Jump Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              sound.unlockMobileAudio();
              keysRef.current.jump = true;
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              keysRef.current.jump = false;
            }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 active:from-cyan-700 active:to-blue-600 text-white font-black flex flex-col items-center justify-center shadow-lg shadow-cyan-500/25 active:scale-95 transition text-xs"
          >
            <Zap className="w-5 h-5" />
            <span>JUMP</span>
          </button>

          {/* Large Shoot Button (Continuous Auto-Fire on Hold) */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              sound.unlockMobileAudio();
              keysRef.current.shoot = true;
              shootBullet();
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              keysRef.current.shoot = false;
            }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 active:from-red-700 active:to-amber-600 text-white font-black flex flex-col items-center justify-center shadow-xl shadow-red-500/30 active:scale-95 transition text-xs"
          >
            <Crosshair className="w-6 h-6" />
            <span>FIRE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
