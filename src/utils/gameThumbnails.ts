/**
 * High-definition 2D Game Vector Art Thumbnails.
 * Styled after the 2D indie platformer, cartoon, and vector artwork shown in reference image.
 * Instant zero-latency loading, crisp on all Retina and mobile screens.
 */

export const GAME_THUMBNAILS: { [key: string]: string } = {
  // 1. Super Jump World (Mario-style 2D platformer)
  'super-jump-world': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="60%" stop-color="#7dd3fc"/>
          <stop offset="100%" stop-color="#bae6fd"/>
        </linearGradient>
        <linearGradient id="brick" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ea580c"/>
          <stop offset="100%" stop-color="#9a3412"/>
        </linearGradient>
        <linearGradient id="qblock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
        <linearGradient id="pipe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#22c55e"/>
          <stop offset="50%" stop-color="#4ade80"/>
          <stop offset="100%" stop-color="#15803d"/>
        </linearGradient>
      </defs>
      <!-- Sky -->
      <rect width="600" height="450" fill="url(#sky)"/>
      <!-- Background Clouds -->
      <circle cx="120" cy="90" r="35" fill="white" opacity="0.9"/>
      <circle cx="155" cy="80" r="42" fill="white" opacity="0.9"/>
      <circle cx="195" cy="90" r="32" fill="white" opacity="0.9"/>
      <circle cx="430" cy="110" r="32" fill="white" opacity="0.85"/>
      <circle cx="465" cy="100" r="40" fill="white" opacity="0.85"/>
      <circle cx="500" cy="110" r="28" fill="white" opacity="0.85"/>
      <!-- Green Rolling Hills -->
      <ellipse cx="140" cy="360" rx="140" ry="110" fill="#4ade80"/>
      <ellipse cx="460" cy="370" rx="160" ry="120" fill="#22c55e"/>
      <!-- Green Pipe -->
      <rect x="440" y="270" width="70" height="90" fill="url(#pipe)" rx="4"/>
      <rect x="432" y="248" width="86" height="24" fill="url(#pipe)" rx="5" stroke="#14532d" stroke-width="3"/>
      <!-- Ground Earth & Grass -->
      <rect x="0" y="360" width="600" height="90" fill="#78350f"/>
      <rect x="0" y="360" width="600" height="20" fill="#22c55e"/>
      <path d="M0,380 Q25,385 50,380 T100,380 T150,380 T200,380 T250,380 T300,380 T350,380 T400,380 T450,380 T500,380 T550,380 T600,380" fill="#22c55e"/>
      <!-- Floating Blocks -->
      <rect x="140" y="210" width="50" height="50" rx="6" fill="url(#brick)" stroke="#78350f" stroke-width="3"/>
      <!-- Question Block with Coin -->
      <rect x="200" y="210" width="50" height="50" rx="6" fill="url(#qblock)" stroke="#78350f" stroke-width="3"/>
      <text x="225" y="244" font-family="sans-serif" font-weight="900" font-size="30" fill="#ffffff" text-anchor="middle">?</text>
      <!-- Golden Coin floating -->
      <circle cx="225" cy="155" r="18" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>
      <ellipse cx="225" cy="155" rx="10" ry="13" fill="#fef08a"/>
      <!-- Another Brick -->
      <rect x="260" y="210" width="50" height="50" rx="6" fill="url(#brick)" stroke="#78350f" stroke-width="3"/>
      <!-- Question Block 2 -->
      <rect x="320" y="210" width="50" height="50" rx="6" fill="url(#qblock)" stroke="#78350f" stroke-width="3"/>
      <text x="345" y="244" font-family="sans-serif" font-weight="900" font-size="30" fill="#ffffff" text-anchor="middle">?</text>
      <!-- Jumping Hero Character -->
      <g transform="translate(225, 290) scale(1.2)">
        <rect x="-14" y="-28" width="28" height="13" rx="4" fill="#ef4444"/>
        <rect x="-10" y="-17" width="20" height="15" fill="#fcd34d" rx="3"/>
        <rect x="1" y="-13" width="4" height="4" fill="#000000"/>
        <rect x="-4" y="-7" width="14" height="5" fill="#1c1917" rx="2"/>
        <rect x="-12" y="-2" width="24" height="18" fill="#2563eb" rx="4"/>
        <rect x="-14" y="16" width="10" height="7" fill="#78350f" rx="3"/>
        <rect x="4" y="16" width="10" height="7" fill="#78350f" rx="3"/>
      </g>
      <!-- Goomba Critter on Ground -->
      <g transform="translate(360, 335)">
        <ellipse cx="15" cy="12" rx="16" ry="14" fill="#b91c1c"/>
        <rect x="6" y="12" width="18" height="13" fill="#fde047" rx="3"/>
        <rect x="9" y="14" width="3" height="5" fill="#000000"/>
        <rect x="18" y="14" width="3" height="5" fill="#000000"/>
        <ellipse cx="5" cy="25" rx="6" ry="3" fill="#78350f"/>
        <ellipse cx="25" cy="25" rx="6" ry="3" fill="#78350f"/>
      </g>
      <text x="30" y="50" font-family="sans-serif" font-weight="900" font-size="28" fill="#ffffff" stroke="#0369a1" stroke-width="2">SUPER JUMP WORLD</text>
    </svg>
  `)}`,

  // 2. Stone Balance (Flat Natural River Stones & Ground Scatter)
  'stone-balance': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <defs>
        <linearGradient id="zenbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="50%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
        <linearGradient id="baseRock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
      </defs>
      <!-- Background -->
      <rect width="600" height="450" fill="url(#zenbg)"/>
      <!-- Soft Moon / Sun -->
      <circle cx="300" cy="140" r="85" fill="#f8fafc" opacity="0.08"/>
      <!-- Mountains -->
      <polygon points="0,310 160,180 320,280 600,160 600,450 0,450" fill="#1e293b" opacity="0.6"/>
      <!-- Water Surface with Ripples -->
      <rect x="0" y="375" width="600" height="75" fill="#0f172a"/>
      <ellipse cx="300" cy="405" rx="240" ry="24" fill="none" stroke="#38bdf8" stroke-width="1.5" opacity="0.3"/>
      <!-- Left & Right Ground Banks with Scattered Flat Stones -->
      <ellipse cx="90" cy="415" rx="110" ry="32" fill="#334155"/>
      <ellipse cx="510" cy="415" rx="110" ry="32" fill="#334155"/>
      <!-- Scattered flat stones on ground -->
      <ellipse cx="60" cy="410" rx="35" ry="12" fill="#64748b" stroke="#475569" stroke-width="2"/>
      <ellipse cx="120" cy="420" rx="28" ry="10" fill="#78716c" stroke="#57534e" stroke-width="2"/>
      <ellipse cx="480" cy="415" rx="32" ry="11" fill="#71717a" stroke="#52525b" stroke-width="2"/>
      <ellipse cx="540" cy="422" rx="24" ry="9" fill="#a8a29e" stroke="#78716c" stroke-width="2"/>
      <!-- Big Foundational Center Boulder -->
      <ellipse cx="300" cy="385" rx="150" ry="42" fill="url(#baseRock)" stroke="#334155" stroke-width="4"/>
      <!-- Stack of Flat Natural River Stones -->
      <!-- Flat Stone 1 -->
      <ellipse cx="300" cy="342" rx="95" ry="20" fill="#64748b" stroke="#475569" stroke-width="3"/>
      <path d="M 230,336 Q 300,330 370,336" stroke="rgba(255,255,255,0.2)" stroke-width="2" fill="none"/>
      <!-- Flat Stone 2 -->
      <ellipse cx="296" cy="306" rx="78" ry="18" fill="#78716c" stroke="#57534e" stroke-width="3"/>
      <!-- Flat Stone 3 -->
      <ellipse cx="304" cy="272" rx="62" ry="16" fill="#71717a" stroke="#52525b" stroke-width="3"/>
      <!-- Flat Stone 4 -->
      <ellipse cx="298" cy="242" rx="46" ry="14" fill="#6b7280" stroke="#4b5563" stroke-width="3"/>
      <!-- Flat Stone 5 (Top zen pebble) -->
      <ellipse cx="301" cy="216" rx="30" ry="12" fill="#a8a29e" stroke="#78716c" stroke-width="3"/>
      <!-- Zen Sparkles -->
      <circle cx="301" cy="188" r="4.5" fill="#38bdf8"/>
      <circle cx="345" cy="235" r="3" fill="#38bdf8" opacity="0.8"/>
      <circle cx="255" cy="265" r="2.5" fill="#38bdf8" opacity="0.8"/>
      <text x="300" y="65" font-family="sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="2">STONE BALANCE</text>
      <text x="300" y="95" font-family="sans-serif" font-weight="600" font-size="14" fill="#94a3b8" text-anchor="middle">REAL GRAVITY CAIRN PILING</text>
    </svg>
  `)}`,

  // 3. Tap Plane Game (Fighter Jet shooting Enemy Planes)
  'tap-plane': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <defs>
        <linearGradient id="jetsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0c4a6e"/>
          <stop offset="60%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#38bdf8"/>
        </linearGradient>
      </defs>
      <!-- Sky -->
      <rect width="600" height="450" fill="url(#jetsky)"/>
      <!-- Fast moving clouds -->
      <ellipse cx="140" cy="100" rx="90" ry="24" fill="white" opacity="0.45"/>
      <ellipse cx="460" cy="220" rx="120" ry="30" fill="white" opacity="0.35"/>
      <ellipse cx="280" cy="340" rx="100" ry="25" fill="white" opacity="0.4"/>
      <!-- Laser Missiles Fired -->
      <rect x="230" y="215" width="45" height="8" rx="4" fill="#38bdf8"/>
      <rect x="310" y="215" width="55" height="8" rx="4" fill="#38bdf8"/>
      <!-- Exploding Enemy Jet Plane -->
      <g transform="translate(420, 210)">
        <!-- Fireball Explosion Particles -->
        <circle cx="15" cy="0" r="38" fill="#ef4444" opacity="0.85"/>
        <circle cx="20" cy="-5" r="28" fill="#f59e0b" opacity="0.9"/>
        <circle cx="24" cy="-8" r="16" fill="#fef08a"/>
        <!-- Enemy Jet debris -->
        <polygon points="-10,-15 15,0 -10,15" fill="#991b1b"/>
        <!-- Floating +100 Score Popup -->
        <text x="50" y="-30" font-family="sans-serif" font-weight="900" font-size="24" fill="#fde047">+100</text>
      </g>
      <!-- Incoming 2nd Enemy Jet -->
      <g transform="translate(480, 110)">
        <polygon points="35,0 -10,-12 0,0 -10,12" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
        <rect x="4" y="-18" width="14" height="6" fill="#b91c1c"/>
        <rect x="4" y="12" width="14" height="6" fill="#b91c1c"/>
        <circle cx="20" cy="0" r="4" fill="#fef08a"/>
      </g>
      <!-- Player Supersonic Fighter Jet -->
      <g transform="translate(130, 220) rotate(-6) scale(1.5)">
        <!-- Afterburner Jet Flame -->
        <polygon points="-30,-5 -48,0 -30,5" fill="#f59e0b"/>
        <polygon points="-28,-2 -40,0 -28,2" fill="#fef08a"/>
        <!-- Jet Fuselage Delta Wing -->
        <polygon points="38,0 -26,-16 -14,0 -26,16" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
        <!-- Cockpit Glass Canopy -->
        <ellipse cx="8" cy="0" rx="10" ry="4.5" fill="#38bdf8"/>
        <!-- Twin Missiles on wings -->
        <rect x="-8" y="-18" width="16" height="4" rx="2" fill="#e0f2fe"/>
        <rect x="-8" y="14" width="16" height="4" rx="2" fill="#e0f2fe"/>
      </g>
      <text x="300" y="60" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" stroke="#0369a1" stroke-width="3" text-anchor="middle">TAP PLANE GAME</text>
      <text x="300" y="90" font-family="sans-serif" font-weight="700" font-size="14" fill="#93c5fd" text-anchor="middle">FIGHTER JET VS ENEMY AIR COMBAT</text>
    </svg>
  `)}`,
  'flappy-bird': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <defs>
        <linearGradient id="jetsky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0c4a6e"/>
          <stop offset="60%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#38bdf8"/>
        </linearGradient>
      </defs>
      <rect width="600" height="450" fill="url(#jetsky2)"/>
      <rect x="230" y="215" width="45" height="8" rx="4" fill="#38bdf8"/>
      <rect x="310" y="215" width="55" height="8" rx="4" fill="#38bdf8"/>
      <g transform="translate(420, 210)">
        <circle cx="15" cy="0" r="38" fill="#ef4444" opacity="0.85"/>
        <circle cx="20" cy="-5" r="28" fill="#f59e0b" opacity="0.9"/>
        <text x="50" y="-30" font-family="sans-serif" font-weight="900" font-size="24" fill="#fde047">+100</text>
      </g>
      <g transform="translate(130, 220) rotate(-6) scale(1.5)">
        <polygon points="-30,-5 -48,0 -30,5" fill="#f59e0b"/>
        <polygon points="38,0 -26,-16 -14,0 -26,16" fill="#0284c7" stroke="#ffffff" stroke-width="2"/>
        <ellipse cx="8" cy="0" rx="10" ry="4.5" fill="#38bdf8"/>
      </g>
      <text x="300" y="60" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" stroke="#0369a1" stroke-width="3" text-anchor="middle">TAP PLANE GAME</text>
    </svg>
  `)}`,

  // 4. Snake
  snake: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#0b132b"/>
      <path d="M0,50 H600 M0,100 H600 M0,150 H600 M0,200 H600 M0,250 H600 M0,300 H600 M0,350 H600 M0,400 H600" stroke="#1c2541" stroke-width="1.5"/>
      <path d="M50,0 V450 M100,0 V450 M150,0 V450 M200,0 V450 M250,0 V450 M300,0 V450 M350,0 V450 M400,0 V450 M450,0 V450 M500,0 V450 M550,0 V450" stroke="#1c2541" stroke-width="1.5"/>
      <rect x="154" y="304" width="42" height="42" rx="8" fill="#10b981"/>
      <rect x="204" y="304" width="42" height="42" rx="8" fill="#10b981"/>
      <rect x="254" y="304" width="42" height="42" rx="8" fill="#10b981"/>
      <rect x="254" y="254" width="42" height="42" rx="8" fill="#10b981"/>
      <rect x="254" y="204" width="42" height="42" rx="8" fill="#10b981"/>
      <rect x="304" y="204" width="42" height="42" rx="8" fill="#34d399"/>
      <rect x="354" y="204" width="42" height="42" rx="8" fill="#34d399"/>
      <!-- Snake Head -->
      <rect x="404" y="204" width="44" height="44" rx="10" fill="#22c55e" stroke="#15803d" stroke-width="2"/>
      <circle cx="434" cy="216" r="4.5" fill="#ffffff"/>
      <circle cx="436" cy="216" r="2" fill="#000000"/>
      <circle cx="434" cy="236" r="4.5" fill="#ffffff"/>
      <circle cx="436" cy="236" r="2" fill="#000000"/>
      <path d="M448,226 L462,226 L468,222 M462,226 L468,230" stroke="#ef4444" stroke-width="2.5" fill="none"/>
      <!-- Timed Golden Star Power Orb -->
      <g transform="translate(340, 110)">
        <circle cx="0" cy="0" r="26" fill="none" stroke="#facc15" stroke-width="3" stroke-dasharray="6,4"/>
        <circle cx="0" cy="0" r="18" fill="#f59e0b"/>
        <text x="0" y="6" font-family="sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle">⚡</text>
      </g>
      <!-- Red Apple Food Target -->
      <circle cx="475" cy="125" r="18" fill="#ef4444"/>
      <ellipse cx="484" cy="100" rx="6" ry="3" fill="#22c55e"/>
      <text x="300" y="55" font-family="sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="2">SNAKE</text>
    </svg>
  `)}`,

  // 5. Space Shooter
  'space-shooter': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#030712"/>
      <!-- Stars -->
      <circle cx="80" cy="70" r="1.5" fill="#ffffff"/>
      <circle cx="220" cy="40" r="2" fill="#38bdf8"/>
      <circle cx="500" cy="90" r="1.5" fill="#ffffff"/>
      <circle cx="140" cy="260" r="2" fill="#ffffff"/>
      <circle cx="480" cy="340" r="1.5" fill="#f43f5e"/>
      <!-- Enemy Alien Ships -->
      <polygon points="180,110 200,80 220,110 200,125" fill="#f43f5e"/>
      <polygon points="300,90 325,55 350,90 325,105" fill="#f43f5e"/>
      <polygon points="420,110 440,80 460,110 440,125" fill="#f43f5e"/>
      <!-- Laser Beams -->
      <rect x="312" y="160" width="6" height="35" rx="3" fill="#38bdf8"/>
      <rect x="332" y="160" width="6" height="35" rx="3" fill="#38bdf8"/>
      <rect x="312" y="240" width="6" height="35" rx="3" fill="#38bdf8"/>
      <rect x="332" y="240" width="6" height="35" rx="3" fill="#38bdf8"/>
      <!-- Player Starfighter -->
      <g transform="translate(325, 340)">
        <polygon points="0,-40 -28,25 0,15 28,25" fill="#06b6d4" stroke="#ffffff" stroke-width="2"/>
        <polygon points="0,-25 -12,10 0,5 12,10" fill="#3b82f6"/>
        <circle cx="0" cy="-5" r="5" fill="#ffffff"/>
        <!-- Thruster Flame -->
        <polygon points="-8,20 0,38 8,20" fill="#f59e0b"/>
      </g>
      <text x="300" y="55" font-family="sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle" letter-spacing="1">SPACE SHOOTER</text>
    </svg>
  `)}`,

  // 6. 2048
  '2048': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#faf8ef"/>
      <!-- Board Container -->
      <rect x="140" y="65" width="320" height="320" rx="14" fill="#bbada0"/>
      <!-- Tiles -->
      <rect x="155" y="80" width="68" height="68" rx="8" fill="#eee4da"/>
      <text x="189" y="124" font-family="sans-serif" font-weight="bold" font-size="34" fill="#776e65" text-anchor="middle">2</text>
      <rect x="233" y="80" width="68" height="68" rx="8" fill="#ede0c8"/>
      <text x="267" y="124" font-family="sans-serif" font-weight="bold" font-size="34" fill="#776e65" text-anchor="middle">4</text>
      <rect x="311" y="80" width="68" height="68" rx="8" fill="#f2b179"/>
      <text x="345" y="124" font-family="sans-serif" font-weight="bold" font-size="34" fill="#ffffff" text-anchor="middle">8</text>
      <rect x="389" y="80" width="68" height="68" rx="8" fill="#f59563"/>
      <text x="423" y="124" font-family="sans-serif" font-weight="bold" font-size="28" fill="#ffffff" text-anchor="middle">16</text>
      <!-- Row 2 -->
      <rect x="155" y="158" width="68" height="68" rx="8" fill="#f67c5f"/>
      <text x="189" y="202" font-family="sans-serif" font-weight="bold" font-size="28" fill="#ffffff" text-anchor="middle">32</text>
      <rect x="233" y="158" width="68" height="68" rx="8" fill="#f65e3b"/>
      <text x="267" y="202" font-family="sans-serif" font-weight="bold" font-size="28" fill="#ffffff" text-anchor="middle">64</text>
      <rect x="311" y="158" width="68" height="68" rx="8" fill="#edcf72"/>
      <text x="345" y="202" font-family="sans-serif" font-weight="bold" font-size="24" fill="#ffffff" text-anchor="middle">128</text>
      <rect x="389" y="158" width="68" height="68" rx="8" fill="#edcc61"/>
      <text x="423" y="202" font-family="sans-serif" font-weight="bold" font-size="24" fill="#ffffff" text-anchor="middle">256</text>
      <!-- Big 2048 Tile in Center Bottom -->
      <rect x="233" y="236" width="146" height="130" rx="10" fill="#ecc440"/>
      <text x="306" y="315" font-family="sans-serif" font-weight="900" font-size="46" fill="#ffffff" text-anchor="middle">2048</text>
      <text x="300" y="45" font-family="sans-serif" font-weight="900" font-size="34" fill="#776e65" text-anchor="middle">2048 PUZZLE</text>
    </svg>
  `)}`,

  // 7. Brick Breaker
  'brick-breaker': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#0f172a"/>
      <!-- Bricks Rows -->
      <!-- Red Row -->
      <rect x="70" y="70" width="85" height="24" rx="4" fill="#ef4444"/>
      <rect x="165" y="70" width="85" height="24" rx="4" fill="#ef4444"/>
      <rect x="260" y="70" width="85" height="24" rx="4" fill="#ef4444"/>
      <rect x="355" y="70" width="85" height="24" rx="4" fill="#ef4444"/>
      <rect x="450" y="70" width="85" height="24" rx="4" fill="#ef4444"/>
      <!-- Orange Row -->
      <rect x="70" y="102" width="85" height="24" rx="4" fill="#f97316"/>
      <rect x="165" y="102" width="85" height="24" rx="4" fill="#f97316"/>
      <rect x="260" y="102" width="85" height="24" rx="4" fill="#f97316"/>
      <rect x="355" y="102" width="85" height="24" rx="4" fill="#f97316"/>
      <rect x="450" y="102" width="85" height="24" rx="4" fill="#f97316"/>
      <!-- Green Row -->
      <rect x="70" y="134" width="85" height="24" rx="4" fill="#22c55e"/>
      <rect x="165" y="134" width="85" height="24" rx="4" fill="#22c55e"/>
      <rect x="260" y="134" width="85" height="24" rx="4" fill="#22c55e"/>
      <rect x="355" y="134" width="85" height="24" rx="4" fill="#22c55e"/>
      <rect x="450" y="134" width="85" height="24" rx="4" fill="#22c55e"/>
      <!-- Blue Row -->
      <rect x="70" y="166" width="85" height="24" rx="4" fill="#3b82f6"/>
      <rect x="165" y="166" width="85" height="24" rx="4" fill="#3b82f6"/>
      <rect x="355" y="166" width="85" height="24" rx="4" fill="#3b82f6"/>
      <rect x="450" y="166" width="85" height="24" rx="4" fill="#3b82f6"/>
      <!-- Bouncing Ball -->
      <circle cx="280" cy="240" r="14" fill="#ffffff" stroke="#38bdf8" stroke-width="3"/>
      <!-- Motion Dash Line -->
      <line x1="260" y1="280" x2="275" y2="248" stroke="#38bdf8" stroke-dasharray="4" stroke-width="2"/>
      <!-- Paddle -->
      <rect x="210" y="380" width="140" height="20" rx="10" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
      <text x="300" y="45" font-family="sans-serif" font-weight="900" font-size="30" fill="#ffffff" text-anchor="middle">BRICK BREAKER</text>
    </svg>
  `)}`,

  // 8. Tower Stack (Skyscraper Building Drop)
  'tower-stack': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <defs>
        <linearGradient id="skybldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="60%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#bae6fd"/>
        </linearGradient>
      </defs>
      <!-- Sky Background -->
      <rect width="600" height="450" fill="url(#skybldg)"/>
      <!-- Clouds -->
      <circle cx="80" cy="180" r="45" fill="white" opacity="0.6"/>
      <circle cx="130" cy="170" r="55" fill="white" opacity="0.6"/>
      <circle cx="480" cy="220" r="50" fill="white" opacity="0.5"/>
      <circle cx="530" cy="210" r="60" fill="white" opacity="0.5"/>
      <!-- Construction Crane Cable -->
      <line x1="300" y1="0" x2="300" y2="120" stroke="#f8fafc" stroke-width="3"/>
      <rect x="285" y="112" width="30" height="10" fill="#f59e0b" rx="2"/>
      <!-- Dropping Top Building Floor -->
      <g transform="translate(210, 122)">
        <rect width="180" height="48" rx="4" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3"/>
        <!-- Windows -->
        <rect x="18" y="12" width="24" height="24" rx="2" fill="#fef08a" stroke="#1d4ed8" stroke-width="1.5"/>
        <rect x="58" y="12" width="24" height="24" rx="2" fill="#fef08a" stroke="#1d4ed8" stroke-width="1.5"/>
        <rect x="98" y="12" width="24" height="24" rx="2" fill="#fef08a" stroke="#1d4ed8" stroke-width="1.5"/>
        <rect x="138" y="12" width="24" height="24" rx="2" fill="#fef08a" stroke="#1d4ed8" stroke-width="1.5"/>
      </g>
      <!-- Stacked Building Floors below -->
      <!-- Floor 3 -->
      <g transform="translate(210, 180)">
        <rect width="180" height="48" rx="4" fill="#6366f1" stroke="#4338ca" stroke-width="3"/>
        <rect x="18" y="12" width="24" height="24" rx="2" fill="#ffffff" stroke="#4338ca" stroke-width="1.5"/>
        <rect x="58" y="12" width="24" height="24" rx="2" fill="#ffffff" stroke="#4338ca" stroke-width="1.5"/>
        <rect x="98" y="12" width="24" height="24" rx="2" fill="#ffffff" stroke="#4338ca" stroke-width="1.5"/>
        <rect x="138" y="12" width="24" height="24" rx="2" fill="#ffffff" stroke="#4338ca" stroke-width="1.5"/>
      </g>
      <!-- Floor 2 -->
      <g transform="translate(210, 238)">
        <rect width="180" height="48" rx="4" fill="#8b5cf6" stroke="#6d28d9" stroke-width="3"/>
        <rect x="18" y="12" width="24" height="24" rx="2" fill="#fef08a" stroke="#6d28d9" stroke-width="1.5"/>
        <rect x="58" y="12" width="24" height="24" rx="2" fill="#fef08a" stroke="#6d28d9" stroke-width="1.5"/>
        <rect x="98" y="12" width="24" height="24" rx="2" fill="#fef08a" stroke="#6d28d9" stroke-width="1.5"/>
        <rect x="138" y="12" width="24" height="24" rx="2" fill="#fef08a" stroke="#6d28d9" stroke-width="1.5"/>
      </g>
      <!-- Floor 1 (Base Lobby) -->
      <g transform="translate(210, 296)">
        <rect width="180" height="60" rx="4" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
        <!-- Glass lobby entrance -->
        <rect x="65" y="20" width="50" height="40" fill="#38bdf8" stroke="#0f172a" stroke-width="2"/>
        <rect x="20" y="24" width="30" height="26" fill="#fde047"/>
        <rect x="130" y="24" width="30" height="26" fill="#fde047"/>
      </g>
      <!-- Ground Street -->
      <rect x="0" y="356" width="600" height="94" fill="#334155"/>
      <rect x="0" y="356" width="600" height="12" fill="#22c55e"/>
      <!-- Glowing "PERFECT!" Flash Banner -->
      <g transform="translate(425, 120)">
        <rect x="-8" y="-18" width="135" height="36" rx="18" fill="#fbbf24" stroke="#ffffff" stroke-width="2"/>
        <text x="58" y="6" font-family="sans-serif" font-weight="900" font-size="16" fill="#0f172a" text-anchor="middle">PERFECT! ⭐</text>
      </g>
      <text x="300" y="55" font-family="sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle" stroke="#0284c7" stroke-width="2">BUILDING STACK</text>
    </svg>
  `)}`,

  // 9. Memory Cards
  'memory-cards': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#0f172a"/>
      <!-- Card Grid -->
      <!-- Card 1 (Flipped: Star) -->
      <rect x="110" y="100" width="80" height="110" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>
      <text x="150" y="170" font-size="44" text-anchor="middle">⭐</text>
      <!-- Card 2 (Back) -->
      <rect x="210" y="100" width="80" height="110" rx="10" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3"/>
      <text x="250" y="170" font-family="sans-serif" font-weight="900" font-size="42" fill="#ffffff" text-anchor="middle">?</text>
      <!-- Card 3 (Back) -->
      <rect x="310" y="100" width="80" height="110" rx="10" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3"/>
      <text x="350" y="170" font-family="sans-serif" font-weight="900" font-size="42" fill="#ffffff" text-anchor="middle">?</text>
      <!-- Card 4 (Flipped: Diamond) -->
      <rect x="410" y="100" width="80" height="110" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="3"/>
      <text x="450" y="170" font-size="44" text-anchor="middle">💎</text>
      <!-- Row 2 -->
      <!-- Card 5 (Back) -->
      <rect x="110" y="240" width="80" height="110" rx="10" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3"/>
      <text x="150" y="310" font-family="sans-serif" font-weight="900" font-size="42" fill="#ffffff" text-anchor="middle">?</text>
      <!-- Card 6 (Flipped: Star Match!) -->
      <rect x="210" y="240" width="80" height="110" rx="10" fill="#ffffff" stroke="#22c55e" stroke-width="4"/>
      <text x="250" y="310" font-size="44" text-anchor="middle">⭐</text>
      <!-- Card 7 (Flipped: Diamond Match!) -->
      <rect x="310" y="240" width="80" height="110" rx="10" fill="#ffffff" stroke="#22c55e" stroke-width="4"/>
      <text x="350" y="310" font-size="44" text-anchor="middle">💎</text>
      <!-- Card 8 (Back) -->
      <rect x="410" y="240" width="80" height="110" rx="10" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3"/>
      <text x="450" y="310" font-family="sans-serif" font-weight="900" font-size="42" fill="#ffffff" text-anchor="middle">?</text>
      <text x="300" y="60" font-family="sans-serif" font-weight="900" font-size="32" fill="#ffffff" text-anchor="middle">MEMORY CARDS</text>
    </svg>
  `)}`,

  // 10. Contra (Jungle Commando)
  contra: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <defs>
        <linearGradient id="contraSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#022c22"/>
          <stop offset="40%" stop-color="#064e3b"/>
          <stop offset="80%" stop-color="#047857"/>
          <stop offset="100%" stop-color="#10b981"/>
        </linearGradient>
        <linearGradient id="fireGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#b91c1c"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#fef08a"/>
        </linearGradient>
        <linearGradient id="waterfall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="100%" stop-color="#0284c7"/>
        </linearGradient>
      </defs>
      <!-- Jungle Sky & Canopy -->
      <rect width="600" height="450" fill="url(#contraSky)"/>
      <!-- Distant Jungle Mountains -->
      <polygon points="0,260 120,160 260,240 440,140 600,220 600,450 0,450" fill="#064e3b" opacity="0.7"/>
      <!-- Jungle Waterfall -->
      <rect x="380" y="160" width="45" height="180" fill="url(#waterfall)" opacity="0.85"/>
      <ellipse cx="402" cy="340" rx="35" ry="12" fill="#bae6fd" opacity="0.9"/>
      <!-- Deep Jungle Trees & Foliage -->
      <circle cx="80" cy="180" r="70" fill="#047857"/>
      <circle cx="160" cy="190" r="60" fill="#065f46"/>
      <circle cx="520" cy="180" r="80" fill="#047857"/>
      <!-- Jungle River Surface -->
      <rect x="0" y="340" width="600" height="110" fill="#0f766e"/>
      <rect x="0" y="340" width="600" height="12" fill="#2dd4bf" opacity="0.6"/>
      <!-- Wooden Rope Bridge / Jungle Platform -->
      <rect x="30" y="275" width="310" height="22" rx="4" fill="#78350f" stroke="#451a03" stroke-width="3"/>
      <!-- Bridge wooden planks -->
      <line x1="60" y1="275" x2="60" y2="297" stroke="#451a03" stroke-width="2"/>
      <line x1="100" y1="275" x2="100" y2="297" stroke="#451a03" stroke-width="2"/>
      <line x1="140" y1="275" x2="140" y2="297" stroke="#451a03" stroke-width="2"/>
      <line x1="180" y1="275" x2="180" y2="297" stroke="#451a03" stroke-width="2"/>
      <line x1="220" y1="275" x2="220" y2="297" stroke="#451a03" stroke-width="2"/>
      <line x1="260" y1="275" x2="260" y2="297" stroke="#451a03" stroke-width="2"/>
      <line x1="300" y1="275" x2="300" y2="297" stroke="#451a03" stroke-width="2"/>
      <!-- Enemy Bunker Fortress on Right -->
      <rect x="440" y="230" width="160" height="140" fill="#334155" stroke="#1e293b" stroke-width="4"/>
      <!-- Steel Turret Cannon -->
      <rect x="410" y="252" width="55" height="18" rx="4" fill="#475569" stroke="#0f172a" stroke-width="3"/>
      <ellipse cx="465" cy="261" rx="18" ry="18" fill="#64748b" stroke="#0f172a" stroke-width="3"/>
      <!-- Turret Red Laser Blast -->
      <line x1="410" y1="261" x2="300" y2="261" stroke="#ef4444" stroke-width="5" stroke-dasharray="14,8"/>
      <!-- Exploding Enemy Drone / Mech Debris -->
      <g transform="translate(360, 220)">
        <circle cx="0" cy="0" r="38" fill="url(#fireGrad)"/>
        <circle cx="10" cy="-8" r="22" fill="#ef4444" opacity="0.8"/>
        <circle cx="-12" cy="10" r="18" fill="#f59e0b"/>
        <!-- Shrapnel sparks -->
        <line x1="-20" y1="-20" x2="-35" y2="-35" stroke="#fef08a" stroke-width="3"/>
        <line x1="20" y1="-15" x2="40" y2="-28" stroke="#fef08a" stroke-width="3"/>
        <line x1="15" y1="25" x2="30" y2="40" stroke="#fef08a" stroke-width="3"/>
      </g>
      <!-- Flying Winged Weapon Capsule [S] -->
      <g transform="translate(250, 110)">
        <!-- Wings -->
        <polygon points="-30,0 -12,-10 -12,10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <polygon points="30,0 12,-10 12,10" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <!-- Red/White Pod -->
        <rect x="-14" y="-12" width="28" height="24" rx="12" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
        <text x="0" y="5" font-family="sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle">S</text>
      </g>
      <!-- Contra Commando Soldier Hero -->
      <g transform="translate(130, 230)">
        <!-- Red Bandana trailing in wind -->
        <path d="M-12,-36 Q-26,-40 -34,-34 Q-24,-30 -12,-32" fill="#dc2626"/>
        <!-- Head & Bandana -->
        <circle cx="0" cy="-34" r="10" fill="#fed7aa"/>
        <rect x="-10" y="-39" width="20" height="6" fill="#dc2626"/>
        <!-- Muscular Torso with Camo Vest -->
        <rect x="-8" y="-24" width="16" height="22" fill="#15803d" stroke="#14532d" stroke-width="2" rx="3"/>
        <rect x="-4" y="-22" width="8" height="12" fill="#fed7aa"/>
        <!-- Blue Commando Combat Trousers -->
        <rect x="-9" y="-2" width="8" height="28" fill="#1d4ed8" rx="2"/>
        <rect x="1" y="-2" width="8" height="28" fill="#1d4ed8" rx="2"/>
        <!-- Combat Boots -->
        <rect x="-11" y="24" width="10" height="8" fill="#1c1917" rx="2"/>
        <rect x="1" y="24" width="10" height="8" fill="#1c1917" rx="2"/>
        <!-- Commando Assault Rifle -->
        <rect x="2" y="-18" width="34" height="7" fill="#1e293b" stroke="#0f172a" stroke-width="1.5" rx="2"/>
        <rect x="20" y="-22" width="6" height="4" fill="#475569"/>
        <rect x="12" y="-11" width="5" height="10" fill="#475569"/>
        <!-- Gun Muzzle Flash -->
        <polygon points="36,-14 48,-19 44,-14 50,-10 42,-11 44,-6 36,-11" fill="#fde047"/>
      </g>
      <!-- Spread Gun (S) Bullets Fanned Outward -->
      <g transform="translate(180, 215)">
        <!-- Center Shot -->
        <circle cx="45" cy="0" r="6" fill="#fbbf24" stroke="#ea580c" stroke-width="2"/>
        <circle cx="110" cy="0" r="7" fill="#facc15" stroke="#ea580c" stroke-width="2"/>
        <!-- Up-Angle Shots -->
        <circle cx="42" cy="-18" r="6" fill="#fbbf24" stroke="#ea580c" stroke-width="2"/>
        <circle cx="100" cy="-45" r="7" fill="#facc15" stroke="#ea580c" stroke-width="2"/>
        <!-- Down-Angle Shots -->
        <circle cx="42" cy="18" r="6" fill="#fbbf24" stroke="#ea580c" stroke-width="2"/>
        <circle cx="100" cy="45" r="7" fill="#facc15" stroke="#ea580c" stroke-width="2"/>
      </g>
      <!-- Iconic Logo Banner -->
      <g transform="translate(300, 52)">
        <rect x="-190" y="-36" width="380" height="56" rx="8" fill="#0f172a" stroke="#dc2626" stroke-width="4" opacity="0.95"/>
        <text x="0" y="2" font-family="'Impact', sans-serif" font-weight="900" font-size="38" fill="#facc15" stroke="#dc2626" stroke-width="2" letter-spacing="4" text-anchor="middle">CONTRA</text>
        <text x="0" y="16" font-family="sans-serif" font-weight="900" font-size="11" fill="#ffffff" letter-spacing="6" text-anchor="middle">JUNGLE COMMANDO</text>
      </g>
    </svg>
  `)}`,

  // 11. Last Platform (2-Player Disappearing Grid)
  'last-platform': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <defs>
        <linearGradient id="voidBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#020617"/>
          <stop offset="50%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#020617"/>
        </linearGradient>
      </defs>
      <rect width="600" height="450" fill="url(#voidBg)"/>
      <!-- Grid Border Glow -->
      <rect x="120" y="100" width="360" height="260" rx="16" fill="none" stroke="#38bdf8" stroke-width="2" opacity="0.3"/>
      <!-- Solid Blue Neon Tiles -->
      <g fill="#1e293b" stroke="#38bdf8" stroke-width="2.5">
        <rect x="150" y="120" width="60" height="60" rx="8"/>
        <rect x="230" y="120" width="60" height="60" rx="8"/>
        <rect x="310" y="120" width="60" height="60" rx="8"/>
        <rect x="150" y="200" width="60" height="60" rx="8"/>
        <rect x="390" y="200" width="60" height="60" rx="8"/>
        <rect x="230" y="280" width="60" height="60" rx="8"/>
        <rect x="310" y="280" width="60" height="60" rx="8"/>
      </g>
      <!-- Warning Red Tiles Disappearing -->
      <g fill="#b91c1c" stroke="#ef4444" stroke-width="3">
        <rect x="390" y="120" width="60" height="60" rx="8"/>
        <text x="420" y="156" font-family="sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">⚠️</text>
        <rect x="230" y="200" width="60" height="60" rx="8"/>
        <text x="260" y="236" font-family="sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">⚠️</text>
        <rect x="150" y="280" width="60" height="60" rx="8"/>
        <text x="180" y="316" font-family="sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">⚠️</text>
      </g>
      <!-- Vanished / Falling Tile -->
      <rect x="310" y="220" width="48" height="48" rx="6" fill="#f43f5e" opacity="0.3" transform="rotate(15 334 244)"/>
      <!-- Player 1 (Cyan) -->
      <circle cx="180" cy="150" r="18" fill="#06b6d4" stroke="#ffffff" stroke-width="3"/>
      <rect x="168" y="146" width="24" height="8" rx="3" fill="#ffffff"/>
      <text x="180" y="124" font-family="sans-serif" font-weight="bold" font-size="12" fill="#22d3ee" text-anchor="middle">P1</text>
      <!-- Player 2 (Rose) -->
      <circle cx="340" cy="310" r="18" fill="#f43f5e" stroke="#ffffff" stroke-width="3"/>
      <rect x="328" y="306" width="24" height="8" rx="3" fill="#ffffff"/>
      <text x="340" y="284" font-family="sans-serif" font-weight="bold" font-size="12" fill="#fb7185" text-anchor="middle">P2</text>
      <!-- Title Banner -->
      <text x="300" y="55" font-family="'Impact', sans-serif" font-weight="900" font-size="36" fill="#ffffff" stroke="#0284c7" stroke-width="2" letter-spacing="2" text-anchor="middle">LAST PLATFORM</text>
      <text x="300" y="80" font-family="sans-serif" font-weight="700" font-size="12" fill="#38bdf8" letter-spacing="4" text-anchor="middle">2-PLAYER FALLOUT SURVIVAL</text>
    </svg>
  `)}`,

  // 12. Quick Draw (2-Player Reaction Standoff)
  'quick-draw': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <defs>
        <linearGradient id="drawBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#450a0a"/>
          <stop offset="60%" stop-color="#18181b"/>
          <stop offset="100%" stop-color="#09090b"/>
        </linearGradient>
      </defs>
      <rect width="600" height="450" fill="url(#drawBg)"/>
      <!-- Giant Stopwatch Dial -->
      <circle cx="300" cy="225" r="110" fill="#18181b" stroke="#f59e0b" stroke-width="4"/>
      <circle cx="300" cy="225" r="95" fill="none" stroke="#fef08a" stroke-width="1.5" stroke-dasharray="6,6"/>
      <!-- Lightning Shockwave -->
      <path d="M280,140 L320,195 L290,225 L325,290" fill="none" stroke="#fde047" stroke-width="6"/>
      <!-- Big FIRE! text -->
      <text x="300" y="235" font-family="'Impact', sans-serif" font-weight="900" font-size="54" fill="#10b981" stroke="#ffffff" stroke-width="2" text-anchor="middle">FIRE! ⚡</text>
      <text x="300" y="265" font-family="monospace" font-weight="900" font-size="18" fill="#fef08a" text-anchor="middle">185 ms</text>
      <!-- Player 1 Cowboy (Cyan) -->
      <g transform="translate(100, 240)">
        <circle cx="0" cy="-40" r="18" fill="#06b6d4" stroke="#ffffff" stroke-width="2.5"/>
        <rect x="-14" y="-20" width="28" height="38" rx="6" fill="#0891b2"/>
        <!-- Revolver gun pointing forward -->
        <rect x="8" y="-12" width="32" height="7" fill="#f8fafc" rx="2"/>
        <polygon points="40,-15 52,-8 40,-2" fill="#facc15"/>
        <text x="0" y="35" font-family="sans-serif" font-weight="900" font-size="14" fill="#22d3ee" text-anchor="middle">PLAYER 1</text>
      </g>
      <!-- Player 2 Cowboy (Rose) -->
      <g transform="translate(500, 240)">
        <circle cx="0" cy="-40" r="18" fill="#f43f5e" stroke="#ffffff" stroke-width="2.5"/>
        <rect x="-14" y="-20" width="28" height="38" rx="6" fill="#e11d48"/>
        <!-- Revolver gun pointing forward -->
        <rect x="-40" y="-12" width="32" height="7" fill="#f8fafc" rx="2"/>
        <polygon points="-40,-15 -52,-8 -40,-2" fill="#facc15"/>
        <text x="0" y="35" font-family="sans-serif" font-weight="900" font-size="14" fill="#fb7185" text-anchor="middle">PLAYER 2</text>
      </g>
      <!-- Title Banner -->
      <text x="300" y="55" font-family="'Impact', sans-serif" font-weight="900" font-size="38" fill="#facc15" stroke="#b45309" stroke-width="2" letter-spacing="3" text-anchor="middle">QUICK DRAW</text>
      <text x="300" y="80" font-family="sans-serif" font-weight="700" font-size="12" fill="#fcd34d" letter-spacing="4" text-anchor="middle">2-PLAYER FASTEST REACTION SHOWDOWN</text>
    </svg>
  `)}`,

  // 13. Infinite Race (2-Player Endless Runner)
  'infinite-race': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#090d16"/>
      <!-- Track divider -->
      <line x1="0" y1="225" x2="600" y2="225" stroke="#334155" stroke-width="3" stroke-dasharray="12,12"/>
      <!-- Top Track (P1 Cyan) -->
      <rect x="0" y="170" width="600" height="24" fill="#083344"/>
      <line x1="0" y1="170" x2="600" y2="170" stroke="#06b6d4" stroke-width="4"/>
      <!-- P1 Runner Jumping -->
      <g transform="translate(100, 110)">
        <rect width="28" height="38" rx="8" fill="#06b6d4" stroke="#ffffff" stroke-width="2.5"/>
        <rect x="18" y="8" width="8" height="6" fill="#ffffff"/>
        <!-- Jump dust -->
        <circle cx="-6" cy="40" r="4" fill="#22d3ee" opacity="0.6"/>
      </g>
      <!-- Red Spiky Hurdle on Track 1 -->
      <rect x="280" y="138" width="22" height="32" rx="4" fill="#ef4444" stroke="#ffffff" stroke-width="2"/>
      <circle cx="360" cy="120" r="9" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
      <!-- Bottom Track (P2 Rose) -->
      <rect x="0" y="365" width="600" height="24" fill="#4c0519"/>
      <line x1="0" y1="365" x2="600" y2="365" stroke="#f43f5e" stroke-width="4"/>
      <!-- P2 Runner Sliding Low -->
      <g transform="translate(100, 345)">
        <rect width="44" height="20" rx="8" fill="#f43f5e" stroke="#ffffff" stroke-width="2.5"/>
        <rect x="30" y="4" width="8" height="5" fill="#ffffff"/>
        <!-- Slide friction spark -->
        <polygon points="-8,18 -16,12 -8,14 -14,8" fill="#facc15"/>
      </g>
      <!-- High Laser Overhead Beam on Track 2 -->
      <rect x="250" y="300" width="36" height="22" rx="4" fill="#9333ea" stroke="#ffffff" stroke-width="2"/>
      <line x1="268" y1="322" x2="268" y2="340" stroke="#f43f5e" stroke-width="3"/>
      <!-- Gold Coins -->
      <circle cx="380" cy="345" r="9" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
      <circle cx="430" cy="345" r="9" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
      <!-- Title -->
      <text x="300" y="55" font-family="'Impact', sans-serif" font-weight="900" font-size="38" fill="#38bdf8" stroke="#0369a1" stroke-width="2" letter-spacing="2" text-anchor="middle">INFINITE RACE</text>
      <text x="300" y="80" font-family="sans-serif" font-weight="700" font-size="12" fill="#bae6fd" letter-spacing="4" text-anchor="middle">2-PLAYER SPLIT-TRACK SPRINT</text>
    </svg>
  `)}`,

  // 14. Mini Arena (2-Player Top-Down Arena Battle)
  'mini-arena': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#080c16"/>
      <!-- Arena Outer Laser Barrier -->
      <rect x="40" y="50" width="520" height="350" rx="14" fill="none" stroke="#38bdf8" stroke-width="4"/>
      <!-- Grid -->
      <path d="M40,120 H560 M40,190 H560 M40,260 H560 M40,330 H560 M140,50 V400 M240,50 V400 M340,50 V400 M440,50 V400" stroke="#1e293b" stroke-width="1.5" opacity="0.6"/>
      <!-- Center Pillar -->
      <rect x="260" y="185" width="80" height="80" rx="10" fill="#1e293b" stroke="#64748b" stroke-width="3"/>
      <!-- Power-up Star in Arena -->
      <circle cx="300" cy="120" r="14" fill="#f59e0b" stroke="#fef08a" stroke-width="2"/>
      <text x="300" y="125" font-family="sans-serif" font-weight="900" font-size="14" fill="#ffffff" text-anchor="middle">S</text>
      <!-- Player 1 Tank / Commando (Cyan) -->
      <g transform="translate(140, 225)">
        <circle cx="0" cy="0" r="22" fill="#06b6d4" stroke="#ffffff" stroke-width="3"/>
        <!-- Gun turret barrel aiming right -->
        <rect x="0" y="-5" width="30" height="10" rx="2" fill="#94a3b8"/>
        <!-- Laser bullet stream -->
        <circle cx="48" cy="0" r="5" fill="#22d3ee"/>
        <circle cx="75" cy="0" r="5" fill="#22d3ee"/>
        <text x="0" y="-30" font-family="sans-serif" font-weight="bold" font-size="12" fill="#22d3ee" text-anchor="middle">P1</text>
      </g>
      <!-- Player 2 Tank / Commando (Rose) -->
      <g transform="translate(460, 225)">
        <circle cx="0" cy="0" r="22" fill="#f43f5e" stroke="#ffffff" stroke-width="3"/>
        <!-- Gun turret barrel aiming left -->
        <rect x="-30" y="-5" width="30" height="10" rx="2" fill="#94a3b8"/>
        <!-- Rose bullet stream -->
        <circle cx="-48" cy="0" r="5" fill="#fb7185"/>
        <circle cx="-75" cy="0" r="5" fill="#fb7185"/>
        <text x="0" y="-30" font-family="sans-serif" font-weight="bold" font-size="12" fill="#fb7185" text-anchor="middle">P2</text>
      </g>
      <!-- Title -->
      <text x="300" y="40" font-family="'Impact', sans-serif" font-weight="900" font-size="34" fill="#ffffff" stroke="#e11d48" stroke-width="2" letter-spacing="2" text-anchor="middle">MINI ARENA</text>
    </svg>
  `)}`,

  // 15. Coin Rush (2-Player 60s Coin Battle)
  'coin-rush': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <rect width="600" height="450" fill="#0f172a"/>
      <!-- Glowing Arena Wall -->
      <rect x="40" y="60" width="520" height="340" rx="16" fill="#0a0e1a" stroke="#eab308" stroke-width="3"/>
      <!-- Big Center Stopwatch Icon -->
      <circle cx="300" cy="230" r="45" fill="#1e293b" stroke="#eab308" stroke-width="3"/>
      <text x="300" y="238" font-family="sans-serif" font-weight="900" font-size="20" fill="#facc15" text-anchor="middle">60s</text>
      <!-- Golden Coins scattered around -->
      <g fill="#facc15" stroke="#ca8a04" stroke-width="2">
        <circle cx="160" cy="140" r="14"/>
        <circle cx="230" cy="180" r="11"/>
        <circle cx="380" cy="150" r="13"/>
        <circle cx="450" cy="130" r="14"/>
        <circle cx="180" cy="310" r="12"/>
        <circle cx="420" cy="300" r="14"/>
      </g>
      <!-- Bomb Hazard -->
      <circle cx="300" cy="330" r="14" fill="#1c1917" stroke="#ef4444" stroke-width="2.5"/>
      <text x="300" y="335" font-size="14" text-anchor="middle">💣</text>
      <!-- Magnet Power-up -->
      <circle cx="300" cy="120" r="14" fill="#ec4899" stroke="#ffffff" stroke-width="2"/>
      <text x="300" y="125" font-size="14" text-anchor="middle">🧲</text>
      <!-- Player 1 (Cyan) rushing toward coins -->
      <g transform="translate(130, 220)">
        <circle cx="0" cy="0" r="20" fill="#06b6d4" stroke="#ffffff" stroke-width="2.5"/>
        <rect x="-12" y="-4" width="24" height="8" rx="3" fill="#ffffff"/>
        <text x="0" y="35" font-family="sans-serif" font-weight="900" font-size="13" fill="#22d3ee" text-anchor="middle">P1: $1,400</text>
      </g>
      <!-- Player 2 (Rose) rushing toward coins -->
      <g transform="translate(470, 220)">
        <circle cx="0" cy="0" r="20" fill="#f43f5e" stroke="#ffffff" stroke-width="2.5"/>
        <rect x="-12" y="-4" width="24" height="8" rx="3" fill="#ffffff"/>
        <text x="0" y="35" font-family="sans-serif" font-weight="900" font-size="13" fill="#fb7185" text-anchor="middle">P2: $1,200</text>
      </g>
      <!-- Title -->
      <text x="300" y="48" font-family="'Impact', sans-serif" font-weight="900" font-size="38" fill="#facc15" stroke="#ca8a04" stroke-width="2" letter-spacing="3" text-anchor="middle">COIN RUSH</text>
    </svg>
  `)}`,

  // 16. Bomb Tag (2-Player Hot Potato Arena Tag)
  'bomb-tag': `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="100%" height="100%">
      <defs>
        <radialGradient id="fuseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="60%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="bombTagBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#18181b"/>
          <stop offset="50%" stop-color="#09090b"/>
          <stop offset="100%" stop-color="#270505"/>
        </linearGradient>
      </defs>
      <rect width="600" height="450" fill="url(#bombTagBg)"/>
      <!-- Arena Outer Ring -->
      <rect x="40" y="55" width="520" height="350" rx="20" fill="#09090b" stroke="#f43f5e" stroke-width="3" stroke-dasharray="10,6"/>
      <!-- Hazard Corner Bumpers -->
      <circle cx="80" cy="95" r="22" fill="#3b82f6" opacity="0.8"/>
      <circle cx="520" cy="95" r="22" fill="#3b82f6" opacity="0.8"/>
      <circle cx="80" cy="365" r="22" fill="#3b82f6" opacity="0.8"/>
      <circle cx="520" cy="365" r="22" fill="#3b82f6" opacity="0.8"/>
      <!-- Speed Boost Arrows on ground -->
      <polygon points="260,225 290,205 290,215 340,215 340,235 290,235 290,245" fill="#eab308" opacity="0.5"/>
      <!-- Giant Danger Bomb in Center -->
      <g transform="translate(300, 220)">
        <!-- Bomb Body -->
        <circle cx="0" cy="0" r="48" fill="#18181b" stroke="#ef4444" stroke-width="4"/>
        <ellipse cx="-14" cy="-14" rx="12" ry="8" fill="#52525b" transform="rotate(-30 -14 -14)"/>
        <!-- Bomb Cap -->
        <rect x="-10" y="-56" width="20" height="10" rx="3" fill="#71717a"/>
        <!-- Burning Fuse Curve -->
        <path d="M0,-56 Q14,-75 28,-65" fill="none" stroke="#ca8a04" stroke-width="4"/>
        <!-- Fuse Spark -->
        <circle cx="28" cy="-65" r="16" fill="url(#fuseGlow)"/>
        <circle cx="28" cy="-65" r="6" fill="#fef08a"/>
        <!-- Skull/Countdown Face on Bomb -->
        <text x="0" y="10" font-family="'Impact', sans-serif" font-weight="900" font-size="28" fill="#ef4444" text-anchor="middle">5s</text>
      </g>
      <!-- Player 1 (Cyan) - Fleeing with Dash Trails -->
      <g transform="translate(130, 260)">
        <ellipse cx="-20" cy="0" rx="16" ry="6" fill="#06b6d4" opacity="0.3"/>
        <circle cx="0" cy="0" r="22" fill="#06b6d4" stroke="#ffffff" stroke-width="3"/>
        <rect x="2" y="-4" width="16" height="8" rx="3" fill="#ffffff"/>
        <text x="0" y="-30" font-family="sans-serif" font-weight="900" font-size="13" fill="#22d3ee" text-anchor="middle">RUN! (P1)</text>
      </g>
      <!-- Player 2 (Rose) - Has Bomb, Chasing -->
      <g transform="translate(470, 180)">
        <circle cx="0" cy="0" r="24" fill="#f43f5e" stroke="#ffffff" stroke-width="3"/>
        <rect x="-18" y="-4" width="16" height="8" rx="3" fill="#ffffff"/>
        <!-- Mini Bomb on head -->
        <circle cx="0" cy="-34" r="12" fill="#18181b" stroke="#ef4444" stroke-width="2"/>
        <circle cx="6" cy="-44" r="5" fill="#facc15"/>
        <text x="0" y="38" font-family="sans-serif" font-weight="900" font-size="13" fill="#fb7185" text-anchor="middle">TAGGER (P2)</text>
      </g>
      <!-- Title -->
      <text x="300" y="44" font-family="'Impact', sans-serif" font-weight="900" font-size="38" fill="#f43f5e" stroke="#991b1b" stroke-width="2" letter-spacing="3" text-anchor="middle">BOMB TAG</text>
      <text x="300" y="66" font-family="sans-serif" font-weight="700" font-size="12" fill="#fca5a5" letter-spacing="3" text-anchor="middle">2-PLAYER HOT POTATO SHOWDOWN</text>
    </svg>
  `)}`,
};

export const getGameThumbnail = (slug: string, fallbackUrl: string): string => {
  if (GAME_THUMBNAILS[slug]) {
    return GAME_THUMBNAILS[slug];
  }
  return fallbackUrl;
};
