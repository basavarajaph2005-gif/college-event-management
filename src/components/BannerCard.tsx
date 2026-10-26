import React, { useState } from 'react';
import { BannerSize, BannerContent, AdTheme } from '../types/banner';
import { Download, Copy, Check, Code, Sparkles, ExternalLink, Maximize2 } from 'lucide-react';
import { downloadBannerAsPng, copyBannerToClipboard } from '../utils/canvasRenderer';

interface BannerCardProps {
  size: BannerSize;
  content: BannerContent;
  theme: AdTheme;
  onOpenStudio?: (size: BannerSize) => void;
  onOpenCode?: (size: BannerSize) => void;
  scale?: number;
}

export const BannerCard: React.FC<BannerCardProps> = ({
  size,
  content,
  theme,
  onOpenStudio,
  onOpenCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyBannerToClipboard(size, content, theme);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      await downloadBannerAsPng(size, content, theme);
    } finally {
      setDownloading(false);
    }
  };

  // Font family mapping
  const fontClass =
    content.fontFamily === 'serif' ? 'font-serif' :
    content.fontFamily === 'display' ? 'font-sans font-black tracking-tight' :
    'font-sans';

  // Compute container bounds and max preview width/height
  const isHorizontal = size.layoutType === 'horizontal';
  const isCompactMobile = size.layoutType === 'compact-mobile';
  const isVertical = size.layoutType === 'vertical';
  const isStory = size.layoutType === 'story';
  const isHighRes = size.width >= 800;

  // For responsive display preview, calculate a scale that fits within standard preview cards
  let displayScale = 1;
  let previewBoxWidth = size.width;
  let previewBoxHeight = size.height;

  if (size.width > 700 || size.height > 650) {
    if (isStory) {
      displayScale = 0.28; // scale 1080x1920 to ~302x537
    } else if (size.width === 1080) {
      displayScale = 0.35; // scale 1080x1080 to ~378x378
    } else if (size.width === 1200) {
      displayScale = 0.38; // scale 1200x628 to ~456x238
    } else if (size.width >= 970) {
      displayScale = 0.58; // scale 970 to ~562
    }
    previewBoxWidth = Math.round(size.width * displayScale);
    previewBoxHeight = Math.round(size.height * displayScale);
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col hover:border-slate-700 transition-all duration-200 shadow-xl group">
      {/* Header bar of the card */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">{size.name}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono text-[11px] border border-slate-700/50">
            {size.width} × {size.height}
          </span>
          {size.popular && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold border border-amber-500/30">
              POPULAR
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            title="Copy as image to clipboard"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download high-res PNG"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          {onOpenCode && (
            <button
              onClick={() => onOpenCode(size)}
              title="Get HTML/CSS Embed Code"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          )}
          {onOpenStudio && (
            <button
              onClick={() => onOpenStudio(size)}
              title="Open in Studio Focus Mode"
              className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Banner Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-2 min-h-[140px] overflow-hidden rounded-xl bg-slate-950/60 border border-slate-800/50 relative">
        <div
          style={{
            width: `${previewBoxWidth}px`,
            height: `${previewBoxHeight}px`,
          }}
          className="relative transition-transform duration-200"
        >
          {/* Scaled Inner Banner */}
          <div
            style={{
              width: `${size.width}px`,
              height: `${size.height}px`,
              transform: `scale(${displayScale})`,
              transformOrigin: 'top left',
              background: theme.gradient,
              color: theme.text,
            }}
            className={`relative overflow-hidden border border-white/10 rounded-lg shadow-2xl flex select-none ${fontClass}`}
          >
            {/* Background Image & Overlay */}
            {content.imageUrl && (
              <div className="absolute inset-0 z-0">
                <img
                  src={content.imageUrl}
                  alt={content.brandName}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: `rgba(0, 0, 0, ${content.overlayOpacity / 100})`,
                    backgroundImage:
                      content.overlayGradient === 'bottom-up'
                        ? 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.3))'
                        : isHorizontal
                        ? 'linear-gradient(to right, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.2) 100%)'
                        : 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.85) 100%)',
                  }}
                />
              </div>
            )}

            {/* Inner Content Layer */}
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
              {/* 1. HORIZONTAL BANNER (728x90, 970x90) */}
              {isHorizontal && (
                <div className="w-full h-full px-5 py-2 flex items-center justify-between gap-4">
                  <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        style={{ color: theme.primary }}
                        className="font-extrabold tracking-wider text-[11px] uppercase"
                      >
                        {content.brandName}
                      </span>
                      {content.badgeText && size.height >= 70 && (
                        <span
                          style={{ color: theme.accent }}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10"
                        >
                          {content.badgeText}
                        </span>
                      )}
                    </div>
                    <h2
                      style={{ color: theme.text }}
                      className="font-black text-[18px] leading-tight truncate drop-shadow-sm"
                    >
                      {content.headline}
                    </h2>
                    {size.height >= 80 && content.subheadline && (
                      <p
                        style={{ color: theme.mutedText }}
                        className="text-[11px] truncate opacity-90"
                      >
                        {content.subheadline}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {content.pricingText && (
                      <span
                        style={{ color: theme.accent }}
                        className="font-black text-sm whitespace-nowrap"
                      >
                        {content.pricingText}
                      </span>
                    )}
                    <button
                      style={{
                        backgroundColor: theme.ctaBg,
                        color: theme.ctaText,
                      }}
                      className="px-5 py-2.5 rounded-full text-xs font-black shadow-lg hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
                    >
                      {content.ctaText} →
                    </button>
                  </div>
                </div>
              )}

              {/* 2. COMPACT MOBILE (320x50, 320x100) */}
              {isCompactMobile && (
                <div className="w-full h-full px-3 py-1.5 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        style={{ color: theme.accent }}
                        className="font-bold text-[9px] uppercase tracking-wide"
                      >
                        {content.brandName}
                      </span>
                    </div>
                    <h3
                      style={{ color: theme.text }}
                      className={`font-black leading-tight truncate ${size.height <= 60 ? 'text-[12px]' : 'text-[14px]'}`}
                    >
                      {content.headline}
                    </h3>
                    {size.height >= 80 && content.subheadline && (
                      <p
                        style={{ color: theme.mutedText }}
                        className="text-[10px] truncate"
                      >
                        {content.subheadline}
                      </p>
                    )}
                  </div>

                  <button
                    style={{
                      backgroundColor: theme.ctaBg,
                      color: theme.ctaText,
                    }}
                    className="px-3 py-1.5 rounded-full text-[11px] font-black shrink-0 shadow-md whitespace-nowrap"
                  >
                    {content.ctaText}
                  </button>
                </div>
              )}

              {/* 3. VERTICAL SKYSCRAPER (160x600, 300x600, 120x600) */}
              {isVertical && (
                <div className="w-full h-full p-4 flex flex-col justify-between items-center text-center">
                  <div className="w-full">
                    <div
                      style={{ color: theme.primary }}
                      className="font-black text-xs uppercase tracking-wider mb-2"
                    >
                      {content.brandName}
                    </div>
                    {content.badgeText && (
                      <div
                        style={{
                          backgroundColor: theme.tagBg,
                          color: theme.accent,
                          borderColor: theme.accent,
                        }}
                        className="border px-2.5 py-1 rounded-full text-[10px] font-bold mx-auto mb-3 max-w-[140px] truncate"
                      >
                        {content.badgeText}
                      </div>
                    )}
                    <h2
                      style={{ color: theme.text }}
                      className={`font-black leading-snug drop-shadow-md mb-2 ${size.width <= 140 ? 'text-sm' : size.width <= 200 ? 'text-lg' : 'text-2xl'}`}
                    >
                      {content.headline}
                    </h2>
                    {content.subheadline && size.height >= 500 && (
                      <p
                        style={{ color: theme.mutedText }}
                        className={`leading-relaxed opacity-90 ${size.width <= 140 ? 'text-[10px]' : 'text-xs'}`}
                      >
                        {content.subheadline}
                      </p>
                    )}
                  </div>

                  <div className="w-full mt-auto">
                    {content.pricingText && (
                      <div
                        style={{ color: theme.accent }}
                        className="font-extrabold text-sm mb-2"
                      >
                        {content.pricingText}
                      </div>
                    )}
                    <button
                      style={{
                        backgroundColor: theme.ctaBg,
                        color: theme.ctaText,
                      }}
                      className="w-full py-2.5 px-3 rounded-xl font-black text-xs shadow-xl hover:brightness-110 transition-transform"
                    >
                      {content.ctaText}
                    </button>
                    {content.disclaimer && (
                      <div className="text-[9px] text-white/40 mt-2 truncate">
                        {content.disclaimer}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. STORY / FULLSCREEN (1080x1920) */}
              {isStory && (
                <div className="w-full h-full p-16 flex flex-col justify-between items-center text-center">
                  <div className="w-full">
                    <div
                      style={{ color: theme.accent }}
                      className="font-black text-2xl uppercase tracking-widest mb-6"
                    >
                      {content.brandName}
                    </div>
                    {content.badgeText && (
                      <div
                        style={{
                          backgroundColor: theme.tagBg,
                          color: theme.accent,
                        }}
                        className="px-6 py-2.5 rounded-full text-xl font-black inline-block border border-current mb-8"
                      >
                        {content.badgeText}
                      </div>
                    )}
                    <h1
                      style={{ color: theme.text }}
                      className="font-black text-7xl leading-tight mb-8 drop-shadow-xl"
                    >
                      {content.headline}
                    </h1>
                    {content.subheadline && (
                      <p
                        style={{ color: theme.mutedText }}
                        className="text-3xl max-w-2xl mx-auto leading-relaxed"
                      >
                        {content.subheadline}
                      </p>
                    )}
                  </div>

                  <div className="w-full">
                    {content.pricingText && (
                      <div
                        style={{ color: theme.accent }}
                        className="font-black text-4xl mb-6"
                      >
                        {content.pricingText}
                      </div>
                    )}
                    <button
                      style={{
                        backgroundColor: theme.ctaBg,
                        color: theme.ctaText,
                      }}
                      className="w-full py-8 rounded-3xl font-black text-3xl shadow-2xl flex items-center justify-center gap-3"
                    >
                      {content.ctaText} →
                    </button>
                    {content.disclaimer && (
                      <div className="text-xl text-white/50 mt-6">
                        {content.disclaimer}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 5. SQUARE & RECTANGLES (300x250, 250x250, 336x280, 1080x1080, 1200x628, 970x250) */}
              {!isHorizontal && !isCompactMobile && !isVertical && !isStory && (
                <div
                  className={`w-full h-full flex flex-col justify-between ${
                    isHighRes ? 'p-12' : size.width >= 500 ? 'p-6' : 'p-4'
                  }`}
                >
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        style={{ color: theme.primary }}
                        className={`font-black uppercase tracking-wider ${
                          isHighRes ? 'text-2xl' : 'text-xs'
                        }`}
                      >
                        {content.brandName}
                      </span>
                      {content.badgeText && (
                        <span
                          style={{
                            backgroundColor: theme.tagBg,
                            color: theme.accent,
                          }}
                          className={`font-bold px-2.5 py-0.5 rounded-full border border-current ${
                            isHighRes ? 'text-lg' : 'text-[10px]'
                          }`}
                        >
                          {content.badgeText}
                        </span>
                      )}
                    </div>

                    <h2
                      style={{ color: theme.text }}
                      className={`font-black leading-tight drop-shadow-sm mb-2 ${
                        isHighRes
                          ? 'text-5xl mt-4'
                          : size.width >= 500
                          ? 'text-2xl mt-2'
                          : 'text-[18px]'
                      }`}
                    >
                      {content.headline}
                    </h2>

                    {content.subheadline && (
                      <p
                        style={{ color: theme.mutedText }}
                        className={`opacity-90 leading-snug line-clamp-2 ${
                          isHighRes ? 'text-2xl mt-4' : 'text-[12px]'
                        }`}
                      >
                        {content.subheadline}
                      </p>
                    )}
                  </div>

                  <div className="w-full flex items-center justify-between gap-3 pt-2">
                    {content.pricingText ? (
                      <span
                        style={{ color: theme.accent }}
                        className={`font-black ${
                          isHighRes ? 'text-3xl' : 'text-sm'
                        }`}
                      >
                        {content.pricingText}
                      </span>
                    ) : (
                      <span />
                    )}

                    <button
                      style={{
                        backgroundColor: theme.ctaBg,
                        color: theme.ctaText,
                      }}
                      className={`font-black shadow-lg rounded-full hover:brightness-110 active:scale-95 transition-all ${
                        isHighRes
                          ? 'px-10 py-5 text-2xl'
                          : 'px-4 py-2 text-xs'
                      }`}
                    >
                      {content.ctaText} →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate max-w-[200px]">{size.description}</span>
        <span className="font-mono text-slate-500 shrink-0">{size.aspectRatioLabel}</span>
      </div>
    </div>
  );
};
