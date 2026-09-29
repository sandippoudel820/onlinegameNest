import React from 'react';
import { Game } from '../../types/game';
import { Play, Star, Flame, Eye, Heart } from 'lucide-react';

interface Props {
  game: Game;
  onSelectGame: (slug: string) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (gameId: string, e: React.MouseEvent) => void;
}

export const GameCard: React.FC<Props> = ({
  game,
  onSelectGame,
  isFavorited = false,
  onToggleFavorite,
}) => {
  const formatPlays = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <div
      onClick={() => onSelectGame(game.slug)}
      className="group relative flex flex-col bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800/90 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5"
    >
      {/* Thumbnail Aspect Ratio Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
        <img
          src={game.thumbnail}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 opacity-70 group-hover:opacity-40 transition-opacity" />

        {/* Badges on Top */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          {game.isNew ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500 text-slate-950 shadow-md">
              NEW
            </span>
          ) : game.isPopular ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500 text-white flex items-center gap-1 shadow-md">
              <Flame className="w-3 h-3 fill-current" /> HOT
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/80 backdrop-blur text-slate-300 border border-slate-700">
              {game.category}
            </span>
          )}

          {/* Favorite Toggle Button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => onToggleFavorite(game.id, e)}
              className={`p-1.5 rounded-full backdrop-blur pointer-events-auto transition ${
                isFavorited
                  ? 'bg-rose-500/90 text-white shadow-md shadow-rose-500/30'
                  : 'bg-black/50 text-slate-300 hover:text-white hover:bg-black/80'
              }`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Quick Play Hover Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/40 transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            {game.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{game.rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-slate-400">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatPlays(game.plays)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
