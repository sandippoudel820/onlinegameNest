import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Game } from './types/game';
import { INITIAL_GAMES } from './data/initialGames';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CookieBanner } from './components/common/CookieBanner';
import { SitemapModal } from './components/common/SitemapModal';
import { HomePage } from './pages/HomePage';
import { AllGamesPage } from './pages/AllGamesPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { GameDetailPage } from './pages/GameDetailPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { AdminPage } from './pages/AdminPage';
import { updatePageSeo } from './utils/seo';

function AppContent() {
  const { theme } = useTheme();
  // Games Catalog State
  const [games, setGames] = useState<Game[]>(() => {
    const saved = localStorage.getItem('gamenest_catalog_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge so initial games always receive fresh thumbnails, descriptions, and engines
          const customGames = parsed.filter(
            (p: Game) => !INITIAL_GAMES.some((ig) => ig.id === p.id)
          );
          return [...INITIAL_GAMES, ...customGames];
        }
      } catch {}
    }
    try {
      localStorage.removeItem('gamenest_catalog');
      localStorage.removeItem('gamenest_catalog_v2');
    } catch {}
    return INITIAL_GAMES;
  });

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('gamenest_favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Routing State
  const parseCurrentRoute = () => {
    // 1. Hash-based routing is priority (works consistently on GitHub Pages & custom domains)
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash) return hash;

    // 2. If pathname exists, strip leading slash
    const rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '');
    if (!rawPath) return 'home';

    // 3. Known routes in OnlineGameNest
    const knownPrefixes = [
      'home',
      'all-games',
      'categories',
      'game',
      'search',
      'about',
      'contact',
      'privacy-policy',
      'terms-of-service',
      'cookie-policy',
      'admin',
    ];

    // Check if rawPath directly matches or starts with a known route
    const firstSegment = rawPath.split('/')[0];
    if (knownPrefixes.includes(firstSegment)) {
      return rawPath;
    }

    // On GitHub Pages (e.g. username.github.io/repo-name/game/neon-snake),
    // the first segment is the repo-name. Check if any subsequent segment matches a known route.
    const segments = rawPath.split('/');
    const matchIndex = segments.findIndex((seg) => knownPrefixes.includes(seg));
    if (matchIndex !== -1) {
      return segments.slice(matchIndex).join('/');
    }

    // Default to home if route is repository root or unknown
    return 'home';
  };

  const [route, setRoute] = useState<string>(parseCurrentRoute);
  const [sitemapModalOpen, setSitemapModalOpen] = useState(false);

  // Sync route on popstate / hashchange
  useEffect(() => {
    const handleRouteSync = () => {
      setRoute(parseCurrentRoute());
    };
    window.addEventListener('hashchange', handleRouteSync);
    window.addEventListener('popstate', handleRouteSync);
    return () => {
      window.removeEventListener('hashchange', handleRouteSync);
      window.removeEventListener('popstate', handleRouteSync);
    };
  }, []);

  // Save games whenever catalog updates
  useEffect(() => {
    localStorage.setItem('gamenest_catalog_v3', JSON.stringify(games));
  }, [games]);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('gamenest_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const navigate = useCallback((targetRoute: string) => {
    window.location.hash = `#/${targetRoute}`;
    setRoute(targetRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Parse path & params
  const { page, param, searchParams } = useMemo(() => {
    const [pathPart, queryPart] = route.split('?');
    const segments = pathPart.split('/');
    const pageName = segments[0] || 'home';
    const subParam = segments[1] || '';

    const sp = new URLSearchParams(queryPart || '');
    return { page: pageName, param: subParam, searchParams: sp };
  }, [route]);

  // Update SEO dynamically whenever route or selected game changes
  useEffect(() => {
    if (page === 'game' && param) {
      const g = games.find((item) => item.slug === param || item.legacySlug === param || item.id === param);
      if (g) {
        updatePageSeo({
          title: `Play ${g.title} Free Online - OnlineGameNest`,
          description: g.description,
          game: g,
        });
        return;
      }
    }

    if (page === 'all-games') {
      updatePageSeo({
        title: 'All Free Browser Games - OnlineGameNest',
        description: 'Browse our complete catalog of instant HTML5 online browser games with zero downloads.',
      });
    } else if (page === 'categories') {
      updatePageSeo({
        title: 'Game Categories - Action, Puzzle, Arcade & More - OnlineGameNest',
        description: 'Explore over 15 exciting gaming genres including arcade classics, mind-bending puzzles, and multiplayer games.',
      });
    } else if (page === 'about') {
      updatePageSeo({
        title: 'About Us - OnlineGameNest Browser Portal',
        description: 'Learn about OnlineGameNest and our mission to provide lightning-fast, ad-supported free web games for all players.',
      });
    } else if (page === 'contact') {
      updatePageSeo({
        title: 'Contact & Submissions - OnlineGameNest',
        description: 'Get in touch with the OnlineGameNest team for game developer submissions, advertising inquiries, or bug reports.',
      });
    } else if (page === 'privacy-policy') {
      updatePageSeo({
        title: 'Privacy Policy - OnlineGameNest',
        description: 'Read the OnlineGameNest privacy policy, cookie disclosures, and data protection practices.',
      });
    } else if (page === 'terms-of-service') {
      updatePageSeo({
        title: 'Terms of Service - OnlineGameNest',
        description: 'OnlineGameNest terms of service, acceptable use policy, and intellectual property disclaimers.',
      });
    } else if (page === 'cookie-policy') {
      updatePageSeo({
        title: 'Cookie Policy & Preferences - OnlineGameNest',
        description: 'Understand how OnlineGameNest utilizes cookies for save games and banner advertisements.',
      });
    } else if (page === 'admin') {
      updatePageSeo({
        title: 'Admin Control Hub - OnlineGameNest',
        description: 'OnlineGameNest administration console for catalog management and analytics.',
      });
    } else {
      updatePageSeo({
        title: 'OnlineGameNest - Play Free Online Browser Games Instantly',
        description: 'Discover and play hundreds of free instant HTML5 browser games on OnlineGameNest with no downloads or installs. Action, puzzles, arcade, sports, and more.',
      });
    }
  }, [page, param, games]);

  // Actions
  const handlePlayIncrement = useCallback((gameId: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, plays: g.plays + 1 } : g))
    );
  }, []);

  const handleToggleFavorite = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const handleAddGame = (newGame: Game) => {
    setGames((prev) => [newGame, ...prev]);
  };

  const handleUpdateGame = (updated: Game) => {
    setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  const handleDeleteGame = (id: string) => {
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  const handleResetCatalog = () => {
    setGames(INITIAL_GAMES);
    localStorage.setItem('gamenest_catalog', JSON.stringify(INITIAL_GAMES));
  };

  const handleImportCatalog = (importedGames: Game[]) => {
    setGames(importedGames);
    localStorage.setItem('gamenest_catalog', JSON.stringify(importedGames));
  };

  // Render current page component
  const renderPage = () => {
    if (page === 'game') {
      const currentGame = games.find((g) => g.slug === param || g.legacySlug === param || g.id === param);
      if (currentGame) {
        return (
          <GameDetailPage
            game={currentGame}
            allGames={games}
            onSelectGame={(slug) => navigate(`game/${slug}`)}
            onNavigate={navigate}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onPlayIncrement={handlePlayIncrement}
          />
        );
      }
      // Game not found fallback
      return (
        <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Game Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            The game &quot;{param}&quot; might have been moved or updated.
          </p>
          <button
            onClick={() => navigate('all-games')}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition"
          >
            Explore All Games
          </button>
        </div>
      );
    }

    if (page === 'all-games') {
      return (
        <AllGamesPage
          games={games}
          onSelectGame={(slug) => navigate(`game/${slug}`)}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          initialCategory={searchParams.get('category')}
          initialFilter={searchParams.get('filter')}
          initialSort={searchParams.get('sort') || 'popular'}
        />
      );
    }

    if (page === 'categories') {
      return (
        <CategoriesPage
          games={games}
          onSelectCategory={(cat) => navigate(`all-games?category=${encodeURIComponent(cat)}`)}
          onSelectGame={(slug) => navigate(`game/${slug}`)}
        />
      );
    }

    if (page === 'search') {
      const q = searchParams.get('q') || '';
      return (
        <SearchResultsPage
          query={q}
          games={games}
          onSelectGame={(slug) => navigate(`game/${slug}`)}
          onNavigate={navigate}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />
      );
    }

    if (page === 'about') return <AboutPage onNavigate={navigate} />;
    if (page === 'contact') return <ContactPage />;
    if (page === 'privacy-policy') return <PrivacyPolicyPage />;
    if (page === 'terms-of-service') return <TermsOfServicePage />;
    if (page === 'cookie-policy') return <CookiePolicyPage />;

    if (page === 'admin') {
      return (
        <AdminPage
          games={games}
          onAddGame={handleAddGame}
          onUpdateGame={handleUpdateGame}
          onDeleteGame={handleDeleteGame}
          onResetCatalog={handleResetCatalog}
          onImportCatalog={handleImportCatalog}
        />
      );
    }

    // Default Home Page
    return (
      <HomePage
        games={games}
        onSelectGame={(slug) => navigate(`game/${slug}`)}
        onNavigate={navigate}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-slate-50 text-slate-900 selection:bg-cyan-500 selection:text-white'
          : 'bg-[#0b0e14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950'
      }`}
    >
      {/* Top Header Navigation */}
      <Header
        currentRoute={page}
        onNavigate={navigate}
        games={games}
        favoritesCount={favorites.length}
      />

      {/* Main Page Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigate} onOpenSitemap={() => setSitemapModalOpen(true)} />

      {/* Interactive Cookie Consent Banner */}
      <CookieBanner onNavigate={navigate} />

      {/* SEO Sitemap & Robots.txt Generator Modal */}
      <SitemapModal
        isOpen={sitemapModalOpen}
        onClose={() => setSitemapModalOpen(false)}
        games={games}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
