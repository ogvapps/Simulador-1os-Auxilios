import React, { useState, useCallback, memo } from 'react';
import { LogIn, Lock } from 'lucide-react';
import { UserData } from '../types';

export const UserEntryForm = memo(function UserEntryForm({ userId, onProfileSubmit }: { userId: string, onProfileSubmit: (data: UserData) => void }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Curso 1º ESO');
  const [isSaving, setIsSaving] = useState(false);

  const roles = ['Profesor/a', 'Curso 1º ESO', 'Curso 2º ESO', 'Curso 3º ESO', 'Curso 4º ESO', 'Otro Personal'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    
    const userData: UserData = { name: name.trim(), role };
    // In a real app, you'd save to Firebase here.
    // For this demo, we assume the parent component handles the logic or we call it here.
    // Since the original code mixed logic, we will pass the data up.
    onProfileSubmit(userData); 
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <div className="text-center mb-6">
          <LogIn size={48} className="text-red-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-red-700">Registro</h2>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-red-500" required disabled={isSaving} />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white" disabled={isSaving}>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 disabled:opacity-50">
          {isSaving ? 'Guardando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
});

export const AdminPinModal = memo(function AdminPinModal({ onPinSuccess, onCancel }: { onPinSuccess: () => void, onCancel: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2024') {
      onPinSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full">
        <Lock className="mx-auto mb-4 text-gray-700" size={48} />
        <h3 className="text-xl font-bold text-center mb-4">Acceso Admin</h3>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)} className="w-full px-4 py-2 border rounded mb-2 text-center tracking-widest text-xl" maxLength={4} autoFocus />
        {error && <p className="text-red-600 text-sm text-center mb-4">PIN incorrecto</p>}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="w-full py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
          <button type="submit" className="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-900">Entrar</button>
        </div>
      </form>
    </div>
  );
});