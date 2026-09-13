import { Product, DispatchStation, CartItem } from '../types';

/**
 * Determina el puesto de entrega de un artículo.
 * Si el producto ya tiene configurada una zona de entrega, se respeta esa configuración.
 * Si no la tiene, se asigna por defecto según la categoría (Comida/Plato/Minutas -> Cocina, Bebida -> Barra).
 */
export function resolveProductStation(
  product: Product,
  availableStations: DispatchStation[] = []
): { id?: string; name: string } {
  // 1. Si el producto ya tiene asignada una estación explícita
  if (product.dispatchStationName) {
    const found = availableStations.find(
      s => s.name.toLowerCase() === product.dispatchStationName?.toLowerCase() || s.id === product.dispatchStationId
    );
    return {
      id: found?.id || product.dispatchStationId,
      name: found?.name || product.dispatchStationName
    };
  }

  // 2. Si hay estaciones disponibles, buscar la más adecuada por categoría
  if (availableStations.length > 0) {
    if (product.category === 'Bebida') {
      const barra = availableStations.find(s => s.name.toLowerCase().includes('barra')) || availableStations[0];
      return { id: barra.id, name: barra.name };
    }

    if (product.category === 'Plato' || product.category === 'Minutas' || product.category === 'Postre') {
      const cocina = availableStations.find(s => s.name.toLowerCase().includes('cocina')) 
        || availableStations.find(s => !s.name.toLowerCase().includes('barra'))
        || availableStations[0];
      return { id: cocina.id, name: cocina.name };
    }

    return { id: availableStations[0].id, name: availableStations[0].name };
  }

  // 3. Fallback genérico si no hay lista cargada
  if (product.category === 'Bebida') {
    return { id: 'disp-1', name: 'Barra Principal' };
  }
  return { id: 'disp-2', name: 'Cocina y Minutas' };
}

/**
 * Agrupa los artículos de una venta según su puesto de entrega asignado.
 */
export function groupCartByStation(
  cart: CartItem[],
  availableStations: DispatchStation[] = []
): Map<string, { stationId?: string; stationName: string; items: CartItem[]; subtotal: number }> {
  const stationMap = new Map<string, { stationId?: string; stationName: string; items: CartItem[]; subtotal: number }>();

  cart.forEach(item => {
    const station = resolveProductStation(item.product, availableStations);
    const existing = stationMap.get(station.name);
    const itemPrice = item.product.price + (item.side?.price || 0);
    const itemTotal = itemPrice * item.quantity;

    if (existing) {
      existing.items.push(item);
      existing.subtotal += itemTotal;
    } else {
      stationMap.set(station.name, {
        stationId: station.id,
        stationName: station.name,
        items: [item],
        subtotal: itemTotal
      });
    }
  });

  return stationMap;
}
