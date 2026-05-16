'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Euro, Truck } from 'lucide-react';

const umsatzData = [
  { monat: 'Jan', umsatz: 12400 },
  { monat: 'Feb', umsatz: 13180 },
  { monat: 'Mär', umsatz: 15290 },
  { monat: 'Apr', umsatz: 16840 },
];

const fahrzeugKosten = [
  { name: 'STA-AB 1234 (Vito)', kosten: 0.87, umsatz: 3.2 },
  { name: 'STA-CD 5678 (Crafter)', kosten: 0.92, umsatz: 2.9 },
  { name: 'STA-GH 3456 (Octavia)', kosten: 0.61, umsatz: 2.4 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export default function BerichtePage() {
  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-1">Berichte &amp; Investitionsmetriken</h1>
      <p className="text-slate-500 mb-8">Grundlage für Flottenentscheidungen und Rentabilitätsanalyse</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Umsatz Trend */}
        <div className="bg-white border rounded-3xl p-6">
          <div className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Umsatzentwicklung</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={umsatzData}>
              <XAxis dataKey="monat" />
              <YAxis />
              <Tooltip formatter={(v) => [`€ ${Number(v).toLocaleString('de-DE')}`, 'Umsatz']} />
              <Bar dataKey="umsatz" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Kosten / Ertrag pro Fahrzeug */}
        <div className="bg-white border rounded-3xl p-6">
          <div className="font-semibold mb-4 flex items-center gap-2"><Truck className="w-4 h-4" /> Kosten vs. Ertrag pro Fahrzeug (pro km)</div>
          <div className="space-y-4 mt-4">
            {fahrzeugKosten.map((fz, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{fz.name}</span>
                  <span className="font-medium text-emerald-600">€ {fz.umsatz} Ertrag / € {fz.kosten} Kosten</span>
                </div>
                <div className="h-2 bg-slate-100 rounded">
                  <div className="h-2 bg-blue-600 rounded" style={{ width: `${(fz.umsatz / 4) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-500 mt-5">Beste Deckungsbeiträge: Mercedes Vito (STA-AB 1234)</div>
        </div>
      </div>

      <div className="mt-6 bg-white border rounded-3xl p-7">
        <div className="font-semibold mb-3">Empfehlungen für Investitionsentscheidungen</div>
        <ul className="text-sm text-slate-600 space-y-2 pl-1">
          <li>• Der Mercedes Vito (STA-AB 1234) liefert aktuell den besten Deckungsbeitrag. Erweiterung des Fuhrparks mit ähnlichen Fahrzeugen empfohlen.</li>
          <li>• Der ältere Crafter (STA-CD 5678) hat höhere Wartungskosten. Prüfung eines Ersatzfahrzeugs in 2026/2027 sinnvoll.</li>
          <li>• Auslastung liegt bei 78 %. Steigerungspotenzial durch zusätzliche Stammkundenverträge vorhanden.</li>
        </ul>
      </div>
    </div>
  );
}
