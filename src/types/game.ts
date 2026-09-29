export interface Game {
  id: string;
  title: string;
  slug: string;
  legacySlug?: string;
  description: string;
  instructions: string;
  thumbnail: string;
  category: GameCategory;
  tags: string[];
  engineType: 'builtin' | 'iframe';
  builtinId?:
    | 'cyber-snake'
    | 'space-blaster'
    | '2048-pulse'
    | 'brick-breaker'
    | 'tower-stack'
    | 'color-connect'
    | 'memory-matrix'
    | 'super-platformer'
    | 'stone-balance'
    | 'flappy-bird'
    | 'tap-plane'
    | 'contra'
    | 'last-platform'
    | 'quick-draw'
    | 'infinite-race'
    | 'mini-arena'
    | 'coin-rush'
    | 'bomb-tag';
  gameUrl?: string;
  controls: { [action: string]: string };
  releaseDate: string;
  plays: number;
  rating: number;
  ratingCount: number;
  isFeatured: boolean;
  isPopular: boolean;
  isNew: boolean;
  developer: string;
  orientation?: 'landscape' | 'portrait' | 'any';
}

export type GameCategory =
  | 'Action'
  | 'Adventure'
  | 'Arcade'
  | 'Puzzle'
  | 'Racing'
  | 'Sports'
  | 'Strategy'
  | 'Shooting'
  | 'Multiplayer'
  | 'Casual'
  | 'io Games'
  | 'Card Games'
  | 'Board Games'
  | 'Kids'
  | 'Educational';

export const GAME_CATEGORIES: GameCategory[] = [
  'Action',
  'Adventure',
  'Arcade',
  'Puzzle',
  'Racing',
  'Sports',
  'Strategy',
  'Shooting',
  'Multiplayer',
  'Casual',
  'io Games',
  'Card Games',
  'Board Games',
  'Kids',
  'Educational',
];

export interface PlayRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  category: GameCategory;
  timestamp: number;
  device: 'desktop' | 'mobile' | 'tablet';
}

export interface AdSettings {
  enabled: boolean;
  demoMode: boolean; // Show labeled visual mock ads or live scripts
  adClient: string; // e.g. ca-pub-XXXXXXXXXXXXXXXX
  topLeaderboardSlot: string;
  leftSkyscraperSlot: string;
  rightSkyscraperSlot: string;
  bottomSlot: string;
  mobileSlot: string;
}

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  advertising: boolean;
  saved: boolean;
}
