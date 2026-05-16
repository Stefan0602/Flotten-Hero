'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Upload, Zap, FileJson, ClipboardList } from 'lucide-react';
import { addDemoAuftrag } from '@/lib/demo-data';

export default function NeuerAuftrag() {
  const [form, setForm] = useState({
    kundeName: '',
    pickup: '',
    dropoff: '',
    datum: '',
    uhrzeit: '08:30',
    preis: '',
  });

  const [importJson, setImportJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Manueller Auftrag
  async function submit(e: React.FormEvent) {
    e.preventDefault();

    addDemoAuftrag({
      kundeName: form.kundeName,
      pickupAdresse: form.pickup,
      dropoffAdresse: form.dropoff,
      geplanteAbfahrt: `${form.datum}T${form.uhrzeit}:00`,
      preis: parseFloat(form.preis) || 45,
    });

    toast.success('Auftrag erfolgreich angelegt (Demo). Er erscheint jetzt in der Disposition.');

    setForm({
      kundeName: '',
      pickup: '',
      dropoff: '',
      datum: '',
      uhrzeit: '08:30',
      preis: '',
    });
  }

  // === SCHNITTSTELLEN-IMPORT ===

  // Simuliert das Laden von Daten von einer externen Schnittstelle (z.B. Krankenhaus-Buchungssystem)
  function simulateExternalInterface() {
    setIsImporting(true);

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const mockOrders = [
      { kundeName: 'Krankenhaus München-Süd', pickup: 'Thalkirchner Str. 48, 81371 München', dropoff: 'Klinikum Großhadern, Marchioninistr. 15', datum: today, uhrzeit: '09:15', preis: 52 },
      { kundeName: 'Seniorenresidenz Sonnenhof', pickup: 'Am Park 12, 82319 Starnberg', dropoff: 'MVZ Radiologie Starnberg', datum: today, uhrzeit: '10:30', preis: 38 },
      { kundeName: 'Pflegeheim Haus am See', pickup: 'Seestraße 22, 82418 Murnau', dropoff: 'Krankenhaus Starnberg', datum: today, uhrzeit: '14:00', preis: 61 },
      { kundeName: 'Klinikum Landsberg', pickup: 'Bgm.-Dr.-Hartl-Ring 1, 86899 Landsberg', dropoff: 'Orthopädische Praxis Dr. Lang', datum: today, uhrzeit: '07:45', preis: 67 },
      { kundeName: 'Frau Helga Fischer', pickup: 'Rosenweg 8, 82347 Penzberg', dropoff: 'Kreisklinik Wolfratshausen', datum: today, uhrzeit: '11:20', preis: 44 },
      { kundeName: 'AWO Pflegedienst', pickup: 'Schulstraße 9, 82178 Puchheim', dropoff: 'Reha-Zentrum Starnberger See', datum: today, uhrzeit: '15:45', preis: 49 },
      { kundeName: 'Seniorenzentrum Bergblick', pickup: 'Am Berg 1, 82494 Krün', dropoff: 'Klinikum Garmisch-Partenkirchen', datum: today, uhrzeit: '08:00', preis: 73 },
      { kundeName: 'Herr Josef Maier', pickup: 'Bahnhofstraße 44, 82362 Weilheim', dropoff: 'MVZ Weilheim', datum: today, uhrzeit: '13:10', preis: 29 },
    ];

    let imported = 0;
    mockOrders.forEach(order => {
      addDemoAuftrag({
        kundeName: order.kundeName,
        pickupAdresse: order.pickup,
        dropoffAdresse: order.dropoff,
        geplanteAbfahrt: `${order.datum}T${order.uhrzeit}:00`,
        preis: order.preis,
      });
      imported++;
    });

    toast.success(`${imported} Aufträge erfolgreich per Schnittstelle importiert!`, {
      description: 'Die Aufträge sind jetzt in der Disposition verfügbar.',
      duration: 6000,
    });

    setIsImporting(false);
  }

  // JSON-Import (Textarea oder Datei)
  function handleJsonImport() {
    if (!importJson.trim()) {
      toast.error('Bitte JSON-Array mit Aufträgen einfügen.');
      return;
    }

    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) throw new Error('JSON muss ein Array sein');

      let imported = 0;
      parsed.forEach((item: any) => {
        if (item.kundeName && item.pickupAdresse && item.dropoffAdresse) {
          addDemoAuftrag({
            kundeName: item.kundeName,
            pickupAdresse: item.pickupAdresse,
            dropoffAdresse: item.dropoffAdresse,
            geplanteAbfahrt: item.geplanteAbfahrt || `${new Date().toISOString().split('T')[0]}T08:30:00`,
            preis: item.preis || 45,
          });
          imported++;
        }
      });

      toast.success(`${imported} Aufträge aus JSON importiert.`);
      setImportJson('');
    } catch (e) {
      toast.error('Fehler beim Parsen des JSON. Bitte gültiges Array prüfen.');
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJson(content);
      toast.info('Datei geladen. Jetzt auf "JSON importieren" klicken.');
    };
    reader.readAsText(file);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/dashboard" className="text-sm flex items-center gap-1 text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Zurück zum Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <ClipboardList className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-semibold tracking-tight">Beauftragung</h1>
      </div>
      <p className="text-slate-500 mb-8">Aufträge manuell erfassen oder per Schnittstelle importieren</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* MANUELLE BEAUFTRAGUNG */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-xl"><ClipboardList className="w-5 h-5 text-blue-600" /></div>
            <h2 className="text-xl font-semibold">Manuelle Beauftragung</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">Einzelnen Auftrag schnell erfassen</p>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-xs font-medium block mb-1.5">Kunde / Auftraggeber</label>
              <input className="input" placeholder="z.B. Seniorenresidenz Sonnenhof" value={form.kundeName} onChange={e => setForm({ ...form, kundeName: e.target.value })} required />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1.5">Abholadresse</label>
                <input className="input" placeholder="Straße, PLZ Ort" value={form.pickup} onChange={e => setForm({ ...form, pickup: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5">Zieladresse</label>
                <input className="input" placeholder="Krankenhaus / Klinik / Praxis" value={form.dropoff} onChange={e => setForm({ ...form, dropoff: e.target.value })} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1.5">Datum</label>
                <input type="date" className="input" value={form.datum} onChange={e => setForm({ ...form, datum: e.target.value })} required />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1.5">Uhrzeit (geplant)</label>
                <input type="time" className="input" value={form.uhrzeit} onChange={e => setForm({ ...form, uhrzeit: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium block mb-1.5">Voraussichtlicher Preis (€)</label>
              <input type="number" step="0.5" className="input" value={form.preis} onChange={e => setForm({ ...form, preis: e.target.value })} required />
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2">Auftrag anlegen und zur Disposition weiterleiten</button>
          </form>
        </div>

        {/* SCHNITTSTELLEN-IMPORT */}
        <div className="bg-white border border-slate-200 rounded-3xl p-7">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-100 rounded-xl"><Zap className="w-5 h-5 text-emerald-600" /></div>
            <h2 className="text-xl font-semibold">Daten per Schnittstelle laden</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">Bulk-Import von externen Systemen (Krankenhäuser, Pflegedienste, Buchungssysteme)</p>

          {/* Schnittstelle simulieren */}
          <div className="mb-6">
            <button
              onClick={simulateExternalInterface}
              disabled={isImporting}
              className="btn btn-primary w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
            >
              <Zap className="w-4 h-4" />
              {isImporting ? 'Schnittstelle wird abgefragt...' : 'Schnittstelle simulieren – 8 realistische Aufträge laden'}
            </button>
            <p className="text-[11px] text-slate-500 mt-2 text-center">Simuliert den Abruf von einer Partner-API (z. B. Krankenhaus-Buchungssystem)</p>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-3">
              <FileJson className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium">JSON-Import (manuell oder Datei)</span>
            </div>

            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder={`[{"kundeName": "Krankenhaus X", "pickupAdresse": "...", "dropoffAdresse": "...", "geplanteAbfahrt": "2026-05-20T09:30:00", "preis": 55}, ...]`}
              className="w-full h-28 text-xs font-mono border rounded-2xl p-3 resize-y"
            />

            <div className="flex gap-3 mt-3">
              <button onClick={handleJsonImport} className="btn btn-secondary flex-1 flex items-center justify-center gap-2">
                <Upload className="w-4 h-4" /> JSON importieren
              </button>

              <label className="btn btn-secondary flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" /> Datei hochladen
                <input type="file" accept=".json,.csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-5">
            Unterstützte Formate: JSON-Array mit den Feldern <code>kundeName</code>, <code>pickupAdresse</code>, <code>dropoffAdresse</code>, optional <code>geplanteAbfahrt</code> und <code>preis</code>.
          </p>
        </div>
      </div>

      <p className="text-xs text-center text-slate-500 mt-8">
        Importierte Aufträge erscheinen sofort in der <Link href="/auftraege/disposition" className="text-blue-600 hover:underline">Disposition</Link> zur weiteren Bearbeitung.
      </p>
    </div>
  );
}
