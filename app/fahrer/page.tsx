'use client';

import React, { useEffect, useState } from 'react';
import { UserCheck, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getDemoFahrer, addDemoFahrer } from '@/lib/demo-data';

interface Fahrer {
  id: string;
  vorname: string;
  nachname: string;
  fuehrerscheinKlasse: string;
  qualifikationen: string;
  stundenlohn: number;
  status: string;
}

export default function FahrerPage() {
  const [fahrer, setFahrer] = useState<Fahrer[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    vorname: '',
    nachname: '',
    fuehrerscheinKlasse: 'B',
    qualifikationen: 'Rollstuhl',
    stundenlohn: '23.00',
    status: 'AKTIV',
  });

  async function loadFahrer() {
    try {
      const res = await fetch('/api/fahrer');
      const apiData = await res.json();
      const demoData = getDemoFahrer();
      const merged = [...demoData, ...apiData].filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      );
      setFahrer(merged.length > 0 ? merged : apiData);
    } catch {
      setFahrer(getDemoFahrer());
    }
  }

  useEffect(() => { loadFahrer(); }, []);

  return (
    <div className="p-8 max-w-[1100px] mx-auto">
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Fahrer &amp; Personal</h1>
          <p className="text-slate-500">Onboarding, Qualifikationen, Verfügbarkeit und Performance</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Fahrer onboarden
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500">
              <th className="py-3 px-6">Name</th>
              <th className="py-3 px-6">Führerschein</th>
              <th className="py-3 px-6">Qualifikationen</th>
              <th className="py-3 px-6">Stundenlohn</th>
              <th className="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {fahrer.map(f => (
              <tr key={f.id} className="border-t table-row">
                <td className="py-4 px-6 font-medium">{f.vorname} {f.nachname}</td>
                <td className="py-4 px-6 font-mono text-sm">{f.fuehrerscheinKlasse}</td>
                <td className="py-4 px-6 text-sm text-slate-600">{f.qualifikationen.replace(/[\[\]"]/g, '').replace(/,/g, ', ')}</td>
                <td className="py-4 px-6">€ {f.stundenlohn.toFixed(2)}</td>
                <td className="py-4 px-6"><span className={`status-badge status-${f.status.toLowerCase()}`}>{f.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-xs text-slate-500 px-3">
        Qualifikationen sind entscheidend für die Disposition (z. B. Rollstuhl- und Trageeinsätze).
      </div>

      {/* Fahrer Onboarding Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6">Neuen Fahrer onboarden</h2>

            <form onSubmit={(e) => {
              e.preventDefault();
              const newFahrer = addDemoFahrer({
                vorname: form.vorname,
                nachname: form.nachname,
                fuehrerscheinKlasse: form.fuehrerscheinKlasse,
                qualifikationen: `["${form.qualifikationen}"]`,
                stundenlohn: parseFloat(form.stundenlohn),
                status: form.status,
              });
              toast.success('Fahrer erfolgreich angelegt (Demo)');
              setShowModal(false);
              setForm({ vorname: '', nachname: '', fuehrerscheinKlasse: 'B', qualifikationen: 'Rollstuhl', stundenlohn: '23.00', status: 'AKTIV' });
              loadFahrer();
            }} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1">Vorname</label>
                  <input className="input" value={form.vorname} onChange={e => setForm({ ...form, vorname: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Nachname</label>
                  <input className="input" value={form.nachname} onChange={e => setForm({ ...form, nachname: e.target.value })} required />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Führerschein</label>
                <input className="input" value={form.fuehrerscheinKlasse} onChange={e => setForm({ ...form, fuehrerscheinKlasse: e.target.value })} placeholder="B, BE, C1..." />
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Qualifikationen</label>
                <input className="input" value={form.qualifikationen} onChange={e => setForm({ ...form, qualifikationen: e.target.value })} placeholder="Rollstuhl, Trage, Intensiv" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1">Stundenlohn (€)</label>
                  <input type="number" step="0.5" className="input" value={form.stundenlohn} onChange={e => setForm({ ...form, stundenlohn: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Status</label>
                  <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="AKTIV">AKTIV</option>
                    <option value="URLAUB">URLAUB</option>
                    <option value="KRANK">KRANK</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Abbrechen</button>
                <button type="submit" className="btn btn-primary flex-1">Fahrer anlegen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
