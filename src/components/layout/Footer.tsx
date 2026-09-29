import React from 'react';
import { Gamepad2, Shield, Heart, FileCode, CheckCircle2 } from 'lucide-react';
import { GAME_CATEGORIES } from '../../types/game';

interface Props {
  onNavigate: (route: string) => void;
  onOpenSitemap?: () => void;
}

export const Footer: React.FC<Props> = ({ onNavigate, onOpenSitemap }) => {
  return (
    <footer className="w-full bg-[#07090e] border-t border-slate-800/80 text-slate-400 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Online<span className="text-cyan-400">GameNest</span>
              </span>
            </div>
            <p className="text-sm text-slate-300 font-medium">
              &quot;Play free browser games instantly.&quot;
            </p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              OnlineGameNest is your ultimate portal for instant, free HTML5 web games. Zero downloads, zero installations, and zero friction. Enjoy high-speed action, mind-bending puzzles, and multiplayer fun anywhere.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free Forever
              </span>
              <span>&bull;</span>
              <span>Mobile & Desktop Ready</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Explore Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-cyan-400 transition"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('all-games')}
                  className="hover:text-cyan-400 transition"
                >
                  All Games
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('categories')}
                  className="hover:text-cyan-400 transition"
                >
                  Categories Hub
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('all-games?filter=popular')}
                  className="hover:text-cyan-400 transition"
                >
                  Popular Games
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('all-games?filter=new')}
                  className="hover:text-cyan-400 transition"
                >
                  New Releases
                </button>
              </li>
            </ul>
          </div>

          {/* Categories Quick List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Top Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {GAME_CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onNavigate(`all-games?category=${encodeURIComponent(cat)}`)}
                    className="hover:text-cyan-400 transition"
                  >
                    {cat} Games
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Company Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Company & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-cyan-400 transition"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-cyan-400 transition"
                >
                  Contact & Submissions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy-policy')}
                  className="hover:text-cyan-400 transition"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms-of-service')}
                  className="hover:text-cyan-400 transition"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('cookie-policy')}
                  className="hover:text-cyan-400 transition"
                >
                  Cookie Policy
                </button>
              </li>
              {onOpenSitemap && (
                <li>
                  <button
                    onClick={onOpenSitemap}
                    className="hover:text-cyan-400 transition flex items-center gap-1 text-slate-500"
                  >
                    <FileCode className="w-3 h-3" /> Sitemap & Robots.txt
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} OnlineGameNest. All rights reserved. Games belong to their respective creators.
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for web gamers
            </span>
            <button
              onClick={() => onNavigate('admin')}
              className="text-slate-600 hover:text-slate-400 flex items-center gap-1"
            >
              <Shield className="w-3 h-3" /> Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
