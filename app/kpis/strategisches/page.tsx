'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { KpiClient } from '@/lib/kpi-client';

export default function StrategischesControlling() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await KpiClient.getStrategischesControlling();
        setData(result);
      } catch (e) {
        console.error(e);
        const { KpiService } = await import('@/lib/kpi-service');
        setData(KpiService.getStrategischesControlling());
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Strategisches Controlling</h1>
          <p className="text-slate-500 mt-1">Investitionsentscheidungen &amp; Flottenentwicklung</p>
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
        <h1 className="text-3xl font-semibold tracking-tight">Strategisches Controlling</h1>
        <p className="text-slate-500 mt-1">Investitionsentscheidungen &amp; Flottenentwicklung</p>
      </div>

      {/* Zusammenfassung */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-5">
          <div className="text-sm text-slate-500">Durchschnittsalter Flotte</div>
          <div className="text-3xl font-bold mt-1">{data.durchschnittsalter} Jahre</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5">
          <div className="text-sm text-slate-500">Gesamte Wartungskosten</div>
          <div className="text-3xl font-bold mt-1">€ {data.gesamtWartungskosten.toLocaleString('de-DE')}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5">
          <div className="text-sm text-slate-500">Ersatz-Kandidaten</div>
          <div className="text-3xl font-bold mt-1 text-red-600">{data.ersatzKandidaten} Fahrzeuge</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-5">
          <div className="text-sm text-slate-500">Beobachtungskandidaten</div>
          <div className="text-3xl font-bold mt-1 text-amber-600">{data.beobachtungsKandidaten} Fahrzeuge</div>
        </div>
      </div>

      {/* Fahrzeug-Portfolio Analyse */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Fahrzeug-Portfolio &amp; Ersatzanalyse</h2>
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={data.fahrzeuge} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="kennzeichen" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="wartungKosten" fill="#f59e0b" name="Wartungskosten (€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Empfehlungen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ersatz prüfen */}
        <div className="bg-white border border-red-200 rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-700 flex items-center gap-2">
            🔴 Ersatz prüfen ({data.ersatzKandidaten})
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-auto">
            {data.fahrzeuge.filter(f => f.empfehlung === 'Ersatz prüfen').length > 0 ? (
              data.fahrzeuge
                .filter(f => f.empfehlung === 'Ersatz prüfen')
                .map((fz, index) => (
                  <div key={index} className="p-4 bg-red-50 rounded-2xl border border-red-100">
                    <div className="font-semibold">{fz.kennzeichen} – {fz.modell}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      Alter: {fz.alter} Jahre • {fz.kmStand.toLocaleString('de-DE')} km • Wartung: € {fz.wartungKosten}
                    </div>
                    <div className="text-xs text-red-600 mt-1 font-medium">
                      Empfehlung: Neubeschaffung in Betracht ziehen
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-slate-500">Keine akuten Ersatzkandidaten.</p>
            )}
          </div>
        </div>

        {/* Beobachten */}
        <div className="bg-white border border-amber-200 rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-amber-700 flex items-center gap-2">
            🟡 Beobachten ({data.beobachtungsKandidaten})
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-auto">
            {data.fahrzeuge.filter(f => f.empfehlung === 'Beobachten').length > 0 ? (
              data.fahrzeuge
                .filter(f => f.empfehlung === 'Beobachten')
                .map((fz, index) => (
                  <div key={index} className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <div className="font-semibold">{fz.kennzeichen} – {fz.modell}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      Alter: {fz.alter} Jahre • {fz.kmStand.toLocaleString('de-DE')} km
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      Nächste 12–18 Monate prüfen
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-slate-500">Keine Fahrzeuge in Beobachtung.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-xs text-slate-500">
        Hinweis: Die Empfehlungen basieren auf Alter, Kilometerstand und kumulierten Wartungskosten. 
        Eine detaillierte Wirtschaftlichkeitsrechnung (TCO) sollte bei konkreten Beschaffungsentscheidungen erfolgen.
      </div>
    </div>
  );
}
