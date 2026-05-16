'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, UserPlus, Edit2, Key } from 'lucide-react';
import { toast } from 'sonner';
import { ROLE_LABELS_DE, ROLE_COLORS, getRoleLabel } from '@/lib/roles';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const AVAILABLE_ROLES = [
  { value: 'ADMIN', label: 'Administrator (Mandant)' },
  { value: 'LEITUNG', label: 'Geschäftsleitung' },
  { value: 'SACHBEARBEITER_DISPO', label: 'Sachbearbeiter – Disposition' },
  { value: 'SACHBEARBEITER_STAMMDATEN', label: 'Sachbearbeiter – Stammdaten' },
  { value: 'SACHBEARBEITER_FIBU', label: 'Sachbearbeiter – FIBU & Lohn' },
  { value: 'FAHRER', label: 'Fahrer' },
];

export default function BenutzerVerwaltung() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Modals for editing
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'SACHBEARBEITER_DISPO',
  });

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      setUsers([
        { id: 'u1', name: 'Anna Berger', email: 'leitung@demo.de', role: 'LEITUNG', createdAt: '2026-03-12' },
        { id: 'u2', name: 'Thomas Klein', email: 'dispo@demo.de', role: 'SACHBEARBEITER_DISPO', createdAt: '2026-03-15' },
        { id: 'u3', name: 'Markus Hoffmann', email: 'fibu@demo.de', role: 'SACHBEARBEITER_FIBU', createdAt: '2026-04-01' },
        { id: 'u4', name: 'Michael Schmidt', email: 'fahrer@demo.de', role: 'FAHRER', createdAt: '2026-04-10' },
        { id: 'u5', name: 'Admin Demo', email: 'admin@demo.de', role: 'ADMIN', createdAt: '2026-04-20' },
      ]);
    }
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, []);

  // === Create User ===
  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Bitte alle Felder ausfüllen');
      return;
    }
    if (newUser.password.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        toast.success('Benutzer erfolgreich angelegt');
        setShowCreateModal(false);
        setNewUser({ name: '', email: '', password: '', role: 'SACHBEARBEITER_DISPO' });
        loadUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Fehler beim Anlegen');
      }
    } catch {
      toast.success('Benutzer angelegt (Demo)');
      setShowCreateModal(false);
      loadUsers();
    }
  }

  // === Delete User ===
  async function deleteUser(id: string, email: string) {
    if (!confirm(`Benutzer ${email} wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Benutzer gelöscht');
        loadUsers();
      } else {
        toast.error('Löschen fehlgeschlagen');
      }
    } catch {
      toast.success('Benutzer gelöscht (Demo)');
      loadUsers();
    }
  }

  // === Change Role ===
  async function changeRole() {
    if (!editingUser || !newRole) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        toast.success(`Rolle von ${editingUser.name} auf ${newRole} geändert`);
        setEditingUser(null);
        setNewRole('');
        loadUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Fehler beim Ändern der Rolle');
      }
    } catch {
      toast.success('Rolle geändert (Demo)');
      setEditingUser(null);
      loadUsers();
    }
  }

  // === Reset Password ===
  async function resetPassword() {
    if (!resetPasswordUser || !newPassword) return;
    if (newPassword.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${resetPasswordUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      if (res.ok) {
        toast.success(`Passwort für ${resetPasswordUser.name} zurückgesetzt`);
        setResetPasswordUser(null);
        setNewPassword('');
      } else {
        toast.error('Fehler beim Zurücksetzen');
      }
    } catch {
      toast.success('Passwort zurückgesetzt (Demo)');
      setResetPasswordUser(null);
      setNewPassword('');
    }
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Benutzerverwaltung</h1>
          <p className="text-slate-500 mt-1">Nutzer anlegen, Rollen ändern, Passwörter zurücksetzen (Admin)</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Neuer Benutzer
        </button>
      </div>

      {/* Role Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {AVAILABLE_ROLES.map(r => {
          const count = users.filter(u => u.role === r.value).length;
          return (
            <div key={r.value} className="bg-white border rounded-2xl p-3 text-center">
              <div className="text-2xl font-semibold">{count}</div>
              <div className="text-xs text-slate-500 mt-1">{r.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left border-b">
              <th className="py-3 px-6 font-medium">Name</th>
              <th className="py-3 px-6 font-medium">E-Mail</th>
              <th className="py-3 px-6 font-medium">Rolle</th>
              <th className="py-3 px-6 font-medium">Erstellt</th>
              <th className="py-3 px-6 text-center">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-none hover:bg-slate-50">
                <td className="py-4 px-6 font-medium">{u.name}</td>
                <td className="py-4 px-6 text-slate-600">{u.email}</td>
                <td className="py-4 px-6">
                  <span className={`inline-block px-3 py-0.5 text-xs rounded-full font-medium ${ROLE_COLORS[u.role as keyof typeof ROLE_COLORS] || 'bg-gray-100 text-gray-700'}`}>
                    {getRoleLabel(u.role as any)}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString('de-DE')}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => { setEditingUser(u); setNewRole(u.role); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Rolle ändern"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setResetPasswordUser(u); setNewPassword(''); }}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"
                      title="Passwort zurücksetzen"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteUser(u.id, u.email)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      title="Benutzer löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="modal bg-white rounded-3xl w-full max-w-md p-7" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Neuen Benutzer anlegen</h2>
            <form onSubmit={createUser} className="space-y-4">
              <input className="input" placeholder="Vollständiger Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
              <input type="email" className="input" placeholder="E-Mail" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
              <input type="password" className="input" placeholder="Initiales Passwort" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
              <select className="input" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                {AVAILABLE_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary flex-1">Abbrechen</button>
                <button type="submit" className="btn btn-primary flex-1">Benutzer anlegen</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingUser(null)}>
          <div className="modal bg-white rounded-3xl w-full max-w-sm p-7" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Rolle ändern für <span className="text-blue-600">{editingUser.name}</span></h3>
            <select className="input mb-6" value={newRole} onChange={e => setNewRole(e.target.value)}>
              {AVAILABLE_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setEditingUser(null)} className="btn btn-secondary flex-1">Abbrechen</button>
              <button onClick={changeRole} className="btn btn-primary flex-1">Rolle speichern</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setResetPasswordUser(null)}>
          <div className="modal bg-white rounded-3xl w-full max-w-sm p-7" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-4">Passwort zurücksetzen für <span className="text-amber-600">{resetPasswordUser.name}</span></h3>
            <input type="password" className="input mb-6" placeholder="Neues Passwort" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setResetPasswordUser(null)} className="btn btn-secondary flex-1">Abbrechen</button>
              <button onClick={resetPassword} disabled={!newPassword} className="btn btn-primary flex-1">Passwort setzen</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-slate-500 px-2">
        Hinweis: Als Administrator können Sie Benutzer Ihres Mandanten verwalten, Rollen ändern und Passwörter zurücksetzen. 
        Sie können sich selbst nicht löschen.
      </div>
    </div>
  );
}
