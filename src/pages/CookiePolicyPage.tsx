import React, { useState, useEffect } from 'react';
import { Cookie, Shield, CheckCircle2, RotateCcw } from 'lucide-react';
import { CookiePreferences } from '../types/game';
import { AdSlot } from '../components/ads/AdSlot';

export const CookiePolicyPage: React.FC = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    advertising: true,
    saved: false,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('gamenest_cookies');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleSave = () => {
    const updated = { ...preferences, essential: true, saved: true };
    localStorage.setItem('gamenest_cookies', JSON.stringify(updated));
    setPreferences(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    const def = { essential: true, analytics: true, advertising: true, saved: true };
    localStorage.setItem('gamenest_cookies', JSON.stringify(def));
    setPreferences(def);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-300">
      <div className="w-full flex justify-center">
        <AdSlot slotType="leaderboard" title="Cookie Policy Header Ad" />
      </div>

      <div className="pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
          <Cookie className="w-3.5 h-3.5" /> Cookie Controls & Disclosure
        </div>
        <h1 className="text-3xl font-black text-white">Cookie Policy</h1>
        <p className="text-xs text-slate-400 mt-1">
          Learn how OnlineGameNest uses cookies and local storage to power high scores and keep games free.
        </p>
      </div>

      {/* Interactive Cookie Preference Manager Box */}
      <div className="bg-slate-900/90 rounded-2xl p-6 border border-cyan-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Your Cookie Preferences
          </h2>
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Preferences Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Essential */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Strictly Essential</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                Required
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Maintains game state, local high scores, mute toggles, and security protections.
            </p>
            <input type="checkbox" checked disabled className="accent-cyan-500 rounded" />
          </div>

          {/* Analytics */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Analytics Cookies</span>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Aggregated, anonymous play counts and popularity indicators to identify top games.
            </p>
          </div>

          {/* Advertising */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Advertising Cookies</span>
              <input
                type="checkbox"
                checked={preferences.advertising}
                onChange={(e) => setPreferences({ ...preferences, advertising: e.target.checked })}
                className="accent-cyan-500 w-4 h-4 rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Powers our legitimate banner slots and prevents redundant repetitive ads.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Accept All
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition"
          >
            Save My Preferences
          </button>
        </div>
      </div>

      {/* Explanatory text */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs sm:text-sm leading-relaxed">
        <h3 className="text-base font-bold text-white">What are cookies?</h3>
        <p>
          Cookies are small text fragments stored by your web browser when visiting websites. OnlineGameNest also leverages HTML5 Web Storage (LocalStorage) to deliver zero-latency saves for arcade scores, sound volume, and favorite bookmarks without requiring server-side logins.
        </p>
        <p className="text-slate-400">
          You can modify or disable cookies in your browser settings at any time; however, disabling all storage may cause game high scores to reset when reloading the browser tab.
        </p>
      </div>
    </div>
  );
};
