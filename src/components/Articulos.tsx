import React, { useState } from 'react';
import { Product, Side, DispatchStation } from '../types';
import { PackageSearch, Plus, Trash2, Edit3, X, UtensilsCrossed, Check, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { resolveProductStation } from '../utils/stationRouting';

interface ArticulosProps {
  products: Product[];
  sides: Side[];
  dispatchStations?: DispatchStation[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddSide: (side: Side) => void;
  onUpdateSide: (side: Side) => void;
  onDeleteSide: (sideId: string) => void;
}

export function Articulos({
  products,
  sides,
  dispatchStations,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddSide,
  onUpdateSide,
  onDeleteSide,
}: ArticulosProps) {
  // Pestaña activa: 'articulos' o 'guarniciones'
  const [activeTab, setActiveTab] = useState<'articulos' | 'guarniciones'>('articulos');

  const availableStations: DispatchStation[] = dispatchStations && dispatchStations.length > 0 
    ? dispatchStations 
    : [
        { id: 'disp-1', name: 'Barra Principal', description: 'Bebidas y tragos' },
        { id: 'disp-2', name: 'Cocina y Minutas', description: 'Platos calientes' },
        { id: 'disp-3', name: 'Parrilla y Buffet', description: 'Entregas rápidas' }
      ];

  // Estado Modal de Producto (Crear o Editar)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState<number | ''>('');
  const [prodCategory, setProdCategory] = useState<'Plato' | 'Bebida' | 'Postre' | 'Minutas'>('Plato');
  const [prodDispatchStation, setProdDispatchStation] = useState<string>('');
  const [prodRequiresSide, setProdRequiresSide] = useState(false);
  const [prodAllowedSideIds, setProdAllowedSideIds] = useState<string[]>([]);
  const [prodVolumeUnit, setProdVolumeUnit] = useState<'ml' | 'L' | ''>('');
  const [prodVolumeAmount, setProdVolumeAmount] = useState<number | ''>('');

  // Estado Modal de Guarnición
  const [isSideModalOpen, setIsSideModalOpen] = useState(false);
  const [editingSide, setEditingSide] = useState<Side | null>(null);
  const [sideName, setSideName] = useState('');
  const [sidePrice, setSidePrice] = useState<number | ''>('');

  // Sugerir puesto de entrega por categoría
  const suggestStationForCategory = (cat: 'Plato' | 'Bebida' | 'Postre' | 'Minutas'): string => {
    if (cat === 'Bebida') {
      const barra = availableStations.find(s => s.name.toLowerCase().includes('barra'));
      return barra?.name || availableStations[0]?.name || 'Barra Principal';
    }
    const cocina = availableStations.find(s => s.name.toLowerCase().includes('cocina')) 
      || availableStations.find(s => !s.name.toLowerCase().includes('barra'));
    return cocina?.name || availableStations[1]?.name || availableStations[0]?.name || 'Cocina y Minutas';
  };

  // Abrir modal de producto para crear
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdPrice('');
    setProdCategory('Plato');
    setProdDispatchStation(suggestStationForCategory('Plato'));
    setProdRequiresSide(false);
    setProdAllowedSideIds([]);
    setProdVolumeUnit('');
    setProdVolumeAmount('');
    setIsProductModalOpen(true);
  };

  // Abrir modal de producto para editar
  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdPrice(product.price);
    setProdCategory(product.category);
    const currentStation = product.dispatchStationName || resolveProductStation(product, availableStations).name;
    setProdDispatchStation(currentStation);
    setProdRequiresSide(Boolean(product.requiresSide));
    setProdAllowedSideIds(product.allowedSideIds ? [...product.allowedSideIds] : []);
    setProdVolumeUnit(product.volumeUnit || '');
    setProdVolumeAmount(product.volumeAmount || '');
    setIsProductModalOpen(true);
  };

  // Guardar Producto (Nuevo o Editado)
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice || Number(prodPrice) <= 0) return;

    const matchedStation = availableStations.find(s => s.name === prodDispatchStation);
    const stationId = matchedStation?.id || undefined;
    const stationName = prodDispatchStation.trim() || suggestStationForCategory(prodCategory);

    const isBebida = prodCategory === 'Bebida';
    const volumeUnitVal = (isBebida && prodVolumeUnit) ? prodVolumeUnit : undefined;
    const volumeAmountVal = (isBebida && prodVolumeAmount) ? Number(prodVolumeAmount) : undefined;

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: prodName.trim(),
        price: Number(prodPrice),
        category: prodCategory,
        dispatchStationId: stationId,
        dispatchStationName: stationName,
        requiresSide: prodCategory === 'Plato' ? prodRequiresSide : false,
        allowedSideIds: (prodCategory === 'Plato' && prodRequiresSide) ? prodAllowedSideIds : undefined,
        volumeUnit: volumeUnitVal as any,
        volumeAmount: volumeAmountVal,
      };
      onUpdateProduct(updated);
    } else {
      const newProd: Product = {
        id: `PROD-${Math.floor(100 + Math.random() * 900)}`,
        name: prodName.trim(),
        price: Number(prodPrice),
        category: prodCategory,
        dispatchStationId: stationId,
        dispatchStationName: stationName,
        requiresSide: prodCategory === 'Plato' ? prodRequiresSide : false,
        allowedSideIds: (prodCategory === 'Plato' && prodRequiresSide) ? prodAllowedSideIds : undefined,
        volumeUnit: volumeUnitVal as any,
        volumeAmount: volumeAmountVal,
      };
      onAddProduct(newProd);
    }

    setIsProductModalOpen(false);
  };

  // Alternar selección de una guarnición permitida para el producto
  const toggleSideAllowed = (sideId: string) => {
    setProdAllowedSideIds(prev =>
      prev.includes(sideId) ? prev.filter(id => id !== sideId) : [...prev, sideId]
    );
  };

  // Abrir modal de guarnición para crear
  const openNewSideModal = () => {
    setEditingSide(null);
    setSideName('');
    setSidePrice(0);
    setIsSideModalOpen(true);
  };

  // Abrir modal de guarnición para editar
  const openEditSideModal = (side: Side) => {
    setEditingSide(side);
    setSideName(side.name);
    setSidePrice(side.price ?? 0);
    setIsSideModalOpen(true);
  };

  // Guardar Guarnición (Nueva o Editada)
  const handleSideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sideName.trim()) return;

    const priceVal = sidePrice === '' ? 0 : Number(sidePrice);

    if (editingSide) {
      onUpdateSide({
        ...editingSide,
        name: sideName.trim(),
        price: Math.max(0, priceVal),
      });
    } else {
      const newSide: Side = {
        id: `SIDE-${Math.floor(100 + Math.random() * 900)}`,
        name: sideName.trim(),
        price: Math.max(0, priceVal),
      };
      onAddSide(newSide);
    }

    setIsSideModalOpen(false);
  };

  return (
    <div className="h-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      {/* Header con Pestañas */}
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <PackageSearch className="w-6 h-6 text-indigo-600" />
              Catálogo y Guarniciones
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de artículos, precios y configuración de guarniciones permitidas para cada plato.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Selector de Pestaña */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-xl">
            <button
              onClick={() => setActiveTab('articulos')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'articulos'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Artículos</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-mono">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('guarniciones')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'guarniciones'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Guarniciones</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-mono">
                {sides.length}
              </span>
            </button>
          </div>

          {/* Botón de Acción Principal según solapa */}
          {activeTab === 'articulos' ? (
            <button
              onClick={openNewProductModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              + Nuevo Artículo
            </button>
          ) : (
            <button
              onClick={openNewSideModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              + Nueva Guarnición
            </button>
          )}
        </div>
      </div>

      {/* CONTENIDO SOLAPA 1: ARTÍCULOS */}
      {activeTab === 'articulos' && (
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">Artículo</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Zona de Entrega</th>
                <th className="p-4">Guarniciones Permitidas</th>
                <th className="p-4 text-right">Precio Venta</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <PackageSearch className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-base text-slate-700">El catálogo de artículos está vacío</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                      No hay productos precargados. Puede comenzar a cargar los artículos, platos y bebidas de su evento.
                    </p>
                    <button
                      onClick={openNewProductModal}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      + Crear Primer Artículo
                    </button>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const targetStation = p.dispatchStationName || resolveProductStation(p, availableStations).name;
                  const isCocina = targetStation.toLowerCase().includes('cocina');
                  const isBarra = targetStation.toLowerCase().includes('barra');
                  const isParrilla = targetStation.toLowerCase().includes('parrilla');

                  // Calcular texto de guarniciones permitidas
                  let sidesBadge;
                  if (!p.requiresSide) {
                    sidesBadge = <span className="text-slate-400 text-xs">No aplica</span>;
                  } else if (p.allowedSideIds && p.allowedSideIds.length > 0) {
                    const allowedSides = sides.filter(s => p.allowedSideIds?.includes(s.id));
                    sidesBadge = (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {allowedSides.length > 0 ? (
                          allowedSides.map(s => (
                            <span
                              key={s.id}
                              className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md border border-indigo-100"
                            >
                              {s.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-amber-600 text-xs font-semibold">
                            ⚠️ Guarniciones eliminadas
                          </span>
                        )}
                      </div>
                    );
                  } else {
                    sidesBadge = (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Cualquiera disponible ({sides.length})
                      </span>
                    );
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-400">{p.id}</td>
                      <td className="p-4 font-bold text-slate-800">
                        {p.name}
                        {p.category === 'Bebida' && p.volumeUnit && p.volumeAmount && (
                          <span className="ml-2 inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-sm">
                            {p.volumeAmount}{p.volumeUnit}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            p.category === 'Plato'
                              ? 'bg-amber-100 text-amber-800'
                              : p.category === 'Bebida'
                              ? 'bg-blue-100 text-blue-800'
                              : p.category === 'Minutas'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {p.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            isCocina 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : isBarra 
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : isParrilla
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span>{targetStation}</span>
                        </span>
                      </td>
                      <td className="p-4">{sidesBadge}</td>
                      <td className="p-4 font-bold text-slate-800 text-right text-base">
                        ${p.price.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditProductModal(p)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar artículo y guarniciones"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar artículo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CONTENIDO SOLAPA 2: GUARNICIONES */}
      {activeTab === 'guarniciones' && (
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">Guarnición</th>
                <th className="p-4">Precio / Recargo Adicional</th>
                <th className="p-4">Platos que la Ofrecen</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {sides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <UtensilsCrossed className="w-7 h-7" />
                    </div>
                    <p className="font-bold text-base text-slate-700">No hay guarniciones registradas</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
                      Cree guarniciones (ej: Papas Fritas, Chucrut, Ensalada) y asócielas a los platos de su menú.
                    </p>
                    <button
                      onClick={openNewSideModal}
                      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      + Crear Primera Guarnición
                    </button>
                  </td>
                </tr>
              ) : (
                sides.map((side) => {
                  // Platos que utilizan esta guarnición
                  const associatedProducts = products.filter(
                    p => p.requiresSide && (!p.allowedSideIds || p.allowedSideIds.length === 0 || p.allowedSideIds.includes(side.id))
                  );

                  return (
                    <tr key={side.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-400">{side.id}</td>
                      <td className="p-4 font-bold text-slate-800 text-base">{side.name}</td>
                      <td className="p-4">
                        {side.price > 0 ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-bold text-xs bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                            + ${side.price.toLocaleString()} (Adicional)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                            Incluida ($0)
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-600">
                        {associatedProducts.length > 0 ? (
                          <span className="text-slate-700 font-medium">
                            {associatedProducts.map(p => p.name).join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sin platos asignados</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditSideModal(side)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar guarnición y precio"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteSide(side.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar guarnición"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: CREAR / EDITAR ARTÍCULO */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <PackageSearch className="w-5 h-5 text-indigo-600" />
                  {editingProduct ? 'Editar Artículo' : 'Crear Nuevo Artículo'}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4 overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Nombre del Artículo / Plato
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Salchicha con Guarnición"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Categoría
                    </label>
                    <select
                      value={prodCategory}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setProdCategory(val);
                        if (val !== 'Plato') setProdRequiresSide(false);
                        // Sugerir automáticamente la zona según categoría
                        setProdDispatchStation(suggestStationForCategory(val));
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
                      placeholder="Ej: 4500"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 font-bold text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Selector de Zona de Entrega / Despacho Destino */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      Zona de Entrega / Despacho Destino *
                    </span>
                    <span className="text-[11px] text-indigo-600 font-bold">
                      {availableStations.length} puestos disponibles
                    </span>
                  </label>
                  <select
                    value={prodDispatchStation}
                    onChange={(e) => setProdDispatchStation(e.target.value)}
                    className="w-full bg-white border-2 border-indigo-200 text-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
                  >
                    {availableStations.map(st => (
                      <option key={st.id} value={st.name}>
                        {st.name} {st.description ? `— ${st.description}` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Al cobrarse este artículo, el comprobante se enviará a este puesto de entrega (ej: Comida a Cocina, Bebidas a Barra).
                  </p>
                </div>

                {prodCategory === 'Bebida' && (
                  <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Volumen de Bebida (Opcional)
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <select
                          value={prodVolumeUnit}
                          onChange={(e) => setProdVolumeUnit(e.target.value as 'ml' | 'L' | '')}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="">Sin especificar</option>
                          <option value="ml">Mililitros (ml)</option>
                          <option value="L">Litros (L)</option>
                        </select>
                      </div>
                      
                      {prodVolumeUnit && (
                        <div className="flex-1">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            placeholder={prodVolumeUnit === 'ml' ? 'Ej: 500' : 'Ej: 1.5'}
                            value={prodVolumeAmount}
                            onChange={(e) => setProdVolumeAmount(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {prodCategory === 'Plato' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-slate-700 block">¿Requiere Guarnición?</span>
                        <span className="text-xs text-slate-400">Exigirá al cajero seleccionar guarnición al vender</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={prodRequiresSide}
                        onChange={(e) => setProdRequiresSide(e.target.checked)}
                        className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                      />
                    </div>

                    {/* Selector de Guarniciones permitidas para este plato */}
                    {prodRequiresSide && (
                      <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 uppercase">
                            Guarniciones Habilitadas para este plato
                          </label>
                          {sides.length > 0 && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setProdAllowedSideIds(sides.map(s => s.id))}
                                className="text-[11px] text-indigo-600 hover:underline font-bold"
                              >
                                Todas
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => setProdAllowedSideIds([])}
                                className="text-[11px] text-slate-500 hover:underline font-bold"
                              >
                                Limpiar
                              </button>
                            </div>
                          )}
                        </div>

                        {sides.length === 0 ? (
                          <div className="text-xs text-slate-500 p-2 bg-white rounded-lg border border-slate-200 text-center">
                            No hay guarniciones cargadas. Puede darlas de alta en la pestaña de <strong>Guarniciones</strong>.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto p-1">
                            {sides.map((side) => {
                              const isSelected = prodAllowedSideIds.includes(side.id);
                              return (
                                <button
                                  key={side.id}
                                  type="button"
                                  onClick={() => toggleSideAllowed(side.id)}
                                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium border transition-colors ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                                        isSelected ? 'bg-white text-indigo-600 border-white' : 'border-slate-300 bg-slate-50'
                                      }`}
                                    >
                                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <span>{side.name}</span>
                                  </div>
                                  <span
                                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {side.price > 0 ? `+ $${side.price.toLocaleString()}` : 'Sin cargo'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 italic">
                          * Si no marca ninguna guarnición, en la caja se permitirán todas las opciones activas.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    {editingProduct ? 'Actualizar Artículo' : 'Guardar Artículo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CREAR / EDITAR GUARNICIÓN */}
      <AnimatePresence>
        {isSideModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200"
            >
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-indigo-600" />
                  {editingSide ? 'Editar Guarnición' : 'Nueva Guarnición'}
                </h3>
                <button
                  onClick={() => setIsSideModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSideSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Nombre de la Guarnición
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Papas Fritas, Chucrut, Puré"
                    value={sideName}
                    onChange={(e) => setSideName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 font-medium text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Precio Adicional / Recargo ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    placeholder="0"
                    value={sidePrice}
                    onChange={(e) => setSidePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 font-bold text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Coloque <strong>0</strong> si la guarnición está incluida con el plato sin costo extra, o ingrese el monto adicional a cobrar.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSideModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
                  >
                    {editingSide ? 'Actualizar Guarnición' : 'Guardar Guarnición'}
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
