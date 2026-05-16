'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, Truck, Users, AlertTriangle, ArrowRight, 
  ClipboardList, UserCheck, FileText, BarChart3 
} from 'lucide-react';
import { getDemoAuftraege, getDemoFahrer, getDemoFahrzeuge } from '@/lib/demo-data';

interface DashboardStats {
  offeneAuftraege: number;
  heuteUnterwegs: number;
  fahrzeugeEingesetzt: number;
  totalFahrzeuge: number;
  fahrerAktiv: number;
  totalFahrer: number;
  umsatzDieseWoche: number;
  wartungFaellig: number;
  auslastungProzent: number;
  abweichungenHeute: number;
}

interface RecentAuftrag {
  id: string;
  kundeName: string;
  status: string;
  geplanteAbfahrt: string;
  preis: number | null;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    offeneAuftraege: 0,
    heuteUnterwegs: 0,
    fahrzeugeEingesetzt: 0,
    totalFahrzeuge: 0,
    fahrerAktiv: 0,
    totalFahrer: 0,
    umsatzDieseWoche: 0,
    wartungFaellig: 0,
    auslastungProzent: 0,
    abweichungenHeute: 0,
  });
  const [recentAuftraege, setRecentAuftraege] = useState<RecentAuftrag[]>([]);
  const [mandantName, setMandantName] = useState<string>('Ihr Unternehmen');
  const [userName, setUserName] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Hallo');
  const [loading, setLoading] = useState(true);

  // Zeitabhängige Begrüßung
  const getTimeBasedGreeting = (name: string) => {
    const hour = new Date().getHours();
    let base = 'Hallo';
    if (hour >= 5 && hour < 11) base = 'Guten Morgen';
    else if (hour >= 11 && hour < 17) base = 'Guten Tag';
    else if (hour >= 17 && hour < 22) base = 'Guten Abend';
    return name ? `${base}, ${name}` : base;
  };

  async function loadDashboard() {
    const demoAuftraege = getDemoAuftraege();
    const demoFahrer = getDemoFahrer();
    const demoFahrzeuge = getDemoFahrzeuge();

    // Große Demo-Daten haben Vorrang
    if (demoAuftraege.length > 5) {
      const offene = demoAuftraege.filter((a: any) => 
        !['ABGESCHLOSSEN', 'ABGERECHNET', 'STORNIERT'].includes(a.status)
      ).length;

      const heuteUnterwegs = demoAuftraege.filter((a: any) =>
        ['DISPONIERT', 'IN_AUSFUEHRUNG'].includes(a.status)
      ).length;

      const fahrerAktivCount = demoFahrer.filter((f: any) => f.status === 'AKTIV').length;

      const aktiveAuftraege = demoAuftraege.filter((a: any) =>
        ['DISPONIERT', 'IN_AUSFUEHRUNG'].includes(a.status)
      );
      const eingesetzteFahrzeugIds = new Set(
        aktiveAuftraege.map((a: any) => a.fahrzeugId).filter(Boolean)
      );
      const fahrzeugeEingesetzt = eingesetzteFahrzeugIds.size;

      const verfuegbar = demoFahrzeuge.filter((f: any) => f.status === 'VERFUEGBAR').length;

      const umsatz = demoAuftraege
        .filter((a: any) => ['ABGESCHLOSSEN', 'ABGERECHNET'].includes(a.status))
        .reduce((sum: number, a: any) => sum + (a.preis || 0), 0);

      const recent = [...demoAuftraege]
        .sort((a: any, b: any) => new Date(b.geplanteAbfahrt).getTime() - new Date(a.geplanteAbfahrt).getTime())
        .slice(0, 5)
        .map((a: any) => ({
          id: a.id,
          kundeName: a.kundeName,
          status: a.status,
          geplanteAbfahrt: a.geplanteAbfahrt,
          preis: a.preis,
        }));

      setStats({
        offeneAuftraege: offene,
        heuteUnterwegs: heuteUnterwegs,
        fahrzeugeEingesetzt: fahrzeugeEingesetzt,
        totalFahrzeuge: demoFahrzeuge.length,
        fahrerAktiv: fahrerAktivCount,
        totalFahrer: demoFahrer.length,
        umsatzDieseWoche: Math.round(umsatz),
        wartungFaellig: Math.max(2, Math.floor(demoFahrzeuge.length / 4)),
        auslastungProzent: Math.round(((demoFahrzeuge.length - verfuegbar) / Math.max(1, demoFahrzeuge.length)) * 100) || 65,
        abweichungenHeute: Math.floor(demoAuftraege.length / 18),
      });
      setRecentAuftraege(recent);
    } else {
      // Fallback auf API oder kleinen Demo-Fallback
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || {});
          setRecentAuftraege(data.recentAuftraege || []);
          if (data.mandantName) setMandantName(data.mandantName);
        } else {
          throw new Error();
        }
      } catch {
        setStats({
          offeneAuftraege: 8,
          heuteUnterwegs: 4,
          fahrzeugeEingesetzt: 4,
          totalFahrzeuge: 6,
          fahrerAktiv: 5,
          totalFahrer: 8,
          umsatzDieseWoche: 3240,
          wartungFaellig: 1,
          auslastungProzent: 65,
          abweichungenHeute: 2,
        });
        setRecentAuftraege([
          { id: 'demo1', kundeName: 'Seniorenresidenz Sonnenhof', status: 'DISPONIERT', geplanteAbfahrt: '2026-04-23T09:00', preis: 51.5 },
          { id: 'demo2', kundeName: 'Krankenhaus München-Süd', status: 'IN_AUSFUEHRUNG', geplanteAbfahrt: '2026-04-23T10:15', preis: 41.0 },
        ]);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    // User laden (für persönlichen Gruß)
    try {
      const storedUser = localStorage.getItem('transportpro_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.name) {
          const firstName = parsed.name.split(' ')[0];
          setUserName(firstName);
          setGreeting(getTimeBasedGreeting(firstName));
        }
        if (parsed?.mandantName) {
          setMandantName(parsed.mandantName);
        }
      }
    } catch (e) {}

    // Daten laden
    loadDashboard();

    // Gruß jede Minute aktualisieren
    const interval = setInterval(() => {
      if (userName) {
        setGreeting(getTimeBasedGreeting(userName));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const kpiData = [
    {
      label: 'Offene Aufträge',
      value: stats.offeneAuftraege,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/auftraege',
    },
    {
      label: 'Heute unterwegs',
      value: stats.heuteUnterwegs,
      icon: Truck,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      href: '/auftraege',
    },
    {
      label: 'Fahrzeuge eingesetzt',
      value: `${stats.fahrzeugeEingesetzt}/${stats.totalFahrzeuge}`,
      icon: Truck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/stammdaten/fahrzeuge',
    },
    {
      label: 'Fahrer im Dienst',
      value: `${stats.fahrerAktiv}/${stats.totalFahrer}`,
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      href: '/stammdaten/fahrer',
    },
  ];

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            {greeting} 
            {mandantName ? ` • ${mandantName}` : ''}
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mt-1">
            Dashboard
          </h1>
        </div>
        <div className="flex gap-3">
          <Link href="/auftraege/neu" className="btn btn-primary">
            <ClipboardList className="w-4 h-4" /> Neuer Auftrag
          </Link>
          <Link href="/auftraege" className="btn btn-secondary">
            Aufträge ansehen <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Link key={index} href={kpi.href} className="kpi-card card-hover block">
              <div className="flex items-start justify-between">
                <div>
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-value mt-2">{kpi.value}</div>
                </div>
                <div className={`${kpi.bg} p-3 rounded-2xl`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="kpi-label">Umsatz diese Woche</div>
              <div className="kpi-value text-3xl mt-1">€ {stats.umsatzDieseWoche.toLocaleString('de-DE')}</div>
            </div>
            <FileText className="w-9 h-9 text-emerald-600" />
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="kpi-label">Flotten-Auslastung</div>
              <div className="kpi-value text-3xl mt-1">{stats.auslastungProzent} %</div>
            </div>
            <Truck className="w-9 h-9 text-blue-600" />
          </div>
        </div>

        <div className="kpi-card border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="kpi-label flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" /> Wartung fällig
              </div>
              <div className="kpi-value text-3xl mt-1 text-amber-700">{stats.wartungFaellig}</div>
            </div>
            <Link href="/stammdaten/fahrzeuge" className="text-sm text-amber-600 hover:underline flex items-center gap-1">
              Ansehen <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="text-xs text-slate-500 mt-3">STA-CD 5678 • Mercedes Sprinter</div>
        </div>
      </div>

      {/* Aktuelle Aufträge + Schnellzugriff */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Aktuelle Aufträge */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="font-semibold text-lg">Aktuelle Aufträge</div>
            <Link href="/auftraege" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Alle ansehen <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentAuftraege.length === 0 ? (
            <div className="text-center py-8 text-slate-400">Keine aktuellen Aufträge</div>
          ) : (
            <div className="space-y-1">
              {recentAuftraege.map((a, idx) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className={`status-badge status-${a.status.toLowerCase().replace('_', '')}`}>
                      {a.status.replace('_', ' ')}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{a.kundeName}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(a.geplanteAbfahrt).toLocaleString('de-DE', { 
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm font-medium text-emerald-600">
                    {a.preis ? `€ ${a.preis.toFixed(2)}` : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schnellzugriff */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6">
          <div className="font-semibold mb-4">Schnellzugriff</div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/auftraege/neu" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors text-center">
              <ClipboardList className="w-6 h-6 mb-2 text-blue-600" />
              <span className="text-sm font-medium">Neuen Auftrag anlegen</span>
            </Link>
            <Link href="/stammdaten/fahrer" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors text-center">
              <UserCheck className="w-6 h-6 mb-2 text-blue-600" />
              <span className="text-sm font-medium">Fahrer-Verfügbarkeit</span>
            </Link>
            <Link href="/abrechnung" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors text-center">
              <FileText className="w-6 h-6 mb-2 text-blue-600" />
              <span className="text-sm font-medium">Rechnungslegung</span>
            </Link>
            <Link href="/kpis/strategisches" className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors text-center">
              <BarChart3 className="w-6 h-6 mb-2 text-blue-600" />
              <span className="text-sm font-medium">Investitionsmetriken</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-xs text-slate-400 text-center">
        Flotten Hero Demo • Alle Daten sind fiktiv und dienen ausschließlich Demonstrationszwecken • 
        <span className="ml-1">Datenstand: {new Date().toLocaleDateString('de-DE')}</span>
      </div>
    </div>
  );
}
