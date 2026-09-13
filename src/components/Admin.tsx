import React, { useMemo, useState } from 'react';
import { Ticket, SalesBox, DispatchStation, GeneralClosure } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  DollarSign, 
  Ticket as TicketIcon, 
  Clock, 
  CheckCircle2, 
  Server, 
  TrendingUp, 
  Users, 
  KeyRound, 
  ShieldCheck, 
  Store, 
  Pencil, 
  Plus, 
  Trash2, 
  X, 
  AlertTriangle, 
  MapPin, 
  ShoppingCart, 
  ScanLine, 
  BarChart3,
  Lock,
  History,
  FileText,
  Printer,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { Terminales } from './Terminales';
import { CierreGeneralModal } from './CierreGeneralModal';
import { ActaCierreGeneralModal } from './ActaCierreGeneralModal';

interface AdminProps {
  tickets: Ticket[];
  salesBoxes?: SalesBox[];
  dispatchStations?: DispatchStation[];
  generalClosures?: GeneralClosure[];
  lastClosureDate?: string | null;
  onPerformGeneralClosure?: (notes?: string) => GeneralClosure;
  onAddSalesBox?: (box: SalesBox) => void;
  onUpdateSalesBox?: (box: SalesBox, oldName?: string) => void;
  onDeleteSalesBox?: (boxId: string) => void;
  onAddDispatchStation?: (station: DispatchStation) => void;
  onUpdateDispatchStation?: (station: DispatchStation) => void;
  onDeleteDispatchStation?: (stationId: string) => void;
  onNavigateToTerminales?: () => void;
}

export function Admin({
  tickets,
  salesBoxes = [],
  dispatchStations = [],
  generalClosures = [],
  lastClosureDate = null,
  onPerformGeneralClosure,
  onAddSalesBox,
  onUpdateSalesBox,
  onDeleteSalesBox,
  onAddDispatchStation,
  onUpdateDispatchStation,
  onDeleteDispatchStation,
  onNavigateToTerminales
}: AdminProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'metricas' | 'cierres' | 'terminales'>('metricas');

  // Modal para realizar el Cierre General del Día
  const [isCierreModalOpen, setIsCierreModalOpen] = useState(false);
  // Modal para ver/imprimir el Acta de Cierre General
  const [selectedClosureForActa, setSelectedClosureForActa] = useState<GeneralClosure | null>(null);

  // Estado para modificar caja desde el admin panel
  const [editingBox, setEditingBox] = useState<SalesBox | null>(null);
  const [editBoxName, setEditBoxName] = useState('');
  const [editBoxDesc, setEditBoxDesc] = useState('');
  const [editBoxError, setEditBoxError] = useState('');

  // Estado para crear nueva caja directamente desde el admin panel
  const [isCreatingBox, setIsCreatingBox] = useState(false);
  const [newBoxName, setNewBoxName] = useState('');
  const [newBoxDesc, setNewBoxDesc] = useState('');
  const [newBoxError, setNewBoxError] = useState('');

  // Estado para confirmación de eliminación de caja desde el admin panel
  const [deletingBox, setDeletingBox] = useState<SalesBox | null>(null);

  // 1. Filtrar tickets correspondientes al día/período actual (posteriores al último Cierre General)
  const todayTickets = useMemo(() => {
    if (!lastClosureDate) return tickets;
    const closureTime = new Date(lastClosureDate).getTime();
    return tickets.filter(t => new Date(t.createdAt).getTime() > closureTime);
  }, [tickets, lastClosureDate]);

  // 2. Ingreso Hoy (se reinicia a $0 al cerrar el día)
  const todaySales = useMemo(() => {
    return todayTickets.reduce((sum, t) => sum + t.total, 0);
  }, [todayTickets]);

  // 3. Ingreso acumulado en cierres anteriores del mes
  const closedMonthSales = useMemo(() => {
    if (!generalClosures || generalClosures.length === 0) return 0;
    return generalClosures.reduce((sum, c) => sum + c.totalSales, 0);
  }, [generalClosures]);

  // 4. Ingreso Total del Mes (Cierres del mes + Ingreso Hoy)
  const monthSales = useMemo(() => {
    return closedMonthSales + todaySales;
  }, [closedMonthSales, todaySales]);

  // 5. Estadísticas del día en curso
  const todayStats = useMemo(() => {
    const avgTicket = todayTickets.length ? Math.round(todaySales / todayTickets.length) : 0;
    const pendingItems = todayTickets
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.items.reduce((s, item) => s + item.quantity, 0), 0);
    const deliveredTickets = todayTickets.filter(t => t.status === 'delivered').length;
      
    return {
      todaySales,
      monthSales,
      avgTicket,
      totalTicketsToday: todayTickets.length,
      pendingItems,
      deliveredTickets
    };
  }, [todayTickets, todaySales, monthSales]);

  // Ventas por caja en la jornada actual
  const salesByBox = useMemo(() => {
    const boxMap: Record<string, number> = {};
    
    if (salesBoxes && salesBoxes.length > 0) {
      salesBoxes.forEach(b => {
        boxMap[b.name] = 0;
      });
    } else {
      ['CAJA-01', 'CAJA-02', 'CAJA-03', 'CAJA-04'].forEach(b => {
        boxMap[b] = 0;
      });
    }

    todayTickets.forEach(t => {
      const bId = t.boxId || 'CAJA-01';
      boxMap[bId] = (boxMap[bId] || 0) + t.total;
    });

    return Object.entries(boxMap).map(([name, sales]) => ({
      name,
      Ventas: sales
    }));
  }, [todayTickets, salesBoxes]);

  const recentTickets = useMemo(() => {
    return [...tickets].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);
  }, [tickets]);

  // Manejador para abrir modal de edición de caja
  const handleOpenEditBox = (box: SalesBox) => {
    setEditingBox(box);
    setEditBoxName(box.name);
    setEditBoxDesc(box.description || '');
    setEditBoxError('');
  };

  // Manejador para guardar caja editada
  const handleSaveEditBox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBox || !onUpdateSalesBox) return;

    const trimmedName = editBoxName.trim().toUpperCase();
    if (!trimmedName) {
      setEditBoxError('El identificador de la caja no puede estar vacío.');
      return;
    }

    if (
      trimmedName !== editingBox.name.toUpperCase() &&
      salesBoxes.some(b => b.id !== editingBox.id && b.name.toUpperCase() === trimmedName)
    ) {
      setEditBoxError(`Ya existe otra caja con el nombre "${trimmedName}".`);
      return;
    }

    const updated: SalesBox = {
      ...editingBox,
      name: trimmedName,
      description: editBoxDesc.trim() || undefined
    };

    onUpdateSalesBox(updated, editingBox.name);
    setEditingBox(null);
  };

  // Manejador para crear caja rápida desde el panel
  const handleSaveCreateBox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddSalesBox) return;

    const trimmedName = newBoxName.trim().toUpperCase();
    if (!trimmedName) {
      setNewBoxError('Ingrese un identificador (ej: CAJA-05).');
      return;
    }

    if (salesBoxes.some(b => b.name.toUpperCase() === trimmedName)) {
      setNewBoxError(`Ya existe una caja con el nombre "${trimmedName}".`);
      return;
    }

    const newBox: SalesBox = {
      id: `box-${Date.now()}`,
      name: trimmedName,
      description: newBoxDesc.trim() || undefined
    };

    onAddSalesBox(newBox);
    setNewBoxName('');
    setNewBoxDesc('');
    setIsCreatingBox(false);
  };

  // Confirmar eliminación
  const handleConfirmDeleteBox = () => {
    if (!deletingBox || !onDeleteSalesBox) return;
    if (salesBoxes.length <= 1) {
      alert('Debe existir al menos una caja de ventas activa en el sistema.');
      setDeletingBox(null);
      return;
    }
    onDeleteSalesBox(deletingBox.id);
    setDeletingBox(null);
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-6">
      
      {/* Barra de Título y Selector de Sub-sección del Admin */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 sm:px-6 shadow-xs shrink-0">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Panel de Administración
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo en tiempo real, cierres generales de jornada y administración de puestos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Selector de Pestañas dentro del Admin */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setAdminTab('metricas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                adminTab === 'metricas'
                  ? 'bg-white text-purple-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Métricas</span>
            </button>

            <button
              onClick={() => setAdminTab('cierres')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                adminTab === 'cierres'
                  ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Cierres Generales</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-mono">
                {generalClosures.length}
              </span>
            </button>

            <button
              onClick={() => setAdminTab('terminales')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                adminTab === 'terminales'
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Puestos & Cajas</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full text-[10px] font-mono">
                {salesBoxes.length}
              </span>
            </button>
          </div>

          {/* Botón Principal: Cierre General del Día */}
          <button
            onClick={() => setIsCierreModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-98"
            title="Consolidar cajas, acumular al mes y reiniciar día"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Cierre General</span>
            {todaySales > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 rounded-xl font-bold text-xs transition-colors shadow-xs active:scale-98 ml-auto sm:ml-0"
          >
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span className="hidden md:inline">Contraseña Admin</span>
          </button>
        </div>
      </div>

      {/* VISTA 1: PUESTOS Y CAJAS (Dentro del Panel de Administración) */}
      {adminTab === 'terminales' ? (
        <Terminales 
          salesBoxes={salesBoxes}
          dispatchStations={dispatchStations}
          tickets={tickets}
          onAddSalesBox={onAddSalesBox || (() => {})}
          onUpdateSalesBox={onUpdateSalesBox || (() => {})}
          onDeleteSalesBox={onDeleteSalesBox || (() => {})}
          onAddDispatchStation={onAddDispatchStation || (() => {})}
          onUpdateDispatchStation={onUpdateDispatchStation || (() => {})}
          onDeleteDispatchStation={onDeleteDispatchStation || (() => {})}
        />
      ) : adminTab === 'cierres' ? (
        /* VISTA 2: HISTORIAL DE CIERRES GENERALES */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <History className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Historial de Cierres Generales</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Registro auditable de recaudación acumulada consolidada día a día
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Acumulado Mes (Cierres)</span>
                <span className="font-mono font-black text-emerald-700 text-base">
                  ${closedMonthSales.toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCierreModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-98"
              >
                <Lock className="w-4 h-4" />
                <span>Realizar Cierre de Hoy</span>
              </button>
            </div>
          </div>

          {/* Listado de Cierres */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            {generalClosures.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-600 text-sm">No hay cierres generales archivados aún</p>
                <p className="text-xs max-w-sm mx-auto">
                  Al finalizar la jornada diaria, presione el botón "Cierre General" para consolidar las ventas y archivarlas en el acumulado del mes.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {generalClosures.map((closure) => (
                  <div
                    key={closure.id}
                    className="p-4 bg-slate-50 hover:bg-emerald-50/30 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md">
                          {closure.id}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {new Date(closure.closedAt).toLocaleDateString('es-AR', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(closure.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span>Auditor: <strong>{closure.adminName}</strong></span>
                        <span>•</span>
                        <span>Tickets: <strong>{closure.ticketsCount} emitidos</strong> ({closure.deliveredTicketsCount} entregados)</span>
                        {closure.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-500">"{closure.notes}"</span>
                          </>
                        )}
                      </div>
                      {/* Desglose por Caja en chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.entries(closure.breakdownByBox || {}).map(([box, total]) => (
                          <span key={box} className="text-[10px] font-mono font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                            {box}: ${total.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Recaudado</span>
                        <span className="font-mono font-black text-slate-900 text-lg">
                          ${closure.totalSales.toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedClosureForActa(closure)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ver / Imprimir Acta</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VISTA 3: MÉTRICAS Y FACTURACIÓN CON INGRESO HOY E INGRESO DEL MES */
        <>
          {/* Tarjetas de Métricas Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Tarjeta 1: INGRESO HOY */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                    Ingreso Hoy
                  </span>
                  <span className="text-[10px] text-slate-400">Jornada actual en curso</span>
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">${todayStats.todaySales.toLocaleString()}</p>
              
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {todayStats.todaySales > 0 ? (
                  <>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> {todayStats.totalTicketsToday} tickets hoy
                    </span>
                    <button
                      onClick={() => setIsCierreModalOpen(true)}
                      className="text-[11px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md transition-colors"
                    >
                      Cerrar Día
                    </button>
                  </>
                ) : (
                  <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Reiniciado a $0 tras último cierre
                  </span>
                )}
              </div>
            </div>
            
            {/* Tarjeta 2: INGRESO DEL MES */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                    Ingreso del Mes
                  </span>
                  <span className="text-[10px] text-slate-400">Cierres acumulados + Hoy</span>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">${todayStats.monthSales.toLocaleString()}</p>
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{generalClosures.length} {generalClosures.length === 1 ? 'cierre archivado' : 'cierres archivados'}</span>
                <button
                  onClick={() => setAdminTab('cierres')}
                  className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-0.5"
                >
                  Ver historial <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {/* Tarjeta 3: TICKET PROMEDIO (HOY) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Ticket Promedio</span>
                  <span className="text-[10px] text-slate-400">Jornada actual</span>
                </div>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <TicketIcon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">${todayStats.avgTicket.toLocaleString()}</p>
              <span className="text-xs text-slate-400 mt-2">
                {todayStats.totalTicketsToday} comprobantes emitidos hoy
              </span>
            </div>
            
            {/* Tarjeta 4: ENTREGAS Y ESTADO DE HOY */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Entregas de Hoy</span>
                  <span className="text-[10px] text-slate-400">Despacho en puestos</span>
                </div>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {todayStats.deliveredTickets} / {todayStats.totalTicketsToday}
              </p>
              <span className={`text-xs font-semibold mt-2 flex items-center gap-1 ${todayStats.pendingItems > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {todayStats.pendingItems > 0 ? `${todayStats.pendingItems} items pendientes en puesto` : '100% entregado'}
              </span>
            </div>
          </div>

          {/* Gráfico y Gestión Directa de Cajas de Ventas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tarjeta de Gráfico + Modificación Rápida de Cajas */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs lg:col-span-2 flex flex-col">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                    Rendimiento y Configuración de Cajas
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modifique nombres, ubicaciones y consulte la recaudación de cada caja
                  </p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setNewBoxName('');
                      setNewBoxDesc('');
                      setNewBoxError('');
                      setIsCreatingBox(true);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva Caja</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdminTab('terminales')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
                  >
                    <Store className="w-3.5 h-3.5 text-slate-600" />
                    <span>Ver Todas</span>
                  </button>
                </div>
              </div>

              {/* Gráfico de barras */}
              <div className="h-60 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesByBox}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip 
                      formatter={(val: number) => [`$${val.toLocaleString()}`, 'Ventas']} 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="Ventas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Listado Interactivo para Modificar Cajas Directamente */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cajas de Venta Activas (Clic en "Modificar" para editar)
                  </h4>
                  <span className="text-xs font-bold text-slate-400">
                    {salesBoxes.length} {salesBoxes.length === 1 ? 'caja' : 'cajas'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {salesBoxes.map((box) => {
                    const boxTickets = tickets.filter(t => t.boxId === box.name);
                    const boxTotal = boxTickets.reduce((sum, t) => sum + t.total, 0);

                    return (
                      <div
                        key={box.id}
                        className="p-3 bg-slate-50 hover:bg-blue-50/40 border border-slate-200/80 rounded-2xl flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-blue-700 font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {box.name.slice(-2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-slate-900 text-xs truncate">
                                {box.name}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium truncate flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span className="truncate">{box.description || 'Puesto General'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="text-right mr-1 hidden sm:block">
                            <p className="text-[11px] font-black text-slate-800">${boxTotal.toLocaleString()}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{boxTickets.length} tickets</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenEditBox(box)}
                            title="Modificar nombre y ubicación de la caja"
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Modificar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingBox(box)}
                            title="Eliminar caja"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Estado del Sistema y Facturación AFIP */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Integración Fiscal AFIP</h3>
                <p className="text-xs text-slate-400 mb-6">Estado de la conexión CAE y facturación en lote</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <p className="text-xs font-bold text-emerald-950">WebService Factura Electrónica</p>
                        <p className="text-[10px] text-emerald-700">WSFE v1.2 - Homologación Online</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Server className="w-4 h-4 text-slate-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Modo de Contingencia</p>
                        <p className="text-[10px] text-slate-400">Emisión en cola local habilitada</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                      LISTO
                    </span>
                  </div>

                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Store className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-900">Control de Puntos de Venta</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Cada caja configurada en este panel emite tickets fiscales independientes con numeración correlativa por punto de cobro.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6">
                <div className="flex justify-between text-xs text-slate-500 font-semibold mb-1">
                  <span>CAE Aprobados en tiempo real</span>
                  <span className="text-emerald-600 font-bold">100%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Ventas Recientes */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Últimos Tickets Emitidos</h3>
            <p className="text-xs text-slate-400 mb-4">Registro cronológico de órdenes procesadas en el evento</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-3">Ticket</th>
                    <th className="pb-3 px-3">Hora</th>
                    <th className="pb-3 px-3">Caja / Terminal</th>
                    <th className="pb-3 px-3">Cajero</th>
                    <th className="pb-3 px-3">Items</th>
                    <th className="pb-3 px-3">Estado</th>
                    <th className="pb-3 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTickets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No se han registrado ventas en el evento aún
                      </td>
                    </tr>
                  ) : (
                    recentTickets.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">{t.id}</td>
                        <td className="py-3 px-3 text-slate-500">
                          {t.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {t.boxId || 'CAJA-01'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">{t.cashierName}</td>
                        <td className="py-3 px-3 text-slate-500">
                          {t.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                        </td>
                        <td className="py-3 px-3">
                          {t.status === 'delivered' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                              Entregado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          ${t.total.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* MODAL PARA MODIFICAR CAJA DE VENTAS DESDE EL ADMIN */}
      <AnimatePresence>
        {editingBox && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Modificar Caja de Ventas</h3>
                    <p className="text-xs text-slate-400">Edite el identificador o sector desde el Admin Panel</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingBox(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditBox} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Identificador / Código de Caja *
                  </label>
                  <input
                    type="text"
                    value={editBoxName}
                    onChange={(e) => setEditBoxName(e.target.value)}
                    placeholder="Ej: CAJA-01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 uppercase font-mono focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    Se actualizará en los logins, reportes y comprobantes emitidos.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Ubicación / Sector (Opcional)
                  </label>
                  <input
                    type="text"
                    value={editBoxDesc}
                    onChange={(e) => setEditBoxDesc(e.target.value)}
                    placeholder="Ej: Entrada Principal / Barra VIP"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                {editBoxError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{editBoxError}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingBox(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-98"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL PARA CREAR NUEVA CAJA DIRECTAMENTE DESDE EL ADMIN */}
      <AnimatePresence>
        {isCreatingBox && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Nueva Caja de Ventas</h3>
                    <p className="text-xs text-slate-400">Registre un nuevo punto de cobro para el evento</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreatingBox(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCreateBox} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Identificador / Código de Caja *
                  </label>
                  <input
                    type="text"
                    value={newBoxName}
                    onChange={(e) => setNewBoxName(e.target.value)}
                    placeholder="Ej: CAJA-05"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 uppercase font-mono focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Ubicación / Sector (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newBoxDesc}
                    onChange={(e) => setNewBoxDesc(e.target.value)}
                    placeholder="Ej: Sector Exterior / Barra 3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                {newBoxError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{newBoxError}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingBox(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-98"
                  >
                    Crear Caja
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CONFIRMAR ELIMINACIÓN DE CAJA */}
      <AnimatePresence>
        {deletingBox && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                ¿Eliminar {deletingBox.name}?
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Esta caja se eliminará de las terminales disponibles. Los tickets ya emitidos conservarán su historial.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingBox(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteBox}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm shadow-red-600/20"
                >
                  Sí, Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal para Cambiar Contraseña de Administrador */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Modal para Ejecutar Cierre General del Día */}
      <CierreGeneralModal
        isOpen={isCierreModalOpen}
        onClose={() => setIsCierreModalOpen(false)}
        onConfirm={(notes) => {
          if (onPerformGeneralClosure) {
            return onPerformGeneralClosure(notes);
          }
          // Fallback en caso de no proveer la función
          const fallbackClosure: GeneralClosure = {
            id: `CG-${Date.now().toString().slice(-6)}`,
            closedAt: new Date(),
            dateString: new Date().toISOString().split('T')[0],
            totalSales: todayStats.todaySales,
            ticketsCount: todayStats.totalTicketsToday,
            deliveredTicketsCount: todayStats.deliveredTickets,
            pendingTicketsCount: todayStats.pendingItems,
            adminName: 'Administrador',
            breakdownByBox: {},
            breakdownByStation: {},
            notes
          };
          return fallbackClosure;
        }}
        todaySales={todayStats.todaySales}
        todayTickets={todayTickets}
        salesBoxes={salesBoxes}
        dispatchStations={dispatchStations}
        adminName="Administrador General"
        onClosureSuccess={(closure) => {
          setIsCierreModalOpen(false);
          setSelectedClosureForActa(closure);
        }}
      />

      {/* Modal para Ver / Imprimir Acta Oficial de Cierre General */}
      <ActaCierreGeneralModal
        closure={selectedClosureForActa}
        onClose={() => setSelectedClosureForActa(null)}
      />
    </div>
  );
}
