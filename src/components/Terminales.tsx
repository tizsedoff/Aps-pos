import React, { useState } from 'react';
import { SalesBox, DispatchStation, Ticket } from '../types';
import { ShoppingCart, ScanLine, Plus, Trash2, AlertTriangle, CheckCircle2, Store, MapPin, DollarSign, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TerminalesProps {
  salesBoxes: SalesBox[];
  dispatchStations: DispatchStation[];
  tickets: Ticket[];
  onAddSalesBox: (box: SalesBox) => void;
  onDeleteSalesBox: (boxId: string) => void;
  onAddDispatchStation: (station: DispatchStation) => void;
  onDeleteDispatchStation: (stationId: string) => void;
}

export function Terminales({
  salesBoxes,
  dispatchStations,
  tickets,
  onAddSalesBox,
  onDeleteSalesBox,
  onAddDispatchStation,
  onDeleteDispatchStation
}: TerminalesProps) {
  // Estado para formulario de Caja de Venta
  const [newBoxName, setNewBoxName] = useState('');
  const [newBoxDesc, setNewBoxDesc] = useState('');
  const [boxError, setBoxError] = useState('');
  const [boxSuccess, setBoxSuccess] = useState('');

  // Estado para formulario de Puesto de Entrega
  const [newStationName, setNewStationName] = useState('');
  const [newStationDesc, setNewStationDesc] = useState('');
  const [stationError, setStationError] = useState('');
  const [stationSuccess, setStationSuccess] = useState('');

  // Estado de confirmación de eliminación
  const [deletingBox, setDeletingBox] = useState<SalesBox | null>(null);
  const [deletingStation, setDeletingStation] = useState<DispatchStation | null>(null);

  // Crear Caja de Venta
  const handleCreateBox = (e: React.FormEvent) => {
    e.preventDefault();
    setBoxError('');
    setBoxSuccess('');

    const trimmedName = newBoxName.trim().toUpperCase();
    if (!trimmedName) {
      setBoxError('Ingrese un identificador para la caja (ej: CAJA-05).');
      return;
    }

    // Verificar que no exista una caja con el mismo nombre
    if (salesBoxes.some(b => b.name.toUpperCase() === trimmedName)) {
      setBoxError(`Ya existe una caja con el nombre "${trimmedName}".`);
      return;
    }

    const newBox: SalesBox = {
      id: `box-${Date.now()}`,
      name: trimmedName,
      description: newBoxDesc.trim() || undefined
    };

    onAddSalesBox(newBox);
    setNewBoxName('');
    setNewBoxDesc('');
    setBoxSuccess(`Caja ${trimmedName} creada exitosamente.`);
    setTimeout(() => setBoxSuccess(''), 2500);
  };

  // Crear Puesto de Entrega
  const handleCreateStation = (e: React.FormEvent) => {
    e.preventDefault();
    setStationError('');
    setStationSuccess('');

    const trimmedName = newStationName.trim();
    if (!trimmedName) {
      setStationError('Ingrese un nombre para el puesto de entrega (ej: Barra 2).');
      return;
    }

    if (dispatchStations.some(s => s.name.toLowerCase() === trimmedName.toLowerCase())) {
      setStationError(`Ya existe un puesto con el nombre "${trimmedName}".`);
      return;
    }

    const newStation: DispatchStation = {
      id: `disp-${Date.now()}`,
      name: trimmedName,
      description: newStationDesc.trim() || undefined
    };

    onAddDispatchStation(newStation);
    setNewStationName('');
    setNewStationDesc('');
    setStationSuccess(`Puesto ${trimmedName} creado exitosamente.`);
    setTimeout(() => setStationSuccess(''), 2500);
  };

  // Confirmar eliminación de caja
  const handleConfirmDeleteBox = () => {
    if (!deletingBox) return;
    if (salesBoxes.length <= 1) {
      setBoxError('Debe existir al menos una caja de ventas activa en el sistema.');
      setDeletingBox(null);
      return;
    }
    onDeleteSalesBox(deletingBox.id);
    setDeletingBox(null);
  };

  // Confirmar eliminación de puesto
  const handleConfirmDeleteStation = () => {
    if (!deletingStation) return;
    if (dispatchStations.length <= 1) {
      setStationError('Debe existir al menos un puesto de entrega activo en el sistema.');
      setDeletingStation(null);
      return;
    }
    onDeleteDispatchStation(deletingStation.id);
    setDeletingStation(null);
  };

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pb-8">
      {/* Encabezado */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:px-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            Gestión de Cajas de Ventas y Puestos de Entrega
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cree, configure o elimine los puntos de cobro y terminales de despacho disponibles en el evento
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
            {salesBoxes.length} Cajas de Venta
          </span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
            {dispatchStations.length} Puestos de Entrega
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* SECCIÓN 1: CAJAS DE VENTA */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Cajas de Ventas (Puntos de Cobro)</h3>
                <p className="text-xs text-slate-400">Terminales donde los cajeros operan y facturan</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {salesBoxes.length} {salesBoxes.length === 1 ? 'caja' : 'cajas'}
            </span>
          </div>

          {/* Formulario Agregar Caja */}
          <form onSubmit={handleCreateBox} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              Nueva Caja de Ventas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">
                  Código / Identificador *
                </label>
                <input
                  type="text"
                  value={newBoxName}
                  onChange={(e) => setNewBoxName(e.target.value)}
                  placeholder="Ej: CAJA-05"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 uppercase focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">
                  Ubicación / Sector (Opcional)
                </label>
                <input
                  type="text"
                  value={newBoxDesc}
                  onChange={(e) => setNewBoxDesc(e.target.value)}
                  placeholder="Ej: Entrada Principal / Barra VIP"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {boxError && (
              <p className="text-xs text-red-600 font-bold mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {boxError}
              </p>
            )}

            {boxSuccess && (
              <p className="text-xs text-emerald-600 font-bold mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {boxSuccess}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
            >
              <Plus className="w-4 h-4" />
              Crear Caja de Ventas
            </button>
          </form>

          {/* Lista de Cajas Existentes */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[420px]">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Cajas Registradas en el Sistema
            </h4>
            {salesBoxes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="text-xs font-bold text-slate-600">No hay cajas creadas</p>
              </div>
            ) : (
              salesBoxes.map((box) => {
                const boxTickets = tickets.filter(t => t.boxId === box.name);
                const boxTotal = boxTickets.reduce((sum, t) => sum + t.total, 0);

                return (
                  <motion.div
                    key={box.id}
                    layout
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50/40 border border-slate-200/80 rounded-2xl flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-blue-700 font-black text-xs flex items-center justify-center shadow-2xs">
                        {box.name.slice(-2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-sm">{box.name}</span>
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Activa para login" />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {box.description || 'Puesto General'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-slate-800">${boxTotal.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{boxTickets.length} tickets</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeletingBox(box)}
                        title="Eliminar Caja"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* SECCIÓN 2: PUESTOS DE ENTREGA Y DESPACHO */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Puestos de Entrega / Despacho</h3>
                <p className="text-xs text-slate-400">Barras, cocinas o sectores de entrega de pedidos</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {dispatchStations.length} {dispatchStations.length === 1 ? 'puesto' : 'puestos'}
            </span>
          </div>

          {/* Formulario Agregar Puesto */}
          <form onSubmit={handleCreateStation} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Nuevo Puesto de Entrega
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">
                  Nombre del Puesto *
                </label>
                <input
                  type="text"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  placeholder="Ej: Barra Terraza / Parrilla 2"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wide">
                  Especialidad / Nota (Opcional)
                </label>
                <input
                  type="text"
                  value={newStationDesc}
                  onChange={(e) => setNewStationDesc(e.target.value)}
                  placeholder="Ej: Solo bebidas / Minutas calientes"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {stationError && (
              <p className="text-xs text-red-600 font-bold mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {stationError}
              </p>
            )}

            {stationSuccess && (
              <p className="text-xs text-emerald-600 font-bold mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {stationSuccess}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
            >
              <Plus className="w-4 h-4" />
              Crear Puesto de Entrega
            </button>
          </form>

          {/* Lista de Puestos Existentes */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[420px]">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Puestos de Entrega Registrados
            </h4>
            {dispatchStations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ScanLine className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                <p className="text-xs font-bold text-slate-600">No hay puestos creados</p>
              </div>
            ) : (
              dispatchStations.map((station) => (
                <motion.div
                  key={station.id}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3.5 bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 rounded-2xl flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-emerald-700 font-black text-xs flex items-center justify-center shadow-2xs">
                      <ScanLine className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{station.name}</span>
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Activo para despacho" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {station.description || 'Puesto de despacho general'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDeletingStation(station)}
                    title="Eliminar Puesto"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL CONFIRMAR ELIMINACIÓN DE CAJA */}
      <AnimatePresence>
        {deletingBox && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                ¿Eliminar {deletingBox.name}?
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Esta caja ya no estará disponible para iniciar sesión ni para asignar ventas en el evento. Los tickets ya emitidos conservarán su registro.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingBox(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteBox}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm shadow-red-600/20"
                >
                  Sí, Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CONFIRMAR ELIMINACIÓN DE PUESTO */}
      <AnimatePresence>
        {deletingStation && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-sm w-full p-6 text-center"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">
                ¿Eliminar puesto "{deletingStation.name}"?
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Este punto de entrega se eliminará de la lista de opciones para los operadores de despacho.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeletingStation(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteStation}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm shadow-red-600/20"
                >
                  Sí, Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
