'use client';

import React from 'react';
import Link from 'next/link';
import { Users, UserCheck, Truck, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';

export default function StammdatenOverview() {
  // In real app these would come from API
  const stats = {
    kunden: 55,
    kundenMitAktivitaet: 38,
    fahrer: 22,
    fahrerAktiv: 17,
    fahrzeuge: 15,
    fahrzeugeVerfuegbar: 12,
    wartungFaellig: 3,
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Stammdaten</h1>
        <p className="text-slate-500 mt-1">Zentrale Verwaltung von Kunden, Fahrern und Fahrzeugen</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Kunden */}
        <Link href="/stammdaten/kunden" className="group block">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-blue-300 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-2xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-xl">Kunden</div>
                    <div className="text-3xl font-bold text-slate-900 mt-1">{stats.kunden}</div>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
            </div>
            <div className="mt-4 text-sm text-slate-600">
              {stats.kundenMitAktivitaet} mit aktueller Aktivität
            </div>
          </div>
        </Link>

        {/* Fahrer */}
        <Link href="/stammdaten/fahrer" className="group block">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-emerald-300 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-2xl">
                    <UserCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-xl">Fahrer</div>
                    <div className="text-3xl font-bold text-slate-900 mt-1">{stats.fahrer}</div>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
            </div>
            <div className="mt-4 text-sm text-slate-600">
              {stats.fahrerAktiv} aktiv • {stats.fahrer - stats.fahrerAktiv} in Urlaub / Krank
            </div>
          </div>
        </Link>

        {/* Fahrzeuge */}
        <Link href="/stammdaten/fahrzeuge" className="group block">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-orange-300 transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-2xl">
                    <Truck className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-xl">Fahrzeuge</div>
                    <div className="text-3xl font-bold text-slate-900 mt-1">{stats.fahrzeuge}</div>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 transition" />
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm">
              <span className="text-slate-600">{stats.fahrzeugeVerfuegbar} verfügbar</span>
              {stats.wartungFaellig > 0 && (
                <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">
                  <AlertTriangle className="w-3 h-3" /> {stats.wartungFaellig} Wartung fällig
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Optimization Ideas Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-7">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Verbesserungsvorschläge für Stammdaten
        </h3>

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium mb-2 text-slate-700">1. Zentrale Suche &amp; Globale Filter</h4>
            <p className="text-slate-600">Ein globales Suchfeld oben in der Stammdaten-Übersicht, das gleichzeitig in Kunden, Fahrern und Fahrzeugen sucht.</p>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-slate-700">2. Bulk-Aktionen</h4>
            <p className="text-slate-600">Mehrere Fahrer gleichzeitig auf „Urlaub“ setzen oder mehrere Fahrzeuge für Wartung markieren.</p>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-slate-700">3. Visuelle Gesundheitsanzeige</h4>
            <p className="text-slate-600">Farbige Status-Karten: „Fahrer-Verfügbarkeit“, „Fahrzeug-Auslastung“, „Kunden mit offenen Verträgen“.</p>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-slate-700">4. Audit &amp; Änderungshistorie</h4>
            <p className="text-slate-600">Jede Änderung an Stammdaten wird protokolliert und in einer „Letzte Änderungen“-Box angezeigt.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
