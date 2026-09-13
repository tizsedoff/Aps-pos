import React from 'react';
import { GeneralClosure } from '../types';
import { Printer, X, CheckCircle, Store, UtensilsCrossed, Calendar, Clock, ShieldCheck, DollarSign, FileSpreadsheet } from 'lucide-react';
import { ApsLogo } from './ApsLogo';

interface ActaCierreGeneralModalProps {
  closure: GeneralClosure | null;
  onClose: () => void;
}

export function ActaCierreGeneralModal({ closure, onClose }: ActaCierreGeneralModalProps) {
  if (!closure) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(closure.closedAt).toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date(closure.closedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:static print:inset-auto print:bg-white print:p-0">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 print:shadow-none print:border-none print:my-0 print:max-w-full">
        
        {/* Barra superior de control (NO imprimible) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Acta de Cierre General</span>
            <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {closure.id}
            </span>
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

        {/* CONTENIDO DEL ACTA (Optimizado para pantalla y para impresión en ticket/A4) */}
        <div className="p-8 space-y-6 text-slate-900 bg-white" id="acta-cierre-printable">
          
          {/* Encabezado Formal */}
          <div className="text-center pb-5 border-b-2 border-slate-900 space-y-1">
            <div className="flex justify-center mb-2">
              <ApsLogo />
            </div>
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
              Acta de Cierre General de Jornada
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Consolidación Central de Ventas y Despacho
            </p>
            <div className="inline-block mt-1 font-mono text-xs font-black bg-slate-100 border border-slate-300 px-3 py-1 rounded-md">
              COMPROBANTE N°: {closure.id}
            </div>
          </div>

          {/* Datos Operativos */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Fecha Operativa</span>
              <span className="font-bold text-slate-800 capitalize">{formattedDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Hora de Cierre</span>
              <span className="font-bold text-slate-800">{formattedTime} hs</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Auditor / Responsable</span>
              <span className="font-bold text-slate-800">{closure.adminName}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Estado en Sistema</span>
              <span className="font-bold text-emerald-700">Consolidado en Acumulado Mensual</span>
            </div>
          </div>

          {/* Gran Total Recaudado en la Jornada */}
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white text-center shadow-xs">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Recaudación Total de la Jornada
            </span>
            <p className="text-4xl font-black tracking-tight text-white">
              ${closure.totalSales.toLocaleString()}
            </p>
            <span className="text-xs text-emerald-400 font-semibold mt-1 inline-block">
              {closure.ticketsCount} Comprobantes Emitidos • {closure.deliveredTicketsCount} Despachados
            </span>
          </div>

          {/* Desglose por Caja */}
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
              <span>Recaudación por Caja de Ventas</span>
              <span className="text-[10px] text-slate-400 font-normal">Subtotal</span>
            </h3>
            <div className="space-y-1.5 text-xs">
              {Object.entries(closure.breakdownByBox || {}).map(([box, total]) => (
                <div key={box} className="flex justify-between items-center py-1 border-b border-slate-100 font-mono">
                  <span className="font-bold text-slate-700 font-sans">{box}</span>
                  <span className="font-black text-slate-900">${total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Desglose por Zona de Despacho */}
          {closure.breakdownByStation && Object.keys(closure.breakdownByStation).length > 0 && (
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>Ventas por Zona de Entrega</span>
                <span className="text-[10px] text-slate-400 font-normal">Subtotal</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                {Object.entries(closure.breakdownByStation).map(([station, total]) => (
                  <div key={station} className="flex justify-between items-center py-1 border-b border-slate-100 font-mono">
                    <span className="font-bold text-slate-700 font-sans">{station}</span>
                    <span className="font-black text-slate-900">${total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones */}
          {closure.notes && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
              <span className="font-bold block text-slate-900 mb-0.5">Observaciones:</span>
              <p className="italic">{closure.notes}</p>
            </div>
          )}

          {/* Firmas de Auditoría */}
          <div className="pt-8 border-t-2 border-dashed border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 h-10 mb-1"></div>
              <span className="font-bold text-slate-800 block">{closure.adminName}</span>
              <span className="text-[10px] text-slate-400 uppercase">Firma Administrador / Auditor</span>
            </div>
            <div>
              <div className="border-b border-slate-400 h-10 mb-1"></div>
              <span className="font-bold text-slate-800 block">Sello & Conforme</span>
              <span className="text-[10px] text-slate-400 uppercase">Control de Ingresos</span>
            </div>
          </div>

        </div>

        {/* Botón de cierre inferior (NO imprimible) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            Cerrar Vista
          </button>
        </div>

      </div>
    </div>
  );
}
