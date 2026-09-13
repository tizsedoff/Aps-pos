import React, { useState } from 'react';
import { ViewScreen, User, Product, Ticket, Side, SalesBox, DispatchStation, GeneralClosure } from './types';
import { INITIAL_PRODUCTS, INITIAL_STOCK, INITIAL_TICKETS, INITIAL_SIDES, INITIAL_SALES_BOXES, INITIAL_DISPATCH_STATIONS, INITIAL_GENERAL_CLOSURES } from './data';
import { Ventas } from './components/Ventas';
import { Despacho } from './components/Despacho';
import { Stock } from './components/Stock';
import { Articulos } from './components/Articulos';
import { Admin } from './components/Admin';
import { CierreCaja } from './components/CierreCaja';
import { Login } from './components/Login';
import { Terminales } from './components/Terminales';
import { ApsLogo } from './components/ApsLogo';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { 
  ReceiptText, 
  ScanLine, 
  PackageSearch, 
  Archive, 
  BarChart3, 
  LogOut, 
  ShieldCheck, 
  ShoppingCart, 
  KeyRound,
  Calculator,
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('aps_pos_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentView, setCurrentView] = useState<ViewScreen>(() => {
    try {
      const saved = localStorage.getItem('aps_pos_current_view');
      return (saved as ViewScreen) || 'ventas';
    } catch {
      return 'ventas';
    }
  });

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Guardar sesión y vista en localStorage
  React.useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('aps_pos_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('aps_pos_current_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  React.useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('aps_pos_current_view', currentView);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentView, currentUser]);

  // Si el rol es cajero, no permitir acceder a vistas ajenas a ventas o cierre
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'cajero' && currentView !== 'ventas' && currentView !== 'cierre') {
        setCurrentView('ventas');
      } else if (currentUser.role === 'despacho' && currentView !== 'entregas') {
        setCurrentView('entregas');
      }
    }
  }, [currentUser, currentView]);

  // Estado de Cajas de Ventas (Puntos de Cobro) persistido
  const [salesBoxes, setSalesBoxes] = useState<SalesBox[]>(() => {
    try {
      const saved = localStorage.getItem('aps_pos_sales_boxes');
      return saved ? JSON.parse(saved) : INITIAL_SALES_BOXES;
    } catch {
      return INITIAL_SALES_BOXES;
    }
  });

  // Estado de Puestos de Entrega / Despacho persistido
  const [dispatchStations, setDispatchStations] = useState<DispatchStation[]>(() => {
    try {
      const saved = localStorage.getItem('aps_pos_dispatch_stations');
      return saved ? JSON.parse(saved) : INITIAL_DISPATCH_STATIONS;
    } catch {
      return INITIAL_DISPATCH_STATIONS;
    }
  });

  // Guardar Cajas y Puestos en localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('aps_pos_sales_boxes', JSON.stringify(salesBoxes));
    } catch (e) {
      console.error(e);
    }
  }, [salesBoxes]);

  React.useEffect(() => {
    try {
      localStorage.setItem('aps_pos_dispatch_stations', JSON.stringify(dispatchStations));
    } catch (e) {
      console.error(e);
    }
  }, [dispatchStations]);

  // Estado unificado de Productos
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('aps_pos_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Estado de Guarniciones persistido
  const [sides, setSides] = useState<Side[]>(() => {
    try {
      const saved = localStorage.getItem('aps_pos_sides');
      return saved ? JSON.parse(saved) : INITIAL_SIDES;
    } catch {
      return INITIAL_SIDES;
    }
  });

  const [stockData, setStockData] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('aps_pos_stock');
      return saved ? JSON.parse(saved) : INITIAL_STOCK;
    } catch {
      return INITIAL_STOCK;
    }
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem('aps_pos_tickets');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          deliveredAt: t.deliveredAt ? new Date(t.deliveredAt) : undefined
        }));
      }
      return INITIAL_TICKETS;
    } catch {
      return INITIAL_TICKETS;
    }
  });

  // Guardar datos en localStorage ante cualquier cambio
  React.useEffect(() => {
    try {
      localStorage.setItem('aps_pos_products', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  React.useEffect(() => {
    try {
      localStorage.setItem('aps_pos_sides', JSON.stringify(sides));
    } catch (e) {
      console.error(e);
    }
  }, [sides]);

  React.useEffect(() => {
    try {
      localStorage.setItem('aps_pos_stock', JSON.stringify(stockData));
    } catch (e) {
      console.error(e);
    }
  }, [stockData]);

  React.useEffect(() => {
    try {
      localStorage.setItem('aps_pos_tickets', JSON.stringify(tickets));
    } catch (e) {
      console.error(e);
    }
  }, [tickets]);

  // Estado de Cierres Generales (Consolidados del Admin)
  const [generalClosures, setGeneralClosures] = useState<GeneralClosure[]>(() => {
    try {
      const saved = localStorage.getItem('aps_pos_general_closures');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((c: any) => ({
          ...c,
          closedAt: new Date(c.closedAt)
        }));
      }
      return INITIAL_GENERAL_CLOSURES;
    } catch {
      return INITIAL_GENERAL_CLOSURES;
    }
  });

  // Timestamp del último Cierre General para calcular los tickets de la jornada actual
  const [lastClosureDate, setLastClosureDate] = useState<string | null>(() => {
    try {
      return localStorage.getItem('aps_pos_last_closure_date');
    } catch {
      return null;
    }
  });

  // Guardar cierres en localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('aps_pos_general_closures', JSON.stringify(generalClosures));
    } catch (e) {
      console.error(e);
    }
  }, [generalClosures]);

  React.useEffect(() => {
    try {
      if (lastClosureDate) {
        localStorage.setItem('aps_pos_last_closure_date', lastClosureDate);
      } else {
        localStorage.removeItem('aps_pos_last_closure_date');
      }
    } catch (e) {
      console.error(e);
    }
  }, [lastClosureDate]);

  // Manejador del Cierre General de Jornada
  const handlePerformGeneralClosure = (notes?: string): GeneralClosure => {
    const closureTime = lastClosureDate ? new Date(lastClosureDate).getTime() : 0;
    const currentDayTickets = tickets.filter(t => new Date(t.createdAt).getTime() > closureTime);

    const totalSales = currentDayTickets.reduce((sum, t) => sum + t.total, 0);
    const deliveredCount = currentDayTickets.filter(t => t.status === 'delivered').length;
    const pendingCount = currentDayTickets.filter(t => t.status === 'pending').length;

    // Desglose por caja
    const breakdownByBox: Record<string, number> = {};
    salesBoxes.forEach(b => { breakdownByBox[b.name] = 0; });
    currentDayTickets.forEach(t => {
      const bId = t.boxId || 'CAJA-01';
      breakdownByBox[bId] = (breakdownByBox[bId] || 0) + t.total;
    });

    // Desglose por puesto de despacho
    const breakdownByStation: Record<string, number> = {};
    dispatchStations.forEach(s => { breakdownByStation[s.name] = 0; });
    currentDayTickets.forEach(t => {
      const sName = t.targetStation || 'General';
      breakdownByStation[sName] = (breakdownByStation[sName] || 0) + t.total;
    });

    const now = new Date();
    const dateFormatted = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const closureId = `CG-${dateFormatted}-${String(generalClosures.length + 1).padStart(3, '0')}`;

    const newClosure: GeneralClosure = {
      id: closureId,
      closedAt: now,
      dateString: now.toLocaleDateString('es-AR'),
      totalSales,
      ticketsCount: currentDayTickets.length,
      deliveredTicketsCount: deliveredCount,
      pendingTicketsCount: pendingCount,
      adminName: currentUser?.name || 'Administrador General',
      breakdownByBox,
      breakdownByStation,
      notes
    };

    setGeneralClosures(prev => [newClosure, ...prev]);
    setLastClosureDate(now.toISOString());

    return newClosure;
  };

  // Manejador para login con vista inicial según perfil
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'cajero') {
      setCurrentView('ventas');
    } else if (user.role === 'despacho') {
      setCurrentView('entregas');
    } else {
      setCurrentView('metricas');
    }
  };

  // Manejador de ventas (acepta un ticket o múltiples si se dividieron por puesto)
  const handleCheckout = (newTicket: Ticket | Ticket[]) => {
    const ticketsToAdd = Array.isArray(newTicket) ? newTicket : [newTicket];
    setTickets(prev => [...ticketsToAdd, ...prev]);

    // Descontar del stock global
    setStockData(prev => {
      const updated = { ...prev };
      ticketsToAdd.forEach(ticket => {
        ticket.items.forEach(item => {
          const currentQty = updated[item.product.id] || 0;
          updated[item.product.id] = Math.max(0, currentQty - item.quantity);
        });
      });
      return updated;
    });
  };

  // Manejador de despacho
  const handleDeliverTicket = (ticketId: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: 'delivered',
          deliveredAt: new Date()
        };
      }
      return ticket;
    }));
  };

  // Manejadores de Cajas de Ventas (Crear, Modificar y Eliminar)
  const handleAddSalesBox = (box: SalesBox) => {
    setSalesBoxes(prev => [...prev, box]);
  };

  const handleUpdateSalesBox = (updatedBox: SalesBox, oldName?: string) => {
    setSalesBoxes(prev => prev.map(b => b.id === updatedBox.id ? updatedBox : b));
    if (oldName && oldName !== updatedBox.name) {
      setTickets(prev => prev.map(t => t.boxId === oldName ? { ...t, boxId: updatedBox.name } : t));
    }
  };

  const handleDeleteSalesBox = (boxId: string) => {
    setSalesBoxes(prev => prev.filter(b => b.id !== boxId));
  };

  // Manejadores de Puestos de Entrega (Crear, Modificar y Eliminar)
  const handleAddDispatchStation = (station: DispatchStation) => {
    setDispatchStations(prev => [...prev, station]);
  };

  const handleUpdateDispatchStation = (updatedStation: DispatchStation) => {
    setDispatchStations(prev => prev.map(s => s.id === updatedStation.id ? updatedStation : s));
  };

  const handleDeleteDispatchStation = (stationId: string) => {
    setDispatchStations(prev => prev.filter(s => s.id !== stationId));
  };

  // Manejadores de Stock (ADMIN)
  const handleUpdateStock = (productId: string, newStock: number) => {
    setStockData(prev => ({
      ...prev,
      [productId]: Math.max(0, newStock)
    }));
  };

  const handleAddBulkStock = (productId: string, amountToAdd: number) => {
    setStockData(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + amountToAdd)
    }));
  };

  // Manejadores de Productos (ADMIN)
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
    setStockData(prev => ({
      ...prev,
      [newProduct.id]: 50
    }));
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setStockData(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  // Manejadores de Guarniciones (ADMIN)
  const handleAddSide = (newSide: Side) => {
    setSides(prev => [...prev, newSide]);
  };

  const handleUpdateSide = (updatedSide: Side) => {
    setSides(prev => prev.map(s => s.id === updatedSide.id ? updatedSide : s));
  };

  const handleDeleteSide = (sideId: string) => {
    setSides(prev => prev.filter(s => s.id !== sideId));
    setProducts(prev => prev.map(p => {
      if (p.allowedSideIds?.includes(sideId)) {
        return {
          ...p,
          allowedSideIds: p.allowedSideIds.filter(id => id !== sideId)
        };
      }
      return p;
    }));
  };

  // Cierre de turno / logout
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('ventas');
    try {
      localStorage.removeItem('aps_pos_current_user');
      localStorage.removeItem('aps_pos_current_view');
    } catch (e) {
      console.error(e);
    }
  };

  if (!currentUser) {
    return (
      <Login 
        onLogin={handleLogin} 
        salesBoxes={salesBoxes}
        dispatchStations={dispatchStations}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const isCajero = currentUser.role === 'cajero';
  const isDespacho = currentUser.role === 'despacho';

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-slate-800 font-sans overflow-hidden print:h-auto print:bg-white print:overflow-visible">
      
      {/* Barra de Navegación Superior adaptable según perfil */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200 shrink-0 shadow-xs z-20 print:hidden">
        {/* Identidad APS */}
        <div className="flex items-center gap-3">
          <ApsLogo className="w-9 h-9 drop-shadow-xs shrink-0" />
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black tracking-tight leading-none text-slate-900">APS</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                POS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5 hidden sm:block">Control de Eventos</p>
          </div>
        </div>

        {/* CENTRO: DISTRIBUCIÓN ESPECÍFICA SEGÚN EL PERFIL ACTIVO */}

        {/* 1. PERFIL: CAJA DE VENTAS (Aislado y Enfocado Exclusivamente en Vender) */}
        {isCajero && (
          <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-200/80 px-3 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black text-blue-900 uppercase tracking-wider">
              Caja de Ventas
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-100 font-mono">
              {currentUser.boxId || 'CAJA-01'}
            </span>
            <span className="text-xs font-semibold text-slate-600 hidden md:inline">
              • {currentUser.name}
            </span>
          </div>
        )}

        {/* 2. PERFIL: ZONA DE ENTREGAS */}
        {isDespacho && (
          <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200/80 px-3 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ScanLine className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">
              Zona de Entregas & Despacho
            </span>
            <span className="text-xs font-semibold text-slate-600 hidden md:inline">
              • {currentUser.name}
            </span>
          </div>
        )}

        {/* 3. PERFIL: ADMINISTRADOR (Tiene Selector de Pestañas Completo con Terminales) */}
        {isAdmin && (
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              id="nav-metricas"
              onClick={() => setCurrentView('metricas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                currentView === 'metricas' 
                  ? 'bg-white text-purple-700 shadow-xs ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Métricas
            </button>

            <button
              id="nav-terminales"
              onClick={() => setCurrentView('terminales')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                currentView === 'terminales' 
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Puestos & Cajas
            </button>

            <button
              id="nav-articulos"
              onClick={() => setCurrentView('articulos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                currentView === 'articulos' 
                  ? 'bg-white text-indigo-700 shadow-xs ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <PackageSearch className="w-3.5 h-3.5" />
              Artículos
            </button>

            <button
              id="nav-stock"
              onClick={() => setCurrentView('stock')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                currentView === 'stock' 
                  ? 'bg-white text-teal-700 shadow-xs ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              Stock
            </button>

            <button
              id="nav-ventas"
              onClick={() => setCurrentView('ventas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                currentView === 'ventas' 
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5" />
              Caja
            </button>

            <button
              id="nav-entregas"
              onClick={() => setCurrentView('entregas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                currentView === 'entregas' 
                  ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" />
              Entregas
            </button>
          </div>
        )}

        {/* ACCIONES Y BOTONES DERECHA */}
        <div className="flex items-center gap-2">
          {/* Botones para Cajero */}
          {isCajero && (
            <>
              <button
                id="btn-cierre-caja"
                onClick={() => setCurrentView('cierre')}
                title="Arqueo y Cierre de Turno"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentView === 'cierre'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Cierre de Caja</span>
              </button>

              <button
                id="btn-logout"
                onClick={handleLogout}
                title="Salir del turno"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 text-xs font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </>
          )}

          {/* Botón para Despacho */}
          {isDespacho && (
            <button
              id="btn-logout"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          )}

          {/* Botones para Administrador */}
          {isAdmin && (
            <>
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                title="Cambiar Contraseña de Administrador"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/70 text-xs font-bold transition-colors shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Seguridad</span>
              </button>

              <button
                id="btn-cierre-global"
                onClick={() => setCurrentView('cierre')}
                title="Auditoría de Cierre de Caja"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentView === 'cierre'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cierres</span>
              </button>

              <button
                id="btn-logout"
                onClick={handleLogout}
                title="Cerrar sesión de Administrador"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 text-xs font-bold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Área de Trabajo Principal */}
      <main className="flex-1 overflow-hidden p-4 sm:p-6 relative print:p-0 print:overflow-visible print:block">
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
                sides={sides}
                stockData={stockData}
                currentUser={currentUser}
                dispatchStations={dispatchStations}
                onCheckout={handleCheckout}
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
                dispatchStations={dispatchStations}
                currentUser={currentUser}
                onDeliver={handleDeliverTicket}
              />
            </motion.div>
          )}

          {/* VISTA 3: TERMINALES Y PUESTOS (ADMIN) */}
          {isAdmin && currentView === 'terminales' && (
            <motion.div
              key="terminales"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full max-w-6xl mx-auto"
            >
              <Terminales 
                salesBoxes={salesBoxes}
                dispatchStations={dispatchStations}
                tickets={tickets}
                onAddSalesBox={handleAddSalesBox}
                onUpdateSalesBox={handleUpdateSalesBox}
                onDeleteSalesBox={handleDeleteSalesBox}
                onAddDispatchStation={handleAddDispatchStation}
                onUpdateDispatchStation={handleUpdateDispatchStation}
                onDeleteDispatchStation={handleDeleteDispatchStation}
              />
            </motion.div>
          )}

          {/* VISTA 4: STOCK (ADMIN) */}
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

          {/* VISTA 5: ARTICULOS (ADMIN) */}
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
                sides={sides}
                dispatchStations={dispatchStations}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddSide={handleAddSide}
                onUpdateSide={handleUpdateSide}
                onDeleteSide={handleDeleteSide}
              />
            </motion.div>
          )}

          {/* VISTA 6: METRICAS / ADMIN DASHBOARD */}
          {isAdmin && currentView === 'metricas' && (
            <motion.div
              key="metricas"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full max-w-6xl mx-auto"
            >
              <Admin 
                tickets={tickets} 
                salesBoxes={salesBoxes}
                dispatchStations={dispatchStations}
                generalClosures={generalClosures}
                lastClosureDate={lastClosureDate}
                onPerformGeneralClosure={handlePerformGeneralClosure}
                onAddSalesBox={handleAddSalesBox}
                onUpdateSalesBox={handleUpdateSalesBox}
                onDeleteSalesBox={handleDeleteSalesBox}
                onAddDispatchStation={handleAddDispatchStation}
                onUpdateDispatchStation={handleUpdateDispatchStation}
                onDeleteDispatchStation={handleDeleteDispatchStation}
                onNavigateToTerminales={() => setCurrentView('terminales')}
              />
            </motion.div>
          )}

          {/* VISTA 7: CIERRE DE CAJA */}
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
                salesBoxes={salesBoxes}
                onBack={() => {
                  if (currentUser.role === 'cajero') {
                    setCurrentView('ventas');
                  } else if (currentUser.role === 'despacho') {
                    setCurrentView('entregas');
                  } else {
                    setCurrentView('metricas');
                  }
                }}
                onLogout={handleLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal Global para Cambiar Contraseña de Administrador */}
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
