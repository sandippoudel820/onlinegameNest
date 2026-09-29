import React from 'react';
import { GameCategory, GAME_CATEGORIES } from '../../types/game';
import {
  Gamepad2,
  Compass,
  Zap,
  Puzzle,
  Car,
  Trophy,
  Target,
  Crosshair,
  Users,
  Coffee,
  Globe,
  Club,
  Layers,
  Smile,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface Props {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Action':
      return <Zap className="w-3.5 h-3.5 text-rose-400" />;
    case 'Adventure':
      return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
    case 'Arcade':
      return <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />;
    case 'Puzzle':
      return <Puzzle className="w-3.5 h-3.5 text-amber-400" />;
    case 'Racing':
      return <Car className="w-3.5 h-3.5 text-orange-400" />;
    case 'Sports':
      return <Trophy className="w-3.5 h-3.5 text-yellow-400" />;
    case 'Strategy':
      return <Target className="w-3.5 h-3.5 text-indigo-400" />;
    case 'Shooting':
      return <Crosshair className="w-3.5 h-3.5 text-red-500" />;
    case 'Multiplayer':
      return <Users className="w-3.5 h-3.5 text-blue-400" />;
    case 'Casual':
      return <Coffee className="w-3.5 h-3.5 text-pink-400" />;
    case 'io Games':
      return <Globe className="w-3.5 h-3.5 text-teal-400" />;
    case 'Card Games':
      return <Club className="w-3.5 h-3.5 text-violet-400" />;
    case 'Board Games':
      return <Layers className="w-3.5 h-3.5 text-lime-400" />;
    case 'Kids':
      return <Smile className="w-3.5 h-3.5 text-sky-400" />;
    case 'Educational':
      return <GraduationCap className="w-3.5 h-3.5 text-purple-400" />;
    default:
      return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
  }
};

export const CategoryPills: React.FC<Props> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max">
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> All Categories
        </button>

        {GAME_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(isSelected ? null : cat)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {getCategoryIcon(cat)}
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
