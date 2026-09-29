import React, { useState } from 'react';
import { Game } from '../types/game';
import { GameCard } from '../components/games/GameCard';
import { CategoryPills } from '../components/common/CategoryPills';
import { AdSlot } from '../components/ads/AdSlot';
import {
  Flame,
  Sparkles,
  Trophy,
  ArrowRight,
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

  const featuredGames = games.filter((g) => g.isFeatured).slice(0, 6);
  const popularGames = games.filter((g) => g.isPopular).slice(0, 6);
  const newGames = games.filter((g) => g.isNew).slice(0, 6);

  // Filtered games if category is selected
  const categoryFilteredGames = selectedCategory
    ? games.filter((g) => g.category === selectedCategory)
    : [];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Top Banner Advertisement */}
      <div className="w-full flex justify-center pt-2">
        <AdSlot slotType="leaderboard" title="Top Leaderboard Banner" />
      </div>

      {/* Category Pills Navigation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Browse By Category
          </h2>
          <button
            onClick={() => onNavigate('categories')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
      </div>

      {/* When a category pill is selected, show that category directly */}
      {selectedCategory && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span className="text-cyan-400">{selectedCategory}</span> Games ({categoryFilteredGames.length})
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Clear Filter
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {categoryFilteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelectGame={onSelectGame}
                isFavorited={favorites.includes(game.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured Games Grid */}
      {!selectedCategory && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Featured Games
              </h2>
            </div>
            <button
              onClick={() => onNavigate('all-games?filter=featured')}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-semibold transition"
            >
              See All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {featuredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelectGame={onSelectGame}
                isFavorited={favorites.includes(game.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mid-Page In-Feed Native Ad Unit */}
      <div className="w-full py-2">
        <AdSlot slotType="in-feed" title="Featured Feed Sponsored Unit" />
      </div>

      {/* Popular Games Grid */}
      {!selectedCategory && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                <Flame className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Most Popular
              </h2>
            </div>
            <button
              onClick={() => onNavigate('all-games?sort=popular')}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 font-semibold transition"
            >
              See All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {popularGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelectGame={onSelectGame}
                isFavorited={favorites.includes(game.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* New Releases Grid */}
      {!selectedCategory && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Trophy className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                New Releases & Recently Added
              </h2>
            </div>
            <button
              onClick={() => onNavigate('all-games?sort=newest')}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-semibold transition"
            >
              See All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {newGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelectGame={onSelectGame}
                isFavorited={favorites.includes(game.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Bottom Leaderboard Advertisement */}
      <div className="w-full flex justify-center py-4">
        <AdSlot slotType="billboard" title="Bottom Billboard Ad Space" />
      </div>
    </div>
  );
};
