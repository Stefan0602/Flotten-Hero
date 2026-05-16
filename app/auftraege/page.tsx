'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search, Clock, CheckCircle, FileText } from 'lucide-react';
import { getDemoAuftraege } from '@/lib/demo-data';

interface Auftrag {
  id: string;
  kundeName: string;
  pickupAdresse: string;
  dropoffAdresse: string;
  geplanteAbfahrt: string;
  status: string;
  preis: number | null;
  fahrerName?: string;
  fahrzeugKennzeichen?: string;
}

type TabType = 'neu' | 'disponiert' | 'abgerechnet';

export default function AuftragsUebersicht() {
  const [allOrders, setAllOrders] = useState<Auftrag[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('neu');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/auftraege');
      const apiData = await res.json();
      const demoData = getDemoAuftraege();
      const merged = [...demoData, ...apiData].filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      );
      setAllOrders(merged.length > 0 ? merged : apiData);
    } catch {
      setAllOrders(getDemoAuftraege());
    }
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const getFilteredOrders = (tab: TabType) => {
    let filtered = allOrders;

    // Filter by tab
    if (tab === 'neu') {
      filtered = filtered.filter(o => o.status === 'GEPLANT');
    } else if (tab === 'disponiert') {
      filtered = filtered.filter(o => ['DISPONIERT', 'IN_AUSFUEHRUNG'].includes(o.status));
    } else if (tab === 'abgerechnet') {
      filtered = filtered.filter(o => o.status === 'ABGERECHNET');
    }

    // Search
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(o =>
        o.kundeName.toLowerCase().includes(s) ||
        o.pickupAdresse.toLowerCase().includes(s) ||
        o.dropoffAdresse.toLowerCase().includes(s) ||
        (o.fahrerName && o.fahrerName.toLowerCase().includes(s))
      );
    }

    return filtered;
  };

  const currentOrders = getFilteredOrders(activeTab);

  const tabConfig = {
    neu: { label: 'Neue Aufträge', count: allOrders.filter(o => (o.status || '') === 'GEPLANT').length, icon: Clock, color: 'blue' },
    disponiert: { label: 'Disponierte Aufträge', count: allOrders.filter(o => ['DISPONIERT', 'IN_AUSFUEHRUNG'].includes(o.status || '')).length, icon: CheckCircle, color: 'emerald' },
    abgerechnet: { label: 'Abgerechnete Aufträge', count: allOrders.filter(o => (o.status || '') === 'ABGERECHNET').length, icon: FileText, color: 'slate' },
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Auftragsübersicht</h1>
        <p className="text-slate-500 mt-1">Alle Aufträge nach Bearbeitungsstatus</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {(Object.keys(tabConfig) as TabType[]).map((tab) => {
          const config = tabConfig[tab];
          const isActive = activeTab === tab;
          const Icon = config.icon;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {config.label}
              <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {config.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Kunde, Adresse oder Fahrer suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Lade Aufträge...</div>
      ) : currentOrders.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          Keine Aufträge in dieser Kategorie gefunden.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Kunde</th>
                <th className="py-3 px-6">Von → Nach</th>
                <th className="py-3 px-6">Geplante Zeit</th>
                <th className="py-3 px-6">Fahrer / Fahrzeug</th>
                <th className="py-3 px-6 text-right">Preis</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((auftrag) => (
                <tr key={auftrag.id} className="border-t hover:bg-slate-50">
                  <td className="py-4 px-6 font-medium">{auftrag.kundeName || 'Unbekannt'}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {(auftrag.pickupAdresse || '').split(',')[0]} → {(auftrag.dropoffAdresse || '').split(',')[0]}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {auftrag.geplanteAbfahrt 
                      ? new Date(auftrag.geplanteAbfahrt).toLocaleString('de-DE', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })
                      : '—'}
                  </td>
                  <td className="py-4 px-6 text-sm">
                    {auftrag.fahrerName ? (
                      <>
                        {auftrag.fahrerName}<br />
                        <span className="text-xs text-slate-500">{auftrag.fahrzeugKennzeichen || ''}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">Noch nicht zugewiesen</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-emerald-600">
                    {auftrag.preis ? `€ ${auftrag.preis.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`status-badge status-${(auftrag.status || 'unknown').toLowerCase()}`}>
                      {auftrag.status || 'Unbekannt'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
