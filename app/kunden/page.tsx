'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { getDemoKunden, addDemoKunde } from '@/lib/demo-data';

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

export default function KundenPage() {
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
        // Merge demo + API data, avoid duplicates
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
    k.name.toLowerCase().includes(search.toLowerCase()) || 
    k.ort.toLowerCase().includes(search.toLowerCase())
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
      vertragsart: form.vertragsart || null,
      rechnungsintervall: form.rechnungsintervall || 'monatlich',
    });

    toast.success('Kunde erfolgreich angelegt (Demo)');
    setShowModal(false);
    setForm({ name: '', strasse: '', plz: '', ort: '', telefon: '', email: '', vertragsart: 'Stammkunde', rechnungsintervall: 'monatlich' });
    loadKunden(); // This will now pick up the new demo customer
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Kunden</h1>
          <p className="text-slate-500 mt-1">Stammdatenverwaltung • 1.000+ Kunden im System</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Neuer Kunde
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Kunde oder Ort suchen..."
              className="input pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500">{filtered.length} Kunden</div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-slate-500 border-b">
              <th className="py-3 px-4">Name / Firma</th>
              <th className="py-3 px-4">Adresse</th>
              <th className="py-3 px-4">Kontakt</th>
              <th className="py-3 px-4">Vertragsart</th>
              <th className="py-3 px-4">Abrechnung</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((k) => (
              <tr key={k.id} className="table-row border-b last:border-none">
                <td className="py-4 px-4 font-medium">{k.name}</td>
                <td className="py-4 px-4 text-sm text-slate-600">{k.strasse}, {k.plz} {k.ort}</td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-0.5 text-sm">
                    {k.telefon && <div className="flex items-center gap-1.5 text-slate-600"><Phone className="w-3.5 h-3.5" />{k.telefon}</div>}
                    {k.email && <div className="flex items-center gap-1.5 text-slate-600"><Mail className="w-3.5 h-3.5" />{k.email}</div>}
                  </div>
                </td>
                <td className="py-4 px-4"><span className="text-xs px-2.5 py-0.5 bg-slate-100 rounded-full">{k.vertragsart}</span></td>
                <td className="py-4 px-4 text-sm capitalize">{k.rechnungsintervall}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="modal bg-white rounded-3xl w-full max-w-lg p-7" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-5">Neuen Kunden anlegen</h2>
            <form onSubmit={createKunde} className="space-y-4">
              <input className="input" placeholder="Name / Firma" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input className="input" placeholder="Straße + Nr." value={form.strasse} onChange={e => setForm({...form, strasse: e.target.value})} required />
                <div className="grid grid-cols-2 gap-4">
                  <input className="input" placeholder="PLZ" value={form.plz} onChange={e => setForm({...form, plz: e.target.value})} required />
                  <input className="input" placeholder="Ort" value={form.ort} onChange={e => setForm({...form, ort: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input className="input" placeholder="Telefon" value={form.telefon} onChange={e => setForm({...form, telefon: e.target.value})} />
                <input className="input" placeholder="E-Mail" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={form.vertragsart} onChange={e => setForm({...form, vertragsart: e.target.value})}>
                  <option>Stammkunde</option><option>Pflegeheim</option><option>Klinik</option><option>Privat</option><option>Firma</option>
                </select>
                <select className="input" value={form.rechnungsintervall} onChange={e => setForm({...form, rechnungsintervall: e.target.value})}>
                  <option value="wöchentlich">Wöchentlich</option>
                  <option value="monatlich">Monatlich</option>
                  <option value="quartalsweise">Quartalsweise</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary flex-1">Abbrechen</button>
                <button type="submit" className="btn btn-primary flex-1">Kunden anlegen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
