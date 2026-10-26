import React, { useState, useEffect } from 'react';
import { CollegeEvent, StudentRegistration } from '../types/event';
import { SEED_EVENTS, SEED_REGISTRATIONS } from '../data/seedEvents';
import {
  Calendar,
  Users,
  Ticket,
  DollarSign,
  Plus,
  Search,
  Trash2,
  XCircle,
  Sparkles,
  Download,
  RotateCcw,
  Check,
  AlertCircle,
  Copy,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Tag,
  QrCode,
  UserCheck,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { QrScanner } from './QrScanner';
import { OrganizerProfile } from '../types/organizer';

interface OrganizerAdminProps {
  onPromoteEventToAds: (event: CollegeEvent) => void;
  onViewTicketPass?: (reg: StudentRegistration) => void;
  currentOrganizer?: OrganizerProfile;
  allOrganizers?: OrganizerProfile[];
  onSelectOrganizer?: (organizer: OrganizerProfile) => void;
  onOpenOrganizerSwitcher?: () => void;
}

const LOCAL_STORAGE_KEY = 'adcraft_campusEvents_v2';

export const OrganizerAdmin: React.FC<OrganizerAdminProps> = ({
  onPromoteEventToAds,
  onViewTicketPass,
  currentOrganizer,
  allOrganizers = [],
  onSelectOrganizer,
  onOpenOrganizerSwitcher,
}) => {
  // State for events and registrations
  const [events, setEvents] = useState<CollegeEvent[]>([]);
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterFee, setFilterFee] = useState<'all' | 'free' | 'paid'>('all');
  const [filterAdminScope, setFilterAdminScope] = useState<'all' | 'my-purview'>('all');

  // Create Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newClub, setNewClub] = useState(currentAdmin?.club || '');
  const [newCategory, setNewCategory] = useState<CollegeEvent['category']>(
    currentAdmin?.permissions.allowedCategories[0] || 'Technical'
  );
  const [newVenue, setNewVenue] = useState('');
  const [newDate, setNewDate] = useState('2026-11-28');
  const [newTime, setNewTime] = useState('10:00 AM');
  const [newSeats, setNewSeats] = useState<number>(100);
  const [newFee, setNewFee] = useState<number>(0);
  const [newDesc, setNewDesc] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentAdmin?.club) {
      setNewClub(currentAdmin.club);
    }
    if (currentAdmin && currentAdmin.permissions.allowedCategories.length > 0) {
      setNewCategory(currentAdmin.permissions.allowedCategories[0]);
    }
  }, [currentAdmin]);

  // New Registration Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [studentName, setStudentName] = useState('');
  const [studentUsn, setStudentUsn] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentSeats, setStudentSeats] = useState<number>(1);
  const [regError, setRegError] = useState<string | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // Load state from localStorage or seed
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
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
    // Default initial seed
    setEvents(SEED_EVENTS);
    setRegistrations(SEED_REGISTRATIONS);
  }, []);

  // Sync to localStorage
  const saveState = (updatedEvents: CollegeEvent[], updatedRegs: StudentRegistration[]) => {
    setEvents(updatedEvents);
    setRegistrations(updatedRegs);
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ events: updatedEvents, registrations: updatedRegs })
      );
    } catch (e) {
      console.error('Storage save error:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // KPI Calculations
  const totalEventsCount = events.length;
  const activeEventsCount = events.filter((e) => !e.cancelled).length;
  const totalRegsCount = registrations.length;
  const totalSeatsBooked = registrations.reduce((sum, r) => sum + (r.seats || 0), 0);
  const totalRevenue = registrations.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalCapacity = events.reduce((sum, e) => sum + (e.totalSeats || 0), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalSeatsBooked / totalCapacity) * 100) : 0;

  // Format Date Helper
  const formatDateDisplay = (iso: string) => {
    try {
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  // Reset demo data
  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data back to original CampusEvents schedule?')) {
      saveState(SEED_EVENTS, SEED_REGISTRATIONS);
      showToast('Demo data reset to original events & registrations.');
    }
  };

  // Export registrations CSV
  const handleExportCSV = () => {
    const headers = ['Registration ID', 'Student Name', 'USN', 'Event', 'Seats', 'Fee', 'Amount', 'Email', 'Phone', 'Date'];
    const rows = registrations.map((r) => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      r.usn,
      `"${r.eventTitle.replace(/"/g, '""')}"`,
      r.seats,
      r.fee,
      r.amount,
      r.email,
      r.phone,
      r.registeredAt || r.date,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campus_event_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported registrations CSV.');
  };

  // Cancel student registration (restores seats!)
  const handleCancelRegistration = (regId: string) => {
    const targetReg = registrations.find((r) => r.id === regId);
    if (!targetReg) return;

    if (!window.confirm(`Cancel registration ${regId} for ${targetReg.name}? This will free ${targetReg.seats} seat(s).`)) {
      return;
    }

    // Restore seats to the event
    const updatedEvents = events.map((ev) => {
      if (ev.id === targetReg.eventId) {
        return {
          ...ev,
          seatsLeft: Math.min(ev.totalSeats, ev.seatsLeft + targetReg.seats),
        };
      }
      return ev;
    });

    const updatedRegs = registrations.filter((r) => r.id !== regId);
    saveState(updatedEvents, updatedRegs);
    showToast(`Registration ${regId} cancelled. ${targetReg.seats} seat(s) restored.`);
  };

  // Cancel Event
  const handleCancelEvent = (eventId: string) => {
    const ev = events.find((e) => e.id === eventId);
    if (!ev) return;

    if (!window.confirm(`Are you sure you want to cancel "${ev.title}"? Students will no longer be able to register.`)) {
      return;
    }

    const updatedEvents = events.map((e) => (e.id === eventId ? { ...e, cancelled: true } : e));
    saveState(updatedEvents, registrations);
    showToast(`Event cancelled: ${ev.title}`);
  };

  // Create New Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!newTitle.trim() || !newClub.trim() || !newVenue.trim() || !newDate || !newTime || !newSeats) {
      setFormError('Please fill in Title, Organizing Club, Venue, Date, Time, and valid Total Seats.');
      return;
    }

    if (newSeats < 1) {
      setFormError('Total Seats must be at least 1.');
      return;
    }

    if (newFee < 0) {
      setFormError('Fee cannot be negative. Use 0 for free events.');
      return;
    }

    const newId = 'EVT' + Date.now().toString().slice(-5);
    const createdEvent: CollegeEvent = {
      id: newId,
      title: newTitle.trim(),
      club: newClub.trim(),
      category: newCategory,
      date: newDate,
      displayDate: formatDateDisplay(newDate),
      time: newTime.trim(),
      venue: newVenue.trim(),
      desc: newDesc.trim() || 'A premier college event featuring student showcases, keynotes, and competitions.',
      fee: Number(newFee),
      totalSeats: Number(newSeats),
      seatsLeft: Number(newSeats),
      cancelled: false,
    };

    const updated = [createdEvent, ...events];
    saveState(updated, registrations);

    setFormSuccess(`Event created: "${createdEvent.title}". You can now generate banner ads for it!`);
    showToast(`Event created: ${createdEvent.title}`);

    // Reset inputs
    setNewTitle('');
    setNewClub('');
    setNewVenue('');
    setNewDesc('');
  };

  // Submit Student Registration
  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const ev = events.find((x) => x.id === selectedEventId);
    if (!ev) {
      setRegError('Please choose an event.');
      return;
    }

    if (ev.cancelled) {
      setRegError('This event is cancelled. Registration is closed.');
      return;
    }

    if (!studentName.trim() || !studentUsn.trim() || !studentEmail.trim() || !studentPhone.trim()) {
      setRegError('All fields (Name, USN, Email, Phone) are required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail)) {
      setRegError('Please enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(studentPhone.trim())) {
      setRegError('Phone number must be exactly 10 digits.');
      return;
    }

    if (studentSeats > ev.seatsLeft) {
      setRegError(`Only ${ev.seatsLeft} seat(s) available for this event.`);
      return;
    }

    const regId = 'REG' + Date.now().toString().slice(-6);
    const newReg: StudentRegistration = {
      id: regId,
      eventId: ev.id,
      eventTitle: ev.title,
      date: ev.displayDate,
      venue: ev.venue,
      time: ev.time,
      name: studentName.trim(),
      usn: studentUsn.trim().toUpperCase(),
      email: studentEmail.trim(),
      phone: studentPhone.trim(),
      seats: studentSeats,
      fee: ev.fee,
      amount: ev.fee * studentSeats,
      registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    // Deduct seats
    const updatedEvents = events.map((e) =>
      e.id === ev.id ? { ...e, seatsLeft: Math.max(0, e.seatsLeft - studentSeats) } : e
    );

    const updatedRegs = [newReg, ...registrations];
    saveState(updatedEvents, updatedRegs);

    showToast(`Student registered! ID: ${regId}`);
    setIsRegModalOpen(false);

    // Reset form
    setStudentName('');
    setStudentUsn('');
    setStudentEmail('');
    setStudentPhone('');
  };

  const handleScanResult = (data: string) => {
    const reg = registrations.find(r => r.id === data);
    if (reg) {
      if (reg.checkedIn) {
        showToast(`Student already checked in: ${reg.name}`);
      } else {
        const updatedRegs = registrations.map(r => r.id === data ? {...r, checkedIn: true} : r);
        saveState(events, updatedRegs);
        showToast(`Check-in successful: ${reg.name}`);
      }
    } else {
      showToast('Invalid QR Code / Registration ID not found.');
    }
    setIsQrScannerOpen(false);
  };

  // Filtered registrations
  const filteredRegistrations = registrations.filter((r) => {
    if (filterFee === 'free' && r.amount > 0) return false;
    if (filterFee === 'paid' && r.amount === 0) return false;
    if (
      filterAdminScope === 'my-purview' &&
      currentAdmin &&
      !currentAdmin.permissions.canManageAllEvents
    ) {
      const parentEv = events.find((e) => e.id === r.eventId);
      if (parentEv && !currentAdmin.permissions.allowedCategories.includes(parentEv.category)) {
        return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.usn.toLowerCase().includes(q) ||
        r.eventTitle.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.includes(q)
      );
    }
    return true;
  });

  const filteredEvents = events.filter((ev) => {
    if (
      filterAdminScope === 'my-purview' &&
      currentAdmin &&
      !currentAdmin.permissions.canManageAllEvents
    ) {
      return currentAdmin.permissions.allowedCategories.includes(ev.category);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-indigo-500/50 text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Organizer Dashboard Title & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Organizer Admin Console
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                CAMPUS EVENTS
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Manage registrations, track seat capacities, create college events, and launch banner ad suites.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setSelectedEventId(events[0]?.id || '');
              setIsRegModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Student</span>
          </button>

          <button
            onClick={() => setIsQrScannerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan/Verify QR</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleResetDemo}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-400 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
            title="Reset to initial 12 events"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Multi-Admin Switcher & Status Banner */}
      {currentAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl ${currentAdmin.avatarBg} text-white font-mono font-black text-base flex items-center justify-center shrink-0 shadow-lg`}
            >
              {currentAdmin.avatarText}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Organizer Session:
                </span>
                <span className="text-sm font-black text-white">
                  {currentAdmin.name}
                </span>
                {currentAdmin.permissions.canManageAllEvents ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Super Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {currentAdmin.roleTitle}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                {currentAdmin.roleTitle} • {currentAdmin.department} • Purview:{' '}
                <span className="text-teal-400 font-semibold">
                  {currentAdmin.permissions.allowedCategories.join(', ')}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Scope View Toggle */}
            {!currentAdmin.permissions.canManageAllEvents && (
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterAdminScope('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filterAdminScope === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Campus Events
                </button>
                <button
                  type="button"
                  onClick={() => setFilterAdminScope('my-purview')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filterAdminScope === 'my-purview'
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  My Purview ({currentAdmin.permissions.allowedCategories.join(', ')})
                </button>
              </div>
            )}

            {/* Quick Switcher Pills for other admins */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
              {allAdmins
                .filter((a) => a.id !== currentAdmin.id)
                .slice(0, 3)
                .map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      onSelectAdmin?.(a);
                      showToast(`Switched administrator session to: ${a.name}`);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                    title={`Switch to ${a.name} (${a.roleTitle})`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full ${a.avatarBg} text-white font-mono text-[9px] font-bold flex items-center justify-center`}
                    >
                      {a.avatarText}
                    </span>
                    <span>{a.name.split(' ')[0]}</span>
                  </button>
                ))}
            </div>

            <button
              type="button"
              onClick={onOpenAdminSwitcher}
              className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/25 transition-all cursor-pointer shrink-0"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Switch / Add Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Events</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {totalEventsCount}
            <span className="text-xs font-normal text-slate-500 ml-1.5">
              ({activeEventsCount} active)
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Registrations</span>
            <Users className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {totalRegsCount}
            <span className="text-xs font-normal text-slate-500 ml-1.5">students</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Seats Booked</span>
            <Ticket className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {totalSeatsBooked}
            <span className="text-xs font-normal text-slate-500 ml-1.5">
              / {totalCapacity} ({occupancyRate}%)
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Revenue Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          {currentAdmin && !currentAdmin.permissions.canViewFinancials ? (
            <div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Restricted</span>
              </div>
              <button
                type="button"
                onClick={onOpenAdminSwitcher}
                className="text-[10px] text-teal-400 hover:underline block mt-0.5"
              >
                Switch to Dean
              </button>
            </div>
          ) : (
            <div className="text-2xl font-black text-emerald-400 tabular-nums">
              ₹{totalRevenue.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-500 ml-1.5">INR</span>
            </div>
          )}
        </div>
      </div>

      {/* Registrations Management Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Student Registrations Roster
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {filteredRegistrations.length} Records
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Show registration ID at venue entry. Cancelling a booking immediately frees seats back to the event.
            </p>
          </div>

          {/* Search & Fee Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, USN, ID, or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
              {(['all', 'free', 'paid'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterFee(mode)}
                  className={`px-2.5 py-1 rounded capitalize font-semibold transition-all ${
                    filterFee === mode
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3 px-4">Reg ID</th>
                <th className="py-3 px-4">Student & USN</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4 text-center">Seats</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredRegistrations.map((r) => (
                <tr key={r.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-teal-400 whitespace-nowrap">
                    {r.id}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold text-white">{r.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{r.usn}</div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <div className="font-semibold text-slate-200 truncate">{r.eventTitle}</div>
                    <div className="text-[11px] text-slate-500">{r.date} • {r.venue}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold tabular-nums">
                    {r.seats}
                  </td>
                  <td className="py-3 px-4 font-bold tabular-nums whitespace-nowrap">
                    {r.amount === 0 ? (
                      <span className="text-emerald-400">Free</span>
                    ) : (
                      <span className="text-amber-400">₹{r.amount}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                    <div className="text-slate-300">{r.email}</div>
                    <div className="text-slate-500 font-mono">{r.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                    {onViewTicketPass && (
                      <button
                        onClick={() => onViewTicketPass(r)}
                        className="px-2.5 py-1 rounded bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 hover:text-white border border-teal-700/50 font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="View scannable QR ticket pass"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>QR Pass</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleCancelRegistration(r.id)}
                      className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-white border border-red-800/50 font-bold text-[11px] transition-colors cursor-pointer"
                      title="Cancel booking and restore seats"
                    >
                      Cancel Booking
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRegistrations.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No registrations found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Two Column Grid: Create Event Form + Event Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Create Event Form (5 cols) */}
        <section className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
              <Plus className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Create New College Event
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Publish new fest, workshop, or competition to the campus roster.
            </p>

            {formError && (
              <div className="p-3 mb-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 mb-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous Drone Racing Cup"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Organizing Club *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aero Club"
                    value={newClub}
                    onChange={(e) => setNewClub(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Fest">Fest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Venue *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sports Complex, Indoor Arena"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Time *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSeats}
                    onChange={(e) => setNewSeats(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Fee (₹) — 0 for Free
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newFee}
                    onChange={(e) => setNewFee(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Key highlight, rules, and student expectations..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:border-teal-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                Publish Event to Campus Roster
              </button>
            </form>
          </div>
        </section>

        {/* Right: Manage Events & Ad Launcher (7 cols) */}
        <section className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Event Roster & Multi-Size Ad Bridge
              </h3>
              <p className="text-xs text-slate-400">
                Cancel events or click "Generate Ad Suite" to instantly turn any event into all 14 banner sizes.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {filteredEvents.length} Events {filterAdminScope === 'my-purview' ? '(My Purview)' : 'Total'}
            </span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {filteredEvents.map((ev) => {
              const booked = ev.totalSeats - ev.seatsLeft;
              const pct = ev.totalSeats > 0 ? Math.round((booked / ev.totalSeats) * 100) : 0;

              return (
                <div
                  key={ev.id}
                  className={`p-4 rounded-xl border transition-all ${
                    ev.cancelled
                      ? 'bg-slate-950/40 border-red-950/60 opacity-75'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-teal-400">{ev.club}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 font-semibold">
                          {ev.category}
                        </span>
                        {ev.cancelled && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-950 text-red-400 font-bold border border-red-800">
                            CANCELLED
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {ev.displayDate} • {ev.time} • 📍 {ev.venue}
                      </p>
                    </div>

                    <div className="text-right sm:text-right shrink-0">
                      <span className="text-xs font-black text-amber-400 block">
                        {ev.fee === 0 ? 'Free' : `₹${ev.fee}`}
                      </span>
                    </div>
                  </div>

                  {/* Seat capacity progress */}
                  <div className="my-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                      <span>{ev.seatsLeft} seats left ({pct}% booked)</span>
                      <span>{ev.totalSeats} total capacity</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full transition-all ${
                          ev.cancelled
                            ? 'bg-red-500/50'
                            : pct > 85
                            ? 'bg-amber-500'
                            : 'bg-teal-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-850 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {!ev.cancelled ? (
                        <button
                          onClick={() => handleCancelEvent(ev.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 text-xs font-semibold border border-red-800/40 transition-colors"
                        >
                          Cancel Event
                        </button>
                      ) : (
                        <span className="text-xs text-red-400/80 font-bold">
                          Event Registration Closed
                        </span>
                      )}
                    </div>

                    {/* Instant Ad Suite Generator Button */}
                    <button
                      onClick={() => onPromoteEventToAds(ev)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                      <span>Generate Ad Suite →</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Student Registration Modal */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Register Student for Event</h3>
                <p className="text-xs text-slate-400">Issue an instant digital pass & seat booking.</p>
              </div>
              <button
                onClick={() => setIsRegModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {regError && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRegistration} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Select Event *
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                >
                  {events
                    .filter((e) => !e.cancelled)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title} — {e.seatsLeft} seats left ({e.fee === 0 ? 'Free' : `₹${e.fee}`})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Verma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    USN / Roll Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1RV24CS045"
                    value={studentUsn}
                    onChange={(e) => setStudentUsn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="student@college.edu"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
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
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Seats (1–4) *
                  </label>
                  <select
                    value={studentSeats}
                    onChange={(e) => setStudentSeats(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                  >
                    <option value={1}>1 seat</option>
                    <option value={2}>2 seats</option>
                    <option value={3}>3 seats</option>
                    <option value={4}>4 seats</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Amount to Pay
                  </label>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-bold">
                    {(() => {
                      const ev = events.find((e) => e.id === selectedEventId);
                      if (!ev || ev.fee === 0) return <span className="text-emerald-400">Free</span>;
                      return <span className="text-amber-400">₹{ev.fee * studentSeats}</span>;
                    })()}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-lg"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isQrScannerOpen && (
        <QrScanner 
          onScan={handleScanResult}
          onClose={() => setIsQrScannerOpen(false)}
        />
      )}
    </div>
  );
};
