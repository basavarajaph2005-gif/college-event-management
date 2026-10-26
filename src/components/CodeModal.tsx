import React, { useState } from 'react';
import { BannerSize, BannerContent, AdTheme } from '../types/banner';
import { X, Copy, Check, Code, ExternalLink } from 'lucide-react';
import { generateBannerHtmlSnippet } from '../utils/canvasRenderer';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  size: BannerSize | null;
  content: BannerContent;
  theme: AdTheme;
}

export const CodeModal: React.FC<CodeModalProps> = ({
  isOpen,
  onClose,
  size,
  content,
  theme,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !size) return null;

  const snippet = generateBannerHtmlSnippet(size, content, theme);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Embed Code: {size.name} ({size.width}×{size.height})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-400">
            Copy and paste this standalone HTML/CSS code snippet directly into your landing page, email template, or third-party ad server.
          </p>

          <div className="relative">
            <textarea
              readOnly
              rows={12}
              value={snippet}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 resize-none focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
