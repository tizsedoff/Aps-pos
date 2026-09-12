export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Plato' | 'Bebida' | 'Postre';
  requiresSide?: boolean;
}

export interface Side {
  id: string;
  name: string;
}

export interface CartItem {
  id: string; // Unique ID for the cart line item
  product: Product;
  side?: Side;
  quantity: number;
}

export interface Ticket {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
}

export type ViewScreen = 'ventas' | 'articulos' | 'stock';

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'cajero';
}

