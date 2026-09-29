import React, { useState, useRef, useEffect } from 'react';
import { Game } from '../../types/game';
import { useTheme } from '../../context/ThemeContext';
import {
  Gamepad2,
  Search,
  Dice5,
  Heart,
  Shield,
  Menu,
  X,
  Compass,
  Sparkles,
  Flame,
  Sun,
  Moon,
} from 'lucide-react';

interface Props {
  currentRoute: string;
  onNavigate: (route: string) => void;
  games: Game[];
  favoritesCount: number;
}

export const Header: React.FC<Props> = ({
  currentRoute,
  onNavigate,
  games,
  favoritesCount,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Filter instant suggestions
  const suggestions = searchQuery.trim()
    ? games
        .filter((g) =>
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    onNavigate(`search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleRandomGame = () => {
    if (games.length === 0) return;
    const randomGame = games[Math.floor(Math.random() * games.length)];
    onNavigate(`game/${randomGame.slug}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0a0d14]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => {
            onNavigate('home');
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300 transform group-hover:scale-105">
            <Gamepad2 className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Online<span className="text-cyan-500">GameNest</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block">
              Free Instant Browser Games
            </span>
          </div>
        </div>

        {/* Center Search Bar */}
        <div ref={searchContainerRef} className="flex-1 max-w-md relative hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search games, categories, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 rounded-xl py-2 pl-10 pr-10 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-scale-in">
              {suggestions.length > 0 ? (
                <div className="py-2">
                  <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Instant Matches
                  </div>
                  {suggestions.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => {
                        onNavigate(`game/${game.slug}`);
                        setIsSearchFocused(false);
                        setSearchQuery('');
                      }}
                      className="px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 cursor-pointer transition"
                    >
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        className="w-9 h-7 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {game.title}
                        </p>
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                          {game.category}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 mt-1"
                  >
                    View all results for &quot;{searchQuery}&quot;
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No games found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentRoute === 'home'
                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('all-games')}
            className={`px-3 py-1.5 rounded-lg transition ${
              currentRoute === 'all-games'
                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            All Games
          </button>
          <button
            onClick={() => onNavigate('categories')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              currentRoute === 'categories'
                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 font-bold'
                : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Categories
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Dark / Light Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold transition shadow-sm text-slate-700 dark:text-slate-200 cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Switch between dark and light theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-amber-300">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden sm:inline text-slate-700">Dark</span>
              </>
            )}
          </button>

          {/* Random Game Button */}
          <button
            onClick={handleRandomGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition shadow-sm"
            title="Play a random game"
          >
            <Dice5 className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span className="hidden sm:inline">Random</span>
          </button>

          {/* Favorites */}
          <button
            onClick={() => onNavigate('all-games?filter=favorites')}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition"
            title="Saved Favorite Games"
          >
            <Heart className="w-4 h-4" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Admin Portal Link */}
          <button
            onClick={() => onNavigate('admin')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition"
            title="Admin Portal"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Admin</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 lg:hidden border border-slate-800"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0a0d14] px-4 pt-3 pb-5 space-y-3 animate-fade-in">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder:text-slate-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => {
                onNavigate('home');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-left flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" /> Home
            </button>
            <button
              onClick={() => {
                onNavigate('all-games');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-left flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4 text-indigo-400" /> All Games
            </button>
            <button
              onClick={() => {
                onNavigate('categories');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-left flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-emerald-400" /> Categories
            </button>
            <button
              onClick={() => {
                onNavigate('all-games?sort=popular');
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-left flex items-center gap-2"
            >
              <Flame className="w-4 h-4 text-rose-500" /> Popular
            </button>
          </div>

          {/* Mobile Theme Switcher */}
          <div className="pt-2">
            <button
              onClick={toggleTheme}
              className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-left flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
                <span>Appearance: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
            <button
              onClick={() => {
                onNavigate('about');
                setIsMobileMenuOpen(false);
              }}
              className="hover:text-white"
            >
              About
            </button>
            <button
              onClick={() => {
                onNavigate('contact');
                setIsMobileMenuOpen(false);
              }}
              className="hover:text-white"
            >
              Contact
            </button>
            <button
              onClick={() => {
                onNavigate('privacy-policy');
                setIsMobileMenuOpen(false);
              }}
              className="hover:text-white"
            >
              Privacy
            </button>
            <button
              onClick={() => {
                onNavigate('terms-of-service');
                setIsMobileMenuOpen(false);
              }}
              className="hover:text-white"
            >
              Terms
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
