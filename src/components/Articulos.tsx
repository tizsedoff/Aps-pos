import React, { useState } from 'react';
import { Product } from '../types';
import { PackageSearch, Plus, Trash2, Edit3, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ArticulosProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export function Articulos({ products, onAddProduct, onDeleteProduct }: ArticulosProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(3000);
  const [category, setCategory] = useState<'Plato' | 'Bebida' | 'Postre' | 'Minutas'>('Plato');
  const [requiresSide, setRequiresSide] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;

    const newProd: Product = {
      id: `PROD-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      price: Number(price),
      category,
      requiresSide: category === 'Plato' ? requiresSide : false,
    };

    onAddProduct(newProd);
    setName('');
    setPrice(3000);
    setCategory('Plato');
    setRequiresSide(true);
    setIsModalOpen(false);
  };

  return (
    <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PackageSearch className="w-6 h-6 text-indigo-600" />
            Catálogo de Artículos
          </h2>
          <p className="text-xs text-slate-500 mt-1">Configuración de platos, bebidas, precios y opciones de guarnición del evento.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          + Nuevo Artículo
        </button>
      </div>

      {/* Tabla de Artículos */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">ID</th>
              <th className="p-4">Nombre del Artículo</th>
              <th className="p-4">Categoría</th>
              <th className="p-4">Guarnición Requerida</th>
              <th className="p-4 text-right">Precio de Venta</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-mono text-xs text-slate-400">{p.id}</td>
                <td className="p-4 font-bold text-slate-800">{p.name}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    p.category === 'Plato' ? 'bg-amber-100 text-amber-800' :
                    p.category === 'Bebida' ? 'bg-blue-100 text-blue-800' :
                    p.category === 'Minutas' ? 'bg-orange-100 text-orange-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {p.category}
                  </span>
                </td>
                <td className="p-4 text-slate-600">
                  {p.requiresSide ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                      ✓ Obligatoria (Papas, etc.)
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">No aplica</span>
                  )}
                </td>
                <td className="p-4 font-bold text-slate-800 text-right text-base">
                  ${p.price.toLocaleString()}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => onDeleteProduct(p.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar artículo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear Nuevo Artículo */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <PackageSearch className="w-5 h-5 text-indigo-600" />
                  Crear Nuevo Artículo
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Nombre del Artículo / Plato
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Bondiola al Disco"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Categoría
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setCategory(val);
                        if (val !== 'Plato') setRequiresSide(false);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Plato">Plato</option>
                      <option value="Minutas">Minutas</option>
                      <option value="Bebida">Bebida</option>
                      <option value="Postre">Postre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Precio de Venta ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      step="100"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 font-bold text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {category === 'Plato' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-slate-700 block">¿Requiere Guarnición?</span>
                      <span className="text-xs text-slate-400">Exigirá elegir papas, ensalada, etc. en la venta</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={requiresSide}
                      onChange={(e) => setRequiresSide(e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                    />
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    Guardar Artículo
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
