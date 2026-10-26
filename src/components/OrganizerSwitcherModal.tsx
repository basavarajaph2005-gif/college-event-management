import React, { useState } from 'react';
import { OrganizerProfile, EventCategory } from '../types/organizer';
import {
  X,
  Check,
  ShieldCheck,
  Plus,
} from 'lucide-react';

interface OrganizerSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizers: OrganizerProfile[];
  currentOrganizer: OrganizerProfile;
  onSelectOrganizer: (organizer: OrganizerProfile) => void;
  onAddNewOrganizer: (organizer: OrganizerProfile) => void;
}

export const OrganizerSwitcherModal: React.FC<OrganizerSwitcherModalProps> = ({
  isOpen,
  onClose,
  organizers,
  currentOrganizer,
  onSelectOrganizer,
  onAddNewOrganizer,
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newClub, setNewClub] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([
    'Technical',
    'Workshop',
  ]);
  const [canViewFinancials, setCanViewFinancials] = useState(false);
  const [canManageAll, setCanManageAll] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateOrganizer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newName.trim() || !newRoleTitle.trim() || !newDepartment.trim()) {
      setFormError('Name, Role Title, and Department are required.');
      return;
    }

    const initials = newName
      .trim()
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newProfile: OrganizerProfile = {
      id: 'org_custom_' + Date.now().toString().slice(-5),
      name: newName.trim(),
      roleTitle: newRoleTitle.trim(),
      department: newDepartment.trim(),
      club: newClub.trim() || newRoleTitle.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@college.edu`,
      avatarBg: 'bg-indigo-600',
      avatarText: initials || 'OR',
      badgeVariant: 'indigo',
      permissions: {
        canCreateEvents: true,
        canCancelEvents: true,
        canManageAllEvents: canManageAll,
        allowedCategories: canManageAll
          ? ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Fest']
          : selectedCategories,
        canViewFinancials: canViewFinancials || canManageAll,
        canExportRoster: true,
        canPromoteAds: true,
      },
      bio: `Organizer for ${newDepartment.trim()}. Added to CampusEvents organization team.`,
      isCustom: true,
    };

    onAddNewOrganizer(newProfile);
    onSelectOrganizer(newProfile);
    setIsAddingNew(false);
    onClose();
  };

  const toggleCategory = (cat: EventCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) return; // Keep at least one
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Campus Organizer Accounts
              </h3>
              <p className="text-xs text-slate-400">
                Switch between faculty deans, club leads, and committee heads
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {!isAddingNew ? (
            <>
              <div className="p-3.5 rounded-2xl bg-teal-950/50 border border-teal-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${currentOrganizer.avatarBg} text-white font-mono font-black text-sm flex items-center justify-center shadow-md`}
                  >
                    {currentOrganizer.avatarText}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {currentOrganizer.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500 text-slate-950">
                        Current Active Organizer
                      </span>
                    </div>
                    <p className="text-xs text-teal-300">
                      {currentOrganizer.roleTitle} • {currentOrganizer.department}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Switch to Another Organizer Profile
                  </span>
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Organizer</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {organizers.map((org) => {
                    const isSelected = org.id === currentOrganizer.id;
                    return (
                      <div
                        key={org.id}
                        onClick={() => {
                          onSelectOrganizer(org);
                          onClose();
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-slate-850 border-teal-500/50 shadow-md ring-1 ring-teal-500/30'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl ${org.avatarBg} text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}
                          >
                            {org.avatarText}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-xs truncate">
                                {org.name}
                              </span>
                              {org.permissions.canManageAllEvents ? (
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Super Organizer
                                </span>
                              ) : (
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                  {org.club || org.roleTitle}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 truncate">
                              {org.roleTitle} — {org.department}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSelected ? (
                            <span className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/40 flex items-center justify-center">
                              <Check className="w-4 h-4" />
                            </span>
                          ) : (
                            <button className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-300 font-bold text-xs transition-colors">
                              Switch
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateOrganizer} className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-white text-sm">Create New Organizer Account</h4>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Back to List
                </button>
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ananya Rao"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Media & Photography Lead"
                    value={newRoleTitle}
                    onChange={(e) => setNewRoleTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Department / Faculty *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. School of Media Studies"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Club / Organizing Body
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ShutterBug Club"
                    value={newClub}
                    onChange={(e) => setNewClub(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="ananya.rao@college.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create & Switch to Organizer</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
