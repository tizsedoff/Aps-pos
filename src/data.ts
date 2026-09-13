import { Product, Side, User, Ticket, SalesBox, DispatchStation } from './types';

export const USERS: User[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_SIDES: Side[] = [];

export const INITIAL_STOCK: Record<string, number> = {};

export const INITIAL_TICKETS: Ticket[] = [];

export const INITIAL_SALES_BOXES: SalesBox[] = [
  { id: 'box-1', name: 'CAJA-01', description: 'Entrada Principal' },
  { id: 'box-2', name: 'CAJA-02', description: 'Mostrador Central' },
  { id: 'box-3', name: 'CAJA-03', description: 'Sector VIP' },
  { id: 'box-4', name: 'CAJA-04', description: 'Puesto Lateral' }
];

export const INITIAL_DISPATCH_STATIONS: DispatchStation[] = [
  { id: 'disp-1', name: 'Barra Principal', description: 'Bebidas y tragos' },
  { id: 'disp-2', name: 'Cocina y Minutas', description: 'Platos calientes' },
  { id: 'disp-3', name: 'Parrilla y Buffet', description: 'Entregas rápidas' }
];

