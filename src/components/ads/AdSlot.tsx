import React from 'react';
import { Megaphone, ExternalLink } from 'lucide-react';

export type AdSlotType =
  | 'leaderboard' // 728x90 (Desktop Top / Bottom)
  | 'billboard' // 970x250 (Desktop Wide Banner)
  | 'skyscraper' // 160x600 or 300x600 (Desktop Left / Right sidebars)
  | 'medium-rectangle' // 300x250 (Mobile / Sidebar)
  | 'mobile-banner' // 320x50 (Mobile Top / Bottom)
  | 'in-feed'; // Responsive between game cards

interface Props {
  slotType: AdSlotType;
  className?: string;
  slotId?: string;
  title?: string;
}

export const AdSlot: React.FC<Props> = ({ slotType, className = '', slotId, title }) => {
  // Dimension definitions according to IAB standards
  let dimensions = 'w-full h-24';
  let badgeText = 'Advertisement';
  let sizeLabel = 'Responsive Ad Slot';

  switch (slotType) {
    case 'leaderboard':
      dimensions = 'w-[728px] max-w-full h-[90px]';
      sizeLabel = 'Leaderboard 728 × 90';
      break;
    case 'billboard':
      dimensions = 'w-[970px] max-w-full h-[120px] sm:h-[180px] lg:h-[250px]';
      sizeLabel = 'Billboard 970 × 250';
      break;
    case 'skyscraper':
      dimensions = 'w-[160px] xl:w-[240px] h-[600px]';
      sizeLabel = 'Skyscraper 160/240 × 600';
      break;
    case 'medium-rectangle':
      dimensions = 'w-[300px] h-[250px]';
      sizeLabel = 'Medium Rectangle 300 × 250';
      break;
    case 'mobile-banner':
      dimensions = 'w-[320px] max-w-full h-[50px]';
      sizeLabel = 'Mobile Banner 320 × 50';
      break;
    case 'in-feed':
      dimensions = 'w-full h-[100px] sm:h-[120px]';
      sizeLabel = 'Native In-Feed Ad Unit';
      break;
  }

  return (
    <div
      data-ad-slot={slotId || slotType}
      className={`relative mx-auto flex flex-col items-center justify-center bg-slate-900/60 border border-dashed border-slate-700/70 rounded-xl overflow-hidden text-slate-400 select-none transition hover:border-slate-600 ${dimensions} ${className}`}
    >
      {/* Discreet Ad Transparency Notice */}
      <div className="absolute top-1 right-2 flex items-center gap-1 opacity-70">
        <span className="text-[9px] tracking-wider uppercase font-semibold text-slate-500">
          {badgeText}
        </span>
      </div>

      {/* Clean, Non-Deceptive Publisher Placeholder Content */}
      <div className="flex flex-col items-center justify-center p-3 text-center">
        <div className="flex items-center gap-2 text-slate-500 mb-1">
          <Megaphone className="w-4 h-4 text-indigo-400/80" />
          <span className="text-xs font-mono font-medium text-slate-400">
            {title || sizeLabel}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 max-w-[240px]">
          Monetization Ready &bull; Insert AdSense or Ad Exchange tag
        </p>
      </div>
    </div>
  );
};
