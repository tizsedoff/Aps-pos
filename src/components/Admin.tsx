import React, { useMemo } from 'react';
import { Ticket } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Ticket as TicketIcon, Clock, CheckCircle2, Server } from 'lucide-react';
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
      'CAJA-01': 0, 'CAJA-02': 0, 'CAJA-03': 0, 'CAJA-04': 0, 'CAJA-05': 0
    };
    
    tickets.forEach(t => {
      if (t.boxId) {
        boxMap[t.boxId] = (boxMap[t.boxId] || 0) + t.total;
      }
    });

    return Object.entries(boxMap).map(([name, sales]) => ({
      name,
      Ventas: sales
    }));
  }, [tickets]);

  const recentTickets = [...tickets].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8);

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-8">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-zinc-400 font-medium">Ventas Totales</p>
            <div className="p-2 bg-lime-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-lime-500" /></div>
          </div>
          <p className="text-4xl font-black text-white">${stats.totalSales.toLocaleString()}</p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-zinc-400 font-medium">Ticket Promedio</p>
            <div className="p-2 bg-blue-500/10 rounded-lg"><TicketIcon className="w-5 h-5 text-blue-500" /></div>
          </div>
          <p className="text-4xl font-black text-white">${stats.avgTicket.toLocaleString()}</p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-zinc-400 font-medium">Tickets Emitidos</p>
            <div className="p-2 bg-purple-500/10 rounded-lg"><TicketIcon className="w-5 h-5 text-purple-500" /></div>
          </div>
          <p className="text-4xl font-black text-white">{stats.totalTickets}</p>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-zinc-400 font-medium">Items Pendientes</p>
            <div className="p-2 bg-orange-500/10 rounded-lg"><Clock className="w-5 h-5 text-orange-500" /></div>
          </div>
          <p className="text-4xl font-black text-white">{stats.pendingItems}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        {/* Chart */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-xl font-bold mb-6 text-white">Ventas por Caja</h3>
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByBox} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#27272a', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#84cc16', fontWeight: 'bold' }}
                />
                <Bar dataKey="Ventas" fill="#84cc16" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar & ARCA Status */}
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
              <Server className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-zinc-100 font-bold">Estado ARCA (AFIP)</h3>
              <p className="text-sm text-green-400 font-medium flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-4 h-4" /> Operativo • 0 en cola
              </p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xl font-bold mb-4 text-white">Últimas Ventas (Vivo)</h3>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
              <AnimatePresence>
                {recentTickets.map(ticket => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-zinc-200">{ticket.id}</p>
                      <p className="text-xs text-zinc-500">{ticket.createdAt.toLocaleTimeString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lime-400">${ticket.total.toLocaleString()}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${ticket.status === 'delivered' ? 'bg-zinc-800 text-zinc-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {ticket.status === 'delivered' ? 'Entregado' : 'Pendiente'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
