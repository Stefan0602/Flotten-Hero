'use client';

import React, { useEffect, useState } from 'react';
import { UserCheck, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getDemoFahrer, addDemoFahrer } from '@/lib/demo-data';
import StammdatenLayout from '@/components/StammdatenLayout';

interface Fahrer {
  id: string;
  vorname: string;
  nachname: string;
  fuehrerscheinKlasse: string;
  qualifikationen: string;
  stundenlohn: number;
  status: string;
}

export default function StammdatenFahrer() {
  const [fahrer, setFahrer] = useState<Fahrer[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    vorname: '',
    nachname: '',
    fuehrerscheinKlasse: 'B',
    qualifikationen: 'Rollstuhl',
    stundenlohn: '23.00',
    status: 'AKTIV',
  });

  async function loadFahrer() {
    setLoading(true);
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
    setLoading(false);
  }

  useEffect(() => { loadFahrer(); }, []);

  const filtered = fahrer.filter(f =>
    `${f.vorname || ''} ${f.nachname || ''}`.toLowerCase().includes(search.toLowerCase()) ||
    (f.qualifikationen || '').toLowerCase().includes(search.toLowerCase())
  );

  const aktiveFahrer = fahrer.filter(f => f.status === 'AKTIV').length;
  const urlaubKrank = fahrer.filter(f => f.status === 'URLAUB' || f.status === 'KRANK').length;
  const avgLohn = fahrer.length > 0 
    ? (fahrer.reduce((sum, f) => sum + f.stundenlohn, 0) / fahrer.length).toFixed(2) 
    : '0.00';

  async function createFahrer(e: React.FormEvent) {
    e.preventDefault();

    const newFahrer = addDemoFahrer({
      vorname: form.vorname,
      nachname: form.nachname,
      fuehrerscheinKlasse: form.fuehrerscheinKlasse,
      qualifikationen: JSON.stringify(form.qualifikationen.split(',').map(q => q.trim())),
      stundenlohn: parseFloat(form.stundenlohn),
      status: form.status,
    });

    setFahrer(prev => [...prev, newFahrer]);
    setShowModal(false);
    setForm({ vorname: '', nachname: '', fuehrerscheinKlasse: 'B', qualifikationen: 'Rollstuhl', stundenlohn: '23.00', status: 'AKTIV' });

    toast.success('Fahrer erfolgreich angelegt');
  }

  return (
    <StammdatenLayout
      title="Fahrer"
      description="Stammdatenverwaltung – Fahrer, Qualifikationen &amp; Verfügbarkeit"
      icon={<UserCheck className="w-6 h-6 text-emerald-600" />}
      onNew={() => setShowModal(true)}
      newLabel="Fahrer onboarden"
      stats={
        <>
          <div className="bg-emerald-50 px-4 py-2 rounded-2xl text-sm flex items-center gap-2">
            <span className="font-medium">{aktiveFahrer}</span> Aktiv
          </div>
          <div className="bg-amber-50 px-4 py-2 rounded-2xl text-sm flex items-center gap-2">
            <span className="font-medium">{urlaubKrank}</span> Urlaub / Krank
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-2xl text-sm flex items-center gap-2">
            Ø Stundenlohn: <span className="font-medium">€ {avgLohn}</span>
          </div>
        </>
      }
    >
      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Name oder Qualifikation suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Lade Daten...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">Keine Fahrer gefunden.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Führerschein</th>
                <th className="pb-3 font-medium">Qualifikationen</th>
                <th className="pb-3 font-medium">Stundenlohn</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} className="border-b last:border-none hover:bg-slate-50">
                  <td className="py-4 font-medium">{f.vorname} {f.nachname}</td>
                  <td className="py-4 font-mono text-sm">{f.fuehrerscheinKlasse}</td>
                  <td className="py-4 text-sm text-slate-600">
                    {f.qualifikationen.replace(/[\[\]"]/g, '').replace(/,/g, ', ')}
                  </td>
                  <td className="py-4">€ {f.stundenlohn.toFixed(2)}</td>
                  <td className="py-4">
                    <span className={`status-badge status-${(f.status || 'unknown').toLowerCase()}`}>
                      {f.status || 'Unbekannt'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-600">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-xl text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-7 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-6">Neuen Fahrer onboarden</h3>
            <form onSubmit={createFahrer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input className="input" placeholder="Vorname" value={form.vorname} onChange={e => setForm({ ...form, vorname: e.target.value })} required />
                <input className="input" placeholder="Nachname" value={form.nachname} onChange={e => setForm({ ...form, nachname: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={form.fuehrerscheinKlasse} onChange={e => setForm({ ...form, fuehrerscheinKlasse: e.target.value })}>
                  <option value="B">B</option>
                  <option value="B, BE">B, BE</option>
                  <option value="B, BE, C1">B, BE, C1</option>
                </select>
                <input className="input" placeholder="Qualifikationen (kommagetrennt)" value={form.qualifikationen} onChange={e => setForm({ ...form, qualifikationen: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.5" className="input" placeholder="Stundenlohn (€)" value={form.stundenlohn} onChange={e => setForm({ ...form, stundenlohn: e.target.value })} required />
                <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="AKTIV">Aktiv</option>
                  <option value="URLAUB">Urlaub</option>
                  <option value="KRANK">Krank</option>
                  <option value="INAKTIV">Inaktiv</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-full mt-4">Fahrer anlegen</button>
            </form>
          </div>
        </div>
      )}
    </StammdatenLayout>
  );
}
