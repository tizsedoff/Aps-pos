import React, { useState, useMemo } from 'react';
import { Product, Side, CartItem, Ticket, User, DispatchStation } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, ReceiptText, Loader2, AlertCircle, MapPin, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ApsLogo } from './ApsLogo';
import { groupCartByStation } from '../utils/stationRouting';

interface VentasProps {
  products: Product[];
  sides: Side[];
  stockData: Record<string, number>;
  currentUser: User;
  dispatchStations?: DispatchStation[];
  onCheckout: (newTicket: Ticket | Ticket[]) => void;
}

export function Ventas({ products, sides, stockData, currentUser, dispatchStations, onCheckout }: VentasProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedSideId, setSelectedSideId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeModalTickets, setActiveModalTickets] = useState<Ticket[]>([]);
  const [activeTicketIndex, setActiveTicketIndex] = useState<number>(0);
  const [caeStatus, setCaeStatus] = useState<'processing' | 'approved'>('processing');
  
  // Estado de Pago y vuelto
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Guarniciones permitidas para el producto seleccionado
  const availableSides = useMemo(() => {
    if (!selectedProduct || !selectedProduct.requiresSide) return [];
    if (selectedProduct.allowedSideIds && selectedProduct.allowedSideIds.length > 0) {
      return sides.filter(s => selectedProduct.allowedSideIds?.includes(s.id));
    }
    return sides;
  }, [selectedProduct, sides]);

  const selectedSide = availableSides.find(s => s.id === selectedSideId);

  const availableStock = selectedProduct ? (stockData[selectedProduct.id] ?? 0) : 0;

  // Manejo de precio por item sumando guarnición
  const getItemUnitPrice = (item: CartItem): number => {
    return item.product.price + (item.side?.price || 0);
  };

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    setSelectedSideId(''); // Resetear guarnición al cambiar de producto
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (availableStock <= 0) {
      alert("No hay stock disponible para este artículo.");
      return;
    }

    if (selectedProduct.requiresSide) {
      if (availableSides.length === 0) {
        alert("Este plato requiere guarnición pero no tiene ninguna configurada o disponible. Revise el catálogo.");
        return;
      }
      if (!selectedSide) {
        alert("Por favor seleccione una guarnición.");
        return;
      }
    }

    // Verificar si ya existe en el carrito con la misma guarnición
    const existingIndex = cart.findIndex(
      item => item.product.id === selectedProduct.id && item.side?.id === selectedSide?.id
    );

    if (existingIndex > -1) {
      const currentCartQty = cart[existingIndex].quantity;
      if (currentCartQty + 1 > availableStock) {
        alert("No hay suficiente stock para agregar más unidades.");
        return;
      }
      setCart(prev => prev.map((item, idx) => 
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      const newItem: CartItem = {
        id: crypto.randomUUID(),
        product: selectedProduct,
        side: selectedProduct.requiresSide ? selectedSide : undefined,
        quantity: 1,
      };
      setCart(prev => [...prev, newItem]);
    }
  };

  const removeLineItem = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return item;
        const currentStock = stockData[item.product.id] ?? 0;
        if (newQty > currentStock) {
          alert("Límite de stock alcanzado.");
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // Total acumulado con precios de guarnición
  const total = cart.reduce((sum, item) => sum + (getItemUnitPrice(item) * item.quantity), 0);

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setAmountPaid('');
    setIsPaymentModalOpen(true);
  };

  const handleConfirmCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessingCheckout(true);

    const grouped = groupCartByStation(cart, dispatchStations);
    const ticketsToCreate: Ticket[] = [];
    const baseNum = Math.floor(1000 + Math.random() * 9000);
    const orderGroupId = `ORD-${baseNum}`;
    const boxId = currentUser.boxId || (currentUser.role === 'admin' ? 'CAJA-ADMIN' : 'CAJA-01');

    if (grouped.size <= 1) {
      const [singleGroup] = Array.from(grouped.values());
      const stationName = singleGroup?.stationName || 'Cocina y Minutas';
      const stationId = singleGroup?.stationId;
      ticketsToCreate.push({
        id: `TKT-${baseNum}`,
        items: [...cart],
        total,
        status: 'pending',
        createdAt: new Date(),
        cashierName: currentUser.name,
        boxId,
        caeStatus: 'processing',
        targetStation: stationName,
        targetStationId: stationId,
        orderGroupId
      });
    } else {
      const letters = ['A', 'B', 'C', 'D', 'E'];
      let idx = 0;
      grouped.forEach((group) => {
        const letter = letters[idx] || `${idx + 1}`;
        ticketsToCreate.push({
          id: `TKT-${baseNum}-${letter}`,
          items: [...group.items],
          total: group.subtotal,
          status: 'pending',
          createdAt: new Date(),
          cashierName: currentUser.name,
          boxId,
          caeStatus: 'processing',
          targetStation: group.stationName,
          targetStationId: group.stationId,
          orderGroupId
        });
        idx++;
      });
    }

    setTimeout(() => {
      onCheckout(ticketsToCreate);
      setActiveModalTickets(ticketsToCreate);
      setActiveTicketIndex(0);
      setCaeStatus('processing');
      setIsProcessingCheckout(false);
      setIsPaymentModalOpen(false); // Cerrar modal de pago
      setCart([]);

      // Simular CAE aprobado sin frenar el flujo
      setTimeout(() => {
        setCaeStatus('approved');
      }, 2200);
    }, 350);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 relative">
      
      {/* Carga de Artículos (Izquierda) */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span>Terminal de Ventas</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Selección rápida de artículos, guarniciones y cobro en mostrador</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
              CAJERO: {currentUser.name}
            </span>
          </div>
        </div>

        <form onSubmit={handleAddToCart} className="space-y-4 max-w-xl">
          {/* Selector de Artículo */}
          <div className="space-y-1.5">
            <label htmlFor="product" className="block text-sm font-bold text-slate-700 flex items-center justify-between">
              <span>1. Seleccionar Artículo / Plato</span>
              {selectedProduct && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                  availableStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                }`}>
                  Stock: {availableStock} u.
                </span>
              )}
            </label>
            <select
              id="product"
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            >
              <option value="">-- Elija un artículo para agregar --</option>
              {products.length === 0 ? (
                <option value="" disabled>No hay productos en el catálogo. Cargue artículos primero.</option>
              ) : (
                products.map(p => {
                  const stock = stockData[p.id] ?? 0;
                  const volumeText = p.category === 'Bebida' && p.volumeUnit && p.volumeAmount ? ` [${p.volumeAmount}${p.volumeUnit}]` : '';
                  return (
                    <option key={p.id} value={p.id} disabled={stock <= 0}>
                      {p.name}{volumeText} - ${p.price.toLocaleString()} {stock <= 0 ? '(AGOTADO)' : `(${stock} u.)`}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Empty state si no hay productos cargados */}
          {products.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
              <p className="font-bold mb-1">Catálogo de Artículos Vacío</p>
              <p>No hay artículos registrados para vender. Vaya a la sección <strong>"Artículos"</strong> para dar de alta platos, bebidas y sus precios.</p>
            </div>
          )}

          {/* Selector de Guarnición (Solo si el producto requiere guarnición) */}
          <AnimatePresence>
            {selectedProduct?.requiresSide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label htmlFor="side" className="block text-sm font-bold text-slate-700 flex items-center justify-between">
                  <span>2. Seleccionar Guarnición (Obligatoria)</span>
                  <span className="text-xs text-blue-600 font-medium">
                    {availableSides.length} {availableSides.length === 1 ? 'opción permitida' : 'opciones permitidas'}
                  </span>
                </label>

                {availableSides.length === 0 ? (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                    ⚠️ Este plato no tiene guarniciones habilitadas. Puede asignarlas o crearlas desde la sección <strong>"Artículos"</strong>.
                  </div>
                ) : (
                  <select
                    id="side"
                    value={selectedSideId}
                    onChange={(e) => setSelectedSideId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  >
                    <option value="">-- Elija guarnición --</option>
                    {availableSides.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.price > 0 ? `(+ $${s.price.toLocaleString()})` : '(Sin recargo)'}
                      </option>
                    ))}
                  </select>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={!selectedProduct || availableStock <= 0 || (selectedProduct.requiresSide && (!selectedSideId || availableSides.length === 0))}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base active:scale-98"
          >
            <Plus className="w-5 h-5 text-blue-400" />
            Agregar al Detalle
          </button>
        </form>

        {/* Artículos frecuentes de un toque */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Accesos Rápidos de Bebidas / Minutas</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {products.filter(p => !p.requiresSide).length === 0 ? (
              <p className="text-xs text-slate-400 italic col-span-2 sm:col-span-3 py-2">
                Los artículos de venta directa (bebidas, minutas, etc.) aparecerán aquí automáticamente una vez cargados en el catálogo.
              </p>
            ) : (
              products.filter(p => !p.requiresSide).slice(0, 6).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    handleProductChange(p.id);
                  }}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors flex flex-col justify-between"
                >
                  <span className="text-sm font-semibold text-slate-700 truncate">{p.name}</span>
                  <span className="text-xs font-bold text-blue-600 mt-1">${p.price.toLocaleString()}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Panel lateral: Carrito de Compras */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Detalle del Pedido
          </h2>
          <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} u.
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-full flex flex-col items-center justify-center text-slate-400 py-12"
              >
                <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
                <p className="font-medium text-sm">El pedido está vacío</p>
                <p className="text-xs text-slate-400 mt-1">Seleccione un artículo para comenzar</p>
              </motion.div>
            ) : (
              cart.map((item) => {
                const unitPrice = getItemUnitPrice(item);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item.id} 
                    className="p-3.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-slate-800 text-sm">
                          {item.product.name}
                          {item.product.category === 'Bebida' && item.product.volumeUnit && item.product.volumeAmount && (
                            <span className="ml-1.5 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                              {item.product.volumeAmount}{item.product.volumeUnit}
                            </span>
                          )}
                        </p>
                        {item.side && (
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <span className="text-blue-500">↳</span> c/ {item.side.name}
                            {item.side.price > 0 && (
                              <span className="text-blue-600 font-bold ml-1">
                                (+${item.side.price.toLocaleString()})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <button 
                        onClick={() => removeLineItem(item.id)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                        title="Quitar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-700 shadow-sm hover:bg-slate-50 transition-colors font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-5 text-center font-bold text-slate-800 text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-blue-600 shadow-sm hover:bg-slate-50 transition-colors font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="font-bold text-slate-800">
                        ${(unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        <div className="p-5 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
          <div className="flex justify-between items-end mb-4">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Total a Cobrar</span>
            <span className="text-3xl font-black text-slate-900">${total.toLocaleString()}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={handleOpenPayment}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
              ${cart.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-98'
              }`}
          >
            PAGAR / COBRAR TICKET
          </button>
        </div>
      </div>

      {/* Modal de Pago y Vuelto */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-800 border border-slate-200"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Cobro en Caja</h3>
                  <p className="text-xs text-slate-500">Registre el pago para calcular el vuelto exacto</p>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
                >
                  ✕
                </button>
              </div>

              {/* Total a pagar */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 flex justify-between items-center">
                <span className="text-slate-600 font-bold text-sm">TOTAL A PAGAR</span>
                <span className="text-3xl font-black text-slate-900">${total.toLocaleString()}</span>
              </div>

              {/* Input Paga con */}
              <div className="space-y-2 mb-6">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  ¿Con cuánto paga el cliente?
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="0"
                    autoFocus
                    className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-2xl py-4 pl-10 pr-4 text-3xl font-black focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all"
                  />
                </div>

                {/* Accesos rápidos de billetes */}
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => setAmountPaid(total.toString())} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-sm transition-colors">Justo</button>
                  <button onClick={() => setAmountPaid('10000')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-sm transition-colors">$10k</button>
                  <button onClick={() => setAmountPaid('20000')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-sm transition-colors">$20k</button>
                  <button onClick={() => setAmountPaid('50000')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-lg text-sm transition-colors">$50k</button>
                </div>
              </div>

              {/* Cálculo de Vuelto */}
              {Number(amountPaid) >= total && amountPaid !== '' && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-6 text-center">
                  <p className="text-emerald-700 font-bold uppercase tracking-wider text-xs mb-1">Vuelto a entregar</p>
                  <p className="text-4xl font-black text-emerald-600">${(Number(amountPaid) - total).toLocaleString()}</p>
                </div>
              )}
              
              {(Number(amountPaid) < total && amountPaid !== '') && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 mb-6 text-center text-rose-600 font-bold flex items-center justify-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  El monto es menor al total
                </div>
              )}

              <button
                disabled={Number(amountPaid) < total || amountPaid === '' || isProcessingCheckout}
                onClick={handleConfirmCheckout}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                  ${(Number(amountPaid) < total || amountPaid === '') || isProcessingCheckout
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 active:scale-98'
                  }`}
              >
                {isProcessingCheckout ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'CONFIRMAR Y EMITIR TICKET'
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal / Ticket Visual Generado al Cobrar */}
      <AnimatePresence>
        {activeModalTickets.length > 0 && (() => {
          const activeTicket = activeModalTickets[activeTicketIndex] || activeModalTickets[0];
          const targetStation = activeTicket?.targetStation || 'Puesto de Entrega';
          const isCocina = targetStation.toLowerCase().includes('cocina');
          const isBarra = targetStation.toLowerCase().includes('barra');
          const isParrilla = targetStation.toLowerCase().includes('parrilla');

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-800 border border-slate-200 flex flex-col items-center relative overflow-hidden max-h-[95vh] overflow-y-auto"
              >
                <div className="mb-2">
                  <ApsLogo className="w-12 h-12" />
                </div>

                {/* Si hay múltiples comprobantes por haber productos de varias zonas (Cocina y Barra) */}
                {activeModalTickets.length > 1 && (
                  <div className="w-full mb-3">
                    <div className="text-center mb-2">
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 py-1 px-3 rounded-full uppercase tracking-wider">
                        {activeModalTickets.length} Comprobantes Emitidos
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Los productos se deben retirar en puestos distintos:
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                      {activeModalTickets.map((t, idx) => {
                        const tStation = t.targetStation || `Ticket ${idx + 1}`;
                        const isCurrent = activeTicketIndex === idx;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTicketIndex(idx)}
                            className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center truncate ${
                              isCurrent
                                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                            }`}
                          >
                            <span className="block truncate">{tStation}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">#{t.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* BANNER DESTACADO DE ZONA DE ENTREGA */}
                <div
                  className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider mb-3 shadow-2xs border ${
                    isCocina
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : isBarra
                      ? 'bg-blue-50 text-blue-900 border-blue-300'
                      : isParrilla
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-indigo-50 text-indigo-900 border-indigo-200'
                  }`}
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>RETIRAR EN: {targetStation}</span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 font-mono">{activeTicket.id}</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  APS POS • Caja: {activeTicket.boxId} • Cajero: {activeTicket.cashierName}
                </p>

                <div className="w-full border-t border-dashed border-slate-300 my-3"></div>

                {/* Items correspondientes a este ticket */}
                <div className="w-full space-y-2 max-h-40 overflow-y-auto text-sm pr-1">
                  {activeTicket.items.map((item, idx) => {
                    const unitPrice = getItemUnitPrice(item);
                    return (
                      <div key={idx} className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-800">
                            {item.quantity}x {item.product.name}
                            {item.product.category === 'Bebida' && item.product.volumeUnit && item.product.volumeAmount && (
                              <span className="ml-1 text-[10px] font-bold text-slate-600 uppercase">
                                [{item.product.volumeAmount}{item.product.volumeUnit}]
                              </span>
                            )}
                          </span>
                          {item.side && (
                            <p className="text-xs text-slate-500">
                              c/ {item.side.name} {item.side.price > 0 ? `(+$${item.side.price.toLocaleString()})` : ''}
                            </p>
                          )}
                        </div>
                        <span className="font-bold text-slate-700 font-mono">${(unitPrice * item.quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="w-full border-t border-dashed border-slate-300 my-3"></div>

                <div className="flex justify-between items-center w-full text-lg font-black text-slate-900 mb-3">
                  <span>TOTAL TICKET</span>
                  <span className="font-mono">${activeTicket.total.toLocaleString()}</span>
                </div>

                {/* QR Code */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-3 flex flex-col items-center">
                  <QRCodeSVG value={activeTicket.id} size={130} level="M" />
                  <span className="text-[11px] font-mono text-slate-600 mt-1 font-bold">{activeTicket.id}</span>
                </div>

                {/* CAE Status */}
                <div className={`w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors mb-3 ${caeStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {caeStatus === 'processing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      CAE ARCA: Procesando en segundo plano...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      CAE ARCA: Aprobado ✅ (Sin demoras)
                    </>
                  )}
                </div>

                <div className="w-full flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModalTickets([]);
                      setActiveTicketIndex(0);
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    Nueva Venta
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
