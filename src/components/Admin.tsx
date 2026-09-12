import React, { useMemo } from 'react';
import { Ticket } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Ticket as TicketIcon, Clock, CheckCircle2, Server, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminProps {
  tickets: Ticket[];
}

export function Admin({ tickets }: AdminProps) {
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
    const boxMap: Record<string, number> = {
      'CAJA-01': 0, 'CAJA-02': 0, 'CAJA-03': 0, 'CAJA-ADMIN': 0
    };
    
    tickets.forEach(t => {
      const bId = t.boxId || 'CAJA-01';
      boxMap[bId] = (boxMap[bId] || 0) + t.total;
    });

    return Object.entries(boxMap).map(([name, sales]) => ({
      name,
      Ventas: sales
    }));
  }, [tickets]);

  const recentTickets = [...tickets].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10);

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-6">
      
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
          <p className="text-3xl font-black text-amber-700">{stats.pendingItems}</p>
          <span className="text-xs text-amber-600 font-medium mt-2">Artículos por despachar en barra</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[420px]">
        {/* Gráfico de Ventas por Caja */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Rendimiento por Caja / Terminal</h3>
              <p className="text-xs text-slate-400">Total facturado por cada puesto de venta en el evento</p>
            </div>
          </div>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByBox} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9', opacity: 0.8 }}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Total Facturado']}
                />
                <Bar dataKey="Ventas" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={55} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Panel Lateral: ARCA y Últimas Ventas */}
        <div className="flex flex-col gap-6">
          {/* Card Estado ARCA */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-200/60">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Servidor ARCA (AFIP)</h4>
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> En Línea • 0 en cola de espera
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Facturación asíncrona sin latencia</p>
            </div>
          </div>

          {/* Lista de Transacciones en Vivo */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex-1 flex flex-col overflow-hidden">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
              <span>Últimos Tickets Emitidos</span>
              <span className="text-[11px] font-normal text-slate-400 font-mono">En vivo</span>
            </h4>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {recentTickets.length === 0 ? (
                <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-4 text-slate-400">
                  <TicketIcon className="w-8 h-8 mb-2 opacity-30 text-slate-400" />
                  <p className="font-bold text-xs text-slate-600">No hay tickets emitidos todavía</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Las ventas aparecerán aquí en tiempo real a medida que cobren las cajas.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {recentTickets.map(ticket => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-800">{ticket.id}</span>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {ticket.cashierName} • {ticket.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-800 text-sm">${ticket.total.toLocaleString()}</p>
                        <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          ticket.status === 'delivered' 
                            ? 'bg-slate-200 text-slate-600' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ticket.status === 'delivered' ? 'Despachado' : 'Pendiente'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
