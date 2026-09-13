import { Product, Side, User, Ticket, SalesBox, DispatchStation, GeneralClosure } from './types';

export const USERS: User[] = [];

export const INITIAL_DISPATCH_STATIONS: DispatchStation[] = [
  { id: 'disp-1', name: 'Barra Principal', description: 'Bebidas, tragos y gaseosas' },
  { id: 'disp-2', name: 'Cocina y Minutas', description: 'Hamburguesas, minutas y platos calientes' },
  { id: 'disp-3', name: 'Parrilla y Buffet', description: 'Choripanes, asado y buffet' }
];

export const INITIAL_SALES_BOXES: SalesBox[] = [
  { id: 'box-1', name: 'CAJA-01', description: 'Entrada Principal' },
  { id: 'box-2', name: 'CAJA-02', description: 'Mostrador Central' },
  { id: 'box-3', name: 'CAJA-03', description: 'Sector VIP' },
  { id: 'box-4', name: 'CAJA-04', description: 'Puesto Lateral' }
];

export const INITIAL_SIDES: Side[] = [
  { id: 'side-1', name: 'Papas Fritas Clásicas', price: 0 },
  { id: 'side-2', name: 'Ensalada Mixta', price: 0 },
  { id: 'side-3', name: 'Puré de Papas Criollo', price: 300 }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Hamburguesa Doble Cheddar con Bacon',
    category: 'Minutas',
    price: 5200,
    requiresSide: false,
    dispatchStationName: 'Cocina y Minutas',
    dispatchStationId: 'disp-2'
  },
  {
    id: 'prod-2',
    name: 'Milanesa Napolitana al Plato',
    category: 'Plato',
    price: 6800,
    requiresSide: true,
    allowedSideIds: ['side-1', 'side-2', 'side-3'],
    dispatchStationName: 'Cocina y Minutas',
    dispatchStationId: 'disp-2'
  },
  {
    id: 'prod-3',
    name: 'Choripán Especial Criollo',
    category: 'Minutas',
    price: 3900,
    requiresSide: false,
    dispatchStationName: 'Parrilla y Buffet',
    dispatchStationId: 'disp-3'
  },
  {
    id: 'prod-4',
    name: 'Papas Fritas con Cheddar y Verdeo',
    category: 'Minutas',
    price: 3200,
    requiresSide: false,
    dispatchStationName: 'Cocina y Minutas',
    dispatchStationId: 'disp-2'
  },
  {
    id: 'prod-5',
    name: 'Cerveza Tirada Artesanal IPA 500ml',
    category: 'Bebida',
    price: 3200,
    requiresSide: false,
    dispatchStationName: 'Barra Principal',
    dispatchStationId: 'disp-1'
  },
  {
    id: 'prod-6',
    name: 'Fernet Branca con Cola',
    category: 'Bebida',
    price: 3800,
    requiresSide: false,
    dispatchStationName: 'Barra Principal',
    dispatchStationId: 'disp-1'
  },
  {
    id: 'prod-7',
    name: 'Gaseosa Línea Cola 500ml',
    category: 'Bebida',
    price: 1800,
    requiresSide: false,
    dispatchStationName: 'Barra Principal',
    dispatchStationId: 'disp-1'
  },
  {
    id: 'prod-8',
    name: 'Agua Mineral sin Gas 500ml',
    category: 'Bebida',
    price: 1500,
    requiresSide: false,
    dispatchStationName: 'Barra Principal',
    dispatchStationId: 'disp-1'
  }
];

export const INITIAL_STOCK: Record<string, number> = {
  'prod-1': 45,
  'prod-2': 30,
  'prod-3': 50,
  'prod-4': 60,
  'prod-5': 120,
  'prod-6': 95,
  'prod-7': 80,
  'prod-8': 70
};

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'TKT-1041',
    items: [
      {
        id: 'item-1041-1',
        product: INITIAL_PRODUCTS[0],
        quantity: 2
      },
      {
        id: 'item-1041-2',
        product: INITIAL_PRODUCTS[3],
        quantity: 1
      }
    ],
    total: 13600,
    status: 'pending',
    createdAt: new Date(Date.now() - 15 * 60000),
    cashierName: 'Martín Cajero',
    boxId: 'CAJA-01',
    caeStatus: 'approved',
    targetStation: 'Cocina y Minutas',
    targetStationId: 'disp-2'
  },
  {
    id: 'TKT-1042',
    items: [
      {
        id: 'item-1042-1',
        product: INITIAL_PRODUCTS[4],
        quantity: 2
      },
      {
        id: 'item-1042-2',
        product: INITIAL_PRODUCTS[5],
        quantity: 1
      }
    ],
    total: 10200,
    status: 'pending',
    createdAt: new Date(Date.now() - 10 * 60000),
    cashierName: 'Lucía Ventas',
    boxId: 'CAJA-02',
    caeStatus: 'approved',
    targetStation: 'Barra Principal',
    targetStationId: 'disp-1'
  },
  {
    id: 'TKT-1043',
    items: [
      {
        id: 'item-1043-1',
        product: INITIAL_PRODUCTS[2],
        quantity: 2
      }
    ],
    total: 7800,
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60000),
    cashierName: 'Martín Cajero',
    boxId: 'CAJA-01',
    caeStatus: 'approved',
    targetStation: 'Parrilla y Buffet',
    targetStationId: 'disp-3'
  }
];

export const INITIAL_GENERAL_CLOSURES: GeneralClosure[] = [
  {
    id: 'CG-20260910-001',
    closedAt: new Date(Date.now() - 48 * 3600000),
    dateString: '10/09/2026',
    totalSales: 245000,
    ticketsCount: 42,
    deliveredTicketsCount: 42,
    pendingTicketsCount: 0,
    adminName: 'Administrador General',
    breakdownByBox: {
      'CAJA-01': 130000,
      'CAJA-02': 115000
    },
    breakdownByStation: {
      'Cocina y Minutas': 140000,
      'Barra Principal': 105000
    },
    notes: 'Cierre general de jornada - Festival Apertura'
  },
  {
    id: 'CG-20260911-002',
    closedAt: new Date(Date.now() - 24 * 3600000),
    dateString: '11/09/2026',
    totalSales: 312500,
    ticketsCount: 58,
    deliveredTicketsCount: 58,
    pendingTicketsCount: 0,
    adminName: 'Administrador General',
    breakdownByBox: {
      'CAJA-01': 162500,
      'CAJA-02': 150000
    },
    breakdownByStation: {
      'Cocina y Minutas': 175000,
      'Barra Principal': 137500
    },
    notes: 'Cierre general completo sin discrepancias'
  }
];

