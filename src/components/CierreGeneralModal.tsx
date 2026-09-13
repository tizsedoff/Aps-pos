import React, { useState, useMemo } from 'react';
import { Ticket, SalesBox, DispatchStation, GeneralClosure } from '../types';
import { 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Receipt, 
  Store, 
  UtensilsCrossed, 
  X,
  FileText,
  Calendar,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CierreGeneralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => GeneralClosure;
  todaySales: number;
  todayTickets: Ticket[];
  salesBoxes: SalesBox[];
  dispatchStations: DispatchStation[];
  adminName: string;
  onClosureSuccess: (closure: GeneralClosure) => void;
}

export function CierreGeneralModal({
  isOpen,
  onClose,
  onConfirm,
  todaySales,
  todayTickets,
  salesBoxes,
  dispatchStations,
  adminName,
  onClosureSuccess
}: CierreGeneralModalProps) {
  const [notes, setNotes] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  // Desglose por caja
  const breakdownByBox = useMemo(() => {
    const map: Record<string, { name: string; total: number; count: number }> = {};
    salesBoxes.forEach(b => {
      map[b.name] = { name: b.name, total: 0, count: 0 };
    });
    todayTickets.forEach(t => {
      const bId = t.boxId || 'CAJA-01';
      if (!map[bId]) {
        map[bId] = { name: bId, total: 0, count: 0 };
      }
      map[bId].total += t.total;
      map[bId].count += 1;
    });
    return Object.values(map);
  }, [salesBoxes, todayTickets]);

  // Desglose por puesto de entrega
  const breakdownByStation = useMemo(() => {
    const map: Record<string, { name: string; total: number; count: number }> = {};
    dispatchStations.forEach(s => {
      map[s.name] = { name: s.name, total: 0, count: 0 };
    });
    todayTickets.forEach(t => {
      const sName = t.targetStation || 'General';
      if (!map[sName]) {
        map[sName] = { name: sName, total: 0, count: 0 };
      }
      map[sName].total += t.total;
      map[sName].count += 1;
    });
    return Object.values(map);
  }, [dispatchStations, todayTickets]);

  const pendingTickets = todayTickets.filter(t => t.status === 'pending').length;
  const deliveredTickets = todayTickets.filter(t => t.status === 'delivered').length;

  const handleExecuteClosure = () => {
    setIsConfirming(true);
    const closure = onConfirm(notes.trim() || undefined);
    setIsConfirming(false);
    onClosureSuccess(closure);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Cabecera del Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Cierre General del Día
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500 text-slate-900 font-extrabold uppercase rounded-full">
                  Administración
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Consolidación de todas las cajas y traspaso del ingreso diario al acumulado mensual
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Alerta explicativa del funcionamiento del Cierre */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 text-emerald-950 flex gap-3.5 items-start">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-900 text-sm">
                ¿Qué sucederá al confirmar este Cierre General?
              </p>
              <p className="text-emerald-800 leading-relaxed">
                El monto total del día (<strong className="text-emerald-950 font-black">${todaySales.toLocaleString()}</strong>) se sumará de forma permanente al <strong>Ingreso del Mes</strong>, y el marcador de <strong>Ingreso Hoy se reiniciará a $0</strong> para iniciar un nuevo día operativo.
              </p>
            </div>
          </div>

          {/* Tarjeta Principal de Resumen a Cerrar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Recaudación Hoy
              </span>
              <p className="text-2xl font-black text-slate-900">
                ${todaySales.toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                A sumar al mes
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Tickets Emitidos
              </span>
              <p className="text-2xl font-black text-slate-900">
                {todayTickets.length}
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">
                En esta jornada
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Estado Despacho
              </span>
              <p className="text-2xl font-black text-slate-900">
                {deliveredTickets} / {todayTickets.length}
              </p>
              <span className={`text-[11px] font-bold mt-1 inline-block ${pendingTickets > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {pendingTickets > 0 ? `${pendingTickets} pendientes` : '100% entregado'}
              </span>
            </div>
          </div>

          {/* Aviso si quedan pedidos sin retirar */}
          {pendingTickets > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                Atención: Aún hay <strong>{pendingTickets} pedidos</strong> sin retirar en las zonas de entrega. El cierre consolidará la recaudación, pero los pedidos seguirán visibles en las pantallas de despacho hasta su retiro.
              </span>
            </div>
          )}

          {/* Desglose por Caja */}
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-600" />
              Recaudación por Caja de Ventas
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {breakdownByBox.map(box => (
                <div 
                  key={box.name}
                  className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs shadow-2xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">{box.name}</span>
                    <span className="text-slate-400 block text-[10px]">{box.count} tickets emitidos</span>
                  </div>
                  <span className="font-mono font-black text-slate-900 text-sm">
                    ${box.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Desglose por Zona de Entrega */}
          <div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
              Ventas por Zona de Entrega (Puestos)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {breakdownByStation.map(station => (
                <div 
                  key={station.name}
                  className="bg-white border border-slate-200 rounded-xl p-3 text-xs shadow-2xs"
                >
                  <span className="font-bold text-slate-800 block truncate">{station.name}</span>
                  <span className="text-slate-400 block text-[10px] mb-1">{station.count} órdenes</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    ${station.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Observaciones o Notas del Cierre */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Observaciones / Notas del Cierre (Opcional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: Turno completo sin discrepancias, evento fin de semana..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Fila Informativa de Auditoría */}
          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-3">
            <span>Responsable: <strong className="text-slate-600">{adminName}</strong></span>
            <span>Fecha: {new Date().toLocaleDateString('es-AR')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

        </div>

        {/* Botones de Acción */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleExecuteClosure}
            disabled={isConfirming}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors active:scale-98"
          >
            <Lock className="w-4 h-4" />
            <span>Confirmar Cierre General y Reiniciar Día</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
}
