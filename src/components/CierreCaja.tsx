import React, { useMemo } from 'react';
import { Ticket, User } from '../types';
import { Printer, Calculator, CalendarClock, Store, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { ApsLogo } from './ApsLogo';

interface CierreCajaProps {
  tickets: Ticket[];
  currentUser: User;
  onBack: () => void;
  onLogout: () => void;
}

export function CierreCaja({ tickets, currentUser, onBack, onLogout }: CierreCajaProps) {
  const { totalSales, totalTickets, itemSummary, boxId } = useMemo(() => {
    // Filtrar tickets por el usuario actual (o todos si es admin y quiere un global, 
    // pero asumiremos que el cierre es por caja/usuario activo)
    const userTickets = tickets.filter(t => t.cashierName === currentUser.name);
    
    const totalSales = userTickets.reduce((sum, t) => sum + t.total, 0);
    const totalTickets = userTickets.length;
    const boxId = userTickets.length > 0 ? userTickets[0].boxId : (currentUser.role === 'admin' ? 'CAJA-ADMIN' : 'CAJA-01');

    // Resumen de artículos vendidos
    const itemsMap: Record<string, { name: string, quantity: number, total: number }> = {};
    
    userTickets.forEach(ticket => {
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

    return { totalSales, totalTickets, itemSummary, boxId };
  }, [tickets, currentUser]);

  const handlePrint = () => {
    window.print();
  };

  const today = new Date();

  return (
    <div className="h-full flex flex-col items-center bg-slate-100 overflow-y-auto pb-10">
      
      {/* Controles NO imprimibles */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 font-bold transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-colors"
        >
          <Printer className="w-5 h-5" />
          Imprimir Resumen
        </button>
      </div>

      {/* Ticket de Cierre (Imprimible) */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none print:w-full print:max-w-none print:p-0"
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
            <p className="font-black text-slate-800 text-lg">{currentUser.name}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:border-slate-300">
            <p className="text-slate-500 font-bold uppercase text-xs mb-1">Terminal</p>
            <p className="font-black text-slate-800 text-lg">{boxId}</p>
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
          <div className="flex justify-between items-end">
            <span className="text-5xl font-black tracking-tighter">${totalSales.toLocaleString()}</span>
            <span className="text-lg font-bold bg-white/10 px-3 py-1 rounded-lg print:bg-black/5">
              {totalTickets} Tickets
            </span>
          </div>
        </div>

        {/* Detalle de Artículos */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-slate-500" />
            Resumen de Artículos Vendidos
          </h3>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 font-bold">Artículo</th>
                <th className="py-3 text-center font-bold">Cant.</th>
                <th className="py-3 text-right font-bold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {itemSummary.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400 italic font-medium">
                    No se registraron ventas en esta sesión.
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
          className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          Confirmar y Cerrar Turno
        </button>
      </div>
    </div>
  );
}
