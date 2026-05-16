'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { KpiClient } from '@/lib/kpi-client';

export default function OperativesControlling() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await KpiClient.getOperativesControlling();
        setData(result);
      } catch (e) {
        console.error(e);
        // Fallback to direct demo service if needed
        const { KpiService } = await import('@/lib/kpi-service');
        setData(KpiService.getOperativesControlling());
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Operatives Controlling</h1>
          <p className="text-slate-500 mt-1">Effektive Nutzung der Ressourcen – Echtzeit-Analyse</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Lade Daten...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Operatives Controlling</h1>
        <p className="text-slate-500 mt-1">Effektive Nutzung der Ressourcen – Echtzeit-Analyse</p>
      </div>

      {/* 1. Fahrzeugauslastung */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          Fahrzeugauslastung
        </h2>
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data?.fahrzeugAuslastung || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="kennzeichen" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="auslastungProzent" fill="#3b82f6" name="Auslastung %" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-500 mt-3">
            Basierend auf abgeschlossenen Touren (angenommene Jahreskapazität: 120.000 km)
          </p>
        </div>
      </div>

      {/* 2. Kosten pro gefahrenen KM */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Kosten pro gefahrenen KM</h2>
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data?.kostenProKm || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="kennzeichen" />
              <YAxis />
              <Tooltip formatter={(value) => [`€ ${value}`, 'Kosten pro KM']} />
              <Bar dataKey="kostenProKm" fill="#f59e0b" name="€ / km" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-500 mt-3">
            Inkl. Wartungskosten + anteilige Anschaffungskosten (amortisiert über 300.000 km)
          </p>
        </div>
      </div>

      {/* 3. Fahrer Auslastung */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Fahrer Auslastung</h2>
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data?.fahrerAuslastung || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tours" fill="#10b981" name="Abgeschlossene Touren" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Soll-Ist Abweichung KM */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Soll-Ist Abweichung – Gefahrene KM</h2>
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-3">Auftrag</th>
                  <th className="pb-3">Kunde</th>
                  <th className="pb-3 text-right">Soll (km)</th>
                  <th className="pb-3 text-right">Ist (km)</th>
                  <th className="pb-3 text-right">Abweichung</th>
                  <th className="pb-3 text-right">%</th>
                </tr>
              </thead>
              <tbody>
                {(data?.sollIstAbweichungen || []).map((row, index) => (
                  <tr key={index} className="border-b last:border-none">
                    <td className="py-3 font-mono text-xs">{row.auftragId}</td>
                    <td className="py-3">{row.kunde}</td>
                    <td className="py-3 text-right">{row.planKm}</td>
                    <td className="py-3 text-right font-medium">{row.istKm}</td>
                    <td className={`py-3 text-right font-semibold ${row.abweichung > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {row.abweichung > 0 ? '+' : ''}{row.abweichung}
                    </td>
                    <td className={`py-3 text-right font-semibold ${row.abweichungProzent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {row.abweichungProzent > 0 ? '+' : ''}{row.abweichungProzent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Negative Werte = effizienter als geplant. Positive Werte = Mehraufwand (Stau, Umwege, etc.)
          </p>
        </div>
      </div>
    </div>
  );
}
