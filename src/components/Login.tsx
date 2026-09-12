import React, { useState } from 'react';
import { User } from '../types';
import { USERS } from '../data';
import { Store, UserCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = USERS.find(u => u.id === selectedUserId);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 w-full max-w-md flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 mb-6">
          <Store className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-2">APS POS</h1>
        <p className="text-slate-500 mb-8 font-medium">Apertura de Caja y Turno</p>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-2 text-left">
            <label htmlFor="user" className="block font-semibold text-slate-700 flex items-center gap-2">
              <UserCircle2 className="w-5 h-5 text-blue-600" />
              Seleccionar Usuario
            </label>
            <select
              id="user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-xl px-4 py-4 font-medium text-lg focus:outline-none focus:border-blue-600 transition-colors cursor-pointer"
            >
              <option value="" disabled>-- Elija su usuario --</option>
              {USERS.map(u => (
                <option key={u.id} value={u.id} className="font-medium">
                  {u.name} {u.role === 'admin' ? '(Administrador)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!selectedUserId}
            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95"
          >
            Ingresar al Sistema
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
