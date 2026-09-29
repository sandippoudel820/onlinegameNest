import React from 'react';
import { Game } from '../../types/game';
import { Play, Star, Eye, Heart } from 'lucide-react';

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
      className="group relative flex flex-col bg-white dark:bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/90 hover:border-cyan-500/60 dark:hover:border-cyan-500/50 shadow-sm hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5"
    >
      {/* Thumbnail Aspect Ratio Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
        <img
          src={game.thumbnail}
          alt={game.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-30 transition-opacity" />

        {/* Badges on Top */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur text-white border border-white/20 shadow-sm">
            {game.category}
          </span>

          {/* Favorite Toggle Button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => onToggleFavorite(game.id, e)}
              className={`p-1.5 rounded-full backdrop-blur pointer-events-auto transition ${
                isFavorited
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'bg-black/50 text-white/90 hover:text-white hover:bg-black/80'
              }`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Quick Play Hover Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/35 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/40 transform scale-75 group-hover:scale-100 transition-transform font-bold">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-3 flex flex-col flex-1 justify-between bg-white dark:bg-slate-900/90">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
            {game.title}
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
            {game.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{game.rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-slate-400 dark:text-slate-500">
            <Eye className="w-3.5 h-3.5" />
            <span>{formatPlays(game.plays)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
