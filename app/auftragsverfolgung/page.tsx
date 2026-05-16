'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { MapPin, RefreshCw, Truck, User, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getDemoFahrzeuge, getDemoAuftraege, getDemoFahrer } from '@/lib/demo-data';

// Dynamically import the map to avoid SSR issues with Leaflet
const LiveTrackingMap = dynamic(
  () => import('@/components/LiveTrackingMap'),
  { ssr: false }
);

interface ActiveVehicle {
  fahrzeugId: string;
  kennzeichen: string;
  fahrerName: string;
  auftragId: string;
  kundeName: string;
  status: string;
  latitude: number;
  longitude: number;
  lastUpdate: string;
  speed: number;
  isCritical?: boolean; // For color coding
}

export default function Auftragsverfolgung() {
  const [activeVehicles, setActiveVehicles] = useState<ActiveVehicle[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Load active vehicles from demo data (orders that are DISPONIERT or IN_AUSFUEHRUNG)
  const loadActiveVehicles = () => {
    const auftraege = getDemoAuftraege();
    const fahrzeuge = getDemoFahrzeuge();
    const fahrer = getDemoFahrer();

    const activeOrders = auftraege.filter((a: any) =>
      ['DISPONIERT', 'IN_AUSFUEHRUNG'].includes(a.status) && a.fahrzeugId
    );

    const vehiclesWithPosition: ActiveVehicle[] = activeOrders.map((order: any) => {
      const fz = fahrzeuge.find((f: any) => f.id === order.fahrzeugId);
      const fahrerObj = fahrer.find((f: any) => f.id === order.fahrerId);

      const baseLat = 47.85 + (Math.random() - 0.5) * 0.4;
      const baseLng = 11.25 + (Math.random() - 0.5) * 0.6;

      // Simple demo logic for color coding:
      // IN_AUSFUEHRUNG + random chance = critical (red)
      // Otherwise green (on plan)
      const isCritical = order.status === 'IN_AUSFUEHRUNG' && Math.random() > 0.6;

      return {
        fahrzeugId: order.fahrzeugId,
        kennzeichen: order.fahrzeugKennzeichen || fz?.kennzeichen || 'N/A',
        fahrerName: order.fahrerName || (fahrerObj ? `${fahrerObj.vorname} ${fahrerObj.nachname}` : 'Unbekannt'),
        auftragId: order.id,
        kundeName: order.kundeName,
        status: order.status,
        latitude: baseLat,
        longitude: baseLng,
        lastUpdate: new Date().toISOString(),
        speed: 45 + Math.random() * 25,
        isCritical,
      };
    });

    setActiveVehicles(vehiclesWithPosition);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    loadActiveVehicles();
  }, []);

  // Simulate real-time GPS updates every 30 seconds (demo mode)
  const startLiveSimulation = () => {
    if (activeVehicles.length === 0) {
      toast.error('Keine aktiven Fahrzeuge gefunden. Bitte zuerst Touren bestätigen.');
      return;
    }

    setIsSimulating(true);
    toast.success('Live Tracking Simulation gestartet', {
      description: 'Fahrzeugpositionen werden alle 5 Sekunden aktualisiert (Demo).',
    });

    const interval = setInterval(async () => {
      const updatedVehicles = activeVehicles.map((vehicle) => {
        const newLat = vehicle.latitude + (Math.random() - 0.5) * 0.008;
        const newLng = vehicle.longitude + (Math.random() - 0.5) * 0.012;
        const newSpeed = Math.max(25, Math.min(85, vehicle.speed + (Math.random() - 0.5) * 12));

        // Occasionally flip critical status during simulation
        const newIsCritical = vehicle.status === 'IN_AUSFUEHRUNG' && Math.random() > 0.75;

        fetch('/api/tracking/position', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'demo-tracking-key-123',
          },
          body: JSON.stringify({
            vehicleId: vehicle.fahrzeugId,
            latitude: newLat,
            longitude: newLng,
            speed: Math.round(newSpeed),
            heading: Math.random() * 360,
            timestamp: new Date().toISOString(),
            source: 'simulation',
          }),
        }).catch(() => {});

        return {
          ...vehicle,
          latitude: newLat,
          longitude: newLng,
          speed: Math.round(newSpeed),
          lastUpdate: new Date().toISOString(),
          isCritical: newIsCritical,
        };
      });

      setActiveVehicles(updatedVehicles);
      setLastUpdate(new Date());

      // Occasionally create a deviation for demo purposes
      if (Math.random() > 0.7) {
        toast.info('Neue Abweichung erkannt', {
          description: 'Ein Fahrzeug weicht vom Plan ab.',
        });
      }
    }, 5000); // Update every 5s for nice demo effect (real would be 30s)

    // Stop simulation after 3 minutes
    setTimeout(() => {
      clearInterval(interval);
      setIsSimulating(false);
      toast.info('Simulation automatisch gestoppt (Demo-Modus)');
    }, 180000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    toast.info('Live Simulation gestoppt');
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Zurück
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-3">
              <MapPin className="w-8 h-8 text-blue-600" />
              Auftragsverfolgung
            </h1>
            <p className="text-slate-500 mt-1">Live-Tracking • Plan vs. Ist • Echtzeit-Positionen</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdate && (
            <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-2xl border">
              <Clock className="w-3.5 h-3.5" />
              Letztes Update: {lastUpdate.toLocaleTimeString('de-DE')}
            </div>
          )}

          {!isSimulating ? (
            <button
              onClick={startLiveSimulation}
              className="btn btn-primary flex items-center gap-2 bg-orange-600 hover:bg-orange-700 border-orange-600"
              disabled={activeVehicles.length === 0}
            >
              <RefreshCw className="w-4 h-4" />
              Live Tracking simulieren
            </button>
          ) : (
            <button
              onClick={stopSimulation}
              className="btn btn-secondary flex items-center gap-2"
            >
              Simulation stoppen
            </button>
          )}

          <button
            onClick={loadActiveVehicles}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Daten aktualisieren
          </button>
        </div>
      </div>

      {/* Stats Bar - always consistent with map + list */}
      <div className="flex gap-4 mb-6">
        <div className="bg-white border rounded-2xl px-5 py-3 text-sm flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{activeVehicles.length}</span> Fahrzeuge live auf der Karte
        </div>
        <div className="bg-white border rounded-2xl px-5 py-3 text-sm flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          <span className="font-medium">{activeVehicles.length}</span> aktive Fahrzeuge in der Liste
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAP */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-4 shadow-sm" style={{ height: '620px' }}>
          <div className="h-full w-full rounded-2xl overflow-hidden border">
            <LiveTrackingMap vehicles={activeVehicles} />
          </div>
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            Karte: OpenStreetMap • Positionen werden alle 5 Sekunden aktualisiert (Demo-Modus)
          </p>
        </div>

        {/* Sidebar - Aktive Fahrzeuge */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 flex flex-col" style={{ height: '620px' }}>
          <div className="font-semibold mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4" /> Aktive Fahrzeuge (Live)
          </div>

          <div className="flex-1 overflow-auto space-y-3 pr-1">
            {activeVehicles.length === 0 && (
              <div className="text-center text-slate-400 py-8 text-sm">
                Keine aktiven Fahrzeuge.<br />
                Bitte zuerst Touren in der Disposition bestätigen.
              </div>
            )}

            {activeVehicles.map((v, index) => {
              const isCritical = v.isCritical ?? false;
              return (
                <div key={index} className="border rounded-2xl p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-lg flex items-center gap-2">
                        {v.kennzeichen}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isCritical 
                            ? 'bg-red-100 text-red-700' 
                            : v.status === 'IN_AUSFUEHRUNG' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isCritical ? 'KRITISCH' : v.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mt-0.5">{v.fahrerName}</div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-emerald-600 font-medium">{v.speed} km/h</div>
                      <div className="text-slate-400">{new Date(v.lastUpdate).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm">
                    <div className="text-slate-500">Aktueller Auftrag:</div>
                    <div className="font-medium">{v.kundeName}</div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 font-mono">
                    {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t text-xs text-slate-500">
            Die Positionen werden durch die Tracking-Schnittstelle empfangen und mit den geplanten Zeiten verglichen.
          </div>
        </div>
      </div>

      {/* Hinweis */}
      <div className="mt-6 text-xs text-slate-500 max-w-3xl">
        <strong>Hinweis:</strong> Diese Seite ist für Demo-Zwecke mit simulierten GPS-Daten verbunden. 
        In der Produktion würde hier eine echte Verbindung zu eurem Telematik-Anbieter (z.B. Webfleet, Traccar, eigene Hardware) über den Endpoint <code>/api/tracking/position</code> laufen.
        Abweichungen zwischen Plan- und Istdaten werden automatisch in der Abweichungstabelle erfasst.
      </div>
    </div>
  );
}
