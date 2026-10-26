import { BannerContent } from '../types/banner';

export const encodeBannerContent = (content: BannerContent): string => {
  try {
    const jsonString = JSON.stringify(content);
    return btoa(unescape(encodeURIComponent(jsonString)));
  } catch (error) {
    console.error('Failed to encode banner content:', error);
    return '';
  }
};

export const decodeBannerContent = (encoded: string): BannerContent | null => {
  try {
    const jsonString = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(jsonString) as BannerContent;
  } catch (error) {
    console.error('Failed to decode banner content:', error);
    return null;
  }
};
