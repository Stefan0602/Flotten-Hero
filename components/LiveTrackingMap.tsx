'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Vehicle {
  fahrzeugId: string;
  kennzeichen: string;
  fahrerName: string;
  kundeName: string;
  status: string;
  latitude: number;
  longitude: number;
  speed: number;
  lastUpdate: string;
  isCritical?: boolean; // new: for color coding
}

interface LiveTrackingMapProps {
  vehicles: Vehicle[];
}

export default function LiveTrackingMap({ vehicles }: LiveTrackingMapProps) {
  const center: [number, number] = [47.85, 11.35];
  const zoom = 10;

  // Create colored marker based on status
  const createVehicleIcon = (isCritical: boolean) => {
    const color = isCritical ? '#dc2626' : '#16a34a'; // Red = critical, Green = on plan
    return L.divIcon({
      className: 'vehicle-marker',
      html: `
        <div style="
          width: 20px; 
          height: 20px; 
          background: ${color}; 
          border: 3px solid white; 
          border-radius: 50%; 
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
  };

  if (vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100 rounded-2xl text-slate-500 text-sm">
        Keine aktiven Fahrzeuge zum Anzeigen.<br />
        Bitte Touren in der Disposition bestätigen.
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="rounded-2xl"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {vehicles.map((vehicle, index) => {
        const isCritical = vehicle.isCritical ?? vehicle.status === 'IN_AUSFUEHRUNG'; // demo logic

        return (
          <Marker
            key={vehicle.fahrzeugId + index}
            position={[vehicle.latitude, vehicle.longitude]}
            icon={createVehicleIcon(isCritical)}
          >
            <Popup className="tour-popup">
              <div className="space-y-2 min-w-[220px]">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg">{vehicle.kennzeichen}</div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    isCritical 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {isCritical ? 'Kritisch' : 'Gemäß Plan'}
                  </span>
                </div>

                <div className="text-sm">
                  <strong>Fahrer:</strong> {vehicle.fahrerName}
                </div>

                <div className="border-t pt-2">
                  <div className="text-xs text-slate-500">Aktueller Auftrag</div>
                  <div className="font-medium text-sm">{vehicle.kundeName}</div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 text-xs pt-1">
                  <div>
                    <span className="text-slate-500">Status:</span><br />
                    <span className="font-medium">{vehicle.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Geschwindigkeit:</span><br />
                    <span className="font-medium">{vehicle.speed} km/h</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-1 border-t">
                  Letzte Position: {new Date(vehicle.lastUpdate).toLocaleTimeString('de-DE', { 
                    hour: '2-digit', minute: '2-digit', second: '2-digit' 
                  })}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
