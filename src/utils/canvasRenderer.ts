import { BannerSize, BannerContent, AdTheme } from '../types/banner';
import JSZip from 'jszip';

/**
 * Render a banner onto an HTML5 Canvas at exact pixel dimensions
 */
export async function renderBannerToCanvas(
  size: BannerSize,
  content: BannerContent,
  theme: AdTheme,
  scale: number = 1
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(size.width * scale);
  canvas.height = Math.round(size.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d canvas context');

  ctx.scale(scale, scale);
  const w = size.width;
  const h = size.height;

  // Background Fill
  ctx.fillStyle = theme.background;
  ctx.fillRect(0, 0, w, h);

  // Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, theme.background);
  bgGrad.addColorStop(0.5, theme.surface);
  bgGrad.addColorStop(1, theme.background);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Draw Image if present
  if (content.imageUrl) {
    try {
      const img = await loadImage(content.imageUrl);
      ctx.save();
      
      // Determine cover positioning
      const imgRatio = img.width / img.height;
      const targetRatio = w / h;
      let drawW = w;
      let drawH = h;
      let drawX = 0;
      let drawY = 0;

      if (imgRatio > targetRatio) {
        drawW = h * imgRatio;
        drawX = (w - drawW) / 2;
      } else {
        drawH = w / imgRatio;
        drawY = (h - drawH) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Draw dark overlay / scrim for typography readability
      const opacity = content.overlayOpacity / 100;
      ctx.save();
      if (content.overlayGradient === 'bottom-up') {
        const scrim = ctx.createLinearGradient(0, 0, 0, h);
        scrim.addColorStop(0, `rgba(0, 0, 0, ${opacity * 0.3})`);
        scrim.addColorStop(0.5, `rgba(0, 0, 0, ${opacity * 0.7})`);
        scrim.addColorStop(1, `rgba(0, 0, 0, ${opacity * 0.95})`);
        ctx.fillStyle = scrim;
      } else if (content.overlayGradient === 'side-scrim' || size.layoutType === 'horizontal') {
        const scrim = ctx.createLinearGradient(0, 0, w, 0);
        scrim.addColorStop(0, `rgba(0, 0, 0, ${opacity * 0.9})`);
        scrim.addColorStop(0.65, `rgba(0, 0, 0, ${opacity * 0.5})`);
        scrim.addColorStop(1, `rgba(0, 0, 0, ${opacity * 0.2})`);
        ctx.fillStyle = scrim;
      } else {
        // dark-fade default
        const scrim = ctx.createLinearGradient(0, 0, 0, h);
        scrim.addColorStop(0, `rgba(0, 0, 0, ${opacity * 0.6})`);
        scrim.addColorStop(1, `rgba(0, 0, 0, ${opacity * 0.85})`);
        ctx.fillStyle = scrim;
      }
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    } catch (e) {
      console.warn('Canvas image render fallback:', e);
    }
  }

  // Draw border outline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

  // Render Layout Elements based on size
  renderLayout(ctx, size, content, theme);

  return canvas;
}

/**
 * Load image helper with crossOrigin support
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

/**
 * Format and render layout text and CTA depending on layout classification
 */
function renderLayout(
  ctx: CanvasRenderingContext2D,
  size: BannerSize,
  content: BannerContent,
  theme: AdTheme
) {
  const w = size.width;
  const h = size.height;
  const fontFam = content.fontFamily === 'serif' ? 'Playfair Display, serif' :
                  content.fontFamily === 'display' ? 'Outfit, sans-serif' :
                  'Plus Jakarta Sans, sans-serif';

  // 1. HORIZONTAL BANNERS (728x90, 970x90)
  if (size.layoutType === 'horizontal') {
    const padX = Math.round(w * 0.025);
    const midY = h / 2;

    // Brand tag on left
    ctx.fillStyle = theme.primary;
    ctx.font = `bold 11px ${fontFam}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(content.brandName.toUpperCase(), padX, 16);

    // Badge
    if (content.badgeText && h >= 90) {
      ctx.fillStyle = theme.accent;
      ctx.font = `bold 10px ${fontFam}`;
      ctx.fillText(`• ${content.badgeText}`, padX + ctx.measureText(content.brandName.toUpperCase()).width + 12, 17);
    }

    // Main Headline
    ctx.fillStyle = theme.text;
    const headlineSize = h <= 60 ? 14 : 19;
    ctx.font = `bold ${headlineSize}px ${fontFam}`;
    ctx.textBaseline = 'middle';
    
    // Fit headline length
    const maxHeadW = w * 0.52;
    const truncatedHead = fitText(ctx, content.headline, maxHeadW);
    ctx.fillText(truncatedHead, padX, midY + 4);

    // Subhead if height allows
    if (h >= 90 && content.subheadline) {
      ctx.fillStyle = theme.mutedText;
      ctx.font = `11px ${fontFam}`;
      ctx.textBaseline = 'bottom';
      const maxSubW = w * 0.52;
      ctx.fillText(fitText(ctx, content.subheadline, maxSubW), padX, h - 14);
    }

    // CTA Button on right
    const ctaW = Math.min(150, Math.round(w * 0.2));
    const ctaH = Math.min(38, Math.round(h * 0.5));
    const ctaX = w - ctaW - padX;
    const ctaY = midY - ctaH / 2;

    drawButton(ctx, ctaX, ctaY, ctaW, ctaH, content.ctaText, theme, content.buttonStyle, fontFam);

    // Price tag if present
    if (content.pricingText && h >= 90) {
      ctx.fillStyle = theme.accent;
      ctx.font = `bold 12px ${fontFam}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(content.pricingText, ctaX - 14, midY);
    }
    return;
  }

  // 2. COMPACT MOBILE (320x50, 320x100)
  if (size.layoutType === 'compact-mobile') {
    const pad = 10;
    const midY = h / 2;

    // Left info
    ctx.fillStyle = theme.accent;
    ctx.font = `bold 9px ${fontFam}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(content.brandName.toUpperCase(), pad, 8);

    ctx.fillStyle = theme.text;
    ctx.font = `bold ${h <= 60 ? 12 : 15}px ${fontFam}`;
    ctx.textBaseline = h <= 60 ? 'bottom' : 'middle';
    const maxHeadW = w * 0.55;
    ctx.fillText(fitText(ctx, content.headline, maxHeadW), pad, h <= 60 ? h - 8 : midY + 4);

    if (h >= 90 && content.subheadline) {
      ctx.fillStyle = theme.mutedText;
      ctx.font = `10px ${fontFam}`;
      ctx.textBaseline = 'bottom';
      ctx.fillText(fitText(ctx, content.subheadline, maxHeadW), pad, h - 10);
    }

    // Right CTA
    const ctaW = 86;
    const ctaH = h <= 60 ? 30 : 34;
    const ctaX = w - ctaW - pad;
    const ctaY = midY - ctaH / 2;
    drawButton(ctx, ctaX, ctaY, ctaW, ctaH, content.ctaText, theme, content.buttonStyle, fontFam, 11);
    return;
  }

  // 3. VERTICAL SKYSCRAPER (160x600, 120x600, 300x600)
  if (size.layoutType === 'vertical') {
    const pad = Math.round(w * 0.08);

    // Brand on top
    ctx.fillStyle = theme.primary;
    ctx.font = `bold 12px ${fontFam}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(content.brandName.toUpperCase(), w / 2, 22);

    // Badge
    let curY = 46;
    if (content.badgeText) {
      const badgeW = Math.min(w - 20, 140);
      drawBadge(ctx, (w - badgeW) / 2, curY, badgeW, 22, content.badgeText, theme, fontFam);
      curY += 34;
    }

    // Headline
    ctx.fillStyle = theme.text;
    const headFontSize = w <= 140 ? 17 : w <= 200 ? 21 : 28;
    ctx.font = `bold ${headFontSize}px ${fontFam}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const words = content.headline.split(' ');
    let line = '';
    const maxLines = 5;
    let linesDrawn = 0;
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > w - pad * 2 && line !== '') {
        ctx.fillText(line.trim(), w / 2, curY);
        curY += headFontSize * 1.25;
        line = words[i] + ' ';
        linesDrawn++;
        if (linesDrawn >= maxLines) break;
      } else {
        line = test;
      }
    }
    if (line && linesDrawn < maxLines) {
      ctx.fillText(line.trim(), w / 2, curY);
      curY += headFontSize * 1.25;
    }

    // Subhead
    if (content.subheadline && h >= 500) {
      curY += 10;
      ctx.fillStyle = theme.mutedText;
      ctx.font = `${w <= 140 ? 11 : 13}px ${fontFam}`;
      const subWords = content.subheadline.split(' ');
      let subLine = '';
      for (let i = 0; i < subWords.length && curY < h - 160; i++) {
        const test = subLine + subWords[i] + ' ';
        if (ctx.measureText(test).width > w - pad * 2) {
          ctx.fillText(subLine.trim(), w / 2, curY);
          curY += 16;
          subLine = subWords[i] + ' ';
        } else {
          subLine = test;
        }
      }
      if (subLine && curY < h - 160) {
        ctx.fillText(subLine.trim(), w / 2, curY);
      }
    }

    // Pricing Hook
    if (content.pricingText) {
      ctx.fillStyle = theme.accent;
      ctx.font = `bold ${w <= 140 ? 15 : 18}px ${fontFam}`;
      ctx.textAlign = 'center';
      ctx.fillText(content.pricingText, w / 2, h - 110);
    }

    // Bottom CTA
    const ctaW = Math.round(w - pad * 2);
    const ctaH = Math.min(46, Math.max(36, Math.round(h * 0.07)));
    const ctaX = pad;
    const ctaY = h - ctaH - 36;
    drawButton(ctx, ctaX, ctaY, ctaW, ctaH, content.ctaText, theme, content.buttonStyle, fontFam, w <= 140 ? 12 : 14);

    // Disclaimer
    if (content.disclaimer) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = `9px ${fontFam}`;
      ctx.textAlign = 'center';
      ctx.fillText(fitText(ctx, content.disclaimer, w - 16), w / 2, h - 16);
    }
    return;
  }

  // 4. STORY / FULLSCREEN (1080x1920)
  if (size.layoutType === 'story') {
    const pad = 80;
    let curY = 120;

    // Top Brand & Category Tag
    ctx.fillStyle = theme.accent;
    ctx.font = `bold 32px ${fontFam}`;
    ctx.textAlign = 'center';
    ctx.fillText(content.brandName.toUpperCase(), w / 2, curY);
    curY += 70;

    if (content.badgeText) {
      const bW = 420;
      drawBadge(ctx, (w - bW) / 2, curY, bW, 58, content.badgeText, theme, fontFam, 24);
      curY += 120;
    }

    // Massive headline in upper middle
    ctx.fillStyle = theme.text;
    const headSize = 82;
    ctx.font = `bold ${headSize}px ${fontFam}`;
    ctx.textAlign = 'center';

    const words = content.headline.split(' ');
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > w - pad * 2) {
        ctx.fillText(line.trim(), w / 2, curY);
        curY += headSize * 1.25;
        line = words[i] + ' ';
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line.trim(), w / 2, curY);
      curY += headSize * 1.25;
    }

    // Subhead
    if (content.subheadline) {
      curY += 40;
      ctx.fillStyle = theme.mutedText;
      ctx.font = `38px ${fontFam}`;
      const subWords = content.subheadline.split(' ');
      let sLine = '';
      for (let i = 0; i < subWords.length; i++) {
        const test = sLine + subWords[i] + ' ';
        if (ctx.measureText(test).width > w - pad * 2) {
          ctx.fillText(sLine.trim(), w / 2, curY);
          curY += 54;
          sLine = subWords[i] + ' ';
        } else {
          sLine = test;
        }
      }
      if (sLine) {
        ctx.fillText(sLine.trim(), w / 2, curY);
      }
    }

    // Price
    if (content.pricingText) {
      ctx.fillStyle = theme.accent;
      ctx.font = `bold 54px ${fontFam}`;
      ctx.textAlign = 'center';
      ctx.fillText(content.pricingText, w / 2, h - 380);
    }

    // Bottom Big Swipe/Tap Button
    const ctaW = w - pad * 2;
    const ctaH = 120;
    const ctaX = pad;
    const ctaY = h - ctaH - 180;
    drawButton(ctx, ctaX, ctaY, ctaW, ctaH, `${content.ctaText} →`, theme, content.buttonStyle, fontFam, 40);

    // Disclaimer
    if (content.disclaimer) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = `24px ${fontFam}`;
      ctx.textAlign = 'center';
      ctx.fillText(content.disclaimer, w / 2, h - 80);
    }
    return;
  }

  // 5. SQUARE & RECTANGLES (300x250, 250x250, 336x280, 1080x1080)
  const isHighRes = w >= 800;
  const pad = Math.round(w * (isHighRes ? 0.08 : 0.06));
  let curY = Math.round(h * (isHighRes ? 0.07 : 0.06));

  // Top header row: Brand + Badge
  ctx.fillStyle = theme.primary;
  const brandSize = isHighRes ? 34 : Math.max(11, Math.round(w * 0.04));
  ctx.font = `bold ${brandSize}px ${fontFam}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(content.brandName.toUpperCase(), pad, curY);

  if (content.badgeText) {
    const badgeH = isHighRes ? 38 : 20;
    const badgeW = isHighRes ? 320 : Math.min(140, Math.round(w * 0.44));
    drawBadge(ctx, w - badgeW - pad, curY - 2, badgeW, badgeH, content.badgeText, theme, fontFam, isHighRes ? 18 : 10);
  }

  curY += isHighRes ? 75 : Math.round(h * 0.12);

  // Headline
  ctx.fillStyle = theme.text;
  const headSize = isHighRes ? 64 : Math.max(16, Math.min(23, Math.round(w * 0.07)));
  ctx.font = `bold ${headSize}px ${fontFam}`;
  ctx.textAlign = 'left';

  const words = content.headline.split(' ');
  let line = '';
  let linesCount = 0;
  for (let i = 0; i < words.length && linesCount < 3; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > w - pad * 2) {
      ctx.fillText(line.trim(), pad, curY);
      curY += headSize * 1.22;
      line = words[i] + ' ';
      linesCount++;
    } else {
      line = test;
    }
  }
  if (line && linesCount < 3) {
    ctx.fillText(line.trim(), pad, curY);
    curY += headSize * 1.22;
  }

  // Subheadline
  if (content.subheadline && h >= 220) {
    curY += isHighRes ? 24 : 6;
    ctx.fillStyle = theme.mutedText;
    const subSize = isHighRes ? 30 : Math.max(11, Math.round(w * 0.038));
    ctx.font = `${subSize}px ${fontFam}`;
    
    const subWords = content.subheadline.split(' ');
    let sLine = '';
    let subLines = 0;
    for (let i = 0; i < subWords.length && subLines < 2; i++) {
      const test = sLine + subWords[i] + ' ';
      if (ctx.measureText(test).width > w - pad * 2) {
        ctx.fillText(sLine.trim(), pad, curY);
        curY += subSize * 1.25;
        sLine = subWords[i] + ' ';
        subLines++;
      } else {
        sLine = test;
      }
    }
    if (sLine && subLines < 2) {
      ctx.fillText(sLine.trim(), pad, curY);
    }
  }

  // Bottom row: Pricing on left, CTA on right
  const ctaH = isHighRes ? 84 : Math.min(42, Math.max(34, Math.round(h * 0.15)));
  const ctaW = isHighRes ? 340 : Math.min(150, Math.round(w * 0.46));
  const ctaY = h - ctaH - pad;
  const ctaX = w - ctaW - pad;

  drawButton(ctx, ctaX, ctaY, ctaW, ctaH, content.ctaText, theme, content.buttonStyle, fontFam, isHighRes ? 28 : 13);

  if (content.pricingText) {
    ctx.fillStyle = theme.accent;
    const priceSize = isHighRes ? 36 : Math.max(13, Math.round(w * 0.045));
    ctx.font = `bold ${priceSize}px ${fontFam}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(content.pricingText, pad, ctaY + ctaH / 2);
  }
}

/**
 * Truncate single line text with ellipsis
 */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 4 && ctx.measureText(t + '…').width > maxW) {
    t = t.slice(0, -1);
  }
  return t + '…';
}

/**
 * Draw pill badge
 */
function drawBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  theme: AdTheme,
  fontFam: string,
  fontSize: number = 10
) {
  ctx.save();
  ctx.fillStyle = theme.tagBg || 'rgba(255, 255, 255, 0.15)';
  const radius = h / 2;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();

  ctx.strokeStyle = theme.accent;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = theme.accent;
  ctx.font = `bold ${fontSize}px ${fontFam}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(fitText(ctx, text, w - 12), x + w / 2, y + h / 2);
  ctx.restore();
}

/**
 * Draw interactive-looking CTA button
 */
function drawButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  theme: AdTheme,
  style: BannerContent['buttonStyle'],
  fontFam: string,
  fontSize?: number
) {
  ctx.save();
  const radius = style === 'pill-glow' ? h / 2 : style === 'sharp-neon' ? 4 : 8;
  const fSize = fontSize || Math.round(h * 0.36);

  // Glow shadow
  if (style === 'pill-glow' || style === 'sharp-neon') {
    ctx.shadowColor = theme.ctaBg;
    ctx.shadowBlur = 12;
  }

  // Button background
  ctx.fillStyle = theme.ctaBg;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fill();

  // Reset shadow for text
  ctx.shadowBlur = 0;

  // Text
  ctx.fillStyle = theme.ctaText;
  ctx.font = `bold ${fSize}px ${fontFam}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(fitText(ctx, text, w - 14), x + w / 2, y + h / 2);

  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Export single banner as PNG file download
 */
export async function downloadBannerAsPng(
  size: BannerSize,
  content: BannerContent,
  theme: AdTheme,
  filename?: string
) {
  const canvas = await renderBannerToCanvas(size, content, theme, 2); // 2x DPI for ultra-crisp output
  const link = document.createElement('a');
  link.download = filename || `${content.brandName.toLowerCase().replace(/\s+/g, '_')}_${size.id}_${size.name.toLowerCase().replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Copy banner to clipboard as image
 */
export async function copyBannerToClipboard(
  size: BannerSize,
  content: BannerContent,
  theme: AdTheme
): Promise<boolean> {
  try {
    const canvas = await renderBannerToCanvas(size, content, theme, 2);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      });
    });
  } catch {
    return false;
  }
}

/**
 * Batch export all banners in a ZIP archive
 */
export async function exportAllBannersZip(
  sizes: BannerSize[],
  content: BannerContent,
  theme: AdTheme,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(`banners_${content.brandName.toLowerCase().replace(/\s+/g, '_')}`);

  for (let i = 0; i < sizes.length; i++) {
    const s = sizes[i];
    onProgress?.(i + 1, sizes.length);
    const subFolder = rootFolder?.folder(s.category);
    const canvas = await renderBannerToCanvas(s, content, theme, 2);
    const dataUrl = canvas.toDataURL('image/png');
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const filename = `${s.id}_${s.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    subFolder?.file(filename, base64Data, { base64: true });
  }

  // Add ad-spec manifest
  const manifest = {
    campaign: content.brandName,
    exportedAt: new Date().toISOString(),
    sizes: sizes.map(s => ({
      id: s.id,
      dimensions: `${s.width}x${s.height}`,
      type: s.name,
      category: s.category
    })),
    copy: {
      headline: content.headline,
      subheadline: content.subheadline,
      cta: content.ctaText,
      badge: content.badgeText,
      pricing: content.pricingText,
    }
  };
  folder?.file('manifest.json', JSON.stringify(manifest, null, 2));

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Generate Standalone HTML/CSS code snippet for embed
 */
export function generateBannerHtmlSnippet(
  size: BannerSize,
  content: BannerContent,
  theme: AdTheme
): string {
  return `<!-- College Event Banner: ${size.name} (${size.width}x${size.height}) -->
<div id="event-banner-${size.id}" style="
  width: ${size.width}px;
  height: ${size.height}px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, sans-serif;
  background: ${theme.gradient};
  color: ${theme.text};
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: ${size.layoutType === 'horizontal' ? 'row' : 'column'};
  align-items: center;
  justify-content: space-between;
  padding: ${Math.round(size.width * 0.04)}px;
  cursor: pointer;
">
  ${content.imageUrl ? `<img src="${content.imageUrl}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 1; opacity: ${1 - (content.overlayOpacity / 100)};" alt="${content.brandName}" />` : ''}
  <div style="position: relative; z-index: 2; width: 100%;">
    <div style="font-size: 11px; font-weight: 800; color: ${theme.accent}; text-transform: uppercase; margin-bottom: 4px;">
      ${content.brandName} • ${content.badgeText}
    </div>
    <div style="font-size: 18px; font-weight: 800; line-height: 1.15; color: ${theme.text}; margin-bottom: 6px;">
      ${content.headline}
    </div>
    <div style="font-size: 12px; color: ${theme.mutedText};">
      ${content.subheadline}
    </div>
  </div>
  <div style="position: relative; z-index: 2; margin-top: 10px;">
    <button style="
      background: ${theme.ctaBg};
      color: ${theme.ctaText};
      border: 0;
      padding: 10px 18px;
      font-weight: 800;
      font-size: 13px;
      border-radius: 999px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.3);
    ">
      ${content.ctaText} →
    </button>
  </div>
</div>`;
}
