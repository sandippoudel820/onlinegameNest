import React, { useState } from 'react';
import { Game } from '../../types/game';
import { generateSitemapXml, generateRobotsTxt } from '../../utils/seo';
import { FileCode, Copy, Check, Download, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
}

export const SitemapModal: React.FC<Props> = ({ isOpen, onClose, games }) => {
  const [activeTab, setActiveTab] = useState<'sitemap' | 'robots'>('sitemap');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sitemapContent = generateSitemapXml(games);
  const robotsContent = generateRobotsTxt();

  const currentContent = activeTab === 'sitemap' ? sitemapContent : robotsContent;

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'sitemap' ? 'sitemap.xml' : 'robots.txt';
    const type = activeTab === 'sitemap' ? 'application/xml' : 'text/plain';
    const blob = new Blob([currentContent], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">SEO Engine: Sitemap & Robots.txt</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="px-4 pt-3 flex items-center justify-between border-b border-slate-800 bg-slate-950">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('sitemap')}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition ${
                activeTab === 'sitemap'
                  ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              sitemap.xml ({games.length + 8} URLs)
            </button>
            <button
              onClick={() => setActiveTab('robots')}
              className={`px-3 py-1.5 text-xs font-bold rounded-t-lg transition ${
                activeTab === 'robots'
                  ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              robots.txt
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        </div>

        {/* Content viewer */}
        <div className="p-4 flex-1 overflow-auto bg-slate-950">
          <pre className="font-mono text-xs text-slate-300 whitespace-pre leading-relaxed select-all">
            {currentContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
