import React, { useState } from 'react';
import { Product } from '../types';
import { Archive, Plus, ArrowDownToLine, AlertTriangle, CheckCircle2, Search, Filter, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StockProps {
  products: Product[];
  stockData: Record<string, number>;
  onUpdateStock: (productId: string, newQuantity: number) => void;
  onAddBulkStock: (productId: string, addQuantity: number) => void;
}

export function Stock({ products, stockData, onUpdateStock, onAddBulkStock }: StockProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [incomeAmount, setIncomeAmount] = useState<number>(20);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Estadísticas del stock
  const totalUnits = Object.values(stockData).reduce((sum, qty) => sum + qty, 0);
  const lowStockCount = products.filter(p => (stockData[p.id] ?? 0) > 0 && (stockData[p.id] ?? 0) < 20).length;
  const outOfStockCount = products.filter(p => (stockData[p.id] ?? 0) <= 0).length;
  const inventoryValue = products.reduce((sum, p) => sum + (p.price * (stockData[p.id] ?? 0)), 0);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.id.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = categoryFilter === 'all' 
      ? true 
      : categoryFilter === 'low' 
        ? (stockData[p.id] ?? 0) < 20 
        : p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || incomeAmount <= 0) return;

    onAddBulkStock(selectedProductId, Number(incomeAmount));
    const prod = products.find(p => p.id === selectedProductId);
    setIsIncomeModalOpen(false);
    setFeedbackMessage(`Se ingresaron +${incomeAmount} unidades de "${prod?.name}".`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Archive className="w-6 h-6 text-teal-600" />
            Administración de Stock
          </h2>
          <p className="text-xs text-slate-500 mt-1">Control de inventario en tiempo real. Se descuenta automáticamente con cada venta de caja.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors"
          >
            <ArrowDownToLine className="w-4 h-4" />
            + Ingreso de Mercadería
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Stock */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-slate-100 bg-white">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unidades en Depósito</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalUnits} u.</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Valorización Venta</p>
          <p className="text-2xl font-black text-teal-700 mt-1">${inventoryValue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Stock Crítico (&lt;20)
          </p>
          <p className="text-2xl font-black text-amber-900 mt-1">{lowStockCount} artículos</p>
        </div>
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
          <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Sin Stock</p>
          <p className="text-2xl font-black text-rose-900 mt-1">{outOfStockCount} artículos</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="px-6 py-3 border-b border-slate-200 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar por nombre o ID..."
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtro:
          </span>
          {['all', 'Plato', 'Bebida', 'Minutas', 'low'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                categoryFilter === cat 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat === 'low' ? '⚠️ Solo Stock Bajo' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedbackMessage && (
        <div className="mx-6 mt-4 p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Tabla de Stock */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">ID</th>
              <th className="p-4">Artículo</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Precio Venta</th>
              <th className="p-4 text-center">Stock Actual</th>
              <th className="p-4">Estado</th>
              <th className="p-4 text-right">Ajuste Rápido (+ / -)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredProducts.map((p) => {
              const qty = stockData[p.id] ?? 0;
              const isOut = qty <= 0;
              const isLow = qty > 0 && qty < 20;

              return (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-400">{p.id}</td>
                  <td className="p-4 font-bold text-slate-800">{p.name}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">
                      {p.category}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-700">
                    ${p.price.toLocaleString()}
                  </td>
                  <td className="p-4 text-center font-black text-lg text-slate-800">
                    {qty}
                  </td>
                  <td className="p-4">
                    {isOut ? (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                        Agotado
                      </span>
                    ) : isLow ? (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                        Bajo
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                      <button
                        onClick={() => onUpdateStock(p.id, Math.max(0, qty - 1))}
                        className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded shadow-xs text-xs"
                        title="Restar 1"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => onUpdateStock(p.id, qty + 1)}
                        className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-700 font-bold rounded shadow-xs text-xs"
                        title="Sumar 1"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => onAddBulkStock(p.id, 10)}
                        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded shadow-xs text-xs"
                        title="Sumar lote de 10"
                      >
                        +10
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Ingreso de Mercadería */}
      <AnimatePresence>
        {isIncomeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ArrowDownToLine className="w-5 h-5 text-teal-600" />
                  Ingreso de Mercadería
                </h3>
                <button
                  onClick={() => setIsIncomeModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleIncomeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Artículo a recibir
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock actual: {stockData[p.id] ?? 0})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Cantidad a sumar
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={incomeAmount}
                    onChange={(e) => setIncomeAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 font-bold text-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsIncomeModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    Confirmar Ingreso
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
