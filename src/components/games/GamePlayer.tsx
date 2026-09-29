import React, { useState, useRef, useEffect } from 'react';
import { Game } from '../../types/game';
import { CyberSnake } from './builtin/CyberSnake';
import { SpaceBlaster } from './builtin/SpaceBlaster';
import { Puzzle2048 } from './builtin/Puzzle2048';
import { BrickBreaker } from './builtin/BrickBreaker';
import { TowerStack } from './builtin/TowerStack';
import { MemoryMatrix } from './builtin/MemoryMatrix';
import { SuperPlatformer } from './builtin/SuperPlatformer';
import { StoneBalance } from './builtin/StoneBalance';
import { FlappyBird } from './builtin/FlappyBird';
import { TapPlane } from './builtin/TapPlane';
import { ContraGame } from './builtin/ContraGame';
import { LastPlatform } from './builtin/LastPlatform';
import { QuickDraw } from './builtin/QuickDraw';
import { InfiniteRace } from './builtin/InfiniteRace';
import { MiniArena } from './builtin/MiniArena';
import { CoinRush } from './builtin/CoinRush';
import { BombTag } from './builtin/BombTag';
import { GenericIframePlayer } from './GenericIframePlayer';
import { sound } from '../../utils/audio';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Share2,
  Tv,
  Check,
} from 'lucide-react';

interface Props {
  game: Game;
  onPlayIncrement?: (gameId: string) => void;
}

export const GamePlayer: React.FC<Props> = ({ game, onPlayIncrement }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [isMuted, setIsMuted] = useState(!sound.enabled);
  const [reloadKey, setReloadKey] = useState(0);
  const [copied, setCopied] = useState(false);

  // Trigger play count on mount
  useEffect(() => {
    onPlayIncrement?.(game.id);
  }, [game.id, onPlayIncrement]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    sound.unlockMobileAudio();
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        // Handle iOS Safari webkitRequestFullscreen if standard requestFullscreen is unavailable
        const el = containerRef.current as any;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (e) {
      console.error('Fullscreen request failed', e);
    }
  };

  const toggleMute = () => {
    sound.unlockMobileAudio();
    sound.enabled = !sound.enabled;
    setIsMuted(!sound.enabled);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Play ${game.title} on OnlineGameNest`,
          text: game.description,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderGameContent = () => {
    if (game.engineType === 'builtin') {
      switch (game.builtinId) {
        case 'cyber-snake':
          return <CyberSnake key={reloadKey} />;
        case 'space-blaster':
          return <SpaceBlaster key={reloadKey} />;
        case '2048-pulse':
          return <Puzzle2048 key={reloadKey} />;
        case 'brick-breaker':
          return <BrickBreaker key={reloadKey} />;
        case 'tower-stack':
          return <TowerStack key={reloadKey} />;
        case 'memory-matrix':
          return <MemoryMatrix key={reloadKey} />;
        case 'super-platformer':
          return <SuperPlatformer key={reloadKey} />;
        case 'stone-balance':
          return <StoneBalance key={reloadKey} />;
        case 'flappy-bird':
          return <TapPlane key={reloadKey} />;
        case 'tap-plane':
          return <TapPlane key={reloadKey} />;
        case 'contra':
          return <ContraGame key={reloadKey} />;
        case 'last-platform':
          return <LastPlatform key={reloadKey} />;
        case 'quick-draw':
          return <QuickDraw key={reloadKey} />;
        case 'infinite-race':
          return <InfiniteRace key={reloadKey} />;
        case 'mini-arena':
          return <MiniArena key={reloadKey} />;
        case 'coin-rush':
          return <CoinRush key={reloadKey} />;
        case 'bomb-tag':
          return <BombTag key={reloadKey} />;
        default:
          return <CyberSnake key={reloadKey} />;
      }
    }

    if (game.gameUrl) {
      return (
        <GenericIframePlayer
          key={reloadKey}
          gameUrl={game.gameUrl}
          title={game.title}
        />
      );
    }

    // Default fallback to Cyber Snake
    return <CyberSnake key={reloadKey} />;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-0 h-screen w-screen flex flex-col'
          : isTheater
          ? 'h-[620px] max-w-5xl mx-auto'
          : 'h-[520px] sm:h-[580px]'
      }`}
    >
      {/* Game Content Canvas / Frame */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center bg-black">
        {renderGameContent()}
      </div>

      {/* Modern Player Control Toolbar */}
      <div className="w-full h-12 bg-slate-900/95 backdrop-blur border-t border-slate-800/80 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300 truncate max-w-[140px] sm:max-w-xs">
            {game.title}
          </span>
          <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
            {game.category}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-lg transition ${
              isMuted ? 'text-rose-400 bg-rose-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={isMuted ? 'Unmute' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Restart */}
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Reload Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Theater Mode */}
          {!isFullscreen && (
            <button
              onClick={() => setIsTheater(!isTheater)}
              className={`p-1.5 rounded-lg transition hidden md:block ${
                isTheater ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={isTheater ? 'Default Size' : 'Theater Mode'}
            >
              <Tv className="w-4 h-4" />
            </button>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition relative"
            title="Share Game"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            {copied && (
              <span className="absolute -top-7 right-0 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded shadow">
                Copied!
              </span>
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition ml-1 flex items-center gap-1 text-xs font-semibold px-2.5"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
