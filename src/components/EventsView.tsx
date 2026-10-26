import React, { useState } from 'react';
import { CollegeEvent } from '../types/event';
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Ticket,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface EventsViewProps {
  events: CollegeEvent[];
  onOpenRegister: (event: CollegeEvent) => void;
  onPromoteEventToAds: (event: CollegeEvent) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onOpenRegister,
  onPromoteEventToAds,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Technical',
    'Cultural',
    'Sports',
    'Workshop',
    'Seminar',
    'Fest',
  ];

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory !== 'All' && ev.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        ev.club.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q) ||
        ev.desc.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Category Pills */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search by event name or club — try &quot;hack&quot;, &quot;robotics&quot;, or &quot;dance&quot;..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {cat === 'All' ? 'All Events' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((ev) => {
          const booked = ev.totalSeats - ev.seatsLeft;
          const pct = ev.totalSeats > 0 ? Math.round((booked / ev.totalSeats) * 100) : 0;
          const isFull = ev.seatsLeft <= 0;

          // Parse day and month from displayDate or date
          const dateParts = ev.displayDate.split(' ');
          const day = dateParts[0] || '12';
          const month = dateParts[1] || 'Nov';

          return (
            <article
              key={ev.id}
              className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all hover:border-slate-700 ${
                ev.cancelled
                  ? 'border-red-900/40 opacity-80'
                  : 'border-slate-800'
              }`}
            >
              {/* Card Top: Category Badge + Date Box */}
              <div className="p-5 pb-0 flex items-start justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-950 text-teal-400 border border-teal-500/20">
                  {ev.category}
                </span>

                <div className="text-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[56px]">
                  <b className="block text-lg font-black text-white leading-none font-mono">
                    {day}
                  </b>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {month}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-lg font-black text-white leading-snug">
                    {ev.title}
                  </h3>
                  <div className="text-xs font-bold text-teal-400 mt-1">
                    {ev.club}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {ev.desc}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>{ev.displayDate} • {ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{ev.venue}</span>
                  </div>
                </div>

                {ev.cancelled && (
                  <div className="text-xs font-bold text-red-400 py-1">
                    ✕ This event has been cancelled
                  </div>
                )}

                {/* Progress bar */}
                <div className="pt-2">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1 font-mono">
                    <span>{ev.seatsLeft} seats left</span>
                    <span>{ev.totalSeats} total</span>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full transition-all ${
                        ev.cancelled
                          ? 'bg-red-500/50'
                          : pct >= 85
                          ? 'bg-amber-500'
                          : 'bg-teal-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-slate-800/60 mt-2">
                <div className="text-base font-black text-white">
                  {ev.fee === 0 ? (
                    <span className="text-emerald-400">Free</span>
                  ) : (
                    <span className="text-amber-400">₹{ev.fee}</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPromoteEventToAds(ev)}
                    title="Generate multi-size banner ads for this event"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-indigo-500/30 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  {ev.cancelled ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed"
                    >
                      Cancelled
                    </button>
                  ) : isFull ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed"
                    >
                      House Full
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenRegister(ev)}
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/30 transition-all active:scale-95 cursor-pointer"
                    >
                      Register Now
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-sm font-semibold">
            No events found matching your search.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
