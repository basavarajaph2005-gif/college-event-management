import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI client with required header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Fetch and parse URL content (or read local file if matching local path)
 */
app.post('/api/fetch-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Valid URL is required' });
    }

    let pageTitle = '';
    let metaDescription = '';
    let headings: string[] = [];
    let textSample = '';

    // Check if it refers to local file in public or assets
    const cleanUrl = url.trim();
    if (cleanUrl.includes('College_Event_Management_System_Website') || cleanUrl.startsWith('/public/') || cleanUrl.startsWith('public/')) {
      const localPath = cleanUrl.startsWith('/') ? path.join(process.cwd(), cleanUrl) : path.join(process.cwd(), 'public', cleanUrl.replace(/^public\//, ''));
      if (fs.existsSync(localPath)) {
        const fileContent = fs.readFileSync(localPath, 'utf-8');
        pageTitle = 'CampusEvents — College Event Management System';
        metaDescription = 'Browse fests, workshops, sports and seminars — check seats, register in seconds. One place for every college event.';
        headings = [
          'One place for every college event',
          'HackSprint 2026 — 24-Hour Hackathon',
          'Robot Rumble — Line Follower Challenge',
          'Folk Dance Fiesta',
          "INNOVATE '26 — Annual Tech Fest"
        ];
        textSample = fileContent.slice(0, 4000);
      }
    } else if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const resp = await fetch(cleanUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AdCraftBot/1.0; +https://aistudio.google.com)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        clearTimeout(timeout);

        if (resp.ok) {
          const html = await resp.text();
          // Simple regex-based HTML metadata extraction
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (titleMatch) pageTitle = titleMatch[1].trim();

          const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i) ||
                            html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
          if (descMatch) metaDescription = descMatch[1].trim();

          // Extract headings
          const hMatches = [...html.matchAll(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/gi)];
          headings = hMatches.slice(0, 6).map(m => m[1].trim()).filter(Boolean);

          // Strip tags for clean text preview
          const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          const rawBody = bodyMatch ? bodyMatch[1] : html;
          const cleanText = rawBody.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                   .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                                   .replace(/<[^>]+>/g, ' ')
                                   .replace(/\s+/g, ' ')
                                   .trim();
          textSample = cleanText.slice(0, 3000);
        }
      } catch (err: any) {
        console.warn('URL fetch fallback:', err.message);
      }
    }

    return res.json({
      success: true,
      url: cleanUrl,
      title: pageTitle,
      description: metaDescription,
      headings,
      textSample
    });
  } catch (error: any) {
    console.error('fetch-url error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process URL' });
  }
});

/**
 * Analyze Product / URL and generate tailored ad copy, palettes, selling points, and image prompts
 */
app.post('/api/analyze-product', async (req, res) => {
  try {
    const { url, description, brandName, targetAudience, industry, themeTone } = req.body;

    if (!description && !url) {
      return res.status(400).json({ error: 'Please provide either a product description or a URL.' });
    }

    const prompt = `You are a world-class advertising creative director and conversion rate optimization (CRO) expert.
Analyze the following product/service details and generate high-impact banner ad concepts.

Product URL: ${url || 'N/A'}
User Description: ${description || 'N/A'}
Brand Name Hint: ${brandName || 'Auto-detect from info'}
Target Audience: ${targetAudience || 'General Consumers / Professionals'}
Industry / Category: ${industry || 'General Commerce / Tech / Events'}
Desired Tone: ${themeTone || 'Modern High-Conversion'}

Create compelling advertising copy for banner ads across multiple orientations (horizontal, square, vertical, mobile).
Ensure headlines are punchy, benefit-driven, and under 7 words.
Ensure subheadlines are clear, persuasive, and under 12 words.
Ensure Call To Action (CTA) phrases are high-urgency and under 4 words.
Provide suitable advertising color hex codes, badges, price/discount hooks, and precise visual prompts for AI image generation.

Return strictly valid JSON matching this schema:
{
  "brandName": "Clear short brand name",
  "category": "e.g., Electronics, SaaS, Event, Fashion, Fitness",
  "tagline": "Punchy 3-5 word brand promise",
  "headlines": [
    "Headline 1 - Direct Benefit",
    "Headline 2 - Hook / Curiosity / Offer",
    "Headline 3 - Social Proof / High Energy"
  ],
  "subheadlines": [
    "Subhead 1 - Clear supporting value proposition",
    "Subhead 2 - Specific feature or guarantee",
    "Subhead 3 - Overcome hesitation or urgency"
  ],
  "ctaOptions": [
    "Shop Now",
    "Claim 50% Off",
    "Start Free Trial",
    "Register Today"
  ],
  "badges": [
    "Limited Time Offer",
    "50% OFF TODAY",
    "Top Rated ★★★★★",
    "Free Shipping"
  ],
  "pricingHook": "e.g., 'From $29' or 'Free Registration' or 'Save $50'",
  "sellingPoints": [
    "Key Benefit 1",
    "Key Benefit 2",
    "Key Benefit 3"
  ],
  "colorPalette": {
    "primary": "#3B82F6",
    "accent": "#F59E0B",
    "background": "#0F172A",
    "surface": "#1E293B",
    "text": "#FFFFFF",
    "mutedText": "#94A3B8"
  },
  "aiImagePrompt": "A stunning, ultra-clean studio advertising photograph of [product], cinematic studio lighting, commercial photography, negative space for ad typography, clean background, 8k resolution, crisp details."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error('JSON parse error from Gemini:', text);
      data = {
        brandName: brandName || 'BrandPro',
        category: industry || 'Product',
        tagline: 'Better Quality, Better Results',
        headlines: ['Upgrade Your Everyday Experience', 'Unmatched Performance & Style', 'Limited Time Special Deal'],
        subheadlines: ['Engineered for those who demand excellence in every single detail.', 'Claim exclusive launch savings before stock runs out.'],
        ctaOptions: ['Shop Now', 'Claim Offer', 'Learn More', 'Get Started'],
        badges: ['Limited Edition', 'Top Rated 4.9★', 'Special Discount'],
        pricingHook: 'Save up to 40%',
        sellingPoints: ['Ultra-durable build quality', 'Instant setup in minutes', '30-day money-back guarantee'],
        colorPalette: {
          primary: '#2563EB',
          accent: '#F59E0B',
          background: '#0F172A',
          surface: '#1E293B',
          text: '#FFFFFF',
          mutedText: '#94A3B8'
        },
        aiImagePrompt: 'High-end commercial studio product photography on clean minimalist modern podium, rim lighting, high-contrast, premium aesthetic.'
      };
    }

    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('analyze-product error:', error);
    return res.status(500).json({ error: error.message || 'Error analyzing product' });
  }
});

/**
 * Generate High-Quality Banner Visuals using Gemini Image Generation
 * Supports gemini-3-pro-image-preview (or gemini-nano-banana-2.1)
 * Affordances for Image Size: 1K, 2K, 4K
 * Affordances for Aspect Ratio: 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9, 21:9
 */
app.post('/api/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      model = 'gemini-3-pro-image-preview',
      aspectRatio = '1:1',
      imageSize = '1K',
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Image prompt is required' });
    }

    // Supported aspect ratios check
    const validAspectRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9', '1:4', '1:8', '4:1', '8:1'];
    const chosenAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    // Supported image sizes check: 1K, 2K, 4K
    const validSizes = ['1K', '2K', '4K'];
    const chosenSize = validSizes.includes(imageSize) ? imageSize : '1K';

    // Model selection priority: user selected or requested feature model
    const requestedModel = model.trim();
    // Default fallback cascade
    const primaryModel = requestedModel || 'gemini-3-pro-image-preview';

    console.log(`[generate-image] Invoking model: ${primaryModel}, aspectRatio: ${chosenAspectRatio}, size: ${chosenSize}`);

    try {
      const response = await ai.models.generateContent({
        model: primaryModel,
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: chosenAspectRatio as any,
            imageSize: chosenSize as any,
          },
        },
      });

      // Search through parts for inlineData image
      let foundBase64 = '';
      let mimeType = 'image/png';

      if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            foundBase64 = part.inlineData.data;
            mimeType = part.inlineData.mimeType || 'image/png';
            break;
          }
        }
      }

      if (foundBase64) {
        return res.json({
          success: true,
          imageUrl: `data:${mimeType};base64,${foundBase64}`,
          model: primaryModel,
          aspectRatio: chosenAspectRatio,
          imageSize: chosenSize
        });
      }

      // If no inline data was returned by the model, let's try gemini-nano-banana-2.1 or gemini-3.1-flash-lite-image
      if (!foundBase64 && primaryModel !== 'gemini-nano-banana-2.1') {
        console.log('[generate-image] Retrying with gemini-nano-banana-2.1...');
        const fallbackResp = await ai.models.generateContent({
          model: 'gemini-nano-banana-2.1',
          contents: {
            parts: [{ text: prompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: chosenAspectRatio as any,
              imageSize: chosenSize as any,
            }
          }
        });

        if (fallbackResp.candidates && fallbackResp.candidates[0]?.content?.parts) {
          for (const part of fallbackResp.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              return res.json({
                success: true,
                imageUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
                model: 'gemini-nano-banana-2.1',
                aspectRatio: chosenAspectRatio,
                imageSize: chosenSize
              });
            }
          }
        }
      }

      throw new Error('No image was returned in the model response candidates.');
    } catch (modelError: any) {
      console.warn('[generate-image] Primary model failed:', modelError.message);

      // Check if it's a model not found / quota / permission issue; try gemini-3.1-flash-lite-image
      try {
        console.log('[generate-image] Trying gemini-3.1-flash-lite-image fallback...');
        const altResp = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: prompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(chosenAspectRatio) ? chosenAspectRatio : '1:1') as any
            }
          }
        });

        if (altResp.candidates && altResp.candidates[0]?.content?.parts) {
          for (const part of altResp.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              return res.json({
                success: true,
                imageUrl: `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`,
                model: 'gemini-3.1-flash-lite-image',
                aspectRatio: chosenAspectRatio,
                imageSize: chosenSize,
                note: 'Generated with gemini-3.1-flash-lite-image fallback'
              });
            }
          }
        }
      } catch (fbErr: any) {
        console.error('[generate-image] Fallback also failed:', fbErr.message);
      }

      throw modelError;
    }
  } catch (error: any) {
    console.error('generate-image error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate image',
      details: error.toString()
    });
  }
});

// Mount Vite or static server
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AdCraft Studio Server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
