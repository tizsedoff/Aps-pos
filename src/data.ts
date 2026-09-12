import { Product, Side, User, Ticket } from './types';

export const USERS: User[] = [
  { id: 'U-001', name: 'Juan Pérez (Caja 1)', role: 'cajero' },
  { id: 'U-002', name: 'Ana López (Caja 2)', role: 'cajero' },
  { id: 'U-003', name: 'ADMIN', role: 'admin' },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'PROD-001', name: 'Salchicha Alemana', price: 4500, category: 'Plato', requiresSide: true },
  { id: 'PROD-002', name: 'Hamburguesa Casera', price: 5500, category: 'Plato', requiresSide: true },
  { id: 'PROD-003', name: 'Milanesa de Ternera', price: 6500, category: 'Plato', requiresSide: true },
  { id: 'PROD-004', name: 'Pechuga a la Plancha', price: 5000, category: 'Plato', requiresSide: true },
  { id: 'PROD-005', name: 'Choripán Criollo', price: 4000, category: 'Minutas', requiresSide: false },
  { id: 'PROD-006', name: 'Empanada de Carne', price: 1500, category: 'Minutas', requiresSide: false },
  { id: 'PROD-007', name: 'Porción de Papas Fritas', price: 3000, category: 'Minutas', requiresSide: false },
  { id: 'PROD-008', name: 'Agua Mineral 500ml', price: 1500, category: 'Bebida', requiresSide: false },
  { id: 'PROD-009', name: 'Gaseosa Cola 500ml', price: 2000, category: 'Bebida', requiresSide: false },
  { id: 'PROD-010', name: 'Chopp Cerveza Artesanal', price: 3500, category: 'Bebida', requiresSide: false },
  { id: 'PROD-011', name: 'Vaso Fernet Tradicional', price: 4800, category: 'Bebida', requiresSide: false },
  { id: 'PROD-012', name: 'Flan Casero con Crema', price: 2500, category: 'Postre', requiresSide: false },
];

export const SIDES: Side[] = [
  { id: 'SIDE-001', name: 'Papas Fritas' },
  { id: 'SIDE-002', name: 'Puré de Papas' },
  { id: 'SIDE-003', name: 'Ensalada Mixta' },
  { id: 'SIDE-004', name: 'Chucrut' },
  { id: 'SIDE-005', name: 'Sin guarnición' },
];

export const INITIAL_STOCK: Record<string, number> = {
  'PROD-001': 48,
  'PROD-002': 32,
  'PROD-003': 18, // Bajo
  'PROD-004': 25,
  'PROD-005': 60,
  'PROD-006': 120,
  'PROD-007': 40,
  'PROD-008': 85,
  'PROD-009': 74,
  'PROD-010': 150,
  'PROD-011': 65,
  'PROD-012': 14, // Bajo
};

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TKT-1021',
    items: [
      { id: 'item-1', product: INITIAL_PRODUCTS[0], side: SIDES[0], quantity: 2 },
      { id: 'item-2', product: INITIAL_PRODUCTS[9], quantity: 2 }
    ],
    total: 16000,
    status: 'delivered',
    createdAt: new Date(Date.now() - 42 * 60 * 1000),
    deliveredAt: new Date(Date.now() - 36 * 60 * 1000),
    cashierName: 'Juan Pérez',
    boxId: 'CAJA-01',
    caeStatus: 'approved'
  },
  {
    id: 'TKT-1022',
    items: [
      { id: 'item-3', product: INITIAL_PRODUCTS[1], side: SIDES[0], quantity: 1 },
      { id: 'item-4', product: INITIAL_PRODUCTS[8], quantity: 1 }
    ],
    total: 7500,
    status: 'delivered',
    createdAt: new Date(Date.now() - 28 * 60 * 1000),
    deliveredAt: new Date(Date.now() - 22 * 60 * 1000),
    cashierName: 'Ana López',
    boxId: 'CAJA-02',
    caeStatus: 'approved'
  },
  {
    id: 'TKT-1023',
    items: [
      { id: 'item-5', product: INITIAL_PRODUCTS[4], quantity: 3 },
      { id: 'item-6', product: INITIAL_PRODUCTS[9], quantity: 3 }
    ],
    total: 22500,
    status: 'pending',
    createdAt: new Date(Date.now() - 8 * 60 * 1000),
    cashierName: 'Juan Pérez',
    boxId: 'CAJA-01',
    caeStatus: 'approved'
  },
  {
    id: 'TKT-1024',
    items: [
      { id: 'item-7', product: INITIAL_PRODUCTS[2], side: SIDES[1], quantity: 2 },
      { id: 'item-8', product: INITIAL_PRODUCTS[7], quantity: 2 }
    ],
    total: 16000,
    status: 'pending',
    createdAt: new Date(Date.now() - 3 * 60 * 1000),
    cashierName: 'ADMIN',
    boxId: 'CAJA-03',
    caeStatus: 'approved'
  }
];
