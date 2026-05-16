'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Truck, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Willkommen, ${data.user.name}`);

        // Store user in localStorage for robust Sidebar rendering (especially useful in demo/fallback mode)
        try {
          localStorage.setItem('transportpro_user', JSON.stringify(data.user));
        } catch {}

        // Redirect based on role
        router.push('/dashboard');
        router.refresh();
      } else {
        toast.error(data.error || 'Login fehlgeschlagen');
      }
    } catch (err) {
      toast.error('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-3xl font-semibold tracking-tighter text-slate-900">Flotten Hero</div>
              <div className="text-xs text-slate-500 -mt-1">Multi-Tenant Flottenmanagement</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Anmelden</h1>
            <p className="text-sm text-slate-500 mt-1">Bitte melden Sie sich mit Ihren Zugangsdaten an.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">E-Mail-Adresse</label>
              <input
                type="email"
                className="input"
                placeholder="leitung@demo.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Passwort</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? 'Anmelden...' : <>Anmelden <LogIn className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Demo-Zugänge</div>
            <div className="space-y-2 text-sm">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <div className="font-medium text-red-600">Administrator (Mandant)</div>
                <div className="text-slate-500">admin@demo.de / demo123</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <div className="font-medium text-red-600">Administrator 2 (Mandant)</div>
                <div className="text-slate-500">admin2@demo.de / demo123</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <div className="font-medium">Geschäftsleitung</div>
                <div className="text-slate-500">leitung@demo.de / demo123</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <div className="font-medium">Sachbearbeiter Disposition</div>
                <div className="text-slate-500">dispo@demo.de / demo123</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <div className="font-medium">Sachbearbeiter FIBU</div>
                <div className="text-slate-500">fibu@demo.de / demo123</div>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <div className="font-medium">Fahrer</div>
                <div className="text-slate-500">fahrer@demo.de / demo123</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400 mt-6">
          TransportPro • Multi-Tenant • 2026
        </div>
      </div>
    </div>
  );
}
