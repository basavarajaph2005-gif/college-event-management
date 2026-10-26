import React from 'react';
import {
  Calendar,
  Ticket,
  Sliders,
  Sparkles,
  Archive,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { OrganizerProfile } from '../types/organizer';

export type AppViewMode = 'events' | 'my-registrations' | 'organizer' | 'banners';

interface HeaderProps {
  activeView: AppViewMode;
  onChangeView: (view: AppViewMode) => void;
  registrationCount: number;
  onOpenExport?: () => void;
  currentOrganizer?: OrganizerProfile;
  onOpenOrganizerSwitcher?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onChangeView,
  registrationCount = 0,
  onOpenExport,
  currentOrganizer,
  onOpenOrganizerSwitcher,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand Zone */}
        <div
          onClick={() => onChangeView('events')}
          className="flex items-center gap-3 shrink-0 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/30 font-black text-base tracking-tight font-mono">
            CE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-white tracking-tight">
                CampusEvents
              </span>
            </div>
            <p className="text-xs text-slate-400">
              College Event Management System
            </p>
          </div>
        </div>

        {/* Center Nav Zone: All Original Views + Banner Ad Studio */}
        <nav aria-label="Main Navigation" className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs overflow-x-auto max-w-full">
          <button
            onClick={() => onChangeView('events')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeView === 'events'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Events</span>
          </button>

          <button
            onClick={() => onChangeView('my-registrations')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeView === 'my-registrations'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>My Registrations</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeView === 'my-registrations'
                  ? 'bg-white text-teal-900'
                  : 'bg-teal-500/20 text-teal-300'
              }`}
            >
              {registrationCount}
            </span>
          </button>

          <button
            onClick={() => onChangeView('organizer')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeView === 'organizer'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Organizer</span>
          </button>

          <button
            onClick={() => onChangeView('banners')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeView === 'banners'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Banner Ad Studio</span>
          </button>
        </nav>

        {/* Action Buttons: Current Organizer Switcher & Export ZIP */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {currentOrganizer && (
            <button
              onClick={onOpenOrganizerSwitcher}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-850 transition-all cursor-pointer text-left"
              title="Click to switch between campus organizers"
            >
              <div
                className={`w-7 h-7 rounded-lg ${currentOrganizer.avatarBg} text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 shadow-sm`}
              >
                {currentOrganizer.avatarText}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white leading-none">
                    {currentOrganizer.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <span className="text-[10px] text-teal-400 font-semibold leading-none block mt-0.5">
                  {currentOrganizer.roleTitle}
                </span>
              </div>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={onOpenExport}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Export Banner Suite (.ZIP)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
