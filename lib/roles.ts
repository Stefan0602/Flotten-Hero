import { Role } from '@prisma/client';

export const ROLE_LABELS_DE: Record<Role, string> = {
  ADMIN: 'Administrator (Mandant)',
  LEITUNG: 'Geschäftsleitung',
  SACHBEARBEITER_DISPO: 'Sachbearbeiter – Disposition',
  SACHBEARBEITER_STAMMDATEN: 'Sachbearbeiter – Stammdaten',
  SACHBEARBEITER_FIBU: 'Sachbearbeiter – FIBU & Lohn',
  FAHRER: 'Fahrer',
};

export const ROLE_COLORS: Record<Role, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  LEITUNG: 'bg-purple-100 text-purple-700',
  SACHBEARBEITER_DISPO: 'bg-blue-100 text-blue-700',
  SACHBEARBEITER_STAMMDATEN: 'bg-teal-100 text-teal-700',
  SACHBEARBEITER_FIBU: 'bg-emerald-100 text-emerald-700',
  FAHRER: 'bg-orange-100 text-orange-700',
};

export function getRoleLabel(role: Role): string {
  return ROLE_LABELS_DE[role] || role;
}
