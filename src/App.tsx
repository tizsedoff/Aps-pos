import React, { useState } from 'react';
import { ViewScreen, User } from './types';
import { Ventas } from './components/Ventas';
import { Articulos } from './components/Articulos';
import { Stock } from './components/Stock';
import { Login } from './components/Login';
import { Store, ReceiptText, PackageSearch, Archive, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewScreen>('ventas');

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('ventas'); // reset to default view for next login
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* Navbar Superior Claro y Minimalista */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none text-slate-900">APS</h1>
              <p className="text-xs text-blue-600 font-bold tracking-widest uppercase mt-0.5">Sistema de Gestión</p>
            </div>
          </div>

          <div className="hidden md:flex bg-slate-100 p-1 rounded-xl border border-slate-200 ml-4">
            <button
              onClick={() => setCurrentView('ventas')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
                currentView === 'ventas' 
                  ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              <ReceiptText className="w-5 h-5" />
              Ventas
            </button>
            
            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentView('articulos')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
                    currentView === 'articulos' 
                      ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  <PackageSearch className="w-5 h-5" />
                  Artículos
                </button>

                <button
                  onClick={() => setCurrentView('stock')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
                    currentView === 'stock' 
                      ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  <Archive className="w-5 h-5" />
                  Stock
                </button>
              </>
            )}
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
            <p className={`text-xs font-bold uppercase tracking-wider ${currentUser.role === 'admin' ? 'text-indigo-600' : 'text-slate-500'}`}>
              {currentUser.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar Turno"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-6 relative">
        <AnimatePresence mode="wait">
          {currentView === 'ventas' && (
            <motion.div
              key="ventas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Ventas />
            </motion.div>
          )}
          {currentView === 'articulos' && (
            <motion.div
              key="articulos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full max-w-6xl mx-auto"
            >
              <Articulos />
            </motion.div>
          )}
          {currentView === 'stock' && (
            <motion.div
              key="stock"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full max-w-6xl mx-auto"
            >
              <Stock />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
