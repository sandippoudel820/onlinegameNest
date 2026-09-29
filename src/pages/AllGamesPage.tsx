import React, { useState, useMemo } from 'react';
import { Game, GAME_CATEGORIES, GameCategory } from '../types/game';
import { GameCard } from '../components/games/GameCard';
import { AdSlot } from '../components/ads/AdSlot';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Flame,
  Sparkles,
  Heart,
  Grid,
} from 'lucide-react';

interface Props {
  games: Game[];
  onSelectGame: (slug: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  initialCategory?: string | null;
  initialFilter?: string | null;
  initialSort?: string;
}

export const AllGamesPage: React.FC<Props> = ({
  games,
  onSelectGame,
  favorites,
  onToggleFavorite,
  initialCategory = null,
  initialFilter = null,
  initialSort = 'popular',
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [filterType, setFilterType] = useState<string>(initialFilter || 'all');
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 18;

  const filteredGames = useMemo(() => {
    return games
      .filter((g) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = g.title.toLowerCase().includes(q);
          const matchCat = g.category.toLowerCase().includes(q);
          const matchTags = g.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchCat && !matchTags) return false;
        }

        // Category filter
        if (category && g.category !== category) return false;

        // Filter type
        if (filterType === 'favorites' && !favorites.includes(g.id)) return false;
        if (filterType === 'popular' && !g.isPopular) return false;
        if (filterType === 'featured' && !g.isFeatured) return false;
        if (filterType === 'new' && !g.isNew) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.plays - a.plays;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        if (sortBy === 'az') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [games, search, category, filterType, sortBy, favorites]);

  // Paginated items
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE) || 1;
  const paginatedGames = filteredGames.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Advertisement */}
      <div className="w-full flex justify-center">
        <AdSlot slotType="leaderboard" title="Games Catalog Leaderboard" />
      </div>

      {/* Header Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Grid className="w-6 h-6 text-cyan-400" />
            All Browser Games
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse our entire library of free HTML5 web games. Instant play on any screen.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 w-fit">
          <span>{filteredGames.length} Games Found</span>
        </div>
      </div>

      {/* Controls Bar: Search, Category, Filter Chips, Sort */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, tag, or category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={category || ''}
              onChange={(e) => {
                setCategory(e.target.value || null);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="">All Categories (15+)</option>
              {GAME_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} Games
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none appearance-none cursor-pointer"
            >
              <option value="popular">Sort: Most Played</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="newest">Sort: Newest Releases</option>
              <option value="az">Sort: Alphabetical (A-Z)</option>
            </select>
            <SlidersHorizontal className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                setFilterType('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filterType === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setFilterType('popular');
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
                filterType === 'popular'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-3 h-3" /> Hot
            </button>
            <button
              onClick={() => {
                setFilterType('featured');
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
                filterType === 'featured'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Featured
            </button>
            <button
              onClick={() => {
                setFilterType('favorites');
                setCurrentPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
                filterType === 'favorites'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Heart className="w-3 h-3" /> Saved ({favorites.length})
            </button>
          </div>
        </div>
      </div>

      {/* Games Grid (5-6 desktop, 3-4 tablet, 2 mobile) */}
      {paginatedGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {paginatedGames.map((game) => (
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
          <p className="text-base font-bold text-white mb-1">No matching games found</p>
          <p className="text-xs text-slate-400 mb-4">
            Try resetting your search query or choosing another category.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory(null);
              setFilterType('all');
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold border border-slate-800"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                currentPage === i + 1
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold border border-slate-800"
          >
            Next
          </button>
        </div>
      )}

      {/* In-Feed Sponsored Unit */}
      <div className="w-full py-4">
        <AdSlot slotType="in-feed" title="Catalog Sponsored Footer Ad" />
      </div>
    </div>
  );
};
