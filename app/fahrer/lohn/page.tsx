'use client';

import React from 'react';
import { Euro } from 'lucide-react';

export default function FahrerLohn() {
  return (
    <div className="p-8 max-w-[1000px] mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Lohn &amp; Abrechnungen</h1>
      <p className="text-slate-500 mb-8">Persönliche Lohnübersicht und ausstehende Zahlungen</p>

      <div className="bg-white border rounded-3xl p-7">
        <div className="flex items-center gap-3 mb-6">
          <Euro className="w-6 h-6 text-emerald-600" />
          <div>
            <div className="font-semibold text-lg">Lohnabrechnung – Aktueller Monat</div>
            <div className="text-sm text-slate-500">Michael Schmidt • 24,50 € / Stunde</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-semibold">87</div>
            <div className="text-xs text-slate-500 mt-1">Gefahrene km</div>
          </div>
          <div>
            <div className="text-3xl font-semibold">42</div>
            <div className="text-xs text-slate-500 mt-1">Fahrten diesen Monat</div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-emerald-600">1.284,50 €</div>
            <div className="text-xs text-slate-500 mt-1">Auszuzahlender Betrag</div>
          </div>
        </div>

        <div className="mt-8 text-xs text-slate-500 border-t pt-4">
          Die Lohnabrechnung wird automatisch aus den abgerechneten Aufträgen der FIBU-Abteilung generiert.
        </div>
      </div>
    </div>
  );
}
