import React, { useState, useMemo } from 'react';
import { Game } from '../types/game';
import { GameCard } from '../components/games/GameCard';
import { CategoryPills } from '../components/common/CategoryPills';
import { AdSlot } from '../components/ads/AdSlot';
import {
  Compass,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  Search,
  Users,
  Flame,
  Swords,
} from 'lucide-react';

interface Props {
  games: Game[];
  onSelectGame: (slug: string) => void;
  onNavigate: (route: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const HomePage: React.FC<Props> = ({
  games,
  onSelectGame,
  onNavigate,
  favorites,
  onToggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'popular' | 'rating'>('popular');

  // Filter games based on selected category and quick search
  const displayedGames = useMemo(() => {
    let list = selectedCategory
      ? games.filter((g) => g.category === selectedCategory)
      : [...games];

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.plays - a.plays;
    });

    return list;
  }, [games, selectedCategory, searchFilter, sortBy]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Advertisement */}
      <div className="w-full flex justify-center pt-2">
        <AdSlot slotType="leaderboard" title="Top Leaderboard Banner" />
      </div>

      {/* Top 5 2-Player Competitive Showdown Spotlight */}
      {!selectedCategory && !searchFilter && (
        <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/80 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-black uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5" /> 2-Player Local Showdown
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Top 5 Competitive 2-Player Games <Swords className="w-6 h-6 text-rose-500" />
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Grab a friend on the same device! Play with split-keyboard controls on PC or dual-touch D-pads on mobile phones & tablets.
              </p>
            </div>

            <button
              onClick={() => setSelectedCategory('Multiplayer')}
              className="self-start md:self-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5" /> View All 2-Player ({games.filter((g) => g.category === 'Multiplayer').length})
            </button>
          </div>

          {/* 5 Games Quick Launch Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {[
              {
                slug: 'coin-rush',
                rank: '1',
                title: 'Coin Rush',
                hook: 'Easiest to make fun',
                desc: '60s coin frenzy & power-ups',
                color: 'from-amber-500/20 border-amber-500/40 text-amber-300',
              },
              {
                slug: 'last-platform',
                rank: '2',
                title: 'Last Platform',
                hook: 'Best for repeated matches',
                desc: 'Grid tiles fall into abyss',
                color: 'from-cyan-500/20 border-cyan-500/40 text-cyan-300',
              },
              {
                slug: 'quick-draw',
                rank: '3',
                title: 'Quick Draw',
                hook: 'Surprisingly addictive',
                desc: 'Lightning reflex standoff',
                color: 'from-emerald-500/20 border-emerald-500/40 text-emerald-300',
              },
              {
                slug: 'mini-arena',
                rank: '4',
                title: 'Mini Arena',
                hook: 'Strongest long-term potential',
                desc: 'Top-down dash & 5-kill duel',
                color: 'from-purple-500/20 border-purple-500/40 text-purple-300',
              },
              {
                slug: 'bomb-tag',
                rank: '5',
                title: 'Bomb Tag',
                hook: 'Short & explosive matches',
                desc: 'Hot potato ticking tag arena',
                color: 'from-rose-500/20 border-rose-500/40 text-rose-300',
              },
            ].map((item) => {
              const gameObj = games.find((g) => g.slug === item.slug);
              return (
                <div
                  key={item.slug}
                  onClick={() => onSelectGame(item.slug)}
                  className="group relative bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-black text-xs flex items-center justify-center border border-slate-700">
                        #{item.rank}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-gradient-to-r ${item.color}`}>
                        {item.hook}
                      </span>
                    </div>

                    {gameObj && (
                      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2.5 bg-black border border-slate-800/80">
                        <img
                          src={gameObj.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono text-cyan-400 font-bold">2 Players</span>
                    <span className="text-slate-300 font-semibold group-hover:text-white flex items-center gap-1">
                      Play Now <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Browse By Category Hub */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
              <Compass className="w-4 h-4" /> Games Catalog
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Browse By Category
            </h1>
          </div>

          <button
            onClick={() => onNavigate('categories')}
            className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold self-start sm:self-center"
          >
            Explore Category Directory <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Pills Bar */}
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />

        {/* Filter & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Active Category Title & Count */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {selectedCategory ? (
                <>
                  <span className="text-cyan-600 dark:text-cyan-400">{selectedCategory}</span> Games
                </>
              ) : (
                'All Games'
              )}
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {displayedGames.length} {displayedGames.length === 1 ? 'game' : 'games'}
            </span>

            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold ml-2"
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Search within Category & Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Quick Search */}
            <div className="relative flex-1 sm:w-48">
              <input
                type="text"
                placeholder="Filter games..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-8 pr-7 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-sm"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-sm text-xs text-slate-700 dark:text-slate-300">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent focus:outline-none text-xs cursor-pointer font-medium"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {displayedGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 pt-2">
            {displayedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelectGame={onSelectGame}
                isFavorited={favorites.includes(game.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No games found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No games matched your current category or search filter. Try selecting a different category or clearing the search.
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSearchFilter('');
              }}
              className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition"
            >
              Show All Games
            </button>
          </div>
        )}
      </section>

      {/* Mid-Page Advertisement Unit */}
      <div className="w-full py-2">
        <AdSlot slotType="in-feed" title="Catalog Native Sponsored Banner" />
      </div>

      {/* Bottom Billboard Ad Slot */}
      <div className="w-full flex justify-center py-2">
        <AdSlot slotType="billboard" title="Bottom Billboard Ad Space" />
      </div>
    </div>
  );
};
