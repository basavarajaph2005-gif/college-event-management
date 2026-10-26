import React, { useState } from 'react';
import { BannerSize, BannerContent, AdTheme } from '../types/banner';
import {
  X,
  Download,
  Copy,
  Check,
  Code,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Palette,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { downloadBannerAsPng, copyBannerToClipboard, generateBannerHtmlSnippet } from '../utils/canvasRenderer';
import { encodeBannerContent } from '../utils/shareUtils';

interface BannerStudioProps {
  size: BannerSize | null;
  onClose: () => void;
  content: BannerContent;
  theme: AdTheme;
  onUpdateContent: (updated: Partial<BannerContent>) => void;
  onSelectTheme: (themeId: string) => void;
  allThemes: AdTheme[];
  onOpenImageGen: () => void;
}

export const BannerStudio: React.FC<BannerStudioProps> = ({
  size,
  onClose,
  content,
  theme,
  onUpdateContent,
  onSelectTheme,
  allThemes,
  onOpenImageGen,
}) => {
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [shared, setShared] = useState(false);

  if (!size) return null;

  const handleCopyImage = async () => {
    const ok = await copyBannerToClipboard(size, content, theme);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    await downloadBannerAsPng(size, content, theme);
  };

  const codeSnippet = generateBannerHtmlSnippet(size, content, theme);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareDesign = () => {
    const encoded = encodeBannerContent(content);
    const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
    navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top App Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-base flex items-center gap-2">
              Studio Editor: <span className="text-indigo-400">{size.name}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
              {size.width} × {size.height} px ({size.aspectRatioLabel})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs text-slate-300">
              <button
                onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
                className="p-1 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
                className="p-1 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="px-2 py-0.5 ml-1 bg-slate-700 text-slate-200 rounded hover:bg-slate-600 text-[10px]"
              >
                100%
              </button>
            </div>

            <button
              onClick={() => setShowCode(!showCode)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              <Code className="w-3.5 h-3.5" />
              {showCode ? 'Canvas View' : 'HTML Code'}
            </button>

            <button
              onClick={handleCopyImage}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Image'}
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </button>

            <button
              onClick={handleShareDesign}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
            >
              {shared ? <Check className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
              {shared ? 'Link Copied' : 'Share Design'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Canvas Display */}
          <div className="flex-1 bg-slate-950 p-8 flex items-center justify-center overflow-auto relative checkerboard-bg">
            {!showCode ? (
              <div
                style={{
                  width: `${size.width * zoom}px`,
                  height: `${size.height * zoom}px`,
                }}
                className="relative transition-all shadow-2xl rounded-lg overflow-hidden border border-slate-700"
              >
                <div
                  style={{
                    width: `${size.width}px`,
                    height: `${size.height}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    background: theme.gradient,
                    color: theme.text,
                  }}
                  className="relative overflow-hidden w-full h-full flex flex-col justify-between"
                >
                  {/* Background Image */}
                  {content.imageUrl && (
                    <div className="absolute inset-0 z-0">
                      <img
                        src={content.imageUrl}
                        alt="Background"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          backgroundColor: `rgba(0, 0, 0, ${content.overlayOpacity / 100})`,
                          backgroundImage:
                            content.overlayGradient === 'bottom-up'
                              ? 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.3))'
                              : 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.85) 100%)',
                        }}
                      />
                    </div>
                  )}

                  {/* Inner text overlay */}
                  <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          style={{ color: theme.primary }}
                          className="font-black uppercase tracking-wider text-sm"
                        >
                          {content.brandName}
                        </span>
                        {content.badgeText && (
                          <span
                            style={{
                              backgroundColor: theme.tagBg,
                              color: theme.accent,
                            }}
                            className="text-xs font-bold px-3 py-1 rounded-full border border-current"
                          >
                            {content.badgeText}
                          </span>
                        )}
                      </div>
                      <h2
                        style={{ color: theme.text }}
                        className="font-black text-2xl leading-tight mb-2 drop-shadow"
                      >
                        {content.headline}
                      </h2>
                      {content.subheadline && (
                        <p
                          style={{ color: theme.mutedText }}
                          className="text-sm opacity-90 max-w-md"
                        >
                          {content.subheadline}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-4">
                      {content.pricingText && (
                        <span
                          style={{ color: theme.accent }}
                          className="font-black text-lg"
                        >
                          {content.pricingText}
                        </span>
                      )}
                      <button
                        style={{
                          backgroundColor: theme.ctaBg,
                          color: theme.ctaText,
                        }}
                        className="px-6 py-2.5 rounded-full font-black text-sm shadow-xl"
                      >
                        {content.ctaText} →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300">
                    Standalone HTML/CSS Embed Code
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copied' : 'Copy Code'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={codeSnippet}
                  className="flex-1 w-full bg-slate-950 font-mono text-xs text-slate-300 p-4 rounded-lg border border-slate-800 resize-none focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Right Inspector & Tweaker Drawer */}
          <div className="w-96 border-l border-slate-800 bg-slate-900/90 p-5 overflow-y-auto space-y-5">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Live Content Tweaks
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Brand Name</label>
                  <input
                    type="text"
                    value={content.brandName}
                    onChange={(e) => onUpdateContent({ brandName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Headline</label>
                  <input
                    type="text"
                    value={content.headline}
                    onChange={(e) => onUpdateContent({ headline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Subheadline</label>
                  <textarea
                    rows={2}
                    value={content.subheadline}
                    onChange={(e) => onUpdateContent({ subheadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 font-semibold mb-1 block">CTA Text</label>
                    <input
                      type="text"
                      value={content.ctaText}
                      onChange={(e) => onUpdateContent({ ctaText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold mb-1 block">Offer / Badge</label>
                    <input
                      type="text"
                      value={content.badgeText}
                      onChange={(e) => onUpdateContent({ badgeText: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Price / Hook</label>
                  <input
                    type="text"
                    value={content.pricingText}
                    onChange={(e) => onUpdateContent({ pricingText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Visuals & Scrim Controls */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Image & Scrim
                </h3>
                <button
                  onClick={onOpenImageGen}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Visuals
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>Darkness Scrim</span>
                    <span className="font-mono">{content.overlayOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={content.overlayOpacity}
                    onChange={(e) =>
                      onUpdateContent({ overlayOpacity: Number(e.target.value) })
                    }
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Button Shape</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['pill-glow', 'rounded-bold', 'minimal-arrow', 'sharp-neon'] as const).map(
                      (bStyle) => (
                        <button
                          key={bStyle}
                          onClick={() => onUpdateContent({ buttonStyle: bStyle })}
                          className={`py-1.5 px-2 rounded-lg border text-[11px] capitalize font-medium transition-all ${
                            content.buttonStyle === bStyle
                              ? 'bg-indigo-600/30 border-indigo-400 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {bStyle.replace('-', ' ')}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Design Palettes */}
            <div className="pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Color Palettes
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {allThemes.map((thm) => (
                  <button
                    key={thm.id}
                    onClick={() => onSelectTheme(thm.id)}
                    className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                      theme.id === thm.id
                        ? 'border-indigo-400 ring-2 ring-indigo-500/20 bg-slate-950'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full shrink-0 border border-white/20"
                      style={{ background: thm.ctaBg }}
                    />
                    <span className="text-[11px] font-semibold text-slate-200 truncate">
                      {thm.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
