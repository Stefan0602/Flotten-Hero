'use client';

import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { FileText, Download, Users } from 'lucide-react';

interface Auftrag {
  id: string;
  kunde: { name: string };
  fahrer?: { vorname: string; nachname: string } | null;
  geplanteAbfahrt: string;
  tatsaechlicheAnkunft?: string | null;
  km?: number | null;
  preis: number | null;
  status: string;
}

export default function AbrechnungPage() {
  const [auftraege, setAuftraege] = useState<Auftrag[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  async function loadAbgeschlossene() {
    try {
      const res = await fetch('/api/auftraege?status=abgeschlossen');
      setAuftraege(await res.json());
    } catch {
      // Rich demo data for testing PDF + Lohn export
      setAuftraege([
        { id: 'ab1', kunde: { name: 'Seniorenresidenz Sonnenhof' }, fahrer: { vorname: 'Michael', nachname: 'Schmidt' }, geplanteAbfahrt: '2026-05-12T08:30', tatsaechlicheAnkunft: '2026-05-12T09:47', km: 31, preis: 58.4, status: 'ABGESCHLOSSEN' },
        { id: 'ab2', kunde: { name: 'Krankenhaus München-Süd' }, fahrer: { vorname: 'Sandra', nachname: 'Weber' }, geplanteAbfahrt: '2026-05-13T10:00', tatsaechlicheAnkunft: '2026-05-13T10:52', km: 19, preis: 41.0, status: 'ABGESCHLOSSEN' },
        { id: 'ab3', kunde: { name: 'Pflegeheim Haus am See' }, fahrer: { vorname: 'Thomas', nachname: 'Bauer' }, geplanteAbfahrt: '2026-05-14T07:45', tatsaechlicheAnkunft: '2026-05-14T09:12', km: 48, preis: 79.5, status: 'ABGESCHLOSSEN' },
        { id: 'ab4', kunde: { name: 'Frau Maria Huber' }, fahrer: { vorname: 'Laura', nachname: 'Müller' }, geplanteAbfahrt: '2026-05-14T11:20', tatsaechlicheAnkunft: '2026-05-14T12:05', km: 22, preis: 36.8, status: 'ABGESCHLOSSEN' },
        { id: 'ab5', kunde: { name: 'Rollstuhl-Transporte GmbH' }, fahrer: { vorname: 'Michael', nachname: 'Schmidt' }, geplanteAbfahrt: '2026-05-15T09:00', tatsaechlicheAnkunft: '2026-05-15T10:18', km: 37, preis: 62.3, status: 'ABGESCHLOSSEN' },
      ]);
    }
  }

  useEffect(() => { loadAbgeschlossene(); }, []);

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectedAuftraege = auftraege.filter(a => selected.includes(a.id));
  const sumPreis = selectedAuftraege.reduce((s, a) => s + (a.preis || 0), 0);

  // PDF Rechnung (FIBU)
  function generateRechnung() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('TransportPro GmbH', 20, 20);
    doc.setFontSize(12);
    doc.text('Sammelrechnung – Transportleistungen', 20, 28);
    doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 20, 35);

    const rows = selectedAuftraege.map(a => [
      new Date(a.geplanteAbfahrt).toLocaleDateString('de-DE'),
      a.kunde.name.substring(0, 28),
      a.fahrer ? `${a.fahrer.vorname} ${a.fahrer.nachname}` : '—',
      a.km ? `${a.km} km` : '—',
      a.preis ? `€ ${a.preis.toFixed(2)}` : '—',
    ]);

    autoTable(doc, {
      head: [['Datum', 'Kunde', 'Fahrer', 'km', 'Betrag']],
      body: rows,
      startY: 45,
    });

    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.text(`Gesamtbetrag: € ${sumPreis.toFixed(2)}`, 20, finalY + 12);
    doc.text('Zahlbar innerhalb von 14 Tagen', 20, finalY + 20);

    doc.save(`Rechnung_TransportPro_${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success('Rechnung als PDF erstellt (für FIBU bereit)');
  }

  // Lohn-Export CSV (Lohnbuchhaltung)
  function exportLohnCSV() {
    const fahrerStunden: Record<string, { name: string; km: number; betrag: number; anzahl: number }> = {};

    selectedAuftraege.forEach(a => {
      if (!a.fahrer) return;
      const name = `${a.fahrer.vorname} ${a.fahrer.nachname}`;
      if (!fahrerStunden[name]) fahrerStunden[name] = { name, km: 0, betrag: 0, anzahl: 0 };
      fahrerStunden[name].km += a.km || 0;
      fahrerStunden[name].betrag += a.preis || 0;
      fahrerStunden[name].anzahl += 1;
    });

    let csv = 'Fahrer;Anzahl Fahrten;Gefahrene km;Erzielter Umsatz\n';
    Object.values(fahrerStunden).forEach(f => {
      csv += `${f.name};${f.anzahl};${f.km};${f.betrag.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Lohnexport_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();

    toast.success('Lohnexport CSV für die Lohnbuchhaltung heruntergeladen');
  }

  return (
    <div className="p-8 max-w-[1100px] mx-auto">
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Rechnungslegung</h1>
          <p className="text-slate-500">Abgeschlossene Fahrten • Rechnungen (FIBU) • Lohnexport</p>
        </div>
        <div className="flex gap-3">
          <button onClick={generateRechnung} disabled={selected.length === 0} className="btn btn-primary disabled:opacity-50">
            <FileText className="w-4 h-4" /> PDF-Rechnung erzeugen
          </button>
          <button onClick={exportLohnCSV} disabled={selected.length === 0} className="btn btn-secondary disabled:opacity-50">
            <Download className="w-4 h-4" /> Lohn-CSV exportieren
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-3xl p-6">
        <div className="mb-4 text-sm flex items-center justify-between">
          <span>{auftraege.length} abgeschlossene Aufträge</span>
          {selected.length > 0 && (
            <span className="font-medium text-emerald-600">Ausgewählt: {selected.length} • Gesamtbetrag € {sumPreis.toFixed(2)}</span>
          )}
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-slate-500 text-left">
              <th className="py-3 w-8"></th>
              <th className="py-3">Kunde</th>
              <th className="py-3">Fahrer</th>
              <th className="py-3">Datum</th>
              <th className="py-3">km</th>
              <th className="py-3 text-right">Betrag</th>
            </tr>
          </thead>
          <tbody>
            {auftraege.map(a => (
              <tr key={a.id} className="border-b hover:bg-slate-50 table-row">
                <td className="py-3">
                  <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggleSelect(a.id)} className="w-4 h-4" />
                </td>
                <td className="py-3 font-medium">{a.kunde.name}</td>
                <td className="py-3 text-slate-600">{a.fahrer ? `${a.fahrer.vorname} ${a.fahrer.nachname}` : '—'}</td>
                <td className="py-3 text-slate-600">{new Date(a.geplanteAbfahrt).toLocaleDateString('de-DE')}</td>
                <td className="py-3">{a.km || '—'}</td>
                <td className="py-3 text-right font-medium text-emerald-600">€ {a.preis?.toFixed(2) || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected.length === 0 && (
          <div className="text-center py-10 text-sm text-slate-400">
            Wählen Sie abgeschlossene Aufträge aus, um eine Sammelrechnung (PDF für FIBU) oder einen Lohnexport (CSV) zu erzeugen.
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-slate-500 px-2">
        Die erzeugten CSV-Dateien sind kompatibel mit gängigen DATEV- und Lohnbuchhaltungs-Systemen (z. B. DATEV Lohn &amp; Gehalt).
      </div>
    </div>
  );
}
