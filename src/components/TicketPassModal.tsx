import React, { useState, useEffect } from 'react';
import { StudentRegistration } from '../types/event';
import { generateRegistrationQRCode, getTicketVerificationUrl } from '../utils/qrCode';
import {
  X,
  Download,
  Copy,
  Check,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Smartphone,
  Share2,
  Printer,
} from 'lucide-react';

interface TicketPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: StudentRegistration | null;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  isOpen,
  onClose,
  registration,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);

  useEffect(() => {
    if (registration) {
      generateRegistrationQRCode(registration, { width: 300 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Failed to generate QR:', err));
    }
  }, [registration]);

  if (!isOpen || !registration) return null;

  const handleDownloadQr = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `pass_${registration.id}_${registration.name.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  const handleCopyLink = () => {
    const url = getTicketVerificationUrl(registration);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col relative animate-scaleUp">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ticket Header Banner */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 p-6 text-white text-center relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-md bg-white text-teal-800 font-mono font-black text-xs flex items-center justify-center">
              CE
            </span>
            <span className="text-xs font-black tracking-wider uppercase text-teal-200">
              CampusEvents • Verified Digital Pass
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight leading-snug">
            {registration.eventTitle}
          </h2>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-950/60 text-teal-300 text-xs font-bold border border-teal-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Valid Digital Ticket</span>
          </div>
        </div>

        {/* Ticket Body / Cutout Style */}
        <div className="p-6 bg-slate-900 space-y-5">
          {/* QR Code Container */}
          <div className="flex flex-col items-center">
            <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-teal-500/20 relative group">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${registration.id}`}
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-lg">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="mt-2 text-center">
              <span className="font-mono text-xs font-extrabold text-teal-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 inline-block">
                ID: {registration.id}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Scan with any mobile camera at venue entry
              </p>
            </div>
          </div>

          {/* Dotted Ticket Tear Line */}
          <div className="relative flex items-center justify-between">
            <div className="w-4 h-8 bg-black/85 rounded-r-full -ml-6" />
            <div className="flex-1 border-b-2 border-dashed border-slate-800 mx-2" />
            <div className="w-4 h-8 bg-black/85 rounded-l-full -mr-6" />
          </div>

          {/* Event & Attendee Details Grid */}
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-800/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Student Name
                </span>
                <span className="font-bold text-white text-sm">
                  {registration.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  USN / Roll Number
                </span>
                <span className="font-mono font-bold text-teal-400 text-sm">
                  {registration.usn}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{registration.date}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{registration.time}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{registration.venue}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-bold text-white">
                  {registration.seats} Seat{registration.seats > 1 ? 's' : ''} Reserved
                </span>
              </div>

              <div className="font-bold">
                {registration.amount === 0 ? (
                  <span className="text-emerald-400">Free Entry</span>
                ) : (
                  <span className="text-amber-400">₹{registration.amount} to pay at gate</span>
                )}
              </div>
            </div>
          </div>

          {/* Simulated Mobile Scan Output */}
          {isSimulatingScan && (
            <div className="p-3 bg-teal-950/70 border border-teal-500/40 rounded-xl text-xs space-y-1 animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-teal-300">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-400" /> Scanner Verified
                </span>
                <span className="font-mono text-[10px]">OK 200</span>
              </div>
              <p className="text-[11px] text-teal-100 font-mono">
                Payload: PASS://{registration.id}?name={encodeURIComponent(registration.name)}&seats={registration.seats}
              </p>
            </div>
          )}

          {/* Actions: Download QR, Copy, Print */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleDownloadQr}
              className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/30 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Pass</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share Link'}</span>
            </button>

            <button
              onClick={() => setIsSimulatingScan(!isSimulatingScan)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Verify</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
