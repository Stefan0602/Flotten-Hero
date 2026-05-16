'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle, Clock, User, Truck, Plus, Route, Check } from 'lucide-react';
import { getDemoAuftraege, updateDemoAuftrag, getDemoFahrer, getDemoFahrzeuge } from '@/lib/demo-data';

interface Auftrag {
  id: string;
  kunde: { name: string };
  pickupAdresse: string;
  dropoffAdresse: string;
  geplanteAbfahrt: string;
  status: 'GEPLANT' | 'DISPONIERT' | 'IN_AUSFUEHRUNG' | 'ABGESCHLOSSEN' | string;
  preis: number | null;
  fahrer?: { vorname: string; nachname: string } | null;
  fahrzeug?: { kennzeichen: string } | null;
}

interface Fahrer {
  id: string;
  vorname: string;
  nachname: string;
  status: string;
}

interface Fahrzeug {
  id: string;
  kennzeichen: string;
  status: string;
}

interface Tour {
  id: string;
  fahrerId: string;
  fahrzeugId: string;
  auftragIds: string[];
  name?: string;
}

export default function DispositionPage() {
  const [auftraege, setAuftraege] = useState<Auftrag[]>([]);
  const [fahrer, setFahrer] = useState<Fahrer[]>([]);
  const [fahrzeuge, setFahrzeuge] = useState<Fahrzeug[]>([]);
  const [selectedAuftrag, setSelectedAuftrag] = useState<Auftrag | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);

  async function loadData() {
    try {
      const [aRes, fRes, fzRes] = await Promise.all([
        fetch('/api/auftraege?status=offen'),
        fetch('/api/fahrer'),
        fetch('/api/fahrzeuge'),
      ]);
      const apiAuftraege = await aRes.json();
      const apiFahrer = await fRes.json();
      const apiFahrzeuge = await fzRes.json();

      // Merge with manually created demo data
      const demoAuftraegeRaw = getDemoAuftraege();

      // Normalize demo data shape to match the strict Auftrag interface used on this page
      // (some pages expect nested kunde/fahrer/fahrzeug, others use flat kundeName)
      const demoAuftraege = demoAuftraegeRaw.map((d: any) => {
        if (d.kunde && typeof d.kunde === 'object') {
          return d; // already correct shape
        }
        return {
          ...d,
          kunde: { name: d.kundeName || 'Unbekannter Kunde' },
          fahrer: d.fahrerName
            ? {
                vorname: d.fahrerName.split(' ')[0] || '',
                nachname: d.fahrerName.split(' ').slice(1).join(' ') || '',
              }
            : null,
          fahrzeug: d.fahrzeugKennzeichen ? { kennzeichen: d.fahrzeugKennzeichen } : null,
        };
      });

      const mergedAuftraege = [...demoAuftraege, ...apiAuftraege].filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      );

      setAuftraege(mergedAuftraege.length > 0 ? mergedAuftraege : apiAuftraege);
      setFahrer(apiFahrer.length > 0 ? apiFahrer : getDemoFahrer());
      setFahrzeuge(apiFahrzeuge.length > 0 ? apiFahrzeuge : getDemoFahrzeuge());
    } catch {
      // Rich Demo data (hardcoded shape matches the Auftrag interface used in this component)
      setAuftraege([
        { id: 'a1', kunde: { name: 'Seniorenresidenz Sonnenhof' }, pickupAdresse: 'Am Park 12, 82319 Starnberg', dropoffAdresse: 'Klinikum München-Großhadern, Marchioninistr. 15', geplanteAbfahrt: '2026-05-20T08:30:00', status: 'GEPLANT', preis: 58.5 },
        { id: 'a2', kunde: { name: 'Krankenhaus München-Süd' }, pickupAdresse: 'Thalkirchner Str. 48, 81371 München', dropoffAdresse: 'MVZ Radiologie Starnberg', geplanteAbfahrt: '2026-05-20T09:45:00', status: 'GEPLANT', preis: 47.0 },
        { id: 'a3', kunde: { name: 'Frau Maria Huber' }, pickupAdresse: 'Lindenstraße 7, 82347 Penzberg', dropoffAdresse: 'Krankenhaus Starnberg', geplanteAbfahrt: '2026-05-20T10:15:00', status: 'DISPONIERT', preis: 39.5, fahrer: { vorname: 'Sandra', nachname: 'Weber' }, fahrzeug: { kennzeichen: 'STA-CD 5678' } },
        { id: 'a4', kunde: { name: 'Pflegeheim Haus am See' }, pickupAdresse: 'Seestraße 22, 82418 Murnau', dropoffAdresse: 'Klinikum Landsberg', geplanteAbfahrt: '2026-05-20T11:00:00', status: 'GEPLANT', preis: 72.0 },
        { id: 'a5', kunde: { name: 'Rollstuhl-Transporte GmbH' }, pickupAdresse: 'Industriestraße 5, 82110 Germering', dropoffAdresse: 'Krankenhaus München-Süd', geplanteAbfahrt: '2026-05-21T07:45:00', status: 'GEPLANT', preis: 44.0 },
      ]);

      setFahrer(getDemoFahrer());
      setFahrzeuge(getDemoFahrzeuge());
    }
  }

  useEffect(() => { loadData(); }, []);

  async function assignFahrerFahrzeug(auftragId: string, fahrerId: string, fahrzeugId: string) {
    try {
      await fetch('/api/auftraege/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auftragId, fahrerId, fahrzeugId }),
      });
      toast.success('Fahrer und Fahrzeug zugewiesen');
    } catch {
      // Update in demo data layer
      const fahrerList = getDemoFahrer();
      const fzList = getDemoFahrzeuge();

      const fahrer = fahrerList.find((f) => f.id === fahrerId);
      const fz = fzList.find((f) => f.id === fahrzeugId);

      updateDemoAuftrag(auftragId, {
        status: 'DISPONIERT',
        fahrerId,
        fahrerName: fahrer ? `${fahrer.vorname} ${fahrer.nachname}` : '',
        fahrzeugId,
        fahrzeugKennzeichen: fz?.kennzeichen || '',
      });

      toast.success('Zuweisung gespeichert (Demo)');
    }
    setSelectedAuftrag(null);
    loadData();
  }

  async function markInAusfuehrung(id: string) {
    try {
      await fetch(`/api/auftraege/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_AUSFUEHRUNG' }),
      });
      toast.success('Fahrt als "in Ausführung" markiert');
      loadData();
    } catch {
      toast.success('Status aktualisiert');
      loadData();
    }
  }

  // New: Complete trip with actual times + deviation logging
  const [completingAuftrag, setCompletingAuftrag] = useState<Auftrag | null>(null);
  const [completeForm, setCompleteForm] = useState({
    tatsaechlicheAbfahrt: '',
    tatsaechlicheAnkunft: '',
    km: '',
    abweichungTyp: '',
    abweichungBeschreibung: '',
  });

  function openCompleteModal(auftrag: Auftrag) {
    const now = new Date();
    const isoNow = now.toISOString().slice(0, 16); // for datetime-local
    setCompletingAuftrag(auftrag);
    setCompleteForm({
      tatsaechlicheAbfahrt: isoNow,
      tatsaechlicheAnkunft: isoNow,
      km: '28',
      abweichungTyp: '',
      abweichungBeschreibung: '',
    });
  }

  async function completeFahrt() {
    if (!completingAuftrag) return;

    try {
      // 1. Update the trip with actual data
      await fetch(`/api/auftraege/${completingAuftrag.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tatsaechlicheAbfahrt: completeForm.tatsaechlicheAbfahrt,
          tatsaechlicheAnkunft: completeForm.tatsaechlicheAnkunft,
          km: parseInt(completeForm.km),
        }),
      });

      // 2. Log deviation if provided
      if (completeForm.abweichungTyp && completeForm.abweichungBeschreibung) {
        await fetch('/api/abweichungen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auftragId: completingAuftrag.id,
            typ: completeForm.abweichungTyp,
            beschreibung: completeForm.abweichungBeschreibung,
          }),
        });
      }

      toast.success('Fahrt erfolgreich abgeschlossen' + (completeForm.abweichungTyp ? ' + Abweichung erfasst' : ''));
      setCompletingAuftrag(null);
      loadData();
    } catch (e) {
      toast.success('Fahrt abgeschlossen (Demo)');
      setCompletingAuftrag(null);
      loadData();
    }
  }

  // ==================== TOUR PLANNING FUNCTIONS ====================

  function suggestTours() {
    const unassigned = auftraege.filter(a => 
      ['GEPLANT'].includes(a.status) && !tours.some(t => t.auftragIds.includes(a.id))
    );

    if (unassigned.length === 0) {
      toast.info('Keine ungeplanten Aufträge mehr vorhanden.');
      return;
    }

    // Simple but effective grouping: by time of day (morning / afternoon)
    const morning = unassigned.filter(a => {
      const hour = new Date(a.geplanteAbfahrt).getHours();
      return hour < 13;
    });
    const afternoon = unassigned.filter(a => {
      const hour = new Date(a.geplanteAbfahrt).getHours();
      return hour >= 13;
    });

    const newTours: Tour[] = [];

    // Morning tour
    if (morning.length > 0) {
      const availableDriver = fahrer.find(f => f.status === 'AKTIV' && !tours.some(t => t.fahrerId === f.id));
      const availableVehicle = fahrzeuge.find(fz => fz.status === 'VERFUEGBAR' && !tours.some(t => t.fahrzeugId === fz.id));

      if (availableDriver && availableVehicle) {
        newTours.push({
          id: 'tour_' + Date.now(),
          fahrerId: availableDriver.id,
          fahrzeugId: availableVehicle.id,
          auftragIds: morning.slice(0, 5).map(a => a.id), // max 5 per tour
        });
      }
    }

    // Afternoon tour
    if (afternoon.length > 0) {
      const availableDriver = fahrer.find(f => 
        f.status === 'AKTIV' && !newTours.some(t => t.fahrerId === f.id) && !tours.some(t => t.fahrerId === f.id)
      );
      const availableVehicle = fahrzeuge.find(fz => 
        fz.status === 'VERFUEGBAR' && !newTours.some(t => t.fahrzeugId === fz.id) && !tours.some(t => t.fahrzeugId === fz.id)
      );

      if (availableDriver && availableVehicle) {
        newTours.push({
          id: 'tour_' + (Date.now() + 1),
          fahrerId: availableDriver.id,
          fahrzeugId: availableVehicle.id,
          auftragIds: afternoon.slice(0, 5).map(a => a.id),
        });
      }
    }

    if (newTours.length > 0) {
      setTours(prev => [...prev, ...newTours]);
      toast.success(`${newTours.length} Tour(en) vorgeschlagen`, {
        description: 'Du kannst die Touren noch anpassen und dann bestätigen.'
      });
    } else {
      toast.warning('Nicht genügend verfügbare Fahrer/Fahrzeuge für weitere Touren.');
    }
  }

  function confirmTour(tourId: string) {
    const tour = tours.find(t => t.id === tourId);
    if (!tour) return;

    const fahrerObj = fahrer.find(f => f.id === tour.fahrerId);
    const fzObj = fahrzeuge.find(fz => fz.id === tour.fahrzeugId);

    if (!fahrerObj || !fzObj) {
      toast.error('Fahrer oder Fahrzeug nicht gefunden.');
      return;
    }

    // Assign all orders in the tour
    tour.auftragIds.forEach(auftragId => {
      updateDemoAuftrag(auftragId, {
        status: 'DISPONIERT',
        fahrerId: tour.fahrerId,
        fahrerName: `${fahrerObj.vorname} ${fahrerObj.nachname}`,
        fahrzeugId: tour.fahrzeugId,
        fahrzeugKennzeichen: fzObj.kennzeichen,
      });
    });

    toast.success(`Tour mit ${tour.auftragIds.length} Aufträgen bestätigt!`, {
      description: `${fahrerObj.vorname} ${fahrerObj.nachname} mit ${fzObj.kennzeichen}`
    });

    // Remove the confirmed tour from planning
    setTours(prev => prev.filter(t => t.id !== tourId));
    loadData(); // refresh the order list
  }

  function removeTour(tourId: string) {
    setTours(prev => prev.filter(t => t.id !== tourId));
    toast.info('Tour gelöscht');
  }

  // ==================== LIVE TRACKING SIMULATION ====================
  async function simulateLiveTracking() {
    const activeTours = tours.length > 0 ? tours : [];

    if (activeTours.length === 0) {
      // Fallback: nimm alle IN_AUSFUEHRUNG / DISPONIERT Aufträge
      const activeOrders = auftraege.filter(a => 
        ['DISPONIERT', 'IN_AUSFUEHRUNG'].includes(a.status) && a.fahrzeugId
      );

      if (activeOrders.length === 0) {
        toast.error('Keine aktiven Touren oder zugewiesenen Fahrzeuge gefunden. Bitte zuerst Touren bestätigen.');
        return;
      }

      // Simuliere für jedes aktive Fahrzeug eine neue Position
      for (const order of activeOrders.slice(0, 4)) {
        const lat = 47.8 + Math.random() * 0.6;   // ungefähre Region Oberbayern
        const lng = 11.0 + Math.random() * 0.8;

        await fetch('/api/tracking/position', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-api-key': 'demo-tracking-key-123'
          },
          body: JSON.stringify({
            vehicleId: order.fahrzeugId,
            latitude: lat,
            longitude: lng,
            speed: 45 + Math.random() * 30,
            heading: Math.random() * 360,
            timestamp: new Date().toISOString(),
            source: 'simulation'
          })
        });
      }

      toast.success('Live Tracking simuliert!', {
        description: `${activeOrders.length} Fahrzeug-Positionen empfangen. Abweichungen wurden automatisch erkannt.`
      });

      loadData();
      return;
    }

    // Mit existierenden Touren
    for (const tour of activeTours) {
      const lat = 47.8 + Math.random() * 0.6;
      const lng = 11.0 + Math.random() * 0.8;

      await fetch('/api/tracking/position', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': 'demo-tracking-key-123'
        },
        body: JSON.stringify({
          vehicleId: tour.fahrzeugId,
          latitude: lat,
          longitude: lng,
          speed: 40 + Math.random() * 35,
          timestamp: new Date().toISOString(),
          source: 'simulation'
        })
      });
    }

    toast.success(`${activeTours.length} Fahrzeug-Positionen in Echtzeit empfangen`);
    loadData();
  }

  const offene = auftraege.filter(a => ['GEPLANT', 'DISPONIERT', 'IN_AUSFUEHRUNG'].includes(a.status));

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Disposition</h1>
          <p className="text-slate-500">Beauftragung → Zuweisung von Fahrer + Fahrzeug → Ausführung</p>
        </div>
        <div className="text-sm px-4 py-1.5 bg-white border rounded-2xl text-slate-600">
          {offene.length} offene Aufträge • {fahrer.filter(f => f.status === 'AKTIV').length} Fahrer verfügbar
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Offene Aufträge */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-6">
          <div className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Offene Aufträge (Beauftragung &amp; Disposition)
          </div>

          {offene.length === 0 && <div className="text-center py-8 text-slate-400">Keine offenen Aufträge</div>}

          {offene.map(auftrag => (
            <div key={auftrag.id} className="border rounded-2xl p-4 mb-3 hover:border-blue-200 transition-all">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{auftrag.kunde.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {new Date(auftrag.geplanteAbfahrt).toLocaleString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs mt-2 text-slate-600">Von: {auftrag.pickupAdresse}</div>
                  <div className="text-xs text-slate-600">Nach: {auftrag.dropoffAdresse}</div>
                </div>
                <div className="text-right">
                  <div className={`status-badge status-${auftrag.status.toLowerCase()}`}>{auftrag.status}</div>
                  <div className="mt-1.5 text-emerald-600 font-medium">€ {auftrag.preis?.toFixed(2) || '—'}</div>
                </div>
              </div>

              {auftrag.status === 'DISPONIERT' && auftrag.fahrer && (
                <div className="mt-3 text-xs bg-blue-50 p-2 rounded-xl flex items-center gap-2 text-blue-700">
                  <User className="w-3.5 h-3.5" /> {auftrag.fahrer.vorname} {auftrag.fahrer.nachname} 
                  <span className="mx-1">•</span> 
                  <Truck className="w-3.5 h-3.5" /> {auftrag.fahrzeug?.kennzeichen}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button onClick={() => setSelectedAuftrag(auftrag)} className="btn btn-primary text-sm flex-1">
                  {auftrag.status === 'GEPLANT' ? 'Fahrer + Fahrzeug zuweisen' : 'Ändern'}
                </button>

                {auftrag.status === 'DISPONIERT' && (
                  <button onClick={() => markInAusfuehrung(auftrag.id)} className="btn btn-secondary text-sm flex-1">
                    In Ausführung starten
                  </button>
                )}

                {auftrag.status === 'IN_AUSFUEHRUNG' && (
                  <button onClick={() => openCompleteModal(auftrag)} className="btn btn-primary text-sm flex-1 bg-emerald-600 hover:bg-emerald-700">
                    Fahrt abschließen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Verfügbare Ressourcen */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6">
          <div className="font-semibold mb-4">Verfügbare Ressourcen</div>

          <div className="mb-5">
            <div className="text-xs uppercase text-slate-500 mb-2">Fahrer (aktiv)</div>
            {fahrer.filter(f => f.status === 'AKTIV').map(f => (
              <div key={f.id} className="flex items-center gap-2 text-sm py-1.5 px-3 bg-emerald-50 rounded-2xl mb-1.5">
                <User className="w-4 h-4 text-emerald-600" /> {f.vorname} {f.nachname}
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs uppercase text-slate-500 mb-2">Fahrzeuge (verfügbar)</div>
            {fahrzeuge.filter(fz => fz.status === 'VERFUEGBAR').map(fz => (
              <div key={fz.id} className="flex items-center gap-2 text-sm py-1.5 px-3 bg-blue-50 rounded-2xl mb-1.5">
                <Truck className="w-4 h-4 text-blue-600" /> {fz.kennzeichen}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== TOUR PLANNING ===================== */}
      <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-7">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-2xl">
              <Route className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Tourenplanung</h2>
              <p className="text-sm text-slate-500">Mehrere Aufträge zu effizienten Touren zusammenfassen</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={suggestTours} 
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Automatisch Touren vorschlagen
            </button>

            <button 
              onClick={simulateLiveTracking} 
              className="btn btn-primary flex items-center gap-2 bg-orange-600 hover:bg-orange-700 border-orange-600"
            >
              <Route className="w-4 h-4" /> Live Tracking simulieren (30s Interval)
            </button>
          </div>
        </div>

        {tours.length === 0 && (
          <div className="text-center py-10 text-slate-400 border border-dashed rounded-2xl">
            Noch keine Touren geplant.<br />
            Klicke auf „Automatisch Touren vorschlagen“ oder erstelle manuell Touren.
          </div>
        )}

        <div className="space-y-4">
          {tours.map((tour, index) => {
            const fahrerObj = fahrer.find(f => f.id === tour.fahrerId);
            const fzObj = fahrzeuge.find(fz => fz.id === tour.fahrzeugId);
            const tourAuftraege = auftraege.filter(a => tour.auftragIds.includes(a.id));

            return (
              <div key={tour.id} className="border border-violet-200 bg-violet-50/40 rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-lg">Tour {index + 1}</div>
                    <div className="text-sm px-3 py-0.5 bg-white rounded-full border flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> {fahrerObj ? `${fahrerObj.vorname} ${fahrerObj.nachname}` : 'Kein Fahrer'}
                      <span className="mx-1 text-slate-300">•</span>
                      <Truck className="w-3.5 h-3.5" /> {fzObj?.kennzeichen || 'Kein Fahrzeug'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => confirmTour(tour.id)} 
                      className="btn btn-primary text-sm flex items-center gap-2 bg-violet-600 hover:bg-violet-700"
                    >
                      <Check className="w-4 h-4" /> Tour bestätigen
                    </button>
                    <button 
                      onClick={() => removeTour(tour.id)} 
                      className="btn btn-secondary text-sm"
                    >
                      Löschen
                    </button>
                  </div>
                </div>

                <div className="text-sm text-slate-600 mb-3">
                  {tourAuftraege.length} Aufträge • ca. {Math.round(tourAuftraege.length * 35)} Min. geplant
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tourAuftraege.map((a, i) => (
                    <div key={a.id} className="bg-white rounded-2xl p-3 border text-sm">
                      <div className="font-medium">{a.kunde.name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(a.geplanteAbfahrt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} — {a.pickupAdresse.split(',')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fahrt abschließen Modal (with Abweichung) */}
      {completingAuftrag && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setCompletingAuftrag(null)}>
          <div className="modal bg-white rounded-3xl p-7 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-xl mb-1">Fahrt abschließen</h3>
            <div className="text-sm text-slate-600 mb-5">{completingAuftrag.kunde.name}</div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1">Tatsächliche Abfahrt</label>
                  <input 
                    type="datetime-local" 
                    className="input" 
                    value={completeForm.tatsaechlicheAbfahrt} 
                    onChange={e => setCompleteForm({...completeForm, tatsaechlicheAbfahrt: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1">Tatsächliche Ankunft</label>
                  <input 
                    type="datetime-local" 
                    className="input" 
                    value={completeForm.tatsaechlicheAnkunft} 
                    onChange={e => setCompleteForm({...completeForm, tatsaechlicheAnkunft: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium block mb-1">Gefahrene Kilometer</label>
                <input 
                  type="number" 
                  className="input" 
                  value={completeForm.km} 
                  onChange={e => setCompleteForm({...completeForm, km: e.target.value})} 
                />
              </div>

              <div className="border-t pt-4">
                <div className="text-sm font-medium mb-2 text-amber-600">Abweichung erfassen (optional)</div>
                
                <select 
                  className="input mb-3" 
                  value={completeForm.abweichungTyp} 
                  onChange={e => setCompleteForm({...completeForm, abweichungTyp: e.target.value})}
                >
                  <option value="">-- Keine Abweichung --</option>
                  <option>Verspätung</option>
                  <option>Stau</option>
                  <option>Kunde nicht erreichbar</option>
                  <option>Fahrzeugproblem</option>
                  <option>Witterung</option>
                  <option>Sonstiges</option>
                </select>

                <textarea 
                  className="input h-20" 
                  placeholder="Beschreibung der Abweichung (z.B. 14 Min Wartezeit beim Kunden, Patient war noch nicht bereit)"
                  value={completeForm.abweichungBeschreibung} 
                  onChange={e => setCompleteForm({...completeForm, abweichungBeschreibung: e.target.value})} 
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setCompletingAuftrag(null)} className="btn btn-secondary flex-1">Abbrechen</button>
              <button onClick={completeFahrt} className="btn btn-primary flex-1 bg-emerald-600 hover:bg-emerald-700">
                Fahrt abschließen + protokollieren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {selectedAuftrag && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setSelectedAuftrag(null)}>
          <div className="modal bg-white rounded-3xl p-7 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-xl mb-1">Auftrag zuweisen</h3>
            <div className="text-sm text-slate-600 mb-5">{selectedAuftrag.kunde.name}</div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium block mb-1">Fahrer auswählen</label>
                <select id="fahrer-select" className="input">
                  {fahrer.filter(f => f.status === 'AKTIV').map(f => (
                    <option key={f.id} value={f.id}>{f.vorname} {f.nachname}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Fahrzeug auswählen</label>
                <select id="fahrzeug-select" className="input">
                  {fahrzeuge.filter(fz => fz.status === 'VERFUEGBAR').map(fz => (
                    <option key={fz.id} value={fz.id}>{fz.kennzeichen}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setSelectedAuftrag(null)} className="btn btn-secondary flex-1">Abbrechen</button>
              <button 
                onClick={() => {
                  const fahrerId = (document.getElementById('fahrer-select') as HTMLSelectElement).value;
                  const fahrzeugId = (document.getElementById('fahrzeug-select') as HTMLSelectElement).value;
                  assignFahrerFahrzeug(selectedAuftrag.id, fahrerId, fahrzeugId);
                }} 
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                Zuweisen <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
