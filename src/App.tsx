import React, { useState } from 'react';
import { ViewScreen, User, Product, Ticket } from './types';
import { INITIAL_PRODUCTS, INITIAL_STOCK, INITIAL_TICKETS } from './data';
import { Ventas } from './components/Ventas';
import { Despacho } from './components/Despacho';
import { Stock } from './components/Stock';
import { Articulos } from './components/Articulos';
import { Admin } from './components/Admin';
import { CierreCaja } from './components/CierreCaja';
import { Login } from './components/Login';
import { Store, ReceiptText, ScanLine, PackageSearch, Archive, BarChart3, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewScreen>('ventas');

  // Estado unificado y compartido en tiempo real
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [stockData, setStockData] = useState<Record<string, number>>(INITIAL_STOCK);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);

  // Manejador de nueva venta: descuenta stock automáticamente y agrega a la lista de tickets
  const handleNewTicket = (newTicket: Ticket) => {
    // 1. Agregar a la lista de tickets
    setTickets(prev => [newTicket, ...prev]);

    // 2. Descontar el stock en tiempo real
    setStockData(prev => {
      const updated = { ...prev };
      newTicket.items.forEach(item => {
        const currentQty = updated[item.product.id] ?? 0;
        updated[item.product.id] = Math.max(0, currentQty - item.quantity);
      });
      return updated;
    });
  };

  // Manejador de entrega en Despacho: marca el ticket como entregado
  const handleDeliverTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'delivered',
          deliveredAt: new Date()
        };
      }
      return t;
    }));
  };

  // Manejadores de Stock (ADMIN)
  const handleUpdateStock = (productId: string, newQuantity: number) => {
    setStockData(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  const handleAddBulkStock = (productId: string, addQuantity: number) => {
    setStockData(prev => ({
      ...prev,
      [productId]: (prev[productId] ?? 0) + addQuantity
    }));
  };

  // Manejadores de Artículos (ADMIN)
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
    setStockData(prev => ({ ...prev, [newProduct.id]: 30 })); // stock inicial por defecto
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Cierre de turno / logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('ventas');
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800 font-sans overflow-hidden">
      
      {/* Barra de Navegación Superior: limpia, gris y blanca descansadora a la vista */}
      <nav className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200 shrink-0 shadow-xs z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xs">
              <Store className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black tracking-tight leading-none text-slate-900">APS</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Event POS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Control de Ventas y Despacho</p>
            </div>
          </div>

          {/* Selector de Vistas / Pestañas */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {/* Pestaña: Ventas */}
            <button
              id="nav-ventas"
              onClick={() => setCurrentView('ventas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                currentView === 'ventas' 
                  ? 'bg-white text-blue-600 shadow-xs ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              Ventas (Caja)
            </button>

            {/* Pestaña: Zona de Entregas (Disponible para todos) */}
            <button
              id="nav-entregas"
              onClick={() => setCurrentView('entregas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                currentView === 'entregas' 
                  ? 'bg-white text-emerald-600 shadow-xs ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ScanLine className="w-4 h-4" />
              Zona de Entregas
            </button>
            
            {/* Pestañas Exclusivas para ADMIN */}
            {isAdmin && (
              <>
                <button
                  id="nav-stock"
                  onClick={() => setCurrentView('stock')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    currentView === 'stock' 
                      ? 'bg-white text-teal-600 shadow-xs ring-1 ring-slate-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  Stock
                </button>

                <button
                  id="nav-articulos"
                  onClick={() => setCurrentView('articulos')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    currentView === 'articulos' 
                      ? 'bg-white text-indigo-600 shadow-xs ring-1 ring-slate-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <PackageSearch className="w-4 h-4" />
                  Artículos
                </button>

                <button
                  id="nav-metricas"
                  onClick={() => setCurrentView('metricas')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    currentView === 'metricas' 
                      ? 'bg-white text-purple-600 shadow-xs ring-1 ring-slate-200' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Métricas Evento
                </button>
              </>
            )}
          </div>
        </div>

        {/* Perfil Activo y Botón de Salida */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="flex items-center justify-end gap-1.5">
              {isAdmin && <ShieldCheck className="w-4 h-4 text-indigo-600" />}
              <p className="text-sm font-bold text-slate-800 leading-none">{currentUser.name}</p>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
              {isAdmin ? 'ADMINISTRADOR GENERAL' : 'OPERADOR DE CAJA'}
            </p>
          </div>

          <button
            id="btn-logout"
            onClick={() => setCurrentView('cierre')}
            title="Cierre de Caja y Fin de Turno"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cierre de Caja</span>
          </button>
        </div>
      </nav>

      {/* Área de Trabajo Principal */}
      <main className="flex-1 overflow-hidden p-6 relative">
        <AnimatePresence mode="wait">
          {/* VISTA 1: VENTAS (CAJA) */}
          {currentView === 'ventas' && (
            <motion.div
              key="ventas"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <Ventas 
                products={products}
                stockData={stockData}
                currentUser={currentUser}
                onCheckout={handleNewTicket}
              />
            </motion.div>
          )}

          {/* VISTA 2: ZONA DE ENTREGAS (CANTINA / BARRA) */}
          {currentView === 'entregas' && (
            <motion.div
              key="entregas"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full max-w-5xl mx-auto"
            >
              <Despacho 
                tickets={tickets}
                onDeliver={handleDeliverTicket}
              />
            </motion.div>
          )}

          {/* VISTA 3: STOCK (ADMIN) */}
          {isAdmin && currentView === 'stock' && (
            <motion.div
              key="stock"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full max-w-6xl mx-auto"
            >
              <Stock 
                products={products}
                stockData={stockData}
                onUpdateStock={handleUpdateStock}
                onAddBulkStock={handleAddBulkStock}
              />
            </motion.div>
          )}

          {/* VISTA 4: ARTICULOS (ADMIN) */}
          {isAdmin && currentView === 'articulos' && (
            <motion.div
              key="articulos"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full max-w-6xl mx-auto"
            >
              <Articulos 
                products={products}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            </motion.div>
          )}

          {/* VISTA 5: METRICAS / ADMIN DASHBOARD */}
          {isAdmin && currentView === 'metricas' && (
            <motion.div
              key="metricas"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full max-w-6xl mx-auto"
            >
              <Admin tickets={tickets} />
            </motion.div>
          )}

          {/* VISTA 6: CIERRE DE CAJA */}
          {currentView === 'cierre' && (
            <motion.div
              key="cierre"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <CierreCaja 
                tickets={tickets} 
                currentUser={currentUser}
                onBack={() => setCurrentView('ventas')}
                onLogout={handleLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
