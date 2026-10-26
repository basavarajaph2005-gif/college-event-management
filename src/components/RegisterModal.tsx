import React, { useState, useEffect } from 'react';
import { CollegeEvent, StudentRegistration } from '../types/event';
import { X, Check, AlertCircle, Ticket, Calendar, MapPin, Clock, QrCode, Download } from 'lucide-react';
import { generateRegistrationQRCode } from '../utils/qrCode';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CollegeEvent | null;
  onRegisterSuccess: (registration: StudentRegistration) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  event,
  onRegisterSuccess,
}) => {
  const [name, setName] = useState('');
  const [usn, setUsn] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [seats, setSeats] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [successReg, setSuccessReg] = useState<StudentRegistration | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setUsn('');
      setEmail('');
      setPhone('');
      setSeats(1);
      setError(null);
      setSuccessReg(null);
      setQrUrl('');
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const totalAmount = event.fee * seats;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (event.cancelled) {
      setError('This event has been cancelled. Registration is closed.');
      return;
    }

    if (!name.trim() || !usn.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill all fields — Student Name, USN, Email, and Phone are required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address (e.g., student@college.edu).');
      return;
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    if (seats > event.seatsLeft) {
      setError(`Only ${event.seatsLeft} seat(s) left for this event.`);
      return;
    }

    const regId = 'REG' + Date.now().toString().slice(-6);
    const newReg: StudentRegistration = {
      id: regId,
      eventId: event.id,
      eventTitle: event.title,
      date: event.displayDate,
      venue: event.venue,
      time: event.time,
      name: name.trim(),
      usn: usn.trim().toUpperCase(),
      email: email.trim(),
      phone: phone.trim(),
      seats: Number(seats),
      fee: event.fee,
      amount: totalAmount,
      registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    try {
      const generatedQr = await generateRegistrationQRCode(newReg, { width: 300 });
      setQrUrl(generatedQr);
    } catch (err) {
      console.error('Failed to generate QR code on registration:', err);
    }

    setSuccessReg(newReg);
    onRegisterSuccess(newReg);
  };

  const handleDownloadQr = () => {
    if (!qrUrl || !successReg) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `ticket_${successReg.id}_${successReg.name.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white leading-tight">
              {event.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
              <span className="text-teal-400 font-bold">{event.club}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {event.displayDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {event.time}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                {event.venue}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert with QR Code Pass */}
        {successReg ? (
          <div className="py-4 text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Check className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-white">Registration Confirmed!</h4>
            </div>

            {/* QR Code Card */}
            <div className="flex flex-col items-center">
              <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-teal-500/30">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt={`QR Code Pass for ${successReg.id}`}
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center bg-slate-100 rounded-lg">
                    <QrCode className="w-8 h-8 text-teal-600 animate-pulse" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <span className="font-mono text-xs font-black text-teal-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 inline-block">
                  PASS ID: {successReg.id}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Show this QR code at {event.venue} entry gate
                </p>
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span className="font-bold text-white">{successReg.name} ({successReg.usn})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Seats Reserved:</span>
                <span className="font-bold text-teal-400">{successReg.seats} Seat(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment:</span>
                <span className="font-bold">
                  {totalAmount > 0 ? (
                    <span className="text-amber-400">₹{totalAmount} at venue</span>
                  ) : (
                    <span className="text-emerald-400">Free Entry</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Pass (PNG)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  USN / Roll Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1RV24CS042"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-teal-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-teal-500 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Phone (10 digits) *
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-teal-500 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Number of Seats (1–4) *
                </label>
                <select
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-teal-500 outline-none"
                >
                  <option value={1}>1 seat</option>
                  <option value={2}>2 seats</option>
                  <option value={3}>3 seats</option>
                  <option value={4}>4 seats</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Total Amount to Pay
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold text-sm">
                  {event.fee === 0 ? (
                    <span className="text-emerald-400">Free (₹0)</span>
                  ) : (
                    <span className="text-amber-400">
                      ₹{totalAmount} <span className="text-xs text-slate-500 font-normal">({seats} × ₹{event.fee})</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              For paid events, amount is payable at the venue registration desk.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 flex items-center gap-1.5"
              >
                <Ticket className="w-3.5 h-3.5" />
                Confirm Registration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
