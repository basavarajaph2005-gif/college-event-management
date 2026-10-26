import React from 'react';
import { StudentRegistration } from '../types/event';
import { Calendar, MapPin, Users, Ticket, Trash2, ArrowLeft, QrCode } from 'lucide-react';

interface MyRegistrationsViewProps {
  registrations: StudentRegistration[];
  onCancelRegistration: (regId: string) => void;
  onExploreEvents: () => void;
  onViewTicketPass: (reg: StudentRegistration) => void;
}

export const MyRegistrationsView: React.FC<MyRegistrationsViewProps> = ({
  registrations,
  onCancelRegistration,
  onExploreEvents,
  onViewTicketPass,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            My Registrations
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {registrations.length} Booked
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Your booked events in this browser. Show your QR Code Pass at the venue entry desk.
          </p>
        </div>

        <button
          onClick={onExploreEvents}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Browse More Events</span>
        </button>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        {registrations.map((r) => (
          <div
            key={r.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-teal-950/80 text-teal-400 font-mono font-bold text-xs border border-teal-500/30 flex items-center gap-1.5">
                  <QrCode className="w-3 h-3" />
                  {r.id}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {r.name} • <span className="font-mono text-slate-300">{r.usn}</span>
                </span>
              </div>

              <h3 className="text-lg font-black text-white">
                {r.eventTitle}
              </h3>

              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {r.date} • {r.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {r.venue}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  {r.seats} seat(s)
                </span>
                <span className="font-bold text-emerald-400">
                  {r.amount === 0 ? 'Free Entry' : `₹${r.amount} to pay at venue`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 flex-wrap">
              <button
                onClick={() => onViewTicketPass(r)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>View QR Pass</span>
              </button>

              <button
                onClick={() => onCancelRegistration(r.id)}
                className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-800/50 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ))}

        {registrations.length === 0 && (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-300 font-bold text-sm">
                You have not registered for any events yet.
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Explore tech fests, workshops, and sports tournaments across campus.
              </p>
            </div>
            <button
              onClick={onExploreEvents}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30"
            >
              Explore Events Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
