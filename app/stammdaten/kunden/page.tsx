'use client';

import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, Phone, Mail, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getDemoKunden, addDemoKunde } from '@/lib/demo-data';
import StammdatenLayout from '@/components/StammdatenLayout';

interface Kunde {
  id: string;
  name: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string | null;
  email: string | null;
  vertragsart: string | null;
  rechnungsintervall: string;
}

export default function StammdatenKunden() {
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '', strasse: '', plz: '', ort: '', telefon: '', email: '', vertragsart: 'Stammkunde', rechnungsintervall: 'monatlich'
  });

  async function loadKunden() {
    setLoading(true);
    try {
      const res = await fetch('/api/kunden');
      if (res.ok) {
        const data = await res.json();
        const demoKunden = getDemoKunden();
        const merged = [...demoKunden, ...data].filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        );
        setKunden(merged.length > 0 ? merged : data);
      }
    } catch {
      setKunden(getDemoKunden());
    }
    setLoading(false);
  }

  useEffect(() => { loadKunden(); }, []);

  const filtered = kunden.filter(k =>
    (k.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (k.ort || '').toLowerCase().includes(search.toLowerCase())
  );

  async function createKunde(e: React.FormEvent) {
    e.preventDefault();

    const newKunde = addDemoKunde({
      name: form.name,
      strasse: form.strasse,
      plz: form.plz,
      ort: form.ort,
      telefon: form.telefon || null,
      email: form.email || null,
      vertragsart: form.vertragsart,
      rechnungsintervall: form.rechnungsintervall,
    });

    setKunden(prev => [...prev, newKunde]);
    setShowModal(false);
    setForm({ name: '', strasse: '', plz: '', ort: '', telefon: '', email: '', vertragsart: 'Stammkunde', rechnungsintervall: 'monatlich' });

    toast.success('Kunde erfolgreich angelegt');
  }

  return (
    <StammdatenLayout
      title="Kunden"
      description="Stammdatenverwaltung – Kunden & Verträge"
      icon={<Users className="w-6 h-6 text-blue-600" />}
      onNew={() => setShowModal(true)}
      newLabel="Neuen Kunden anlegen"
      stats={
        <>
          <div className="bg-blue-50 px-4 py-2 rounded-2xl text-sm flex items-center gap-2">
            <span className="font-medium">{kunden.length}</span> Kunden gesamt
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-2xl text-sm flex items-center gap-2">
            <span className="font-medium">{kunden.filter(k => k.vertragsart === 'Pflegeheim' || k.vertragsart === 'Klinik').length}</span> Institutionen
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
            placeholder="Kunden oder Ort suchen..."
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
        <div className="text-center py-12 text-slate-500">Keine Kunden gefunden.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Adresse</th>
                <th className="pb-3 font-medium">Vertragsart</th>
                <th className="pb-3 font-medium">Rechnungsintervall</th>
                <th className="pb-3 font-medium text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((kunde) => (
                <tr key={kunde.id} className="border-b last:border-none hover:bg-slate-50">
                  <td className="py-4 font-medium">{kunde.name}</td>
                  <td className="py-4 text-slate-600">
                    {kunde.strasse}, {kunde.plz} {kunde.ort}
                  </td>
                  <td className="py-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100">
                      {kunde.vertragsart || '—'}
                    </span>
                  </td>
                  <td className="py-4 text-slate-600">{kunde.rechnungsintervall}</td>
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
            <h3 className="text-xl font-semibold mb-6">Neuen Kunden anlegen</h3>
            <form onSubmit={createKunde} className="space-y-4">
              <input className="input" placeholder="Name des Kunden" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input className="input" placeholder="Straße + Nr." value={form.strasse} onChange={e => setForm({ ...form, strasse: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <input className="input" placeholder="PLZ" value={form.plz} onChange={e => setForm({ ...form, plz: e.target.value })} required />
                <input className="input" placeholder="Ort" value={form.ort} onChange={e => setForm({ ...form, ort: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary w-full mt-4">Kunden anlegen</button>
            </form>
          </div>
        </div>
      )}
    </StammdatenLayout>
  );
}
