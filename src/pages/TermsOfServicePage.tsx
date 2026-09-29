import React from 'react';
import { FileText, ShieldAlert, Award } from 'lucide-react';
import { AdSlot } from '../components/ads/AdSlot';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-300">
      <div className="w-full flex justify-center">
        <AdSlot slotType="leaderboard" title="Terms of Service Header Ad" />
      </div>

      <div className="pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
          <FileText className="w-3.5 h-3.5" /> Legal Agreement
        </div>
        <h1 className="text-3xl font-black text-white">Terms of Service</h1>
        <p className="text-xs text-slate-400 mt-1">
          Effective Date: January 1, 2025 &bull; Please read carefully
        </p>
      </div>

      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or playing games on <strong>OnlineGameNest</strong> (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must refrain from using the portal.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Acceptable Use</h2>
          <p>
            You agree to use OnlineGameNest solely for lawful personal entertainment. You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Attempt to reverse-engineer, decompile, or exploit our web infrastructure or game engines.</li>
            <li>Use automated bots, scrapers, or click-fraud tools against our games or advertising partners.</li>
            <li>Bypass or attempt to bypass any security, rate-limiting, or content protection mechanisms.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Intellectual Property & DMCA Policy</h2>
          <p>
            OnlineGameNest respects intellectual property rights. All original code, branding, and proprietary games on OnlineGameNest are owned by OnlineGameNest Studios or our verified licensed partners.
          </p>
          <p className="text-slate-400">
            If you are a copyright owner or an authorized agent and believe that content hosted on OnlineGameNest infringes your intellectual property, please submit a formal DMCA takedown notice via our Contact Form with proof of ownership, and our compliance officer will remove the content promptly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Disclaimer of Warranties</h2>
          <p>
            The services, games, and website features are provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, whether express or implied. OnlineGameNest does not warrant that game play will be uninterrupted, error-free, or compatible with obsolete browser software.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">5. Governing Law</h2>
          <p>
            These terms shall be governed and construed in accordance with standard international internet commerce statutes.
          </p>
        </section>
      </div>
    </div>
  );
};
