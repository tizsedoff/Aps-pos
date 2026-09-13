import React, { useState, useRef, useEffect } from 'react';
import { Ticket, DispatchStation, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ScanLine, CheckCircle2, AlertTriangle, XCircle, Search, Clock, ArrowRight, Sparkles, MapPin, Store, AlertOctagon } from 'lucide-react';

interface DespachoProps {
  tickets: Ticket[];
  dispatchStations?: DispatchStation[];
  currentUser?: User;
  onDeliver: (ticketId: string) => void;
}

export function Despacho({ tickets, dispatchStations, currentUser, onDeliver }: DespachoProps) {
  const stations: DispatchStation[] = dispatchStations && dispatchStations.length > 0
    ? dispatchStations
    : [
        { id: 'disp-1', name: 'Barra Principal', description: 'Bebidas y tragos' },
        { id: 'disp-2', name: 'Cocina y Minutas', description: 'Platos calientes' },
        { id: 'disp-3', name: 'Parrilla y Buffet', description: 'Entregas rápidas' }
      ];

  // Determinar estación inicial según usuario o primera estación
  const initialStation = currentUser?.role === 'despacho' && currentUser.name
    ? currentUser.name
    : stations[0]?.name || 'Cocina y Minutas';

  const [selectedStation, setSelectedStation] = useState<string>(initialStation);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'already_delivered' | 'wrong_station' | 'not_found'>('idle');
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Mantener foco en el input para lectores de códigos de barra USB
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

  const processCode = (rawCode: string, bypassStationCheck: boolean = false) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    const ticket = tickets.find(t => t.id.toUpperCase() === code);

    if (!ticket) {
      setStatus('not_found');
      setTimeout(() => {
        setStatus('idle');
      }, 3500);
    } else if (ticket.status === 'delivered') {
      setActiveTicket(ticket);
      setStatus('already_delivered');
      setTimeout(() => {
        setStatus('idle');
        setActiveTicket(null);
      }, 3500);
    } else {
      // Verificar si el ticket corresponde a la estación seleccionada
      const ticketStation = ticket.targetStation || '';
      const isDifferentStation = selectedStation !== 'all' 
        && ticketStation 
        && ticketStation.toLowerCase() !== selectedStation.toLowerCase();

      if (isDifferentStation && !bypassStationCheck) {
        setActiveTicket(ticket);
        setStatus('wrong_station');
        // No cerramos automáticamente para permitir al operador leer y decidir
        return;
      }

      setActiveTicket(ticket);
      setStatus('success');
      onDeliver(ticket.id);

      // Auto reset al estado de espera tras 3.5 segundos
      setTimeout(() => {
        setStatus('idle');
        setActiveTicket(null);
      }, 3500);
    }

    setInputValue('');
  };

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processCode(inputValue);
  };

  const handleForceDeliver = () => {
    if (activeTicket) {
      setStatus('success');
      onDeliver(activeTicket.id);
      setTimeout(() => {
        setStatus('idle');
        setActiveTicket(null);
      }, 3500);
    }
  };

  // Filtrar pedidos pendientes según estación seleccionada
  const pendingTickets = tickets.filter(t => t.status === 'pending');
  const filteredPendingTickets = selectedStation === 'all'
    ? pendingTickets
    : pendingTickets.filter(t => (t.targetStation || '').toLowerCase() === selectedStation.toLowerCase());

  return (
    <div className="h-full flex flex-col gap-4">
      {/* SELECTOR DE PUESTO / ZONA DE ENTREGA SUPERIOR */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Puesto de Entrega Activo
            </span>
            <span className="text-sm font-black text-slate-800">
              {selectedStation === 'all' ? 'Todos los Puestos (Vista Global)' : selectedStation}
            </span>
          </div>
        </div>

        {/* Tabs de estaciones para cambiar rápidamente */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {stations.map(st => {
            const count = pendingTickets.filter(t => (t.targetStation || '').toLowerCase() === st.name.toLowerCase()).length;
            const isCurrent = selectedStation === st.name;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setSelectedStation(st.name);
                  setStatus('idle');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{st.name}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isCurrent ? 'bg-white text-emerald-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              setSelectedStation('all');
              setStatus('idle');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedStation === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
            }`}
          >
            Ver Todos
          </button>
        </div>
      </div>

      {/* Contenedor Principal de Escaneo y Feedback */}
      <div className="flex-1 rounded-2xl overflow-hidden relative border border-slate-200 shadow-sm flex flex-col">
        <AnimatePresence mode="wait">
          {/* ESTADO 1: ESPERANDO ESCANEO */}
          {status === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center bg-white p-8 text-center"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm ring-8 ring-blue-50/50">
                <ScanLine className="w-10 h-10 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">
                Zona de Entregas: {selectedStation === 'all' ? 'General' : selectedStation}
              </h2>
              <p className="text-slate-500 text-base max-w-md mb-8">
                Escanee el código QR / barras del ticket o ingrese el identificador para despachar el pedido
              </p>
              
              <form onSubmit={handleScanSubmit} className="w-full max-w-md relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-6 w-6" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escanear ticket (ej: TKT-1023)"
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-blue-600 rounded-2xl py-4 pl-12 pr-4 text-2xl font-mono text-center text-slate-800 placeholder:text-slate-400 outline-none transition-all uppercase shadow-inner"
                  autoComplete="off"
                  autoFocus
                />
                <button
                  type="submit"
                  className="mt-3 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  Confirmar Entrega
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}

          {/* ESTADO 2: VERDE / APROBADO */}
          {status === 'success' && activeTicket && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center bg-emerald-500 text-white p-8 text-center"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-xs">
                <CheckCircle2 className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-5xl font-black tracking-tight mb-2">¡ENTREGAR PEDIDO!</h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-emerald-100 font-mono text-xl font-bold bg-emerald-600/50 px-4 py-1 rounded-full">
                  {activeTicket.id}
                </span>
                {activeTicket.targetStation && (
                  <span className="bg-white text-emerald-800 font-bold text-sm px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {activeTicket.targetStation}
                  </span>
                )}
              </div>
              
              <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-2xl text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Artículos a Despachar:</span>
                  <span className="font-normal font-mono text-slate-400">Caja: {activeTicket.boxId}</span>
                </p>
                <div className="space-y-3">
                  {activeTicket.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xl sm:text-2xl font-bold border-b border-slate-50 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl text-lg sm:text-xl font-black">
                          {item.quantity}x
                        </span>
                        <span>{item.product.name}</span>
                      </div>
                      {item.side && (
                        <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                          c/ {item.side.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-emerald-100 text-sm font-medium mt-6">Regresando automáticamente al escáner...</p>
            </motion.div>
          )}

          {/* ESTADO ALERTA: ZONA INCORRECTA (Ej: traen ticket de barra a cocina) */}
          {status === 'wrong_station' && activeTicket && (
            <motion.div 
              key="wrong_station"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center bg-amber-500 text-white p-8 text-center"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-xs animate-bounce">
                <AlertOctagon className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">⚠️ ZONA DE ENTREGA DISTINTA</h2>
              <p className="text-amber-100 text-base max-w-lg mb-6 font-medium">
                Este ticket fue emitido para ser retirado en otro puesto de entrega.
              </p>

              <div className="bg-white text-slate-900 p-6 rounded-3xl shadow-xl w-full max-w-lg text-center space-y-4">
                <div className="font-mono text-2xl font-black text-slate-800">
                  {activeTicket.id}
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Destino Correcto:</span>
                    <span className="font-black text-sm text-emerald-700 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {activeTicket.targetStation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Puesto Actual:</span>
                    <span className="font-bold text-sm text-slate-700 flex items-center gap-1 mt-0.5">
                      <Store className="w-3.5 h-3.5" />
                      {selectedStation}
                    </span>
                  </div>
                </div>

                <div className="text-left text-xs text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <p className="font-bold mb-1">Artículos en este comprobante:</p>
                  <p>{activeTicket.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle');
                      setActiveTicket(null);
                    }}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
                  >
                    Volver al Escáner
                  </button>
                  <button
                    type="button"
                    onClick={handleForceDeliver}
                    className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
                  >
                    Entregar Aquí de Todos Modos
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ESTADO 3: ROJO / YA ENTREGADO ANTES */}
          {status === 'already_delivered' && activeTicket && (
            <motion.div 
              key="already_delivered"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center bg-rose-600 text-white p-8 text-center"
            >
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-xs">
                <AlertTriangle className="w-16 h-16 text-white" />
              </div>
              <h2 className="text-5xl font-black tracking-tight mb-2">⚠️ YA ENTREGADO</h2>
              <span className="text-rose-200 font-mono text-xl font-bold bg-rose-700/40 px-4 py-1 rounded-full mb-6">
                {activeTicket.id}
              </span>
              
              <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-xl w-full max-w-lg text-center">
                <p className="text-base text-slate-600 font-medium">Este ticket ya fue canjeado con anterioridad a las:</p>
                <p className="text-4xl font-black text-rose-600 mt-2 font-mono">
                  {activeTicket.deliveredAt 
                    ? activeTicket.deliveredAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    : 'Hora registrada'}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  Emitido por: <strong>{activeTicket.cashierName}</strong> (Caja: {activeTicket.boxId})
                </div>
              </div>
              <p className="text-rose-100 text-sm font-medium mt-6">Regresando automáticamente al escáner...</p>
            </motion.div>
          )}

          {/* ESTADO 4: GRIS / NO ENCONTRADO */}
          {status === 'not_found' && (
            <motion.div 
              key="not_found"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center bg-slate-700 text-white p-8 text-center"
            >
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-12 h-12 text-slate-300" />
              </div>
              <h2 className="text-4xl font-black mb-2">Ticket No Encontrado</h2>
              <p className="text-slate-300 text-lg max-w-md">
                Verifique que el código ingresado o escaneado pertenezca a este evento.
              </p>
              <p className="text-slate-400 text-xs mt-6">Regresando al escáner...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BANDEJA INFERIOR DE TICKETS PENDIENTES */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-800 text-sm">
              Pedidos Pendientes en {selectedStation === 'all' ? 'Todas las Zonas' : selectedStation} ({filteredPendingTickets.length})
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Haga clic en cualquier ticket para simular el escáner al instante
          </span>
        </div>

        {filteredPendingTickets.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No hay tickets pendientes de despacho para {selectedStation === 'all' ? 'ningún puesto' : selectedStation}. Puede generar ventas desde la pestaña de Ventas.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {filteredPendingTickets.map(t => (
              <button
                key={t.id}
                onClick={() => processCode(t.id)}
                className="flex-shrink-0 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-3 rounded-xl text-left transition-all group"
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="font-mono font-bold text-slate-800 text-sm group-hover:text-blue-600">{t.id}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                    {t.targetStation || 'Puesto'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                  {t.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

