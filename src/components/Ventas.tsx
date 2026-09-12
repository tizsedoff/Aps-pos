import React, { useState } from 'react';
import { Product, Side, CartItem, Ticket, User } from '../types';
import { SIDES } from '../data';
import { QRCodeSVG } from 'qrcode.react';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, ReceiptText, Loader2, Printer, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VentasProps {
  products: Product[];
  stockData: Record<string, number>;
  currentUser: User;
  onCheckout: (newTicket: Ticket) => void;
}

export function Ventas({ products, stockData, currentUser, onCheckout }: VentasProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedSideId, setSelectedSideId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeModalTicket, setActiveModalTicket] = useState<Ticket | null>(null);
  const [caeStatus, setCaeStatus] = useState<'processing' | 'approved'>('processing');
  
  // Payment state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedSide = SIDES.find(s => s.id === selectedSideId);

  const availableStock = selectedProduct ? (stockData[selectedProduct.id] ?? 0) : 0;

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (availableStock <= 0) {
      alert("No hay stock disponible para este artículo.");
      return;
    }

    if (selectedProduct.requiresSide && !selectedSide) {
      alert("Por favor seleccione una guarnición.");
      return;
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
      setCart([...cart, newItem]);
    }
    
    // Reset selections
    setSelectedProductId('');
    setSelectedSideId('');
  };

  const removeLineItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const productStock = stockData[item.product.id] ?? 999;
        const newQty = item.quantity + delta;
        if (newQty > productStock) {
          alert(`Solo quedan ${productStock} unidades en stock.`);
          return item;
        }
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setAmountPaid('');
    setIsPaymentModalOpen(true);
  };

  const handleConfirmCheckout = () => {
    if (cart.length === 0) return;
    setIsProcessingCheckout(true);

    const ticketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: Ticket = {
      id: ticketNumber,
      items: [...cart],
      total,
      status: 'pending',
      createdAt: new Date(),
      cashierName: currentUser.name,
      boxId: currentUser.role === 'admin' ? 'CAJA-ADMIN' : 'CAJA-01',
      caeStatus: 'processing'
    };

    setTimeout(() => {
      onCheckout(newTicket);
      setActiveModalTicket(newTicket);
      setCaeStatus('processing');
      setIsProcessingCheckout(false);
      setIsPaymentModalOpen(false); // Close payment modal
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
              <ReceiptText className="w-6 h-6 text-blue-600" />
              Terminal de Ventas
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">Operador: <strong className="text-slate-700">{currentUser.name}</strong></p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg font-mono font-semibold">
            {currentUser.role === 'admin' ? 'Caja Central' : 'Caja 01 - Táctil'}
          </span>
        </div>

        {products.length === 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p>
              <strong>Catálogo sin artículos:</strong> No hay productos precargados. El Administrador puede dar de alta los artículos y el stock desde las pestañas <strong>Artículos</strong> y <strong>Stock</strong>.
            </p>
          </div>
        )}

        <form onSubmit={handleAddToCart} className="space-y-5 max-w-xl">
          {/* Selección de Producto */}
          <div className="space-y-1.5">
            <label htmlFor="product" className="block text-sm font-bold text-slate-700">
              1. Seleccionar Artículo / Plato
            </label>
            <select
              id="product"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setSelectedSideId('');
              }}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            >
              <option value="">
                {products.length === 0 
                  ? '-- No hay artículos cargados en el catálogo --' 
                  : '-- Seleccione un artículo del catálogo --'}
              </option>
              {products.map(p => {
                const stock = stockData[p.id] ?? 0;
                return (
                  <option key={p.id} value={p.id} disabled={stock <= 0}>
                    {p.name} - ${p.price.toLocaleString()} ({stock > 0 ? `Stock: ${stock}` : 'SIN STOCK'})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Información rápida del artículo seleccionado */}
          {selectedProduct && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">{selectedProduct.name}</span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-md">
                  {selectedProduct.category}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 text-base mr-3">${selectedProduct.price.toLocaleString()}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${availableStock > 15 ? 'bg-emerald-100 text-emerald-800' : availableStock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                  {availableStock > 0 ? `${availableStock} disp.` : 'Agotado'}
                </span>
              </div>
            </div>
          )}

          {/* Selección de Guarnición (Solo si aplica) */}
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
                  <span className="text-xs text-blue-600 font-medium">Incluida en el plato</span>
                </label>
                <select
                  id="side"
                  value={selectedSideId}
                  onChange={(e) => setSelectedSideId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                >
                  <option value="">-- Elija guarnición (ej: Papas Fritas) --</option>
                  {SIDES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={!selectedProduct || availableStock <= 0 || (selectedProduct.requiresSide && !selectedSideId)}
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
                    setSelectedProductId(p.id);
                    setSelectedSideId('');
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
              cart.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <p className="font-bold text-slate-800 text-sm">{item.product.name}</p>
                      {item.side && (
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <span className="text-blue-500">↳</span> Guarnición: {item.side.name}
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
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))
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

      {/* Modal de Pago y Cálculo de Vuelto */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-800 border border-slate-200 flex flex-col relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <ReceiptText className="w-6 h-6 text-blue-600" />
                  Procesar Pago
                </h3>
                <button 
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"
                >
                  <AlertCircle className="w-5 h-5 opacity-0 absolute" /> {/* Ensure import works if not added */}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6 text-center">
                <p className="text-blue-600 font-bold uppercase tracking-wider text-xs mb-1">Total a Pagar</p>
                <p className="text-4xl font-black text-blue-700">${total.toLocaleString()}</p>
              </div>

              <div className="space-y-4 mb-6">
                <label className="block text-sm font-bold text-slate-700">
                  ¿Con cuánto abona el cliente?
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">$</span>
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
        {activeModalTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-slate-800 border border-slate-200 flex flex-col items-center relative overflow-hidden"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-3">
                <ReceiptText className="w-6 h-6" />
              </div>

              <h3 className="text-2xl font-black text-slate-900">{activeModalTicket.id}</h3>
              <p className="text-xs text-slate-500 font-medium">APS - Eventos Colectividad</p>

              <div className="w-full border-t border-dashed border-slate-300 my-4"></div>

              {/* Items */}
              <div className="w-full space-y-2 max-h-48 overflow-y-auto text-sm pr-1">
                {activeModalTicket.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-slate-800">{item.quantity}x {item.product.name}</span>
                      {item.side && (
                        <p className="text-xs text-slate-500">c/ {item.side.name}</p>
                      )}
                    </div>
                    <span className="font-bold text-slate-700">${(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="w-full border-t border-dashed border-slate-300 my-4"></div>

              <div className="flex justify-between items-center w-full text-xl font-black text-slate-900 mb-4">
                <span>TOTAL</span>
                <span>${activeModalTicket.total.toLocaleString()}</span>
              </div>

              {/* QR Code */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-4 flex flex-col items-center">
                <QRCodeSVG value={activeModalTicket.id} size={140} level="M" />
                <span className="text-[11px] font-mono text-slate-500 mt-1.5 font-bold">{activeModalTicket.id}</span>
              </div>

              {/* CAE Status */}
              <div className={`w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-colors ${caeStatus === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
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

              <div className="mt-5 w-full flex gap-2">
                <button
                  onClick={() => setActiveModalTicket(null)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  Nueva Venta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
