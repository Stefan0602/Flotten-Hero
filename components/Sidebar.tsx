'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, UserCheck, Truck, CalendarClock, ClipboardList,
  FileText, BarChart3, LogOut, User, Settings, MapPin, Plus, ListOrdered,
  TrendingUp, Target
} from 'lucide-react';
import { Role } from '@prisma/client';

interface SessionUser {
  id: string;
  name: string;
  role: Role | string;   // Allow string for demo/fallback mode
  mandantName: string;
}

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  type?: 'group';
  children?: NavItem[];
}

const allNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ALL'] },

  // Stammdaten as expandable group (tree structure)
  {
    type: 'group',
    label: 'Stammdaten',
    icon: Users,
    roles: ['LEITUNG', 'SACHBEARBEITER_STAMMDATEN'],
    href: '/stammdaten', // clicking the parent goes to overview
    children: [
      { href: '/stammdaten/kunden', label: 'Kunden', icon: Users, roles: ['LEITUNG', 'SACHBEARBEITER_STAMMDATEN'] },
      { href: '/stammdaten/fahrer', label: 'Fahrer', icon: UserCheck, roles: ['LEITUNG', 'SACHBEARBEITER_STAMMDATEN'] },
      { href: '/stammdaten/fahrzeuge', label: 'Fahrzeuge', icon: Truck, roles: ['LEITUNG', 'SACHBEARBEITER_STAMMDATEN'] },
    ]
  },

  // Aufträge (new grouped section)
  {
    type: 'group',
    label: 'Aufträge',
    icon: ClipboardList,
    roles: ['LEITUNG', 'SACHBEARBEITER_DISPO'],
    children: [
      { href: '/auftraege/neu', label: 'Beauftragung', icon: Plus, roles: ['LEITUNG', 'SACHBEARBEITER_DISPO'] },
      { href: '/auftraege', label: 'Auftragsübersicht', icon: ListOrdered, roles: ['LEITUNG', 'SACHBEARBEITER_DISPO'] },
    ]
  },

  // Disposition (with Auftragsverfolgung as sub-item)
  {
    type: 'group',
    label: 'Disposition',
    icon: CalendarClock,
    roles: ['LEITUNG', 'SACHBEARBEITER_DISPO'],
    children: [
      { href: '/auftraege/disposition', label: 'Disposition', icon: CalendarClock, roles: ['LEITUNG', 'SACHBEARBEITER_DISPO'] },
      { href: '/auftragsverfolgung', label: 'Auftragsverfolgung', icon: MapPin, roles: ['LEITUNG', 'SACHBEARBEITER_DISPO'] },
    ]
  },

  // FIBU / Lohn / Abrechnung
  { href: '/abrechnung', label: 'Rechnungslegung', icon: FileText, roles: ['LEITUNG', 'SACHBEARBEITER_FIBU'] },
  // KPIs (group)
  {
    type: 'group',
    label: 'KPIs',
    icon: BarChart3,
    roles: ['LEITUNG', 'SACHBEARBEITER_FIBU'],
    children: [
      { href: '/kpis/operatives', label: 'Operatives Controlling', icon: TrendingUp, roles: ['LEITUNG', 'SACHBEARBEITER_FIBU'] },
      { href: '/kpis/strategisches', label: 'Strategisches Controlling', icon: Target, roles: ['LEITUNG', 'SACHBEARBEITER_FIBU'] },
    ]
  },



];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [openGroups, setOpenGroups] = useState<string[]>(['Stammdaten']); // Stammdaten open by default

  useEffect(() => {
    async function loadUser() {
      // 1. Try localStorage first (set during login) - very reliable in demo mode
      try {
        const stored = localStorage.getItem('transportpro_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          setLoading(false);
          return;
        }
      } catch {}

      // 2. Try API
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          // Also persist it for next time
          try {
            localStorage.setItem('transportpro_user', JSON.stringify(data.user));
          } catch {}
          setLoading(false);
          return;
        }
      } catch (e) {
        // ignore, fall through to demo fallback
      }

      // 3. Smart Demo Fallback (prefer ADMIN during testing)
      setUser({
        id: 'demo',
        name: 'Admin Demo',
        role: 'ADMIN',                    // Changed to ADMIN for reliable testing
        mandantName: 'Demo Transport GmbH',
      });
      setLoading(false);
    }
    loadUser();
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    try {
      localStorage.removeItem('transportpro_user');
    } catch {}
    window.location.href = '/login';
  }

  // Filtering with group support
  const filteredNav: NavItem[] = allNavItems
    .map((item: NavItem) => {
      if (item.type === 'group') {
        const filteredChildren = (item.children || []).filter((child: NavItem) => {
          const userRole = String(user?.role || '').toUpperCase();
          if (userRole === 'ADMIN') return true;
          if (child.roles?.includes('ALL')) return true;
          return child.roles?.some(r => String(r).toUpperCase() === userRole);
        });
        return { ...item, children: filteredChildren };
      }
      const userRole = String(user?.role || '').toUpperCase();
      if (userRole === 'ADMIN') return item;
      if (item.roles?.includes('ALL')) return item;
      if (item.roles?.some(r => String(r).toUpperCase() === userRole)) return item;
      return null;
    })
    .filter((item): item is NavItem => item !== null);

  if (loading) {
    return <div className="w-64 bg-white border-r" />;
  }

  if (!user) {
    return (
      <div className="w-64 bg-white border-r p-6">
        <div className="text-sm text-slate-500">Nicht angemeldet</div>
        <a href="/login" className="text-blue-600 text-sm mt-2 inline-block">Zum Login</a>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
      {/* Header */}
      <div className="px-5 py-5 border-b">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-lg tracking-tight text-slate-900 truncate">Flotten Hero</div>
            <div className="text-[10px] text-slate-500 -mt-0.5 truncate">{user.mandantName}</div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="px-5 py-3 border-b bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{user.name}</div>
            <div className="text-[10px] text-blue-600 font-medium">
              {user.role === 'LEITUNG' && 'Geschäftsleitung'}
              {user.role === 'SACHBEARBEITER_DISPO' && 'Disposition'}
              {user.role === 'SACHBEARBEITER_STAMMDATEN' && 'Stammdaten'}
              {user.role === 'SACHBEARBEITER_FIBU' && 'FIBU & Lohn'}
              {user.role === 'FAHRER' && 'Fahrer'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-auto">
        {filteredNav.map((item: NavItem, index: number) => {
          if (item.type === 'group') {
            const isOpen = openGroups.includes(item.label);
            const isGroupItselfActive = pathname === item.href;  // Only the group overview itself
            const isAnyChildActive = item.children?.some(child => 
              pathname === child.href || pathname.startsWith(child.href + '/')
            );

            const toggleGroup = () => {
              if (isOpen) {
                setOpenGroups(prev => prev.filter(g => g !== item.label));
              } else {
                setOpenGroups(prev => [...prev, item.label]);
              }
            };

            return (
              <div key={index} className="mt-1">
                {/* Group Header */}
                <div
                  onClick={toggleGroup}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-2xl text-sm font-medium cursor-pointer transition-all ${
                    isGroupItselfActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                </div>

                {/* Group Children */}
                {isOpen && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 pl-3">
                    {item.children?.map((child: NavItem) => {
                      const ChildIcon = child.icon;

                      // Special handling for the Auftragsübersicht (index route)
                      const isActive = child.href === '/auftraege'
                        ? (pathname === '/auftraege' || pathname === '/auftraege/')
                        : (pathname === child.href || pathname.startsWith(child.href + '/'));

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white font-medium shadow-sm'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          <ChildIcon className="w-4 h-4" />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Normal top-level item
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t mt-auto">

        {/* Support Prozesse - visible for LEITUNG, ADMIN, FAHRER and SACHBEARBEITER_FIBU */}
        {['LEITUNG', 'ADMIN', 'FAHRER', 'SACHBEARBEITER_FIBU'].includes(String(user?.role).toUpperCase()) && (
          <div className="mb-3 space-y-1">
            <div className="text-[10px] text-slate-500 px-2 mb-1">Support Prozesse</div>
            <Link
              href="/fahrer/auftraege"
              className={`flex items-center gap-2 px-3 py-2 text-xs rounded-xl ${
                pathname === '/fahrer/auftraege' 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Meine Aufträge
            </Link>
            <Link
              href="/fahrer/lohn"
              className={`flex items-center gap-2 px-3 py-2 text-xs rounded-xl ${
                pathname === '/fahrer/lohn' 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              Lohn & Abrechnungen
            </Link>
          </div>
        )}

        {/* Admin Links - only visible for ADMIN */}
        {user?.role === 'ADMIN' && (
          <div className="mb-3 space-y-1">
            <div className="text-[10px] text-slate-500 px-2 mb-1">Administration</div>
            <Link
              href="/admin/benutzer"
              className={`flex items-center gap-2 px-3 py-2 text-xs rounded-xl ${
                pathname === '/admin/benutzer' 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Benutzerverwaltung
            </Link>
            <Link
              href="/admin/firma"
              className={`flex items-center gap-2 px-3 py-2 text-xs rounded-xl ${
                pathname === '/admin/firma' 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              Meine Firma
            </Link>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 py-2.5 rounded-2xl font-medium transition"
        >
          <LogOut className="w-4 h-4" />
          Abmelden
        </button>
      </div>
    </div>
  );
}
