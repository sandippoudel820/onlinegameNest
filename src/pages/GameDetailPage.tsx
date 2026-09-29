import React, { useState } from 'react';
import { Game } from '../types/game';
import { GamePlayer } from '../components/games/GamePlayer';
import { GameCard } from '../components/games/GameCard';
import { AdSlot } from '../components/ads/AdSlot';
import {
  Star,
  Eye,
  Heart,
  Calendar,
  User,
  Tag,
  ChevronRight,
  Flame,
  MessageSquare,
  Send,
  Sparkles,
  Smartphone,
  Laptop,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  game: Game;
  allGames: Game[];
  onSelectGame: (slug: string) => void;
  onNavigate: (route: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onPlayIncrement: (id: string) => void;
}

interface Comment {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

export const GameDetailPage: React.FC<Props> = ({
  game,
  allGames,
  onSelectGame,
  onNavigate,
  favorites,
  onToggleFavorite,
  onPlayIncrement,
}) => {
  const isFavorited = favorites.includes(game.id);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      name: 'PixelRider99',
      rating: 5,
      text: 'Super smooth controls and crisp neon graphics! Ran immediately on my Chromebook without stuttering.',
      date: '2 hours ago',
    },
    {
      id: 'c2',
      name: 'SynthWaveHero',
      rating: 5,
      text: 'The audio effects are so nostalgic. Highly recommend challenging your friends for the top score!',
      date: 'Yesterday',
    },
  ]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Related games from same category or shared tags
  const relatedGames = allGames
    .filter((g) => g.id !== game.id && (g.category === game.category || g.tags.some((t) => game.tags.includes(t))))
    .slice(0, 6);

  const handleRating = (score: number) => {
    setUserRating(score);
    // Persist or update rating in context/localStorage
    const key = `gamenest_rating_${game.id}`;
    localStorage.setItem(key, score.toString());
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newC: Comment = {
      id: Date.now().toString(),
      name: newCommentName.trim() || 'Anonymous Gamer',
      rating: userRating || 5,
      text: newCommentText.trim(),
      date: 'Just now',
    };

    setComments([newC, ...comments]);
    setNewCommentText('');
    setNewCommentName('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumbs for SEO & UX */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <button onClick={() => onNavigate('home')} className="hover:text-cyan-400">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <button onClick={() => onNavigate('categories')} className="hover:text-cyan-400">
          Categories
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <button
          onClick={() => onNavigate(`all-games?category=${encodeURIComponent(game.category)}`)}
          className="hover:text-cyan-400"
        >
          {game.category}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-200 font-semibold truncate max-w-[200px]">
          {game.title}
        </span>
      </nav>

      {/* Top Banner Advertisement (Desktop 728x90) */}
      <div className="w-full flex justify-center">
        <AdSlot slotType="leaderboard" title="Top Game Header Ad" />
      </div>

      {/* Mobile Top Ad (Visible on mobile/tablet screens only) */}
      <div className="md:hidden w-full flex justify-center">
        <AdSlot slotType="mobile-banner" title="Mobile Top Banner" />
      </div>

      {/* Main Game Arena Layout */}
      {/* Requirement: Desktop layout: LEFT AD | GAME | RIGHT AD */}
      {/* On smaller screens, automatically rearrange layout so advertisements appear above/below rather than squeezing the game */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 xl:gap-6">
        {/* LEFT AD (Desktop skyscraper 160x600 / 240x600) */}
        <aside className="hidden lg:flex flex-col shrink-0 sticky top-20">
          <AdSlot slotType="skyscraper" title="Left Skyscraper Ad" />
        </aside>

        {/* CENTER: THE GAME PLAYER CONTAINER (MAIN FOCUS) */}
        <main className="flex-1 w-full max-w-4xl min-w-0">
          <GamePlayer game={game} onPlayIncrement={onPlayIncrement} />
        </main>

        {/* RIGHT AD (Desktop skyscraper 160x600 / 240x600) */}
        <aside className="hidden lg:flex flex-col shrink-0 sticky top-20">
          <AdSlot slotType="skyscraper" title="Right Skyscraper Ad" />
        </aside>
      </div>

      {/* Mobile Bottom Banner Ad */}
      <div className="md:hidden w-full flex justify-center py-2">
        <AdSlot slotType="medium-rectangle" title="Mobile Game Footer Ad" />
      </div>

      {/* Game Details Bar: Title, Category, Rating, Plays, Favorite */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {game.category}
              </span>
              {game.isPopular && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3" /> Popular
                </span>
              )}
              {game.isNew && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  New Release
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{game.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" /> {game.developer}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> {game.releaseDate}
              </span>
              <span className="flex items-center gap-1 font-mono text-cyan-400">
                <Eye className="w-3.5 h-3.5" /> {(game.plays / 1000).toFixed(1)}k Plays
              </span>
            </div>
          </div>

          {/* Action & Rating buttons */}
          <div className="flex items-center gap-3">
            {/* Favorite button */}
            <button
              onClick={(e) => onToggleFavorite(game.id, e)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition ${
                isFavorited
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? 'Saved to Favorites' : 'Add to Favorites'}
            </button>

            {/* Interactive 5-Star Rating Widget */}
            <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-1.5">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = hoverRating ? hoverRating >= star : (userRating || Math.round(game.rating)) >= star;
                  return (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => handleRating(star)}
                      className="p-0.5 transition transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          filled ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold font-mono text-amber-400 ml-1">
                {game.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Description & Controls Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              About {game.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {game.description}
            </p>

            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Tags & Keywords
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {game.tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onNavigate(`search?q=${encodeURIComponent(tag)}`)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-slate-400 hover:text-cyan-400 border border-slate-800 transition"
                  >
                    <Tag className="w-3 h-3 text-cyan-500/70" /> {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> How To Play & Controls
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {game.instructions}
            </p>

            {/* Structured Keys breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {Object.entries(game.controls).map(([key, action]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-semibold shadow-sm">
                    {key}
                  </span>
                  <span className="text-slate-400">{action}</span>
                </div>
              ))}
            </div>

            {/* Cross-Platform Device Support Badge */}
            <div className="pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Supported Platforms
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-emerald-400">
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Android & iOS</p>
                    <p className="text-[10px] text-slate-400">Touch & Swipes</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-cyan-400">
                  <Laptop className="w-3.5 h-3.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Mac & Windows</p>
                    <p className="text-[10px] text-slate-400">Keyboard & Mouse</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400/90">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Instant Play — No installs or downloads needed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Leaderboard Advertisement */}
      <div className="w-full flex justify-center py-2">
        <AdSlot slotType="billboard" title="Below Game Wide Banner" />
      </div>

      {/* Related & Recommended Games */}
      {relatedGames.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-white">
              Related Games You May Like
            </h2>
            <button
              onClick={() => onNavigate(`all-games?category=${encodeURIComponent(game.category)}`)}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              More in {game.category} &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {relatedGames.map((rg) => (
              <GameCard
                key={rg.id}
                game={rg}
                onSelectGame={onSelectGame}
                isFavorited={favorites.includes(rg.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

      {/* Community Comments & Reviews */}
      <section className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 space-y-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Player Reviews ({comments.length})</h2>
        </div>

        {/* Add comment form */}
        <form onSubmit={handleAddComment} className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your gamer tag (optional)"
              value={newCommentName}
              onChange={(e) => setNewCommentName(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Your Rating:</span>
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    onClick={() => handleRating(s)}
                    className={`w-4 h-4 cursor-pointer ${
                      (userRating || 5) >= s ? 'fill-current' : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <textarea
            placeholder="Share your high score, tips, or feedback on this game..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            rows={2}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition"
            >
              <Send className="w-3.5 h-3.5" /> Post Review
            </button>
          </div>
        </form>

        {/* Comments list */}
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{c.name}</span>
                <span className="text-[11px] text-slate-500">{c.date}</span>
              </div>
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < c.rating ? 'fill-current' : 'text-slate-700'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">{c.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
