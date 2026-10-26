import React, { useState } from 'react';
import {
  ImageModelOption,
  ImageSizeOption,
  AspectRatioOption,
  BannerContent,
} from '../types/banner';
import {
  Sparkles,
  X,
  Wand2,
  Image as ImageIcon,
  Check,
  RefreshCw,
  Layers,
  Sliders,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ImageGenModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: BannerContent;
  onApplyImage: (imageUrl: string) => void;
  defaultPrompt?: string;
}

export const ImageGenModal: React.FC<ImageGenModalProps> = ({
  isOpen,
  onClose,
  content,
  onApplyImage,
  defaultPrompt = '',
}) => {
  const [model, setModel] = useState<ImageModelOption>('gemini-3-pro-image-preview');
  const [imageSize, setImageSize] = useState<ImageSizeOption>('2K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('16:9');
  const [prompt, setPrompt] = useState(
    defaultPrompt ||
      `Ultra-clean commercial studio advertising photography of ${content.brandName || 'product'}, premium soft directional lighting, modern minimal staging, negative space for ad headline, 8k resolution, photorealistic`
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  if (!isOpen) return null;

  const aspectRatios: { id: AspectRatioOption; label: string; desc: string; icon: string }[] = [
    { id: '1:1', label: '1:1', desc: 'Square / Feed', icon: '■' },
    { id: '16:9', label: '16:9', desc: 'Wide Billboard', icon: '▬' },
    { id: '9:16', label: '9:16', desc: 'Story / Reel', icon: '▮' },
    { id: '4:3', label: '4:3', desc: 'Classic Display', icon: '▭' },
    { id: '3:4', label: '3:4', desc: 'Tall Feed', icon: '▯' },
    { id: '2:3', label: '2:3', desc: 'Skyscraper', icon: '▯' },
    { id: '3:2', label: '3:2', desc: 'Landscape', icon: '▭' },
    { id: '21:9', label: '21:9', desc: 'Ultra-wide Bar', icon: '━' },
  ];

  const imageSizes: { id: ImageSizeOption; label: string; note: string }[] = [
    { id: '1K', label: '1K', note: 'Fast & Sharp (1024px)' },
    { id: '2K', label: '2K', note: 'Studio Crisp (2048px)' },
    { id: '4K', label: '4K', note: 'Ultra HD Master (4096px)' },
  ];

  const stylePills = [
    'Clean Minimal Studio',
    'Dark Cinematic Cyberpunk',
    'Warm Golden Hour Sunset',
    'Floating 3D Glossy Objects',
    'Architectural Podium Stage',
    'Vibrant Neon Glow',
  ];

  const appendStyle = (style: string) => {
    setPrompt((prev) => `${prev.trim()}, ${style}`);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const resp = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model,
          aspectRatio,
          imageSize,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setHistory((prev) => [data.imageUrl, ...prev]);
      } else {
        throw new Error('No image was returned');
      }
    } catch (err: any) {
      console.error('Image gen failed:', err);
      setError(err.message || 'Image generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = (url: string) => {
    onApplyImage(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI Studio Image Generator
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {model}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate studio-quality advertising visuals with customizable aspect ratios and resolution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Controls: Model, Resolution, Aspect Ratio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model Selection */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                AI Model Engine
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setModel('gemini-3-pro-image-preview')}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-start justify-between transition-all ${
                    model === 'gemini-3-pro-image-preview'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      gemini-3-pro-image-preview
                      <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                        STUDIO
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Studio-grade photorealism, fine lighting & 1K/2K/4K resolution
                    </div>
                  </div>
                  {model === 'gemini-3-pro-image-preview' && (
                    <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setModel('gemini-nano-banana-2.1')}
                  className={`w-full p-2.5 rounded-lg border text-left flex items-start justify-between transition-all ${
                    model === 'gemini-nano-banana-2.1'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      gemini-nano-banana-2.1
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                        VERSATILE
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      High quality for general advertising & extreme aspect ratios
                    </div>
                  </div>
                  {model === 'gemini-nano-banana-2.1' && (
                    <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Image Size (1K, 2K, 4K) */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Image Resolution (Size)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {imageSizes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setImageSize(s.id)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      imageSize === s.id
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="text-lg font-black">{s.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{s.note}</div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Model will render full raster fidelity up to {imageSize === '4K' ? '4096px' : imageSize === '2K' ? '2048px' : '1024px'} for razor-sharp banner displays.
              </p>
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                Aspect Ratio Control
              </label>
              <span className="text-xs text-indigo-300 font-mono font-bold">
                Selected: {aspectRatio}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.id}
                  type="button"
                  onClick={() => setAspectRatio(ar.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    aspectRatio === ar.id
                      ? 'bg-teal-600/30 border-teal-400 text-white ring-2 ring-teal-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg leading-none mb-1 font-mono">{ar.icon}</span>
                  <span className="text-xs font-bold">{ar.label}</span>
                  <span className="text-[9px] text-slate-500 truncate w-full text-center mt-0.5">
                    {ar.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Prompt Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                Visual Prompt
              </label>
              <button
                type="button"
                onClick={() =>
                  setPrompt(
                    `Commercial studio hero product shot of ${content.brandName || 'product'}, professional studio lighting, depth of field, high-end catalog aesthetic, copy negative space, 8k crisp details`
                  )
                }
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reset to Product
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe the desired background visual or product composition..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />

            {/* Quick Style Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500 font-medium">Add aesthetic:</span>
              {stylePills.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => appendStyle(style)}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] transition-colors border border-slate-700/60"
                >
                  + {style}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedImage && (
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Generated Image Ready ({imageSize} • {aspectRatio})
                </span>
                <button
                  onClick={() => handleApply(generatedImage)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Apply To All Banners
                </button>
              </div>

              <div className="relative rounded-lg overflow-hidden border border-slate-700 max-h-[300px] flex items-center justify-center bg-black">
                <img
                  src={generatedImage}
                  alt="Generated Ad Visual"
                  className="max-h-[300px] w-auto object-contain"
                />
              </div>
            </div>
          )}

          {/* Previous History Thumbnails */}
          {history.length > 1 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400">Recent Variations:</span>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {history.map((hUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setGeneratedImage(hUrl);
                      handleApply(hUrl);
                    }}
                    className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-700 shrink-0 hover:border-indigo-500 transition-all group"
                  >
                    <img src={hUrl} alt={`Var ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                      Apply
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Commercial copyright-free advertising output
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              disabled={isGenerating || !prompt.trim()}
              onClick={handleGenerate}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/25 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating {imageSize} Visual...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Image ({model.replace('-preview', '')})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
