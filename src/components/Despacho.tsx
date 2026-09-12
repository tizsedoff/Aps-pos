import React, { useState, useRef, useEffect } from 'react';
import { Ticket } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ScanLine, CheckCircle, AlertTriangle, XCircle, Search } from 'lucide-react';

interface DespachoProps {
  tickets: Ticket[];
  onDeliver: (ticketId: string) => void;
}

export function Despacho({ tickets, onDeliver }: DespachoProps) {
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'already_delivered' | 'not_found'>('idle');
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on input for barcode scanner
  useEffect(() => {
    const focusInput = () => {
      if (status === 'idle' && inputRef.current) {
        inputRef.current.focus();
      }
    };
    focusInput();
    window.addEventListener('click', focusInput);
    return () => window.removeEventListener('click', focusInput);
  }, [status]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputValue.trim().toUpperCase();
    if (!code) return;

    const ticket = tickets.find(t => t.id === code);

    if (!ticket) {
      setStatus('not_found');
    } else if (ticket.status === 'delivered') {
      setActiveTicket(ticket);
      setStatus('already_delivered');
    } else {
      setActiveTicket(ticket);
      setStatus('success');
      onDeliver(ticket.id);
    }

    setInputValue('');

    // Auto reset after 3 seconds
    setTimeout(() => {
      setStatus('idle');
      setActiveTicket(null);
    }, 3500);
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800"
          >
            <div className="bg-zinc-950 p-8 rounded-full mb-8 relative">
              <div className="absolute inset-0 bg-lime-500/20 animate-ping rounded-full"></div>
              <ScanLine className="w-20 h-20 text-lime-500 relative z-10" />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white">Esperando Escaneo...</h2>
            <p className="text-zinc-400 text-lg mb-12">Use el lector de código de barras o ingrese el código manualmente</p>
            
            <form onSubmit={handleScan} className="w-full max-w-lg relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="h-8 w-8 text-zinc-500 group-focus-within:text-lime-500 transition-colors" />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ej: TKT-1234"
                className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-lime-500 rounded-2xl py-6 pl-16 pr-6 text-3xl font-mono text-center text-white placeholder:text-zinc-700 outline-none transition-all uppercase"
                autoComplete="off"
                autoFocus
              />
            </form>
          </motion.div>
        )}

        {status === 'success' && activeTicket && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center bg-lime-500 rounded-2xl shadow-[0_0_100px_rgba(132,204,22,0.4)]"
          >
            <CheckCircle className="w-32 h-32 text-zinc-950 mb-8" />
            <h2 className="text-6xl font-black text-zinc-950 mb-12">ENTREGAR PEDIDO</h2>
            
            <div className="bg-zinc-950/10 p-12 rounded-3xl backdrop-blur-sm w-full max-w-4xl">
              <div className="space-y-6">
                {activeTicket.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-5xl font-bold text-zinc-950">
                    <span>{item.quantity}x <span className="opacity-80">{item.product.name}</span></span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-zinc-900/60 font-bold mt-12 text-2xl tracking-widest">{activeTicket.id}</p>
          </motion.div>
        )}

        {status === 'already_delivered' && activeTicket && (
          <motion.div 
            key="already_delivered"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center bg-red-600 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,0.4)]"
          >
            <AlertTriangle className="w-32 h-32 text-white mb-8" />
            <h2 className="text-6xl font-black text-white mb-4 uppercase text-center">¡Atención!<br/>Ticket ya entregado</h2>
            
            <div className="bg-black/20 p-8 rounded-3xl mt-8 flex flex-col items-center">
              <p className="text-3xl text-red-100 font-medium">Este pedido fue despachado a las:</p>
              <p className="text-5xl font-black text-white mt-4">
                {activeTicket.deliveredAt?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
              </p>
            </div>
            <p className="text-red-200/60 font-bold mt-12 text-2xl tracking-widest">{activeTicket.id}</p>
          </motion.div>
        )}

        {status === 'not_found' && (
          <motion.div 
            key="not_found"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center bg-zinc-800 rounded-2xl"
          >
            <XCircle className="w-32 h-32 text-zinc-500 mb-8" />
            <h2 className="text-5xl font-black text-white mb-4">Ticket No Encontrado</h2>
            <p className="text-2xl text-zinc-400">Verifique el código e intente nuevamente.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
