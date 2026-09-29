import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { AdSlot } from '../components/ads/AdSlot';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-slate-300">
      <div className="w-full flex justify-center">
        <AdSlot slotType="leaderboard" title="Privacy Policy Header Ad" />
      </div>

      <div className="pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Compliance & Transparency
        </div>
        <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400 mt-1">
          Last updated: January 2025 &bull; Effective globally
        </p>
      </div>

      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-6 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            1. Overview & Commitment
          </h2>
          <p>
            At <strong>OnlineGameNest</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), protecting your privacy is central to our values. This Privacy Policy describes how we collect, use, and disclose information when you visit and play games on our website.
          </p>
          <p>
            You can enjoy all games on OnlineGameNest without creating an account or supplying your legal name, physical address, or phone number.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400">
            <li>
              <strong className="text-slate-200">Device & Usage Data:</strong> Browser type, operating system, device screen resolution, referring URLs, and approximate geographical region (country/city level).
            </li>
            <li>
              <strong className="text-slate-200">Local Browser Storage:</strong> We use HTML5 LocalStorage to remember your game high scores, saved favorites, mute preferences, and cookie selections. This data remains on your device.
            </li>
            <li>
              <strong className="text-slate-200">Voluntary Inquiries:</strong> Name and email address when you voluntarily submit our contact or game submission form.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Third-Party Advertising & Cookies</h2>
          <p>
            To keep all games free for every player, we partner with legitimate third-party advertising networks (such as Google AdSense and programmatic ad exchanges).
          </p>
          <p className="text-slate-400">
            Third-party vendors use cookies to serve ads based on prior visits to our website or other websites on the internet. You may opt out of personalized advertising by visiting your browser cookie settings or the Network Advertising Initiative opt-out page.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. GDPR & CCPA Rights</h2>
          <p>
            Depending on your jurisdiction, you have the right to request access to, correction of, or deletion of any personal data we hold about you. Since we do not collect personal accounts, we retain virtually no identifiable personal data. You can clear your high scores and preferences at any time by clearing your browser cache.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">5. Children&apos;s Privacy</h2>
          <p>
            OnlineGameNest does not knowingly solicit or collect personally identifiable information from children under the age of 13. Our &quot;Kids&quot; and &quot;Educational&quot; category games are safe, free of violent content, and adhere to COPPA guidelines.
          </p>
        </section>
      </div>
    </div>
  );
};
