import React from 'react';
import { PRODUCTS } from '../data';
import { PackageSearch, Plus } from 'lucide-react';

export function Articulos() {
  return (
    <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <PackageSearch className="w-6 h-6 text-indigo-600" />
          Gestión de Artículos
        </h2>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo Artículo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-600 uppercase tracking-wider text-sm">ID</th>
              <th className="p-4 font-semibold text-slate-600 uppercase tracking-wider text-sm">Nombre</th>
              <th className="p-4 font-semibold text-slate-600 uppercase tracking-wider text-sm">Categoría</th>
              <th className="p-4 font-semibold text-slate-600 uppercase tracking-wider text-sm">Guarnición</th>
              <th className="p-4 font-semibold text-slate-600 uppercase tracking-wider text-sm text-right">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PRODUCTS.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-mono text-sm text-slate-500">{p.id}</td>
                <td className="p-4 font-bold text-slate-800">{p.name}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                    {p.category}
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-sm">
                  {p.requiresSide ? 'Sí (Requerida)' : 'No aplica'}
                </td>
                <td className="p-4 font-bold text-slate-800 text-right">
                  ${p.price.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
