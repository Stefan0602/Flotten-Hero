'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';

interface StammdatenLayoutProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  onNew?: () => void;
  newLabel?: string;
  children: React.ReactNode;
  stats?: React.ReactNode;
}

export default function StammdatenLayout({
  title,
  description,
  icon,
  onNew,
  newLabel = 'Neu anlegen',
  children,
  stats,
}: StammdatenLayoutProps) {
  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          href="/stammdaten" 
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-2xl"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück zu Stammdaten
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-2xl">
            {icon}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-slate-500 mt-1">{description}</p>}
          </div>
        </div>

        {onNew && (
          <button
            onClick={onNew}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {newLabel}
          </button>
        )}
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="flex flex-wrap gap-4 mb-6">
          {stats}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6">
        {children}
      </div>
    </div>
  );
}
