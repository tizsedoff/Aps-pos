import { Product, Side, User } from './types';

export const USERS: User[] = [
  { id: 'U-001', name: 'Juan Pérez', role: 'cajero' },
  { id: 'U-002', name: 'Ana López', role: 'cajero' },
  { id: 'U-003', name: 'ADMIN', role: 'admin' },
];

export const PRODUCTS: Product[] = [
  { id: 'PROD-001', name: 'Salchicha Alemana', price: 4500, category: 'Plato', requiresSide: true },
  { id: 'PROD-002', name: 'Hamburguesa Casera', price: 5500, category: 'Plato', requiresSide: true },
  { id: 'PROD-003', name: 'Milanesa de Ternera', price: 6500, category: 'Plato', requiresSide: true },
  { id: 'PROD-004', name: 'Pechuga a la Plancha', price: 5000, category: 'Plato', requiresSide: true },
  { id: 'PROD-005', name: 'Agua Mineral 500ml', price: 1500, category: 'Bebida' },
  { id: 'PROD-006', name: 'Gaseosa Cola 500ml', price: 2000, category: 'Bebida' },
  { id: 'PROD-007', name: 'Cerveza Artesanal', price: 3500, category: 'Bebida' },
  { id: 'PROD-008', name: 'Flan Casero', price: 2500, category: 'Postre' },
];

export const SIDES: Side[] = [
  { id: 'SIDE-001', name: 'Papas Fritas' },
  { id: 'SIDE-002', name: 'Puré de Papas' },
  { id: 'SIDE-003', name: 'Ensalada Mixta' },
  { id: 'SIDE-004', name: 'Sin guarnición' },
];

export const generateInitialStock = () => {
  const stock: Record<string, number> = {};
  PRODUCTS.forEach(p => {
    // Generate some random stock between 5 and 100
    stock[p.id] = Math.floor(Math.random() * 95) + 5;
  });
  return stock;
};
