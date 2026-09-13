import React from 'react';
import { GeneralClosure } from '../types';
import { Printer, X, CheckCircle, FileSpreadsheet, CalendarRange } from 'lucide-react';
import { ApsLogo } from './ApsLogo';

interface ActaCierreMensualModalProps {
  closures: GeneralClosure[];
  totalSales: number;
  onClose: () => void;
}

export function ActaCierreMensualModal({ closures, totalSales, onClose }: ActaCierreMensualModalProps) {
  if (closures.length === 0) return null;

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
  const currentMonth = today.toLocaleString('es-AR', { month: 'long', year: 'numeric' });

  const totalTickets = closures.reduce((acc, c) => acc + c.ticketsCount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:static print:inset-auto print:bg-white print:p-0">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 print:shadow-none print:border-none print:my-0 print:max-w-full">
        
        {/* Barra superior (NO imprimible) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Resumen Mensual</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENIDO DEL ACTA */}
        <div className="p-8 space-y-6 text-slate-900 bg-white" id="acta-mensual-printable">
          <div className="text-center pb-5 border-b-2 border-slate-900 space-y-1">
            <div className="flex justify-center mb-2">
              <ApsLogo />
            </div>
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
              Reporte de Cierre Mensual
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Consolidado de Operaciones y Ventas
            </p>
            <div className="inline-block mt-1 font-mono text-xs font-black bg-slate-100 border border-slate-300 px-3 py-1 rounded-md capitalize">
              Período: {currentMonth}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Fecha Emisión</span>
              <span className="font-bold text-slate-800">{today.toLocaleDateString('es-AR')}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Total de Cierres Diarios</span>
              <span className="font-bold text-slate-800">{closures.length} días operativos</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Tickets Totales Emitidos</span>
              <span className="font-bold text-slate-800">{totalTickets} tickets</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Estado de Consolidación</span>
              <span className="font-bold text-emerald-700">Auditado - Cerrado</span>
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white text-center shadow-xs">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Ingreso Total del Período
            </span>
            <span className="block text-4xl font-black tracking-tight text-emerald-400">
              ${totalSales.toLocaleString()}
            </span>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-200 pb-2 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Detalle de Cierres Diarios
            </h3>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500">
                  <th className="py-2">Comprobante / Fecha</th>
                  <th className="py-2 text-center">Tickets</th>
                  <th className="py-2 text-right">Recaudación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {closures.map(c => (
                  <tr key={c.id} className="print:border-b print:border-slate-200">
                    <td className="py-2.5">
                      <span className="font-mono font-bold block">{c.id}</span>
                      <span className="text-slate-500">
                        {new Date(c.closedAt).toLocaleDateString('es-AR')}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-700">
                      {c.ticketsCount}
                    </td>
                    <td className="py-2.5 text-right font-black text-slate-900 font-mono">
                      ${c.totalSales.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-8 border-t-2 border-dashed border-slate-300 text-center text-xs mt-6">
            <p className="font-bold text-slate-400 uppercase mb-4">Declaración Jurada de Recaudación</p>
            <div className="flex justify-around items-end pt-8 px-4">
              <div className="w-40 border-t border-slate-400 pt-1 text-[10px] text-slate-500 uppercase">
                Auditor Responsable
              </div>
              <div className="w-40 border-t border-slate-400 pt-1 text-[10px] text-slate-500 uppercase">
                Gerencia / Finanzas
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
