import React, { useMemo, useState } from 'react';
import { Ticket, User, SalesBox } from '../types';
import { Printer, CalendarClock, ArrowLeft, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { ApsLogo } from './ApsLogo';

interface CierreCajaProps {
  tickets: Ticket[];
  currentUser: User;
  onBack: () => void;
  onLogout: () => void;
  salesBoxes?: SalesBox[];
}

export function CierreCaja({ tickets, currentUser, onBack, onLogout, salesBoxes }: CierreCajaProps) {
  const [adminSelectedBox, setAdminSelectedBox] = useState<string>('TODAS');

  const availableBoxes = useMemo(() => {
    const set = new Set<string>();
    if (salesBoxes) {
      salesBoxes.forEach(b => set.add(b.name));
    }
    tickets.forEach(t => {
      if (t.boxId) set.add(t.boxId);
    });
    return Array.from(set);
  }, [tickets, salesBoxes]);

  const { totalSales, totalTickets, itemSummary, displayBoxId, displayCashier } = useMemo(() => {
    let filteredTickets: Ticket[] = [];
    let boxLabel = currentUser.boxId || (currentUser.role === 'admin' ? 'CAJA-ADMIN' : 'CAJA-01');
    let cashierLabel = currentUser.name;

    if (currentUser.role === 'admin') {
      if (adminSelectedBox === 'TODAS') {
        filteredTickets = tickets;
        boxLabel = 'TODAS LAS CAJAS (CONSOLIDADO)';
        cashierLabel = 'Todos los Operadores';
      } else {
        filteredTickets = tickets.filter(t => t.boxId === adminSelectedBox);
        boxLabel = adminSelectedBox;
        cashierLabel = filteredTickets.length > 0 ? filteredTickets[0].cashierName : 'Operador';
      }
    } else {
      // Si es cajero, filtrar por su nombre o su terminal asignada
      const userBox = currentUser.boxId || 'CAJA-01';
      filteredTickets = tickets.filter(t => 
        t.cashierName === currentUser.name || (t.boxId && t.boxId === userBox)
      );
      boxLabel = userBox;
      cashierLabel = currentUser.name;
    }
    
    const totalSales = filteredTickets.reduce((sum, t) => sum + t.total, 0);
    const totalTickets = filteredTickets.length;

    // Resumen de artículos vendidos
    const itemsMap: Record<string, { name: string, quantity: number, total: number }> = {};
    
    filteredTickets.forEach(ticket => {
      ticket.items.forEach(item => {
        if (!itemsMap[item.product.id]) {
          itemsMap[item.product.id] = {
            name: item.product.name,
            quantity: 0,
            total: 0
          };
        }
        const itemUnitPrice = item.product.price + (item.side?.price || 0);
        itemsMap[item.product.id].quantity += item.quantity;
        itemsMap[item.product.id].total += (itemUnitPrice * item.quantity);
      });
    });

    const itemSummary = Object.values(itemsMap).sort((a, b) => b.quantity - a.quantity);

    return { totalSales, totalTickets, itemSummary, displayBoxId: boxLabel, displayCashier: cashierLabel };
  }, [tickets, currentUser, adminSelectedBox]);

  const handlePrint = () => {
    try {
      window.print();
      setTimeout(() => {
        if (window.self !== window.top) {
          alert("Si el diálogo de impresión no aparece, por favor abre la aplicación en una nueva pestaña usando el botón en la esquina superior derecha.");
        }
      }, 500);
    } catch (e) {
      alert("Por favor abre la aplicación en una nueva pestaña para imprimir.");
    }
  };

  const today = new Date();

  return (
    <div className="h-full flex flex-col items-center bg-slate-100 overflow-y-auto pb-10 print:overflow-visible print:h-auto print:bg-white">
      
      {/* Controles NO imprimibles */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 font-bold transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          {currentUser.role === 'cajero' ? 'Volver a Ventas' : 'Volver al Panel'}
        </button>

        {currentUser.role === 'admin' && availableBoxes.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs text-xs font-bold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Filtrar:</span>
            <select
              value={adminSelectedBox}
              onChange={(e) => setAdminSelectedBox(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="TODAS">Consolidado (Todas)</option>
              {availableBoxes.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors"
        >
          <Printer className="w-5 h-5" />
          Imprimir Resumen
        </button>
      </div>

      {/* Ticket de Cierre (Imprimible) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0 print:w-full"
      >
        <div className="text-center border-b-2 border-dashed border-slate-300 pb-6 mb-6">
          <div className="flex justify-center mb-4">
            <ApsLogo className="w-16 h-16 drop-shadow-xs" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Cierre de Caja Z</h2>
          <p className="text-slate-500 font-semibold mt-1">APS POS - Eventos</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:border-slate-300">
            <p className="text-slate-500 font-bold uppercase text-xs mb-1">Operador / Cajero</p>
            <p className="font-black text-slate-800 text-lg">{displayCashier}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:border-slate-300">
            <p className="text-slate-500 font-bold uppercase text-xs mb-1">Terminal</p>
            <p className="font-black text-slate-800 text-lg">{displayBoxId}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:border-slate-300 col-span-2 flex items-center justify-between">
            <div>
              <p className="text-slate-500 font-bold uppercase text-xs mb-1">Fecha y Hora de Emisión</p>
              <p className="font-black text-slate-800 text-lg flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-blue-600 print:text-slate-800" />
                {today.toLocaleDateString()} - {today.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>

        {/* Métricas Generales */}
        <div className="border-2 border-slate-900 rounded-xl p-6 mb-8 bg-slate-900 text-white print:bg-white print:text-black print:border-2 print:border-black">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 print:text-slate-600">Total Facturado</h3>
          <p className="text-5xl font-black mb-6 tracking-tight text-emerald-400 print:text-black">
            ${totalSales.toLocaleString()}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800 print:border-t-2 print:border-black">
            <div>
              <span className="text-xs font-bold text-slate-400 print:text-slate-600 uppercase">Tickets Emitidos</span>
              <p className="text-2xl font-black">{totalTickets}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 print:text-slate-600 uppercase">Ticket Promedio</span>
              <p className="text-2xl font-black">
                ${totalTickets > 0 ? Math.round(totalSales / totalTickets).toLocaleString() : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Detalle por Artículo */}
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-2">
            Desglose de Artículos Vendidos
          </h3>
          
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-200 text-left text-xs uppercase">
                <th className="py-2">Artículo</th>
                <th className="py-2 text-center">Cant.</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemSummary.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400 font-medium">
                    No se registraron ventas en esta terminal todavía
                  </td>
                </tr>
              ) : (
                itemSummary.map((item, idx) => (
                  <tr key={idx} className="print:border-b print:border-slate-200">
                    <td className="py-3 font-bold text-slate-800">{item.name}</td>
                    <td className="py-3 text-center font-black text-slate-900 bg-slate-50 print:bg-transparent rounded-lg">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-700">
                      ${item.total.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t-2 border-dashed border-slate-300 pt-6 text-center">
          <p className="text-slate-500 text-sm font-bold">FIN DE REPORTE</p>
          <p className="text-slate-400 text-xs mt-1">Firma del Responsable: _______________________</p>
        </div>
      </motion.div>

      {/* Acción final no imprimible */}
      <div className="w-full max-w-2xl mt-6 print:hidden">
        <button
          onClick={onLogout}
          className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
        >
          {currentUser.role === 'cajero' ? 'Confirmar y Cerrar Turno de Caja' : 'Cerrar Sesión'}
        </button>
      </div>
    </div>
  );
}
