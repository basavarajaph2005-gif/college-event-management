export type EventCategory = 'Technical' | 'Cultural' | 'Sports' | 'Workshop' | 'Seminar' | 'Fest';

export interface OrganizerPermissions {
  canCreateEvents: boolean;
  canCancelEvents: boolean;
  canManageAllEvents: boolean;
  allowedCategories: EventCategory[];
  canViewFinancials: boolean;
  canExportRoster: boolean;
  canPromoteAds: boolean;
}

export interface OrganizerProfile {
  id: string;
  name: string;
  roleTitle: string;
  department: string;
  club?: string;
  email: string;
  avatarBg: string;
  avatarText: string;
  badgeVariant: 'emerald' | 'indigo' | 'amber' | 'rose' | 'teal';
  permissions: OrganizerPermissions;
  bio: string;
  isCustom?: boolean;
}
