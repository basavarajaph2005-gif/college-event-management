import React, { useState } from 'react';
import { BannerSize, BannerContent, AdTheme } from '../types/banner';
import { BANNER_SIZES } from '../data/bannerSizes';
import {
  X,
  Download,
  Archive,
  Check,
  FileCode,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { exportAllBannersZip, downloadBannerAsPng } from '../utils/canvasRenderer';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: BannerContent;
  theme: AdTheme;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  content,
  theme,
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState({ current: 0, total: BANNER_SIZES.length });
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'iab' | 'mobile' | 'social'>('all');

  if (!isOpen) return null;

  const filteredSizes =
    selectedCategory === 'all'
      ? BANNER_SIZES
      : BANNER_SIZES.filter((s) => s.category === selectedCategory);

  const handleDownloadZip = async () => {
    setIsZipping(true);
    setDownloadSuccess(false);

    try {
      const blob = await exportAllBannersZip(
        filteredSizes,
        content,
        theme,
        (current, total) => {
          setZipProgress({ current, total });
        }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.brandName.toLowerCase().replace(/\s+/g, '_')}_banner_ad_suite_${selectedCategory}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('ZIP export error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingle = async (size: BannerSize) => {
    await downloadBannerAsPng(size, content, theme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Export Banner Ad Suite</h2>
              <p className="text-xs text-slate-400">
                Package all standard banner formats in 2x High-DPI PNGs with ad specs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Main Action Banner */}
          <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 p-6 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                <Sparkles className="w-3.5 h-3.5" /> High-Resolution Ad Delivery
              </span>
              <h3 className="text-lg font-black text-white">
                Download All {filteredSizes.length} Banners as .ZIP
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                Generates crisp 2x retina PNG files with transparent backgrounds, standardized filenames, and campaign manifest.json for Google Ads / DSP upload.
              </p>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-xl shadow-indigo-600/30 flex items-center gap-2 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
            >
              {isZipping ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Rendering ({zipProgress.current}/{zipProgress.total})...
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  Downloaded Successfully!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download ZIP Archive
                </>
              )}
            </button>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-400 mr-2">Filter Formats:</span>
            {(['all', 'iab', 'mobile', 'social'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? `All (${BANNER_SIZES.length})` : cat}
              </button>
            ))}
          </div>

          {/* List of included sizes */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {filteredSizes.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                    {s.width > s.height ? 'W' : s.width === s.height ? 'S' : 'H'}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      {s.name}
                      <span className="text-[10px] text-slate-400 font-mono font-normal">
                        ({s.width} × {s.height} px)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{s.description}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadSingle(s)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Target Platform: Google Display Network, Meta Ads, X, TikTok, AppLovin, Programmatic DSPs</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
