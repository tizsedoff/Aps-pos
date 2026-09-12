import React, { useState, useEffect } from 'react';
import { Product, CartItem, Ticket } from '../types';
import { PRODUCTS } from '../data';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Loader2, Receipt } from 'lucide-react';

interface CajaProps {
  onCheckout: (ticket: Ticket) => void;
}

export function Caja({ onCheckout }: CajaProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTicket, setShowTicket] = useState<Ticket | null>(null);
  const [caeStatus, setCaeStatus] = useState<'processing' | 'approved'>('processing');

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.max(0, item.quantity + delta) };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    
    // Simulate fast process
    setTimeout(() => {
      const newTicket: Ticket = {
        id: `TKT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        items: [...cart],
        total,
        status: 'pending',
        createdAt: new Date(),
        boxId: 'CAJA-01'
      };
      
      onCheckout(newTicket);
      setShowTicket(newTicket);
      setIsProcessing(false);
      setCaeStatus('processing');
      clearCart();
      
      // Simulate CAE validation in background
      setTimeout(() => {
        setCaeStatus('approved');
      }, 2000);
      
    }, 400); // 400ms feels fast but noticeable
  };

  if (showTicket) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in zoom-in duration-300">
        <div className="bg-white text-zinc-900 p-8 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center relative overflow-hidden">
          {/* Decorative receipt edges */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_4px,#fff_4px)] bg-[length:16px_16px] -mt-2"></div>
          
          <Receipt className="w-12 h-12 text-zinc-300 mb-4" />
          <h2 className="text-3xl font-black mb-1">{showTicket.id}</h2>
          <p className="text-zinc-500 mb-6 text-sm">APS - Eventos Colectividad</p>
          
          <div className="w-full border-t border-dashed border-zinc-300 my-4"></div>
          
          <div className="w-full space-y-3 mb-6">
            {showTicket.items.map((item, idx) => (
              <div key={idx} className="flex justify-between font-medium">
                <span>{item.quantity}x {item.product.name}</span>
                <span>${(item.product.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          <div className="w-full border-t border-dashed border-zinc-300 my-4"></div>
          
          <div className="flex justify-between w-full text-2xl font-black mb-8">
            <span>TOTAL</span>
            <span>${showTicket.total.toLocaleString()}</span>
          </div>
          
          <div className="bg-zinc-100 p-4 rounded-xl mb-6 flex flex-col items-center">
            <QRCodeSVG value={showTicket.id} size={160} level="H" includeMargin={true} />
            <p className="text-xs text-zinc-500 mt-2 font-mono">{showTicket.id}</p>
          </div>
          
          <div className={`flex items-center gap-2 font-bold p-3 rounded-lg w-full justify-center transition-colors ${caeStatus === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {caeStatus === 'processing' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> CAE: Procesando...</>
            ) : (
              <><CheckCircle2 className="w-5 h-5" /> CAE: Aprobado ✅</>
            )}
          </div>
          
          <button 
            onClick={() => setShowTicket(null)}
            className="mt-8 w-full bg-zinc-900 text-white py-4 rounded-xl font-bold text-lg active:scale-95 transition-transform"
          >
            Nueva Venta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6">
      {/* Products Grid */}
      <div className="flex-1 bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-zinc-100">
          Productos
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {PRODUCTS.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="relative overflow-hidden group flex flex-col h-32 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-lime-500 hover:bg-zinc-800/80 active:scale-95 transition-all text-left"
            >
              <div className={`absolute top-0 left-0 w-2 h-full ${p.color || 'bg-zinc-600'}`}></div>
              <div className="p-4 pl-6 h-full flex flex-col justify-between">
                <span className="font-semibold text-lg text-zinc-100 leading-tight">{p.name}</span>
                <span className="text-lime-400 font-bold text-xl">${p.price.toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Side */}
      <div className="w-96 bg-zinc-900 rounded-2xl border border-zinc-800 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-lime-500" />
            Pedido Actual
          </h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-zinc-500 hover:text-red-400 p-2 rounded-lg hover:bg-zinc-800 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-full flex flex-col items-center justify-center text-zinc-500"
              >
                <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
                <p>El carrito está vacío</p>
              </motion.div>
            ) : (
              cart.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.product.id}
                  className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-bold text-zinc-100">{item.product.name}</p>
                    <p className="text-sm text-zinc-400">${item.product.price.toLocaleString()} c/u</p>
                  </div>
                  <div className="flex items-center gap-3 bg-zinc-950 p-1 rounded-lg border border-zinc-700/50">
                    <button 
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 transition-colors text-lime-400"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-zinc-950 border-t border-zinc-800">
          <div className="flex justify-between items-end mb-6">
            <span className="text-zinc-400 font-medium">Total</span>
            <span className="text-4xl font-black text-white">${total.toLocaleString()}</span>
          </div>
          <button
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout}
            className={`w-full py-5 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-all
              ${cart.length === 0 
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                : 'bg-lime-500 hover:bg-lime-400 text-zinc-950 active:scale-95 shadow-[0_0_30px_rgba(132,204,22,0.3)] hover:shadow-[0_0_40px_rgba(132,204,22,0.5)]'
              }`}
          >
            {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'COBRAR'}
          </button>
        </div>
      </div>
    </div>
  );
}
