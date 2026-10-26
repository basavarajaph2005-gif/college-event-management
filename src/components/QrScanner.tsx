import React, { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';
import { X, Camera } from 'lucide-react';

interface QrScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QrScanner: React.FC<QrScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          requestAnimationFrame(tick);
        }
      } catch (err) {
        setError('Could not access camera.');
        console.error(err);
      }
    }

    function tick() {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          onScan(code.data);
          return; // Stop scanning after successful read
        }
      }
      requestAnimationFrame(tick);
    }

    startCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-4 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-sm font-bold text-white mb-3">Scan Student QR Code</h3>
        <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-700">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          <canvas ref={canvasRef} className="hidden" />
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    </div>
  );
};
