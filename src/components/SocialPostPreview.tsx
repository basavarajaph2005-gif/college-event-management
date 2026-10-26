import React, { useState } from 'react';
import { BannerContent, AdTheme } from '../types/banner';
import {
  Instagram,
  Linkedin,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  Repeat2,
  Globe,
  Sparkles,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Download,
  Calendar,
  MapPin,
  Tag,
  ShieldCheck,
  Smile,
  Flame,
  Award,
} from 'lucide-react';

interface SocialPostPreviewProps {
  content: BannerContent;
  theme: AdTheme;
}

export const SocialPostPreview: React.FC<SocialPostPreviewProps> = ({
  content,
  theme,
}) => {
  // Platform selection: instagram | linkedin
  const [platform, setPlatform] = useState<'instagram' | 'linkedin'>('instagram');

  // Device frame: mobile | desktop
  const [deviceFrame, setDeviceFrame] = useState<'mobile' | 'desktop'>('mobile');

  // Aspect ratio for Instagram: 1:1 or 4:5
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5' | '1.91:1'>('1:1');

  // Interactive Social States
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1482);
  const [saved, setSaved] = useState(false);
  const [linkedinReaction, setLinkedinReaction] = useState<'like' | 'celebrate' | 'support' | 'insightful'>('like');
  const [linkedinReactionCount, setLinkedinReactionCount] = useState(389);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Custom Caption Editor State
  const defaultInstaCaption = ` Exciting news from ${content.brandName}!

${content.headline} — ${content.subheadline}

 ${content.badgeText || 'Limited Seats Available'}
 Entry: ${content.pricingText || 'Free Registration'}
 Instant Digital QR Pass on registration

Tag your college squad below and don't miss out! Link in bio to reserve seats. 

#CampusEvents #CollegeFest #StudentLife #${content.brandName.replace(/\s+/g, '')} #Hackathon #CollegeLife #TechFest2026 #EventPass`;

  const defaultLinkedinCaption = `Announcing ${content.headline} by ${content.brandName} 

We are thrilled to bring students, developers, and campus innovators together for an unforgettable experience.

 Key Highlights:
• ${content.subheadline}
• Exclusive perks: ${content.badgeText || 'Digital QR event passes & certificates'}
• Admission: ${content.pricingText || 'Open to all verified college students'}

Whether you are looking to showcase your talents, network with peers, or learn from industry mentors, this is your stage.

 Secure your seat today: campusevents.edu/register

#CampusEvents #HigherEducation #StudentLeadership #Innovation #${content.brandName.replace(/\s+/g, '')} #CareerGrowth`;

  const [caption, setCaption] = useState(defaultInstaCaption);
  const [isEditingCaption, setIsEditingCaption] = useState(false);

  const handleToggleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleSwitchPlatform = (p: 'instagram' | 'linkedin') => {
    setPlatform(p);
    if (p === 'instagram') {
      setCaption(defaultInstaCaption);
      if (aspectRatio === '1.91:1') setAspectRatio('1:1');
    } else {
      setCaption(defaultLinkedinCaption);
      setAspectRatio('1.91:1');
    }
  };

  const cleanHandle = content.brandName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'campusevents';

  return (
    <div className="space-y-6">
      {/* Top Controls Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Platform Selector Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSwitchPlatform('instagram')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              platform === 'instagram'
                ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white shadow-lg shadow-pink-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram Feed Post</span>
          </button>

          <button
            onClick={() => handleSwitchPlatform('linkedin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              platform === 'linkedin'
                ? 'bg-[#0077b5] text-white shadow-lg shadow-sky-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Linkedin className="w-4 h-4" />
            <span>LinkedIn Professional Post</span>
          </button>
        </div>

        {/* Framing & Aspect Ratio Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Aspect Ratio */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <span className="text-[10px] text-slate-500 font-bold px-2 uppercase">Ratio:</span>
            {(['1:1', '4:5', '1.91:1'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                  aspectRatio === ratio
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>

          {/* Device Frame */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setDeviceFrame('mobile')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceFrame === 'mobile'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone</span>
            </button>
            <button
              onClick={() => setDeviceFrame('desktop')}
              className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                deviceFrame === 'desktop'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Feed Card</span>
            </button>
          </div>

          {/* Copy Caption */}
          <button
            onClick={handleCopyCaption}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Preview Device / Feed Column */}
        <div className="lg:col-span-8 flex justify-center">
          {deviceFrame === 'mobile' ? (
            /* Smartphone Mockup Frame */
            <div className="w-full max-w-sm bg-black rounded-[46px] p-3 shadow-2xl border-4 border-slate-700 ring-1 ring-slate-800 relative">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-between px-3 border border-slate-800">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                <div className="w-2 h-2 rounded-full bg-indigo-950 border border-indigo-500/40" />
              </div>

              {/* Phone Screen Area */}
              <div className="bg-slate-950 rounded-[38px] overflow-hidden pt-7 pb-4 text-white text-xs border border-slate-800 shadow-inner">
                {platform === 'instagram' ? (
                  /* INSTAGRAM MOBILE INTERFACE */
                  <div className="space-y-3">
                    {/* IG Top App Bar */}
                    <div className="px-4 py-2 flex items-center justify-between border-b border-slate-900">
                      <span className="font-serif italic text-lg font-black tracking-tight text-white">
                        Instagram
                      </span>
                      <div className="flex items-center gap-4 text-slate-300">
                        <Heart className="w-4 h-4 cursor-pointer" />
                        <MessageCircle className="w-4 h-4 cursor-pointer" />
                      </div>
                    </div>

                    {/* Post User Header */}
                    <div className="px-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                          <div className="w-full h-full rounded-full bg-slate-900 border border-slate-900 flex items-center justify-center font-bold text-[10px] text-teal-400 font-mono">
                            CE
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-white text-xs">
                              {cleanHandle}
                            </span>
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-black">
                              ✓
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block -mt-0.5">
                            Campus Events • Sponsored
                          </span>
                        </div>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </div>

                    {/* Live Banner Ad Visual */}
                    <div
                      className={`relative w-full overflow-hidden bg-slate-900 flex flex-col justify-between p-5 ${
                        aspectRatio === '1:1'
                          ? 'aspect-square'
                          : aspectRatio === '4:5'
                          ? 'aspect-[4/5]'
                          : 'aspect-[1.91/1]'
                      }`}
                    >
                      {/* Background Visual */}
                      <img
                        src={content.imageUrl}
                        alt="Event Banner Visual"
                        className="absolute inset-0 w-full h-full object-cover select-none"
                      />

                      {/* Theme Gradient Overlay */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            content.overlayGradient === 'bottom-up'
                              ? `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.15) 100%)`
                              : `radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)`,
                          opacity: content.overlayOpacity / 100,
                        }}
                      />

                      {/* Top Badges inside Visual */}
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
                          {content.categoryTag}
                        </span>
                        {content.badgeText && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-500 text-slate-950 shadow-md">
                            {content.badgeText}
                          </span>
                        )}
                      </div>

                      {/* Bottom Banner Content inside Visual */}
                      <div className="relative z-10 space-y-2">
                        <h4 className="text-lg font-black text-white leading-tight drop-shadow-md">
                          {content.headline}
                        </h4>
                        <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed drop-shadow">
                          {content.subheadline}
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300 drop-shadow">
                            {content.pricingText}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-white text-slate-950 font-black text-[11px] shadow-lg flex items-center gap-1">
                            {content.ctaText} →
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Instagram Bottom Action Bar */}
                    <div className="px-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                          <button
                            onClick={handleToggleLike}
                            className={`transition-transform active:scale-125 cursor-pointer ${
                              liked ? 'text-red-500 fill-red-500' : 'text-slate-200'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                          </button>
                          <MessageCircle className="w-5 h-5 text-slate-200 cursor-pointer" />
                          <Send className="w-5 h-5 text-slate-200 cursor-pointer" />
                        </div>
                        <button
                          onClick={() => setSaved(!saved)}
                          className={`transition-colors cursor-pointer ${
                            saved ? 'text-teal-400 fill-teal-400' : 'text-slate-200'
                          }`}
                        >
                          <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Likes count */}
                      <p className="font-bold text-xs text-white">
                        {likeCount.toLocaleString()} likes
                      </p>

                      {/* Caption Snippet */}
                      <div className="text-[11px] text-slate-200 space-y-1">
                        <p className="line-clamp-3">
                          <span className="font-bold text-white mr-1.5">{cleanHandle}</span>
                          {caption}
                        </p>
                        <button
                          onClick={() => setIsEditingCaption(true)}
                          className="text-slate-400 text-[10px] hover:text-white"
                        >
                          View full caption / Edit copy...
                        </button>
                      </div>

                      <div className="text-[10px] text-slate-500">
                        View all 68 comments • 2 hours ago
                      </div>
                    </div>
                  </div>
                ) : (
                  /* LINKEDIN MOBILE INTERFACE */
                  <div className="space-y-3">
                    {/* LinkedIn Header */}
                    <div className="px-3.5 py-1.5 flex items-center justify-between border-b border-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#0077b5] text-white flex items-center justify-center font-bold text-xs">
                          in
                        </div>
                        <span className="font-bold text-slate-200 text-xs">Feed</span>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-slate-400" />
                    </div>

                    {/* Author Box */}
                    <div className="px-3.5 flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-md bg-teal-700 text-white font-mono font-black text-xs flex items-center justify-center shrink-0">
                        CE
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs truncate">
                            {content.brandName}
                          </span>
                          <span className="text-[10px] font-bold text-sky-400 hover:underline cursor-pointer">
                            + Follow
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <span>34,180 followers</span>
                          <span>•</span>
                          <span>Promoted</span>
                          <Globe className="w-2.5 h-2.5 text-slate-500" />
                        </div>
                      </div>
                    </div>

                    {/* LinkedIn Copy */}
                    <div className="px-3.5 text-[11px] text-slate-200 leading-relaxed space-y-1.5">
                      <p className="line-clamp-4 whitespace-pre-line">{caption}</p>
                    </div>

                    {/* Banner Media Card */}
                    <div className="border-y border-slate-800 bg-slate-900 overflow-hidden">
                      <div
                        className={`relative w-full overflow-hidden ${
                          aspectRatio === '1:1'
                            ? 'aspect-square'
                            : aspectRatio === '4:5'
                            ? 'aspect-[4/5]'
                            : 'aspect-[1.91/1]'
                        }`}
                      >
                        <img
                          src={content.imageUrl}
                          alt="Banner Ad"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-4 flex flex-col justify-end">
                          <span className="text-[10px] font-black uppercase text-teal-300">
                            {content.categoryTag}
                          </span>
                          <h4 className="text-sm font-black text-white leading-tight">
                            {content.headline}
                          </h4>
                        </div>
                      </div>

                      {/* Link Preview Bar */}
                      <div className="p-3 bg-slate-900/90 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-400 block truncate">
                            campusevents.edu
                          </span>
                          <span className="font-bold text-white text-xs truncate block">
                            {content.headline}
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded bg-[#0077b5] text-white font-bold text-[11px] shrink-0">
                          {content.ctaText}
                        </span>
                      </div>
                    </div>

                    {/* LinkedIn Reaction Counts */}
                    <div className="px-3.5 flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1">
                        <span className="flex -space-x-1">
                          <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] text-white">👍</span>
                          <span className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[8px] text-white">👏</span>
                          <span className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-[8px] text-white">❤️</span>
                        </span>
                        <span className="font-bold text-slate-300 ml-1">
                          {linkedinReactionCount}
                        </span>
                      </div>
                      <span>72 comments • 31 reposts</span>
                    </div>

                    {/* LinkedIn Action Buttons */}
                    <div className="px-2 py-1.5 border-t border-slate-900 grid grid-cols-4 gap-1 text-[10px] font-semibold text-slate-400 text-center">
                      <button
                        onClick={() => {
                          setLinkedinReactionCount((c) => c + 1);
                        }}
                        className="p-1 hover:bg-slate-800 rounded flex items-center justify-center gap-1 text-sky-400"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Like</span>
                      </button>
                      <button className="p-1 hover:bg-slate-800 rounded flex items-center justify-center gap-1 hover:text-white">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Comment</span>
                      </button>
                      <button className="p-1 hover:bg-slate-800 rounded flex items-center justify-center gap-1 hover:text-white">
                        <Repeat2 className="w-3.5 h-3.5" />
                        <span>Repost</span>
                      </button>
                      <button className="p-1 hover:bg-slate-800 rounded flex items-center justify-center gap-1 hover:text-white">
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Desktop Feed Card View */
            <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              {platform === 'instagram' ? (
                /* INSTAGRAM DESKTOP CARD */
                <div>
                  <div className="p-4 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-mono font-black text-teal-400 text-xs">
                          CE
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm">
                            {cleanHandle}
                          </span>
                          <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black">
                            ✓
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Main Campus Auditorium • Sponsored
                        </span>
                      </div>
                    </div>
                    <MoreHorizontal className="w-5 h-5 text-slate-400" />
                  </div>

                  {/* Visual */}
                  <div
                    className={`relative w-full overflow-hidden bg-slate-950 flex flex-col justify-between p-8 ${
                      aspectRatio === '1:1'
                        ? 'aspect-square'
                        : aspectRatio === '4:5'
                        ? 'aspect-[4/5]'
                        : 'aspect-[1.91/1]'
                    }`}
                  >
                    <img
                      src={content.imageUrl}
                      alt="Banner Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)`,
                        opacity: content.overlayOpacity / 100,
                      }}
                    />

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
                        {content.categoryTag}
                      </span>
                      {content.badgeText && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-400 text-slate-950 shadow-md">
                          {content.badgeText}
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 space-y-3">
                      <h3 className="text-2xl font-black text-white leading-tight drop-shadow-md">
                        {content.headline}
                      </h3>
                      <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed drop-shadow">
                        {content.subheadline}
                      </p>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-sm font-bold text-amber-300">
                          {content.pricingText}
                        </span>
                        <span className="px-5 py-2 rounded-full bg-white text-slate-950 font-black text-xs shadow-xl flex items-center gap-1.5">
                          {content.ctaText} →
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Caption */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handleToggleLike}
                          className={`cursor-pointer ${
                            liked ? 'text-red-500 fill-red-500' : 'text-slate-300'
                          }`}
                        >
                          <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
                        </button>
                        <MessageCircle className="w-6 h-6 text-slate-300 cursor-pointer" />
                        <Send className="w-6 h-6 text-slate-300 cursor-pointer" />
                      </div>
                      <Bookmark
                        onClick={() => setSaved(!saved)}
                        className={`w-6 h-6 cursor-pointer ${
                          saved ? 'text-teal-400 fill-teal-400' : 'text-slate-300'
                        }`}
                      />
                    </div>

                    <p className="font-bold text-sm text-white">
                      {likeCount.toLocaleString()} likes
                    </p>

                    <div className="text-xs text-slate-300 space-y-1.5">
                      <p className="whitespace-pre-line leading-relaxed">
                        <span className="font-bold text-white mr-1.5">{cleanHandle}</span>
                        {caption}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
                      <span>View all 84 comments</span>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* LINKEDIN DESKTOP CARD */
                <div>
                  <div className="p-5 flex items-center gap-3.5 border-b border-slate-800">
                    <div className="w-12 h-12 rounded-lg bg-teal-800 text-white font-mono font-black text-base flex items-center justify-center shrink-0">
                      CE
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">
                          {content.brandName}
                        </span>
                        <button className="px-3 py-1 rounded text-xs font-bold text-sky-400 hover:bg-sky-950/40 border border-sky-500/30">
                          + Follow
                        </button>
                      </div>
                      <span className="text-xs text-slate-400 block">
                        42,810 followers • Promoted • 🌐
                      </span>
                    </div>
                  </div>

                  <div className="p-5 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {caption}
                  </div>

                  {/* Banner Link Embed */}
                  <div className="border-y border-slate-800">
                    <div
                      className={`relative w-full overflow-hidden ${
                        aspectRatio === '1:1'
                          ? 'aspect-square'
                          : aspectRatio === '4:5'
                          ? 'aspect-[4/5]'
                          : 'aspect-[1.91/1]'
                      }`}
                    >
                      <img
                        src={content.imageUrl}
                        alt="Event Banner Visual"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent p-6 flex flex-col justify-end">
                        <span className="text-xs font-black uppercase text-teal-300">
                          {content.categoryTag}
                        </span>
                        <h4 className="text-xl font-black text-white leading-tight">
                          {content.headline}
                        </h4>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-slate-400 block">campusevents.edu</span>
                        <span className="font-bold text-white text-sm block">
                          {content.headline}
                        </span>
                      </div>
                      <span className="px-4 py-2 rounded-lg bg-[#0077b5] text-white font-bold text-xs shrink-0 shadow">
                        {content.ctaText}
                      </span>
                    </div>
                  </div>

                  {/* Reactions Bar */}
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="flex -space-x-1">
                        <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white">👍</span>
                        <span className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] text-white">👏</span>
                        <span className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-[10px] text-white">❤️</span>
                      </span>
                      <span className="font-bold text-slate-300 ml-1">
                        {linkedinReactionCount}
                      </span>
                    </div>
                    <span>89 comments • 42 reposts</span>
                  </div>

                  <div className="p-2 grid grid-cols-4 gap-2 text-xs font-semibold text-slate-300 text-center">
                    <button
                      onClick={() => setLinkedinReactionCount((c) => c + 1)}
                      className="py-2 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-2 text-sky-400"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Like</span>
                    </button>
                    <button className="py-2 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-2 hover:text-white">
                      <MessageCircle className="w-4 h-4" />
                      <span>Comment</span>
                    </button>
                    <button className="py-2 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-2 hover:text-white">
                      <Repeat2 className="w-4 h-4" />
                      <span>Repost</span>
                    </button>
                    <button className="py-2 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-2 hover:text-white">
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Copy & Social Customizer Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Caption Customizer Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Social Post Copy & Hashtags</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                {platform}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Customize caption and hashtags before copying to your social management tool or phone.
            </p>

            <textarea
              rows={8}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono leading-relaxed"
              placeholder="Write post caption..."
            />

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCaption}
                className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition-all cursor-pointer"
              >
                {copiedCaption ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCaption ? 'Copied to Clipboard!' : 'Copy Caption & Tags'}</span>
              </button>

              <button
                onClick={() =>
                  setCaption(platform === 'instagram' ? defaultInstaCaption : defaultLinkedinCaption)
                }
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
                title="Reset to default copy"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Social Specifications Info Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
              Platform Specs & Best Practices
            </h4>

            {platform === 'instagram' ? (
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Square (1080×1080)</strong> is ideal for standard feed carousels.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Portrait (1080×1350, 4:5)</strong> takes up 20% more mobile screen space for higher click rates.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                  <span>
                    Keep text overlay in upper 70% to avoid bottom caption truncation.
                  </span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                  <span>
                    <strong>Landscape (1200×627, 1.91:1)</strong> is the standard preview ratio for LinkedIn link posts.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                  <span>
                    Include 3–5 industry hashtags (#HigherEducation #CampusEvents) to reach student networks.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                  <span>
                    Lead with a clear headline and date so students can register with 1 click.
                  </span>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
