import React, { useState } from 'react';
import { Game } from '../types/game';
import { GameCard } from '../components/games/GameCard';
import { AdSlot } from '../components/ads/AdSlot';
import { Search, Sparkles } from 'lucide-react';

interface Props {
  query: string;
  games: Game[];
  onSelectGame: (slug: string) => void;
  onNavigate: (route: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const SearchResultsPage: React.FC<Props> = ({
  query,
  games,
  onSelectGame,
  onNavigate,
  favorites,
  onToggleFavorite,
}) => {
  const [searchInput, setSearchInput] = useState(query);

  const cleanQuery = query.trim().toLowerCase();

  const results = games.filter((g) => {
    if (!cleanQuery) return true;
    const inTitle = g.title.toLowerCase().includes(cleanQuery);
    const inCategory = g.category.toLowerCase().includes(cleanQuery);
    const inTags = g.tags.some((t) => t.toLowerCase().includes(cleanQuery));
    const inDesc = g.description.toLowerCase().includes(cleanQuery);
    return inTitle || inCategory || inTags || inDesc;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate(`search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="w-full flex justify-center">
        <AdSlot slotType="leaderboard" title="Search Results Header Ad" />
      </div>

      {/* Search Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-cyan-400" />
          Search Results for &quot;<span className="text-cyan-400">{query || 'All Games'}</span>&quot;
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Found {results.length} matching browser games
        </p>

        {/* Refined Search Form */}
        <form onSubmit={handleSearchSubmit} className="mt-4 max-w-lg flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search again..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {results.map((game) => (
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
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            No games found for &quot;{query}&quot;
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
            Check your spelling, try simpler terms like &quot;arcade&quot; or &quot;snake&quot;, or explore our popular categories.
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => onNavigate('categories')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
            >
              Browse Categories
            </button>
            <button
              onClick={() => onNavigate('all-games')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
            >
              View All Games
            </button>
          </div>
        </div>
      )}

      <div className="w-full py-4">
        <AdSlot slotType="billboard" title="Search Page Wide Billboard" />
      </div>
    </div>
  );
};
