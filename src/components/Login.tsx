import React, { useState } from 'react';
import { User } from '../types';
import { UserCircle2, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { ApsLogo } from './ApsLogo';

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [loginType, setLoginType] = useState<'cajero' | 'admin'>('cajero');
  
  const [cashierName, setCashierName] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (loginType === 'cajero') {
      if (!cashierName.trim()) {
        setError('Por favor, ingrese su nombre para registrar su caja.');
        return;
      }
      onLogin({
        id: `CAJ-${Math.floor(Math.random() * 10000)}`,
        name: cashierName.trim(),
        role: 'cajero'
      });
    } else {
      // Pin fijo para demo
      if (adminPin !== '1234') {
        setError('PIN incorrecto. (Ayuda: Use 1234)');
        return;
      }
      onLogin({
        id: 'ADMIN',
        name: 'Administrador General',
        role: 'admin'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-200 w-full max-w-md flex flex-col items-center text-center"
      >
        <div className="mb-5 drop-shadow-md">
          <ApsLogo className="w-24 h-24" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-1 tracking-tight">APS POS</h1>
        <p className="text-slate-500 mb-7 font-medium text-sm">Control de Ventas y Despacho</p>

        {/* Selector de Tipo de Ingreso */}
        <div className="flex w-full bg-slate-100 p-1.5 rounded-xl mb-8">
          <button
            type="button"
            onClick={() => { setLoginType('cajero'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${
              loginType === 'cajero' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCircle2 className="w-4 h-4" />
            Operador de Caja
          </button>
          <button
            type="button"
            onClick={() => { setLoginType('admin'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm transition-all ${
              loginType === 'admin' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Administrador
          </button>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          {loginType === 'cajero' ? (
            <div className="space-y-2 text-left">
              <label htmlFor="cashierName" className="block font-bold text-slate-700 text-sm">
                Nombre del Cajero / Operador
              </label>
              <input
                id="cashierName"
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-xl px-4 py-4 font-bold text-lg focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder:font-normal"
                autoComplete="off"
              />
            </div>
          ) : (
            <div className="space-y-2 text-left">
              <label htmlFor="adminPin" className="block font-bold text-slate-700 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                PIN de Acceso
              </label>
              <input
                id="adminPin"
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="****"
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-xl px-4 py-4 font-black text-2xl tracking-widest text-center focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all placeholder:tracking-normal placeholder:font-normal"
                autoComplete="off"
              />
            </div>
          )}

          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 font-bold text-sm bg-red-50 py-2 px-3 rounded-lg border border-red-100"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
              loginType === 'cajero'
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
            }`}
          >
            {loginType === 'cajero' ? 'Abrir Caja y Comenzar' : 'Ingresar al Panel'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}
