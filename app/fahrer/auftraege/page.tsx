'use client';

import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';

export default function FahrerAuftraege() {
  return (
    <div className="p-8 max-w-[1000px] mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Meine Aufträge</h1>
      <p className="text-slate-500 mb-8">Angenommene und ausgeführte Fahrten (Fahrer-Ansicht)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-3xl p-6">
          <div className="flex items-center gap-2 text-amber-600 mb-4">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Angenommene / Offene Aufträge</span>
          </div>
          <div className="text-sm text-slate-600">Hier sehen Fahrer die ihnen zugewiesenen Fahrten der nächsten Tage.</div>
          <div className="mt-4 text-xs bg-amber-50 p-3 rounded-2xl">Demo: In dieser Ansicht würde der Fahrer seine Touren sehen und ggf. als „angenommen“ markieren können.</div>
        </div>

        <div className="bg-white border rounded-3xl p-6">
          <div className="flex items-center gap-2 text-emerald-600 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Ausgeführte Aufträge</span>
          </div>
          <div className="text-sm text-slate-600">Bereits abgeschlossene Fahrten mit Ist-Zeiten und Abweichungen.</div>
        </div>
      </div>
    </div>
  );
}
