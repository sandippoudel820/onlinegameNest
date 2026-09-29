import React, { useState, useEffect } from 'react';
import { CookiePreferences } from '../../types/game';
import { Shield, Cookie, Check } from 'lucide-react';

interface Props {
  onNavigate: (route: string) => void;
}

export const CookieBanner: React.FC<Props> = ({ onNavigate }) => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    advertising: true,
    saved: false,
  });

  useEffect(() => {
    const savedPrefs = localStorage.getItem('gamenest_cookies');
    if (!savedPrefs) {
      // Show banner after brief delay
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: true,
      advertising: true,
      saved: true,
    };
    localStorage.setItem('gamenest_cookies', JSON.stringify(prefs));
    setVisible(false);
  };

  const handleSaveCustom = () => {
    const prefs: CookiePreferences = {
      ...preferences,
      essential: true,
      saved: true,
    };
    localStorage.setItem('gamenest_cookies', JSON.stringify(prefs));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 shadow-2xl animate-fade-in text-xs text-slate-300">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
          <Cookie className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            We value your privacy & fair play
          </h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            OnlineGameNest uses cookies to keep games free, remember your high scores, and serve relevant, non-intrusive advertisements.
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="my-3 p-3 bg-slate-950 rounded-xl space-y-2 border border-slate-800">
          <label className="flex items-center justify-between text-[11px]">
            <div>
              <span className="font-semibold text-white">Essential Cookies</span>
              <p className="text-[10px] text-slate-500">Needed for high score saves & navigation</p>
            </div>
            <input type="checkbox" checked disabled className="accent-cyan-500 rounded" />
          </label>
          <label className="flex items-center justify-between text-[11px] cursor-pointer">
            <div>
              <span className="font-semibold text-white">Analytics Cookies</span>
              <p className="text-[10px] text-slate-500">Anonymous popularity & play count tracking</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
              className="accent-cyan-500 rounded"
            />
          </label>
          <label className="flex items-center justify-between text-[11px] cursor-pointer">
            <div>
              <span className="font-semibold text-white">Advertising Cookies</span>
              <p className="text-[10px] text-slate-500">Personalized ad slots & partner networks</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.advertising}
              onChange={(e) => setPreferences({ ...preferences, advertising: e.target.checked })}
              className="accent-cyan-500 rounded"
            />
          </label>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800">
        <button
          onClick={() => onNavigate('cookie-policy')}
          className="text-[11px] text-slate-400 hover:text-cyan-400 underline underline-offset-2"
        >
          Read Cookie Policy
        </button>

        <div className="flex items-center gap-2">
          {showDetails ? (
            <button
              onClick={handleSaveCustom}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
            >
              Save Preferences
            </button>
          ) : (
            <button
              onClick={() => setShowDetails(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Customize
            </button>
          )}

          <button
            onClick={handleAcceptAll}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-md shadow-cyan-500/20"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};
