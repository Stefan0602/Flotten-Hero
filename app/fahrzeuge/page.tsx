'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Wrench, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getDemoFahrzeuge, addDemoFahrzeug, getDemoWartungen, addDemoWartung } from '@/lib/demo-data';

interface Fahrzeug {
  id: string;
  kennzeichen: string;
  modell: string;
  baujahr: number;
  kmStand: number;
  status: string;
  anschaffungskosten: number;
}

interface Wartung {
  id: string;
  typ: string;
  datum: string;
  kmStand: number;
  kosten: number;
  beschreibung: string | null;
}

export default function FahrzeugePage() {
  const [fahrzeuge, setFahrzeuge] = useState<Fahrzeug[]>([]);
  const [selectedFahrzeug, setSelectedFahrzeug] = useState<any>(null);
  const [wartungen, setWartungen] = useState<Wartung[]>([]);
  const [showWartungModal, setShowWartungModal] = useState(false);
  const [showNewFahrzeugModal, setShowNewFahrzeugModal] = useState(false);

  const [newFahrzeugForm, setNewFahrzeugForm] = useState({
    kennzeichen: '',
    modell: '',
    baujahr: new Date().getFullYear().toString(),
    kmStand: '0',
    anschaffungskosten: '35000',
    status: 'VERFUEGBAR',
  });

  async function loadFahrzeuge() {
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
  }

  useEffect(() => { loadFahrzeuge(); }, []);

  async function openWartung(fz: any) {
    setSelectedFahrzeug(fz);
    try {
      const res = await fetch(`/api/fahrzeuge/${fz.id}/wartungen`);
      const data = await res.json();
      setWartungen(data);
    } catch {
      setWartungen(getDemoWartungen(fz.id));
    }
    setShowWartungModal(true);
  }

  async function createNewFahrzeug(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/fahrzeuge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kennzeichen: newFahrzeugForm.kennzeichen,
          modell: newFahrzeugForm.modell,
          baujahr: parseInt(newFahrzeugForm.baujahr),
          kmStand: parseInt(newFahrzeugForm.kmStand),
          anschaffungskosten: parseFloat(newFahrzeugForm.anschaffungskosten),
          status: newFahrzeugForm.status,
        }),
      });
      if (res.ok) {
        toast.success('Fahrzeug erfolgreich angelegt');
      }
    } catch {
      addDemoFahrzeug({
        kennzeichen: newFahrzeugForm.kennzeichen,
        modell: newFahrzeugForm.modell,
        baujahr: parseInt(newFahrzeugForm.baujahr),
        kmStand: parseInt(newFahrzeugForm.kmStand),
        status: newFahrzeugForm.status,
        anschaffungskosten: parseFloat(newFahrzeugForm.anschaffungskosten),
      });
      toast.success('Fahrzeug angelegt (Demo)');
    }
    setShowNewFahrzeugModal(false);
    setNewFahrzeugForm({
      kennzeichen: '',
      modell: '',
      baujahr: new Date().getFullYear().toString(),
      kmStand: '0',
      anschaffungskosten: '35000',
      status: 'VERFUEGBAR',
    });
    loadFahrzeuge();
  }

  async function addWartung(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      await fetch('/api/wartungen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fahrzeugId: selectedFahrzeug.id,
          typ: formData.get('typ') || 'SONSTIGES',
          datum: new Date().toISOString(),
          kmStand: parseInt(formData.get('kmStand') as string) || selectedFahrzeug.kmStand || 0,
          kosten: parseFloat(formData.get('kosten') as string) || 0,
          beschreibung: formData.get('beschreibung') || null,
        }),
      });
      toast.success('Wartungseintrag gespeichert');
      setShowWartungModal(false);
      loadFahrzeuge();
    } catch {
      // Demo fallback using our demo data layer
      addDemoWartung({
        fahrzeugId: selectedFahrzeug.id,
        typ: formData.get('typ') as string || 'SONSTIGES',
        datum: new Date().toISOString(),
        kmStand: parseInt(formData.get('kmStand') as string) || selectedFahrzeug.kmStand || 0,
        kosten: parseFloat(formData.get('kosten') as string) || 0,
        beschreibung: formData.get('beschreibung') as string || null,
      });
      toast.success('Wartung gespeichert (Demo)');
      setShowWartungModal(false);
    }
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Fahrzeugflotte</h1>
          <p className="text-slate-500">25 Fahrzeuge • Wartung, Reinigung, Investitionsplanung</p>
        </div>
        <button onClick={() => setShowNewFahrzeugModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Fahrzeug hinzufügen
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fahrzeuge.map((fz) => (
          <div key={fz.id} className="bg-white border border-slate-200 rounded-3xl p-6 card-hover">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-mono text-lg font-semibold tracking-tight">{fz.kennzeichen}</div>
                <div className="text-sm text-slate-600 mt-0.5">{fz.modell} • {fz.baujahr}</div>
              </div>
              <span className={`status-badge status-${(fz.status || 'VERFUEGBAR').toLowerCase()}`}>{(fz.status || 'VERFUEGBAR').replace('_', ' ')}</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-4 text-sm">
              <div className="text-slate-500">Kilometerstand</div>
              <div className="font-medium text-right">{(fz.kmStand ?? 0).toLocaleString('de-DE')} km</div>
              <div className="text-slate-500 mt-1">Anschaffung</div>
              <div className="font-medium text-right mt-1">€ {(fz.anschaffungskosten ?? 0).toLocaleString('de-DE')}</div>
            </div>

            <div className="mt-6 pt-5 border-t flex gap-3">
              <button onClick={() => openWartung(fz)} className="btn btn-secondary flex-1 text-sm">
                <Wrench className="w-4 h-4" /> Wartungshistorie
              </button>
              <button className="btn btn-ghost flex-1 text-sm" onClick={() => toast('Fahrzeug-Detailansicht (MVP)')}>
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Wartung Modal */}
      {showWartungModal && selectedFahrzeug && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowWartungModal(false)}>
          <div className="modal bg-white rounded-3xl w-full max-w-xl p-7" onClick={e => e.stopPropagation()}>
            <h2 className="font-semibold text-xl">Wartung für {selectedFahrzeug.kennzeichen}</h2>
            <p className="text-sm text-slate-500 mb-5">{selectedFahrzeug.modell}</p>

            <div className="mb-6">
              <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Bisherige Wartungen</div>
              {wartungen.length > 0 ? wartungen.map(w => (
                <div key={w.id} className="text-sm py-2 border-b flex justify-between">
                  <span>{new Date(w.datum || Date.now()).toLocaleDateString('de-DE')} — {w.typ}</span>
                  <span className="font-medium">€ {(w.kosten ?? 0)}</span>
                </div>
              )) : <div className="text-sm text-slate-400 py-3">Noch keine Wartungen erfasst</div>}
            </div>

            <form onSubmit={addWartung} className="space-y-4 border-t pt-5">
              <div className="grid grid-cols-2 gap-4">
                <select name="typ" className="input" required>
                  <option value="REINIGUNG">Reinigung</option>
                  <option value="INSPEKTION">Inspektion</option>
                  <option value="REIFEN">Reifen / Räder</option>
                  <option value="BREMSEN">Bremsen</option>
                  <option value="KLIMA">Klimaanlage</option>
                  <option value="SONSTIGES">Sonstiges</option>
                </select>
                <input name="kmStand" type="number" placeholder="Kilometerstand" className="input" defaultValue={selectedFahrzeug.kmStand ?? 0} required />
              </div>
              <input name="kosten" type="number" step="0.01" placeholder="Kosten in €" className="input" required />
              <textarea name="beschreibung" placeholder="Beschreibung / Notizen" className="input h-20" />
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowWartungModal(false)} className="btn btn-secondary flex-1">Abbrechen</button>
                <button type="submit" className="btn btn-primary flex-1">Wartung speichern</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Neues Fahrzeug Modal */}
      {showNewFahrzeugModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewFahrzeugModal(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold mb-6">Neues Fahrzeug anlegen</h2>

            <form onSubmit={createNewFahrzeug} className="space-y-4">
              <div>
                <label className="text-xs font-medium block mb-1">Kennzeichen *</label>
                <input 
                  className="input" 
                  value={newFahrzeugForm.kennzeichen} 
                  onChange={e => setNewFahrzeugForm({ ...newFahrzeugForm, kennzeichen: e.target.value })} 
                  required 
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Modell *</label>
                <input 
                  className="input" 
                  value={newFahrzeugForm.modell} 
                  onChange={e => setNewFahrzeugForm({ ...newFahrzeugForm, modell: e.target.value })} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1">Baujahr</label>
                  <input type="number" className="input" value={newFahrzeugForm.baujahr} onChange={e => setNewFahrzeugForm({ ...newFahrzeugForm, baujahr: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Aktueller km-Stand</label>
                  <input type="number" className="input" value={newFahrzeugForm.kmStand} onChange={e => setNewFahrzeugForm({ ...newFahrzeugForm, kmStand: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1">Anschaffungspreis (€)</label>
                  <input type="number" className="input" value={newFahrzeugForm.anschaffungskosten} onChange={e => setNewFahrzeugForm({ ...newFahrzeugForm, anschaffungskosten: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Status</label>
                  <select className="input" value={newFahrzeugForm.status} onChange={e => setNewFahrzeugForm({ ...newFahrzeugForm, status: e.target.value })}>
                    <option value="VERFUEGBAR">Verfügbar</option>
                    <option value="IN_WARTUNG">In Wartung</option>
                    <option value="NICHT_VERFUEGBAR">Nicht verfügbar</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowNewFahrzeugModal(false)} className="btn btn-secondary flex-1">Abbrechen</button>
                <button type="submit" className="btn btn-primary flex-1">Fahrzeug anlegen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
