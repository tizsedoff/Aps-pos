export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Plato' | 'Bebida' | 'Postre' | 'Minutas';
  requiresSide?: boolean;
  allowedSideIds?: string[];
}

export interface Side {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  product: Product;
  side?: Side;
  quantity: number;
}

export interface Ticket {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'delivered';
  createdAt: Date;
  deliveredAt?: Date;
  cashierName: string;
  boxId: string;
  caeStatus: 'processing' | 'approved';
}

export type ViewScreen = 'ventas' | 'entregas' | 'articulos' | 'stock' | 'metricas' | 'cierre';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'cajero';
}
