import React, { useState } from 'react';
import { BannerSize, BannerContent, AdTheme } from '../types/banner';
import { BANNER_SIZES } from '../data/bannerSizes';
import { Monitor, Smartphone, Instagram, Newspaper, ExternalLink } from 'lucide-react';

interface PlacementSimulatorProps {
  content: BannerContent;
  theme: AdTheme;
}

export const PlacementSimulator: React.FC<PlacementSimulatorProps> = ({
  content,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile' | 'story'>('desktop');

  const leaderboard = BANNER_SIZES.find((s) => s.id === '728x90')!;
  const mpu = BANNER_SIZES.find((s) => s.id === '300x250')!;
  const skyscraper = BANNER_SIZES.find((s) => s.id === '160x600')!;
  const mobileBanner = BANNER_SIZES.find((s) => s.id === '320x50')!;
  const storySize = BANNER_SIZES.find((s) => s.id === '1080x1920')!;

  return (
    <div className="space-y-6">
      {/* Simulation Selector Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'desktop'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Desktop Editorial (728x90, 300x250, 160x600)
          </button>

          <button
            onClick={() => setActiveTab('mobile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'mobile'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile App & Sticky Banner (320x50, 300x250)
          </button>

          <button
            onClick={() => setActiveTab('story')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'story'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Instagram className="w-4 h-4" />
            Social Fullscreen Story (1080x1920)
          </button>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Simulated Ad Placements
        </span>
      </div>

      {/* 1. DESKTOP SIMULATION */}
      {activeTab === 'desktop' && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Simulated Browser Chrome */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex-1 max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-center text-xs text-slate-400 font-mono truncate">
              https://techdaily-news.example.com/special-feature-2026
            </div>
          </div>

          {/* Webpage Content with embedded ads */}
          <div className="p-6 md:p-8 bg-slate-900/40 space-y-6">
            {/* Top 728x90 Leaderboard Ad */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 font-bold">
                Advertisement • 728 × 90 Leaderboard
              </span>
              <div className="overflow-hidden rounded-lg shadow-xl border border-white/10 max-w-full">
                <div
                  style={{
                    width: '728px',
                    height: '90px',
                    background: theme.gradient,
                    color: theme.text,
                  }}
                  className="relative flex items-center justify-between px-6 select-none"
                >
                  {content.imageUrl && (
                    <img
                      src={content.imageUrl}
                      alt="Bg"
                      className="absolute inset-0 w-full h-full object-cover opacity-35"
                    />
                  )}
                  <div className="relative z-10 flex flex-col justify-center">
                    <span
                      style={{ color: theme.primary }}
                      className="text-[10px] font-black uppercase tracking-wider"
                    >
                      {content.brandName} • {content.badgeText}
                    </span>
                    <h4 className="text-base font-black truncate max-w-md">
                      {content.headline}
                    </h4>
                    <p className="text-[11px] text-slate-300 truncate max-w-md">
                      {content.subheadline}
                    </p>
                  </div>
                  <div className="relative z-10 flex items-center gap-3">
                    {content.pricingText && (
                      <span style={{ color: theme.accent }} className="font-bold text-sm">
                        {content.pricingText}
                      </span>
                    )}
                    <button
                      style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                      className="px-4 py-2 rounded-full font-black text-xs shadow-md"
                    >
                      {content.ctaText} →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Editorial Layout with 300x250 and 160x600 */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              {/* Main Article (2 cols) */}
              <div className="md:col-span-2 space-y-4">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                  How Autonomous Creative Intelligence is Transforming Global Commerce
                </h1>
                <div className="flex items-center gap-3 text-xs text-slate-400 pb-2 border-b border-slate-800">
                  <span>By Editorial Staff</span>
                  <span>•</span>
                  <span>5 min read</span>
                  <span>•</span>
                  <span className="text-indigo-400">Technology & Growth</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Modern organizations require velocity and precision. In an era where consumer attention
                  is captured in milliseconds, dynamic multichannel presence across all standard banner formats
                  is essential for high-converting marketing campaigns.
                </p>

                {/* Embedded 300x250 In-Article Ad */}
                <div className="my-6 p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col items-center">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">
                    Sponsored • 300 × 250 Medium Rectangle
                  </span>
                  <div
                    style={{
                      width: '300px',
                      height: '250px',
                      background: theme.gradient,
                      color: theme.text,
                    }}
                    className="relative rounded-lg overflow-hidden border border-white/10 p-5 flex flex-col justify-between shadow-2xl select-none"
                  >
                    {content.imageUrl && (
                      <img
                        src={content.imageUrl}
                        alt="Bg"
                        className="absolute inset-0 w-full h-full object-cover opacity-35"
                      />
                    )}
                    <div className="relative z-10">
                      <div className="flex justify-between items-center text-xs font-bold mb-2">
                        <span style={{ color: theme.primary }}>{content.brandName}</span>
                        <span
                          style={{ backgroundColor: theme.tagBg, color: theme.accent }}
                          className="px-2 py-0.5 rounded-full text-[10px] border border-current"
                        >
                          {content.badgeText}
                        </span>
                      </div>
                      <h3 className="text-lg font-black leading-snug drop-shadow-sm mb-1.5">
                        {content.headline}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2">
                        {content.subheadline}
                      </p>
                    </div>
                    <div className="relative z-10 flex items-center justify-between pt-2">
                      <span style={{ color: theme.accent }} className="font-bold text-sm">
                        {content.pricingText}
                      </span>
                      <button
                        style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                        className="px-4 py-2 rounded-full font-black text-xs shadow-lg"
                      >
                        {content.ctaText} →
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  With multi-size ad generation, marketing teams eliminate design bottlenecks, allowing
                  instant deployment across programmatic exchanges, Google Display Network, and paid social
                  channels within minutes of product launch.
                </p>
              </div>

              {/* Sidebar with 160x600 Wide Skyscraper */}
              <div className="space-y-4 flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Sidebar • 160 × 600 Skyscraper
                </span>
                <div
                  style={{
                    width: '160px',
                    height: '600px',
                    background: theme.gradient,
                    color: theme.text,
                  }}
                  className="relative rounded-lg overflow-hidden border border-white/10 p-4 flex flex-col justify-between text-center shadow-2xl select-none"
                >
                  {content.imageUrl && (
                    <img
                      src={content.imageUrl}
                      alt="Bg"
                      className="absolute inset-0 w-full h-full object-cover opacity-35"
                    />
                  )}
                  <div className="relative z-10">
                    <div style={{ color: theme.primary }} className="text-xs font-black uppercase mb-2">
                      {content.brandName}
                    </div>
                    <div
                      style={{ backgroundColor: theme.tagBg, color: theme.accent }}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-current mx-auto mb-3 truncate"
                    >
                      {content.badgeText}
                    </div>
                    <h3 className="text-base font-black leading-tight drop-shadow mb-3">
                      {content.headline}
                    </h3>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {content.subheadline}
                    </p>
                  </div>
                  <div className="relative z-10 space-y-2">
                    <span style={{ color: theme.accent }} className="font-bold text-sm block">
                      {content.pricingText}
                    </span>
                    <button
                      style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                      className="w-full py-2.5 rounded-xl font-black text-xs shadow-lg"
                    >
                      {content.ctaText}
                    </button>
                    <span className="text-[8px] text-white/40 block truncate">
                      {content.disclaimer}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MOBILE SIMULATION */}
      {activeTab === 'mobile' && (
        <div className="flex items-center justify-center p-6">
          <div className="w-[360px] h-[720px] bg-slate-950 rounded-[44px] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
            {/* Phone Notch & Status Bar */}
            <div className="bg-slate-900 px-6 pt-3 pb-2 flex justify-between items-center text-[10px] text-slate-400">
              <span className="font-bold">9:41</span>
              <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto" />
              <span>5G 100%</span>
            </div>

            {/* App Header */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <span className="font-black text-white text-sm">Discover Daily</span>
              <span className="text-xs text-indigo-400 font-bold">Live</span>
            </div>

            {/* App Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="h-32 bg-slate-900 rounded-2xl p-4 flex flex-col justify-end border border-slate-800">
                <span className="text-xs font-bold text-slate-400">Trending Now</span>
                <span className="text-sm font-bold text-white">Top 10 High-Growth Products</span>
              </div>

              {/* In-feed 300x250 Banner */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">
                  Sponsored Post
                </span>
                <div
                  style={{
                    width: '300px',
                    height: '250px',
                    background: theme.gradient,
                    color: theme.text,
                  }}
                  className="rounded-2xl overflow-hidden border border-white/10 p-4 flex flex-col justify-between shadow-lg relative"
                >
                  {content.imageUrl && (
                    <img
                      src={content.imageUrl}
                      alt="Bg"
                      className="absolute inset-0 w-full h-full object-cover opacity-35"
                    />
                  )}
                  <div className="relative z-10">
                    <span style={{ color: theme.primary }} className="text-xs font-black uppercase">
                      {content.brandName}
                    </span>
                    <h3 className="text-base font-black leading-snug mt-1 mb-1">
                      {content.headline}
                    </h3>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {content.subheadline}
                    </p>
                  </div>
                  <div className="relative z-10 flex items-center justify-between">
                    <span style={{ color: theme.accent }} className="font-bold text-xs">
                      {content.pricingText}
                    </span>
                    <button
                      style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                      className="px-4 py-1.5 rounded-full font-black text-xs shadow-md"
                    >
                      {content.ctaText} →
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-24 bg-slate-900/60 rounded-xl p-3 border border-slate-800 text-xs text-slate-400">
                Editorial recommended reads for this afternoon...
              </div>
            </div>

            {/* Sticky Mobile Leaderboard 320x50 at bottom */}
            <div className="bg-slate-900 border-t border-slate-800 p-2 flex flex-col items-center">
              <span className="text-[8px] text-slate-500 uppercase tracking-wider mb-0.5">
                Sticky Mobile Ad (320 × 50)
              </span>
              <div
                style={{
                  width: '320px',
                  height: '50px',
                  background: theme.gradient,
                  color: theme.text,
                }}
                className="rounded-lg overflow-hidden border border-white/10 px-3 flex items-center justify-between relative shadow-lg"
              >
                {content.imageUrl && (
                  <img
                    src={content.imageUrl}
                    alt="Bg"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                )}
                <div className="relative z-10 truncate mr-2">
                  <div style={{ color: theme.accent }} className="text-[9px] font-bold uppercase truncate">
                    {content.brandName}
                  </div>
                  <div className="text-xs font-black text-white truncate">
                    {content.headline}
                  </div>
                </div>
                <button
                  style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                  className="relative z-10 px-3 py-1.5 rounded-full text-[10px] font-black shrink-0 shadow"
                >
                  {content.ctaText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SOCIAL STORY SIMULATION */}
      {activeTab === 'story' && (
        <div className="flex items-center justify-center p-6">
          <div className="w-[360px] h-[640px] bg-slate-950 rounded-[44px] border-[8px] border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
            {/* Story Top Progress Bars */}
            <div className="absolute top-4 inset-x-4 z-30 flex gap-1">
              <div className="flex-1 h-1 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-3/4 animate-pulse" />
              </div>
              <div className="flex-1 h-1 bg-white/30 rounded-full" />
              <div className="flex-1 h-1 bg-white/30 rounded-full" />
            </div>

            {/* Story Header */}
            <div className="absolute top-8 inset-x-4 z-30 flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-bold text-xs ring-2 ring-white">
                  {content.brandName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    {content.brandName}
                    <span className="text-[10px] px-1 bg-white/20 rounded">Sponsored</span>
                  </div>
                  <div className="text-[10px] text-white/70">Swipe up to learn more</div>
                </div>
              </div>
            </div>

            {/* Story Background & Content */}
            <div
              style={{ background: theme.gradient, color: theme.text }}
              className="relative w-full h-full flex flex-col justify-between p-8 pt-24 pb-12 select-none"
            >
              {content.imageUrl && (
                <img
                  src={content.imageUrl}
                  alt="Story Visual"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

              <div className="relative z-20 text-center space-y-3">
                {content.badgeText && (
                  <span
                    style={{ backgroundColor: theme.tagBg, color: theme.accent }}
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-black border border-current shadow-lg"
                  >
                    {content.badgeText}
                  </span>
                )}
                <h2 className="text-3xl font-black leading-tight drop-shadow-xl text-white">
                  {content.headline}
                </h2>
                <p className="text-xs text-white/90 max-w-xs mx-auto leading-relaxed">
                  {content.subheadline}
                </p>
              </div>

              <div className="relative z-20 text-center space-y-3">
                {content.pricingText && (
                  <div style={{ color: theme.accent }} className="font-black text-2xl drop-shadow">
                    {content.pricingText}
                  </div>
                )}
                <button
                  style={{ backgroundColor: theme.ctaBg, color: theme.ctaText }}
                  className="w-full py-3.5 rounded-2xl font-black text-sm shadow-2xl flex items-center justify-center gap-2"
                >
                  {content.ctaText} →
                </button>
                <div className="text-[10px] text-white/60">
                  Swipe up to view details
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
