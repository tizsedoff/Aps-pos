import React, { useMemo, useState } from 'react';
import { Ticket, SalesBox } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Ticket as TicketIcon, Clock, CheckCircle2, Server, TrendingUp, Users, KeyRound, ShieldCheck, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChangePasswordModal } from './ChangePasswordModal';

interface AdminProps {
  tickets: Ticket[];
  salesBoxes?: SalesBox[];
  onNavigateToTerminales?: () => void;
}

export function Admin({ tickets, salesBoxes, onNavigateToTerminales }: AdminProps) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const stats = useMemo(() => {
    const totalSales = tickets.reduce((sum, t) => sum + t.total, 0);
    const avgTicket = tickets.length ? Math.round(totalSales / tickets.length) : 0;
    const pendingItems = tickets
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.items.reduce((s, item) => s + item.quantity, 0), 0);
      
    return {
      totalSales,
      avgTicket,
      totalTickets: tickets.length,
      pendingItems
    };
  }, [tickets]);

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

    tickets.forEach(t => {
      const bId = t.boxId || 'CAJA-01';
      boxMap[bId] = (boxMap[bId] || 0) + t.total;
    });

    return Object.entries(boxMap).map(([name, sales]) => ({
      name,
      Ventas: sales
    }));
  }, [tickets, salesBoxes]);

  const recentTickets = [...tickets].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-6">
      
      {/* Barra de Título y Acciones de Gestión */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 sm:px-6 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Panel de Control y Métricas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo en tiempo real de cajas de venta, despacho y seguridad
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToTerminales && (
            <button
              onClick={onNavigateToTerminales}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/70 rounded-xl font-bold text-xs transition-colors shadow-xs active:scale-98"
            >
              <Store className="w-4 h-4 text-blue-600" />
              <span>Gestionar Cajas y Puestos</span>
            </button>
          )}

          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 rounded-xl font-bold text-xs transition-colors shadow-xs active:scale-98"
          >
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>Contraseña Admin</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recaudación Total</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">${stats.totalSales.toLocaleString()}</p>
          <span className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> En vivo (todas las cajas)
          </span>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <TicketIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">${stats.avgTicket.toLocaleString()}</p>
          <span className="text-xs text-slate-400 mt-2">Por transacción realizada</span>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tickets Emitidos</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.totalTickets}</p>
          <span className="text-xs text-slate-400 mt-2">Comprobantes impresos</span>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pendientes de Entrega</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.pendingItems}</p>
          <span className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1">
            Artículos en cola de barra
          </span>
        </div>
      </div>

      {/* Gráfico y Ventas por Caja */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Rendimiento por Caja de Venta</h3>
              <p className="text-xs text-slate-400">Total facturado en pesos por cada terminal configurada</p>
            </div>
          </div>
          <div className="h-64 w-full">
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

      {/* Modal para Cambiar Contraseña de Administrador */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
