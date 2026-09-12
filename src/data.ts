import { Product, Side, User, Ticket } from './types';

export const USERS: User[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const SIDES: Side[] = [
  { id: 'SIDE-001', name: 'Papas Fritas' },
  { id: 'SIDE-002', name: 'Puré de Papas' },
  { id: 'SIDE-003', name: 'Ensalada Mixta' },
  { id: 'SIDE-004', name: 'Sin guarnición' },
];

export const INITIAL_STOCK: Record<string, number> = {};

export const INITIAL_TICKETS: Ticket[] = [];
