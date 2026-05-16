'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Save, Database, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { seedLargeDemoDataset, getDemoStats } from '@/lib/demo-data';

interface Mandant {
  id: string;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export default function MeineFirmaPage() {
  const [mandant, setMandant] = useState<Mandant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadFirma() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/firma');
      if (res.ok) {
        const data = await res.json();
        if (data.mandant) {
          setMandant(data.mandant);
        } else {
          // Fallback falls API zwar 200 gibt, aber keine Daten
          setDemoData();
        }
      } else {
        // API-Fehler (z.B. Prisma nicht verfügbar) → Demo-Daten
        setDemoData();
      }
    } catch {
      setDemoData();
    }
    setLoading(false);
  }

  function setDemoData() {
    setMandant({
      id: 'm1',
      name: 'Demo Transport GmbH',
      strasse: 'Gewerbepark 12',
      plz: '82319',
      ort: 'Starnberg',
      telefon: '08151 998877',
      email: 'info@demo-transport.de',
      logoUrl: null,
      primaryColor: '#2563eb',
      secondaryColor: '#1e40af',
    });
  }

  useEffect(() => {
    loadFirma();
  }, []);

  async function saveFirma(e: React.FormEvent) {
    e.preventDefault();
    if (!mandant) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/firma', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mandant),
      });

      if (res.ok) {
        toast.success(res.headers.get('content-type')?.includes('application/json') 
          ? 'Firmendaten gespeichert (Demo-Modus)' 
          : 'Firmendaten erfolgreich gespeichert');
      } else {
        toast.error('Fehler beim Speichern');
      }
    } catch {
      toast.success('Firmendaten gespeichert (Demo)');
    }
    setSaving(false);
  }

  if (loading || !mandant) {
    return <div className="p-8">Lade Firmendaten...</div>;
  }

  return (
    <div className="p-8 max-w-[800px] mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Building2 className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Meine Firma</h1>
          <p className="text-slate-500">Stammdaten Ihres Unternehmens (White-Label fähig)</p>
        </div>
      </div>

      <form onSubmit={saveFirma} className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Firmenname</label>
          <input
            className="input"
            value={mandant.name}
            onChange={(e) => setMandant({ ...mandant, name: e.target.value })}
            placeholder="Ihr Transportunternehmen GmbH"
          />
          <p className="text-xs text-slate-500 mt-1">Wird im Login, in Rechnungen und im Dashboard angezeigt.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">Straße + Hausnummer</label>
            <input
              className="input"
              value={mandant.strasse}
              onChange={(e) => setMandant({ ...mandant, strasse: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">PLZ</label>
              <input
                className="input"
                value={mandant.plz}
                onChange={(e) => setMandant({ ...mandant, plz: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Ort</label>
              <input
                className="input"
                value={mandant.ort}
                onChange={(e) => setMandant({ ...mandant, ort: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1.5">Telefon</label>
            <input
              className="input"
              value={mandant.telefon || ''}
              onChange={(e) => setMandant({ ...mandant, telefon: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">E-Mail (zentrale Kontaktadresse)</label>
            <input
              type="email"
              className="input"
              value={mandant.email || ''}
              onChange={(e) => setMandant({ ...mandant, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Logo URL (White-Label)</label>
          <input
            className="input"
            value={mandant.logoUrl || ''}
            onChange={(e) => setMandant({ ...mandant, logoUrl: e.target.value })}
            placeholder="https://ihr-unternehmen.de/logo.png"
          />
          <p className="text-xs text-slate-500 mt-1">
            Link zu Ihrem Firmenlogo (White-Label).
          </p>
        </div>

        {/* Branding Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1.5">Primärfarbe (Buttons, Header, Akzente)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-11 w-16 rounded-xl border border-slate-300 p-1"
                value={mandant.primaryColor || '#2563eb'}
                onChange={(e) => setMandant({ ...mandant, primaryColor: e.target.value })}
              />
              <input
                className="input flex-1 font-mono"
                value={mandant.primaryColor || '#2563eb'}
                onChange={(e) => setMandant({ ...mandant, primaryColor: e.target.value })}
                placeholder="#2563eb"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Sekundärfarbe (Hover, Akzente)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-11 w-16 rounded-xl border border-slate-300 p-1"
                value={mandant.secondaryColor || '#1e40af'}
                onChange={(e) => setMandant({ ...mandant, secondaryColor: e.target.value })}
              />
              <input
                className="input flex-1 font-mono"
                value={mandant.secondaryColor || '#1e40af'}
                onChange={(e) => setMandant({ ...mandant, secondaryColor: e.target.value })}
                placeholder="#1e40af"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Speichern...' : 'Änderungen speichern'}
          </button>
          <p className="text-xs text-slate-500 mt-3">
            Diese Daten werden in Rechnungen, E-Mails und im Login-Bereich verwendet. 
            Ideal für White-Label-Lösungen für verschiedene Transportunternehmen.
          </p>
        </div>
      </form>

      {/* Testdaten-Generator für umfassendes Testen aller Funktionen */}
      <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-2xl">
            <Database className="w-7 h-7 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-1">Testdaten für alle Funktionen laden</h2>
            <p className="text-slate-600 mb-4">
              Lädt einen großen, realistischen Datensatz (55 Kunden, 22 Fahrer, 15 Fahrzeuge, 110+ Aufträge über 6 Wochen, viele Wartungen).
              Perfekt, um <strong>Abrechnung, Berichte, Disposition, Abweichungen, Dashboard</strong> und alle anderen Seiten intensiv auszuprobieren.
            </p>

            <button
              onClick={() => {
                const stats = seedLargeDemoDataset();
                if (stats) {
                  toast.success(`Testdaten geladen! ${stats.kunden} Kunden • ${stats.fahrer} Fahrer • ${stats.fahrzeuge} Fahrzeuge • ${stats.auftraege} Aufträge`, { duration: 6000 });
                  setTimeout(() => {
                    toast.info("Bitte jetzt die Seiten neu laden (F5 auf Dashboard, Aufträge, Abrechnung, Berichte, Fahrer, Fahrzeuge)");
                  }, 1200);
                }
              }}
              className="btn btn-primary flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
            >
              <RefreshCw className="w-4 h-4" />
              Jetzt große Testdatenmenge laden (110+ Aufträge)
            </button>

            <p className="text-xs text-slate-500 mt-3">
              Die Daten werden im Browser (localStorage) gespeichert und mit den echten API-Daten gemischt angezeigt. 
              Mit „Daten zurücksetzen“ (unten) kannst du jederzeit zum Minimal-Set zurück.
            </p>

            <button
              onClick={() => {
                if (confirm("Alle Demo-Daten im Browser zurücksetzen?")) {
                  // @ts-ignore
                  import('@/lib/demo-data').then(m => { m.resetDemoData(); toast.success("Demo-Daten zurückgesetzt. Seite neu laden."); });
                }
              }}
              className="mt-3 text-xs text-red-600 hover:text-red-700 underline"
            >
              Demo-Daten komplett zurücksetzen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
