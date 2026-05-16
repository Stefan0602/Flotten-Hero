'use client';

import React, { useEffect, useState } from 'react';
import { Truck, Plus, Search, Edit2, Trash2, Wrench } from 'lucide-react';
import { toast } from 'sonner';
import { getDemoFahrzeuge, addDemoFahrzeug } from '@/lib/demo-data';
import StammdatenLayout from '@/components/StammdatenLayout';

interface Fahrzeug {
  id: string;
  kennzeichen: string;
  modell: string;
  baujahr: number;
  kmStand: number;
  status: string;
  anschaffungskosten: number;
}

export default function StammdatenFahrzeuge() {
  const [fahrzeuge, setFahrzeuge] = useState<Fahrzeug[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    kennzeichen: '',
    modell: '',
    baujahr: new Date().getFullYear().toString(),
    kmStand: '0',
    status: 'VERFUEGBAR',
    anschaffungskosten: '45000',
  });

  async function loadFahrzeuge() {
    setLoading(true);
    try {
      const res = await fetch('/api/fahrzeuge');
      const apiData = await res.json();
      const demoData = getDemoFahrzeuge();
      const merged = [...demoData, ...apiData].filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      );
      setFahrzeuge(merged.length > 0 ? merged : apiData);
    } catch {
      setFahrzeuge(getDemoFahrzeuge());
    }
    setLoading(false);
  }

  useEffect(() => { loadFahrzeuge(); }, []);

  const filtered = fahrzeuge.filter(f =>
    (f.kennzeichen || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.modell || '').toLowerCase().includes(search.toLowerCase())
  );

  const verfuegbar = fahrzeuge.filter(f => f.status === 'VERFUEGBAR').length;
  const inWartung = fahrzeuge.filter(f => f.status === 'IN_WARTUNG').length;
  const nichtVerfuegbar = fahrzeuge.filter(f => f.status === 'NICHT_VERFUEGBAR').length;

  async function createFahrzeug(e: React.FormEvent) {
    e.preventDefault();

    const newFahrzeug = addDemoFahrzeug({
      kennzeichen: form.kennzeichen,
      modell: form.modell,
      baujahr: parseInt(form.baujahr),
      kmStand: parseInt(form.kmStand),
      status: form.status,
      anschaffungskosten: parseFloat(form.anschaffungskosten),
    });

    setFahrzeuge(prev => [...prev, newFahrzeug]);
    setShowModal(false);
    setForm({
      kennzeichen: '',
      modell: '',
      baujahr: new Date().getFullYear().toString(),
      kmStand: '0',
      status: 'VERFUEGBAR',
      anschaffungskosten: '45000',
    });

    toast.success('Fahrzeug erfolgreich angelegt');
  }

  return (
    <StammdatenLayout
      title="Fahrzeuge"
      description="Stammdatenverwaltung – Fahrzeuge und Verfügbarkeit"
      icon={<Truck className="w-6 h-6 text-orange-600" />}
      onNew={() => setShowModal(true)}
      newLabel="Neues Fahrzeug anlegen"
      stats={
        <>
          <div className="bg-orange-50 px-4 py-2 rounded-2xl text-sm flex items-center gap-2">
            <span className="font-medium">{verfuegbar}</span> Verfügbar
          </div>
          <div className="bg-amber-50 px-4 py-2 rounded-2xl text-sm flex items-center gap-2">
            <span className="font-medium">{inWartung}</span> In Wartung
          </div>
          <div className="bg-slate-100 px-4 py-2 rounded-2xl text-sm flex items-center gap-2">
            <span className="font-medium">{nichtVerfuegbar}</span> Nicht verfügbar
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-2xl text-sm flex items-center gap-2">
            Gesamt: <span className="font-medium">{fahrzeuge.length}</span>
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
            placeholder="Kennzeichen oder Modell suchen..."
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
        <div className="text-center py-12 text-slate-500">Keine Fahrzeuge gefunden.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3 font-medium">Kennzeichen</th>
                <th className="pb-3 font-medium">Modell</th>
                <th className="pb-3 font-medium">Baujahr</th>
                <th className="pb-3 font-medium">km-Stand</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((fz) => (
                <tr key={fz.id} className="border-b last:border-none hover:bg-slate-50">
                  <td className="py-4 font-semibold font-mono">{fz.kennzeichen || '—'}</td>
                  <td className="py-4">{fz.modell || '—'}</td>
                  <td className="py-4">{fz.baujahr || '—'}</td>
                  <td className="py-4">{(fz.kmStand || 0).toLocaleString('de-DE')} km</td>
                  <td className="py-4">
                    <span className={`status-badge status-${(fz.status || 'unknown').toLowerCase()}`}>
                      {(fz.status || 'Unbekannt').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-600" title="Wartung">
                        <Wrench className="w-4 h-4" />
                      </button>
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
            <h3 className="text-xl font-semibold mb-6">Neues Fahrzeug anlegen</h3>
            <form onSubmit={createFahrzeug} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input className="input" placeholder="Kennzeichen (z.B. STA-AB 1234)" value={form.kennzeichen} onChange={e => setForm({ ...form, kennzeichen: e.target.value })} required />
                <input className="input" placeholder="Modell" value={form.modell} onChange={e => setForm({ ...form, modell: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" className="input" placeholder="Baujahr" value={form.baujahr} onChange={e => setForm({ ...form, baujahr: e.target.value })} required />
                <input type="number" className="input" placeholder="km-Stand" value={form.kmStand} onChange={e => setForm({ ...form, kmStand: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                  <option value="VERFUEGBAR">Verfügbar</option>
                  <option value="IN_WARTUNG">In Wartung</option>
                  <option value="NICHT_VERFUEGBAR">Nicht verfügbar</option>
                </select>
                <input type="number" step="500" className="input" placeholder="Anschaffungskosten (€)" value={form.anschaffungskosten} onChange={e => setForm({ ...form, anschaffungskosten: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary w-full mt-4">Fahrzeug anlegen</button>
            </form>
          </div>
        </div>
      )}
    </StammdatenLayout>
  );
}
