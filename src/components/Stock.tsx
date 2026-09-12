import React, { useMemo } from 'react';
import { PRODUCTS, generateInitialStock } from '../data';
import { Archive, ArrowDownToLine, ArrowUpToLine } from 'lucide-react';

export function Stock() {
  const stockData = useMemo(() => generateInitialStock(), []);

  return (
    <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Archive className="w-6 h-6 text-teal-600" />
          Control de Stock
        </h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-semibold transition-colors">
            <ArrowDownToLine className="w-5 h-5" />
            Ingreso
          </button>
          <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg font-semibold transition-colors">
            <ArrowUpToLine className="w-5 h-5" />
            Ajuste
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 font-semibold text-slate-600 uppercase tracking-wider text-sm">ID</th>
              <th className="p-4 font-semibold text-slate-600 uppercase tracking-wider text-sm">Nombre del Artículo</th>
              <th className="p-4 font-semibold text-slate-600 uppercase tracking-wider text-sm">Categoría</th>
              <th className="p-4 font-semibold text-slate-600 uppercase tracking-wider text-sm">Cant. Disponible</th>
              <th className="p-4 font-semibold text-slate-600 uppercase tracking-wider text-sm">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PRODUCTS.map((p) => {
              const qty = stockData[p.id] || 0;
              const isLow = qty < 20;

              return (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono text-sm text-slate-500">{p.id}</td>
                  <td className="p-4 font-bold text-slate-800">{p.name}</td>
                  <td className="p-4 text-slate-500">{p.category}</td>
                  <td className="p-4 font-bold text-lg text-slate-700">
                    {qty}
                  </td>
                  <td className="p-4">
                    {isLow ? (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold flex items-center gap-1.5 w-max">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        Stock Bajo
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-1.5 w-max">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Óptimo
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
