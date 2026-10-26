export type AspectRatioOption = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageSizeOption = '1K' | '2K' | '4K';
export type ImageModelOption = 'gemini-3-pro-image-preview' | 'gemini-nano-banana-2.1' | 'gemini-3.1-flash-lite-image';

export interface BannerSize {
  id: string;
  name: string;
  width: number;
  height: number;
  category: 'iab' | 'mobile' | 'social';
  aspectRatioLabel: string;
  description: string;
  recommendedAspect: AspectRatioOption;
  layoutType: 'horizontal' | 'vertical' | 'square' | 'compact-mobile' | 'story' | 'billboard';
  popular?: boolean;
}

export interface BannerContent {
  brandName: string;
  categoryTag: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  badgeText: string;
  pricingText: string;
  disclaimer: string;
  imageUrl?: string;
  overlayOpacity: number; // 0 to 100
  overlayGradient: 'dark-fade' | 'bottom-up' | 'radial' | 'side-scrim' | 'minimal';
  themeId: string;
  fontFamily: 'sans' | 'display' | 'serif' | 'mono';
  buttonStyle: 'pill-glow' | 'rounded-bold' | 'minimal-arrow' | 'sharp-neon';
  customColors?: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

export interface AdTheme {
  id: string;
  name: string;
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  gradient: string;
  tagBg: string;
  ctaBg: string;
  ctaText: string;
}

export interface ProductPreset {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  brandName: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  badgeText: string;
  pricingText: string;
  disclaimer: string;
  themeId: string;
  defaultImageUrl?: string;
  imagePrompt: string;
}
