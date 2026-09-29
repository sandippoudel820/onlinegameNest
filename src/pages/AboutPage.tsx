import React from 'react';
import { Gamepad2, Zap, Shield, Sparkles, Users, Award } from 'lucide-react';
import { AdSlot } from '../components/ads/AdSlot';

interface Props {
  onNavigate: (route: string) => void;
}

export const AboutPage: React.FC<Props> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-300">
      <div className="w-full flex justify-center">
        <AdSlot slotType="leaderboard" title="About Page Header Ad" />
      </div>

      <div className="pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
          <Gamepad2 className="w-3.5 h-3.5" /> Our Mission
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">About OnlineGameNest</h1>
        <p className="text-sm text-slate-400 mt-2">
          The next-generation browser gaming sanctuary built for instant, friction-free web entertainment.
        </p>
      </div>

      <section className="space-y-4 text-xs sm:text-sm leading-relaxed">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Who We Are
        </h2>
        <p>
          Founded in 2025, <strong>OnlineGameNest</strong> is dedicated to delivering the absolute finest browser gaming experience on the open web. We believe that playing games should be immediate, completely free, and devoid of burdensome installers, paywalls, or privacy-invasive tracking.
        </p>
        <p>
          Every game in our curated catalog runs straight in modern browsers via cutting-edge HTML5 Canvas, WebGL, and Web Audio APIs. Whether you are on a Chromebook at school, an office desktop during lunch, a tablet on the sofa, or a smartphone on transit, OnlineGameNest gives you instant access to entertainment with zero waiting.
        </p>
      </section>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Instant Play</h3>
          <p className="text-xs text-slate-400">
            Click and play immediately. No gigabyte downloads, launcher clients, or mandatory account creation.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Clean Monetization</h3>
          <p className="text-xs text-slate-400">
            Transparent, non-deceptive banner ads that never obstruct controls or disrupt gameplay flow.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-base">Indie Developer Hub</h3>
          <p className="text-xs text-slate-400">
            We partner with independent game designers and studios worldwide to showcase creative HTML5 experiences.
          </p>
        </div>
      </div>

      <section className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-3">
        <h2 className="text-lg font-bold text-white">Developer Submissions</h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Are you an indie game developer or studio creating lightweight, fun HTML5 games? We would love to feature your game on OnlineGameNest! We offer revenue share options and prominent homepage placement.
        </p>
        <button
          onClick={() => onNavigate('contact')}
          className="mt-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs transition"
        >
          Submit Your Game
        </button>
      </section>
    </div>
  );
};
