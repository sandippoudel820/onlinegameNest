import React from 'react';
import { Game, GAME_CATEGORIES, GameCategory } from '../types/game';
import { getCategoryIcon } from '../components/common/CategoryPills';
import { AdSlot } from '../components/ads/AdSlot';
import { Compass, ArrowRight, Play } from 'lucide-react';

interface Props {
  games: Game[];
  onSelectCategory: (category: string) => void;
  onSelectGame: (slug: string) => void;
}

const CATEGORY_DESCRIPTIONS: { [key: string]: string } = {
  Action: 'High-intensity reflexes, sword fighting, fast combat, and survival tests.',
  Adventure: 'Epic quests, procedural dungeon crawls, and mythical stories to explore.',
  Arcade: 'Classic retro coin-op fun, synthwave neon grids, and nostalgic favorites.',
  Puzzle: 'Brain-teasers, mathematical riddles, logic gates, and flow connections.',
  Racing: 'High-speed drift circuits, drag races, nitrous boosts, and hairpin turns.',
  Sports: 'Championship penalty shootouts, basketball hoops, and athletic physics.',
  Strategy: 'Tactical maneuvers, tower defense, cosmic chess, and resource dominance.',
  Shooting: 'Vertical starfighter blasters, target snipers, and laser barrage defenses.',
  Multiplayer: 'Real-time arena showdowns, team co-op, and competitive leaderboards.',
  Casual: 'Relaxing quick-play sessions, stackers, tap games, and stress relievers.',
  'io Games': 'Massive arena slithering, growth mechanics, and real-time eat-or-be-eaten.',
  'Card Games': 'Klondike solitaire, poker tactics, blackjack, and trading card decks.',
  'Board Games': 'Chess, checkers, backgammon, dice rolls, and classic tabletop logic.',
  Kids: 'Safe, colorful, cheerful family-friendly adventures and cartoon characters.',
  Educational: 'Math battles, vocabulary masterminds, memory trainers, and science quizzes.',
};

export const CategoriesPage: React.FC<Props> = ({
  games,
  onSelectCategory,
  onSelectGame,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Advertisement */}
      <div className="w-full flex justify-center">
        <AdSlot slotType="leaderboard" title="Categories Hub Header Ad" />
      </div>

      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
          <Compass className="w-3.5 h-3.5" /> Discovery Directory
        </div>
        <h1 className="text-3xl font-black text-white">Game Categories</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Explore over 15 distinct genres of free browser games. Every game runs instantly inside your browser without downloads.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {GAME_CATEGORIES.map((cat) => {
          const categoryGames = games.filter((g) => g.category === cat);
          const topGames = categoryGames.slice(0, 3);
          const desc = CATEGORY_DESCRIPTIONS[cat] || 'Explore fun and exciting web games.';

          return (
            <div
              key={cat}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/30 transition-colors">
                      {getCategoryIcon(cat)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {cat}
                      </h2>
                      <span className="text-[11px] font-mono text-slate-500">
                        {categoryGames.length} {categoryGames.length === 1 ? 'game' : 'games'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="p-2 rounded-xl bg-slate-950 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition"
                    title={`View all ${cat} games`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {desc}
                </p>

                {/* Top preview games */}
                {topGames.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Featured in {cat}
                    </span>
                    {topGames.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => onSelectGame(g.slug)}
                        className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={g.thumbnail}
                            alt={g.title}
                            className="w-6 h-6 rounded object-cover"
                          />
                          <span className="text-slate-300 font-medium truncate">{g.title}</span>
                        </div>
                        <Play className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelectCategory(cat)}
                className="mt-4 w-full py-2 bg-slate-950 hover:bg-cyan-600 hover:text-white text-xs font-semibold text-slate-300 rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-800 hover:border-transparent"
              >
                Browse All {cat} Games <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Mid Page Native In-Feed Ad Slot */}
      <div className="w-full py-4">
        <AdSlot slotType="billboard" title="Categories Hub Billboard Ad Space" />
      </div>
    </div>
  );
};
