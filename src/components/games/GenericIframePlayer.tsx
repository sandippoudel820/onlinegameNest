import React, { useState } from 'react';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  gameUrl: string;
  title: string;
  onScoreUpdate?: (score: number) => void;
}

export const GenericIframePlayer: React.FC<Props> = ({ gameUrl, title }) => {
  const [loading, setLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [error, setError] = useState(false);

  const handleReload = () => {
    setLoading(true);
    setError(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="relative w-full h-full min-h-[360px] sm:min-h-[480px] bg-slate-950 flex items-center justify-center overflow-hidden touch-manipulation">
      {/* Loading Spinner */}
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-300">Loading {title}...</p>
          <span className="text-xs text-slate-500 mt-1">Ready for touch & keyboard play</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-slate-950">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Failed to load game stream</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            The external game host could not be reached or has frame restrictions.
          </p>
          <button
            onClick={handleReload}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg flex items-center gap-2 text-sm font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}

      {/* The HTML5 Game Iframe */}
      <iframe
        key={iframeKey}
        src={gameUrl}
        title={title}
        className="w-full h-full border-0 absolute inset-0 touch-manipulation"
        allow="autoplay; fullscreen; gamepad; focus-without-user-activation; screen-wake-lock; accelerometer; gyroscope; payment 'none'"
        sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-modals"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
};
