import React, { useState, useEffect } from 'react';
import { decodeBannerContent } from './utils/shareUtils';
import {
  BannerSize,
  BannerContent,
  AdTheme,
  ProductPreset,
} from './types/banner';
import { CollegeEvent, StudentRegistration } from './types/event';
import { BANNER_SIZES } from './data/bannerSizes';
import { AD_THEMES } from './data/themes';
import { SEED_EVENTS, SEED_REGISTRATIONS } from './data/seedEvents';
import { SEED_ORGANIZERS } from './data/seedOrganizers';
import { OrganizerProfile } from './types/organizer';
import { Header, AppViewMode } from './components/Header';
import { EventsView } from './components/EventsView';
import { MyRegistrationsView } from './components/MyRegistrationsView';
import { OrganizerAdmin } from './components/OrganizerAdmin';
import { RegisterModal } from './components/RegisterModal';
import { TicketPassModal } from './components/TicketPassModal';
import { OrganizerSwitcherModal } from './components/OrganizerSwitcherModal';
import { SocialPostPreview } from './components/SocialPostPreview';
import { BannerCard } from './components/BannerCard';
import { BannerStudio } from './components/BannerStudio';
import { ImageGenModal } from './components/ImageGenModal';
import { ExportModal } from './components/ExportModal';
import { CodeModal } from './components/CodeModal';
import { PlacementSimulator } from './components/PlacementSimulator';
import {
  Sparkles,
  Globe,
  Upload,
  Palette,
  Type,
  Search,
  Check,
  RefreshCw,
  Sliders,
  Calendar,
  Users,
  Ticket,
  Instagram,
  Linkedin,
} from 'lucide-react';

const STORAGE_KEY = 'campusEvents_v1';

export default function App() {
  // Navigation View: events | my-registrations | organizer | banners
  const [activeView, setActiveView] = useState<AppViewMode>('events');

  // Core College Events & Registrations State
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Registration Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedEventForReg, setSelectedEventForReg] = useState<CollegeEvent | null>(null);

  // Ticket Pass QR Modal State
  const [ticketPassReg, setTicketPassReg] = useState<StudentRegistration | null>(null);
  const [isTicketPassOpen, setIsTicketPassOpen] = useState(false);

  // Banner Generation State
  const [productUrl, setProductUrl] = useState<string>(
    '/public/assets/aistudio/College_Event_Management_System_Website_72656c89.html'
  );
  const [productDesc, setProductDesc] = useState<string>(
    'College event management system for browsing fests, workshops, hackathons, sports, and cultural nights with instant seat reservations.'
  );
  const [brandNameInput, setBrandNameInput] = useState<string>('CampusEvents');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [activeThemeId, setActiveThemeId] = useState<string>('emerald-teal');
  const currentTheme = AD_THEMES.find((t) => t.id === activeThemeId) || AD_THEMES[0];

  const [bannerContent, setBannerContent] = useState<BannerContent>({
    brandName: 'CampusEvents',
    categoryTag: 'College & Fests',
    headline: 'One Place For Every College Event',
    subheadline: 'Browse 12+ mega fests, hackathons, & workshops. Register your seat in 10 seconds.',
    ctaText: 'Explore Events',
    badgeText: 'HackSprint & Fest 2026',
    pricingText: 'Free & From ₹0',
    disclaimer: 'Instant digital pass • Limited venue seats available',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    overlayOpacity: 55,
    overlayGradient: 'bottom-up',
    themeId: 'emerald-teal',
    fontFamily: 'display',
    buttonStyle: 'pill-glow',
  });

  // Multi-Organizer Profiles & Session State
  const [organizers, setOrganizers] = useState<OrganizerProfile[]>(() => {
    try {
      const stored = localStorage.getItem('campusEvents_organizers_v1') || localStorage.getItem('campusEvents_admins_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading organizers:', e);
    }
    return SEED_ORGANIZERS;
  });

  const [currentOrganizerId, setCurrentOrganizerId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('campusEvents_activeOrganizer_v1') || localStorage.getItem('campusEvents_activeAdmin_v1');
      if (stored) return stored;
    } catch (e) {
      console.warn('Error reading active organizer:', e);
    }
    return SEED_ORGANIZERS[0].id;
  });

  const currentOrganizer = organizers.find((a) => a.id === currentOrganizerId) || organizers[0];
  const [isOrganizerSwitcherOpen, setIsOrganizerSwitcherOpen] = useState(false);

  const handleSelectOrganizer = (organizer: OrganizerProfile) => {
    setCurrentOrganizerId(organizer.id);
    try {
      localStorage.setItem('campusEvents_activeOrganizer_v1', organizer.id);
    } catch (e) {
      console.warn(e);
    }
    showToast(`Switched organizer session to: ${organizer.name}`);
  };

  const handleAddNewOrganizer = (newOrganizer: OrganizerProfile) => {
    const updated = [...organizers, newOrganizer];
    setOrganizers(updated);
    try {
      localStorage.setItem('campusEvents_organizers_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    showToast(`New organizer account created for ${newOrganizer.name}!`);
  };

  // Banner Sub-views & Filters
  const [bannerCategory, setBannerCategory] = useState<'all' | 'iab' | 'mobile' | 'social'>('all');
  const [bannerSearch, setBannerSearch] = useState('');
  const [bannerSubMode, setBannerSubMode] = useState<'matrix' | 'simulator' | 'social-preview'>('matrix');

  // Modals for Banners
  const [studioSize, setStudioSize] = useState<BannerSize | null>(null);
  const [codeSize, setCodeSize] = useState<BannerSize | null>(null);
  const [isImageGenOpen, setIsImageGenOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Load Initial Data from localStorage or Seeds
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.events && parsed.events.length > 0) {
          setEvents(parsed.events);
          setRegistrations(parsed.registrations || []);
          return;
        }
      }
    } catch (e) {
      console.warn('Error reading events from storage:', e);
    }
    setEvents(SEED_EVENTS);
    setRegistrations(SEED_REGISTRATIONS);
  }, []);

  // Handle shared link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedContent = params.get('share');
    if (sharedContent) {
      const decoded = decodeBannerContent(sharedContent);
      if (decoded) {
        setBannerContent(decoded);
        setActiveView('banners');
        showToast('Shared design loaded!');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Save changes to localStorage
  const saveEventsState = (newEvents: CollegeEvent[], newRegs: StudentRegistration[]) => {
    setEvents(newEvents);
    setRegistrations(newRegs);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ events: newEvents, registrations: newRegs })
      );
    } catch (e) {
      console.error('Storage error:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Student Registration Success Handler
  const handleRegisterSuccess = (newReg: StudentRegistration) => {
    const updatedEvents = events.map((e) =>
      e.id === newReg.eventId
        ? { ...e, seatsLeft: Math.max(0, e.seatsLeft - newReg.seats) }
        : e
    );
    const updatedRegs = [newReg, ...registrations];
    saveEventsState(updatedEvents, updatedRegs);
    showToast(`Registered successfully! ID: ${newReg.id}`);
  };

  // Student Registration Cancellation Handler
  const handleCancelRegistration = (regId: string) => {
    const reg = registrations.find((r) => r.id === regId);
    if (!reg) return;

    if (
      !window.confirm(
        `Cancel registration ${regId} for "${reg.eventTitle}"? This will free ${reg.seats} seat(s).`
      )
    ) {
      return;
    }

    const updatedEvents = events.map((e) =>
      e.id === reg.eventId
        ? { ...e, seatsLeft: Math.min(e.totalSeats, e.seatsLeft + reg.seats) }
        : e
    );
    const updatedRegs = registrations.filter((r) => r.id !== regId);
    saveEventsState(updatedEvents, updatedRegs);
    showToast(`Registration ${regId} cancelled — seats freed.`);
  };

  // Promote any event to the Banner Ad Studio
  const handlePromoteEventToAds = (event: CollegeEvent) => {
    setBrandNameInput(event.club);
    setProductUrl('/public/assets/aistudio/College_Event_Management_System_Website_72656c89.html');
    setProductDesc(event.desc);
    setActiveThemeId('emerald-teal');

    setBannerContent({
      brandName: event.club,
      categoryTag: event.category,
      headline: event.title,
      subheadline: `${event.desc.slice(0, 75)}... ${event.displayDate} at ${event.venue}`,
      ctaText: event.fee === 0 ? 'Register Free' : 'Book Seat Now',
      badgeText: `${event.category} • ${event.seatsLeft} Seats Left`,
      pricingText: event.fee === 0 ? 'Free Entry' : `₹${event.fee} Entry`,
      disclaimer: `Entry pass required • Venue: ${event.venue}`,
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
      overlayOpacity: 55,
      overlayGradient: 'bottom-up',
      themeId: 'emerald-teal',
      fontFamily: 'display',
      buttonStyle: 'pill-glow',
    });

    setActiveView('banners');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Generating banners for: ${event.title}`);
  };

  // AI Product Analysis for Banners
  const handleAnalyzeAndGenerate = async () => {
    if (!productDesc && !productUrl) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      let fetchedInfo: any = null;
      if (productUrl) {
        try {
          const fetchResp = await fetch('/api/fetch-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: productUrl }),
          });
          if (fetchResp.ok) {
            fetchedInfo = await fetchResp.json();
          }
        } catch (e) {
          console.warn('URL fetch fallback:', e);
        }
      }

      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: productUrl,
          description: productDesc || fetchedInfo?.description || '',
          brandName: brandNameInput || fetchedInfo?.title || 'CampusEvents',
          targetAudience: 'College students, club leads, and fest attendees',
          themeTone: currentTheme.name,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to analyze event');
      }

      const d = resData.data;
      if (d) {
        setBannerContent((prev) => ({
          ...prev,
          brandName: d.brandName || prev.brandName,
          categoryTag: d.category || prev.categoryTag,
          headline: d.headlines?.[0] || prev.headline,
          subheadline: d.subheadlines?.[0] || prev.subheadline,
          ctaText: d.ctaOptions?.[0] || prev.ctaText,
          badgeText: d.badges?.[0] || prev.badgeText,
          pricingText: d.pricingHook || prev.pricingText,
        }));
        showToast('Banner copy refreshed with AI!');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'Error analyzing event details');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Upload custom image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBannerContent((prev) => ({
            ...prev,
            imageUrl: event.target!.result as string,
          }));
          showToast('Image uploaded and applied!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // KPI Calculations for Hero
  const totalEventsCount = events.length;
  const totalRegsCount = registrations.length;
  const totalSeatsBooked = registrations.reduce((sum, r) => sum + (r.seats || 0), 0);

  // Filtered Banner Sizes
  const filteredBanners = BANNER_SIZES.filter((size) => {
    if (bannerCategory !== 'all' && size.category !== bannerCategory) return false;
    if (bannerSearch) {
      const q = bannerSearch.toLowerCase();
      return (
        size.name.toLowerCase().includes(q) ||
        size.id.toLowerCase().includes(q) ||
        size.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-teal-500/50 text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Header
        activeView={activeView}
        onChangeView={setActiveView}
        registrationCount={registrations.length}
        onOpenExport={() => setIsExportOpen(true)}
        currentOrganizer={currentOrganizer}
        onOpenOrganizerSwitcher={() => setIsOrganizerSwitcherOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* HERO & STATS SECTION (Visible on Events page, exactly as in original site) */}
        {activeView === 'events' && (
          <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10 space-y-2 max-w-xl">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  One place for every college event.
                </h2>
                <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
                  Browse fests, workshops, sports and seminars — check seats, register in seconds, and keep your Registration ID safe. Organizers manage everything from one dashboard.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-3 relative z-10 flex-wrap">
                <button
                  onClick={() => setActiveView('organizer')}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Organizer Dashboard →
                </button>
                <button
                  onClick={() => setActiveView('banners')}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Banner Ad Studio</span>
                </button>
                <button
                  onClick={() => {
                    setActiveView('banners');
                    setBannerSubMode('social-preview');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-200 border border-pink-400/30 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-300" />
                  <span>Social Preview</span>
                </button>
              </div>

              {/* Decorative background circle */}
              <div className="absolute -right-8 -bottom-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Stats Counter Cards */}
            <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
                <div>
                  <b className="text-2xl font-black text-white font-mono block">
                    {totalEventsCount}
                  </b>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Total Events
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
                <div>
                  <b className="text-2xl font-black text-white font-mono block">
                    {totalRegsCount}
                  </b>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Registrations
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Ticket className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
                <div>
                  <b className="text-2xl font-black text-white font-mono block">
                    {totalSeatsBooked}
                  </b>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Seats Booked
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 1: EVENTS LIST (The core original experience) */}
        {activeView === 'events' && (
          <EventsView
            events={events}
            onOpenRegister={(ev) => {
              setSelectedEventForReg(ev);
              setIsRegisterOpen(true);
            }}
            onPromoteEventToAds={handlePromoteEventToAds}
          />
        )}

        {/* VIEW 2: MY REGISTRATIONS */}
        {activeView === 'my-registrations' && (
          <MyRegistrationsView
            registrations={registrations}
            onCancelRegistration={handleCancelRegistration}
            onExploreEvents={() => setActiveView('events')}
            onViewTicketPass={(reg) => {
              setTicketPassReg(reg);
              setIsTicketPassOpen(true);
            }}
          />
        )}

        {/* VIEW 3: ORGANIZER ADMIN */}
        {activeView === 'organizer' && (
          <OrganizerAdmin
            onPromoteEventToAds={handlePromoteEventToAds}
            onViewTicketPass={(reg) => {
              setTicketPassReg(reg);
              setIsTicketPassOpen(true);
            }}
            currentOrganizer={currentOrganizer}
            allOrganizers={organizers}
            onSelectOrganizer={handleSelectOrganizer}
            onOpenOrganizerSwitcher={() => setIsOrganizerSwitcherOpen(true)}
          />
        )}

        {/* VIEW 4: BANNER AD STUDIO (All 14 standard sizes, AI generator, simulator) */}
        {activeView === 'banners' && (
          <div className="space-y-6">
            {/* Banner Studio Header & Mode Switcher */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  Multi-Size Banner Ad Studio
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    14 FORMATS + SOCIAL
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generate advertising banners in all standard IAB display, mobile, and social sizes simultaneously.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setBannerSubMode('matrix')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bannerSubMode === 'matrix'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  All Sizes Grid
                </button>
                <button
                  onClick={() => setBannerSubMode('simulator')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bannerSubMode === 'simulator'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Ad Simulator
                </button>
                <button
                  onClick={() => setBannerSubMode('social-preview')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    bannerSubMode === 'social-preview'
                      ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Social Post Preview</span>
                </button>
              </div>
            </div>

            {/* Input Bar & Live Customizer */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5 space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">
                    Event URL or Website
                  </label>
                  <div className="relative flex items-center">
                    <Globe className="w-4 h-4 text-teal-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. /public/assets/aistudio/... or website URL"
                      value={productUrl}
                      onChange={(e) => setProductUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">
                    Organizing Club / Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Coding Club"
                    value={brandNameInput}
                    onChange={(e) => {
                      setBrandNameInput(e.target.value);
                      setBannerContent((prev) => ({ ...prev, brandName: e.target.value }));
                    }}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-semibold"
                  />
                </div>

                <div className="md:col-span-4">
                  <button
                    onClick={handleAnalyzeAndGenerate}
                    disabled={isAnalyzing || (!productUrl && !productDesc)}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating Copy with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate All Banners</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Event Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 block">
                  Event Highlights & Description
                </label>
                <textarea
                  rows={2}
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="Key details: date, venue, prizes, and registration fee..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              {/* Live Banner Customizer Ribbon */}
              <div className="pt-3 border-t border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 flex-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Headline
                    </span>
                    <input
                      type="text"
                      value={bannerContent.headline}
                      onChange={(e) =>
                        setBannerContent((prev) => ({ ...prev, headline: e.target.value }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:border-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Subheadline
                    </span>
                    <input
                      type="text"
                      value={bannerContent.subheadline}
                      onChange={(e) =>
                        setBannerContent((prev) => ({ ...prev, subheadline: e.target.value }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      CTA Button
                    </span>
                    <input
                      type="text"
                      value={bannerContent.ctaText}
                      onChange={(e) =>
                        setBannerContent((prev) => ({ ...prev, ctaText: e.target.value }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:border-teal-500 outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Offer / Badge
                    </span>
                    <input
                      type="text"
                      value={bannerContent.badgeText}
                      onChange={(e) =>
                        setBannerContent((prev) => ({ ...prev, badgeText: e.target.value }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <Palette className="w-3.5 h-3.5 text-teal-400 ml-1" />
                    <select
                      value={activeThemeId}
                      onChange={(e) => {
                        setActiveThemeId(e.target.value);
                        setBannerContent((prev) => ({ ...prev, themeId: e.target.value }));
                      }}
                      className="bg-transparent text-white font-semibold text-xs focus:outline-none cursor-pointer pr-1"
                    >
                      {AD_THEMES.map((t) => (
                        <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setIsImageGenOpen(true)}
                    className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Visual (gemini-3-pro)</span>
                  </button>

                  <label className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </section>

            {/* Matrix View or Simulator View */}
            {bannerSubMode === 'matrix' ? (
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(
                      [
                        { id: 'all', label: `All Standards (${BANNER_SIZES.length})` },
                        { id: 'iab', label: 'IAB Display (9)' },
                        { id: 'mobile', label: 'Mobile Sizes (3)' },
                        { id: 'social', label: 'Social & Feed (3)' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setBannerCategory(tab.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          bannerCategory === tab.id
                            ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter by size (e.g. 300x250)..."
                      value={bannerSearch}
                      onChange={(e) => setBannerSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredBanners.map((size) => (
                    <BannerCard
                      key={size.id}
                      size={size}
                      content={bannerContent}
                      theme={currentTheme}
                      onOpenStudio={(s) => setStudioSize(s)}
                      onOpenCode={(s) => setCodeSize(s)}
                    />
                  ))}
                </div>
              </section>
            ) : bannerSubMode === 'simulator' ? (
              <PlacementSimulator
                content={bannerContent}
                theme={currentTheme}
              />
            ) : (
              <SocialPostPreview
                content={bannerContent}
                theme={currentTheme}
              />
            )}
          </div>
        )}
      </main>

      {/* STUDENT REGISTRATION MODAL */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        event={selectedEventForReg}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* STUDENT DIGITAL TICKET PASS MODAL (QR CODE) */}
      <TicketPassModal
        isOpen={isTicketPassOpen}
        onClose={() => setIsTicketPassOpen(false)}
        registration={ticketPassReg}
      />

      {/* AI IMAGE GENERATOR MODAL */}
      <ImageGenModal
        isOpen={isImageGenOpen}
        onClose={() => setIsImageGenOpen(false)}
        content={bannerContent}
        onApplyImage={(url) => {
          setBannerContent((prev) => ({ ...prev, imageUrl: url }));
          showToast('AI Visual applied to all banner sizes!');
        }}
      />

      {/* SINGLE BANNER STUDIO MODAL */}
      <BannerStudio
        size={studioSize}
        onClose={() => setStudioSize(null)}
        content={bannerContent}
        theme={currentTheme}
        onUpdateContent={(updated) =>
          setBannerContent((prev) => ({ ...prev, ...updated }))
        }
        onSelectTheme={(tId) => {
          setActiveThemeId(tId);
          setBannerContent((prev) => ({ ...prev, themeId: tId }));
        }}
        allThemes={AD_THEMES}
        onOpenImageGen={() => setIsImageGenOpen(true)}
      />

      {/* EXPORT ZIP MODAL */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        content={bannerContent}
        theme={currentTheme}
      />

      {/* HTML EMBED CODE MODAL */}
      <CodeModal
        isOpen={!!codeSize}
        onClose={() => setCodeSize(null)}
        size={codeSize}
        content={bannerContent}
        theme={currentTheme}
      />

      {/* CAMPUS MULTI-ORGANIZER SWITCHER MODAL */}
      <OrganizerSwitcherModal
        isOpen={isOrganizerSwitcherOpen}
        onClose={() => setIsOrganizerSwitcherOpen(false)}
        organizers={organizers}
        currentOrganizer={currentOrganizer}
        onSelectOrganizer={handleSelectOrganizer}
        onAddNewOrganizer={handleAddNewOrganizer}
      />
    </div>
  );
}
