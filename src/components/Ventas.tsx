import React, { useState } from 'react';
import { Product, Side, CartItem } from '../types';
import { PRODUCTS, SIDES } from '../data';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, ReceiptText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Ventas() {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedSideId, setSelectedSideId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedProduct = PRODUCTS.find(p => p.id === selectedProductId);
  const selectedSide = SIDES.find(s => s.id === selectedSideId);

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (selectedProduct.requiresSide && !selectedSide) {
      alert("Por favor seleccione una guarnición.");
      return;
    }

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      product: selectedProduct,
      side: selectedProduct.requiresSide ? selectedSide : undefined,
      quantity: 1,
    };

    setCart([...cart, newItem]);
    
    // Reset form for next item
    setSelectedProductId('');
    setSelectedSideId('');
  };

  const removeLineItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsSuccess(true);
    setCart([]);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      
      {/* Carga de Artículos (Izquierda) */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ReceiptText className="w-6 h-6 text-blue-600" />
          Nueva Venta
        </h2>

        <form onSubmit={handleAddToCart} className="space-y-6 max-w-xl">
          {/* Selección de Producto */}
          <div className="space-y-2">
            <label htmlFor="product" className="block font-semibold text-slate-700">
              Artículo a facturar
            </label>
            <select
              id="product"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setSelectedSideId(''); // Reset side when product changes
              }}
              className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            >
              <option value="">-- Seleccione un artículo --</option>
              {PRODUCTS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.price.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de Guarnición (Solo si aplica) */}
          <AnimatePresence>
            {selectedProduct?.requiresSide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label htmlFor="side" className="block font-semibold text-slate-700">
                  Guarnición
                </label>
                <select
                  id="side"
                  value={selectedSideId}
                  onChange={(e) => setSelectedSideId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                >
                  <option value="">-- Seleccione guarnición --</option>
                  {SIDES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={!selectedProduct || (selectedProduct.requiresSide && !selectedSideId)}
            className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Agregar al Detalle
          </button>
        </form>
      </div>

      {/* Panel lateral: Carrito de Compras */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Detalle
          </h2>
          <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
            {cart.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
          <AnimatePresence mode="popLayout">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-green-600"
              >
                <CheckCircle2 className="w-16 h-16 mb-4" />
                <p className="text-xl font-bold">¡Venta Registrada!</p>
              </motion.div>
            ) : cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-full flex flex-col items-center justify-center text-slate-400"
              >
                <ShoppingCart className="w-12 h-12 mb-4 opacity-30" />
                <p>El detalle está vacío</p>
              </motion.div>
            ) : (
              cart.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800">{item.product.name}</p>
                      {item.side && (
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          ↳ {item.side.name}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeLineItem(item.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-4 text-center font-bold text-slate-700">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-blue-600 shadow-sm hover:bg-slate-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-slate-700">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
          <div className="flex justify-between items-end mb-6">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-sm">Total a cobrar</span>
            <span className="text-4xl font-black text-slate-800">${total.toLocaleString()}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
              ${cart.length === 0 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95'
              }`}
          >
            CONFIRMAR PAGO
          </button>
        </div>
      </div>
    </div>
  );
}
