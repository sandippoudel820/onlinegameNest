import React, { useState } from 'react';
import { Game, GameCategory, GAME_CATEGORIES, PlayRecord } from '../types/game';
import {
  Shield,
  Lock,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Flame,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  LogOut,
  Settings,
  Layers,
  Smartphone,
  Laptop,
  Tablet,
  RotateCcw,
  Globe,
} from 'lucide-react';

interface Props {
  games: Game[];
  onAddGame: (game: Game) => void;
  onUpdateGame: (game: Game) => void;
  onDeleteGame: (id: string) => void;
  onResetCatalog: () => void;
  onImportCatalog: (games: Game[]) => void;
}

export const AdminPage: React.FC<Props> = ({
  games,
  onAddGame,
  onUpdateGame,
  onDeleteGame,
  onResetCatalog,
  onImportCatalog,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('gamenest_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  // Admin tabs: 'games' | 'analytics' | 'settings'
  const [activeTab, setActiveTab] = useState<'games' | 'analytics' | 'settings'>('games');

  // Modal states
  const [isEditing, setIsEditing] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Game>>({
    title: '',
    slug: '',
    description: '',
    instructions: '',
    thumbnail: '',
    category: 'Arcade',
    tags: ['Retro', 'Arcade'],
    engineType: 'builtin',
    builtinId: 'cyber-snake',
    gameUrl: '',
    controls: { 'Arrow Keys': 'Move', Space: 'Action' },
    isFeatured: false,
    isPopular: false,
    isNew: true,
    developer: 'Independent Developer',
  });
  const [tagsInput, setTagsInput] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default pass is "admin123" or "gamenest"
    if (passcode.toLowerCase() === 'admin123' || passcode.toLowerCase() === 'gamenest') {
      setIsAuthenticated(true);
      sessionStorage.setItem('gamenest_admin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('gamenest_admin_auth');
  };

  const openAddModal = () => {
    setEditingGame(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      instructions: 'Use Arrow Keys to play.',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
      category: 'Arcade',
      tags: ['Action', 'Casual'],
      engineType: 'builtin',
      builtinId: 'cyber-snake',
      gameUrl: '',
      controls: { 'Arrow Keys': 'Move', Space: 'Fire' },
      isFeatured: false,
      isPopular: false,
      isNew: true,
      developer: 'OnlineGameNest Developer',
    });
    setTagsInput('Action, Casual');
    setIsEditing(true);
  };

  const openEditModal = (game: Game) => {
    setEditingGame(game);
    setFormData({ ...game });
    setTagsInput(game.tags.join(', '));
    setIsEditing(true);
  };

  const handleSaveGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const slug =
      formData.slug?.trim() ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingGame) {
      // Update
      const updated: Game = {
        ...editingGame,
        ...(formData as Game),
        slug,
        tags,
      };
      onUpdateGame(updated);
      showToast(`Updated "${updated.title}" successfully.`);
    } else {
      // Add
      const newGame: Game = {
        id: `game-${Date.now()}`,
        title: formData.title || 'Untitled Game',
        slug,
        description: formData.description || 'Enjoy this exciting web game!',
        instructions: formData.instructions || 'Follow on-screen instructions.',
        thumbnail:
          formData.thumbnail ||
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
        category: (formData.category as GameCategory) || 'Arcade',
        tags: tags.length ? tags : ['Web', 'Game'],
        engineType: formData.engineType || 'builtin',
        builtinId: formData.builtinId || 'cyber-snake',
        gameUrl: formData.gameUrl || '',
        controls: formData.controls || { 'Arrow Keys': 'Move' },
        releaseDate: new Date().toISOString().split('T')[0],
        plays: 0,
        rating: 5.0,
        ratingCount: 1,
        isFeatured: !!formData.isFeatured,
        isPopular: !!formData.isPopular,
        isNew: !!formData.isNew,
        developer: formData.developer || 'Independent Creator',
      };
      onAddGame(newGame);
      showToast(`Created "${newGame.title}" successfully.`);
    }

    setIsEditing(false);
  };

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(games, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gamenest-catalog-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Game catalog JSON exported.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportCatalog(parsed);
          showToast(`Successfully imported ${parsed.length} games!`);
        } else {
          alert('Invalid JSON file format. Must be an array of Game objects.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Analytics calculations
  const totalPlays = games.reduce((acc, g) => acc + g.plays, 0);
  const avgRating = (
    games.reduce((acc, g) => acc + g.rating, 0) / (games.length || 1)
  ).toFixed(2);
  const featuredCount = games.filter((g) => g.isFeatured).length;
  const popularCount = games.filter((g) => g.isPopular).length;

  // Filtered games in admin table
  const filteredTableGames = games.filter(
    (g) =>
      g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If not logged in, show Password Form
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl animate-fade-in text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">OnlineGameNest Admin Portal</h1>
        <p className="text-xs text-slate-400 mb-6">
          Restricted management console. Enter the administrative passcode to manage games and monetization.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Passcode</label>
            <input
              type="password"
              required
              autoFocus
              placeholder="Enter passcode (e.g. admin123)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none"
            />
            {authError && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Incorrect passcode. Hint: Use <strong>admin123</strong>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition transform active:scale-95"
          >
            Authenticate & Enter
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          Demo Passcode: <span className="font-mono text-cyan-400 font-bold">admin123</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-slate-300">
      {/* Toast Notice */}
      {statusMessage && (
        <div className="fixed top-20 right-6 z-50 bg-cyan-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-scale-in">
          <CheckCircle2 className="w-4 h-4" /> {statusMessage}
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" /> Administrative Management Suite
          </div>
          <h1 className="text-3xl font-black text-white">OnlineGameNest Control Hub</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your HTML5 catalog, configure monetization, and review play statistics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition"
          >
            <Plus className="w-4 h-4" /> Add New Game
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Games</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{games.length}</span>
          <span className="block text-[10px] text-slate-500 mt-1">Ready for instant play</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Plays</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">
            {(totalPlays / 1000).toFixed(1)}k
          </span>
          <span className="block text-[10px] text-emerald-400/80 mt-1">+14.2% this week</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Featured Spotlight</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{featuredCount}</span>
          <span className="block text-[10px] text-slate-500 mt-1">Homepage featured</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Average Rating</span>
            <BarChart3 className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{avgRating} / 5</span>
          <span className="block text-[10px] text-slate-500 mt-1">From player reviews</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('games')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${
            activeTab === 'games'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Game Catalog ({games.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${
            activeTab === 'analytics'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Traffic & Analytics
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${
            activeTab === 'settings'
              ? 'text-cyan-400 border-cyan-400'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Catalog Backup & Ad Settings
        </button>
      </div>

      {/* TAB 1: GAMES MANAGEMENT TABLE */}
      {activeTab === 'games' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Filter games by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleExportJson}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 font-semibold"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" /> Export JSON
              </button>
              <label className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 font-semibold cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-400" /> Import JSON
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Game</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Engine</th>
                    <th className="py-3 px-4">Plays</th>
                    <th className="py-3 px-4">Flags</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTableGames.map((game) => (
                    <tr key={game.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={game.thumbnail}
                            alt={game.title}
                            className="w-10 h-8 rounded-lg object-cover bg-slate-950"
                          />
                          <div>
                            <span className="font-bold text-white block">{game.title}</span>
                            <span className="font-mono text-[10px] text-slate-500">
                              /game/{game.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-[11px]">
                          {game.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {game.engineType === 'builtin'
                            ? `Built-in (${game.builtinId})`
                            : 'External Iframe'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-cyan-400 font-semibold">
                        {(game.plays / 1000).toFixed(1)}k
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {/* Toggle Featured */}
                          <button
                            onClick={() => {
                              onUpdateGame({ ...game, isFeatured: !game.isFeatured });
                              showToast(`Toggled Featured for "${game.title}"`);
                            }}
                            className={`p-1 rounded-md text-[10px] font-bold ${
                              game.isFeatured
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-950 text-slate-500 hover:text-white'
                            }`}
                            title="Toggle Featured"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Popular */}
                          <button
                            onClick={() => {
                              onUpdateGame({ ...game, isPopular: !game.isPopular });
                              showToast(`Toggled Popular for "${game.title}"`);
                            }}
                            className={`p-1 rounded-md text-[10px] font-bold ${
                              game.isPopular
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-950 text-slate-500 hover:text-white'
                            }`}
                            title="Toggle Popular"
                          >
                            <Flame className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(game)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 transition"
                            title="Edit Game"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${game.title}"?`)) {
                                onDeleteGame(game.id);
                                showToast(`Deleted "${game.title}".`);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-300 transition"
                            title="Delete Game"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS & POPULARITY */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top 5 Most Played Games */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                Top 5 Most Played Games
              </h3>
              <div className="space-y-3">
                {[...games]
                  .sort((a, b) => b.plays - a.plays)
                  .slice(0, 5)
                  .map((g, idx) => (
                    <div key={g.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-200">
                          {idx + 1}. {g.title}
                        </span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {(g.plays / 1000).toFixed(1)}k plays
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, (g.plays / 350000) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Device breakdown & Traffic */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Laptop className="w-4 h-4 text-cyan-400" />
                Player Device Breakdown
              </h3>
              <div className="grid grid-cols-3 gap-3 text-center pt-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <Laptop className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-white block">Desktop</span>
                  <span className="text-lg font-black text-cyan-400 font-mono">58%</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <Smartphone className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-white block">Mobile</span>
                  <span className="text-lg font-black text-purple-400 font-mono">34%</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <Tablet className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-white block">Tablet</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">8%</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Top Referral: Organic Search (SEO)</span>
                  <span className="font-mono text-slate-200">62%</span>
                </div>
                <div className="flex justify-between">
                  <span>Direct Bookmarks</span>
                  <span className="font-mono text-slate-200">24%</span>
                </div>
                <div className="flex justify-between">
                  <span>Social & Discord Shares</span>
                  <span className="font-mono text-slate-200">14%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS & BACKUP */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              Ad Monetization Setup
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Configure your advertising publisher credentials. When live, our clean ad slots will display your real Google AdSense or ad exchange creatives.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Google AdSense Publisher ID
                </label>
                <input
                  type="text"
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  defaultValue="ca-pub-DEMO987654321"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ad Mode
                </label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white">
                  <option value="demo">Demo Mock Ads (Clean placeholders)</option>
                  <option value="live">Production Script Ingestion</option>
                </select>
              </div>
            </div>
          </div>

          {/* Domain & Hosting Configuration */}
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Custom Domain &amp; Hosting
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Target public domains configured for OnlineGameNest.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-300 block">Primary Web App URL</span>
                <a
                  href="https://onlinegamenest.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-cyan-400 hover:underline block truncate"
                >
                  https://onlinegamenest.com
                </a>
                <span className="text-[11px] text-slate-500">Custom apex &amp; www domain</span>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-300 block">Firebase Hosting Site</span>
                <a
                  href="https://onlinegamenest.web.app"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-indigo-400 hover:underline block truncate"
                >
                  https://onlinegamenest.web.app
                </a>
                <span className="text-[11px] text-slate-500">Firebase web.app alias</span>
              </div>
            </div>
          </div>

          {/* Reset Catalog */}
          <div className="bg-rose-950/20 p-6 rounded-2xl border border-rose-900/40 space-y-3">
            <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset Default Catalog
            </h3>
            <p className="text-xs text-slate-400">
              Restore the built-in catalog of demo games. Useful if you tested edits and want to start clean.
            </p>
            <button
              onClick={() => {
                if (confirm('Reset catalog to factory demo games? All custom added games will be replaced.')) {
                  onResetCatalog();
                  showToast('Catalog restored to default demo state.');
                }
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition"
            >
              Reset to Factory Seed
            </button>
          </div>
        </div>
      )}

      {/* ADD / EDIT GAME MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingGame ? `Edit Game: ${editingGame.title}` : 'Add New HTML5 Game'}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGame} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Game Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Galaxy Blaster 3D"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="galaxy-blaster-3d"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category || 'Arcade'}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as GameCategory })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {GAME_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Developer Name</label>
                  <input
                    type="text"
                    value={formData.developer || ''}
                    onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                    placeholder="Game Studio Name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Thumbnail Image URL</label>
                <input
                  type="url"
                  value={formData.thumbnail || ''}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Game Engine Type</label>
                  <select
                    value={formData.engineType || 'builtin'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        engineType: e.target.value as 'builtin' | 'iframe',
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="builtin">Built-in Interactive HTML5 Game</option>
                    <option value="iframe">External Iframe / Embed URL</option>
                  </select>
                </div>

                {formData.engineType === 'builtin' ? (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Built-in Engine</label>
                    <select
                      value={formData.builtinId || 'cyber-snake'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          builtinId: e.target.value as any,
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="cyber-snake">Cyber Snake Neon (Arcade)</option>
                      <option value="space-blaster">Space Blaster 2088 (Shooter)</option>
                      <option value="2048-pulse">2048 Neon Pulse (Puzzle)</option>
                      <option value="brick-breaker">Brick Breaker Extreme (Action)</option>
                      <option value="tower-stack">Tower Stack Master (Casual)</option>
                      <option value="memory-matrix">Memory Matrix Cyber (Educational)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Game Embed URL</label>
                    <input
                      type="url"
                      value={formData.gameUrl || ''}
                      onChange={(e) => setFormData({ ...formData, gameUrl: e.target.value })}
                      placeholder="https://example.com/game/index.html"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe gameplay, features, and lore..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Instructions & Controls</label>
                <textarea
                  rows={2}
                  value={formData.instructions || ''}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Use Arrow keys to move, Space to jump..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Retro, Neon, Arcade, Speed"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="accent-cyan-500 rounded"
                  />
                  <span className="font-semibold text-white">Featured Game</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="accent-rose-500 rounded"
                  />
                  <span className="font-semibold text-white">Popular Game</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="accent-emerald-500 rounded"
                  />
                  <span className="font-semibold text-white">New Release</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  Save Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
