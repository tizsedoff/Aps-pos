export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Plato' | 'Bebida' | 'Postre' | 'Minutas';
  requiresSide?: boolean;
  allowedSideIds?: string[];
  dispatchStationId?: string;
  dispatchStationName?: string;
  volumeUnit?: 'ml' | 'L';
  volumeAmount?: number;
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
  targetStation?: string;
  targetStationId?: string;
  orderGroupId?: string;
}

export type ViewScreen = 'ventas' | 'entregas' | 'articulos' | 'stock' | 'metricas' | 'cierre' | 'terminales';

export interface SalesBox {
  id: string;
  name: string;
  description?: string;
}

export interface DispatchStation {
  id: string;
  name: string;
  description?: string;
}

export type UserRole = 'admin' | 'cajero' | 'despacho';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  boxId?: string;
}

export interface GeneralClosure {
  id: string;
  closedAt: Date;
  dateString: string;
  totalSales: number;
  ticketsCount: number;
  deliveredTicketsCount: number;
  pendingTicketsCount: number;
  adminName: string;
  breakdownByBox: Record<string, number>;
  breakdownByStation: Record<string, number>;
  notes?: string;
}
